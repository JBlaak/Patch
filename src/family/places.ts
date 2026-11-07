import { tone, type Light } from './light';
import type { MemberStyle, Spot } from './member';
import { cloud, dots, hills, mix, n, pines, rng, roundTrees } from './paint';
import type { PatchPlace } from './types';

/**
 * The places the family goes to. Each one paints a backdrop behind the
 * members and a foreground in front of them, says where members stand, and
 * what their helpers do there. Colours are given as daylight colours and
 * graded for the hour by `tone`, which is what keeps every place in one light.
 *
 * The stage is 960 × 400. The middle of the bottom edge is left clear: the
 * host's own Patch stands there, in front of the scene.
 */

export const W = 960;
export const H = 400;

export interface Place {
  style: MemberStyle;
  /** Where up to nine members stand, in the order they join. */
  spots(count: number): Spot[];
  back(light: Light, id: string): string;
  front(light: Light, id: string): string;
  /**
   * Places that draw some members their own way (skaters on the canal) take
   * them here and answer the rest for the usual spots.
   */
  special?: boolean;
}

/* ---------- Shared pieces ---------- */

/**
 * Spots round a centrepiece, as offsets from it with a depth (1 is the front).
 * Filled in this order: the front pair, the inner back pair, the sides, the
 * outer back pair, and last the one straight behind the centrepiece.
 */
const RING: ReadonlyArray<[number, number, number]> = [
  [-175, 40, 1], [175, 40, 1], [-112, -30, 0.35], [112, -30, 0.35],
  [-318, 20, 0.8], [318, 20, 0.8], [-250, -36, 0.28], [250, -36, 0.28], [0, -48, 0.1],
];

function ring(cx: number, cy: number, rx: number, ry: number, min = 92, max = 150) {
  const sx = rx / 290;
  const sy = ry / 50;
  return (count: number): Spot[] => {
    const offsets = count === 1 ? [[-150, 36, 1] as [number, number, number]] : RING.slice(0, count);
    return offsets.map(([dx, dy, depth]) => {
      const x = cx + dx * sx;
      return { x, y: cy + dy * sy, w: min + (max - min) * depth, facing: x <= cx ? 'right' : 'left' };
    });
  };
}

/** Spots along a line (a pier, a quay), spread from the middle outwards, skipping the host's patch. */
function row(y: number, x0: number, x1: number, w: number, centerX: number) {
  return (count: number): Spot[] => {
    const slots: number[] = [];
    const step = (x1 - x0) / 9;
    const order = [3, 6, 2, 7, 1, 8, 0, 9, 5];
    for (const k of order.slice(0, count)) slots.push(x0 + step * k);
    return slots.map((x) => ({ x, y, w, facing: x <= centerX ? 'right' : 'left' }));
  };
}

function skyDefs(light: Light, id: string): string {
  const [top, mid, low] = light.sky;
  return `<linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="0.55" stop-color="${mid}"/><stop offset="1" stop-color="${low}"/></linearGradient>` +
    `<radialGradient id="${id}-glow"><stop offset="0" stop-color="${light.color}" stop-opacity="0.24"/><stop offset="1" stop-color="${light.color}" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="${id}-haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${light.haze}" stop-opacity="0"/><stop offset="1" stop-color="${light.haze}" stop-opacity="0.7"/></linearGradient>` +
    `<linearGradient id="${id}-ray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${light.color}" stop-opacity="0.22"/><stop offset="1" stop-color="${light.color}" stop-opacity="0"/></linearGradient>` +
    `<radialGradient id="${id}-pool"><stop offset="0" stop-color="#f39a3c" stop-opacity="0.32"/><stop offset="0.6" stop-color="#f39a3c" stop-opacity="0.07"/><stop offset="1" stop-color="#f39a3c" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="${id}-vignette" cx="0.5" cy="0.55" r="0.75"><stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.55"/></radialGradient>`;
}

/** The sky with its sun or moon, stars at night and a few soft clouds by day. */
function sky(light: Light, id: string, opts: { clouds?: boolean; stars?: number } = {}): string {
  let out = `<rect width="${W}" height="${H}" fill="url(#${id}-sky)"/>`;
  if (light.stars) {
    const count = opts.stars ?? 1;
    out += `<g fill="#ecebe8"><path d="${dots(11, Math.round(40 * count), 0, W, 0, 210, 0.5, 1.4)}"/>` +
      `<path opacity="0.6" d="${dots(23, Math.round(55 * count), 0, W, 0, 230, 0.4, 1)}"/></g>`;
  }
  out += `<circle cx="${light.x}" cy="${light.y}" r="${light.glow}" fill="url(#${id}-glow)"/>`;
  out += light.kind === 'sun'
    ? `<circle cx="${light.x}" cy="${light.y}" r="22" fill="${light.color}"/>`
    : `<circle cx="${light.x}" cy="${light.y}" r="16" fill="${light.color}"/><circle cx="${light.x + 7}" cy="${light.y - 5}" r="14" fill="${light.sky[0]}" opacity="0.92"/>`;
  if (opts.clouds !== false && (light.time === 'day' || light.time === 'morning')) {
    const c = mix(light.sky[2], '#ecebe8', light.time === 'day' ? 0.35 : 0.2);
    out += `<g>${cloud(330, 92, 120, c, 0.5)}${cloud(640, 60, 90, c, 0.35)}</g>`;
  }
  return out;
}

