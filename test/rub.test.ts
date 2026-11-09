import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RUB_QUIET_MS, RUB_SLEEPY_MS, RubDetector, type PointerSample, type RubState } from '../src/rub.ts';

/** A rub: back and forth `legs` times, `width` px wide, one leg every `legMs` ms, from `start`. */
function rub(legs: number, { width = 20, legMs = 120, start = 0 } = {}): PointerSample[] {
  const samples: PointerSample[] = [{ x: 100, y: 50, t: start }];
  for (let leg = 1; leg <= legs; leg++) {
    samples.push({ x: leg % 2 === 1 ? 100 + width : 100, y: 50, t: start + leg * legMs });
  }
  return samples;
}

function feed(detector: RubDetector, samples: PointerSample[]): RubState {
  let state: RubState = 'none';
  for (const sample of samples) state = detector.push(sample);
  return state;
}

test('a quick back and forth over Patch pets it', () => {
  /* Given */
  const detector = new RubDetector();

  /* When */
  const state = feed(detector, rub(4));

  /* Then */
  assert.equal(state, 'petted');
});

test('a pointer passing across Patch in one direction does not pet it', () => {
  /* Given */
  const detector = new RubDetector();
  const pass = Array.from({ length: 20 }, (_, i) => ({ x: i * 10, y: 50, t: i * 16 }));

  /* When */
  const state = feed(detector, pass);

  /* Then */
  assert.equal(state, 'none');
});

test('a trembling hand, legs of a pixel or two, does not pet Patch', () => {
  /* Given */
  const detector = new RubDetector();

  /* When */
  const state = feed(detector, rub(12, { width: 2, legMs: 40 }));

  /* Then */
  assert.equal(state, 'none');
});

test('turns spread too far apart are not a rub', () => {
  /* Given */
  const detector = new RubDetector();

  /* When */
  const state = feed(detector, rub(6, { legMs: 550 }));

  /* Then */
  assert.equal(state, 'none');
});

test('rubbing on and on makes Patch sleepy', () => {
  /* Given */
  const detector = new RubDetector();
  const legs = Math.ceil((RUB_SLEEPY_MS + 1000) / 120);

  /* When */
  const state = feed(detector, rub(legs));

  /* Then */
  assert.equal(state, 'sleepy');
});

test('stopping for a moment lets Patch open its eyes again', () => {
  /* Given */
  const detector = new RubDetector();
  const samples = rub(4);
  feed(detector, samples);
  const lastTurn = samples[samples.length - 1]!.t;

  /* When */
  const justAfter = detector.stateAt(lastTurn + RUB_QUIET_MS - 50);
  const later = detector.stateAt(lastTurn + RUB_QUIET_MS);

  /* Then */
  assert.equal(justAfter, 'petted');
  assert.equal(later, 'none');
});

test('after a pause a new rub starts over as petted, not sleepy', () => {
  /* Given */
  const detector = new RubDetector();
  feed(detector, rub(Math.ceil((RUB_SLEEPY_MS + 1000) / 120)));

  /* When */
  const state = feed(detector, rub(4, { start: 10_000 }));

  /* Then */
  assert.equal(state, 'petted');
});

test('reset forgets a rub in progress', () => {
  /* Given */
  const detector = new RubDetector();
  feed(detector, rub(2));

  /* When */
  detector.reset();
  const state = feed(detector, rub(2, { start: 300 }));

  /* Then */
  assert.equal(state, 'none');
});
