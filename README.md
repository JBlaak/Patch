# Patch

<p align="center">
  <img src="docs/patch.png" alt="Patch, a mint blob in sunglasses, waving under the sun and saying &quot;Hallo.&quot;" width="360">
</p>

Patch is my friend in my personal projects: a small mint blob that keeps me company wherever an app has a moment to spare. An empty state, a status screen, a quiet corner of a dashboard: Patch shows up, says something, and makes the app feel a little less like a tool.

Each time Patch comes into view, it pops up with a speech bubble line and plays one move. What Patch wears follows the weather and time of day, and optionally the season or a Dutch holiday; its face follows a mood.

Plain TypeScript and CSS. No framework, no runtime dependencies, no build step: the package ships its TypeScript source for your bundler (esbuild, Vite, …) to compile.

## Install

```json
"dependencies": {
  "@jblaak/patch": "github:JBlaak/Patch#v0.10.1"
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
  season: 'autumn', // optional
  holiday: null,    // optional, e.g. 'koningsdag'
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
type PatchSeason = 'spring' | 'summer' | 'autumn' | 'winter';
type PatchHoliday =
  | 'oud-en-nieuw' | 'carnaval' | 'valentijnsdag' | 'pasen' | 'koningsdag'
  | 'bevrijdingsdag' | 'halloween' | 'sint-maarten' | 'sinterklaas' | 'kerst';
type PatchHolding = 'keys' | 'padlock' | 'keys-down';

interface PatchScene {
  move: PatchMove;
  mood: PatchMood;
  line: string;                   // speech bubble text, set via textContent
  time: PatchTime;
  sky?: PatchSky | null;          // null/undefined: dress by time of day only
  season?: PatchSeason | null;    // null/undefined: no season, dress by weather as below
  holiday?: PatchHoliday | null;  // wins over the season while set
  holding?: PatchHolding | null;  // something to hold for the host; takes the hand
}

interface PatchHandle {
  appear(scene: PatchScene): void; // (re)enter with this scene; replays the move and bubble pop
  destroy(): void;                 // remove Patch's DOM
}

interface PatchOptions {
  onPoke?: () => void;              // called on click, tap or Enter/Space
  onGrab?: () => void;              // called when a press turns into a drag
  onDrop?: (fling: Fling) => void;  // called on let-go; { distance (px), speed (px/ms) }
}

function mountPatch(container: HTMLElement, options?: PatchOptions): PatchHandle;
```

With any of these, Patch is a real `<button aria-label="Poke Patch">` that squishes on hover and press; answer a poke with another `appear`, and keyboard focus stays on Patch across it.

Patch can also be dragged: it trails the pointer on a spring, the leash stretches the further it is pulled, it tilts with its direction and stretches with speed, and makes a surprised face. Let go, it springs home with an overshoot and a wobble. A press that moved is a drag, not a poke. Answering `onDrop` with an `appear` does not cut the way home short. With reduced motion Patch still follows the pointer but snaps home without the wobble. `--patch-focus` sets the focus ring colour (default: the body colour).

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

That is the dressing without a `season` or `holiday`. Patch does not work out the season or the holidays itself: the host passes them in.

### Seasons

With a `season` (and no `holiday`) the season's kit replaces the outfit above. The weather only adds its sky: drops in rain, flakes in snow, the sun in clear weather (the moon at `night`), a cloud when cloudy. There is no umbrella, nightcap or morning mug. At `night` the sunglasses and the butterfly stay home. With the sky unknown, Patch gets the season's own kit and the moon at night.

| Season | Always | `clear` | `cloudy` | `rain` | `snow` |
| --- | --- | --- | --- | --- | --- |
| `spring` | tulip, drifting petals | butterfly | | rainbow | |
| `summer` | | sunglasses, ice cream | sunglasses | puddle | sunglasses |
| `autumn` | falling leaves, leaves on the ground | | | sou'wester | scarf |
| `winter` | beanie, scarf | steaming mug | | | |

### Holidays

A `holiday` wins over the season: its kit replaces the season's. Rain and snow still fall. Some holidays bring their own sky and push the sun, cloud and moon out; the others still get the sky as with a season.