function hazeBand(id: string, y: number, h: number, opacity = 1): string {
  return `<rect x="0" y="${y}" width="${W}" height="${h}" fill="url(#${id}-haze)" opacity="${opacity}"/>`;
}

function ground(light: Light, base: string, y: number, seed = 3): string {
  const r = rng(seed);
  const top = tone(light, base, 0.8);
  const low = tone(light, mix(base, '#000000', 0.35), 1);
  const a = y + r() * 8;
  const b = y - 6 + r() * 8;
  return `<path d="M-20 ${n(a)} C 200 ${n(b)}, 420 ${n(y + 6)}, 520 ${n(y)} C 680 ${n(y - 6)}, 840 ${n(a)}, ${W + 20} ${n(b)} V${H} H-20 Z" fill="${top}"/>` +
    `<path d="M-20 ${n(y + 60)} C 300 ${n(y + 50)}, 600 ${n(y + 64)}, ${W + 20} ${n(y + 56)} V${H} H-20 Z" fill="${low}" opacity="0.6"/>`;
}

function rays(light: Light, id: string): string {
  if (!light.rays) return '';
  const { x, y } = light;
  const spread = x < W / 2 ? 1 : -1;
  const ray = (a: number, b: number, o: number) => `<path d="M${x} ${y} L${n(x + spread * a)} ${H} L${n(x + spread * b)} ${H} Z" fill="url(#${id}-ray)" opacity="${o}"/>`;
  return `<g>${ray(220, 360, 1)}${ray(470, 560, 0.7)}${ray(80, 150, 0.5)}</g>`;
}

function mist(light: Light): string {
  return light.mist ? `<rect x="-60" y="232" width="${W + 120}" height="30" rx="15" fill="${light.haze}" opacity="0.45"/>` : '';
}

/** Dark, out-of-focus shapes at the edges that frame the scene. */
function frame(id: string, light: Light, kind: 'trunks' | 'grass' | 'reeds' | 'snow' | 'none'): string {
  const c = mix('#050608', light.sky[0], 0.3);
  let out = '';
  if (kind === 'trunks') {
    out += `<path d="M-40 -20 H34 C28 160 38 300 52 420 H-40 Z" fill="${c}"/><path d="M${W + 40} -20 H${W - 30} C${W - 24} 180 ${W - 36} 300 ${W - 50} 420 H${W + 40} Z" fill="${c}"/>`;
  }
  if (kind !== 'none') {
    const tuft = kind === 'snow' ? '#c9ccd2' : c;
    const op = kind === 'snow' ? tone(light, '#e9edf2', 0.95) : tuft;
    out += `<path d="M-20 420 C0 370 16 362 26 338 C34 368 50 376 60 352 C70 376 86 384 110 420 Z" fill="${op}"/>` +
      `<path d="M${W + 20} 420 C${W - 4} 372 ${W - 20} 366 ${W - 30} 340 C${W - 38} 368 ${W - 54} 378 ${W - 64} 356 C${W - 74} 378 ${W - 92} 386 ${W - 116} 420 Z" fill="${op}"/>`;
  }
  if (kind === 'reeds') {
    out += `<g stroke="${c}" stroke-width="4" stroke-linecap="round" fill="none"><path d="M70 420 Q66 340 76 300"/><path d="M84 420 Q86 350 98 316"/><path d="M${W - 80} 420 Q${W - 76} 340 ${W - 88} 296"/></g>` +
      `<g fill="${c}"><ellipse cx="76" cy="296" rx="4" ry="14"/><ellipse cx="${W - 88}" cy="292" rx="4" ry="14"/></g>`;
  }
  return out ? `<g opacity="0.9">${out}</g>` : '';
}

function vignette(id: string): string {
  return `<rect width="${W}" height="${H}" fill="url(#${id}-vignette)"/>`;
}

function falling(kind: 'leaves' | 'snow' | 'petals' | 'rain'): string {
  const r = rng(kind.length * 7);
  let out = '';
  const count = kind === 'rain' ? 28 : kind === 'snow' ? 22 : 7;
  for (let i = 0; i < count; i++) {
    const x = r() * W;
    const delay = -r() * 12;
    const dur = kind === 'rain' ? 0.9 + r() * 0.5 : 9 + r() * 6;
    const style = `animation-delay:${n(delay)}s;animation-duration:${n(dur)}s`;
    if (kind === 'rain') out += `<path class="patch-fam-rain" style="${style}" d="M${n(x)} -20 l-4 14" stroke="#9cc5e8" stroke-opacity="0.45" stroke-width="1.5" stroke-linecap="round"/>`;
    else if (kind === 'snow') out += `<circle class="patch-fam-snow" style="${style}" cx="${n(x)}" cy="-10" r="${n(1.2 + r() * 1.6)}" fill="#ecebe8" opacity="0.8"/>`;
    else {
      const fill = kind === 'leaves' ? ['#e8955a', '#d9694f', '#e3b94f'][i % 3] : ['#f4bccb', '#ecebe8'][i % 2];
      out += `<g transform="translate(${n(x)} 0)"><path class="patch-fam-leaf" style="${style}" d="M0 -6 C5 -3 5 3 0 6 C-5 3 -5 -3 0 -6 Z" fill="${fill}"/></g>`;
    }
  }
  return out;
}

