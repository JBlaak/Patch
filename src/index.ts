import { MOUTH_FLAT, MOUTH_FROWN, MOUTH_SMILE, patchArt, type Mouth } from './art';

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
export function mountPatch(container: HTMLElement): PatchHandle {
  const root = document.createElement('div');
  root.className = 'patch';
  container.appendChild(root);

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

      const art = document.createElement('div');
      art.className = 'patch-art';
      art.innerHTML = patchArt(mouthFor(scene.mood));

      el.append(bubble, art);
      root.replaceChildren(el);
    },
    destroy() {
      root.remove();
    },
  };
}