| Holiday | Patch gets | Own sky |
| --- | --- | --- |
| `oud-en-nieuw` | party hat, fireworks, confetti, oliebol | yes |
| `carnaval` | jester's hat, confetti | yes |
| `valentijnsdag` | rising hearts, extra blush | no |
| `pasen` | bunny ears, painted egg | no |
| `koningsdag` | crown, bunting, orange body | yes |
| `bevrijdingsdag` | Dutch flag | no |
| `halloween` | witch's hat, pumpkin, bats | yes |
| `sint-maarten` | lantern, beanie, moon | yes |
| `sinterklaas` | mitre, falling pepernoten, klomp with a carrot | no |
| `kerst` | Santa hat, string lights, tree | yes |

At the usage limit (`tired`) Patch holds up an empty juice carton, upside down: it is out of juice. A seasonal or holiday Patch also takes its props off: hats, ears, the flag, the lantern, the ice cream, the props on the ground and the orange body. The sky and the scenery around it (leaves, petals, confetti, hearts, bunting, lights, …) stay. Without a season or holiday, `tired` dresses as in the first table, except that the carton takes the umbrella's place in the rain.

| Mood | Face |
| --- | --- |
| `calm` | nothing extra |
| `happy` | stronger blush |
| `worried` | brows, sweat drop, frown |
| `frazzled` | sweat drop |
| `tired` | half-closed lids, flat mouth, dimmer body, empty juice carton |

### Holding

A host can hand Patch something to hold, for a moment that needs explaining: asking for a key, say, before a password manager asks for it. It takes the hand, so it wins over the umbrella, the carton, the flag, the lantern and the ice cream, and it sets where Patch looks.

| Holding | Patch | Face |
| --- | --- | --- |
| `keys` | holds a ring of two keys up and jingles it once | eyes up at the keys, mouth open, catchlights |
| `padlock` | holds a small padlock out | brows up, eyes across at the padlock |
| `keys-down` | has put the keys down on the ground | content squint |

The keys use `--patch-sun` and `--patch-cap`, the ring and the shackle `--patch-pole`, the padlock `--patch-sun` with an `--patch-ink` keyhole. With `keys`, a `wave` leaves the arm still: the keys hang from it.

## The family

Besides Patch itself, the package draws a whole family: one Patch per member, out somewhere on an adventure, each with a pose for what it is doing and up to four little helpers beside it. A host uses it to show what is running (sessions, jobs, builds) as a small living scene.

```ts
import { mountFamily } from '@jblaak/patch';
import '@jblaak/patch/family.css';

const family = mountFamily(document.getElementById('scene')!, {
  onSelect: (id) => openSession(id), // a member was clicked or activated
});

family.show({
  place: 'campfire',  // where they are
  time: 'night',      // lights the scene: morning, day, evening or night
  members: [
    { id: 'a', name: 'switchboard', status: 'working', helpers: 3 },
    { id: 'b', name: 'patch', status: 'blocked', helpers: 0 },
    { id: 'c', name: 'notes', status: 'ready', helpers: 0 },
  ],
  weather: null,      // or 'rain' / 'snow' falling over the place
  arriving: true,     // everyone walks in from the side, for a new place
});
```

```ts
type PatchPlace =
  | 'campfire' | 'tents' | 'pier' | 'forest' | 'beach' | 'canal'
  | 'allotment' | 'dunes' | 'orchard' | 'stargazing' | 'tulips' | 'sledding';
type FamilyStatus = 'working' | 'blocked' | 'ready' | 'idle';

interface FamilyMember {
  id: string;        // handed back by onSelect
  name: string;      // shown on hover; set as text, never markup
  status: FamilyStatus;
  helpers: number;   // at most four are drawn
  tint?: string;     // body colour; defaults to a distinct pastel per member
  detail?: string;   // the hover tag's second line
}
```

- **Poses.** `working` is busy at the place's task, `blocked` holds up a "!" sign, `ready` holds what it made (a mug, a fish, a carrot…), `idle` dozes.
- **Helpers** do the place's chore: roasting marshmallows, fetching logs or apples, watering sprouts, fishing, flying kites, sledding.
- **Up to nine** members are drawn, the first in front. The middle of the bottom edge is left clear, so a host can stand Patch itself there.
- **The scene** is a 12:5 stage that covers its container; give the container a size and, if you like, rounded corners. Members are focusable and show a name tag on hover and focus.
- **Light.** Skies stay near graphite at every hour, so a scene sits quietly in a dark app; in a light app, frame it as a card.

