/**
 * Picking Patch up and letting go.
 *
 * While held, Patch trails the pointer on a stiff spring, so it lags a touch
 * behind the hand, and the leash stretches: the further it is pulled the less
 * it follows, so it can be tugged about but never carried off. It tilts with
 * the direction it is moving and stretches with speed. Let go, it springs home
 * on a looser spring that overshoots and wobbles before it settles.
 *
 * Let go while the hand is still moving fast, and Patch is thrown instead
 * (see fling.ts): it flies along the way the hand went, bounces inside its
 * stage, squishes where it lands, and only then springs home. It stays inside
 * the stage the whole way, home included.
 *
 * The scene element is rebuilt on every `appear`, so nothing here holds on to
 * an element: the spring state lives in the closure and each frame paints
 * whichever button is current. That way a host answering the drop with a new
 * line does not cut the way home short.
 */

export interface Fling {
  /** How far from home Patch was let go, in px. */
  distance: number;
  /** How fast the pointer was moving when it let go, in px per ms. */
  speed: number;
  /** Whether that was fast enough to throw Patch (`THROW_SPEED`), rather than set it down. */
  thrown: boolean;
}

export interface DragHooks {
  onGrab?: () => void;
  onDrop?: (fling: Fling) => void;
}

import { clamp, flightStep, isThrow, landed, launch, MAX_FLIGHT_MS, type Body, type Bounds } from './fling';

interface SpringConfig { stiffness: number; damping: number }
interface Spring { value: number; velocity: number }

/** Held: stiff enough to keep up, soft enough to read as being carried. */
const FOLLOW: SpringConfig = { stiffness: 700, damping: 38 };
/** Let go: underdamped, so the way home overshoots and wobbles. */
const RETURN: SpringConfig = { stiffness: 170, damping: 9 };
const TILT: SpringConfig = { stiffness: 260, damping: 14 };
/** A squish springs back loosely, so it jiggles like jelly. */
const JIGGLE: SpringConfig = { stiffness: 420, damping: 11 };

/** Past this many px the leash stretches instead of following. */
const REACH = 200;
/** Movement that turns a press into a drag rather than a poke. */
const DRAG_THRESHOLD = 4;
const MAX_TILT = 38;
/** Degrees of tilt per px/ms of sideways speed. */
const TILT_PER_SPEED = 22;
const MAX_STRETCH = 0.18;
/** The window pointer speed is measured over. */
const VELOCITY_WINDOW_MS = 80;
/** Impacts slower than this, in px/s, are a touch, not worth a squish. */
const SQUISH_SPEED = 300;
/** How far an impact squashes Patch: this share per px/s of impact speed, up to MAX_SQUISH. */
const SQUISH_PER_SPEED = 1 / 6000;
const MAX_SQUISH = 0.3;
/** The press squish and the drag rotate about this height (patch.css `transform-origin`). */
const ORIGIN_Y = 0.7;

const reducedMotion = (): boolean =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * `stage` is the box a thrown Patch stays in; its bottom edge is the floor.
 * Asked for on every throw, as the host's layout may have changed since.
 */
