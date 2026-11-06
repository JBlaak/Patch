import { LIGHTS, type Light } from './light';
import { assignTints, body, memberArt, tintFor } from './member';
import { k, n } from './paint';
import { H, PLACES, STAGE, W } from './places';
import type { FamilyMember, FamilyScene } from './types';

/** At most this many members are drawn; the rest stay home. */
export const MAX_MEMBERS = 9;

function escape(text: string): string {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

/**
 * A skater on the canal ice: leaning into the glide in a red scarf, little
 * helpers skating in a line behind. The whole group crosses the ice on a loop.
 */
function skaterArt(member: FamilyMember, laneY: number, index: number, light: Light): string {
  const tint = tintFor(member);
  const w = 88;
  const s = w / 220;
  const delay = `animation-delay:${n(-index * 3.1 - 1)}s`;
  const babies = Array.from({ length: Math.min(4, member.helpers) }, (_, j) => {
    const bs = 38 / 220;
    return `<g transform="translate(${-46 - j * 34} ${n(laneY + 3)}) scale(${k(bs)}) translate(-100 -172)">` +
      `<ellipse cx="100" cy="172" rx="44" ry="7" fill="#000" opacity="0.3"/><g class="patch-fam-pb patch-fam-glide" style="animation-delay:${n(-j * 0.3)}s">` +
      body(tint, light, 'right', 'helper', (1 - light.ambient) * 0.3) +
      `<path d="M60 92 C80 80 120 80 140 92 L140 104 C120 94 80 94 60 104 Z" fill="${['#d84b4b', '#3f6fc4', '#f0cf7e', '#ecebe8'][j % 4]}"/><path d="M70 168 H130" stroke="#c4c2bd" stroke-width="6" stroke-linecap="round"/></g></g>`;
  }).join('');
  const parent = `<g transform="translate(0 ${n(laneY)}) scale(${k(s)}) translate(-100 -172)">` +
    `<ellipse cx="100" cy="172" rx="44" ry="7" fill="#000" opacity="0.3"/><g class="patch-fam-pb patch-fam-glide">` +
    `<path class="patch-fam-busy" d="M138 130 Q160 120 168 104" stroke="${tint}" stroke-width="10" stroke-linecap="round" fill="none"/>` +
    body(tint, light, 'right', 'working', (1 - light.ambient) * 0.3) +
    `<path d="M56 96 C80 84 120 84 144 96 L146 110 C120 100 80 100 54 110 Z" fill="#d84b4b"/><path d="M60 104 L50 130 H60 L68 106 Z" fill="#d84b4b"/>` +
    `<path d="M66 168 H140" stroke="#c4c2bd" stroke-width="5" stroke-linecap="round"/></g></g>`;
  const name = escape(member.name);
  const tag = `<g class="patch-fam-tag" transform="translate(0 ${n(laneY - 96)})"><rect x="-60" y="0" width="120" height="38" rx="10" fill="#212226" stroke="#ffffff" stroke-opacity="0.08"/>` +
    `<text x="0" y="16" text-anchor="middle" font-size="12" font-weight="700" fill="#ecebe8">${name}</text><text x="0" y="30" text-anchor="middle" font-size="11" fill="#8fd8bf">${escape(member.detail ?? 'Working')}</text></g>`;
  return `<g class="patch-fam-member" data-member="${escape(member.id)}" role="button" tabindex="0" aria-label="${name}: Working">` +
    `<g class="patch-fam-skate" style="${delay}">${babies}${parent}${tag}</g></g>`;
}

/**
 * The whole scene as one SVG: the place's backdrop, the members in depth
 * order, then the place's foreground and a vignette. `id` keeps gradient ids
 * unique when several scenes share a document.
 */
export function familyArt(scene: FamilyScene, id = 'pf'): string {
  const light = LIGHTS[scene.time];
  const place = PLACES[scene.place];
  const members = assignTints(scene.members.slice(0, MAX_MEMBERS));

  let skaters: FamilyMember[] = [];
  let standing = members;
  if (scene.place === 'canal') {
    skaters = members.filter((m) => m.status === 'working');
    standing = members.filter((m) => m.status !== 'working');
  }

  const spots = place.spots(standing.length);
  const placed = standing.map((m, i) => ({ m, spot: spots[i]!, i })).sort((a, b) => a.spot.y - b.spot.y);
  const memberMarkup = placed.map(({ m, spot, i }) => memberArt(m, spot, light, place.style, i)).join('');

  const gap = skaters.length > 1 ? Math.min(34, 96 / (skaters.length - 1)) : 0;
  const skaterMarkup = skaters.map((m, k) => skaterArt(m, 286 + k * gap, k, light)).join('');

  const weather = scene.weather === 'rain'
    ? Array.from({ length: 30 }, (_, i) => `<path class="patch-fam-rain" style="animation-delay:${n(-(i * 0.137) % 1.3)}s" d="M${n((i * 97) % W)} -20 l-4 14" stroke="#9cc5e8" stroke-opacity="0.4" stroke-width="1.4" stroke-linecap="round"/>`).join('')
    : scene.weather === 'snow' && scene.place !== 'sledding' && scene.place !== 'canal'
      ? Array.from({ length: 22 }, (_, i) => `<circle class="patch-fam-snow" style="animation-delay:${n(-(i * 1.7) % 12)}s" cx="${n((i * 131) % W)}" cy="-10" r="${n(1.2 + (i % 3) * 0.6)}" fill="#ecebe8" opacity="0.8"/>`).join('')
      : '';

  return `<svg class="patch-fam-svg${scene.arriving ? ' patch-fam-arriving' : ''}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" font-family="inherit" aria-hidden="false" role="group" aria-label="${escape(placeLabel(scene))}">` +
    `<defs>${STAGE.skyDefs(light, id)}</defs>` +
    place.back(light, id) +
    skaterMarkup +
    memberMarkup +
    place.front(light, id) +
    weather +
    STAGE.vignette(id) +
    `</svg>`;
}

const PLACE_WORDS: Record<FamilyScene['place'], string> = {
  campfire: 'round the campfire',
  tents: 'camping',
  pier: 'fishing off the pier',
  forest: 'in the forest',
  beach: 'at the beach',
  canal: 'skating on the canal',
  allotment: 'at the allotment',
  dunes: 'flying kites in the dunes',
  orchard: 'picking apples',
  stargazing: 'stargazing on the hill',
  tulips: 'in the tulip fields',
  sledding: 'sledding',
};

/** A short description of the scene, for screen readers. */
export function placeLabel(scene: FamilyScene): string {
  const count = Math.min(scene.members.length, MAX_MEMBERS);
  const who = count === 0 ? 'Nobody' : count === 1 ? 'One session' : `${count} sessions`;
  return `${who} ${PLACE_WORDS[scene.place]}`;
}
