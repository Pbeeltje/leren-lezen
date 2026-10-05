// Vijver van het kikkerkoor, zelfde soort tekening als de dino-wei en het herfstbos:
// lagen (oever, water, riet) als inline SVG, zodat riet niet wordt uitgerekt en de
// stroomstreepjes kunnen glinsteren. Zie .kikker-vijver in screens.css.

export const WATER = `
<svg viewBox="0 0 1000 420" preserveAspectRatio="none" aria-hidden="true">
  <defs>
    <linearGradient id="kikkerkoor-lucht" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#c5ecfb"/>
      <stop offset="0.42" stop-color="#5eb4d6"/>
      <stop offset="0.7" stop-color="#2f8f62"/>
      <stop offset="1" stop-color="#124e30"/>
    </linearGradient>
    <linearGradient id="kikkerkoor-oever" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#d7f0b0"/>
      <stop offset="1" stop-color="#8bc86a"/>
    </linearGradient>
  </defs>
  <rect width="1000" height="420" fill="url(#kikkerkoor-lucht)"/>
  <path d="M0 150 C160 118 300 142 460 132 C640 120 760 156 900 138 C960 130 990 140 1000 144 L1000 196 L0 196 Z" fill="url(#kikkerkoor-oever)"/>
  <path d="M0 150 C160 118 300 142 460 132 C640 120 760 156 900 138 C960 130 990 140 1000 144" fill="none" stroke="#f4fbe4" stroke-width="3" opacity="0.85" vector-effect="non-scaling-stroke"/>
  <path d="M0 248 C180 228 380 252 560 236 C760 218 880 246 1000 232 L1000 420 L0 420 Z" fill="#0d4428" opacity="0.22"/>
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

// Eén pol. Drie keer geplaatst; de rechter is gespiegeld.
export const RIET = `
<svg viewBox="0 0 150 230" aria-hidden="true">
  <path d="M38 228 C36 160 24 96 16 28 C26 88 34 156 48 228 Z" fill="#3ea24c" stroke="#145c28" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M72 228 C76 150 58 78 70 8 C82 72 86 156 84 228 Z" fill="#2d8740" stroke="#145c28" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M108 228 C102 158 122 92 112 34 C124 96 116 164 118 228 Z" fill="#57b85a" stroke="#145c28" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M74 96 C108 82 132 58 122 44 C134 68 108 92 74 104 Z" fill="#7dce6a" stroke="#145c28" stroke-width="2" stroke-linejoin="round"/>
  <path d="M112 118 C138 108 154 86 146 76 C156 96 136 116 112 126 Z" fill="#3ea24c" stroke="#145c28" stroke-width="1.8" stroke-linejoin="round"/>
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