function fire(x: number, y: number, id: string): string {
  return `<ellipse cx="${x}" cy="${y + 6}" rx="360" ry="110" fill="url(#${id}-pool)"/>` +
    `<g fill="#3a3a40">${[-44, -24, 0, 24, 44].map((dx, i) => `<ellipse cx="${x + dx}" cy="${y + 12 + (i === 2 ? 4 : i % 2 ? 2 : -2)}" rx="10" ry="5"/>`).join('')}</g>` +
    `<g fill="#f39a3c" opacity="0.4">${[-44, -24, 0, 24, 44].map((dx, i) => `<ellipse cx="${x + dx}" cy="${y + 9 + (i === 2 ? 4 : i % 2 ? 2 : -2)}" rx="7" ry="2"/>`).join('')}</g>` +
    `<g transform="translate(${x - 50} ${y - 84})">` +
    `<linearGradient id="${id}-flame" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#f39a3c"/><stop offset="1" stop-color="#d84b4b"/></linearGradient>` +
    `<linearGradient id="${id}-core" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff3c4"/><stop offset="1" stop-color="#f0cf7e"/></linearGradient>` +
    `<rect x="16" y="82" width="68" height="10" rx="5" fill="#4e3622" transform="rotate(14 50 88)"/><rect x="16" y="82" width="68" height="10" rx="5" fill="#5a3e27" transform="rotate(-14 50 88)"/>` +
    `<path class="patch-fam-flame" d="M50 14 C68 40 78 58 73 73 C70 83 60 88 50 88 C40 88 30 83 27 73 C22 58 32 40 50 14 Z" fill="url(#${id}-flame)"/>` +
    `<path class="patch-fam-flame patch-fam-f2" d="M50 32 C62 48 67 63 64 75 C61 83 55 86 50 86 C45 86 39 83 36 75 C33 63 38 48 50 32 Z" fill="#f39a3c"/>` +
    `<path class="patch-fam-flame patch-fam-f3" d="M50 50 C57 61 60 70 57 78 C55 83 52 85 50 85 C48 85 45 83 43 78 C40 70 43 61 50 50 Z" fill="url(#${id}-core)"/></g>` +
    `<g fill="#ecebe8" opacity="0.06"><ellipse class="patch-fam-smoke" cx="${x}" cy="${y - 100}" rx="16" ry="11"/><ellipse class="patch-fam-smoke patch-fam-d2" cx="${x + 6}" cy="${y - 100}" rx="13" ry="9"/></g>`;
}

function embers(x: number, y: number): string {
  const r = rng(99);
  let out = '';
  for (let i = 0; i < 9; i++) {
    out += `<circle class="patch-fam-ember" style="--dx:${n(-26 + r() * 52)}px;animation-delay:${n(-r() * 3)}s;animation-duration:${n(2.2 + r() * 1.6)}s" cx="${n(x - 12 + r() * 24)}" cy="${n(y - 30 - r() * 14)}" r="1.6" fill="#f6c27a"/>`;
  }
  return out;
}

function lightPool(x: number, y: number, light: Light, id: string): string {
  if (!light.rays) return '';
  return `<ellipse cx="${x}" cy="${y}" rx="130" ry="20" fill="${light.color}" fill-opacity="0.04"/>`;
}

function woods(light: Light, id: string, seed: number): string {
  return `<path d="${hills(seed, 214, 44)}" fill="${tone(light, '#5f7066', 0.1)}"/>` + hazeBand(id, 170, 90) +
    `<path d="${pines(seed + 2, 250, 30, 64, 11, 22)}" fill="${tone(light, '#3f5448', 0.35)}"/>` + mist(light) + hazeBand(id, 210, 60, 0.5) +
    `<path d="${pines(seed + 4, 268, 56, 120, 22, 44)}" fill="${tone(light, '#2c3b32', 0.6)}"/>`;
}

/* ---------- The places ---------- */

const campfire: Place = {
  style: { helper: { kind: 'roast' }, tool: 'none', ready: 'mug', fire: true, centerX: 480 },
  spots: ring(480, 300, 290, 52),
  back: (l, id) => sky(l, id, { stars: 1.2 }) + woods(l, id, 5) + ground(l, '#3a4634', 262) + fire(480, 300, id),
  front: (l, id) => embers(480, 300) + frame(id, l, 'grass'),
};

