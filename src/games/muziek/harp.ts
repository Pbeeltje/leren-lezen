import type { Uiterlijk } from './uiterlijk.ts';

// Harp: een houten harp van opzij. Links de zuil met een gouden kroon, bovenaan de gebogen
// hals met stemknopjes, rechts de klankkast die schuin omhoog loopt. Elke snaar loopt van
// de hals recht naar beneden tot op het klankblad: links de lange lage, rechts de korte
// hoge. De harp is versiering; elke snaar is een eigen knop (een kolom zo breed als de
// ruimte tussen twee snaren), zodat tikken en glijden één snaar raken.
// Het vak is altijd 4:3, dus alles staat in een viewBox van 400 bij 300 en de knoppen in %.

const HOUT = '#9a4f22';
const LICHT = '#c4733a';
const DONKER = '#6a3212';
const RAND = '#3d1a07';
const BLAD = '#f0c88a'; // klankblad (vurenhout)
const GOUD = '#e3b23c';
const GOUD_LICHT = '#fbe6a2';
const GOUD_RAND = '#8a6414';

// De hals: een bocht van de kroon (links boven) naar de schouder (rechts), daarna buigt de
// knie naar beneden in de klankkast.
const HALS = [[50, 50], [140, 8], [256, 40], [350, 104]] as const;
const HALS_DIK = 26;
// Het klankblad: een rechte lijn van linksonder naar rechtsboven.
const BLAD_LINKS = [70, 264] as const;
const BLAD_RECHTS = [356, 192] as const;
// De snaren staan tussen deze x'en (evenveel ruimte, ook bij vijf snaren).
const EERSTE = 98;
const LAATSTE = 318;

function bezier(t: number, as: 0 | 1): number {
  const [a, b, c, d] = HALS.map((p) => p[as]);
  const u = 1 - t;
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
}

// Hoogte van de middellijn van de hals bij x (x loopt alleen maar op, dus halveren).
function halsY(x: number): number {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    if (bezier(mid, 0) < x) lo = mid;
    else hi = mid;
  }
  return bezier((lo + hi) / 2, 1);
}

const bladY = (x: number): number =>
  BLAD_LINKS[1] + ((x - BLAD_LINKS[0]) / (BLAD_RECHTS[0] - BLAD_LINKS[0])) * (BLAD_RECHTS[1] - BLAD_LINKS[1]);

const snaarX = (positie: number, aantal: number): number =>
  aantal < 2 ? (EERSTE + LAATSTE) / 2 : EERSTE + (positie / (aantal - 1)) * (LAATSTE - EERSTE);

