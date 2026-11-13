/**
 * The manager Patches' SVG: Patch's own body and face, dressed for a job.
 *
 * As in art.ts, every colour comes from a `patch-mgr-f-*` (fill) or
 * `patch-mgr-s-*` (stroke) class that manager.css maps onto `--patch-*`
 * custom properties. Every pose is in the markup; a part drawn only in some
 * poses carries `patch-mgr-for-<pose>` classes and manager.css shows it when
 * the scene is in one of them. Nothing here is user-supplied.
 *
 * Layering, back to front: what stands or dangles around Patch (the jar, the
 * spiders, the ticket held up high and the arms holding it), the shadow, then
 * the body group, which bobs: the body, what Patch wears, its face, its arms
 * and what it holds. Hats sit above the eyes and the satchel and the whistle
 * hang on the belly, so no prop covers the face; the spectacles are part of it.
 */

import type { ManagerKind, ManagerState } from './scene';

const BODY = 'M50 138 C 46 96, 72 68, 100 68 C 132 68, 152 96, 148 138 C 146 158, 128 166, 100 166 C 70 166, 52 158, 50 138 Z';
const SMILE = 'M93 134 Q100 140 107 134';
const WORRY = 'M94 138 Q100 133 106 138';

function only(...poses: ManagerState[]): string {
  return `patch-mgr-part ${poses.map((p) => `patch-mgr-for-${p}`).join(' ')}`;
}

function arm(d: string, cls = ''): string {
  return `<path class="patch-mgr-arm patch-mgr-s-body ${cls}" d="${d}" stroke-width="10" stroke-linecap="round"/>`;
}

/** A spider centred on (0, 0), about 36 wide with its legs out. */
function spider(): string {
  const legs = [-1, 1]
    .flatMap((side) =>
      [0, 1, 2, 3].map((i) => {
        const a = (i - 1.5) * 2;
        const ex = side * (16 + (i % 2) * 2);
        const ey = -6 + i * 5;
        return `M${side * 3.6} ${a} Q${side * 9} ${ey - 5} ${ex} ${ey}`;
      }),
    )
    .join(' ');
  return `<g class="patch-mgr-spider-legs"><path class="patch-mgr-s-spider" d="${legs}" stroke-width="2" stroke-linecap="round"/></g>
<ellipse class="patch-mgr-f-spider" cx="0" cy="2" rx="8" ry="9"/>
<circle class="patch-mgr-f-spider" cx="0" cy="-7" r="5.5"/>
<circle class="patch-mgr-f-spider-eye" cx="-2" cy="-8" r="1.4"/>
<circle class="patch-mgr-f-spider-eye" cx="2" cy="-8" r="1.4"/>`;
}

/** A spider asleep: curled up, eyes shut. */
function sleepingSpider(): string {
  return `<path class="patch-mgr-s-spider" d="M-7 4 Q-13 0 -14 6 M-6 7 Q-12 8 -12 12 M7 4 Q13 0 14 6 M6 7 Q12 8 12 12" stroke-width="2" stroke-linecap="round"/>
<ellipse class="patch-mgr-f-spider" cx="0" cy="5" rx="8" ry="7"/>
<circle class="patch-mgr-f-spider" cx="0" cy="-3" r="5"/>
<path class="patch-mgr-s-spider-eye" d="M-3.5 -3.5 Q-2 -2.5 -0.6 -3.5 M0.6 -3.5 Q2 -2.5 3.5 -3.5" stroke-width="1.1" stroke-linecap="round"/>`;
}

function dangling(x: number, top: number, length: number, scale: number, delay = ''): string {
  return `<g class="patch-mgr-dangle ${delay}">
<path class="patch-mgr-s-thread" d="M${x} ${top} V${top + length}" stroke-width="1.2"/>
<g transform="translate(${x} ${top + length + 11 * scale}) scale(${scale})">${spider()}</g>
</g>`;
}

