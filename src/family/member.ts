import type { Light } from './light';
import { k, n } from './paint';
import type { FamilyMember, FamilyStatus } from './types';

/**
 * One family member drawn at its spot, with its little helpers beside it.
 *
 * A member is the Patch body from the main art, much simplified: no wardrobe,
 * just a pose for its status and lighting for the hour. Helpers are the same
 * body at baby size, busy with whatever the place gives them to do.
 */

const BODY = 'M50 138 C 46 96, 72 68, 100 68 C 132 68, 152 96, 148 138 C 146 158, 128 166, 100 166 C 70 166, 52 158, 50 138 Z';
const SIDE_LEFT = 'M82 74 C 62 84, 50 104, 52 138 C 54 156, 66 164, 82 165 C 70 140, 70 100, 82 74 Z';
const SIDE_RIGHT = 'M118 74 C 138 84, 150 104, 148 138 C 146 156, 134 164, 118 165 C 130 140, 130 100, 118 74 Z';
const RIM_LEFT = 'M78 80 C 60 92, 52 112, 54 138';
const RIM_RIGHT = 'M122 80 C 140 92, 148 112, 146 138';
const INK = '#141517';
const PEACH = '#eeab94';

/** The family's pastels, one per member, from Switchboard's status palette. */
const TINTS = ['#8fd8bf', '#9cc5e8', '#c8b8e8', '#eeab94', '#f0cf7e', '#f4bccb', '#a8d8a0', '#ee8b8b', '#b8c4f0'];

function hash(id: string): number {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return Math.abs(h);
}

/**
 * A pastel for each member: its own `tint`, or one picked from its id. Two
 * members never share a pastel while there are pastels left, so the family
 * stays easy to tell apart; the pick depends only on the ids present.
 */
export function assignTints(members: readonly FamilyMember[]): FamilyMember[] {
  const taken = new Set(members.map((m) => m.tint).filter(Boolean));
  const ordered = [...members].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const picked = new Map<string, string>();
  for (const m of ordered) {
    if (m.tint) continue;
    let i = hash(m.id) % TINTS.length;
    for (let tries = 0; tries < TINTS.length && taken.has(TINTS[i]!); tries++) i = (i + 1) % TINTS.length;
    picked.set(m.id, TINTS[i]!);
    taken.add(TINTS[i]!);
  }
  return members.map((m) => (m.tint ? m : { ...m, tint: picked.get(m.id) }));
}

export function tintFor(member: FamilyMember): string {
  return member.tint ?? TINTS[hash(member.id) % TINTS.length]!;
}

/** What helpers do at a place. */
export type HelperKind =
  | { kind: 'roast' }
  | { kind: 'fetch'; item: 'log' | 'mushroom' | 'bucket' | 'apple' | 'tulip'; back: boolean; dy?: number }
  | { kind: 'water' }
  | { kind: 'fish'; waterY: number }
  | { kind: 'kite' }
  | { kind: 'gaze' }
  | { kind: 'sled' };

export type Tool = 'none' | 'rod' | 'spade';
export type ReadyProp = 'mug' | 'basket' | 'fish' | 'carrot' | 'shades' | 'flower' | 'apples';

export interface Spot {
  /** Where the feet are. */
  x: number;
  y: number;
  /** Width of the body box (220 units of art). */
  w: number;
  /** Faces this way: towards the middle of the place. */
  facing: 'left' | 'right';
}

export interface MemberStyle {
  helper: HelperKind;
  tool: Tool;
  ready: ReadyProp;
  /** A fire lights bodies from the side that faces it, whatever the hour. */
  fire: boolean;
  /** Where helpers head to fetch, and where water lies for rods. */
  centerX: number;
}

const WORDS: Record<FamilyStatus, string> = { working: 'Working', blocked: 'Needs you', ready: 'Done', idle: 'Resting' };