function harpSvg(): string {
  const [h0, h1, h2, h3] = HALS;
  const hals = `M${h0[0]} ${h0[1]} C${h1[0]} ${h1[1]} ${h2[0]} ${h2[1]} ${h3[0]} ${h3[1]} C374 118 382 160 ${BLAD_RECHTS[0] + 6} ${BLAD_RECHTS[1] + 4}`;
  const glans = `M${h0[0] + 4} ${h0[1] - 8} C${h1[0]} ${h1[1] - 6} ${h2[0]} ${h2[1] - 8} ${h3[0] - 4} ${h3[1] - 9}`;
  // Klankkast: het klankblad aan de voorkant, een bolle rug naar rechtsonder.
  const kast = `M48 ${bladY(48)} L${BLAD_RECHTS[0]} ${BLAD_RECHTS[1]} C372 188 384 200 378 214 C340 262 230 286 120 284 L48 284 Z`;
  const blad = `M48 ${bladY(48)} L${BLAD_RECHTS[0] - 2} ${BLAD_RECHTS[1] - 1} L${BLAD_RECHTS[0] + 4} ${BLAD_RECHTS[1] + 12} L48 ${bladY(48) + 14} Z`;
  // Een rankje op de kast, en klankgaten in de rug.
  const rank = `M126 270 C170 262 210 250 250 238 C280 229 310 220 340 212`;
  const blaadjes = [150, 205, 262, 316]
    .map((x, i) => {
      const y = bladY(x) + 22 - i * 0.6;
      return `<ellipse cx="${x}" cy="${y}" rx="9" ry="4.5" transform="rotate(${i % 2 ? 30 : -40} ${x} ${y})" fill="${GOUD}"/>`;
    })
    .join('');
  return `<svg viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true">
  <ellipse cx="200" cy="291" rx="185" ry="7" fill="rgba(60,30,10,0.22)"/>
  <path d="${kast}" fill="${HOUT}" stroke="${RAND}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M120 278 C220 280 320 252 368 214" fill="none" stroke="${DONKER}" stroke-width="6" stroke-linecap="round" opacity="0.6"/>
  <path d="${blad}" fill="${BLAD}" stroke="${RAND}" stroke-width="2" stroke-linejoin="round"/>
  <path d="${rank}" fill="none" stroke="${GOUD}" stroke-width="2.5" stroke-linecap="round"/>
  ${blaadjes}
  <rect x="22" y="278" width="128" height="14" rx="6" fill="${DONKER}" stroke="${RAND}" stroke-width="3"/>
  <rect x="30" y="281" width="112" height="3" rx="1.5" fill="${LICHT}"/>
  <rect x="31" y="58" width="24" height="222" rx="6" fill="${HOUT}" stroke="${RAND}" stroke-width="3"/>
  <rect x="36" y="64" width="6" height="210" rx="3" fill="${LICHT}"/>
  ${[72, 150, 262].map((y) => `<rect x="27" y="${y}" width="32" height="9" rx="4" fill="${GOUD}" stroke="${GOUD_RAND}" stroke-width="2"/>`).join('')}
  <path d="${hals}" fill="none" stroke="${RAND}" stroke-width="${HALS_DIK + 6}" stroke-linecap="round"/>
  <path d="${hals}" fill="none" stroke="${HOUT}" stroke-width="${HALS_DIK}" stroke-linecap="round"/>
  <path d="${glans}" fill="none" stroke="${LICHT}" stroke-width="5" stroke-linecap="round"/>
  <path d="M${h0[0]} ${h0[1] + 8} C${h1[0]} ${h1[1] + 10} ${h2[0]} ${h2[1] + 10} ${h3[0] - 2} ${h3[1] + 9}" fill="none" stroke="${GOUD}" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="43" cy="44" r="21" fill="${GOUD}" stroke="${GOUD_RAND}" stroke-width="3"/>
  <circle cx="43" cy="44" r="12" fill="${GOUD_LICHT}" stroke="${GOUD_RAND}" stroke-width="2"/>
  <circle cx="43" cy="44" r="5" fill="${GOUD}"/>
  <circle cx="36" cy="36" r="4" fill="#fff" opacity="0.7"/>
  <path d="M30 22 C34 10 52 10 56 22" fill="none" stroke="${GOUD}" stroke-width="6" stroke-linecap="round"/>
</svg>`;
}

export const HARP: Uiterlijk = {
  achter() {
    const el = document.createElement('div');
    el.className = 'harp__kast';
    el.innerHTML = harpSvg();
    return el;
  },
  knop(staaf, _toon, positie, tonen) {
    const aantal = tonen.length;
    const x = snaarX(positie, aantal);
    const breed = aantal < 2 ? 60 : (LAATSTE - EERSTE) / (aantal - 1);
    const boven = halsY(x) + HALS_DIK / 2 - 3;
    const onder = bladY(x) + 3;
    staaf.style.left = `${(x - breed / 2) / 4}%`;
    staaf.style.width = `${breed / 4}%`;
    staaf.style.top = `${boven / 3}%`;
    staaf.style.height = `${(onder - boven) / 3}%`;
    // Lage snaren dikker. Wordt in leg met de breedte van het vak tot pixels.
    staaf.style.setProperty('--dikte', String(0.016 - (positie / Math.max(1, aantal - 1)) * 0.006));
    const snaar = document.createElement('span');
    snaar.className = 'harp__snaar';
    const pen = document.createElement('span');
    pen.className = 'harp__pen';
    const oog = document.createElement('span');
    oog.className = 'harp__oog';
    staaf.append(snaar, pen, oog);
  },
  leg(vak) {
    vak.style.setProperty('--hb', `${vak.clientWidth}px`);
  },
};