const tents: Place = {
  style: { helper: { kind: 'fetch', item: 'log', back: false }, tool: 'none', ready: 'mug', fire: true, centerX: 480 },
  spots: ring(480, 304, 290, 50),
  back: (l, id) => {
    const tent = (x: number, c: string) => {
      const body = tone(l, c, 0.55);
      const lit = l.time === 'night' || l.time === 'evening';
      return `<g transform="translate(${x} 262)"><path d="M0 -6 L0 -70" stroke="#a09e99" stroke-width="2"/><path class="patch-fam-pennant" d="M0 -70 L14 -66 L0 -62 Z" fill="${c}"/>` +
        `<path d="M0 -62 L58 0 L-58 0 Z" fill="${body}"/><path d="M0 -62 L58 0 L30 0 Z" fill="#000" opacity="0.2"/>` +
        `<path d="M0 -34 L18 0 L-18 0 Z" fill="${lit ? '#f0cf7e' : '#0b0c0f'}" opacity="${lit ? 0.55 : 1}"${lit ? ' class="patch-fam-lantern"' : ''}/></g>`;
    };
    return sky(l, id) + woods(l, id, 9) + ground(l, '#3a4634', 262) + tent(250, '#9cc5e8') + tent(700, '#c8b8e8') + tent(830, '#f0cf7e') +
      `<g transform="translate(560 318)"><rect x="0" y="0" width="34" height="8" rx="4" fill="#5a3e27"/><rect x="5" y="-7" width="30" height="8" rx="4" fill="#6b4a2f"/></g>` + fire(480, 304, id);
  },
  front: (l, id) => embers(480, 304) + frame(id, l, 'grass'),
};

const pier: Place = {
  style: { helper: { kind: 'fish', waterY: 346 }, tool: 'rod', ready: 'fish', fire: false, centerX: 480 },
  spots: row(300, 110, 850, 118, 480),
  back: (l, id) => {
    const water = tone(l, '#3c5a66', 0.6);
    let shimmer = '';
    const r = rng(17);
    for (let i = 0; i < 6; i++) {
      const y = 238 + i * 9 + r() * 4;
      const w = 54 - i * 7 + r() * 16;
      const x = l.x - w / 2 + (r() - 0.5) * 30;
      shimmer += `<rect class="patch-fam-shimmer${i % 2 ? ' patch-fam-d2' : ''}" x="${n(x)}" y="${n(y)}" width="${n(w)}" height="2" rx="1" fill="${l.color}" fill-opacity="${n(0.5 - i * 0.06)}"/>`;
    }
    const deck = tone(l, '#7d5a3a', 0.85);
    const posts = [60, 200, 340, 480, 620, 760, 900].map((x) => `<rect x="${x}" y="312" width="9" height="70" fill="${tone(l, '#4e3622', 0.9)}"/>`).join('');
    return sky(l, id, { stars: 1.3 }) + `<path d="${hills(14, 222, 26)}" fill="${tone(l, '#4d5d55', 0.2)}"/>` +
      `<path d="${pines(15, 232, 16, 34, 9, 18)}" fill="${tone(l, '#3a4a40', 0.3)}"/>` +
      `<rect x="0" y="230" width="${W}" height="170" fill="${water}"/>` + hazeBand(id, 228, 40, 0.6) + shimmer +
      `<path d="M-20 252 Q240 248 480 252 T980 250" stroke="#ecebe8" stroke-opacity="0.06" stroke-width="2" fill="none"/>` +
      posts + `<rect x="0" y="296" width="${W}" height="10" rx="2" fill="${deck}"/><rect x="0" y="306" width="${W}" height="7" fill="${tone(l, '#5a3e27', 0.9)}"/>` +
      `<g transform="translate(900 280)"><rect x="0" y="4" width="16" height="14" rx="2" fill="#a09e99"/><circle class="patch-fam-lantern" cx="8" cy="11" r="4" fill="#f0cf7e"/></g>`;
  },
  front: (l, id) => frame(id, l, 'reeds'),
};

const forest: Place = {
  style: { helper: { kind: 'fetch', item: 'mushroom', back: true }, tool: 'none', ready: 'basket', fire: false, centerX: 480 },
  spots: ring(480, 306, 290, 48),
  back: (l, id) => {
    const trunk = tone(l, '#2a2620', 0.5);
    const stump = tone(l, '#6b4a2f', 0.85);
    const top = tone(l, '#c49a68', 0.85);
    return sky(l, id) + woods(l, id, 17) +
      `<g fill="${trunk}"><rect x="140" y="110" width="14" height="170" rx="4"/><rect x="270" y="140" width="10" height="140" rx="3"/><rect x="700" y="120" width="12" height="160" rx="3"/><rect x="820" y="96" width="16" height="190" rx="4"/></g>` +
      ground(l, '#33402c', 270) + rays(l, id) + lightPool(380, 330, l, id) + lightPool(640, 356, l, id) +
      `<g transform="translate(480 300)"><ellipse cx="0" cy="12" rx="50" ry="8" fill="#000" opacity="0.3"/><path d="M-40 12 C-43 -4 -37 -16 -32 -20 H32 C37 -16 43 -4 40 12 Z" fill="${stump}"/><ellipse cx="0" cy="-20" rx="32" ry="8" fill="${top}"/><ellipse cx="0" cy="-20" rx="20" ry="5" fill="none" stroke="${stump}" stroke-width="1.5"/>` +
      `<g transform="translate(30 12)"><rect x="-2.5" y="-10" width="5" height="10" rx="2" fill="#ecebe8"/><path d="M-9 -8 C-9 -20 9 -20 9 -8 Z" fill="#d84b4b"/><circle cx="-3" cy="-14" r="1.6" fill="#ecebe8"/></g>` +
      `<g transform="translate(-34 14)"><rect x="-2" y="-7" width="4" height="7" rx="2" fill="#ecebe8"/><path d="M-7 -5 C-7 -13 7 -13 7 -5 Z" fill="#e3b94f"/></g></g>`;
  },
  front: (l, id) => falling('leaves') + frame(id, l, 'grass'),
};

