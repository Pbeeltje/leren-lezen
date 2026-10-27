import type { Uiterlijk } from './uiterlijk.ts';

// Klokken: een houten klokkenrek (twee palen met bolletjes, een gesneden kroonlijst met een
// rozet, koperen stangen, gedraaide poten op krulvoeten) met koperen klokjes aan leren
// riempjes. Bovenaan de lage tonen (grote klokken), onderaan de hoge. Het rek is versiering;
// elke klok is een eigen knop (een vak onder de stang), zodat tikken en glijden één klok raken.
// Vlakke kleuren, geen verlopen: een url(#id) naar een SVG op display:none tekent in Chrome niets.

// Het rek is 1000 breed; de hoogte hangt af van het aantal stangen (twee op een breed vak,
// meer op een staand vak). De eerste stang ligt op y 175, elke volgende een rij lager.
const HOUT = '#6b2f1a';
const LICHT = '#8f4527';
const DONKER = '#4a1d0f';
const RAND = '#2a1006';
const kraal = (x: number, y: number, dik: boolean): string =>
  `<rect x="${x - 27}" y="${y}" width="54" height="${dik ? 46 : 18}" rx="${dik ? 20 : 8}" fill="${HOUT}" stroke="${RAND}" stroke-width="4"/>`;
const paal = (x: number, stangen: number[], rij: number, hoog: number): string => `
  <rect x="${x - 26}" y="92" width="52" height="22" rx="8" fill="${HOUT}" stroke="${RAND}" stroke-width="4"/>
  <circle cx="${x}" cy="66" r="24" fill="${HOUT}" stroke="${RAND}" stroke-width="4"/>
  <circle cx="${x - 7}" cy="58" r="7" fill="${LICHT}"/>
  <rect x="${x - 20}" y="112" width="40" height="${hoog - 160}" fill="${HOUT}" stroke="${RAND}" stroke-width="4"/>
  <rect x="${x - 12}" y="118" width="9" height="${hoog - 172}" fill="${LICHT}"/>
  ${stangen.map((y) => kraal(x, y - 24, false) + kraal(x, y + rij / 2 - 23, true)).join('')}
  ${kraal(x, hoog - 110, false)}`;
const voet = (x: number, y: number, spiegel: boolean): string => `
  <path transform="translate(${x} ${y}) scale(${spiegel ? -1 : 1} 1)" d="M-60 0 C-62 -28 -46 -48 -16 -52 L16 -52 C46 -48 62 -28 60 0 L36 0 C34 -18 22 -26 0 -26 C-22 -26 -34 -18 -36 0 Z" fill="${HOUT}" stroke="${RAND}" stroke-width="4" stroke-linejoin="round"/>
  <circle cx="${x + (spiegel ? 44 : -44)}" cy="${y - 14}" r="9" fill="${DONKER}"/>`;
const stang = (y: number, breed: number): string => `
  <rect x="120" y="${y - 8}" width="${breed - 240}" height="16" rx="8" fill="#c99a3c" stroke="#5e4515" stroke-width="3"/>
  <rect x="126" y="${y - 5}" width="${breed - 252}" height="4" rx="2" fill="#f1d88a"/>`;
const zigzag = (breed: number): string =>
  Array.from({ length: Math.floor((breed - 252) / 31) }, (_, i) => {
    const x = 126 + i * 31;
    return `M${x} 150 L${x + 15.5} 164 L${x + 31} 150 Z`;
  }).join(' ');

