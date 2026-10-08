# Patch

Patch is a small mint blob friend for empty-state screens. Each time the screen comes into view, Patch pops up with a speech bubble line and plays one move. What Patch wears follows the weather and time of day, and its face follows a mood.

Plain TypeScript and CSS. No framework, no runtime dependencies, no build step: the package ships its TypeScript source for your bundler (esbuild, Vite, …) to compile.

## Install

```json
"dependencies": {
  "@jblaak/patch": "github:JBlaak/Patch#v0.1.0"
}
```

## Use

```ts
import { mountPatch } from '@jblaak/patch';
import '@jblaak/patch/patch.css';

const patch = mountPatch(document.getElementById('empty-state')!);

patch.appear({
  move: 'wave',
  mood: 'happy',
  line: 'Hi! 2 sessions running smoothly.',
  time: 'day',
  sky: 'clear', // or null when the weather is unknown
});

// later
patch.destroy();
```

## API

```ts
type PatchMove = 'wave' | 'hop' | 'twirl' | 'peek' | 'doze' | 'jelly' | 'love' | 'stretch';
type PatchMood = 'calm' | 'happy' | 'worried' | 'frazzled' | 'tired';
type PatchSky = 'clear' | 'cloudy' | 'rain' | 'snow';
type PatchTime = 'morning' | 'day' | 'evening' | 'night';

interface PatchScene {
  move: PatchMove;
  mood: PatchMood;
  line: string;           // speech bubble text, set via textContent
  time: PatchTime;
  sky?: PatchSky | null;  // null/undefined: dress by time of day only
}

interface PatchHandle {
  appear(scene: PatchScene): void; // (re)enter with this scene; replays the move and bubble pop
  destroy(): void;                 // remove Patch's DOM
}

function mountPatch(container: HTMLElement): PatchHandle;
```

Nothing shows until the first `appear`. A move plays once per `appear`; breathing and blinking loop.

## Dressing

| Sky | Time | Patch gets |
| --- | --- | --- |
| `clear` | `night` | moon, twinkling stars, nightcap |
| `clear` | any other | turning sun, sunglasses |
| `cloudy` | any | drifting cloud |
| `rain` | any | falling drops, umbrella |
| `snow` | any | falling flakes, scarf |
| unknown | `night` | moon, twinkling stars, nightcap |
| unknown | `morning` | steaming mug |
| unknown | `day`, `evening` | nothing extra |

| Mood | Face |
| --- | --- |
| `calm` | nothing extra |
| `happy` | stronger blush |
| `worried` | brows, sweat drop, frown |
| `frazzled` | sweat drop |
| `tired` | half-closed lids, flat mouth, dimmer body |

## Theming

Every colour is a custom property with a dark default, set on `.patch`. Override them in your own stylesheet to match your theme:

| Variable | Default | Used for |
| --- | --- | --- |
| `--patch-body` | `#8fd8bf` | body, arm, z's |
| `--patch-body-tired` | `#5e9e88` | body when `tired` |
| `--patch-ink` | `#141517` | eyes, mouth, brows, sunglasses |
| `--patch-cheek` | `#eeab94` | cheeks, heart |
| `--patch-sun` | `#f0cf7e` | sun, moon, sparkles |
| `--patch-rain` | `#9cc5e8` | rain, umbrella, sweat drop |
| `--patch-scarf` | `#ee8b8b` | scarf, mug |
| `--patch-cap` | `#c8b8e8` | nightcap |
| `--patch-cloud` | `#3a3b40` | cloud |
| `--patch-snow` | `#ecebe8` | snowflakes, stars, pompom, steam |
| `--patch-pole` | `#a09e99` | umbrella pole |
| `--patch-highlight` | `rgba(255,255,255,0.35)` | body sheen, glint on the shades and mug |
| `--patch-bubble-bg` | `#212226` | speech bubble |
| `--patch-bubble-text` | `#ecebe8` | speech bubble text |
| `--patch-bubble-edge` | `rgba(255,255,255,0.07)` | speech bubble edge |
| `--patch-bubble-shadow` | `rgba(0,0,0,0.7)` | speech bubble drop shadow |
| `--patch-shadow` | `rgba(0,0,0,0.35)` | ground shadow |
| `--patch-font` | `inherit` | bubble text and z's |

```css
.light .patch {
  --patch-body: #4fae8f;
  --patch-ink: #1d1e21;
  --patch-bubble-bg: #ffffff;
  --patch-bubble-text: #1d1e21;
}
```

All classes are prefixed `patch-` and all keyframes `patch-`. With `prefers-reduced-motion: reduce`, Patch and the bubble still appear, but nothing moves.

## Preview

```sh
npm install
npm run preview    # http://127.0.0.1:5199
npm run typecheck
```

The preview has controls for move, mood, sky, time and line, an Appear button, and a light/dark background toggle.