const beach: Place = {
  style: { helper: { kind: 'fetch', item: 'bucket', back: true, dy: -50 }, tool: 'none', ready: 'shades', fire: false, centerX: 480 },
  spots: ring(480, 318, 290, 40),
  back: (l, id) => {
    const sea = tone(l, '#3d6670', 0.55);
    const sand = tone(l, '#b39a72', 0.85);
    const wet = tone(l, '#8a7656', 0.8);
    let shimmer = '';
    for (let i = 0; i < 4; i++) shimmer += `<rect class="patch-fam-shimmer${i % 2 ? ' patch-fam-d2' : ''}" x="${n(l.x - 40 + i * 6)}" y="${214 + i * 10}" width="${60 - i * 10}" height="2.5" rx="1.2" fill="${l.color}" fill-opacity="0.45"/>`;
    const castle = tone(l, '#c9ae80', 0.9);
    return sky(l, id) + `<rect x="0" y="206" width="${W}" height="62" fill="${sea}"/>` + hazeBand(id, 196, 30, 0.6) + shimmer +
      `<rect x="0" y="262" width="${W}" height="16" fill="${wet}"/>` +
      `<path d="M-40 264 C40 258 120 270 200 263 C280 256 360 270 440 263 C520 256 600 270 680 263 C760 256 840 270 920 263 C1000 256 1080 270 1160 263" stroke="#ecebe8" stroke-opacity="0.45" stroke-width="2.5" fill="none"/>` +
      `<rect x="0" y="276" width="${W}" height="124" fill="${sand}"/>` +
      `<g transform="translate(450 312)"><rect x="0" y="-26" width="60" height="26" fill="${castle}"/><rect x="5" y="-46" width="16" height="20" fill="${castle}"/><rect x="39" y="-46" width="16" height="20" fill="${castle}"/><rect x="24" y="-12" width="12" height="12" rx="6" fill="${wet}"/><path d="M47 -46 V-60" stroke="#a09e99" stroke-width="1.5"/><path d="M47 -60 L58 -56 L47 -52 Z" fill="#8fd8bf"/></g>` +
      `<g transform="translate(760 300)"><path d="M0 0 L6 -86" stroke="#ecebe8" stroke-width="2.5"/><path d="M-44 -74 C-30 -104 44 -104 56 -74 Z" fill="#ee8b8b"/><path d="M-8 -74 C-6 -98 18 -98 20 -74 Z" fill="#ecebe8"/></g>`;
  },
  front: (l, id) => `<g class="patch-fam-gull"><path d="M0 0 Q5 -5 10 0 Q15 -5 20 0" transform="translate(-40 120)" stroke="#ecebe8" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>` + frame(id, l, 'none'),
};

const allotment: Place = {
  style: { helper: { kind: 'water' }, tool: 'spade', ready: 'carrot', fire: false, centerX: 480 },
  spots: ring(480, 312, 290, 46),
  back: (l, id) => {
    const lit = l.time === 'evening' || l.time === 'night';
    const fence = tone(l, '#6b4a2f', 0.6);
    const bed = tone(l, '#6b4a2f', 0.85);
    const soil = tone(l, '#40301f', 0.85);
    let tulips = '';
    const tc = ['#ee7b8b', '#f0cf7e', '#c8b8e8', '#f39a3c'];
    for (let i = 0; i < 9; i++) {
      const x = 40 + i * 16 + (i > 4 ? 760 : 0);
      tulips += `<g class="patch-fam-sway patch-fam-d${(i % 3) + 1}"><path d="M${x} 280 V262" stroke="#6fbf8f" stroke-width="2"/><path d="M${x - 5} 256 L${x - 4} 264 Q${x} 268 ${x + 4} 264 L${x + 5} 256 L${x + 2} 259 L${x} 254 L${x - 2} 259 Z" fill="${tc[i % 4]}"/></g>`;
    }
    let bulbs = '';
    if (lit) bulbs = `<path d="M0 232 Q120 248 240 232 Q360 248 480 232 Q600 248 720 232 Q840 248 960 232" stroke="#a09e99" stroke-width="1" fill="none"/>` +
      [60, 180, 300, 420, 540, 660, 780, 900].map((x, i) => `<circle class="patch-fam-twinkle${i % 2 ? ' patch-fam-d2' : ''}" cx="${x}" cy="241" r="3" fill="${['#f0cf7e', '#ee8b8b', '#9cc5e8'][i % 3]}"/>`).join('');
    return sky(l, id) + `<path d="${hills(21, 240, 22)}" fill="${tone(l, '#55705c', 0.3)}"/>` + hazeBand(id, 200, 50, 0.6) +
      `<g transform="translate(770 182)"><path d="M0 72 V26 L60 0 L120 26 V72 Z" fill="${tone(l, '#9cc5e8', 0.5)}" opacity="0.55"/><path d="M0 26 L60 0 L120 26 M30 13 V72 M60 0 V72 M90 13 V72 M0 48 H120" stroke="#ecebe8" stroke-opacity="0.3" stroke-width="1.5" fill="none"/></g>` +
      ground(l, '#3f4e33', 254) +
      `<g fill="${fence}"><rect x="0" y="238" width="${W}" height="4" rx="2"/><rect x="0" y="250" width="${W}" height="4" rx="2"/>${[20, 140, 260, 380, 500, 620, 740, 860].map((x) => `<rect x="${x}" y="230" width="5" height="30"/>`).join('')}</g>` +
      bulbs + tulips +
      `<g transform="translate(400 300)"><rect x="0" y="0" width="160" height="14" rx="4" fill="${bed}"/><rect x="0" y="-3" width="160" height="5" rx="2.5" fill="${soil}"/>${[20, 50, 80, 110, 140].map((x) => `<path d="M${x} -2 V-12 M${x} -8 C${x - 5} -8 ${x - 7} -12 ${x - 6} -14 M${x} -10 C${x + 5} -10 ${x + 7} -14 ${x + 6} -16" stroke="#6fbf8f" stroke-width="2" fill="none" stroke-linecap="round"/>`).join('')}</g>` +
      (l.time === 'day' ? `<g class="patch-fam-bee"><ellipse cx="300" cy="200" rx="4" ry="3" fill="#f0cf7e"/><ellipse cx="299" cy="196" rx="3" ry="2" fill="#ecebe8" opacity="0.7"/></g>` : '');
  },
  front: (l, id) => falling('petals') + frame(id, l, 'grass'),
};

