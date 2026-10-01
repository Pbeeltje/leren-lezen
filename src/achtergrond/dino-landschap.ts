// Landschap van de dino-wei, allemaal zelf getekend (inline SVG, als tekst): de verte (wazige
// bergen met een uitgedoofde vulkaan en een oerwoudrand met boomvarens en apenbomen), de
// heuvels met een meertje, en losse planten en stenen voor op de voorgrond (varens,
// paardenstaarten). Zie maakDinoDecor in dino.ts en het dino-blok in styles/achtergrond.css.

type Punt = [number, number];
const pt = ([x, y]: Punt) => `${x.toFixed(1)} ${y.toFixed(1)}`;

/** Vloeiende lijn door de punten (Catmull-Rom als Bézier-bochten). */
const gladPad = (p: Punt[]): string => {
  let d = `M${pt(p[0])}`;
  for (let i = 0; i < p.length - 1; i++) {
    const [a, b, c, e] = [p[i - 1] ?? p[i], p[i], p[i + 1], p[i + 2] ?? p[i + 1]];
    const c1: Punt = [b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6];
    const c2: Punt = [c[0] - (e[0] - b[0]) / 6, c[1] - (e[1] - b[1]) / 6];
    d += ` C${pt(c1)} ${pt(c2)} ${pt(c)}`;
  }
  return d;
};

/** Vaste 'toeval' (altijd hetzelfde landschap). */
const toeval = (zaad: number) => () => {
  zaad = (zaad * 16807) % 2147483647;
  return (zaad - 1) / 2147483646;
};

// ---- De verte: viewBox 2000 x 300, xMidYMax slice (telefoon ziet het midden). ----
const VERRE_BERGEN: Punt[] = [
  [-20, 170], [90, 128], [190, 140], [300, 96], [380, 108], [470, 80], [560, 112], [660, 134],
  [760, 104], [850, 74], [930, 88], [1010, 120], [1110, 136], [1220, 112],
  // uitgedoofde vulkaan met een platte top
  [1330, 112], [1400, 76], [1436, 56], [1470, 52], [1504, 56], [1540, 76], [1610, 112],
  [1700, 104], [1790, 82], [1880, 108], [2020, 140],
];

/** Rij boomkruinen (bolletjes) met hier en daar een boomvaren of een apenboom erboven. */
const oerwoud = (zaad: number, basis: number, hoogte: number, kleur: string): string => {
  const r = toeval(zaad);
  let d = `M-20 300 L-20 ${basis}`;
  let x = -20;
  while (x < 2020) {
    const w = 34 + r() * 46;
    const y = basis - r() * hoogte;
    d += ` Q${(x + w / 2).toFixed(1)} ${(y - w * 0.55).toFixed(1)} ${(x + w).toFixed(1)} ${(basis - r() * hoogte * 0.5).toFixed(1)}`;
    x += w;
  }
  d += ' L2020 300 Z';
  // Bomen die boven de kruinen uitsteken.
  let bomen = '';
  for (let bx = 40 + r() * 80; bx < 2000; bx += 110 + r() * 170) {
    const top = basis - hoogte - 30 - r() * 40;
    if (r() < 0.55) {
      // boomvaren: dunne stam met een kruin van hangende bladeren
      bomen += `<path d="M${bx.toFixed(1)} ${basis} L${(bx + 2).toFixed(1)} ${top.toFixed(1)}" stroke="${kleur}" stroke-width="4" fill="none"/>`;
      for (const [dx, dy] of [[-30, 16], [-20, 22], [-8, 24], [8, 24], [20, 22], [30, 16], [-24, 2], [24, 2]]) {
        bomen += `<path d="M${(bx + 2).toFixed(1)} ${top.toFixed(1)} Q${(bx + 2 + dx * 0.6).toFixed(1)} ${(top - 10).toFixed(1)} ${(bx + 2 + dx).toFixed(1)} ${(top + dy).toFixed(1)}" stroke="${kleur}" stroke-width="5" stroke-linecap="round" fill="none"/>`;
      }
    } else {
      // apenboom (araucaria): rechte stam met platte etages
      bomen += `<path d="M${bx.toFixed(1)} ${basis} L${bx.toFixed(1)} ${(top - 6).toFixed(1)}" stroke="${kleur}" stroke-width="4" fill="none"/>`;
      for (let i = 0; i < 4; i++) {
        const ey = top + i * 13;
        const half = 10 + i * 6;
        bomen += `<ellipse cx="${bx.toFixed(1)}" cy="${ey.toFixed(1)}" rx="${half}" ry="5.5" fill="${kleur}"/>`;
      }
    }
  }
  return `<g fill="${kleur}">${bomen}<path d="${d}"/></g>`;
};

