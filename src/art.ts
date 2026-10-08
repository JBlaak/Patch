/**
 * Patch's SVG, ported from the approved prototype (Patch.dc.html).
 *
 * Every colour comes from a `patch-f-*` (fill) or `patch-s-*` (stroke) class,
 * which patch.css maps onto the `--patch-*` custom properties, so the host can
 * theme Patch without touching this markup. Accessories and mood bits are all
 * present and hidden; classes on the scene element switch them on.
 *
 * Nothing here is user-supplied: the only parameter is one of the three mouth
 * shapes below.
 */

export const MOUTH_SMILE = 'M93 134 Q100 140 107 134';
export const MOUTH_FLAT = 'M94 136 L106 136';
export const MOUTH_FROWN = 'M93 138 Q100 133 107 138';

export type Mouth = typeof MOUTH_SMILE | typeof MOUTH_FLAT | typeof MOUTH_FROWN;

const SPARK_BIG = 'M0 -7 L2 -2 L7 0 L2 2 L0 7 L-2 2 L-7 0 L-2 -2 Z';
const SPARK_SMALL = 'M0 -5 L1.5 -1.5 L5 0 L1.5 1.5 L0 5 L-1.5 1.5 L-5 0 L-1.5 -1.5 Z';

export function patchArt(mouth: Mouth): string {
  return `<svg class="patch-svg" width="220" height="200" viewBox="-10 -10 220 200" fill="none" overflow="visible" aria-hidden="true" focusable="false">
<g class="patch-acc patch-acc-sun">
<circle class="patch-f-sun" cx="24" cy="30" r="12"/>
<path class="patch-s-sun" d="M24 8 V12 M24 48 V52 M2 30 H6 M42 30 H46 M8.5 14.5 L11.3 17.3 M36.7 42.7 L39.5 45.5 M8.5 45.5 L11.3 42.7 M36.7 17.3 L39.5 14.5" stroke-width="3" stroke-linecap="round"/>
</g>
<g class="patch-acc patch-acc-cloud">
<path class="patch-f-cloud" d="M18 44 C 8 44, 6 30, 18 28 C 20 16, 38 14, 42 26 C 52 22, 60 32, 54 40 C 54 44, 50 44, 46 44 Z"/>
</g>
<g class="patch-acc patch-acc-moon">
<path class="patch-f-sun" d="M170 14 A 14 14 0 1 0 182 34 A 11 11 0 1 1 170 14 Z"/>
<circle class="patch-star patch-f-snow" cx="18" cy="24" r="2"/>
<circle class="patch-star patch-star-b patch-f-snow" cx="42" cy="8" r="1.5"/>
<circle class="patch-star patch-star-c patch-f-snow" cx="150" cy="44" r="1.5"/>
</g>
<g class="patch-acc patch-acc-rain patch-s-rain" stroke-width="2" stroke-linecap="round">
<path class="patch-drop" d="M20 40 l-3 8"/>
<path class="patch-drop patch-d2" d="M44 20 l-3 8"/>
<path class="patch-drop patch-d3" d="M30 90 l-3 8"/>
<path class="patch-drop patch-d4" d="M180 120 l-3 8"/>
<path class="patch-drop patch-d5" d="M190 70 l-3 8"/>
<path class="patch-drop patch-d6" d="M10 120 l-3 8"/>
</g>
<g class="patch-acc patch-acc-snow patch-f-snow">
<circle class="patch-flake" cx="20" cy="30" r="2.5"/>
<circle class="patch-flake patch-d2" cx="46" cy="10" r="2"/>
<circle class="patch-flake patch-d3" cx="176" cy="40" r="2.5"/>
<circle class="patch-flake patch-d4" cx="190" cy="90" r="2"/>
<circle class="patch-flake patch-d5" cx="12" cy="100" r="2"/>
<circle class="patch-flake patch-d6" cx="160" cy="4" r="2"/>
</g>
<ellipse class="patch-shadow patch-f-shadow" cx="100" cy="172" rx="40" ry="6"/>
<g class="patch-acc patch-acc-mug">
<path class="patch-steam patch-s-snow" d="M27 142 C 23 137, 31 133, 27 127" stroke-width="2.5" stroke-linecap="round"/>
<path class="patch-steam patch-steam-b patch-s-snow" d="M35 140 C 31 135, 39 131, 35 125" stroke-width="2.5" stroke-linecap="round"/>
<path class="patch-s-scarf" d="M21 154 C 12 154, 12 166, 21 166" stroke-width="3.5" stroke-linecap="round"/>
<path class="patch-f-scarf" d="M20 147 H 42 V 166 C 42 170, 39 172, 35 172 H 27 C 23 172, 20 170, 20 166 Z"/>
<ellipse class="patch-f-ink" cx="31" cy="148.5" rx="9" ry="2"/>
<path class="patch-s-highlight" d="M25 153 V 163" stroke-width="2.5" stroke-linecap="round"/>
</g>
<path class="patch-heart patch-f-cheek" d="M100 60 C 92 52, 86 46, 92 40 C 96 36, 100 40, 100 43 C 100 40, 104 36, 108 40 C 114 46, 108 52, 100 60 Z"/>
<g transform="translate(52 72)"><path class="patch-spark patch-f-sun" d="${SPARK_BIG}"/></g>
<g transform="translate(156 62)"><path class="patch-spark patch-spark-b patch-f-sun" d="${SPARK_BIG}"/></g>
<g transform="translate(36 132)"><path class="patch-spark patch-spark-c patch-f-sun" d="${SPARK_SMALL}"/></g>
<g transform="translate(170 140)"><path class="patch-spark patch-spark-b patch-f-sun" d="${SPARK_SMALL}"/></g>
<g class="patch-zs patch-f-body">
<text class="patch-z" x="146" y="78" font-size="12">z</text>
<text class="patch-z patch-z-b" x="146" y="78" font-size="15">z</text>
<text class="patch-z patch-z-c" x="146" y="78" font-size="18">Z</text>
</g>
<g class="patch-move">
<g class="patch-idle">
<path class="patch-arm patch-s-body" d="M138 130 Q156 116 160 98" stroke-width="10" stroke-linecap="round"/>
<g class="patch-acc patch-acc-umbrella">
<path class="patch-s-pole" d="M160 100 V 46" stroke-width="3" stroke-linecap="round"/>
<path class="patch-f-rain" d="M124 50 C 128 26, 192 26, 196 50 C 190 44, 184 44, 178 50 C 172 44, 166 44, 160 50 C 154 44, 148 44, 142 50 C 136 44, 130 44, 124 50 Z"/>
</g>
<path class="patch-body patch-f-body" d="M50 138 C 46 96, 72 68, 100 68 C 132 68, 152 96, 148 138 C 146 158, 128 166, 100 166 C 70 166, 52 158, 50 138 Z"/>
<path class="patch-s-highlight" d="M68 96 C 74 84, 86 78, 96 78" stroke-width="5" stroke-linecap="round"/>
<g class="patch-acc patch-acc-scarf patch-s-scarf" stroke-linecap="round">
<path d="M56 146 Q100 162 144 146" stroke-width="9"/>
<path d="M124 154 L130 176" stroke-width="8"/>
</g>
<g class="patch-acc patch-acc-cap">
<path class="patch-f-cap" d="M70 82 C 82 66, 116 62, 132 80 C 140 64, 150 52, 162 54 C 150 62, 142 76, 136 88 C 116 78, 88 78, 70 82 Z"/>
<circle class="patch-f-snow" cx="164" cy="54" r="7"/>
</g>
<circle class="patch-cheek patch-f-cheek" cx="76" cy="134" r="5" opacity="0.35"/>
<circle class="patch-cheek patch-f-cheek" cx="124" cy="134" r="5" opacity="0.35"/>
<g class="patch-mood patch-mood-blush patch-f-cheek">
<circle cx="76" cy="134" r="6" opacity="0.6"/>
<circle cx="124" cy="134" r="6" opacity="0.6"/>
</g>
<path class="patch-mood patch-mood-sweat patch-f-rain" d="M138 88 C 134 94, 134 98, 138 98 C 142 98, 142 94, 138 88 Z"/>
<g class="patch-eyes">
<ellipse class="patch-eye patch-f-ink" cx="86" cy="118" rx="5" ry="7"/>
<ellipse class="patch-eye patch-f-ink" cx="114" cy="118" rx="5" ry="7"/>
<g class="patch-mood patch-mood-lids patch-f-body">
<rect x="79" y="109" width="14" height="9"/>
<rect x="107" y="109" width="14" height="9"/>
</g>
<g class="patch-mood patch-mood-brows patch-s-ink" stroke-width="2.5" stroke-linecap="round">
<path d="M80 106 L91 102"/>
<path d="M109 102 L120 106"/>
</g>
<g class="patch-acc patch-acc-shades">
<rect class="patch-f-ink" x="76" y="111" width="20" height="13" rx="5"/>
<rect class="patch-f-ink" x="104" y="111" width="20" height="13" rx="5"/>
<path class="patch-s-ink" d="M96 115 H104" stroke-width="3"/>
<path class="patch-s-highlight" d="M80 114 L86 114" stroke-width="2" stroke-linecap="round"/>
</g>
<path class="patch-happy patch-s-ink" d="M81 121 Q86 113 91 121" stroke-width="3" stroke-linecap="round"/>
<path class="patch-happy patch-s-ink" d="M109 121 Q114 113 119 121" stroke-width="3" stroke-linecap="round"/>
<path class="patch-smile patch-s-ink" d="${mouth}" stroke-width="3" stroke-linecap="round"/>
<ellipse class="patch-o patch-f-ink" cx="100" cy="137" rx="4" ry="5"/>
</g>
</g>
</g>
</svg>`;
}