const dunes: Place = {
  style: { helper: { kind: 'kite' }, tool: 'none', ready: 'shades', fire: false, centerX: 480 },
  spots: ring(480, 318, 290, 40),
  back: (l, id) => {
    const sand = (k: number) => tone(l, mix('#c9ae80', '#8a7656', 1 - k), k);
    return sky(l, id) + `<rect x="0" y="214" width="${W}" height="16" fill="${tone(l, '#3d6670', 0.3)}"/>` +
      `<g transform="translate(820 214)"><path d="M-8 0 L-5 -70 H5 L8 0 Z" fill="${tone(l, '#ecebe8', 0.4)}"/><path d="M-6 -40 H6 V-30 H-6 Z M-5 -62 H5 V-52 H-5 Z" fill="${tone(l, '#d84b4b', 0.4)}"/><rect x="-7" y="-80" width="14" height="10" rx="2" fill="${tone(l, '#3a3b40', 0.4)}"/>` +
      (l.time === 'night' || l.time === 'evening' ? `<path class="patch-fam-beam" d="M0 -75 L-160 -96 L-160 -54 Z" fill="#f0cf7e" opacity="0.18"/><circle cx="0" cy="-75" r="4" fill="#f0cf7e"/>` : '') + `</g>` +
      `<path d="M-20 236 C120 200 240 214 340 236 C440 214 560 196 700 230 C800 210 900 214 980 232 V400 H-20 Z" fill="${sand(0.4)}"/>` + hazeBand(id, 200, 50, 0.4) +
      `<path d="M-20 268 C160 238 300 252 420 270 C560 250 720 240 980 266 V400 H-20 Z" fill="${sand(0.7)}"/>` +
      `<path d="M-20 296 C200 286 520 300 980 290 V400 H-20 Z" fill="${sand(0.9)}"/>` +
      `<g stroke="${tone(l, '#8a9a5a', 0.75)}" stroke-width="2" stroke-linecap="round" fill="none" class="patch-fam-sway">${[60, 110, 230, 640, 700, 880].map((x, i) => `<path d="M${x} ${262 + (i % 3) * 6} q-4 -18 -10 -26 M${x} ${262 + (i % 3) * 6} q2 -20 6 -30 M${x} ${262 + (i % 3) * 6} q8 -12 16 -18"/>`).join('')}</g>` +
      `<g transform="translate(440 318)"><path d="M0 0 L80 0 L94 -16 L14 -16 Z" fill="#ee8b8b"/><path d="M20 0 L34 -16 M40 0 L54 -16 M60 0 L74 -16" stroke="#ecebe8" stroke-width="3" opacity="0.7"/><rect x="58" y="-30" width="22" height="16" rx="3" fill="#b97a45"/></g>`;
  },
  front: (l, id) => frame(id, l, 'grass'),
};

const orchard: Place = {
  style: { helper: { kind: 'fetch', item: 'apple', back: true, dy: -46 }, tool: 'none', ready: 'apples', fire: false, centerX: 480 },
  spots: ring(480, 316, 290, 44),
  back: (l, id) => {
    const r = rng(41);
    let apples = '';
    for (let i = 0; i < 60; i++) {
      const x = r() * W;
      const y = 196 + r() * 44;
      apples += `<circle cx="${n(x)}" cy="${n(y)}" r="${n(2 + r() * 1.5)}" fill="${tone(l, i % 4 ? '#d84b4b' : '#e8955a', 0.62)}"/>`;
    }
    return sky(l, id) + `<path d="${hills(31, 218, 30)}" fill="${tone(l, '#5f7a5a', 0.15)}"/>` + hazeBand(id, 180, 70, 0.6) +
      `<path d="${roundTrees(33, 262, 22, 32, 70, 96)}" fill="${tone(l, '#3c5a36', 0.6)}"/>` + apples +
      ground(l, '#45583a', 270) + rays(l, id) +
      `<g transform="translate(206 200)" stroke="${tone(l, '#b97a45', 0.7)}" stroke-width="3" fill="none"><path d="M0 0 L-12 70 M14 0 L4 70 M-2 12 H11 M-4 28 H9 M-7 44 H6 M-9 60 H4"/></g>` +
      `<g transform="translate(450 306)"><path d="M0 0 H60 V-26 H0 Z" fill="${tone(l, '#b97a45', 0.9)}"/><path d="M0 -9 H60 M0 -18 H60" stroke="${tone(l, '#8a5a32', 0.9)}" stroke-width="2"/>${[10, 22, 34, 46].map((x, i) => `<circle cx="${x + 4}" cy="-29" r="6" fill="${i % 2 ? '#e8955a' : '#d84b4b'}"/>`).join('')}</g>`;
  },
  front: (l, id) => falling('leaves') + frame(id, l, 'grass'),
};