export const VERTE = `
<svg viewBox="0 0 2000 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
  <defs>
    <linearGradient id="dn-nevel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fbeed0" stop-opacity="0"/>
      <stop offset="1" stop-color="#fbeed0" stop-opacity="0.9"/>
    </linearGradient>
    <linearGradient id="dn-berg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#a6b4dc"/>
      <stop offset="1" stop-color="#c9cfe6"/>
    </linearGradient>
  </defs>
  <path d="${gladPad(VERRE_BERGEN)} L2020 300 L-20 300 Z" fill="url(#dn-berg)"/>
  <!-- schaduwkant van de verre vulkaan en een kraterrandje -->
  <path d="M1470 52 C1490 52 1504 54 1504 56 C1520 64 1540 76 1610 112 L1610 300 L1480 300 Z" fill="#8d9bc7" opacity="0.35"/>
  <path d="M1440 57 C1456 52 1486 52 1500 57" stroke="#8d9bc7" stroke-width="3" fill="none" stroke-linecap="round"/>
  <rect x="-20" y="90" width="2040" height="210" fill="url(#dn-nevel)" opacity="0.7"/>
  <g opacity="0.75">${oerwoud(7, 196, 26, '#9cc4ad')}</g>
  <rect x="-20" y="150" width="2040" height="150" fill="url(#dn-nevel)" opacity="0.6"/>
  ${oerwoud(31, 236, 30, '#7fb593')}
  <rect x="-20" y="200" width="2040" height="100" fill="url(#dn-nevel)" opacity="0.45"/>
</svg>`;

// ---- Heuvels (uitgerekt, preserveAspectRatio none). Klassen dn-heuvel--achter/midden/voor
// zijn de paden waar vulkaan, bomen en de stegosaurus op staan: hun bovenrand moet het eerste
// stuk van het pad zijn (van x 0 naar 1000). ----
const ACHTER = 'M0 150 C160 60 320 70 480 130 C640 190 820 80 1000 120 L1000 300 L0 300 Z';
const MIDDEN = 'M0 210 C200 150 380 170 560 210 C740 250 880 180 1000 200 L1000 300 L0 300 Z';
const VOOR = 'M0 260 C250 235 500 250 750 262 C860 267 940 255 1000 250 L1000 300 L0 300 Z';

/** Grasplukjes als korte streepjes (niet uitgerekt door vector-effect). */
const gras = (zaad: number, punten: Punt[], kleur: string): string => {
  const r = toeval(zaad);
  const d = punten
    .map(([x, y]) => {
      const a = 2 + r() * 2;
      return `M${x - a} ${y} l${a * 0.6} -${4 + r() * 3} M${x} ${y} l0 -${6 + r() * 3} M${x + a} ${y} l-${a * 0.6} -${4 + r() * 3}`;
    })
    .join(' ');
  return `<path d="${d}" stroke="${kleur}" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.7" vector-effect="non-scaling-stroke"/>`;
};

