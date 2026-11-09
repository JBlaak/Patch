/**
 * Throwing Patch.
 *
 * Let go of Patch while the hand is still moving fast and it is thrown rather
 * than set down: it flies off along the way the hand was going, falls, bounces
 * off the walls of its stage and lands on the floor with a squish, before it
 * springs home as after any drop. A gentle release keeps the plain spring home.
 *
 * Plain numbers, no DOM, so the flight can be tested on its own. Positions are
 * offsets from Patch's home in px, as the drag uses; velocities are in px per
 * second, with y growing downwards.
 */

/**
 * Release speed, in px per ms, above which a drop is a throw. Dragging Patch
 * about and letting go stays under about 0.5; a flick of the wrist that means
 * "away with you" is well over 1.5.
 */
export const THROW_SPEED = 1.2;
/** A hard flick could send Patch through the stage in a frame; this is fast enough. */
export const MAX_THROW_SPEED = 4;
/** Downwards pull in px/s², a little floatier than real for a soft blob. */
export const GRAVITY = 2600;
/** Share of the speed kept on a bounce. */
export const BOUNCE = 0.42;
/** Share of the sideways speed kept each time Patch hits the floor. */
export const FLOOR_FRICTION = 0.6;
/** Bounces slower than this, in px/s, are a landing: Patch stays on the floor. */
export const SETTLE_SPEED = 220;
/** However the flight goes, Patch heads home after this long. */
export const MAX_FLIGHT_MS = 1800;

/** Where Patch may go, as offsets from home; `bottom` is the floor. */
export interface Bounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface Body {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

/** What Patch hit in a step: the floor, a wall or the ceiling, and how hard (px/s). */
export interface Impact {
  side: 'floor' | 'wall' | 'ceiling';
  speed: number;
}

/** Whether a release this fast is a throw. Reduced motion never throws. */
export function isThrow(speed: number, reducedMotion: boolean): boolean {
  return !reducedMotion && speed > THROW_SPEED;
}

/** The velocity Patch leaves the hand with, in px/s, from the pointer's in px/ms. */
export function launch(vx: number, vy: number): { vx: number; vy: number } {
  const speed = Math.hypot(vx, vy);
  const k = speed > MAX_THROW_SPEED ? MAX_THROW_SPEED / speed : 1;
  return { vx: vx * k * 1000, vy: vy * k * 1000 };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Move Patch one step of `dt` seconds under gravity, bouncing off the edges of
 * `bounds`. Patch never leaves the bounds. Returns the hardest thing it hit,
 * or null when it hit nothing.
 */
export function flightStep(body: Body, bounds: Bounds, dt: number): Impact | null {
  body.vy += GRAVITY * dt;
  body.x += body.vx * dt;
  body.y += body.vy * dt;
  let impact: Impact | null = null;
  const hit = (side: Impact['side'], speed: number): void => {
    if (!impact || speed > impact.speed) impact = { side, speed };
  };

  if (body.x < bounds.left || body.x > bounds.right) {
    body.x = clamp(body.x, bounds.left, bounds.right);
    hit('wall', Math.abs(body.vx));
    body.vx = -body.vx * BOUNCE;
  }
  if (body.y < bounds.top) {
    body.y = bounds.top;
    hit('ceiling', Math.abs(body.vy));
    body.vy = -body.vy * BOUNCE;
  }
  if (body.y >= bounds.bottom) {
    body.y = bounds.bottom;
    if (body.vy > 0) {
      hit('floor', body.vy);
      // A landing too soft to bounce stops dead, so Patch rests on the floor.
      body.vy = body.vy < SETTLE_SPEED ? 0 : -body.vy * BOUNCE;
      body.vx *= FLOOR_FRICTION;
    }
  }
  return impact;
}

/** Whether Patch has landed: on the floor and no longer bouncing. */
export function landed(body: Body, bounds: Bounds): boolean {
  return body.y >= bounds.bottom && Math.abs(body.vy) < 1;
}