`family.pause(true)` holds the scene still (say, while the window is in the background) and `pause(false)` lets it play again. Only small things move, so a scene is cheap to keep on screen.

`familyArt(scene)` returns the same scene as an SVG string, for hosts that render it themselves. `npm run preview:family` serves `preview/family.html`, a grid of every place; add `?time=night&count=9` to try other hours and crowds.

## The managers

Three more Patches with a job. Two for a host that keeps an inbox: the **Bug manager** (lavender, an explorer in a pith helmet with a satchel) and the **Issue manager** (sun yellow, a bookkeeper with round spectacles, a green visor and a pencil behind its head), each with three states and an unread tag. And one for a host that lands pull requests: the **Merge manager** (sky blue, a signaller in a navy peaked cap with a sun band, a whistle and a flag), with four states and a tag for what needs you.

```ts
import { mountManager } from '@jblaak/patch';
import '@jblaak/patch/manager.css';

const bugs = mountManager(document.getElementById('bugs')!, {
  onSelect: () => openBugPage(), // optional; with it the figure is a button
});

// Call as often as you like: only what changed is touched.
bugs.show({ kind: 'bug', state: 'urgent', count: 5, label: 'Bug manager' });
```

| Kind | `calm` | `unread` | `urgent` |
| --- | --- | --- | --- |
| `bug` | a spider asleep in a jar | a spider dangling on its thread, the magnifying glass held up to it | a scurrying cluster of spiders, helmet slipping, worried brows |
| `issue` | a red ledger under its arm | a ticket held high over its head | as `unread` |

| Kind | `idle` | `moving` | `needsYou` | `remote` |
| --- | --- | --- | --- | --- |
| `merge` | nothing landed: the flag furled at its side | a head updating, testing or merging: the green flag waving | something needs you: the peach flag raised, smiling as it asks | a VM merges: the radio to its face (the host draws the badge naming the VM) |

- **Count.** `count` draws the unread tag in the top corner, `99+` past 99. It hides at 0, and turns peach for an urgent Bug manager. The Merge manager's count is what needs you, always peach; a busy lane shows in the pose, not a number.
- **Label.** Shown under the figure, as text; defaults to "Bug manager", "Issue manager" or "Merge manager". The accessible name is the label plus the count ("2 unread", or "2 need you" for the Merge manager).
- **Width.** `--patch-manager-width` (default `150px`) sets how wide the figure is drawn.
- **Reduced motion.** No dangling, scurrying, flailing, waving or bobbing; the poses hold still.

`managerClasses(scene)`, `countTag(scene)` and `managerName(scene)` are the pure parts, `managerStates(kind)` lists the states a kind takes (`INBOX_STATES` or `MERGE_STATES`), and `managerArt(kind)` returns the SVG. Colours are custom properties on `.patch-manager`: `--patch-bug-body`, `--patch-issue-body`, `--patch-merge-body`, the kit colours (`--patch-helmet`, `--patch-satchel`, `--patch-spider`, `--patch-visor`, `--patch-ledger`, `--patch-paper`, `--patch-cap`, `--patch-flag-go`, `--patch-flag-ask`, `--patch-radio`, …) and the tag's (`--patch-count-bg`, `--patch-count-text`, `--patch-count-hot-bg`, `--patch-count-hot-text`, `--patch-label`); see `src/manager.css` for the full list and their dark defaults. `npm run preview:managers` serves `preview/managers.html`, every kind and state; add `?theme=light` for a light host.

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
| `--patch-scarf` | `#ee8b8b` | scarf, mug, carton straw |
| `--patch-cap` | `#c8b8e8` | nightcap |
| `--patch-cloud` | `#3a3b40` | cloud |
| `--patch-snow` | `#ecebe8` | snowflakes, stars, pompom, steam |
| `--patch-pole` | `#a09e99` | umbrella pole, carton outline |
| `--patch-highlight` | `rgba(255,255,255,0.35)` | body sheen, glint on the shades and mug |
| `--patch-bubble-bg` | `#212226` | speech bubble |
| `--patch-bubble-text` | `#ecebe8` | speech bubble text |
| `--patch-bubble-edge` | `rgba(255,255,255,0.07)` | speech bubble edge |
| `--patch-bubble-shadow` | `rgba(0,0,0,0.7)` | speech bubble drop shadow |
| `--patch-shadow` | `rgba(0,0,0,0.35)` | ground shadow |
| `--patch-font` | `inherit` | bubble text and z's |
| `--patch-body-koningsdag` | `#f6a95e` | body on `koningsdag` |
| `--patch-leaf-a` | `#e8955a` | autumn leaves |
| `--patch-leaf-b` | `#d9694f` | autumn leaves |
| `--patch-leaf-c` | `#e3b94f` | autumn leaves |
| `--patch-petal` | `#f4bccb` | petals, butterfly, ice cream |
| `--patch-tulip` | `#ee7b8b` | tulip |
| `--patch-stem` | `#6fbf8f` | stems, rainbow, tree, confetti, lights |
| `--patch-orange` | `#f39a3c` | bunting, pumpkin, lantern, carrot, carton label |
| `--patch-flag-red` | `#d84b4b` | flag, bunting, jester's hat, crown, Santa hat, lights |
| `--patch-flag-blue` | `#3f6fc4` | flag, bunting, crown |
| `--patch-brown` | `#b97a45` | oliebol, pepernoten, tree trunk, lantern stick |
| `--patch-wood` | `#e9c46a` | klomp, ice cream cone |
| `--patch-mitre` | `#d64545` | mitre |
| `--patch-carton` | `#f4f3ef` | the empty juice carton when tired |

