/**
 * What a manager Patch shows, worked out without the DOM: which classes its
 * scene element gets, what its count tag says, and what a screen reader hears.
 */

/**
 * `bug` is the Bug manager (an explorer), `issue` the Issue manager (a
 * bookkeeper), `merge` the Merge manager (a signaller).
 */
export type ManagerKind = 'bug' | 'issue' | 'merge';

/**
 * The inbox managers' states. `calm`: nothing unread. `unread`: something to
 * look at. `urgent`: something trending or regressed; the Issue manager has no
 * urgent pose of its own and looks as it does when `unread`.
 */
export type InboxState = 'calm' | 'unread' | 'urgent';

/**
 * The Merge manager's states. `idle`: nothing landed, flag furled. `moving`:
 * a head is updating, testing or merging, green flag waving. `needsYou`: a
 * pull request needs you, peach flag raised. `remote`: a VM merges, radio to
 * its face (the host draws the badge naming the VM).
 */
export type MergeState = 'idle' | 'moving' | 'needsYou' | 'remote';

export type ManagerState = InboxState | MergeState;

interface SceneBase {
  /**
   * Unread items, or for the Merge manager the pull requests that need you.
   * The tag is hidden at 0 (or when left out).
   */
  count?: number;
  /** Shown under the figure, set as text. Defaults to the kind's name. */
  label?: string;
}

export type ManagerScene = SceneBase & (
  | { kind: 'bug' | 'issue'; state: InboxState }
  | { kind: 'merge'; state: MergeState }
);

export const MANAGER_KINDS: readonly ManagerKind[] = ['bug', 'issue', 'merge'];
export const INBOX_STATES: readonly InboxState[] = ['calm', 'unread', 'urgent'];
export const MERGE_STATES: readonly MergeState[] = ['idle', 'moving', 'needsYou', 'remote'];

const NAMES: Record<ManagerKind, string> = { bug: 'Bug manager', issue: 'Issue manager', merge: 'Merge manager' };

/** The states a kind can take. */
export function managerStates(kind: ManagerKind): readonly ManagerState[] {
  return kind === 'merge' ? MERGE_STATES : INBOX_STATES;
}

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
  /** Peach: an urgent Bug manager's count, and the Merge manager's always. */
  hot: boolean;
}

export function countTag(scene: ManagerScene): CountTag {
  const n = Math.max(0, Math.floor(scene.count ?? 0));
  return {
    shown: n > 0,
    text: n > 99 ? '99+' : String(n),
    hot: n > 0 && (scene.kind === 'merge' || (scene.kind === 'bug' && scene.state === 'urgent')),
  };
}

export function managerLabel(scene: ManagerScene): string {
  return scene.label ?? NAMES[scene.kind];
}

/** The figure's accessible name: its label and, when there is any, what its count counts. */
export function managerName(scene: ManagerScene): string {
  const tag = countTag(scene);
  if (!tag.shown) return managerLabel(scene);
  if (scene.kind === 'merge') return `${managerLabel(scene)}, ${tag.text} ${tag.text === '1' ? 'needs' : 'need'} you`;
  return `${managerLabel(scene)}, ${tag.text} unread`;
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
