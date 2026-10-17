import { MOUTH_FLAT, MOUTH_FROWN, MOUTH_SMILE, patchArt, type Mouth } from './art';
import { makeDraggable, type Fling } from './drag';

export type { Fling } from './drag';

export type PatchMove = 'wave' | 'hop' | 'twirl' | 'peek' | 'doze' | 'jelly' | 'love' | 'stretch';
export type PatchMood = 'calm' | 'happy' | 'worried' | 'frazzled' | 'tired';
export type PatchSky = 'clear' | 'cloudy' | 'rain' | 'snow';
export type PatchTime = 'morning' | 'day' | 'evening' | 'night';
export type PatchSeason = 'spring' | 'summer' | 'autumn' | 'winter';
export type PatchHoliday =
  | 'oud-en-nieuw'
  | 'carnaval'
  | 'valentijnsdag'
  | 'pasen'
  | 'koningsdag'
  | 'bevrijdingsdag'
  | 'halloween'
  | 'sint-maarten'
  | 'sinterklaas'
  | 'kerst';

export interface PatchScene {
  move: PatchMove;
  mood: PatchMood;
  /** Speech bubble text, set via textContent (never innerHTML). */
  line: string;
  time: PatchTime;
  /** null/undefined = weather unknown → dress by time of day only. */
  sky?: PatchSky | null;
  /** null/undefined = no season → today's dressing, unchanged. */
  season?: PatchSeason | null;
  /** Wins over the season while set. */
  holiday?: PatchHoliday | null;
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
  | 'mug'
  // Seasons and holidays.
  | 'rainbow'
  | 'bunting'
  | 'lights'
  | 'fireworks'
  | 'bats'
  | 'butterfly'
  | 'leaves'
  | 'petals'
  | 'confetti'
  | 'pepernoten'
  | 'hearts'
  | 'puddle'
  | 'oliebol'
  | 'egg'
  | 'pumpkin'
  | 'klomp'
  | 'tree'
  | 'ears'
  | 'flag'
  | 'ice-cream'
  | 'lantern'
  | 'flower'
  | 'souwester'
  | 'beanie'
  | 'party-hat'
  | 'jester'
  | 'crown'
  | 'witch-hat'
  | 'mitre'
  | 'santa-hat'
  | 'blush'
  | 'orange';

interface HolidayKit {
  kit: Accessory[];
  /**
   * Kits with a sky of their own (fireworks, bunting, lights, a lantern under
   * the moon) push the sun, cloud and moon out; rain and snow still fall.
   */
  ownsSky: boolean;
}

/** A holiday's kit replaces the season's while it lasts. */
const HOLIDAYS: Record<PatchHoliday, HolidayKit> = {
  'oud-en-nieuw': { kit: ['party-hat', 'fireworks', 'confetti', 'oliebol'], ownsSky: true },
  valentijnsdag: { kit: ['hearts', 'blush'], ownsSky: false },
  carnaval: { kit: ['jester', 'confetti'], ownsSky: true },
  pasen: { kit: ['ears', 'egg'], ownsSky: false },
  koningsdag: { kit: ['crown', 'bunting', 'orange'], ownsSky: true },
  bevrijdingsdag: { kit: ['flag'], ownsSky: false },
  halloween: { kit: ['witch-hat', 'pumpkin', 'bats'], ownsSky: true },
  'sint-maarten': { kit: ['lantern', 'beanie', 'moon'], ownsSky: true },
  sinterklaas: { kit: ['mitre', 'pepernoten', 'klomp'], ownsSky: false },
  kerst: { kit: ['santa-hat', 'lights', 'tree'], ownsSky: true },
};

/** Each season's kit: what it always brings, and what each sky adds. */
const SEASONS: Record<PatchSeason, { always: Accessory[] } & Record<PatchSky, Accessory[]>> = {
  spring: { always: ['flower', 'petals'], clear: ['butterfly'], cloudy: [], rain: ['rainbow'], snow: [] },
  summer: { always: [], clear: ['shades', 'ice-cream'], cloudy: ['shades'], rain: ['puddle'], snow: ['shades'] },
  autumn: { always: ['leaves'], clear: [], cloudy: [], rain: ['souwester'], snow: ['scarf'] },
  winter: { always: ['beanie', 'scarf'], clear: ['mug'], cloudy: [], rain: [], snow: [] },
};

/** Not for the dark: sunglasses, and a butterfly out after bedtime. */
const DAYTIME_ONLY: ReadonlySet<Accessory> = new Set(['shades', 'butterfly']);

/**
 * What Patch wears, holds or has standing beside it. At the usage limit
 * (`tired`) these come off; the sky and the scenery around Patch stay.
 */
const PROPS: ReadonlySet<Accessory> = new Set<Accessory>([
  'shades', 'scarf', 'mug', 'umbrella', 'cap',
  'oliebol', 'egg', 'pumpkin', 'klomp', 'tree',
  'ears', 'flag', 'ice-cream', 'lantern', 'flower',
  'souwester', 'beanie', 'party-hat', 'jester', 'crown', 'witch-hat', 'mitre', 'santa-hat',
  'blush', 'orange',
]);

/** What Patch wears and what surrounds it, from the sky and time of day alone. */
function weatherDressing(sky: PatchSky | null | undefined, time: PatchTime): Accessory[] {
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

/**
 * What Patch wears and what surrounds it. Without a season or holiday this is
 * the weather dressing above, exactly as before seasons existed. With one, its
 * kit sets the outfit and the weather only adds the sky: no umbrella, nightcap
 * or morning mug.
 */
function accessoriesFor(scene: PatchScene): Accessory[] {
  const { sky, time, season, holiday } = scene;
  if (!season && !holiday) return weatherDressing(sky, time);

  // Only `night` is dark, as in the weather dressing: an evening is still sunny.
  const night = time === 'night';
  const kit = holiday ? HOLIDAYS[holiday] : null;
  let on: Accessory[] = [];
  if (kit) {
    on = [...kit.kit];
  } else if (season) {
    const kitFor = SEASONS[season];
    on = [...kitFor.always, ...(sky ? kitFor[sky] : [])];
    if (night) on = on.filter((a) => !DAYTIME_ONLY.has(a));
  }

  if (sky === 'rain') on.push('rain');
  if (sky === 'snow') on.push('snow');
  if (!kit?.ownsSky) {
    // An unknown sky still gets its moon at night, like the weather dressing.
    if ((sky === 'clear' || !sky) && night) on.push('moon');
    if (sky === 'clear' && !night) on.push('sun');
    if (sky === 'cloudy') on.push('cloud');
  }

  if (scene.mood === 'tired') on = on.filter((a) => !PROPS.has(a));
  return [...new Set(on)];
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
        ...accessoriesFor(scene).map((a) => `patch-has-${a}`),
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
