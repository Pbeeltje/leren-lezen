// Eigen dino-tekeningen voor Oversteken, inline zodat poten, staart en kop kunnen bewegen
// (zoals de gnoe uit savanne.ts). Overgenomen van woorden/stegosaurus.svg en
// achtergrond/triceratops.svg, maar met platte kleuren: een verloop met een id gaat stuk
// zodra het eerste exemplaar met die id uit beeld verdwijnt. Allebei kijken ze naar links.
// Delen: .dier__poot--a / --b (lopen om en om), .dier__staart, .dier__kop (alleen de
// triceratops: bij de stegosaurus zit de kop vast aan de romp).

export const STEGOSAURUS = `
<svg viewBox="0 0 120 120" aria-hidden="true">
  <g fill="#558b2f" stroke="#33691e" stroke-width="3">
    <rect class="dier__poot dier__poot--b" x="46" y="76" width="11" height="22" rx="4"/>
    <rect class="dier__poot dier__poot--a" x="68" y="76" width="11" height="22" rx="4"/>
  </g>
  <g fill="#ff8a65" stroke="#d84315" stroke-width="2.5" stroke-linejoin="round">
    <path d="M28 56 L34 40 L40 56 Z"/>
    <path d="M38 50 L44 29 L50 50 Z"/>
    <path d="M49 47 L55 22 L61 47 Z"/>
    <path d="M60 47 L66 22 L72 47 Z"/>
    <path d="M71 50 L77 29 L83 50 Z"/>
    <path d="M81 56 L87 40 L93 56 Z"/>
  </g>
  <g class="dier__staart" fill="#e64a19" stroke="#bf360c" stroke-width="2" stroke-linejoin="round">
    <path d="M104 64 L114 52 L108 66 Z"/>
    <path d="M108 70 L119 62 L111 73 Z"/>
  </g>
  <path d="M8 66 C8 58 16 54 24 58 C34 44 80 40 96 56 C102 60 108 64 112 70 C104 74 98 74 92 74 C80 84 40 86 26 74 C18 74 8 74 8 66 Z"
        fill="#7cb342" stroke="#33691e" stroke-width="3" stroke-linejoin="round"/>
  <path d="M30 72 C44 80 76 80 88 72" fill="none" stroke="#c5e1a5" stroke-width="5" stroke-linecap="round"/>
  <g fill="#689f38" stroke="#33691e" stroke-width="3">
    <rect class="dier__poot dier__poot--a" x="30" y="74" width="11" height="24" rx="4"/>
    <rect class="dier__poot dier__poot--b" x="82" y="72" width="11" height="26" rx="4"/>
  </g>
  <circle cx="15" cy="63" r="2.6" fill="#1b1b1b"/>
  <path d="M9 69 Q13 71 17 69" fill="none" stroke="#33691e" stroke-width="2" stroke-linecap="round"/>
</svg>`;

export const TRICERATOPS = `
<svg viewBox="0 0 220 150" aria-hidden="true">
  <path class="dier__staart" d="M168 88 C192 84 210 92 216 104 C200 102 186 104 170 108 Z" fill="#78c35a" stroke="#2f5d2a" stroke-width="3" stroke-linejoin="round"/>
  <rect class="dier__poot dier__poot--a" x="138" y="100" width="22" height="38" rx="9" fill="#5aa843" stroke="#2f5d2a" stroke-width="3"/>
  <rect class="dier__poot dier__poot--b" x="84" y="102" width="22" height="36" rx="9" fill="#5aa843" stroke="#2f5d2a" stroke-width="3"/>
  <ellipse cx="124" cy="88" rx="56" ry="36" fill="#78c35a" stroke="#2f5d2a" stroke-width="3"/>
  <circle cx="118" cy="66" r="5" fill="#b9e89a"/>
  <circle cx="138" cy="70" r="4" fill="#b9e89a"/>
  <circle cx="102" cy="72" r="3.5" fill="#b9e89a"/>
  <rect class="dier__poot dier__poot--b" x="150" y="104" width="20" height="34" rx="9" fill="#6bbb52" stroke="#2f5d2a" stroke-width="3"/>
  <rect class="dier__poot dier__poot--a" x="96" y="106" width="20" height="32" rx="9" fill="#6bbb52" stroke="#2f5d2a" stroke-width="3"/>
  <g class="dier__kop">
    <path d="M58 28 C88 20 104 44 100 72 C96 96 72 104 52 98 C60 76 58 52 58 28 Z" fill="#f9a04b" stroke="#9c4f1c" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="76" cy="46" r="4" fill="#ffd79a"/>
    <circle cx="86" cy="64" r="4" fill="#ffd79a"/>
    <circle cx="80" cy="84" r="4" fill="#ffd79a"/>
    <path d="M70 62 C50 56 22 64 14 82 C10 94 20 104 36 104 C54 104 72 96 80 84 C84 76 80 66 70 62 Z" fill="#78c35a" stroke="#2f5d2a" stroke-width="3" stroke-linejoin="round"/>
    <path d="M54 62 C48 44 40 30 28 22 C38 38 42 52 46 64 Z" fill="#fff4dc" stroke="#8a6a3a" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M68 62 C66 44 62 30 54 20 C60 36 60 50 60 64 Z" fill="#fff4dc" stroke="#8a6a3a" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M22 80 C16 72 14 66 16 60 C20 66 24 72 28 78 Z" fill="#fff4dc" stroke="#8a6a3a" stroke-width="2.5" stroke-linejoin="round"/>
    <circle cx="48" cy="78" r="6.5" fill="#fff"/>
    <circle cx="46.5" cy="79" r="3.8" fill="#1b1b2f"/>
    <circle cx="45" cy="77.5" r="1.3" fill="#fff"/>
    <ellipse cx="54" cy="92" rx="6" ry="3.5" fill="#ff9aa2" opacity="0.7"/>
    <path d="M22 92 C28 98 36 99 42 96" fill="none" stroke="#2f5d2a" stroke-width="2.5" stroke-linecap="round"/>
  </g>
</svg>`;