const stargazing: Place = {
  style: { helper: { kind: 'gaze' }, tool: 'none', ready: 'mug', fire: false, centerX: 480 },
  spots: ring(480, 318, 280, 38),
  back: (l, id) => {
    const band = l.stars
      ? `<g transform="rotate(-18 480 120)"><ellipse cx="480" cy="120" rx="560" ry="34" fill="#ecebe8" opacity="0.05"/><path d="${dots(71, 160, -80, 1040, 92, 148, 0.3, 0.9)}" fill="#ecebe8" opacity="0.5"/></g>` +
        `<path class="patch-fam-shooting" d="M0 0 L-60 22" transform="translate(700 60)" stroke="#ecebe8" stroke-width="1.6" stroke-linecap="round"/>`
      : '';
    return sky(l, id, { stars: 2.2 }) + band +
      `<path d="${hills(51, 250, 30)}" fill="${tone(l, '#4a5560', 0.2)}"/>` + hazeBand(id, 210, 60, 0.6) +
      `<path d="M-20 300 C 200 252, 420 246, 520 252 C 700 262, 860 280, 980 300 V400 H-20 Z" fill="${tone(l, '#3a4434', 0.8)}"/>` +
      `<g transform="translate(486 300)" stroke="${tone(l, '#a09e99', 0.9)}" stroke-width="2.5" stroke-linecap="round"><path d="M0 0 L-14 22 M0 0 L14 22 M0 0 V24"/><path d="M-26 -30 L22 -6" stroke="${tone(l, '#c8b8e8', 0.95)}" stroke-width="9"/><path d="M-30 -32 L-22 -28" stroke="${tone(l, '#ecebe8', 0.9)}" stroke-width="11"/></g>` +
      `<path d="M410 330 L470 316 L540 330 L480 346 Z" fill="${tone(l, '#3f6fc4', 0.85)}" opacity="0.85"/>`;
  },
  front: (l, id) => frame(id, l, 'grass'),
};

const tulips: Place = {
  style: { helper: { kind: 'fetch', item: 'tulip', back: true, dy: 30 }, tool: 'none', ready: 'flower', fire: false, centerX: 480 },
  spots: ring(480, 300, 290, 40),
  back: (l, id) => {
    const colors = ['#ee7b8b', '#f0cf7e', '#f4bccb', '#ecebe8', '#d84b4b', '#c8b8e8'];
    let rows = '';
    const vx = 480;
    const vy = 210;
    for (let i = -7; i <= 7; i++) {
      const a = vx + i * 140;
      const b = vx + (i + 1) * 140;
      const color = colors[(i + 7) % colors.length]!;
      const base = i % 2 ? tone(l, mix(color, '#4f7a4a', 0.35), 0.62) : tone(l, '#4f7a4a', 0.6);
      rows += `<path d="M${vx + i * 6} ${vy + 26} L${vx + (i + 1) * 6} ${vy + 26} L${b} ${H + 40} L${a} ${H + 40} Z" fill="${base}"/>`;
    }
    const mill = tone(l, '#3a3b40', 0.35);
    return sky(l, id) + `<path d="${roundTrees(61, 236, 8, 14, 22, 40)}" fill="${tone(l, '#3c5a36', 0.25)}"/>` + hazeBand(id, 200, 40, 0.6) +
      `<g transform="translate(760 236)"><path d="M-12 0 L-8 -56 H8 L12 0 Z" fill="${mill}"/><path d="M-11 -56 L0 -68 L11 -56 Z" fill="${mill}"/><g transform="translate(0 -56)"><g class="patch-fam-sails" stroke="${mill}" stroke-width="5"><path d="M0 0 V-40 M0 0 V40 M0 0 H-40 M0 0 H40"/></g></g></g>` +
      `<rect x="0" y="234" width="${W}" height="4" fill="${tone(l, '#3d6670', 0.4)}"/>` + rows +
      `<path d="M${vx - 2} 236 L${vx + 2} 236 L${vx + 70} ${H} L${vx - 70} ${H} Z" fill="${tone(l, '#8a7656', 0.8)}"/>` +
      `<g transform="translate(420 300)"><path d="M0 -24 H50 L44 0 H6 Z" fill="${tone(l, '#9cc5e8', 0.8)}"/><circle cx="24" cy="4" r="7" fill="#3a3b40"/><path d="M50 -20 L72 -4" stroke="#a09e99" stroke-width="3"/>${[8, 18, 28, 38].map((x, i) => `<path d="M${x} -24 l-3 -9 l3 4 l3 -4 l-3 9" fill="${colors[i]}" stroke="${colors[i]}" stroke-width="3"/>`).join('')}</g>`;
  },
  front: (l, id) => falling('petals') + frame(id, l, 'grass'),
};