function face(extra: string, worries = false): string {
  return `<circle class="patch-mgr-f-cheek" cx="76" cy="134" r="5" opacity="0.35"/>
<circle class="patch-mgr-f-cheek" cx="124" cy="134" r="5" opacity="0.35"/>
<g class="patch-mgr-look">
<ellipse class="patch-mgr-eye patch-mgr-f-ink" cx="86" cy="118" rx="5" ry="7"/>
<ellipse class="patch-mgr-eye patch-mgr-f-ink" cx="114" cy="118" rx="5" ry="7"/>
<circle class="patch-mgr-f-catchlight" cx="88" cy="115" r="1.6"/>
<circle class="patch-mgr-f-catchlight" cx="116" cy="115" r="1.6"/>
${extra}
</g>
<path class="patch-mgr-smile patch-mgr-s-ink" d="${SMILE}" stroke-width="3" stroke-linecap="round"/>
${worries ? `<path class="${only('urgent')} patch-mgr-s-ink" d="${WORRY}" stroke-width="3" stroke-linecap="round"/>` : ''}`;
}

/* ---------- Bug manager: the explorer ---------- */

function bugBack(): string {
  return `<g class="${only('calm')}">
<g transform="translate(178 132)">
<rect class="patch-mgr-f-glass patch-mgr-s-glass-edge" x="-20" y="-24" width="40" height="44" rx="8" stroke-width="2"/>
<g transform="translate(0 6) scale(0.85)">${sleepingSpider()}</g>
<path class="patch-mgr-s-glass-shine" d="M-13 -14 V4" stroke-width="2.5" stroke-linecap="round"/>
<rect class="patch-mgr-f-lid" x="-22" y="-31" width="44" height="8" rx="3"/>
<g class="patch-mgr-zs patch-mgr-f-lid">
<text class="patch-mgr-z" x="12" y="-38" font-size="10" font-weight="800">z</text>
<text class="patch-mgr-z patch-mgr-z-b" x="12" y="-38" font-size="13" font-weight="800">z</text>
</g>
</g>
</g>
<g class="${only('unread')}">${dangling(176, -14, 62, 0.9)}</g>
<g class="${only('urgent')}">
${dangling(178, -14, 50, 0.9)}
${dangling(22, -14, 34, 0.7, 'patch-mgr-d2')}
</g>`;
}

function bugFront(): string {
  return `<g class="${only('urgent')}">
<g class="patch-mgr-scurry"><g transform="translate(186 160) scale(0.6)">${spider()}</g></g>
<g class="patch-mgr-scurry patch-mgr-d2"><g transform="translate(14 162) scale(0.55)">${spider()}</g></g>
<g class="patch-mgr-scurry patch-mgr-d3"><g transform="translate(162 170) scale(0.45)">${spider()}</g></g>
</g>`;
}

function bugBody(): string {
  return `${face(`<g class="${only('urgent')}">
<path class="patch-mgr-s-ink" d="M81 108 L91 104 M109 104 L119 108" stroke-width="2.5" stroke-linecap="round"/>
</g>`, true)}
<path class="${only('urgent')} patch-mgr-f-sweat" d="M140 96 C 136 102, 136 106, 140 106 C 144 106, 144 102, 140 96 Z"/>
<path class="patch-mgr-s-strap" d="M58 132 Q88 158 124 150" stroke-width="4" stroke-linecap="round"/>
<g transform="translate(120 140) rotate(-8)">
<rect class="patch-mgr-f-satchel" x="0" y="0" width="24" height="18" rx="4"/>
<path class="patch-mgr-s-strap" d="M0 6 H24" stroke-width="2"/>
<rect class="patch-mgr-f-buckle" x="10" y="4" width="5" height="5" rx="1"/>
</g>
<g class="patch-mgr-helmet">
<path class="patch-mgr-f-helmet" d="M68 86 C 66 54, 134 54, 132 86 Z"/>
<path class="patch-mgr-s-highlight" d="M78 66 C 88 60, 104 58, 114 61" stroke-width="3" stroke-linecap="round"/>
<path class="patch-mgr-s-helmet-band" d="M68 80 C 88 76, 112 76, 132 80" stroke-width="5"/>
<ellipse class="patch-mgr-f-helmet-brim" cx="100" cy="87" rx="47" ry="7"/>
<circle class="patch-mgr-f-helmet-band" cx="100" cy="55" r="3"/>
</g>
<g class="${only('calm')}">
${arm('M60 132 Q46 140 42 150')}
${arm('M140 132 Q150 138 152 148')}
</g>
<g class="${only('unread')}">
${arm('M60 132 Q46 140 42 150')}
${arm('M138 128 Q152 112 158 102')}
<path class="patch-mgr-s-strap" d="M158 102 L164 92" stroke-width="5" stroke-linecap="round"/>
<circle class="patch-mgr-f-glass patch-mgr-s-rim" cx="170" cy="82" r="11" stroke-width="3"/>
<path class="patch-mgr-s-glass-shine" d="M164 77 Q167 74 171 74" stroke-width="2" stroke-linecap="round"/>
</g>
<g class="${only('urgent')}">
${arm('M60 128 Q44 116 38 102', 'patch-mgr-flail')}
${arm('M140 128 Q156 116 162 102', 'patch-mgr-flail patch-mgr-d2')}
</g>`;
}

