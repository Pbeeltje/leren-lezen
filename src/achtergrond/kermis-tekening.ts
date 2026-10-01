// Zelf getekende kermisdingen (inline SVG), los van kermis.ts zodat de logica daar
// overzichtelijk blijft. Onderdelen die bewegen hebben een eigen klasse (kv-..., kj-...),
// de animaties staan in styles/achtergrond-kermis.css.

const LICHTJES = ['#ffe27a', '#ff9db0', '#8fd6ff', '#b8f08c', '#ffbf73'];

/** Vaste "willekeur", zodat de tekening elke keer hetzelfde is. */
function zaad(n: number): () => number {
  let s = n;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

// Een vloeiende lijn (Catmull-Rom) door een rij punten, als SVG-pad.
function vloeiend(p: number[][]): string {
  let d = `M${p[0][0]} ${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const [a, b, c, e] = [p[i - 1] ?? p[i], p[i], p[i + 1], p[i + 2] ?? p[i + 1]];
    const k1 = [b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6];
    const k2 = [c[0] - (e[0] - b[0]) / 6, c[1] - (e[1] - b[1]) / 6];
    d += ` C${k1[0].toFixed(1)} ${k1[1].toFixed(1)} ${k2[0].toFixed(1)} ${k2[1].toFixed(1)} ${c[0]} ${c[1]}`;
  }
  return d;
}

// De achtbaan in de verte: van links onder de heuvel op, dan een paar bulten naar rechts.
const BAAN = [
  [1380, 300], [1412, 262], [1450, 150], [1482, 96], [1516, 92], [1552, 140], [1590, 228],
  [1630, 250], [1670, 202], [1710, 162], [1750, 172], [1790, 224], [1830, 246], [1870, 214],
  [1910, 196], [1950, 214], [2010, 244],
];

function achtbaan(): string {
  const pad = vloeiend(BAAN);
  let palen = '';
  let lichtjes = '';
  BAAN.forEach(([x, y], i) => {
    if (y >= 296) return;
    palen += `M${x} ${y + 3} V300 `;
    // Kruisschoren tussen twee palen, zoals bij een houten achtbaan.
    const v = BAAN[i + 1];
    if (v && v[1] < 296) palen += `M${x} ${y + 12} L${v[0]} 300 M${v[0]} ${v[1] + 12} L${x} 300 `;
    lichtjes += `<circle class="kermis-lamp" cx="${x}" cy="${y - 1}" r="3.2" fill="${LICHTJES[i % LICHTJES.length]}" style="animation-delay:${(-i * 0.37).toFixed(2)}s"/>`;
  });
  return `
  <path d="${palen}" stroke="#6a4282" stroke-width="2.4" fill="none"/>
  <path id="kv-baan" d="${pad}" stroke="#5b3676" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="${pad}" stroke="#a77bb5" stroke-width="1.4" fill="none" transform="translate(0 -2)"/>
  ${lichtjes}`;
}

// Het treintje: drie wagentjes rond (0, 0), zodat animateMotion ze op de baan zet.
const TREIN = `
<g class="kv-trein">
  <rect x="-37" y="-11" width="15" height="9" rx="3" fill="#ff6b8b"/>
  <rect x="-19" y="-11" width="15" height="9" rx="3" fill="#ffd23f"/>
  <rect x="-1" y="-11" width="15" height="9" rx="3" fill="#4fc3f7"/>
  <g fill="#fff6c8"><circle cx="-30" cy="-12" r="2.4"/><circle cx="-12" cy="-12" r="2.4"/><circle cx="6" cy="-12" r="2.4"/></g>
  <animateMotion dur="9s" begin="indefinite" rotate="auto" calcMode="spline" keyTimes="0;1" keySplines="0.35 0 0.65 1" fill="remove">
    <mpath href="#kv-baan"/>
  </animateMotion>
</g>`;

// Circustent met een gestreept dak en lampjes langs de rand.
function circustent(): string {
  const r = zaad(7);
  let banen = '';
  for (let i = 0; i < 8; i++) {
    const x1 = 168 + i * 32;
    banen += `<path d="M295 108 L${x1} 236 L${x1 + 16} 236 Z" fill="#b8749f" opacity="0.8"/>`;
  }
  let lichtjes = '';
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    const x = 168 + t * 254;
    const y = 236 - Math.sin(t * Math.PI) * 6;
    lichtjes += `<circle class="kermis-lamp" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.8" fill="${LICHTJES[i % LICHTJES.length]}" style="animation-delay:${(-r() * 2.6).toFixed(2)}s"/>`;
  }
  return `
  <path d="M295 108 V84" stroke="#5b3676" stroke-width="3"/>
  <path class="kv-vlag" d="M295 84 L320 90 L295 97 Z" fill="#ffcc4d"/>
  <path d="M176 300 V236 H414 V300 Z" fill="#7e4a86"/>
  <path d="M272 300 V256 Q295 236 318 256 V300 Z" fill="#ffcf8a" opacity="0.75"/>
  <path d="M164 238 Q200 196 240 168 L295 108 L350 168 Q390 196 426 238 Z" fill="#9a5a90"/>
  <clipPath id="kv-tentdak"><path d="M164 238 Q200 196 240 168 L295 108 L350 168 Q390 196 426 238 Z"/></clipPath>
  <g clip-path="url(#kv-tentdak)">${banen}</g>
  ${lichtjes}`;
}

