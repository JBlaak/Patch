import '../src/manager.css';
import { mountManager, managerStates, MANAGER_KINDS, type ManagerScene, type ManagerState } from '../src/index';

const params = new URLSearchParams(location.search);
if (params.get('theme') === 'light') document.body.classList.add('light');
const COUNTS: Partial<Record<ManagerState, number>> = { unread: 3, urgent: 5, needsYou: 2, remote: 1 };

const grid = document.getElementById('grid')!;
for (const kind of MANAGER_KINDS) {
  const row = document.createElement('div');
  row.className = 'row';
  for (const state of managerStates(kind)) {
    const cell = document.createElement('figure');
    const stage = document.createElement('div');
    const caption = document.createElement('figcaption');
    caption.textContent = `${kind} · ${state}`;
    cell.append(stage, caption);
    row.appendChild(cell);
    const scene = { kind, state, count: COUNTS[state] ?? 0 } as ManagerScene;
    mountManager(stage, { onSelect: () => console.log(kind, state) }).show(scene);
  }
  grid.appendChild(row);
}