/* ---------- Issue manager: the bookkeeper ---------- */

function issueBack(): string {
  return `<g class="${only('unread')}">
<g class="patch-mgr-raise">
<g transform="translate(100 16) rotate(-4)">
<rect class="patch-mgr-f-paper patch-mgr-s-paper-edge" x="-38" y="-30" width="76" height="56" rx="5" stroke-width="1.5"/>
<path class="patch-mgr-s-paper-line" d="M-26 -14 H26 M-26 -3 H26 M-26 8 H12" stroke-width="2.4" stroke-linecap="round"/>
<circle class="patch-mgr-f-ticket-dot" cx="24" cy="-20" r="5"/>
</g>
${arm('M64 112 Q52 80 66 44')}
${arm('M136 112 Q148 80 134 44')}
</g>
</g>`;
}

function issueBody(): string {
  return `${face(`<g class="patch-mgr-specs">
<circle class="patch-mgr-f-lens patch-mgr-s-ink" cx="86" cy="118" r="9.5" stroke-width="2.2"/>
<circle class="patch-mgr-f-lens patch-mgr-s-ink" cx="114" cy="118" r="9.5" stroke-width="2.2"/>
<path class="patch-mgr-s-ink" d="M95.5 118 Q100 114 104.5 118 M76.5 116 L70 112 M123.5 116 L130 112" stroke-width="2.2" stroke-linecap="round"/>
</g>`)}
<g class="patch-mgr-visor">
<path class="patch-mgr-s-visor-band" d="M62 94 C 80 84, 120 84, 138 94" stroke-width="6" stroke-linecap="round"/>
<path class="patch-mgr-f-visor" d="M70 94 C 86 106, 114 106, 130 94 C 114 99, 86 99, 70 94 Z"/>
</g>
<g class="${only('calm')}">
${arm('M60 132 Q46 140 42 150')}
<g transform="translate(144 112) rotate(10)">
<rect class="patch-mgr-f-ledger" x="-2" y="0" width="30" height="38" rx="3"/>
<rect class="patch-mgr-f-ledger-spine" x="-2" y="0" width="6" height="38" rx="2"/>
<rect class="patch-mgr-f-paper" x="9" y="9" width="14" height="8" rx="1.5"/>
<path class="patch-mgr-s-paper" d="M28 4 V34" stroke-width="2" opacity="0.7"/>
</g>
${arm('M138 132 Q152 140 156 146')}
</g>`;
}

/** Tucked behind Patch's head, so drawn before the body. */
function pencil(): string {
  return `<g transform="translate(138 82) rotate(38)">
<rect class="patch-mgr-f-pencil" x="-3" y="-16" width="6" height="24" rx="1"/>
<path class="patch-mgr-f-pencil-wood" d="M-3 8 L0 15 L3 8 Z"/>
<path class="patch-mgr-f-ink" d="M-1 13 L0 15 L1 13 Z"/>
<rect class="patch-mgr-f-eraser" x="-3" y="-19" width="6" height="4" rx="1"/>
</g>`;
}

/* ---------- Merge manager: the signaller ---------- */

/** A signal flag on its pole, held at (0, 0): furled and pointing down, or flying from the top. */
function flag(colour: 'go' | 'ask', furled: boolean): string {
  if (furled) {
    return `<path class="patch-mgr-s-flag-pole" d="M0 0 V34" stroke-width="4" stroke-linecap="round"/>
<path class="patch-mgr-f-flag-${colour}" d="M1 2 C 13 8, 11 20, 2 28 Z"/>`;
  }
  return `<path class="patch-mgr-s-flag-pole" d="M0 0 V-46" stroke-width="4" stroke-linecap="round"/>
<path class="patch-mgr-flutter patch-mgr-f-flag-${colour}" d="M2 -46 H30 Q26 -38 30 -30 H2 Z"/>`;
}

