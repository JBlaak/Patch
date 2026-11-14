import type { PatchTime } from '../index';
import { dim, mix } from './paint';

/**
 * How a time of day lights a place. Morning, evening and night skies stay close
 * to graphite, warmed or cooled by the hour, so a scene sits quietly on a dark
 * app; the day is bright and sunny, with a blue sky and light edges, so it
 * reads as daytime. Places give their colours as they look in full daylight;
 * `tone` grades them for the hour and pushes distant layers into the haze.
 */
export interface Light {
  time: PatchTime;
  sky: [string, string, string];
  /** The colour distant things fade into. */
  haze: string;
  kind: 'sun' | 'moon';
  color: string;
  x: number;
  y: number;
  glow: number;
  /** How much daylight reaches the ground: below 1 dims the daylight colours, above 1 brightens them. */
  ambient: number;
  /** Which side of a body faces the light. */
  side: 'left' | 'right';
  /** Opacity of the shaded and the lit side of a body. */
  shade: number;
  warm: number;
  stars: boolean;
  mist: boolean;
  rays: boolean;
  /** How dark the edges of the scene fall, 0–1: light by day, deep after dark. */
  vignette: number;
}

export const LIGHTS: Record<PatchTime, Light> = {
  morning: {
    time: 'morning', sky: ['#1b1d22', '#3a3639', '#8e7266'], haze: '#7d6862',
    kind: 'sun', color: '#f6c9a2', x: 150, y: 172, glow: 210, ambient: 0.62,
    side: 'left', shade: 0.2, warm: 0.2, stars: false, mist: true, rays: true, vignette: 0.55,
  },
  day: {
    time: 'day', sky: ['#4f8fc7', '#8cbde0', '#cfe6ee'], haze: '#a8c8d4',
    kind: 'sun', color: '#fff3c8', x: 200, y: 58, glow: 210, ambient: 1.35,
    side: 'left', shade: 0.14, warm: 0.12, stars: false, mist: false, rays: true, vignette: 0.18,
  },
  evening: {
    time: 'evening', sky: ['#16171b', '#382a31', '#9a5b4b'], haze: '#6a4944',
    kind: 'sun', color: '#f39a3c', x: 790, y: 190, glow: 250, ambient: 0.48,
    side: 'right', shade: 0.28, warm: 0.24, stars: false, mist: false, rays: true, vignette: 0.55,
  },
  night: {
    time: 'night', sky: ['#0d0e11', '#121419', '#1c1f25'], haze: '#1c1f25',
    kind: 'moon', color: '#e9e5d8', x: 790, y: 66, glow: 130, ambient: 0.26,
    side: 'right', shade: 0.38, warm: 0.12, stars: true, mist: true, rays: false, vignette: 0.55,
  },
};

/**
 * `base`, a daylight colour, as it looks at this hour `depth` into the scene:
 * 0 is the far distance (all haze), 1 the foreground.
 */
export function tone(light: Light, base: string, depth: number): string {
  const lit = dim(base, light.ambient);
  return mix(light.haze, lit, Math.max(0, Math.min(1, 0.28 + 0.72 * depth)));
}
