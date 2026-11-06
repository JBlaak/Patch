/**
 * Drawing helpers shared by every place: colour mixing, a seeded random
 * source (so a place looks the same every time it is drawn), and the
 * procedural shapes the backdrops are built from.
 *
 * Everything here returns SVG markup as a string. Nothing is user-supplied:
 * names are escaped where they are used, in `art.ts`.
 */

/** A small fast seeded random source (mulberry32). */
export function rng(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** One decimal is plenty for coordinates and keeps the markup short. */
export function n(v: number): string {
  return String(Math.round(v * 10) / 10);
}

function channels(hex: string): [number, number, number] {
  const v = parseInt(hex.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

function hex(c: [number, number, number]): string {
  return '#' + c.map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0')).join('');
}

/** `a` blended towards `b` by `t` (0 = a, 1 = b). */
export function mix(a: string, b: string, t: number): string {
  const ca = channels(a);
  const cb = channels(b);
  return hex([ca[0] + (cb[0] - ca[0]) * t, ca[1] + (cb[1] - ca[1]) * t, ca[2] + (cb[2] - ca[2]) * t]);
}

/** `c` with its brightness scaled by `k`. */
export function dim(c: string, k: number): string {
  const v = channels(c);
  return hex([v[0] * k, v[1] * k, v[2] * k]);
}

/** A row of tiered pines standing on `base`, closed into the ground below as one path. */
export function pines(seed: number, base: number, minH: number, maxH: number, minGap: number, maxGap: number, width = 960): string {
  const r = rng(seed);
  let d = '';
  let x = -30;
  while (x < width + 30) {
    const h = minH + r() * (maxH - minH);
    const hw = h * 0.27;
    const p: Array<[number, number]> = [
      [x - hw, base], [x - hw * 0.5, base - h * 0.4], [x - hw * 0.74, base - h * 0.4],
      [x - hw * 0.32, base - h * 0.7], [x - hw * 0.48, base - h * 0.7], [x, base - h],
      [x + hw * 0.48, base - h * 0.7], [x + hw * 0.32, base - h * 0.7], [x + hw * 0.74, base - h * 0.4],
      [x + hw * 0.5, base - h * 0.4], [x + hw, base],
    ];
    d += 'M' + p.map(([px, py]) => `${n(px)} ${n(py)}`).join(' L') + ' Z ';
    x += minGap + r() * (maxGap - minGap);
  }
  return `${d}M-30 ${n(base - 2)} H${width + 30} V400 H-30 Z`;
}

/** Round-topped trees (an orchard, a park), closed into the ground. */
export function roundTrees(seed: number, base: number, minR: number, maxR: number, minGap: number, maxGap: number, width = 960): string {
  const r = rng(seed);
  let d = '';
  let x = -20;
  while (x < width + 20) {
    const rad = minR + r() * (maxR - minR);
    const cy = base - rad * 1.5;
    d += `M${n(x - rad)} ${n(cy)} a${n(rad)} ${n(rad)} 0 1 0 ${n(2 * rad)} 0 a${n(rad)} ${n(rad)} 0 1 0 ${n(-2 * rad)} 0 Z `;
    d += `M${n(x - rad * 0.12)} ${n(cy)} H${n(x + rad * 0.12)} V${n(base)} H${n(x - rad * 0.12)} Z `;
    x += minGap + r() * (maxGap - minGap);
  }
  return `${d}M-30 ${n(base - 1)} H${width + 30} V400 H-30 Z`;
}

/** A soft rolling skyline, closed into the ground. */
export function hills(seed: number, base: number, amp: number, width = 960): string {
  const r = rng(seed);
  let d = `M-40 ${n(base)}`;
  let x = -40;
  while (x < width + 40) {
    const nx = x + 160 + r() * 90;
    const y = base - r() * amp;
    d += ` Q${n((x + nx) / 2)} ${n(y - amp * 0.6)} ${n(nx)} ${n(y)}`;
    x = nx;
  }
  return `${d} V400 H-40 Z`;
}

/** Many tiny dots as one path, for stars or sparkle. */
export function dots(seed: number, count: number, x0: number, x1: number, y0: number, y1: number, rMin: number, rMax: number): string {
  const r = rng(seed);
  let d = '';
  for (let i = 0; i < count; i++) {
    const x = x0 + r() * (x1 - x0);
    const y = y0 + r() * (y1 - y0);
    const s = rMin + r() * (rMax - rMin);
    d += `M${n(x)} ${n(y)} m-${n(s)} 0 a${n(s)} ${n(s)} 0 1 0 ${n(2 * s)} 0 a${n(s)} ${n(s)} 0 1 0 -${n(2 * s)} 0 `;
  }
  return d;
}

/** A soft cloud, centred on (x, y), `w` wide. */
export function cloud(x: number, y: number, w: number, fill: string, opacity = 1): string {
  const h = w * 0.32;
  return `<path d="M${n(x - w / 2)} ${n(y)} C ${n(x - w / 2)} ${n(y - h)}, ${n(x - w * 0.18)} ${n(y - h * 1.1)}, ${n(x - w * 0.08)} ${n(y - h * 0.7)} C ${n(x)} ${n(y - h * 1.6)}, ${n(x + w * 0.3)} ${n(y - h * 1.4)}, ${n(x + w * 0.28)} ${n(y - h * 0.6)} C ${n(x + w * 0.5)} ${n(y - h * 0.7)}, ${n(x + w * 0.56)} ${n(y)}, ${n(x + w * 0.44)} ${n(y)} Z" fill="${fill}" opacity="${opacity}"/>`;
}

/** Three decimals, for scale factors. */
export function k(v: number): string {
  return String(Math.round(v * 1000) / 1000);
}