function escape(text: string): string {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function arm(d: string, tint: string, cls = ''): string {
  return `<path${cls ? ` class="${cls}"` : ''} d="${d}" stroke="${tint}" stroke-width="10" stroke-linecap="round" fill="none"/>`;
}

function readyProp(prop: ReadyProp, tint: string): string {
  switch (prop) {
    case 'mug':
      return arm('M140 134 Q154 130 158 120', tint) +
        `<path d="M154 108 H178 V128 C178 132 175 134 171 134 H161 C157 134 154 132 154 128 Z" fill="#ee8b8b"/><path d="M178 114 C186 114 186 124 178 124" stroke="#ee8b8b" stroke-width="3" fill="none"/>` +
        `<path class="patch-fam-steam" d="M162 102 C158 96 166 92 162 86" stroke="#ecebe8" stroke-width="2.5" stroke-linecap="round" fill="none"/><path class="patch-fam-steam patch-fam-d2" d="M170 102 C166 96 174 92 170 86" stroke="#ecebe8" stroke-width="2.5" stroke-linecap="round" fill="none"/>`;
    case 'fish':
      return arm('M138 128 Q160 108 162 78', tint) +
        `<g class="patch-fam-flop"><path d="M162 70 C172 76 172 96 162 104 C152 96 152 76 162 70 Z" fill="#9cc5e8"/><path d="M162 104 L154 114 H170 Z" fill="#9cc5e8"/><circle cx="159" cy="80" r="1.8" fill="${INK}"/></g>`;
    case 'carrot':
      return arm('M138 128 Q160 108 162 76', tint) +
        `<path d="M152 70 H172 L162 112 Z" fill="#f39a3c"/><path d="M156 70 L150 56 M162 70 V52 M168 70 L176 56" stroke="#6fbf8f" stroke-width="4" stroke-linecap="round"/>`;
    case 'flower':
      return arm('M138 128 Q160 108 162 80', tint) +
        `<path d="M162 80 V112" stroke="#6fbf8f" stroke-width="3"/><path d="M152 64 L155 78 Q162 84 169 78 L172 64 L167 70 L162 62 L157 70 Z" fill="#ee7b8b"/>`;
    case 'apples':
    case 'basket': {
      const fill = prop === 'apples' ? '#d84b4b' : '#b97a45';
      return arm('M140 134 Q156 128 160 112', tint) +
        `<g transform="translate(150 146)"><circle cx="12" cy="-4" r="7" fill="${fill}"/><circle cx="26" cy="-6" r="7" fill="${prop === 'apples' ? '#e8955a' : '#d84b4b'}"/><path d="M0 0 H40 L35 24 H5 Z" fill="#b97a45"/><path d="M3 8 H37 M4 16 H36" stroke="#8a5a32" stroke-width="2"/></g>`;
    }
    case 'shades':
      return arm('M140 134 Q154 130 158 120', tint) +
        `<path d="M154 98 H176 L172 134 H158 Z" fill="#f39a3c" opacity="0.9"/><path d="M168 98 L180 78" stroke="#ecebe8" stroke-width="3" stroke-linecap="round"/>`;
  }
}

function tool(t: Tool, tint: string, waterY: number | null): string {
  if (t === 'rod') {
    const line = waterY === null ? 40 : waterY;
    return arm('M138 130 Q156 116 160 98', tint) +
      `<path d="M158 100 L238 44" stroke="#b97a45" stroke-width="3.5" stroke-linecap="round"/><path d="M238 44 V${n(line)}" stroke="#a09e99" stroke-width="1.2"/>` +
      `<g class="patch-fam-nibble"><circle cx="238" cy="${n(line)}" r="5" fill="#d84b4b"/><rect x="233" y="${n(line)}" width="10" height="3" fill="#ecebe8"/></g>`;
  }
  if (t === 'spade') {
    return `<g class="patch-fam-dig">${arm('M138 130 Q156 120 162 104', tint)}<path d="M162 104 L176 150" stroke="#9a7550" stroke-width="4" stroke-linecap="round"/><path d="M168 146 H186 L182 166 H172 Z" fill="#a09e99"/></g>`;
  }
  // Empty-handed work: the arm stays low in front, tinkering, so it never reads as a hand up with a question.
  return arm('M138 136 Q154 142 166 136', tint, 'patch-fam-busy');
}

/** The face and body of a Patch, lit for the hour, in art units. */
export function body(tint: string, light: Light, litSide: 'left' | 'right', status: FamilyStatus | 'helper', dimBy: number): string {
  const shadeD = litSide === 'left' ? SIDE_RIGHT : SIDE_LEFT;
  const warmD = litSide === 'left' ? SIDE_LEFT : SIDE_RIGHT;
  const rimD = litSide === 'left' ? RIM_LEFT : RIM_RIGHT;
  const baby = status === 'helper';
  let face = '';
  if (status === 'ready') {
    face = `<g stroke="${INK}" stroke-width="3" stroke-linecap="round" fill="none"><path d="M81 121 Q86 113 91 121"/><path d="M109 121 Q114 113 119 121"/><path d="M93 134 Q100 141 107 134"/></g>`;
  } else if (status === 'idle') {
    face = `<g stroke="${INK}" stroke-width="3" stroke-linecap="round" fill="none"><path d="M80 119 Q86 124 92 119"/><path d="M108 119 Q114 124 120 119"/><path d="M95 137 L105 137"/></g>`;
  } else {
    const rx = baby ? 8 : 5;
    const ry = baby ? 11 : 7;
    const lookX = litSide === 'left' ? -2 : 2;
    face = `<g class="patch-fam-blink"><ellipse cx="${86 + lookX}" cy="118" rx="${rx}" ry="${ry}" fill="${INK}"/><ellipse cx="${114 + lookX}" cy="118" rx="${rx}" ry="${ry}" fill="${INK}"/>` +
      `<circle cx="${84 + lookX}" cy="${baby ? 113 : 115}" r="${baby ? 3 : 1.6}" fill="#ffffff" opacity="0.75"/><circle cx="${112 + lookX}" cy="${baby ? 113 : 115}" r="${baby ? 3 : 1.6}" fill="#ffffff" opacity="0.75"/></g>`;
    // Needing the host is nothing to fret about: a bright, open smile while it waves.
    face += status === 'blocked'
      ? `<path d="M92 134 Q100 144 108 134" stroke="${INK}" stroke-width="3" stroke-linecap="round" fill="none"/>`
      : `<path d="${baby ? 'M92 139 Q100 146 108 139' : 'M95 136 Q100 139 105 136'}" stroke="${INK}" stroke-width="${baby ? 5 : 3}" stroke-linecap="round" fill="none"/>`;
  }
  return `<path d="${BODY}" fill="${tint}"/>` +
    `<path d="${shadeD}" fill="#06070a" opacity="${n(light.shade)}"/>` +
    `<path d="${warmD}" fill="${light.color}" opacity="${n(light.warm)}"/>` +
    `<path d="${rimD}" stroke="${light.color}" stroke-opacity="0.45" stroke-width="3" stroke-linecap="round" fill="none"/>` +
    (dimBy > 0.01 ? `<path d="${BODY}" fill="#06070a" opacity="${n(dimBy)}"/>` : '') +
    `<path d="M68 96 C74 84 86 78 96 78" stroke="#ffffff" stroke-opacity="0.25" stroke-width="5" stroke-linecap="round" fill="none"/>` +
    `<circle cx="76" cy="134" r="5" fill="${PEACH}" opacity="0.5"/><circle cx="124" cy="134" r="5" fill="${PEACH}" opacity="0.5"/>` +
    face;
}

function helperItem(item: 'log' | 'mushroom' | 'bucket' | 'apple' | 'tulip'): string {
  switch (item) {
    case 'log':
      return `<rect x="40" y="44" width="120" height="26" rx="13" fill="#7d5636"/><circle cx="146" cy="57" r="9" fill="#b97a45"/>`;
    case 'mushroom':
      return `<rect x="88" y="34" width="24" height="30" rx="6" fill="#ecebe8"/><path d="M64 40 C64 4 136 4 136 40 Z" fill="#d84b4b"/><circle cx="86" cy="22" r="6" fill="#ecebe8"/><circle cx="114" cy="28" r="5" fill="#ecebe8"/>`;
    case 'bucket':
      return `<path d="M136 96 Q160 66 184 96" stroke="#ecebe8" stroke-width="5" fill="none"/><path d="M132 96 H188 L180 146 H140 Z" fill="#ee8b8b"/><rect x="140" y="100" width="40" height="8" fill="#9cc5e8"/>`;
    case 'apple':
      return `<circle cx="100" cy="40" r="22" fill="#d84b4b"/><path d="M100 18 V8" stroke="#6b4a2f" stroke-width="4"/><path d="M102 14 C112 4 122 8 124 12 C114 18 106 16 102 14 Z" fill="#6fbf8f"/>`;
    case 'tulip':
      return `<path d="M100 60 V10" stroke="#6fbf8f" stroke-width="6"/><path d="M80 -20 L84 6 Q100 18 116 6 L120 -20 L110 -8 L100 -26 L90 -8 Z" fill="#ee7b8b"/>`;
  }
}

/** One little helper at (x, y) in scene units, facing towards `facing`. */
function helper(x: number, y: number, i: number, tint: string, light: Light, facing: 'left' | 'right', style: MemberStyle): string {
  const size = 42;
  const s = size / 220;
  const sx = facing === 'right' ? s : -s;
  const delay = `animation-delay:${n(-i * 1.4)}s`;
  const lit = style.fire ? facing : light.side === 'left' ? (facing === 'right' ? 'left' : 'right') : facing === 'right' ? 'right' : 'left';
  const dimBy = (1 - light.ambient) * (style.fire ? 0.12 : 0.35);
  const babyBody = body(tint, light, lit, 'helper', dimBy);
  const shadow = `<ellipse cx="0" cy="1" rx="${n(size * 0.22)}" ry="2" fill="#000" opacity="0.4"/>`;
  const scaled = (inner: string, cls = 'patch-fam-hop') => `<g transform="scale(${k(sx)} ${k(s)}) translate(-100 -172)"><g class="patch-fam-pb ${cls}" style="${delay}">${inner}</g></g>`;
  const h = style.helper;
  switch (h.kind) {
    case 'roast':
      return `<g transform="translate(${n(x)} ${n(y)})">${shadow}${scaled(babyBody + `<path d="M150 120 L250 60" stroke="#7d5636" stroke-width="6" stroke-linecap="round"/><rect class="patch-fam-toast" x="240" y="44" width="28" height="22" rx="9" fill="#f4f3ef" style="${delay}"/>`, 'patch-fam-rock')}</g>`;
    case 'fetch': {
      const dx = (style.centerX - x) * 0.55;
      const carry = `<g class="${h.back ? 'patch-fam-carry-back' : 'patch-fam-carry'}" style="${delay}">${helperItem(h.item)}</g>`;
      return `<g transform="translate(${n(x)} ${n(y)})"><g class="patch-fam-fetch" style="--dx:${n(dx)}px;--dy:${n(h.dy ?? 0)}px;${delay}">${shadow}${scaled(babyBody + carry)}</g></g>`;
    }
    case 'water':
      return `<g transform="translate(${n(x)} ${n(y)})">` +
        `<g transform="translate(${facing === 'right' ? 22 : -22} 0)"><g class="patch-fam-grow" style="${delay}"><path d="M0 0 V-14" stroke="#6fbf8f" stroke-width="2" stroke-linecap="round"/><path d="M0 -8 C-6 -8 -8 -13 -7 -15 C-2 -15 0 -11 0 -8 Z" fill="#6fbf8f"/><path d="M0 -11 C6 -11 8 -16 7 -18 C2 -18 0 -14 0 -11 Z" fill="#8fd8bf"/></g><ellipse cx="0" cy="1" rx="7" ry="2" fill="#3a2a1c"/></g>` +
        shadow + scaled(babyBody + `<g class="patch-fam-tilt" style="${delay}"><path d="M136 100 H182 V146 H136 Z" fill="#9cc5e8"/><path d="M182 108 L214 86" stroke="#9cc5e8" stroke-width="8" stroke-linecap="round"/></g><g fill="#9cc5e8"><circle class="patch-fam-drip" style="${delay}" cx="214" cy="104" r="5"/><circle class="patch-fam-drip patch-fam-d2" cx="206" cy="108" r="4"/></g>`, 'patch-fam-sway') + `</g>`;
    case 'fish': {
      const lineEnd = 172 + (h.waterY - y) / s;
      return `<g transform="translate(${n(x)} ${n(y)})">${shadow}${scaled(babyBody + `<path d="M150 124 L230 76" stroke="#9a7550" stroke-width="5" stroke-linecap="round"/><path d="M230 76 V${n(lineEnd)}" stroke="#a09e99" stroke-width="2"/><g class="patch-fam-nibble" style="${delay}"><circle cx="230" cy="${n(lineEnd)}" r="8" fill="#d84b4b"/></g>`, 'patch-fam-sway')}</g>`;
    }
    case 'kite': {
      const kx = facing === 'right' ? 40 + i * 14 : -40 - i * 14;
      const ky = -(150 + i * 24 + (y - 260) * 0.4);
      const colors = ['#ee8b8b', '#f0cf7e', '#9cc5e8', '#c8b8e8'];
      return `<g transform="translate(${n(x)} ${n(y)})">${shadow}` +
        `<path d="M${facing === 'right' ? 4 : -4} -16 Q ${n(kx * 0.5)} ${n(ky * 0.3)} ${n(kx)} ${n(ky + 18)}" stroke="#ecebe8" stroke-opacity="0.5" stroke-width="0.8" fill="none"/>` +
        `<g transform="translate(${n(kx)} ${n(ky)})"><g class="patch-fam-kite" style="${delay}"><path d="M0 -16 L12 0 L0 20 L-12 0 Z" fill="${colors[i % 4]}"/><path d="M0 -16 V20 M-12 0 H12" stroke="#141517" stroke-opacity="0.25" stroke-width="1"/><path d="M0 20 Q 6 30 0 38 Q -6 46 0 54" stroke="${colors[i % 4]}" stroke-width="1.5" fill="none"/></g></g>` +
        scaled(babyBody + arm('M138 128 Q158 104 160 76', tint), 'patch-fam-sway') + `</g>`;
    }
    case 'gaze':
      return `<g transform="translate(${n(x)} ${n(y)})">${shadow}${scaled(babyBody.replace(/cy="118"/g, 'cy="110"').replace(/cy="113"/g, 'cy="105"'), 'patch-fam-sway')}</g>`;
    case 'sled':
      return `<g transform="translate(${n(x)} ${n(y)})"><g class="patch-fam-sled" style="--dx:${n(facing === 'right' ? 70 : -70)}px;--dy:30px;${delay}">${shadow}<path d="M-14 2 H14 Q18 2 18 -2" stroke="#d84b4b" stroke-width="2.5" fill="none" stroke-linecap="round"/>${scaled(babyBody, '')}</g></g>`;
  }
}

/**
 * A member at its spot: helpers first (behind or beside), then the body, then
 * the hover tag. `index` staggers the arrival walk.
 */
export function memberArt(member: FamilyMember, spot: Spot, light: Light, style: MemberStyle, index: number): string {
  const tint = tintFor(member);
  const s = spot.w / 220;
  const faceRight = spot.facing === 'right';
  const lit: 'left' | 'right' = style.fire ? spot.facing : light.side;
  const dimBy = (1 - light.ambient) * (style.fire ? 0.1 : 0.32);

  let pose = '';
  let anim = 'patch-fam-bob';
  switch (member.status) {
    case 'working':
      pose = tool(style.tool, tint, style.helper.kind === 'fish' ? 172 + (style.helper.waterY - spot.y) / s : null);
      break;
    case 'blocked':
      anim = 'patch-fam-jelly';
      pose = `<g class="patch-fam-wave">${arm('M138 128 Q164 104 164 66', tint)}<rect x="144" y="22" width="40" height="36" rx="8" fill="#f8e3d9" stroke="${PEACH}" stroke-width="3"/><rect x="161" y="29" width="6" height="15" rx="3" fill="#b4664c"/><circle cx="164" cy="50" r="3.4" fill="#b4664c"/></g>`;
      break;
    case 'ready':
      anim = 'patch-fam-bounce';
      pose = readyProp(style.ready, tint);
      break;
    case 'idle':
      anim = 'patch-fam-breathe';
      pose = arm('M140 134 Q156 128 160 112', tint);
      break;
  }
  const zs = member.status === 'idle'
    ? `<g fill="#ecebe8" fill-opacity="0.6" font-family="system-ui, sans-serif" font-weight="700"><text class="patch-fam-z" x="150" y="72" font-size="16">z</text><text class="patch-fam-z patch-fam-d2" x="150" y="72" font-size="19">z</text><text class="patch-fam-z patch-fam-d3" x="150" y="72" font-size="22">Z</text></g>`
    : '';
  const flip = faceRight ? '' : ' scale(-1 1) translate(-200 0)';
  const art = `<g transform="translate(${n(spot.x)} ${n(spot.y)}) scale(${k(s)}) translate(-100 -172)">` +
    `<ellipse cx="100" cy="172" rx="46" ry="7" fill="#000" opacity="0.42"/>` +
    `<g transform="${flip.trim() || 'translate(0 0)'}"><g class="patch-fam-pb ${anim}">${pose}${body(tint, light, faceRight ? lit : lit === 'left' ? 'right' : 'left', member.status, dimBy)}</g></g>${zs}</g>`;

  const count = Math.min(4, Math.max(0, member.helpers));
  let helpers = '';
  for (let i = 0; i < count; i++) {
    const dir = faceRight ? 1 : -1;
    const hx = spot.x + dir * (spot.w * 0.4 + 10 + i * 34);
    const hy = spot.y + 2 + (i % 2) * 5;
    helpers += helper(hx, hy, i, tint, light, spot.facing, style);
  }

  const name = escape(member.name);
  const detail = escape(member.detail ?? WORDS[member.status] + (member.helpers ? ` · ${member.helpers} helper${member.helpers === 1 ? '' : 's'}` : ''));
  const tagW = Math.max(member.name.length * 7.2, (member.detail ?? 'Working · 3 helpers').length * 6.2) + 24;
  const tagY = spot.y - spot.w * 0.86 - 46;
  const statusInk: Record<FamilyStatus, string> = { working: '#8fd8bf', blocked: PEACH, ready: '#9cc5e8', idle: '#a09e99' };
  const tag = `<g class="patch-fam-tag" transform="translate(${n(spot.x)} ${n(tagY)})"><rect x="${n(-tagW / 2)}" y="0" width="${n(tagW)}" height="38" rx="10" fill="#212226" stroke="#ffffff" stroke-opacity="0.08"/>` +
    `<text x="0" y="16" text-anchor="middle" font-size="12" font-weight="700" fill="#ecebe8">${name}</text><text x="0" y="30" text-anchor="middle" font-size="11" fill="${statusInk[member.status]}">${detail}</text></g>`;

  const label = `${name}: ${escape(WORDS[member.status])}`;
  return `<g class="patch-fam-member" data-member="${escape(member.id)}" role="button" tabindex="0" aria-label="${label}">` +
    `<g class="patch-fam-arrive" style="animation-delay:${n(index * 0.22)}s">${helpers}${art}</g>${tag}</g>`;
}
