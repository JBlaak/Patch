/**
 * Petting Patch: rubbing the pointer back and forth over it without pressing.
 *
 * Patch closes its eyes, smiles and purrs; rubbed on, it gets sleepy. When the
 * rubbing stops it opens its eyes again. Only a hovering pointer pets (a mouse
 * or a trackpad), since a finger on a touch screen cannot move over Patch
 * without pressing, and pressing is a poke or a drag.
 *
 * The face goes on the root, not the scene: a host answering `onPet` with a
 * new line rebuilds the scene, and Patch should stay petted across it.
 */

import { RubDetector, type RubState } from './rub';

export type PetStage = Exclude<RubState, 'none'>;

export interface PetHooks {
  onPet?: (stage: PetStage) => void;
}

/** How often to look whether the rubbing has stopped, in ms. */
const CHECK_MS = 120;

export function makePettable(root: HTMLElement, hooks: PetHooks) {
  const rub = new RubDetector();
  let state: RubState = 'none';
  let timer: ReturnType<typeof setInterval> | 0 = 0;

  function show(next: RubState): void {
    if (next === state) return;
    state = next;
    root.classList.toggle('patch-petted', next !== 'none');
    root.classList.toggle('patch-sleepy', next === 'sleepy');
    if (next === 'none') {
      if (timer) clearInterval(timer);
      timer = 0;
      return;
    }
    // Nothing moves once the hand stops, so a timer notices the end of a rub.
    if (!timer) timer = setInterval(() => show(rub.stateAt(performance.now())), CHECK_MS);
    hooks.onPet?.(next);
  }

  /** Stop petting at once, say because Patch is pressed. */
  function stop(): void {
    rub.reset();
    show('none');
  }

  return {
    /** Wire a freshly built Patch button. */
    attach(button: HTMLElement): void {
      button.addEventListener('pointermove', (event) => {
        // A pressed pointer is a drag; a finger only moves while pressed.
        if (event.buttons !== 0 || event.pointerType === 'touch') return;
        show(rub.push({ x: event.clientX, y: event.clientY, t: event.timeStamp }));
      });
      button.addEventListener('pointerdown', stop);
    },

    destroy(): void {
      if (timer) clearInterval(timer);
      timer = 0;
    },
  };
}
