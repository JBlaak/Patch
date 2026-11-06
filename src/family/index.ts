import { familyArt } from './art';
import type { FamilyScene } from './types';

export { familyArt, placeLabel, MAX_MEMBERS } from './art';
export { PATCH_PLACES } from './types';
export type { FamilyMember, FamilyScene, FamilyStatus, PatchPlace } from './types';

export interface FamilyOptions {
  /**
   * Called with a member's id when it is clicked or activated from the
   * keyboard. Without it, members are still focusable to read their tag.
   */
  onSelect?: (id: string) => void;
}

export interface FamilyHandle {
  /** Draw this scene, replacing whatever was there. */
  show(scene: FamilyScene): void;
  /** Hold every animation still (true) or let it play again (false), e.g. while the window is in the background. */
  pause(on: boolean): void;
  /** Remove the scene's DOM and listeners. */
  destroy(): void;
}

let instances = 0;

/**
 * Mount the Patch family into `container`: a scene of one Patch per member,
 * out on an adventure somewhere. Nothing shows until the first `show`.
 * Remember to include `@jblaak/patch/family.css`.
 */
export function mountFamily(container: HTMLElement, options: FamilyOptions = {}): FamilyHandle {
  const id = `pf${++instances}`;
  const root = document.createElement('div');
  root.className = 'patch-family';
  container.appendChild(root);

  const memberOf = (target: EventTarget | null): string | null => {
    const el = target instanceof Element ? target.closest('[data-member]') : null;
    return el?.getAttribute('data-member') ?? null;
  };
  const onClick = (event: MouseEvent) => {
    const member = memberOf(event.target);
    if (member && options.onSelect) options.onSelect(member);
  };
  const onKey = (event: KeyboardEvent) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const member = memberOf(event.target);
    if (!member || !options.onSelect) return;
    event.preventDefault();
    options.onSelect(member);
  };
  root.addEventListener('click', onClick);
  root.addEventListener('keydown', onKey);
  if (options.onSelect) root.classList.add('patch-family-selectable');

  return {
    show(scene) {
      // Keep keyboard focus on the same member across a redraw.
      const focused = memberOf(document.activeElement);
      root.innerHTML = familyArt(scene, id);
      root.dataset.place = scene.place;
      root.dataset.time = scene.time;
      if (focused) {
        const again = root.querySelector<SVGElement>(`[data-member="${CSS.escape(focused)}"]`);
        again?.focus();
      }
    },
    pause(on) {
      root.classList.toggle('patch-family-paused', on);
    },
    destroy() {
      root.removeEventListener('click', onClick);
      root.removeEventListener('keydown', onKey);
      root.remove();
    },
  };
}
