import { test } from 'node:test';
import assert from 'node:assert/strict';
import { countTag, managerClasses, managerName, managerPose, managerStates } from '../src/manager/scene';
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
  const merge = art('merge');
  /* When */
  const poses = (svg: string, kind: 'bug' | 'issue' | 'merge') =>
    managerStates(kind).filter((p) => svg.includes(`patch-mgr-for-${p}`));
  /* Then */
  assert.deepEqual(poses(bug, 'bug'), ['calm', 'unread', 'urgent']);
  assert.deepEqual(poses(issue, 'issue'), ['calm', 'unread']);
  assert.deepEqual(poses(merge, 'merge'), ['idle', 'moving', 'needsYou', 'remote']);
});

test('an idle Merge manager draws its idle pose with no tag', () => {
  /* Given */
  const scene = { kind: 'merge', state: 'idle', count: 0 } as const;
  /* When */
  const classes = managerClasses(scene);
  /* Then */
  assert.deepEqual(classes, ['patch-mgr-scene', 'patch-mgr-k-merge', 'patch-mgr-s-idle']);
});

test('a moving Merge manager shows a busy lane in its pose, not its count', () => {
  /* Given */
  const scene = { kind: 'merge', state: 'moving' } as const;
  /* When */
  const classes = managerClasses(scene);
  /* Then */
  assert.deepEqual(classes, ['patch-mgr-scene', 'patch-mgr-k-merge', 'patch-mgr-s-moving']);
  assert.equal(managerName(scene), 'Merge manager');
});

test('a Merge manager that needs you counts in peach', () => {
  /* Given */
  const scene = { kind: 'merge', state: 'needsYou', count: 2 } as const;
  /* When */
  const classes = managerClasses(scene);
  /* Then */
  assert.deepEqual(classes, ['patch-mgr-scene', 'patch-mgr-k-merge', 'patch-mgr-s-needsYou', 'patch-mgr-counted', 'patch-mgr-hot']);
  assert.deepEqual(countTag(scene), { shown: true, text: '2', hot: true });
});

test('a Merge manager on the radio keeps its peach count', () => {
  /* Given */
  const scene = { kind: 'merge', state: 'remote', count: 1 } as const;
  /* When */
  const classes = managerClasses(scene);
  /* Then */
  assert.deepEqual(classes, ['patch-mgr-scene', 'patch-mgr-k-merge', 'patch-mgr-s-remote', 'patch-mgr-counted', 'patch-mgr-hot']);
});

test('the Merge manager\'s accessible name says how many need you', () => {
  /* Given */
  const one = { kind: 'merge', state: 'needsYou', count: 1 } as const;
  const three = { kind: 'merge', state: 'remote', count: 3, label: 'Merging' } as const;
  /* When */
  const names = [managerName(one), managerName(three)];
  /* Then */
  assert.deepEqual(names, ['Merge manager, 1 needs you', 'Merging, 3 need you']);
});

test('the signaller waves its flag only while a lane moves, and raises it only when it needs you', () => {
  /* Given */
  const svg = art('merge');
  /* When */
  const partOf = (marker: string) => {
    const at = svg.indexOf(marker);
    const opener = svg.lastIndexOf('patch-mgr-for-', at);
    return svg.slice(opener, svg.indexOf('"', opener)).replace('patch-mgr-for-', '');
  };
  /* Then */
  assert.equal(partOf('patch-mgr-wave'), 'moving');
  assert.equal(partOf('patch-mgr-f-flag-ask'), 'needsYou');
  assert.equal(partOf('patch-mgr-f-radio'), 'remote');
});

test('the art takes every colour from a class, never a literal', () => {
  /* Given */
  const svgs = [art('bug'), art('issue'), art('merge')];
  /* When */
  const literals = svgs.flatMap((svg) => svg.match(/(fill|stroke)="(?!none)[^"]*"/g) ?? []);
  /* Then */
  assert.deepEqual(literals, []);
});
