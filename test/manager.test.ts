import { test } from 'node:test';
import assert from 'node:assert/strict';
import { countTag, managerClasses, managerName, managerPose } from '../src/manager/scene';
import { managerArt as art } from '../src/manager/art';

test('a calm Bug manager draws its calm pose with no tag', () => {
  /* Given */
  const scene = { kind: 'bug', state: 'calm', count: 0 } as const;
  /* When */
  const classes = managerClasses(scene);
  /* Then */
  assert.deepEqual(classes, ['patch-mgr-scene', 'patch-mgr-k-bug', 'patch-mgr-s-calm']);
});

test('an unread Bug manager shows its count, not hot', () => {
  /* Given */
  const scene = { kind: 'bug', state: 'unread', count: 3 } as const;
  /* When */
  const classes = managerClasses(scene);
  /* Then */
  assert.deepEqual(classes, ['patch-mgr-scene', 'patch-mgr-k-bug', 'patch-mgr-s-unread', 'patch-mgr-counted']);
  assert.deepEqual(countTag(scene), { shown: true, text: '3', hot: false });
});

test('an urgent Bug manager turns its count peach', () => {
  /* Given */
  const scene = { kind: 'bug', state: 'urgent', count: 5 } as const;
  /* When */
  const classes = managerClasses(scene);
  /* Then */
  assert.deepEqual(classes, ['patch-mgr-scene', 'patch-mgr-k-bug', 'patch-mgr-s-urgent', 'patch-mgr-counted', 'patch-mgr-hot']);
});

test('an urgent Issue manager looks as it does when unread, and its count is not hot', () => {
  /* Given */
  const scene = { kind: 'issue', state: 'urgent', count: 2 } as const;
  /* When */
  const classes = managerClasses(scene);
  /* Then */
  assert.equal(managerPose(scene), 'unread');
  assert.deepEqual(classes, ['patch-mgr-scene', 'patch-mgr-k-issue', 'patch-mgr-s-unread', 'patch-mgr-counted']);
});

test('the count tag hides at zero, even when the state says otherwise', () => {
  /* Given */
  const scene = { kind: 'bug', state: 'urgent', count: 0 } as const;
  /* When */
  const tag = countTag(scene);
  /* Then */
  assert.deepEqual(tag, { shown: false, text: '0', hot: false });
  assert.ok(!managerClasses(scene).includes('patch-mgr-counted'));
});

test('a count past 99 reads 99+', () => {
  /* Given */
  const scene = { kind: 'issue', state: 'unread', count: 140 } as const;
  /* When */
  const tag = countTag(scene);
  /* Then */
  assert.equal(tag.text, '99+');
});

test('the accessible name gives the label and the unread count', () => {
  /* Given */
  const unread = { kind: 'issue', state: 'unread', count: 2 } as const;
  const calm = { kind: 'bug', state: 'calm', label: 'Bugs' } as const;
  /* When */
  const names = [managerName(unread), managerName(calm)];
  /* Then */
  assert.deepEqual(names, ['Issue manager, 2 unread', 'Bugs']);
});

test('each kind draws a part for every pose it can take', () => {
  /* Given */
  const bug = art('bug');
  const issue = art('issue');
  /* When */
  const poses = (svg: string) => ['calm', 'unread', 'urgent'].filter((p) => svg.includes(`patch-mgr-for-${p}`));
  /* Then */
  assert.deepEqual(poses(bug), ['calm', 'unread', 'urgent']);
  assert.deepEqual(poses(issue), ['calm', 'unread']);
});

test('the art takes every colour from a class, never a literal', () => {
  /* Given */
  const svgs = [art('bug'), art('issue')];
  /* When */
  const literals = svgs.flatMap((svg) => svg.match(/(fill|stroke)="(?!none)[^"]*"/g) ?? []);
  /* Then */
  assert.deepEqual(literals, []);
});
