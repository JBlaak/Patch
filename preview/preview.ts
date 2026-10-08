import '../src/patch.css';
import { mountPatch, type PatchMood, type PatchMove, type PatchScene, type PatchSky, type PatchTime } from '../src/index';

const MOVES: PatchMove[] = ['wave', 'hop', 'twirl', 'peek', 'doze', 'jelly', 'love', 'stretch'];
const MOODS: PatchMood[] = ['calm', 'happy', 'worried', 'frazzled', 'tired'];
const SKIES: Array<PatchSky | 'unknown'> = ['unknown', 'clear', 'cloudy', 'rain', 'snow'];
const TIMES: PatchTime[] = ['morning', 'day', 'evening', 'night'];

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

// Poking replays the chosen scene with a wobble, the way a host would answer it.
const patch = mountPatch(stage, {
  onPoke: () => patch.appear({ ...scene(), move: 'jelly', line: 'Hey, that tickles!' }),
});

function scene(): PatchScene {
  const data = new FormData(form);
  const sky = String(data.get('sky'));
  return {
    move: data.get('move') as PatchMove,
    mood: data.get('mood') as PatchMood,
    sky: sky === 'unknown' ? null : (sky as PatchSky),
    time: data.get('time') as PatchTime,
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
