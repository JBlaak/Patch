/**
 * Picking Patch up and letting go.
 *
 * While held, Patch trails the pointer on a stiff spring, so it lags a touch
 * behind the hand, and the leash stretches: the further it is pulled the less
 * it follows, so it can be tugged about but never carried off. It tilts with
 * the direction it is moving and stretches with speed. Let go, it springs home
 * on a looser spring that overshoots and wobbles before it settles.
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
}

export interface DragHooks {
  onGrab?: () => void;
  onDrop?: (fling: Fling) => void;
}

interface SpringConfig { stiffness: number; damping: number }
interface Spring { value: number; velocity: number }

/** Held: stiff enough to keep up, soft enough to read as being carried. */
const FOLLOW: SpringConfig = { stiffness: 700, damping: 38 };
/** Let go: underdamped, so the way home overshoots and wobbles. */
const RETURN: SpringConfig = { stiffness: 170, damping: 9 };
const TILT: SpringConfig = { stiffness: 260, damping: 14 };

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

const reducedMotion = (): boolean =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export function makeDraggable(root: HTMLElement, hooks: DragHooks) {
  const x: Spring = { value: 0, velocity: 0 };
  const y: Spring = { value: 0, velocity: 0 };
  const tilt: Spring = { value: 0, velocity: 0 };
  const stretch: Spring = { value: 0, velocity: 0 };

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

  /** Pointer velocity over the last few samples, in px per ms; zero once the hand stops. */
  function velocity(now: number): { vx: number; vy: number } {
    const recent = samples.filter(s => now - s.t <= VELOCITY_WINDOW_MS);
    if (recent.length < 2) return { vx: 0, vy: 0 };
    const a = recent[0];
    const b = recent[recent.length - 1];
    const dt = Math.max(1, b.t - a.t);
    return { vx: (b.x - a.x) / dt, vy: (b.y - a.y) / dt };
  }

  function step(spring: Spring, target: number, config: SpringConfig, dt: number): void {
    const force = -config.stiffness * (spring.value - target) - config.damping * spring.velocity;
    spring.velocity += force * dt;
    spring.value += spring.velocity * dt;
  }

  function atRest(): boolean {
    return [x, y, tilt, stretch].every(s => Math.abs(s.value) < 0.05 && Math.abs(s.velocity) < 0.05);
  }

  function paint(): void {
    const el = current();
    if (!el) return;
    if (!held && atRest()) {
      el.style.transform = '';
      return;
    }
    const s = stretch.value;
    el.style.transform =
      `translate(${x.value.toFixed(2)}px, ${y.value.toFixed(2)}px) rotate(${tilt.value.toFixed(2)}deg) ` +
      `scale(${(1 - s * 0.5).toFixed(3)}, ${(1 + s).toFixed(3)})`;
  }

  function tick(now: number): void {
    const dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;
    const still = reducedMotion();
    const { vx, vy } = held && !still ? velocity(performance.now()) : { vx: 0, vy: 0 };
    const config = held ? FOLLOW : RETURN;
    step(x, held ? targetX : 0, config, dt);
    step(y, held ? targetY : 0, config, dt);
    step(tilt, Math.max(-MAX_TILT, Math.min(MAX_TILT, vx * TILT_PER_SPEED)), TILT, dt);
    step(stretch, Math.min(Math.hypot(vx, vy) * 0.12, MAX_STRETCH), TILT, dt);
    paint();
    frame = held || !atRest() ? requestAnimationFrame(tick) : 0;
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
    if (reducedMotion()) {
      for (const s of [x, y, tilt, stretch]) { s.value = 0; s.velocity = 0; }
      paint();
    } else {
      run();
    }
    if (dropped) hooks.onDrop?.({ distance: Math.hypot(x.value, y.value), speed: Math.hypot(vx, vy) });
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
