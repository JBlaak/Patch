import '../src/family.css';
import { mountFamily, PATCH_PLACES, type FamilyMember, type FamilyScene, type PatchPlace } from '../src/index';
import type { PatchTime } from '../src/index';

const POOL: FamilyMember[] = [
  { id: 'switchboard', name: 'switchboard', status: 'working', helpers: 3 },
  { id: 'patch', name: 'patch', status: 'blocked', helpers: 0 },
  { id: 'blaaktasks', name: 'BlaakTasks', status: 'working', helpers: 1 },
  { id: 'nohrd', name: 'nohrd-android', status: 'ready', helpers: 0 },
  { id: 'james', name: 'james', status: 'idle', helpers: 0 },
  { id: 'tern', name: 'tern', status: 'working', helpers: 1 },
  { id: 'yab', name: 'yab', status: 'working', helpers: 2 },
  { id: 'keeping', name: 'keeping', status: 'working', helpers: 0 },
  { id: 'movelab', name: 'movelab-site', status: 'ready', helpers: 0 },
];

const params = new URLSearchParams(location.search);
const places = (params.get('place')?.split(',') as PatchPlace[] | undefined) ?? [...PATCH_PLACES];
const times = (params.get('time')?.split(',') as PatchTime[] | undefined) ?? ['day'];
const count = Number(params.get('count') ?? 5);
const weather = (params.get('weather') as FamilyScene['weather']) ?? null;
const width = Number(params.get('w') ?? 480);

const grid = document.getElementById('grid')!;
grid.style.gridTemplateColumns = `repeat(${Math.min(times.length * places.length, Number(params.get('cols') ?? 3))}, ${width}px)`;
for (const place of places) {
  for (const time of times) {
    const cell = document.createElement('figure');
    const stage = document.createElement('div');
    stage.className = 'stage';
    stage.style.width = `${width}px`;
    stage.style.height = `${Math.round(width / 2.4)}px`;
    const caption = document.createElement('figcaption');
    caption.textContent = `${place} · ${time} · ${count}`;
    cell.append(stage, caption);
    grid.append(cell);
    const family = mountFamily(stage, { onSelect: (id) => console.log('select', id) });
    family.show({ place, time, members: POOL.slice(0, count), weather, arriving: params.has('arrive') });
  }
}