// Een breder rek (één lange stang) houdt dezelfde kroonlijst in het midden; links en rechts
// loopt de lijst recht door tot de palen.
function rekSvg(stangen: number[], rij: number, hoog: number, breed: number): string {
  const lat = hoog - 100; // de onderste dwarslat
  const d = breed - 1000;
  return `<svg viewBox="0 0 ${breed} ${hoog}" preserveAspectRatio="none">
  <ellipse cx="${breed / 2}" cy="${hoog - 10}" rx="${breed / 2 - 20}" ry="12" fill="rgba(60,30,10,0.22)"/>
  ${d > 0 ? `<rect x="118" y="108" width="${breed - 236}" height="50" fill="${HOUT}" stroke="${RAND}" stroke-width="4"/>
  <rect x="130" y="116" width="${breed - 260}" height="12" fill="${LICHT}"/>` : ''}
  <g transform="translate(${d / 2} 0)">
  <path d="M118 158 L118 108 C240 108 330 52 440 50 L560 50 C670 52 760 108 882 108 L882 158 Z" fill="${HOUT}" stroke="${RAND}" stroke-width="4" stroke-linejoin="round"/>
  <path d="M130 116 C240 116 330 64 440 60 L440 72 C340 76 250 126 130 128 Z" fill="${LICHT}"/>
  <path d="M870 116 C760 116 670 64 560 60 L560 72 C660 76 750 126 870 128 Z" fill="${LICHT}"/>
  <path d="M250 140 C280 112 340 92 400 88 C370 112 320 132 250 140 Z" fill="${DONKER}"/>
  <path d="M750 140 C720 112 660 92 600 88 C630 112 680 132 750 140 Z" fill="${DONKER}"/>
  <circle cx="170" cy="132" r="16" fill="${HOUT}" stroke="${RAND}" stroke-width="4"/>
  <circle cx="170" cy="132" r="6" fill="${DONKER}"/>
  <circle cx="830" cy="132" r="16" fill="${HOUT}" stroke="${RAND}" stroke-width="4"/>
  <circle cx="830" cy="132" r="6" fill="${DONKER}"/>
  <rect x="468" y="56" width="64" height="102" fill="${HOUT}" stroke="${RAND}" stroke-width="4"/>
  <rect x="478" y="96" width="10" height="56" fill="${DONKER}"/>
  <rect x="512" y="96" width="10" height="56" fill="${DONKER}"/>
  <circle cx="500" cy="48" r="38" fill="${HOUT}" stroke="${RAND}" stroke-width="4"/>
  <circle cx="500" cy="48" r="25" fill="${LICHT}" stroke="${RAND}" stroke-width="3"/>
  <circle cx="500" cy="48" r="12" fill="${HOUT}" stroke="${RAND}" stroke-width="3"/>
  </g>
  <path d="${zigzag(breed)}" fill="${DONKER}"/>
  <rect x="118" y="146" width="${breed - 236}" height="6" fill="${DONKER}"/>
  <rect x="118" y="${lat}" width="${breed - 236}" height="20" rx="10" fill="${HOUT}" stroke="${RAND}" stroke-width="4"/>
  <rect x="124" y="${lat + 4}" width="${breed - 248}" height="5" rx="2" fill="${LICHT}"/>
  ${[0.3, 0.5, 0.7].map((f) => `<ellipse cx="${breed * f}" cy="${lat + 10}" rx="${f === 0.5 ? 30 : 16}" ry="${f === 0.5 ? 18 : 14}" fill="${HOUT}" stroke="${RAND}" stroke-width="4"/>`).join('')}
  ${stangen.map((y) => stang(y, breed)).join('')}
  ${paal(100, stangen, rij, hoog)}
  ${paal(breed - 100, stangen, rij, hoog)}
  ${voet(100, hoog - 10, false)}
  ${voet(breed - 100, hoog - 10, true)}
  <path d="M${breed - 72} 190 L${breed - 54} 196 L${breed - 54} 380 C${breed - 54} 392 ${breed - 64} 398 ${breed - 74} 396" fill="none" stroke="#c99a3c" stroke-width="7" stroke-linecap="round"/>
  <circle cx="${breed - 78}" cy="395" r="9" fill="#c99a3c" stroke="#5e4515" stroke-width="3"/>
</svg>`;
}