function radio(): string {
  return `<g transform="translate(136 96) rotate(-12)">
<path class="patch-mgr-signal patch-mgr-s-signal" d="M15 -15 Q19 -11 15 -7 M19 -19 Q26 -11 19 -3" stroke-width="2" stroke-linecap="round"/>
<path class="patch-mgr-s-radio" d="M10 0 V-12" stroke-width="2.5" stroke-linecap="round"/>
<rect class="patch-mgr-f-radio" x="0" y="0" width="13" height="24" rx="3"/>
<rect class="patch-mgr-f-radio-screen" x="3" y="4" width="7" height="6" rx="1"/>
</g>`;
}

function mergeBody(): string {
  return `${face(`<g class="${only('moving', 'needsYou')}">
<path class="patch-mgr-s-ink" d="M81 121 Q86 113 91 121 M109 121 Q114 113 119 121" stroke-width="3" stroke-linecap="round"/>
</g>`)}
<path class="patch-mgr-s-lanyard" d="M84 148 Q100 157 116 148" stroke-width="2.5" stroke-linecap="round"/>
<rect class="patch-mgr-f-whistle" x="95" y="151" width="10" height="11" rx="2.5"/>
<circle class="patch-mgr-f-ink" cx="100" cy="158" r="1.6"/>
<g class="patch-mgr-cap">
<path class="patch-mgr-f-cap" d="M64 92 C 66 64, 134 64, 136 92 Z"/>
<rect class="patch-mgr-f-cap-band" x="64" y="84" width="72" height="7"/>
<ellipse class="patch-mgr-f-cap-peak" cx="100" cy="93" rx="42" ry="5.5"/>
<circle class="patch-mgr-f-cap-band" cx="100" cy="76" r="4"/>
</g>
${arm('M60 132 Q46 140 42 150')}
<g class="${only('idle')}">
${arm('M140 132 Q154 140 158 150')}
<g transform="translate(160 140) rotate(-8)">${flag('go', true)}</g>
</g>
<g class="${only('moving')}">
<g class="patch-mgr-wave">
${arm('M140 124 Q156 104 160 88')}
<g transform="translate(160 88) rotate(6)">${flag('go', false)}</g>
</g>
</g>
<g class="${only('needsYou')}">
<g class="patch-mgr-raise">
${arm('M140 126 Q158 98 152 72')}
<g transform="translate(152 72) rotate(4)">${flag('ask', false)}</g>
</g>
</g>
<g class="${only('remote')}">
${radio()}
${arm('M140 132 Q156 124 148 116')}
</g>`;
}

interface Outfit {
  /** Behind the shadow and the body. */
  back?: () => string;
  /** In the bobbing group, behind the body. */
  behind?: () => string;
  /** In the bobbing group, over the body. */
  body: () => string;
  /** In front of everything. */
  front?: () => string;
}

const OUTFITS: Record<ManagerKind, Outfit> = {
  bug: { back: bugBack, body: bugBody, front: bugFront },
  issue: { back: issueBack, behind: pencil, body: issueBody },
  merge: { body: mergeBody },
};

export function managerArt(kind: ManagerKind): string {
  const outfit = OUTFITS[kind];
  return `<svg class="patch-mgr-svg" viewBox="-10 -24 220 214" fill="none" overflow="visible" aria-hidden="true" focusable="false">
${outfit.back?.() ?? ''}
<ellipse class="patch-mgr-f-shadow" cx="100" cy="170" rx="46" ry="6"/>
<g class="patch-mgr-bob">
${outfit.behind?.() ?? ''}
<path class="patch-mgr-f-body" d="${BODY}"/>
<path class="patch-mgr-s-highlight" d="M68 96 C 74 84, 86 78, 96 78" stroke-width="5" stroke-linecap="round"/>
${outfit.body()}
</g>
${outfit.front?.() ?? ''}
</svg>`;
}