export const HEUVELS = `
<svg viewBox="0 0 1000 300" preserveAspectRatio="none" aria-hidden="true">
  <defs>
    <linearGradient id="dn-h1" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#a6dc78"/><stop offset="0.5" stop-color="#7cc95c"/>
    </linearGradient>
    <linearGradient id="dn-h2" x1="0" y1="0.5" x2="0" y2="1">
      <stop offset="0" stop-color="#7fcf5c"/><stop offset="1" stop-color="#55ad42"/>
    </linearGradient>
    <linearGradient id="dn-h3" x1="0" y1="0.8" x2="0" y2="1">
      <stop offset="0" stop-color="#5cb847"/><stop offset="1" stop-color="#3f9733"/>
    </linearGradient>
    <linearGradient id="dn-meer" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#8fd6f2"/><stop offset="1" stop-color="#4fa9d8"/>
    </linearGradient>
  </defs>
  <path class="dn-heuvel--achter" d="${ACHTER}" fill="url(#dn-h1)"/>
  <!-- zonnige plekken en gras op de achterste heuvel -->
  <ellipse cx="250" cy="100" rx="120" ry="14" fill="#c4ea92" opacity="0.5"/>
  <ellipse cx="860" cy="118" rx="80" ry="10" fill="#c4ea92" opacity="0.45"/>
  ${gras(3, [[90, 128], [210, 98], [300, 104], [400, 122], [640, 160], [760, 120], [930, 124]], '#5fae45')}
  <path class="dn-heuvel--midden" d="${MIDDEN}" fill="url(#dn-h2)"/>
  <path d="M0 210 C200 150 380 170 560 210 C740 250 880 180 1000 200" stroke="#a9de82" stroke-width="2.5" fill="none" opacity="0.7" vector-effect="non-scaling-stroke"/>
  <ellipse cx="190" cy="178" rx="110" ry="10" fill="#9bdc74" opacity="0.5"/>
  ${gras(11, [[60, 200], [150, 182], [260, 182], [350, 190], [820, 214], [900, 202], [970, 204]], '#3f8f30')}
  <!-- meertje in het dal, de voorste heuvel valt over de onderrand -->
  <g class="dn-meer">
    <ellipse cx="560" cy="240" rx="150" ry="21" fill="#4c9a3a" opacity="0.6"/>
    <ellipse cx="560" cy="241" rx="140" ry="17" fill="url(#dn-meer)"/>
    <ellipse cx="545" cy="236" rx="90" ry="6" fill="#d8f3ff" opacity="0.45"/>
    <g class="dn-glinster" stroke="#ffffff" stroke-width="2" stroke-linecap="round" vector-effect="non-scaling-stroke">
      <path d="M470 236 l26 0" vector-effect="non-scaling-stroke"/>
      <path d="M560 244 l34 0" vector-effect="non-scaling-stroke"/>
      <path d="M630 236 l18 0" vector-effect="non-scaling-stroke"/>
      <path d="M515 247 l16 0" vector-effect="non-scaling-stroke"/>
    </g>
  </g>
  <path class="dn-heuvel--voor" d="${VOOR}" fill="url(#dn-h3)"/>
  <path d="M0 260 C250 235 500 250 750 262 C860 267 940 255 1000 250" stroke="#86d067" stroke-width="2.5" fill="none" opacity="0.75" vector-effect="non-scaling-stroke"/>
  ${gras(23, [[40, 262], [140, 252], [330, 248], [420, 252], [610, 262], [700, 266], [880, 262], [980, 256]], '#2f7d27')}
</svg>`;

// ---- Planten voor de voorgrond ----