```css
.light .patch {
  --patch-body: #4fae8f;
  --patch-ink: #1d1e21;
  --patch-bubble-bg: #ffffff;
  --patch-bubble-text: #1d1e21;
}
```

All classes are prefixed `patch-` and all keyframes `patch-`. With `prefers-reduced-motion: reduce`, Patch and the bubble still appear, but nothing moves.

## Jetpack Compose

The same Patch for Android lives in `android/`, as a Compose library: the same art, moods, moves, weather dressing, poking and spring drag. Seasons, holidays, the empty carton and holding are TypeScript only for now. JitPack builds it from a tag:

```kotlin
// settings.gradle.kts
dependencyResolutionManagement {
    repositories {
        maven("https://jitpack.io") { content { includeGroup("com.github.JBlaak") } }
    }
}

// build.gradle.kts
implementation("com.github.JBlaak:Patch:v0.9.0")
```

```kotlin
val patch = rememberPatchState(
    PatchScene(move = PatchMove.Wave, mood = PatchMood.Happy, line = "Hi!", time = PatchTime.Day, sky = PatchSky.Clear),
)

Patch(
    state = patch,
    onPoke = { patch.appear(patch.scene.copy(move = PatchMove.Jelly)) },
    onGrab = null,
    onDrop = null,
)
```

`PatchColors` sets the colours (light and dark defaults follow the system theme). With animations turned off in the system settings, Patch still appears but nothing moves. The poke label is "Poke Patch", in Dutch "Por Patch".

### Avatar

`PatchAvatar(mood, Modifier.size(44.dp))` draws Patch small and square for beside a line of text, as in a chat: just the blob and its mood's face, without the bubble, the weather or the shadow. It breathes and blinks (and stands still with animations off), and isn't a button. `style` and `colors` work as on `Patch`; its content description is "Patch" (or "James").

### James

`Patch(…, style = PatchStyle.James)` draws James instead: a slightly taller lagoon blob (`#7cc6d9`) with brows and a claret bow tie, for apps where Patch should be a little more dressed up. He takes the same scenes. What differs:

- A happy James smiles with his eyes, a frazzled one wears his bow tie crooked, and a tired one leans a little.
- `Jelly` also wiggles his bow tie straight.
- He adds a hat where Patch has none: a straw boater with the sun (and the sunglasses), a bowler under clouds. In snow a mustard scarf replaces the bow tie; the morning mug is in the tie's colour.
- `PatchColors.JamesLight` and `PatchColors.JamesDark` are his tokens, with `tie`, `straw` and `hat` added. The poke label is "Poke James", in Dutch "Por James".

James is Compose only for now; the TypeScript package draws Patch alone.

```sh
cd android
./gradlew :patch:testDebugUnitTest :patch:verifyPaparazziDebug   # tests and snapshots
./gradlew :patch:cleanRecordPaparazziDebug                       # re-record snapshots
```

## Preview

```sh
npm install
npm run preview    # http://127.0.0.1:5199
npm run typecheck
npm test           # the managers' state → classes mapping
```

The preview has controls for move, mood, sky, time, season, holiday and line, an Appear button, and a light/dark background toggle.