// Valtoren: de gondel gaat langzaam omhoog en valt dan snel (CSS, .kv-valbak).
const VALTOREN = `
  <rect x="466" y="22" width="14" height="278" fill="#6a4282"/>
  <path d="M470 30 V300 M476 30 V300" stroke="#9a72b0" stroke-width="1.2"/>
  <rect x="456" y="12" width="34" height="14" rx="3" fill="#5b3676"/>
  <circle class="kv-toplicht" cx="473" cy="8" r="4" fill="#ff5a6e"/>
  <g class="kv-valbak">
    <rect x="448" y="266" width="50" height="14" rx="4" fill="#5b3676"/>
    <g fill="#ffe27a"><circle cx="456" cy="273" r="2.4"/><circle cx="466" cy="273" r="2.4"/><circle cx="480" cy="273" r="2.4"/><circle cx="490" cy="273" r="2.4"/></g>
  </g>`;

// Kleine kraampjes en tentjes in het midden (op brede schermen te zien tussen de kaarten door).
function kraampjes(): string {
  const r = zaad(3);
  let s = '';
  let x = 560;
  while (x < 1380) {
    const b = 46 + r() * 50;
    const h = 30 + r() * 40;
    s += `<path d="M${x.toFixed(0)} 300 V${(300 - h * 0.55).toFixed(0)} L${(x + b / 2).toFixed(0)} ${(300 - h).toFixed(0)} L${(x + b).toFixed(0)} ${(300 - h * 0.55).toFixed(0)} V300 Z" fill="#7a4a86"/>`;
    s += `<circle class="kermis-lamp" cx="${(x + b / 2).toFixed(0)}" cy="${(300 - h - 3).toFixed(0)}" r="2.6" fill="${LICHTJES[Math.floor(r() * LICHTJES.length)]}" style="animation-delay:${(-r() * 2.6).toFixed(2)}s"/>`;
    x += b + 8 + r() * 30;
  }
  return s;
}

// Daken en bomen langs de hele horizon, als donkere rand onder alles.
function horizon(): string {
  const r = zaad(11);
  let d = 'M0 300 V276';
  for (let x = 0; x < 2000; x += 40) {
    const y = 262 + r() * 16;
    d += ` Q${x + 20} ${(y - 14 - r() * 10).toFixed(0)} ${x + 40} ${y.toFixed(0)}`;
  }
  return `<path d="${d} V300 Z" fill="#6c4180"/>`;
}

/** De kermis in de verte: circustent en valtoren links, achtbaan rechts, met een warme nevel. */
export const VERTE = `
<svg viewBox="0 0 2000 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
  <defs>
    <linearGradient id="kv-nevel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.35" stop-color="#f3a06a" stop-opacity="0"/>
      <stop offset="1" stop-color="#f08a68" stop-opacity="0.5"/>
    </linearGradient>
  </defs>
  <g opacity="0.92">
    ${VALTOREN}
    ${circustent()}
    ${kraampjes()}
    ${achtbaan()}
    ${TREIN}
    ${horizon()}
  </g>
  <rect width="2000" height="300" fill="url(#kv-nevel)"/>
</svg>`;