/** Een pol varens: gebogen bladen met blaadjes om en om, de achterste wat donkerder. */
export function varenPol(zaad: number): string {
  const r = toeval(zaad);
  const bladen: string[] = [];
  const hoeken = [-74, 70, -50, 46, -26, 22, -6];
  hoeken.forEach((hoek, i) => {
    const achter = i < 2;
    const lengte = 78 + r() * 26 - Math.abs(hoek) * 0.12;
    const rad = (hoek * Math.PI) / 180;
    const p0: Punt = [100 + hoek * 0.12, 138];
    const p1: Punt = [p0[0] + Math.sin(rad) * lengte * 0.75, p0[1] - Math.cos(rad) * lengte * 0.95];
    // De punt buigt naar buiten en omlaag.
    const p2: Punt = [p0[0] + Math.sin(rad) * lengte * 1.15, p0[1] - Math.cos(rad) * lengte * 0.55 + Math.abs(Math.sin(rad)) * 18];
    const op = (t: number): Punt => [
      (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0],
      (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1],
    ];
    const kleur = achter ? '#3f8a35' : i % 2 ? '#5aad3f' : '#4f9f38';
    let blaadjes = '';
    for (let t = 0.14; t < 0.97; t += 0.075) {
      const [x, y] = op(t);
      const [x2, y2] = op(t + 0.01);
      const lx = x2 - x;
      const ly = y2 - y;
      const n = Math.hypot(lx, ly) || 1;
      const l = 15 * (1 - t * 0.75);
      // loodrecht op de nerf, iets naar de punt toe
      const [nx, ny] = [-ly / n, lx / n];
      const [vx, vy] = [lx / n, ly / n];
      blaadjes += `M${pt([x, y])} l${(nx * l + vx * l * 0.45).toFixed(1)} ${(ny * l + vy * l * 0.45).toFixed(1)} `;
      blaadjes += `M${pt([x, y])} l${(-nx * l + vx * l * 0.45).toFixed(1)} ${(-ny * l + vy * l * 0.45).toFixed(1)} `;
    }
    bladen.push(
      `<g class="dn-blad" stroke="${kleur}" stroke-linecap="round" fill="none">` +
        `<path d="${blaadjes}" stroke-width="5.5"/>` +
        `<path d="M${pt(p0)} Q${pt(p1)} ${pt(p2)}" stroke="#2f6e27" stroke-width="2.4"/></g>`,
    );
  });
  return `<svg viewBox="0 0 200 140" aria-hidden="true">${bladen.join('')}</svg>`;
}

/** Een groepje paardenstaarten: gelede stengels met kransen naaldjes en een bruin kegeltje. */
export function paardenstaarten(zaad: number): string {
  const r = toeval(zaad);
  let stengels = '';
  for (const [x, h] of [[22, 92], [38, 128], [52, 104], [66, 140], [80, 98]] as Punt[]) {
    const scheef = (r() - 0.5) * 10;
    const top: Punt = [x + scheef, 160 - h];
    stengels += `<path d="M${x} 160 L${pt(top)}" stroke="#6fae4f" stroke-width="5" stroke-linecap="round"/>`;
    for (let y = 146; y > top[1] + 14; y -= 17) {
      const f = (160 - y) / h;
      const xm = x + scheef * f;
      const l = 10 * (1 - f * 0.6);
      stengels += `<path d="M${(xm - 3).toFixed(1)} ${y} l6 0" stroke="#2f5d2a" stroke-width="2.4"/>`;
      stengels += `<path d="M${xm.toFixed(1)} ${y} l${(-l).toFixed(1)} ${(l * 0.55).toFixed(1)} M${xm.toFixed(1)} ${y} l${l.toFixed(1)} ${(l * 0.55).toFixed(1)} M${xm.toFixed(1)} ${y} l${(-l * 0.55).toFixed(1)} ${(l * 0.7).toFixed(1)} M${xm.toFixed(1)} ${y} l${(l * 0.55).toFixed(1)} ${(l * 0.7).toFixed(1)}" stroke="#5f9f45" stroke-width="1.5"/>`;
    }
    stengels += `<ellipse cx="${top[0].toFixed(1)}" cy="${(top[1] - 4).toFixed(1)}" rx="3.6" ry="7" fill="#b98a4e" stroke="#7a5528" stroke-width="1.4"/>`;
  }
  return `<svg viewBox="0 0 100 165" aria-hidden="true"><g stroke-linecap="round" fill="none">${stengels}</g></svg>`;
}

/** Ronde steen met een lichte en een donkere kant. */
export const STEEN = `
<svg viewBox="0 0 100 60" aria-hidden="true">
  <path d="M6 58 C2 40 14 18 38 12 C58 6 84 14 92 34 C97 46 95 54 92 58 Z" fill="#a39689" stroke="#6d6156" stroke-width="3" stroke-linejoin="round"/>
  <path d="M60 14 C78 18 90 30 92 44 C93 52 92 56 90 58 L64 58 C74 44 72 28 60 14 Z" fill="#7e7267" opacity="0.5"/>
  <path d="M22 28 C28 20 38 16 48 16" stroke="#d6cdc2" stroke-width="4" stroke-linecap="round" fill="none"/>
  <path d="M8 58 C20 52 40 54 52 58" fill="#6aa84f" opacity="0.9"/>
</svg>`;