// Eén klok aan een riempje, 100 breed. De stang ligt op y 0; het lusje eromheen steekt
// erboven uit, daarom begint de viewBox op -10 (140 hoog). De klepel draait om (50, 40) en
// hangt vóór de donkere opening onder de rand uit; een clipPath (opening plus alles eronder)
// houdt de steel uit het lijf van de klok. De band om het middel heeft de kleur van de toon.
let klokNr = 0;
const klok = (id: string): string => `<svg viewBox="0 -10 100 140">
  <defs><clipPath id="${id}"><ellipse cx="50" cy="108.5" rx="38" ry="3.2"/><rect x="0" y="108.5" width="100" height="25"/></clipPath></defs>
  <rect x="44" y="0" width="12" height="27" fill="#8b4a22" stroke="#3d1c0b" stroke-width="2.5"/>
  <rect x="41" y="-8" width="18" height="15" rx="4" fill="#7a3e1a" stroke="#3d1c0b" stroke-width="2.5"/>
  <rect x="36" y="24" width="28" height="11" rx="4" fill="#b08534" stroke="#5e4515" stroke-width="2.5"/>
  <path d="M35 34 C27 34 25 44 24 58 C23 78 17 92 7 101 C4 104 5 108 9 108 L91 108 C95 108 96 104 93 101 C83 92 77 78 76 58 C75 44 73 34 65 34 Z" fill="#d6aa4c" stroke="#5e4515" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M37 40 C33 46 32 60 31 72 C30 84 26 92 19 99 L27 99 C33 92 37 82 38 70 C39 58 40 48 43 40 Z" fill="#f3dc92"/>
  <path d="M65 40 C69 48 69 62 70 74 C71 86 77 94 85 101 L91 102 C83 94 77 84 76 72 C75 58 74 46 70 40 Z" fill="#a97f2e"/>
  <path class="luiklok__band" d="M24.6 52 L76.4 52 L77 61 L24 61 Z" stroke="#5e4515" stroke-width="2"/>
  <path d="M10 94 L90 94" stroke="#a97f2e" stroke-width="2.5"/>
  <ellipse cx="50" cy="108" rx="45" ry="6" fill="#b8903a" stroke="#5e4515" stroke-width="2.5"/>
  <ellipse cx="50" cy="108.5" rx="38" ry="3.2" fill="#4a3410"/>
  <g clip-path="url(#${id})"><g class="luiklok__klepel">
    <rect x="47.5" y="38" width="5" height="80" rx="2.5" fill="#5e4515"/>
    <circle cx="50" cy="120" r="7.5" fill="#7a5a1c" stroke="#3d2a08" stroke-width="2.5"/>
  </g></g>
</svg>`;

// Klankringen links en rechts van de klok.
const GOLVEN = `<svg viewBox="0 0 180 80">
  <g fill="none" stroke-linecap="round">
    <path d="M30 20 Q16 40 30 60 M14 10 Q-4 40 14 70 M150 20 Q164 40 150 60 M166 10 Q184 40 166 70" stroke="#fff" stroke-width="10"/>
    <path class="luiklok__golf" d="M30 20 Q16 40 30 60 M14 10 Q-4 40 14 70 M150 20 Q164 40 150 60 M166 10 Q184 40 166 70" stroke-width="5"/>
  </g>
</svg>`;

function klokHtml(): string {
  return `<span class="luiklok"><span class="luiklok__lijf">${klok(`klok-opening-${++klokNr}`)}</span><span class="luiklok__golven">${GOLVEN}</span></span>`;
}