export function makeDraggable(root: HTMLElement, hooks: DragHooks, stage: () => HTMLElement) {
  const x: Spring = { value: 0, velocity: 0 };
  const y: Spring = { value: 0, velocity: 0 };
  const tilt: Spring = { value: 0, velocity: 0 };
  const stretch: Spring = { value: 0, velocity: 0 };
  /** Squashed flat (positive) or narrow (negative) by an impact. */
  const squash: Spring = { value: 0, velocity: 0 };
  const springs = [x, y, tilt, stretch, squash];

  /** Set while Patch is in the air after a throw. */
  let flight: { body: Body; started: number } | null = null;
  /** Where Patch may be, from a throw until it is home again; null when not thrown. */
  let bounds: Bounds | null = null;

  let pointerId: number | null = null;
  let held = false;
  let startX = 0;
  let startY = 0;
  let targetX = 0;
  let targetY = 0;
  let samples: { t: number; x: number; y: number }[] = [];
  /** Set when a press became a drag, so the click that follows is not a poke. */
  let swallowClick = false;
  let frame = 0;
  let last = 0;

  const current = (): HTMLElement | null => root.querySelector<HTMLElement>('.patch-poke');

  function setHeld(on: boolean): void {
    held = on;
    root.querySelector('.patch-scene')?.classList.toggle('patch-held', on);
  }

  /** On the root, not the scene: a host answering the throw rebuilds the scene mid-flight. */
  function setFlying(on: boolean): void {
    root.classList.toggle('patch-flying', on);
  }

  /**
   * How far Patch may go from home each way and stay inside the stage. Home
   * is measured with the drag's transform off, so a tilted, stretched Patch
   * is not mistaken for a bigger one. Home always counts as inside, so a
   * stage smaller than Patch does not push it about.
   */
  function boundsFor(el: HTMLElement): Bounds {
    const transform = el.style.transform;
    el.style.transform = '';
    const home = el.getBoundingClientRect();
    el.style.transform = transform;
    const box = stage().getBoundingClientRect();
    return {
      left: Math.min(0, box.left - home.left),
      right: Math.max(0, box.right - home.right),
      top: Math.min(0, box.top - home.top),
      bottom: Math.max(0, box.bottom - home.bottom),
    };
  }

  /** A bump on landing: flat and wide off the floor or ceiling, tall and narrow off a wall. */
  function squish(side: 'floor' | 'wall' | 'ceiling', speed: number): void {
    if (speed < SQUISH_SPEED) return;
    const amount = Math.min(speed * SQUISH_PER_SPEED, MAX_SQUISH);
    squash.value = side === 'wall' ? -amount : amount;
    squash.velocity = 0;
  }

  /** Pointer velocity over the last few samples, in px per ms; zero once the hand stops. */
  function velocity(now: number): { vx: number; vy: number } {
    const recent = samples.filter(s => now - s.t <= VELOCITY_WINDOW_MS);
    if (recent.length < 2) return { vx: 0, vy: 0 };
    const a = recent[0]!;
    const b = recent[recent.length - 1]!;
    const dt = Math.max(1, b.t - a.t);
    return { vx: (b.x - a.x) / dt, vy: (b.y - a.y) / dt };
  }

  function step(spring: Spring, target: number, config: SpringConfig, dt: number): void {
    const force = -config.stiffness * (spring.value - target) - config.damping * spring.velocity;
    spring.velocity += force * dt;
    spring.value += spring.velocity * dt;
  }

  function atRest(): boolean {
    return !flight && springs.every(s => Math.abs(s.value) < 0.05 && Math.abs(s.velocity) < 0.05);
  }

  function paint(): void {
    const el = current();
    if (!el) return;
    if (!held && atRest()) {
      el.style.transform = '';
      return;
    }
    const s = stretch.value;
    const q = squash.value;
    // A squash scales about the transform origin, which would lift Patch's
    // feet off the floor it just hit; shift it down by as much to keep them on.
    const drop = q * (1 - ORIGIN_Y) * el.offsetHeight;
    el.style.transform =
      `translate(${x.value.toFixed(2)}px, ${(y.value + drop).toFixed(2)}px) rotate(${tilt.value.toFixed(2)}deg) ` +
      `scale(${((1 - s * 0.5) * (1 + q)).toFixed(3)}, ${((1 + s) * (1 - q)).toFixed(3)})`;
  }

  /** One step of a throw: fly, bounce, and once landed head home on the return spring. */
  function fly(now: number, dt: number): void {
    const body = flight!.body;
    const impact = flightStep(body, bounds!, dt);
    if (impact) squish(impact.side, impact.speed);
    x.value = body.x;
    y.value = body.y;
    // The springs carry the flight's speed on, so the way home starts smoothly.
    x.velocity = body.vx;
    y.velocity = body.vy;
    if (landed(body, bounds!) || now - flight!.started > MAX_FLIGHT_MS) {
      flight = null;
      setFlying(false);
    }
  }

  function tick(now: number): void {
    const dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;
    const still = reducedMotion();
    let { vx, vy } = held && !still ? velocity(performance.now()) : { vx: 0, vy: 0 };
    if (flight) {
      fly(now, dt);
      // Tilt and stretch with the flight as with the hand; both in px per ms.
      vx = x.velocity / 1000;
      vy = y.velocity / 1000;
    } else {
      const config = held ? FOLLOW : RETURN;
      step(x, held ? targetX : 0, config, dt);
      step(y, held ? targetY : 0, config, dt);
    }
    if (bounds && !flight) {
      // The wobble home overshoots; near a wall that would carry Patch out.
      x.value = clamp(x.value, bounds.left, bounds.right);
      y.value = clamp(y.value, bounds.top, bounds.bottom);
    }
    step(tilt, clamp(vx * TILT_PER_SPEED, -MAX_TILT, MAX_TILT), TILT, dt);
    step(stretch, Math.min(Math.hypot(vx, vy) * 0.12, MAX_STRETCH), TILT, dt);
    step(squash, 0, JIGGLE, dt);
    paint();
    const resting = !held && atRest();
    if (resting) bounds = null;
    frame = resting ? 0 : requestAnimationFrame(tick);
  }

  function run(): void {
    if (frame) return;
    last = performance.now();
    frame = requestAnimationFrame(tick);
  }

  /** Where Patch should be for a pointer this far from where it was grabbed. */
  function leash(dx: number, dy: number): void {
    const r = Math.hypot(dx, dy);
    const k = r === 0 ? 0 : (REACH * Math.tanh(r / REACH)) / r;
    targetX = dx * k;
    targetY = dy * k;
  }

  function release(dropped: boolean): void {
    if (pointerId === null) return;
    const wasHeld = held;
    const { vx, vy } = velocity(performance.now());
    pointerId = null;
    samples = [];
    if (!wasHeld) return;
    setHeld(false);
    const distance = Math.hypot(x.value, y.value);
    const speed = Math.hypot(vx, vy);
    const el = current();
    // A cancelled drag (the window lost the pointer) is set down, never thrown.
    const thrown = dropped && el !== null && isThrow(speed, reducedMotion());
    if (reducedMotion()) {
      for (const s of springs) { s.value = 0; s.velocity = 0; }
      paint();
    } else {
      if (thrown) {
        bounds = boundsFor(el);
        const v = launch(vx, vy);
        flight = {
          body: { x: clamp(x.value, bounds.left, bounds.right), y: clamp(y.value, bounds.top, bounds.bottom), ...v },
          started: performance.now(),
        };
        setFlying(true);
      }
      run();
    }
    if (dropped) hooks.onDrop?.({ distance, speed, thrown });
  }

  return {
    /** Wire a freshly built Patch button. Call before adding its click handler. */
    attach(button: HTMLElement): void {
      button.addEventListener('click', (event) => {
        if (!swallowClick) return;
        swallowClick = false;
        event.stopImmediatePropagation();
        event.preventDefault();
      });

      button.addEventListener('pointerdown', (event) => {
        if (event.button !== 0 || pointerId !== null) return;
        pointerId = event.pointerId;
        swallowClick = false;
        // Caught mid-throw: the hand has it now, wherever it is, unbounded as any drag.
        flight = null;
        bounds = null;
        setFlying(false);
        // Grab from wherever Patch is now, so catching it mid-wobble does not jump.
        startX = event.clientX - x.value;
        startY = event.clientY - y.value;
        samples = [{ t: event.timeStamp, x: event.clientX, y: event.clientY }];
        button.setPointerCapture(event.pointerId);
      });

      button.addEventListener('pointermove', (event) => {
        if (event.pointerId !== pointerId) return;
        const dx = event.clientX - startX;
        const dy = event.clientY - startY;
        if (!held) {
          if (Math.hypot(dx - x.value, dy - y.value) < DRAG_THRESHOLD) return;
          setHeld(true);
          swallowClick = true;
          hooks.onGrab?.();
        }
        samples.push({ t: event.timeStamp, x: event.clientX, y: event.clientY });
        if (samples.length > 12) samples.shift();
        leash(dx, dy);
        if (reducedMotion()) {
          x.value = targetX;
          y.value = targetY;
          paint();
        } else {
          run();
        }
      });

      button.addEventListener('pointerup', (event) => {
        if (event.pointerId === pointerId) release(true);
      });
      button.addEventListener('pointercancel', (event) => {
        if (event.pointerId === pointerId) release(false);
      });
      button.addEventListener('lostpointercapture', (event) => {
        if (event.pointerId === pointerId) release(false);
      });
    },

    destroy(): void {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    },
  };
}
