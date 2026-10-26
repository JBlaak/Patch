/**
 * Patch's SVG, ported from the approved prototype (Patch.dc.html).
 *
 * Every colour comes from a `patch-f-*` (fill) or `patch-s-*` (stroke) class,
 * which patch.css maps onto the `--patch-*` custom properties, so the host can
 * theme Patch without touching this markup. Accessories and mood bits are all
 * present and hidden; classes on the scene element switch them on. The
 * seasonal and holiday outfits (from Patch.dc.html, "Patch through the year")
 * follow the same rule and the same layering: sky and scenery at the back,
 * props on the ground beside Patch, hats and held things in the body group so
 * they move with it.
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
const BURST = 'M0 -16 V-7 M0 7 V16 M-16 0 H-7 M7 0 H16 M-11 -11 L-5 -5 M5 5 L11 11 M-11 11 L-5 5 M5 -5 L11 -11';
const BAT = 'M-12 0 Q-7 -7 -2 -2 Q0 -6 2 -2 Q7 -7 12 0 Q6 -2 2 3 Q0 1 -2 3 Q-6 -2 -12 0 Z';
const HEART = 'M0 8 C -8 0, -14 -6, -8 -12 C -4 -16, 0 -12, 0 -9 C 0 -12, 4 -16, 8 -12 C 14 -6, 8 0, 0 8 Z';
const LEAF_BIG = 'M0 -7 C 6 -3, 6 3, 0 7 C -6 3, -6 -3, 0 -7 Z';
const LEAF_SMALL = 'M0 -6 C 5 -3, 5 3, 0 6 C -5 3, -5 -3, 0 -6 Z';

export function patchArt(mouth: Mouth): string {
  return `<svg class="patch-svg" width="220" height="200" viewBox="-10 -10 220 200" fill="none" overflow="visible" aria-hidden="true" focusable="false">
<g class="patch-acc patch-acc-rainbow" opacity="0.75" stroke-width="5" stroke-linecap="round">
<path class="patch-s-scarf" d="M2 70 A 36 36 0 0 1 74 70"/>
<path class="patch-s-sun" d="M9 70 A 29 29 0 0 1 67 70"/>
<path class="patch-s-stem" d="M16 70 A 22 22 0 0 1 60 70"/>
<path class="patch-s-rain" d="M23 70 A 15 15 0 0 1 53 70"/>
</g>
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
<g class="patch-acc patch-acc-bunting">
<path class="patch-s-pole" d="M-6 6 Q 100 34, 206 6" stroke-width="1.5"/>
<path class="patch-f-flag-red" d="M8 11 L22 11 L15 25 Z"/>
<path class="patch-f-snow" d="M29 15 L43 15 L36 29 Z"/>
<path class="patch-f-flag-blue" d="M51 18 L65 18 L58 32 Z"/>
<path class="patch-f-orange" d="M72 19 L86 19 L79 33 Z"/>
<path class="patch-f-flag-red" d="M93 20 L107 20 L100 34 Z"/>
<path class="patch-f-snow" d="M114 19 L128 19 L121 33 Z"/>
<path class="patch-f-flag-blue" d="M135 18 L149 18 L142 32 Z"/>
<path class="patch-f-orange" d="M157 15 L171 15 L164 29 Z"/>
<path class="patch-f-flag-red" d="M178 11 L192 11 L185 25 Z"/>
</g>
<g class="patch-acc patch-acc-lights">
<path class="patch-s-pole" d="M-6 30 Q 50 54, 100 36 Q 150 18, 206 40" stroke-width="1.5"/>
<circle class="patch-twinkle patch-f-sun" cx="10" cy="40" r="4"/>
<circle class="patch-twinkle patch-d3 patch-f-flag-red" cx="34" cy="44" r="4"/>
<circle class="patch-twinkle patch-d5 patch-f-stem" cx="58" cy="44" r="4"/>
<circle class="patch-twinkle patch-d2 patch-f-rain" cx="82" cy="40" r="4"/>
<circle class="patch-twinkle patch-d4 patch-f-sun" cx="120" cy="30" r="4"/>
<circle class="patch-twinkle patch-d6 patch-f-flag-red" cx="144" cy="28" r="4"/>
<circle class="patch-twinkle patch-d3 patch-f-stem" cx="168" cy="30" r="4"/>
<circle class="patch-twinkle patch-d5 patch-f-rain" cx="192" cy="36" r="4"/>
</g>
<g class="patch-acc patch-acc-fireworks" stroke-linecap="round">
<g transform="translate(28 30)"><path class="patch-burst patch-s-sun" d="${BURST}" stroke-width="2.5"/></g>
<g transform="translate(176 26)"><path class="patch-burst patch-d3 patch-s-scarf" d="${BURST}" stroke-width="2.5"/></g>
<g transform="translate(150 -2) scale(0.6)"><path class="patch-burst patch-d5 patch-s-rain" d="${BURST}" stroke-width="3"/></g>
<g transform="translate(56 0) scale(0.55)"><path class="patch-burst patch-d6 patch-s-cap" d="${BURST}" stroke-width="3"/></g>
</g>
<g class="patch-acc patch-acc-bats">
<g transform="translate(168 34)"><path class="patch-hover patch-f-pole" d="${BAT}"/></g>
<g transform="translate(30 22) scale(0.7)"><path class="patch-hover patch-d4 patch-f-pole" d="${BAT}"/></g>
</g>
<g class="patch-acc patch-acc-butterfly"><g transform="translate(172 62)"><g class="patch-hover">
<g class="patch-flutter">
<ellipse class="patch-f-cap" cx="-5" cy="-2" rx="6" ry="8"/>
<ellipse class="patch-f-cap" cx="5" cy="-2" rx="6" ry="8"/>
<ellipse class="patch-f-petal" cx="-4" cy="6" rx="4" ry="4"/>
<ellipse class="patch-f-petal" cx="4" cy="6" rx="4" ry="4"/>
</g>
<rect class="patch-f-ink" x="-1" y="-7" width="2" height="15" rx="1"/>
</g></g></g>
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
<g class="patch-acc patch-acc-leaves">
<g transform="translate(22 18)"><g class="patch-leaf"><path class="patch-f-leaf-a" d="${LEAF_BIG}"/></g></g>
<g transform="translate(62 -4)"><g class="patch-leaf patch-d3"><path class="patch-f-leaf-c" d="${LEAF_SMALL}"/></g></g>
<g transform="translate(176 10)"><g class="patch-leaf patch-d5"><path class="patch-f-leaf-b" d="${LEAF_BIG}"/></g></g>
<g transform="translate(194 64)"><g class="patch-leaf patch-d2"><path class="patch-f-leaf-c" d="${LEAF_SMALL}"/></g></g>
<g transform="translate(10 82)"><g class="patch-leaf patch-d7"><path class="patch-f-leaf-b" d="${LEAF_SMALL}"/></g></g>
<g transform="translate(150 -6)"><g class="patch-leaf patch-d8"><path class="patch-f-leaf-a" d="${LEAF_SMALL}"/></g></g>
</g>
<g class="patch-acc patch-acc-petals">
<g transform="translate(24 16)"><ellipse class="patch-petal patch-f-petal" cx="0" cy="0" rx="4" ry="2.5"/></g>
<g transform="translate(64 0)"><ellipse class="patch-petal patch-d3 patch-f-petal" cx="0" cy="0" rx="3.5" ry="2"/></g>
<g transform="translate(178 14)"><ellipse class="patch-petal patch-d5 patch-f-snow" cx="0" cy="0" rx="4" ry="2.5"/></g>
<g transform="translate(194 70)"><ellipse class="patch-petal patch-d2 patch-f-petal" cx="0" cy="0" rx="3.5" ry="2"/></g>
<g transform="translate(10 86)"><ellipse class="patch-petal patch-d7 patch-f-snow" cx="0" cy="0" rx="3.5" ry="2"/></g>
</g>
<g class="patch-acc patch-acc-confetti">
<g transform="translate(20 10) rotate(20)"><rect class="patch-confetti patch-f-sun" x="-2" y="-4" width="4" height="8" rx="1"/></g>
<g transform="translate(48 -4) rotate(-30)"><rect class="patch-confetti patch-d3 patch-f-scarf" x="-2" y="-4" width="4" height="8" rx="1"/></g>
<g transform="translate(88 -8) rotate(60)"><rect class="patch-confetti patch-d5 patch-f-stem" x="-2" y="-4" width="4" height="8" rx="1"/></g>
<g transform="translate(130 -2) rotate(10)"><rect class="patch-confetti patch-d2 patch-f-rain" x="-2" y="-4" width="4" height="8" rx="1"/></g>
<g transform="translate(168 8) rotate(-50)"><rect class="patch-confetti patch-d6 patch-f-cap" x="-2" y="-4" width="4" height="8" rx="1"/></g>
<g transform="translate(194 50) rotate(35)"><rect class="patch-confetti patch-d4 patch-f-sun" x="-2" y="-4" width="4" height="8" rx="1"/></g>
<g transform="translate(8 70) rotate(-15)"><rect class="patch-confetti patch-d7 patch-f-stem" x="-2" y="-4" width="4" height="8" rx="1"/></g>
</g>
<g class="patch-acc patch-acc-pepernoten patch-f-brown">
<circle class="patch-flake" cx="22" cy="28" r="3.5"/>
<circle class="patch-flake patch-d2" cx="50" cy="6" r="3"/>
<circle class="patch-flake patch-d3" cx="174" cy="36" r="3.5"/>
<circle class="patch-flake patch-d4" cx="192" cy="88" r="3"/>
<circle class="patch-flake patch-d5" cx="12" cy="96" r="3"/>
<circle class="patch-flake patch-d6" cx="156" cy="2" r="3"/>
</g>
<g class="patch-acc patch-acc-hearts">
<g transform="translate(30 92) scale(0.7)"><path class="patch-rise patch-f-scarf" d="${HEART}"/></g>
<g transform="translate(172 84) scale(0.6)"><path class="patch-rise patch-d5 patch-f-cheek" d="${HEART}"/></g>
<g transform="translate(150 30) scale(0.5)"><path class="patch-rise patch-d3 patch-f-scarf" d="${HEART}"/></g>
<g transform="translate(48 40) scale(0.5)"><path class="patch-rise patch-d7 patch-f-cheek" d="${HEART}"/></g>
</g>
<g class="patch-acc patch-acc-puddle">
<ellipse class="patch-f-rain" cx="100" cy="174" rx="66" ry="8" opacity="0.3"/>
<ellipse class="patch-ripple patch-s-rain" cx="52" cy="174" rx="7" ry="2.5" stroke-width="1.5"/>
<ellipse class="patch-ripple patch-d4 patch-s-rain" cx="150" cy="175" rx="7" ry="2.5" stroke-width="1.5"/>
</g>
<ellipse class="patch-shadow patch-f-shadow" cx="100" cy="172" rx="40" ry="6"/>
<g class="patch-acc patch-acc-leaves">
<path class="patch-f-leaf-a" d="M58 170 C 62 164, 70 164, 74 170 C 70 174, 62 174, 58 170 Z"/>
<path class="patch-f-leaf-b" d="M132 172 C 136 166, 144 166, 148 172 C 144 176, 136 176, 132 172 Z"/>
</g>
<g class="patch-acc patch-acc-mug">
<path class="patch-steam patch-s-snow" d="M27 142 C 23 137, 31 133, 27 127" stroke-width="2.5" stroke-linecap="round"/>
<path class="patch-steam patch-steam-b patch-s-snow" d="M35 140 C 31 135, 39 131, 35 125" stroke-width="2.5" stroke-linecap="round"/>
<path class="patch-s-scarf" d="M21 154 C 12 154, 12 166, 21 166" stroke-width="3.5" stroke-linecap="round"/>
<path class="patch-f-scarf" d="M20 147 H 42 V 166 C 42 170, 39 172, 35 172 H 27 C 23 172, 20 170, 20 166 Z"/>
<ellipse class="patch-f-ink" cx="31" cy="148.5" rx="9" ry="2"/>
<path class="patch-s-highlight" d="M25 153 V 163" stroke-width="2.5" stroke-linecap="round"/>
</g>
<g class="patch-acc patch-acc-oliebol">
<circle class="patch-f-brown" cx="30" cy="160" r="12"/>
<path class="patch-f-snow" d="M19 156 C 22 146, 38 146, 41 156 C 36 152, 24 152, 19 156 Z"/>
<circle class="patch-f-snow" cx="26" cy="162" r="1.3"/>
<circle class="patch-f-snow" cx="34" cy="165" r="1.3"/>
<circle class="patch-f-snow" cx="31" cy="158" r="1.1"/>
</g>
<g class="patch-acc patch-acc-egg">
<ellipse class="patch-f-sun" cx="32" cy="158" rx="11" ry="14"/>
<path class="patch-s-cap" d="M22 156 L27 151 L32 156 L37 151 L42 156" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<circle class="patch-f-scarf" cx="28" cy="165" r="2"/>
<circle class="patch-f-scarf" cx="36" cy="165" r="2"/>
<path class="patch-s-stem" d="M14 172 L16 164 M20 172 L20 165 M46 172 L48 165 M52 172 L50 164" stroke-width="2" stroke-linecap="round"/>
</g>
<g class="patch-acc patch-acc-pumpkin">
<path class="patch-s-stem" d="M32 146 C 32 142, 34 140, 37 139" stroke-width="3" stroke-linecap="round"/>
<ellipse class="patch-f-orange" cx="32" cy="159" rx="16" ry="13"/>
<path class="patch-s-brown" d="M32 147 V171 M22 149 C 18 156, 18 164, 22 170 M42 149 C 46 156, 46 164, 42 170" stroke-width="1.2" opacity="0.6"/>
<path class="patch-f-ink" d="M24 156 L28 151 L30 157 Z M40 156 L36 151 L34 157 Z M24 162 Q32 170 40 162 L37 163 L35 161 L32 164 L29 161 L27 163 Z"/>
</g>
<g class="patch-acc patch-acc-klomp">
<path class="patch-f-orange" d="M20 158 L32 130 L28 159 Z"/>
<path class="patch-s-stem" d="M32 131 L29 122 M32 131 L37 124" stroke-width="2.5" stroke-linecap="round"/>
<path class="patch-f-wood" d="M8 167 C 6 157, 16 153, 26 155 L44 159 C 53 161, 53 170, 46 172 L15 172 C 10 172, 8 170, 8 167 Z"/>
<ellipse class="patch-f-brown" cx="22" cy="158" rx="9" ry="3"/>
<path class="patch-s-highlight" d="M14 164 L40 166" stroke-width="2" stroke-linecap="round"/>
</g>
<g class="patch-acc patch-acc-tree">
<path class="patch-f-stem" d="M28 116 L44 142 L12 142 Z"/>
<path class="patch-f-stem" d="M28 128 L48 162 L8 162 Z"/>
<rect class="patch-f-brown" x="25" y="162" width="6" height="9"/>
<path class="patch-f-sun" d="M28 106 L30 111 L35 111 L31 114 L33 119 L28 116 L23 119 L25 114 L21 111 L26 111 Z"/>
<circle class="patch-twinkle patch-f-flag-red" cx="22" cy="150" r="2.2"/>
<circle class="patch-twinkle patch-d4 patch-f-sun" cx="34" cy="144" r="2.2"/>
<circle class="patch-twinkle patch-d2 patch-f-rain" cx="30" cy="156" r="2.2"/>
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
<g class="patch-acc patch-acc-ears">
<g transform="rotate(-14 84 72)"><ellipse class="patch-f-body" cx="84" cy="44" rx="10" ry="28"/><ellipse class="patch-f-cheek" cx="84" cy="46" rx="5" ry="20" opacity="0.7"/></g>
<g transform="rotate(14 116 72)"><ellipse class="patch-f-body" cx="116" cy="44" rx="10" ry="28"/><ellipse class="patch-f-cheek" cx="116" cy="46" rx="5" ry="20" opacity="0.7"/></g>
</g>
<g class="patch-acc patch-acc-carton">
<g transform="translate(161 97) rotate(150) scale(1.15) translate(0 12)">
<path class="patch-f-carton patch-s-pole" d="M-8 0 V-12 L-5.5 -15 L-8 -18 V-26 L0 -32 L8 -26 V-17 L5.5 -14 L8 -11 V0 Z" stroke-width="1.2" stroke-linejoin="round"/>
<rect class="patch-f-carton patch-s-pole" x="-2" y="-36" width="4" height="5" rx="1" stroke-width="1.2"/>
<path class="patch-f-orange" d="M-8 -9 H8 V-4 H-8 Z"/>
<path class="patch-s-scarf" d="M4 -29 V-40 L9 -45" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
</g>
</g>
<path class="patch-arm patch-s-body" d="M138 130 Q156 116 160 98" stroke-width="10" stroke-linecap="round"/>
<g class="patch-acc patch-acc-umbrella">
<path class="patch-s-pole" d="M160 100 V 46" stroke-width="3" stroke-linecap="round"/>
<path class="patch-f-rain" d="M124 50 C 128 26, 192 26, 196 50 C 190 44, 184 44, 178 50 C 172 44, 166 44, 160 50 C 154 44, 148 44, 142 50 C 136 44, 130 44, 124 50 Z"/>
</g>
<g class="patch-acc patch-acc-flag">
<path class="patch-s-pole" d="M160 100 V 28" stroke-width="3" stroke-linecap="round"/>
<g class="patch-flag-wave">
<rect class="patch-f-flag-red" x="161" y="30" width="34" height="8"/>
<rect class="patch-f-snow" x="161" y="38" width="34" height="8"/>
<rect class="patch-f-flag-blue" x="161" y="46" width="34" height="8"/>
</g>
</g>
<g class="patch-acc patch-acc-ice-cream">
<path class="patch-f-wood" d="M152 95 L160 117 L168 95 Z"/>
<path class="patch-s-brown" d="M155 100 L164 108 M160 97 L166 103" stroke-width="1.2" opacity="0.7"/>
<circle class="patch-f-petal" cx="160" cy="88" r="10"/>
<circle class="patch-f-snow" cx="156" cy="84" r="2.5" opacity="0.7"/>
</g>
<g class="patch-acc patch-acc-lantern">
<path class="patch-s-brown" d="M158 102 L178 46" stroke-width="3" stroke-linecap="round"/>
<g class="patch-sway">
<path class="patch-s-pole" d="M178 46 L178 60" stroke-width="1.5"/>
<circle class="patch-glow patch-f-sun" cx="178" cy="76" r="24"/>
<ellipse class="patch-f-orange" cx="178" cy="76" rx="13" ry="15"/>
<path class="patch-s-sun" d="M172 63 C 168 70, 168 82, 172 89 M184 63 C 188 70, 188 82, 184 89 M178 61 V91" stroke-width="1.3" opacity="0.8"/>
<rect class="patch-f-scarf" x="171" y="59" width="14" height="4" rx="1"/>
<rect class="patch-f-scarf" x="171" y="89" width="14" height="4" rx="1"/>
</g>
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
<g class="patch-acc patch-acc-flower">
<path class="patch-s-stem" d="M104 70 C 104 62, 106 56, 106 48" stroke-width="3" stroke-linecap="round"/>
<path class="patch-f-stem" d="M105 62 C 112 55, 118 57, 121 59 C 115 64, 110 64, 105 62 Z"/>
<path class="patch-f-tulip" d="M98 36 L100 47 Q106 52 112 47 L114 36 L110 41 L106 34 L102 41 Z"/>
</g>
<g class="patch-acc patch-acc-souwester">
<path class="patch-f-sun" d="M72 84 C 74 58, 126 58, 128 84 Z"/>
<path class="patch-s-highlight" d="M84 66 C 92 62, 104 61, 112 63" stroke-width="3" stroke-linecap="round"/>
<path class="patch-f-sun" d="M54 87 C 72 76, 130 76, 150 91 C 154 95, 150 101, 142 98 C 124 89, 80 87, 62 95 C 54 98, 50 90, 54 87 Z"/>
</g>
<g class="patch-acc patch-acc-beanie">
<path class="patch-f-scarf" d="M66 88 C 64 56, 136 56, 134 88 Z"/>
<path class="patch-s-highlight" d="M84 64 V82 M100 60 V82 M116 64 V82" stroke-width="2.5" stroke-linecap="round" opacity="0.6"/>
<path class="patch-f-snow" d="M63 82 C 82 76, 118 76, 137 82 L137 92 C 118 86, 82 86, 63 92 Z"/>
<circle class="patch-f-snow" cx="100" cy="54" r="9"/>
</g>
<g class="patch-acc patch-acc-party-hat">
<path class="patch-f-cap" d="M82 76 L104 24 L122 72 Z"/>
<path class="patch-s-sun" d="M89 60 L117 56 M96 44 L112 41" stroke-width="3.5" stroke-linecap="round"/>
<circle class="patch-f-sun" cx="104" cy="24" r="5.5"/>
</g>
<g class="patch-acc patch-acc-jester">
<path class="patch-f-flag-red" d="M72 86 L50 56 L92 80 Z"/>
<path class="patch-f-stem" d="M108 80 L150 56 L128 86 Z"/>
<path class="patch-f-sun" d="M88 82 L100 36 L112 82 Z"/>
<path class="patch-f-snow" d="M66 84 C 84 76, 116 76, 134 84 L134 92 C 116 86, 84 86, 66 92 Z"/>
<circle class="patch-f-sun" cx="50" cy="56" r="4.5"/>
<circle class="patch-f-flag-red" cx="100" cy="35" r="4.5"/>
<circle class="patch-f-sun" cx="150" cy="56" r="4.5"/>
</g>
<g class="patch-acc patch-acc-crown">
<path class="patch-f-sun" d="M74 82 L70 52 L87 66 L100 44 L113 66 L130 52 L126 82 C 110 77, 90 77, 74 82 Z"/>
<circle class="patch-f-sun" cx="70" cy="51" r="4"/>
<circle class="patch-f-sun" cx="100" cy="43" r="4"/>
<circle class="patch-f-sun" cx="130" cy="51" r="4"/>
<circle class="patch-f-flag-red" cx="100" cy="68" r="3.5"/>
<circle class="patch-f-flag-blue" cx="85" cy="74" r="2.8"/>
<circle class="patch-f-flag-blue" cx="115" cy="74" r="2.8"/>
</g>
<g class="patch-acc patch-acc-witch-hat">
<path class="patch-f-cap" d="M80 78 C 88 60, 98 40, 116 24 C 112 44, 116 62, 122 78 Z"/>
<path class="patch-f-sun" d="M81 72 C 94 76, 108 76, 121 72 L122 78 C 108 81, 94 81, 80 78 Z"/>
<ellipse class="patch-f-cap" cx="101" cy="80" rx="42" ry="6"/>
</g>
<g class="patch-acc patch-acc-mitre">
<path class="patch-f-mitre" d="M74 84 C 72 62, 84 44, 100 28 C 116 44, 128 62, 126 84 C 110 78, 90 78, 74 84 Z"/>
<path class="patch-f-sun" d="M73 82 C 90 76, 110 76, 127 82 L127 90 C 110 84, 90 84, 73 90 Z"/>
<path class="patch-s-sun" d="M100 40 V76 M91 54 H109" stroke-width="4.5" stroke-linecap="round"/>
</g>
<g class="patch-acc patch-acc-santa-hat">
<path class="patch-f-flag-red" d="M132 86 C 130 62, 102 50, 80 56 C 62 62, 52 80, 48 98 C 54 96, 58 92, 62 88 C 66 80, 72 78, 74 84 Z"/>
<path class="patch-f-snow" d="M62 83 C 82 75, 118 75, 138 83 C 142 85, 142 93, 138 94 C 118 86, 82 86, 62 94 C 58 93, 58 85, 62 83 Z"/>
<circle class="patch-f-snow" cx="47" cy="100" r="7.5"/>
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