// Drie vormen: vier klokken per stang (breed rek), twee per stang (hoog rek, voor een staand
// vak) of alles aan één lange stang (extra breed rek, voor een liggende telefoon).
// legKlokken kiest de vorm waarin de klokken het grootst worden (de lange stang alleen als de
// klokken daar echt groter worden, anders blijven pc en tablet zoals ze waren), maakt het rek
// zo groot als past en zet per klok de plek in px: --kl/--kt (linksboven van het vak onder de
// stang), --kw/--kh (maat van dat vak) en --kb (breedte van de grootste klok; --klok per toon).
const VORMEN = [
  { kolommen: 4, klok: 152, voorkeur: 1 },
  { kolommen: 2, klok: 250, voorkeur: 1 },
  { kolommen: 8, klok: 150, voorkeur: 1.2 },
];
const BOVEN = 175; // de eerste stang
const ONDER = 85; // van de laatste rij tot de grond

function legKlokken(vak: HTMLElement, staven: HTMLElement[]): void {
  const rek = vak.querySelector<HTMLElement>('.klokken-rek');
  if (!rek) return;
  const w = vak.clientWidth - 16;
  const h = vak.clientHeight - 16;
  if (w <= 0 || h <= 0) return;
  const n = staven.length;
  const keuzes = VORMEN.map((v) => {
    const rijen = Math.ceil(n / v.kolommen);
    const rij = v.klok * 1.4 + 55;
    const hoog = Math.round(BOVEN + rijen * rij + ONDER);
    // 130 aan elke kant voor de palen; minstens 1000 (het gewone rek).
    const breed = Math.round(Math.max(1000, 260 + Math.min(n, v.kolommen) * v.klok * 1.15));
    return { ...v, rijen, rij, hoog, breed, schaal: Math.min(w / breed, h / hoog) };
  });
  const maat = (k: (typeof keuzes)[number]): number => (k.schaal * k.klok) / k.voorkeur;
  const { schaal, rijen, rij, hoog, breed: rekBreed, klok } = keuzes.reduce((a, b) => (maat(b) > maat(a) ? b : a));
  const rw = rekBreed * schaal;
  const rx = (vak.clientWidth - rw) / 2;
  const ry = (vak.clientHeight - hoog * schaal) / 2;
  const stangen = Array.from({ length: rijen }, (_, i) => BOVEN + i * rij);
  const vorm = `${rijen}:${hoog}:${rekBreed}`;
  if (rek.dataset.vorm !== vorm) {
    rek.dataset.vorm = vorm;
    rek.innerHTML = rekSvg(stangen, rij, hoog, rekBreed);
  }
  Object.assign(rek.style, { left: `${rx}px`, top: `${ry}px`, width: `${rw}px`, height: `${hoog * schaal}px` });
  // Eerlijk verdeeld over de rijen (8 over 2: 4 en 4; 5 over 2: 3 en 2).
  const per = Array.from({ length: rijen }, (_, i) => Math.floor(n / rijen) + (i < n % rijen ? 1 : 0));
  let positie = 0;
  per.forEach((m, r) => {
    const ruimte = rekBreed - 260;
    const breed = Math.min(ruimte / m, klok * 1.3);
    for (let j = 0; j < m; j++, positie++) {
      const s = staven[positie].style;
      const midden = 130 + (ruimte * (j + 0.5)) / m;
      s.setProperty('--kl', `${rx + (midden - breed / 2) * schaal}px`);
      s.setProperty('--kt', `${ry + stangen[r] * schaal}px`);
      s.setProperty('--kw', `${breed * schaal}px`);
      s.setProperty('--kh', `${(rij - 10) * schaal}px`);
      s.setProperty('--kb', `calc(${klok * schaal}px * var(--klok, 1))`);
    }
  });
}

// Het rek staat achter de klokken; per knop een klok, groot bij lage tonen, klein bij hoge.
export const KLOKKEN: Uiterlijk = {
  achter() {
    const rek = document.createElement('div');
    rek.className = 'klokken-rek';
    return rek;
  },
  knop(staaf, toon) {
    staaf.style.setProperty('--klok', (1 - toon * 0.035).toFixed(3));
    staaf.insertAdjacentHTML('beforeend', klokHtml());
  },
  leg: legKlokken,
};