/** Wassende maan met een paar zachte vlekjes. */
export const MAAN = `
<svg viewBox="0 0 80 80" aria-hidden="true">
  <defs><mask id="kv-maan"><rect width="80" height="80" fill="#fff"/><circle cx="54" cy="30" r="27" fill="#000"/></mask></defs>
  <g mask="url(#kv-maan)">
    <circle cx="40" cy="40" r="30" fill="#fff3d0"/>
    <circle cx="24" cy="46" r="4" fill="#efdcae"/><circle cx="32" cy="60" r="3" fill="#efdcae"/><circle cx="18" cy="32" r="2.4" fill="#efdcae"/>
  </g>
</svg>`;

/** Een wolk die van onderen roze wordt aangelicht door de kermis. */
export const WOLK = `
<svg viewBox="0 0 220 70" aria-hidden="true">
  <defs><linearGradient id="kv-wolk" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#5a3a86"/><stop offset="0.6" stop-color="#8a4f92"/><stop offset="1" stop-color="#d97a8e"/>
  </linearGradient></defs>
  <path d="M14 62 C2 62 2 44 18 42 C18 26 40 20 52 30 C60 10 96 6 108 26 C120 12 150 14 156 34 C170 26 196 30 196 46 C214 46 216 62 200 62 Z" fill="url(#kv-wolk)"/>
</svg>`;

/** Heteluchtballon (rood-geel gestreept), voor heel af en toe hoog in de lucht. */
export const LUCHTBALLON = `
<svg viewBox="0 0 80 112" aria-hidden="true">
  <defs><clipPath id="kv-ballon"><path d="M40 4 C18 4 4 20 4 38 C4 56 20 66 28 78 H52 C60 66 76 56 76 38 C76 20 62 4 40 4 Z"/></clipPath></defs>
  <path d="M28 78 L32 96 M52 78 L48 96 M40 80 V96" stroke="#5a3d55" stroke-width="1.6"/>
  <g clip-path="url(#kv-ballon)">
    <rect width="80" height="80" fill="#ff5a6e"/>
    <path d="M40 0 C26 20 24 50 32 80 H48 C56 50 54 20 40 0 Z" fill="#ffd23f"/>
    <path d="M0 0 C6 30 10 56 22 80 H12 C0 60 -4 30 0 0 Z M80 0 C74 30 70 56 58 80 H68 C80 60 84 30 80 0 Z" fill="#ffd23f"/>
    <ellipse cx="22" cy="26" rx="7" ry="14" fill="#fff" opacity="0.28" transform="rotate(18 22 26)"/>
  </g>
  <path d="M28 78 H52" stroke="#b8283c" stroke-width="2.4" stroke-linecap="round"/>
  <rect x="30" y="95" width="20" height="14" rx="3" fill="#b07a4a" stroke="#6e4325" stroke-width="2"/>
  <path d="M30 101 H50" stroke="#6e4325" stroke-width="1.4"/>
</svg>`;

/**
 * Kop van Jut: een hoge paal met een schaal van groen naar rood en een bel bovenop. De
 * hamer (.kj-hamer) slaat op het blok, het schuifje (.kj-schuif) vliegt omhoog en de bel
 * (.kj-bel) rinkelt. De tekening loopt van y=0 (bel) tot y=300 (grond).
 */
