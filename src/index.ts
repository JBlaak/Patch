import { MOUTH_FLAT, MOUTH_FROWN, MOUTH_SMILE, patchArt, type Mouth } from './art';
import { makeDraggable, type Fling } from './drag';

export type { Fling } from './drag';

export type PatchMove = 'wave' | 'hop' | 'twirl' | 'peek' | 'doze' | 'jelly' | 'love' | 'stretch';
export type PatchMood = 'calm' | 'happy' | 'worried' | 'frazzled' | 'tired';
export type PatchSky = 'clear' | 'cloudy' | 'rain' | 'snow';
export type PatchTime = 'morning' | 'day' | 'evening' | 'night';

export interface PatchScene {
  move: PatchMove;
  mood: PatchMood;
  /** Speech bubble text, set via textContent (never innerHTML). */
  line: string;
  time: PatchTime;
  /** null/undefined = weather unknown → dress by time of day only. */
  sky?: PatchSky | null;
}

export interface PatchHandle {
  /** Show Patch (re)entering with this scene; restarts all one-shot animations. */
  appear(scene: PatchScene): void;
  /** Remove Patch's DOM. */
  destroy(): void;
}

export interface PatchOptions {
  /**
   * Called when Patch is clicked, tapped or activated from the keyboard. With
   * it, Patch is a real button; without it, Patch is decoration only.
   */
  onPoke?: () => void;
  /** Called when Patch is picked up: a press that moved rather than a click. */
  onGrab?: () => void;
  /**
   * Called when Patch is let go, as it starts springing home. Answering with
   * an `appear` is fine; the way home carries on.
   */
  onDrop?: (fling: Fling) => void;
}

type Accessory =
  | 'sun'
  | 'shades'
  | 'cloud'
  | 'rain'
  | 'umbrella'
  | 'snow'
  | 'scarf'
  | 'moon'
  | 'cap'
  | 'mug';

/** What Patch wears and what surrounds it, from the sky and time of day. */
function accessoriesFor(sky: PatchSky | null | undefined, time: PatchTime): Accessory[] {
  switch (sky) {
    case 'clear':
      return time === 'night' ? ['moon', 'cap'] : ['sun', 'shades'];
    case 'cloudy':
      return ['cloud'];
    case 'rain':
      return ['rain', 'umbrella'];
    case 'snow':
      return ['snow', 'scarf'];
    default:
      if (time === 'night') return ['moon', 'cap'];
      if (time === 'morning') return ['mug'];
      return [];
  }
}

function mouthFor(mood: PatchMood): Mouth {
  if (mood === 'tired') return MOUTH_FLAT;
  if (mood === 'worried') return MOUTH_FROWN;
  return MOUTH_SMILE;
}

/**
 * Mount Patch into `container`. Nothing shows until the first `appear`.
 * Remember to include `@jblaak/patch/patch.css`.
 */
export function mountPatch(container: HTMLElement, options: PatchOptions = {}): PatchHandle {
  const root = document.createElement('div');
  root.className = 'patch';
  container.appendChild(root);
  const interactive = !!(options.onPoke || options.onGrab || options.onDrop);
  const drag = interactive ? makeDraggable(root, options) : null;

  return {
    appear(scene) {
      // A fresh scene element every time, so every one-shot animation
      // (the move, the bubble pop) starts from its first frame again.
      const el = document.createElement('div');
      el.className = [
        'patch-scene',
        `patch-r-${scene.move}`,
        `patch-m-${scene.mood}`,
        ...accessoriesFor(scene.sky, scene.time).map((a) => `patch-has-${a}`),
      ].join(' ');

      const bubble = document.createElement('div');
      bubble.className = 'patch-bubble';
      bubble.textContent = scene.line;

      const art = document.createElement(interactive ? 'button' : 'div');
      art.className = 'patch-art';
      art.innerHTML = patchArt(mouthFor(scene.mood));
      if (drag && art instanceof HTMLButtonElement) {
        art.type = 'button';
        art.classList.add('patch-poke');
        art.setAttribute('aria-label', 'Poke Patch');
        // First, so a press that turned into a drag is not also a poke.
        drag.attach(art);
        if (options.onPoke) art.addEventListener('click', options.onPoke);
      }

      // A poke rebuilds the scene; keep keyboard focus on Patch across it.
      const focused = document.activeElement;
      const hadFocus = focused instanceof HTMLElement && root.contains(focused) && focused.classList.contains('patch-poke');
      el.append(bubble, art);
      root.replaceChildren(el);
      if (hadFocus) art.focus();
    },
    destroy() {
      drag?.destroy();
      root.remove();
    },
  };
}
