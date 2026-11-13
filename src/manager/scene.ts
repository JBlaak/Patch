/**
 * What a manager Patch shows, worked out without the DOM: which classes its
 * scene element gets, what its count tag says, and what a screen reader hears.
 */

/** `bug` is the Bug manager (an explorer), `issue` the Issue manager (a bookkeeper). */
export type ManagerKind = 'bug' | 'issue';

/**
 * `calm`: nothing unread. `unread`: something to look at. `urgent`: something
 * trending or regressed; the Issue manager has no urgent pose of its own and
 * looks as it does when `unread`.
 */
export type ManagerState = 'calm' | 'unread' | 'urgent';

export interface ManagerScene {
  kind: ManagerKind;
  state: ManagerState;
  /** Unread items. The tag is hidden at 0 (or when left out). */
  count?: number;
  /** Shown under the figure, set as text. Defaults to the kind's name. */
  label?: string;
}

export const MANAGER_KINDS: readonly ManagerKind[] = ['bug', 'issue'];
export const MANAGER_STATES: readonly ManagerState[] = ['calm', 'unread', 'urgent'];

const NAMES: Record<ManagerKind, string> = { bug: 'Bug manager', issue: 'Issue manager' };

/** The pose actually drawn: an urgent Issue manager holds its ticket up like an unread one. */
export function managerPose(scene: Pick<ManagerScene, 'kind' | 'state'>): ManagerState {
  if (scene.kind === 'issue' && scene.state === 'urgent') return 'unread';
  return scene.state;
}

export interface CountTag {
  /** Whether the tag shows at all. */
  shown: boolean;
  /** What it says: the count, or `99+` past that. */
  text: string;
  /** Peach: only an urgent Bug manager's count. */
  hot: boolean;
}

export function countTag(scene: ManagerScene): CountTag {
  const n = Math.max(0, Math.floor(scene.count ?? 0));
  return {
    shown: n > 0,
    text: n > 99 ? '99+' : String(n),
    hot: n > 0 && scene.kind === 'bug' && scene.state === 'urgent',
  };
}

export function managerLabel(scene: ManagerScene): string {
  return scene.label ?? NAMES[scene.kind];
}

/** The figure's accessible name: its label and, when there is any, the unread count. */
export function managerName(scene: ManagerScene): string {
  const tag = countTag(scene);
  return tag.shown ? `${managerLabel(scene)}, ${tag.text} unread` : managerLabel(scene);
}

/** Classes on the scene element; manager.css draws each kind and pose from them. */
export function managerClasses(scene: ManagerScene): string[] {
  const tag = countTag(scene);
  return [
    'patch-mgr-scene',
    `patch-mgr-k-${scene.kind}`,
    `patch-mgr-s-${managerPose(scene)}`,
    ...(tag.shown ? ['patch-mgr-counted'] : []),
    ...(tag.hot ? ['patch-mgr-hot'] : []),
  ];
}
