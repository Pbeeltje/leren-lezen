// Vijver van het kikkerkoor, zelfde soort tekening als de dino-wei en het herfstbos:
// lagen (oever, water, riet) als inline SVG. Zie .kikker-vijver in screens.css.

export const WATER = `
<svg viewBox="0 0 1000 420" preserveAspectRatio="none" aria-hidden="true">
  <defs>
    <linearGradient id="kikkerkoor-lucht" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#d7f4ff"/>
      <stop offset="0.28" stop-color="#8ecff2"/>
      <stop offset="0.46" stop-color="#3eae86"/>
      <stop offset="0.72" stop-color="#1b7a56"/>
      <stop offset="1" stop-color="#0d4a32"/>
    </linearGradient>
    <linearGradient id="kikkerkoor-oever" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#e4f7c4"/>
      <stop offset="1" stop-color="#7ec45e"/>
    </linearGradient>
  </defs>
  <rect width="1000" height="420" fill="url(#kikkerkoor-lucht)"/>
  <path d="M0 158 C160 126 300 150 460 140 C640 128 760 164 900 146 C960 138 990 148 1000 152 L1000 204 L0 204 Z" fill="url(#kikkerkoor-oever)"/>
  <path d="M0 158 C160 126 300 150 460 140 C640 128 760 164 900 146 C960 138 990 148 1000 152" fill="none" stroke="#f7fde8" stroke-width="3" opacity="0.9" vector-effect="non-scaling-stroke"/>
  <path d="M0 268 C180 248 380 272 560 256 C760 238 880 266 1000 252 L1000 420 L0 420 Z" fill="#0c3e28" opacity="0.14"/>
  <g class="kikker-glans" fill="none" stroke="#ffffff" stroke-linecap="round" vector-effect="non-scaling-stroke">
    <path d="M70 274 h40" stroke-width="2.4"/>
    <path d="M210 304 h22" stroke-width="2"/>
    <path d="M360 262 h48" stroke-width="2.6"/>
    <path d="M530 292 h18" stroke-width="1.8"/>
    <path d="M640 268 h36" stroke-width="2.2"/>
    <path d="M820 300 h26" stroke-width="2"/>
    <path d="M140 332 h16" stroke-width="1.6"/>
    <path d="M470 324 h30" stroke-width="2"/>
    <path d="M910 246 h20" stroke-width="1.8"/>
  </g>
</svg>`;

const RIET_HALMEN = `
  <path d="M38 228 C36 160 24 96 16 28 C26 88 34 156 48 228 Z" fill="#3ea24c" stroke="#145c28" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M72 228 C76 150 58 78 70 8 C82 72 86 156 84 228 Z" fill="#2d8740" stroke="#145c28" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M108 228 C102 158 122 92 112 34 C124 96 116 164 118 228 Z" fill="#57b85a" stroke="#145c28" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M74 96 C108 82 132 58 122 44 C134 68 108 92 74 104 Z" fill="#7dce6a" stroke="#145c28" stroke-width="2" stroke-linejoin="round"/>
  <path d="M112 118 C138 108 154 86 146 76 C156 96 136 116 112 126 Z" fill="#3ea24c" stroke="#145c28" stroke-width="1.8" stroke-linejoin="round"/>`;

const LISDODDE = `
  <path d="M24 228 C22 168 16 118 20 86" fill="none" stroke="#1d6a30" stroke-width="3.4" stroke-linecap="round"/>
  <rect x="13" y="48" width="14" height="40" rx="7" fill="#8a4e22" stroke="#4e2c10" stroke-width="1.6"/>`;

export const rietSvg = (lisdodde = false): string => `
<svg viewBox="0 0 150 230" aria-hidden="true">
  ${RIET_HALMEN}
  ${lisdodde ? LISDODDE : ''}
</svg>`;

// Blad onder een kikker. Kleur via CSS (current note), nerf en inkeping zitten in het pad.
export const lelieSvg = (): string => `
<svg viewBox="0 0 140 96" aria-hidden="true">
  <ellipse cx="70" cy="68" rx="54" ry="13" fill="#06341c" opacity="0.18"/>
  <path class="kikker-blad__dik" transform="translate(0 5)" d="M70 12 C34 8 6 28 8 52 C10 76 36 90 70 86 C104 90 130 76 132 52 C134 28 106 8 70 12 Z M70 12 L66 16 L70 38 L74 16 Z"/>
  <path class="kikker-blad__blad" d="M70 12 C34 8 6 28 8 52 C10 76 36 90 70 86 C104 90 130 76 132 52 C134 28 106 8 70 12 Z M70 12 L66 16 L70 38 L74 16 Z"/>
  <path class="kikker-blad__nerf" d="M70 46 L28 40 M70 46 L112 40 M70 46 L34 68 M70 46 L106 68 M70 46 L48 28 M70 46 L92 28"/>
  <ellipse class="kikker-blad__glans" cx="46" cy="36" rx="18" ry="8"/>
</svg>`;