const sledding: Place = {
  style: { helper: { kind: 'sled' }, tool: 'none', ready: 'mug', fire: false, centerX: 480 },
  spots: ring(480, 318, 290, 40),
  back: (l, id) => {
    const snow = (k: number) => tone(l, '#e9edf2', k);
    const pine = tone(l, '#2c3b32', 0.5);
    return sky(l, id) + `<path d="${hills(81, 230, 40)}" fill="${snow(0.2)}"/>` + hazeBand(id, 190, 60, 0.5) +
      `<path d="${pines(83, 252, 30, 66, 16, 34)}" fill="${pine}"/>` +
      `<path d="M-20 240 C 120 236, 260 250, 380 270 C 520 292, 700 296, 980 300 V400 H-20 Z" fill="${snow(0.75)}"/>` +
      `<path d="M-20 296 C 300 288, 600 304, 980 296 V400 H-20 Z" fill="${snow(0.95)}"/>` +
      `<path d="M60 250 C 200 262, 330 280, 420 296" stroke="${snow(0.55)}" stroke-width="3" fill="none" opacity="0.6"/>` +
      `<g transform="translate(520 300)"><circle cx="0" cy="-12" r="14" fill="${snow(1)}"/><circle cx="0" cy="-34" r="10" fill="${snow(1)}"/><circle cx="-3" cy="-36" r="1.6" fill="#141517"/><circle cx="3" cy="-36" r="1.6" fill="#141517"/><path d="M0 -33 L8 -32 L0 -31 Z" fill="#f39a3c"/><path d="M-10 -26 H10" stroke="#d84b4b" stroke-width="4"/></g>`;
  },
  front: (l, id) => falling('snow') + frame(id, l, 'snow'),
};

/* The canal: everyone working skates in lanes across the ice; the others stand on the quay. */
const canal: Place = {
  style: { helper: { kind: 'gaze' }, tool: 'none', ready: 'mug', fire: false, centerX: 480 },
  spots: row(240, 110, 850, 78, 480),
  special: true,
  back: (l, id) => {
    const house = tone(l, '#2e3240', 0.45);
    const lit = l.time !== 'day';
    const win = lit ? '#f0cf7e' : tone(l, '#4a5568', 0.5);
    let houses = '';
    let windows = '';
    const r = rng(91);
    let x = -10;
    while (x < W) {
      const w = 46 + r() * 22;
      const h = 70 + r() * 40;
      const top = 232 - h;
      const gable = r() > 0.5;
      houses += gable
        ? `<path d="M${n(x)} 232 V${n(top + 14)} H${n(x + w * 0.2)} V${n(top + 6)} L${n(x + w / 2)} ${n(top - 14)} L${n(x + w * 0.8)} ${n(top + 6)} V${n(top + 14)} H${n(x + w)} V232 Z"/>`
        : `<path d="M${n(x)} 232 V${n(top + 10)} L${n(x + w / 2)} ${n(top - 14)} L${n(x + w)} ${n(top + 10)} V232 Z"/>`;
      for (let k = 0; k < 3; k++) {
        if (r() > 0.45) windows += `<rect${lit && r() > 0.6 ? ' class="patch-fam-window"' : ''} x="${n(x + 10 + (k % 2) * (w - 30))}" y="${n(top + 22 + k * 22)}" width="9" height="12" rx="1"/>`;
      }
      x += w;
    }
    const ice = tone(l, '#56707e', 0.75);
    return sky(l, id) + `<g fill="${house}">${houses}</g><g fill="${win}">${windows}</g>` +
      `<rect x="0" y="230" width="${W}" height="18" fill="${tone(l, '#4a4f5a', 0.7)}"/><rect x="0" y="228" width="${W}" height="3" fill="#ecebe8" opacity="0.6"/>` +
      `<rect x="0" y="248" width="${W}" height="152" fill="${ice}"/>` +
      `<path d="M60 290 L220 287 M300 330 L520 334 M640 300 L880 296 M120 370 L360 374 M700 360 L940 366" stroke="#ecebe8" stroke-opacity="0.12" stroke-width="2" stroke-linecap="round"/>` +
      `<g transform="translate(860 230)"><rect x="0" y="-46" width="74" height="46" fill="${tone(l, '#3a2f2a', 0.8)}"/><path d="M-6 -46 H80 L74 -58 H0 Z" fill="#d84b4b"/><path d="M6 -58 L3 -46 M18 -58 L17 -46 M30 -58 V-46 M42 -58 L43 -46 M54 -58 L57 -46 M66 -58 L69 -46" stroke="#ecebe8" stroke-width="5"/><rect x="6" y="-38" width="62" height="12" rx="2" fill="#f0cf7e" opacity="0.85"/></g>`;
  },
  front: (l, id) => falling('snow') + frame(id, l, 'none'),
};

export const PLACES: Record<PatchPlace, Place> = {
  campfire, tents, pier, forest, beach, canal, allotment, dunes, orchard, stargazing, tulips, sledding,
};

export const STAGE = { skyDefs, vignette };