export function kopVanJut(): string {
  const kleuren = ['#5ccf6a', '#9bdc4f', '#d6e348', '#ffd23f', '#ffb03a', '#ff8a3c', '#ff6044', '#ff3d5a'];
  let schaal = '';
  kleuren.forEach((k, i) => {
    const y = 236 - i * 26;
    schaal += `<rect x="20" y="${y}" width="20" height="26" fill="${k}"/>`;
    schaal += `<path d="M20 ${y} H27 M33 ${y} H40" stroke="#4a2a55" stroke-width="1.6"/>`;
  });
  let lampjes = '';
  for (let i = 0; i < 9; i++) {
    lampjes += `<circle class="kermis-lamp" cx="${i % 2 ? 45 : 15}" cy="${50 + i * 25}" r="2.6" fill="${LICHTJES[i % LICHTJES.length]}" style="animation-delay:${(-i * 0.3).toFixed(2)}s"/>`;
  }
  return `
<svg viewBox="-12 -8 84 308" aria-hidden="true">
  <rect x="16" y="40" width="28" height="226" rx="4" fill="#fff4e0" stroke="#4a2a55" stroke-width="3"/>
  ${schaal}
  <path d="M30 44 V262" stroke="#4a2a55" stroke-width="2"/>
  ${lampjes}
  <g class="kj-schuif"><rect x="23" y="252" width="14" height="10" rx="3" fill="#4fc3f7" stroke="#1d4f7a" stroke-width="2"/></g>
  <path d="M30 40 V30" stroke="#4a2a55" stroke-width="3"/>
  <g class="kj-bel">
    <path d="M17 32 C17 14 22 8 30 8 C38 8 43 14 43 32 Z" fill="#ffcc4d" stroke="#a86b00" stroke-width="2.5" stroke-linejoin="round"/>
    <ellipse cx="25" cy="18" rx="3" ry="6" fill="#fff6c8" opacity="0.7"/>
    <circle cx="30" cy="5" r="3" fill="#a86b00"/>
  </g>
  <path d="M8 266 H52 L58 300 H2 Z" fill="#ff5a7a" stroke="#7d2a4a" stroke-width="3" stroke-linejoin="round"/>
  <path d="M16 270 L13 296 M30 270 V296 M44 270 L47 296" stroke="#ffc4d2" stroke-width="5"/>
  <rect x="18" y="258" width="24" height="9" rx="2" fill="#5a3d55" stroke="#2f1e33" stroke-width="2"/>
  <g class="kj-hamer">
    <path d="M60 298 L38 252" stroke="#b07a4a" stroke-width="5" stroke-linecap="round"/>
    <rect x="22" y="236" width="26" height="15" rx="4" fill="#8a5a3a" stroke="#4a2a1a" stroke-width="2.5" transform="rotate(-25 35 244)"/>
  </g>
</svg>`;
}

/** Het kermisplein: een grasrand, een warm verlicht plein met lichtplassen en confetti. */
export function grond(): string {
  const r = zaad(5);
  const kleuren = ['#ffd23f', '#ff7eb6', '#7fd4ff', '#a8f07a', '#ffffff', '#c9a4ff'];
  let confetti = '';
  for (let i = 0; i < 70; i++) {
    const x = r() * 1000;
    const y = 128 + r() * 70;
    confetti += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${(3 + r() * 3).toFixed(1)}" height="2.2" fill="${kleuren[i % kleuren.length]}" opacity="0.75" transform="rotate(${(r() * 180).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})"/>`;
  }
  // Lichtplassen onder de attracties (x in procenten van de breedte, net als in de CSS).
  const plassen = [[110, 150, 0.75], [245, 92, 0.6], [500, 260, 0.35], [820, 150, 0.75], [958, 60, 0.55]]
    .map(([x, b, o]) => `<ellipse cx="${x}" cy="126" rx="${b}" ry="34" fill="url(#kg-licht)" opacity="${o}"/>`)
    .join('');
  return `
<svg viewBox="0 0 1000 200" preserveAspectRatio="none" aria-hidden="true">
  <defs>
    <linearGradient id="kg-plein" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#a86a78"/><stop offset="1" stop-color="#6a3f58"/>
    </linearGradient>
    <radialGradient id="kg-licht">
      <stop offset="0" stop-color="#ffd59a" stop-opacity="0.85"/><stop offset="1" stop-color="#ffd59a" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <path d="M0 62 C250 56 750 56 1000 62 L1000 200 L0 200 Z" fill="#35604f"/>
  <path d="M0 62 C250 56 750 56 1000 62" stroke="#4f8a68" stroke-width="3" fill="none"/>
  <path d="M0 104 C300 92 700 92 1000 104 L1000 200 L0 200 Z" fill="url(#kg-plein)"/>
  ${plassen}
  <g stroke="#c08896" stroke-width="1.6" fill="none" opacity="0.5">
    <path d="M0 132 C300 122 700 122 1000 132"/><path d="M0 162 C300 154 700 154 1000 162"/>
  </g>
  ${confetti}
</svg>`;
}