// Verre blaadjes staan los van het water-SVG: dat SVG rekt mee (preserveAspectRatio none)
// en zou een rond blad op een telefoon tot een staaf trekken.
const PAD = `M0 -20 C-30 -22 -40 -4 -38 16 C-34 32 -16 38 0 34 C16 38 34 32 38 16 C40 -4 30 -22 0 -20 Z M0 -20 L-2.4 -16 L0 -2 L2.4 -16 Z`;

export const verPadSvg = (bloem: boolean): string => `
<svg viewBox="-42 -26 84 68" aria-hidden="true">
  <path d="${PAD}" fill="#2f9a52" stroke="#146434" stroke-width="1.6" fill-rule="evenodd"/>
  <path d="M0 4 L0 -14 M0 4 L-18 -2 M0 4 L18 -2 M0 4 L-10 20 M0 4 L10 20" fill="none" stroke="#146434" stroke-width="1.2" stroke-linecap="round" opacity="0.45"/>
  ${bloem ? `<circle cy="-2" r="7" fill="#ffb3d0"/><circle cx="-2.6" cy="-3.4" r="2.6" fill="#fff"/><circle cx="2.8" cy="-2.8" r="2.6" fill="#fff"/><circle cy="1" r="2.5" fill="#fff"/><circle cy="-2" r="2" fill="#ffe14a"/>` : ''}
</svg>`;

// Libel van boven: dun blauw lijf, vier doorzichtige vleugels die samen klapperen.
export const LIBEL = `
<svg viewBox="0 0 90 44" aria-hidden="true">
  <g class="kikker-vleugel" fill="#eaf8ff" fill-opacity="0.8" stroke="#7ab8e0" stroke-width="1.2">
    <ellipse cx="50" cy="11" rx="17" ry="4.6" transform="rotate(-14 50 11)"/>
    <ellipse cx="36" cy="12" rx="16" ry="4.6" transform="rotate(14 36 12)"/>
    <ellipse cx="50" cy="33" rx="17" ry="4.6" transform="rotate(14 50 33)"/>
    <ellipse cx="36" cy="32" rx="16" ry="4.6" transform="rotate(-14 36 32)"/>
  </g>
  <rect x="4" y="19.6" width="40" height="4.8" rx="2.4" fill="#2b7fd4"/>
  <path d="M12 20 v4 M19 20 v4 M26 20 v4 M33 20 v4" stroke="#bfe3ff" stroke-width="1.2"/>
  <ellipse cx="46" cy="22" rx="7" ry="5" fill="#1f6dbf"/>
  <circle cx="55" cy="22" r="5" fill="#2b7fd4"/>
  <circle cx="57" cy="19" r="3.2" fill="#123f73"/>
  <circle cx="57" cy="25" r="3.2" fill="#123f73"/>
  <circle cx="58" cy="18" r="1" fill="#fff"/>
  <circle cx="58" cy="24" r="1" fill="#fff"/>
</svg>`;

// Wolkje en struik aan de overkant: losse SVG's (eigen verhouding), zie de opmerking bij verPadSvg.
export const WOLK = `
<svg viewBox="0 0 120 50" aria-hidden="true">
  <path d="M14 46 C2 46 2 30 16 30 C16 16 38 12 44 24 C50 8 78 8 82 24 C94 16 112 24 106 36 C118 38 116 48 104 46 Z" fill="#fff"/>
</svg>`;

export const STRUIK = `
<svg viewBox="0 0 120 60" aria-hidden="true">
  <path d="M4 60 C0 44 12 32 26 36 C30 18 54 10 66 26 C76 12 102 16 104 36 C116 36 122 50 116 60 Z" fill="#3a944a"/>
  <ellipse cx="46" cy="28" rx="12" ry="6" fill="#5fb85c" opacity="0.8"/>
  <ellipse cx="86" cy="30" rx="10" ry="5" fill="#5fb85c" opacity="0.7"/>
  <ellipse cx="22" cy="44" rx="7" ry="4" fill="#5fb85c" opacity="0.6"/>
  <path d="M4 60 C30 52 90 52 116 60 Z" fill="#2a7a3a" opacity="0.6"/>
</svg>`;

export const BELLEN = `
<svg viewBox="0 0 400 160" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <g fill="#ffffff">
    <circle cx="46" cy="96" r="5" opacity="0.45"/>
    <circle cx="44" cy="94" r="1.6" opacity="0.9"/>
    <circle cx="150" cy="70" r="3.2" opacity="0.4"/>
    <circle cx="148.6" cy="68.8" r="1" opacity="0.85"/>
    <circle cx="230" cy="108" r="4" opacity="0.35"/>
    <circle cx="248" cy="48" r="2.4" opacity="0.45"/>
    <circle cx="320" cy="88" r="5.5" opacity="0.4"/>
    <circle cx="317" cy="85" r="1.7" opacity="0.9"/>
    <circle cx="368" cy="120" r="2.6" opacity="0.35"/>
  </g>
</svg>`;
