/**
 * Telling a rub from a pointer passing by.
 *
 * Petting Patch is rubbing the pointer back and forth over it without
 * pressing, the way you would scratch a cat behind the ears. A pointer that
 * just crosses Patch on its way somewhere goes one way; a rub keeps turning
 * round. So this counts sideways turns: a few of them within a second, each
 * after a leg long enough not to be a trembling hand, and Patch is petted.
 * Keep it up and Patch gets sleepy; stop for a moment and it opens its eyes.
 *
 * Plain logic on pointer samples, no DOM, so it can be tested on its own.
 */

export interface PointerSample {
  x: number;
  y: number;
  /** When, in ms (an event's `timeStamp` or `performance.now()`). */
  t: number;
}

export type RubState = 'none' | 'petted' | 'sleepy';

/** A leg shorter than this is a shaky hand, not a stroke. */
export const RUB_LEG_PX = 6;
/** This many turns ... */
export const RUB_TURNS = 3;
/** ... within this window is a rub. */
export const RUB_WINDOW_MS = 1000;
/** Without a turn for this long the rub has stopped and Patch opens its eyes. */
export const RUB_QUIET_MS = 600;
/** Rubbed for this long without stopping, Patch dozes off. */
export const RUB_SLEEPY_MS = 3000;

export class RubDetector {
  /** -1 moving left, 1 moving right, 0 not yet moved far enough to tell. */
  private dir = 0;
  /** The furthest x reached in the current direction; the next turn is measured from it. */
  private extreme: number | null = null;
  /** When the recent turns happened, oldest first. */
  private turns: number[] = [];
  private lastTurn = -Infinity;
  /** When the rub became a pet, or null while it is not one. */
  private since: number | null = null;

  /** Feed the next pointer sample; returns the state after it. */
  push(sample: PointerSample): RubState {
    this.stateAt(sample.t);
    const { x, t } = sample;
    if (this.extreme === null) {
      this.extreme = x;
      return 'none';
    }
    if (this.dir === 0) {
      if (Math.abs(x - this.extreme) >= RUB_LEG_PX) {
        this.dir = Math.sign(x - this.extreme);
        this.extreme = x;
      }
    } else if ((x - this.extreme) * this.dir > 0) {
      this.extreme = x;
    } else if ((this.extreme - x) * this.dir >= RUB_LEG_PX) {
      this.dir = -this.dir;
      this.extreme = x;
      this.lastTurn = t;
      this.turns = [...this.turns.filter((turn) => t - turn <= RUB_WINDOW_MS), t];
      if (this.since === null && this.turns.length >= RUB_TURNS) this.since = t;
    }
    return this.stateAt(t);
  }

  /**
   * The state at time `t`, without a new sample: lets a timer notice that the
   * rubbing stopped. Once it has, the rub starts over from nothing.
   */
  stateAt(t: number): RubState {
    if (t - this.lastTurn >= RUB_QUIET_MS) {
      this.since = null;
      this.turns = [];
    }
    if (this.since === null) return 'none';
    return t - this.since >= RUB_SLEEPY_MS ? 'sleepy' : 'petted';
  }

  /** Forget everything, say when the pointer leaves or presses. */
  reset(): void {
    this.dir = 0;
    this.extreme = null;
    this.turns = [];
    this.lastTurn = -Infinity;
    this.since = null;
  }
}
