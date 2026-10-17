import '../src/patch.css';
import {
  mountPatch,
  type PatchHoliday,
  type PatchMood,
  type PatchMove,
  type PatchScene,
  type PatchSeason,
  type PatchSky,
  type PatchTime,
} from '../src/index';

const MOVES: PatchMove[] = ['wave', 'hop', 'twirl', 'peek', 'doze', 'jelly', 'love', 'stretch'];
const MOODS: PatchMood[] = ['calm', 'happy', 'worried', 'frazzled', 'tired'];
const SKIES: Array<PatchSky | 'unknown'> = ['unknown', 'clear', 'cloudy', 'rain', 'snow'];
const TIMES: PatchTime[] = ['morning', 'day', 'evening', 'night'];
const SEASONS: Array<PatchSeason | 'none'> = ['none', 'spring', 'summer', 'autumn', 'winter'];
const HOLIDAYS: Array<PatchHoliday | 'none'> = [
  'none',
  'oud-en-nieuw',
  'carnaval',
  'valentijnsdag',
  'pasen',
  'koningsdag',
  'bevrijdingsdag',
  'halloween',
  'sint-maarten',
  'sinterklaas',
  'kerst',
];

const form = document.getElementById('controls') as HTMLFormElement;
const stage = document.getElementById('stage') as HTMLElement;
const themeButton = document.getElementById('theme') as HTMLButtonElement;

function fill(name: string, options: readonly string[], selected: string): void {
  const select = form.elements.namedItem(name) as HTMLSelectElement;
  for (const value of options) select.add(new Option(value, value, false, value === selected));
}

fill('move', MOVES, 'wave');
fill('mood', MOODS, 'happy');
fill('sky', SKIES, 'clear');
fill('time', TIMES, 'day');
fill('season', SEASONS, 'none');
fill('holiday', HOLIDAYS, 'none');

// Poking replays the chosen scene with a wobble, the way a host would answer it.
const patch = mountPatch(stage, {
  onPoke: () => patch.appear({ ...scene(), move: 'jelly', line: 'Hey, that tickles!' }),
  onDrop: ({ speed }) => patch.appear(
    speed > 1.5 ? { ...scene(), move: 'twirl', line: 'Wheee!' } : { ...scene(), move: 'jelly', line: 'Boing!' },
  ),
});

function scene(): PatchScene {
  const data = new FormData(form);
  const sky = String(data.get('sky'));
  const season = String(data.get('season'));
  const holiday = String(data.get('holiday'));
  return {
    move: data.get('move') as PatchMove,
    mood: data.get('mood') as PatchMood,
    sky: sky === 'unknown' ? null : (sky as PatchSky),
    time: data.get('time') as PatchTime,
    season: season === 'none' ? null : (season as PatchSeason),
    holiday: holiday === 'none' ? null : (holiday as PatchHoliday),
    line: String(data.get('line') ?? ''),
  };
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  patch.appear(scene());
});

themeButton.addEventListener('click', () => {
  const light = document.body.classList.toggle('light');
  themeButton.textContent = light ? 'Dark background' : 'Light background';
});

patch.appear(scene());
