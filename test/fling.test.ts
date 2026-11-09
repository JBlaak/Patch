import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAX_FLIGHT_MS, THROW_SPEED, flightStep, isThrow, landed, launch, type Body, type Bounds } from '../src/fling.ts';

const STAGE: Bounds = { left: -300, right: 300, top: -200, bottom: 0 };

/** Fly until landed or out of time, recording where Patch went and what it hit. */
function flyOut(body: Body, bounds: Bounds) {
  const path: Body[] = [];
  const hits: string[] = [];
  for (let ms = 0; ms < MAX_FLIGHT_MS && !landed(body, bounds); ms += 16) {
    const impact = flightStep(body, bounds, 0.016);
    if (impact) hits.push(impact.side);
    path.push({ ...body });
  }
  return { path, hits };
}

test('a fast release throws Patch', () => {
  /* Given */
  const speed = THROW_SPEED + 0.5;

  /* When */
  const thrown = isThrow(speed, false);

  /* Then */
  assert.equal(thrown, true);
});

test('a slow release sets Patch down to spring home', () => {
  /* Given */
  const speed = THROW_SPEED - 0.4;

  /* When */
  const thrown = isThrow(speed, false);

  /* Then */
  assert.equal(thrown, false);
});

test('with reduced motion even a fast release is not a throw', () => {
  /* Given */
  const speed = THROW_SPEED * 3;

  /* When */
  const thrown = isThrow(speed, true);

  /* Then */
  assert.equal(thrown, false);
});

test('a wild flick is capped before Patch leaves the hand', () => {
  /* Given */
  const pointer = { vx: 30, vy: -40 };

  /* When */
  const v = launch(pointer.vx, pointer.vy);

  /* Then */
  assert.ok(Math.hypot(v.vx, v.vy) <= 4000 + 1e-6);
  assert.ok(v.vx > 0 && v.vy < 0, 'keeps the direction of the throw');
});

test('a throw up and to the right flies right, falls and lands on the floor', () => {
  /* Given */
  const body: Body = { x: 0, y: -50, ...launch(1.5, -1.5) };

  /* When */
  const { path, hits } = flyOut(body, STAGE);

  /* Then */
  assert.ok(Math.min(...path.map((p) => p.y)) < -50, 'rises first');
  assert.ok(body.x > 0, 'goes the way it was thrown');
  assert.equal(landed(body, STAGE), true);
  assert.ok(hits.includes('floor'));
});

test('however hard it is thrown, Patch stays inside the stage', () => {
  /* Given */
  const throws = [launch(4, -4), launch(-4, -1), launch(4, 4), launch(-3, -4), launch(0, -4)];

  /* When */
  const paths = throws.map((v) => flyOut({ x: 0, y: -10, ...v }, STAGE).path);

  /* Then */
  for (const p of paths.flat()) {
    assert.ok(p.x >= STAGE.left && p.x <= STAGE.right, `x ${p.x} inside`);
    assert.ok(p.y >= STAGE.top && p.y <= STAGE.bottom, `y ${p.y} inside`);
  }
});

test('a throw at the wall bounces off it', () => {
  /* Given */
  const body: Body = { x: 250, y: -100, vx: 3000, vy: 0 };

  /* When */
  const impact = flightStep(body, STAGE, 0.05);

  /* Then */
  assert.equal(impact?.side, 'wall');
  assert.equal(body.x, STAGE.right);
  assert.ok(body.vx < 0);
});
