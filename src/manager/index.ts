import { managerArt } from './art';
import { countTag, managerClasses, managerLabel, managerName, type ManagerKind, type ManagerScene } from './scene';

export { managerArt } from './art';
export {
  countTag,
  managerClasses,
  managerLabel,
  managerName,
  managerPose,
  managerStates,
  INBOX_STATES,
  MANAGER_KINDS,
  MERGE_STATES,
} from './scene';
export type { CountTag, InboxState, ManagerKind, ManagerScene, ManagerState, MergeState } from './scene';

export interface ManagerOptions {
  /**
   * Called when the manager is clicked or activated from the keyboard. With
   * it, the figure is a real button; without it, it is decoration only.
   */
  onSelect?: () => void;
}

export interface ManagerHandle {
  /**
   * Draw this scene. Only what changed is touched, so a host can call it on
   * every poll without restarting the figure's animations.
   */
  show(scene: ManagerScene): void;
  /** Remove the manager's DOM and listeners. */
  destroy(): void;
}

/**
 * Mount a manager Patch (the Bug manager, the Issue manager or the Merge manager) into
 * `container`. Nothing shows until the first `show`.
 * Remember to include `@jblaak/patch/manager.css`.
 */
export function mountManager(container: HTMLElement, options: ManagerOptions = {}): ManagerHandle {
  const root = document.createElement('div');
  root.className = 'patch-manager';
  container.appendChild(root);

  const scene = document.createElement('div');
  const figure = document.createElement(options.onSelect ? 'button' : 'div');
  figure.className = 'patch-mgr-figure';
  if (figure instanceof HTMLButtonElement) {
    figure.type = 'button';
    figure.classList.add('patch-mgr-select');
  } else {
    figure.setAttribute('role', 'img');
  }
  const tag = document.createElement('span');
  tag.className = 'patch-mgr-count';
  tag.setAttribute('aria-hidden', 'true');
  const label = document.createElement('span');
  label.className = 'patch-mgr-label';
  label.setAttribute('aria-hidden', 'true');
  scene.append(figure, label);

  const onClick = () => options.onSelect?.();
  figure.addEventListener('click', onClick);

  let drawn: ManagerKind | null = null;

  return {
    show(next) {
      if (drawn !== next.kind) {
        figure.innerHTML = managerArt(next.kind);
        figure.appendChild(tag);
        drawn = next.kind;
      }
      scene.className = managerClasses(next).join(' ');
      const count = countTag(next);
      tag.textContent = count.text;
      label.textContent = managerLabel(next);
      figure.setAttribute('aria-label', managerName(next));
      if (!scene.isConnected) root.appendChild(scene);
    },
    destroy() {
      figure.removeEventListener('click', onClick);
      root.remove();
    },
  };
}
