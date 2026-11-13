import '../src/manager.css';
import { mountManager, MANAGER_KINDS, MANAGER_STATES, type ManagerState } from '../src/index';

const params = new URLSearchParams(location.search);
if (params.get('theme') === 'light') document.body.classList.add('light');
const COUNTS: Record<ManagerState, number> = { calm: 0, unread: 3, urgent: 5 };

const grid = document.getElementById('grid')!;
for (const kind of MANAGER_KINDS) {
  const row = document.createElement('div');
  row.className = 'row';
  for (const state of MANAGER_STATES) {
    const cell = document.createElement('figure');
    const stage = document.createElement('div');
    const caption = document.createElement('figcaption');
    caption.textContent = `${kind} · ${state}`;
    cell.append(stage, caption);
    row.appendChild(cell);
    mountManager(stage, { onSelect: () => console.log(kind, state) }).show({ kind, state, count: COUNTS[state] });
  }
  grid.appendChild(row);
}
