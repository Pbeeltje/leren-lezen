import type { Decor } from './achtergrond.ts';
import { el, kortAan, plaatje, svgUitTekst } from './hulp.ts';

// Herfstbos: je staat midden in het bos. Stammen die hoger zijn dan het scherm (ver weg
// bleek, dichtbij groot en donker), een bladerdak in herfstkleuren dat van boven
// binnenhangt, zonnestralen erdoorheen en zacht glinsterende lichtvlekken. Vooraan staan
// varens en struiken over de rand van de bosgrond. Er dwarrelen steeds blaadjes naar
// beneden. Een eekhoorn zit op een tak van de rechterstam en rent af en toe naar het
// puntje; soms rent er een eekhoorn over de grond (nooit twee tegelijk). Bij een goed
// antwoord kijkt een egeltje uit de bladerhoop; aan het eind van een sessie blaast een
// windvlaag een grote wervel blaadjes over het scherm en zwaait het bladerdak.
// Dieren en paddenstoelen zijn Fluent Emoji, de rest is zelf getekend.

const GROND = `
<svg viewBox="0 0 1000 200" preserveAspectRatio="none">
  <path d="M0 64 C200 34 380 52 520 72 C700 96 860 46 1000 58 L1000 200 L0 200 Z" fill="#c9a24c"/>
  <path d="M0 116 C220 92 420 106 620 120 C800 132 900 108 1000 112 L1000 200 L0 200 Z" fill="#b8733b"/>
  <g class="herfst-grond__blad"></g>
</svg>`;

const svgUrl = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

// Achtergrondbomen in drie lagen diepte: ver weg smal, bleek en wazig, dichterbij breder
// en donkerder. Ze worden op de echte maat van het scherm getekend (en opnieuw bij een
// andere maat), zodat takken niet mee uitrekken. Stammen lopen taps toe en buigen een
// beetje; een paar takken per boom, sommige kaal met twijgjes, andere met een tros blad.
interface BoomLaag {
  afstand: [number, number];
  breedte: [number, number];
  kleur: string;
  schaduw: string;
  blad: number;
  bladKleuren: string[];
  onderKleur: string;
  zaad: number;
}
const LAGEN: Record<'ver' | 'midden' | 'dichtbij', BoomLaag> = {
  ver: { afstand: [60, 110], breedte: [12, 20], kleur: '#f3d2a2', schaduw: '#e9c08e', blad: 7, bladKleuren: ['#f4c88f', '#f0b47c', '#f7d89c'], onderKleur: '#e9b583', zaad: 11 },
  midden: { afstand: [130, 210], breedte: [26, 42], kleur: '#cf9562', schaduw: '#b97e4f', blad: 10, bladKleuren: ['#eba45c', '#e2804c', '#f1c26a', '#e8934f'], onderKleur: '#c86d3e', zaad: 23 },
  dichtbij: { afstand: [330, 480], breedte: [58, 80], kleur: '#a4673c', schaduw: '#87522c', blad: 13, bladKleuren: ['#f28b2c', '#e4572e', '#f6c445', '#d9682a', '#f5a623', '#c8452c'], onderKleur: '#a83c22', zaad: 37 },
};

function tekenBomen(laag: BoomLaag, w: number, h: number): string {
  let zaad = laag.zaad;
  const rnd = () => {
    zaad = (zaad * 16807) % 2147483647;
    return zaad / 2147483647;
  };
  const tussen = ([a, b]: [number, number]) => a + rnd() * (b - a);
  // Per boom eerst de takken en dan de stam, zodat de stam de voet van zijn takken bedekt.
  let bomen = '';
  let x = tussen(laag.afstand) * 0.4;
  let n = 0;
  while (x < w + 40) {
    const b = tussen(laag.breedte);
    const boven = b * 0.62;
    const buig = (rnd() - 0.5) * b * 0.4;
    // Midden van de stam op hoogte y (0 = boven, h = onder).
    const midden = (y: number) => x + buig * 1.6 * (1 - y / h);
    const dikte = (y: number) => boven + (b - boven) * (y / h);
    let stam = `<path d="M${x - b / 2 - b * 0.18} ${h} C${x - b / 2} ${h * 0.92} ${x - b / 2 + buig} ${h * 0.5} ${x - boven / 2 + buig * 1.6} -4 L${x + boven / 2 + buig * 1.6} -4 C${x + b / 2 + buig} ${h * 0.5} ${x + b / 2} ${h * 0.92} ${x + b / 2 + b * 0.18} ${h} Z" fill="${laag.kleur}"/>`;
    stam += `<path d="M${x - b / 2 - b * 0.18} ${h} C${x - b / 2} ${h * 0.92} ${x - b / 2 + buig} ${h * 0.5} ${x - boven / 2 + buig * 1.6} -4 L${x - boven / 2 + buig * 1.6 + boven * 0.3} -4 C${x - b / 2 + buig + b * 0.3} ${h * 0.5} ${x - b / 2 + b * 0.3} ${h * 0.92} ${x - b / 2 + b * 0.1} ${h} Z" fill="${laag.schaduw}"/>`;

    // Twee of drie takken, afwisselend links en rechts, schuin omhoog.
    let takken = '';
    const aantal = 2 + (rnd() < 0.4 ? 1 : 0);
    let kant = rnd() < 0.5 ? -1 : 1;
    for (let t = 0; t < aantal; t++) {
      const y = h * (0.14 + 0.5 * ((t + rnd() * 0.8) / aantal));
      const d = dikte(y);
      const sx = midden(y) + kant * d * 0.3;
      const lengte = d * (1.6 + rnd() * 1.4) + b * 0.4;
      const hoek = (25 + rnd() * 30) * (Math.PI / 180);
      const ex = sx + kant * Math.cos(hoek) * lengte;
      const ey = y - Math.sin(hoek) * lengte;
      const cx = sx + kant * lengte * 0.55;
      const cy = y - lengte * 0.12;
      const t0 = Math.max(1.5, d * 0.2);
      // Gevulde, taps toelopende tak (aan de voet dik, aan het eind dun).
      takken += `<path d="M${sx} ${y - t0} Q${cx} ${cy - t0 * 0.6} ${ex} ${ey} Q${cx} ${cy + t0 * 0.6} ${sx} ${y + t0} Z" fill="${laag.kleur}"/>`;
      if (rnd() < 0.5) {
        // Kaal: een paar dunne twijgjes, precies op de (gebogen) tak en in de richting
        // waarin de tak daar loopt, een beetje opzij gedraaid.
        for (const [f, a] of [[0.55, -0.55], [0.75, 0.5], [0.92, -0.35]] as const) {
          const g = 1 - f;
          const tx = g * g * sx + 2 * g * f * cx + f * f * ex;
          const ty = g * g * y + 2 * g * f * cy + f * f * ey;
          const rx = 2 * g * (cx - sx) + 2 * f * (ex - cx);
          const ry = 2 * g * (cy - y) + 2 * f * (ey - cy);
          const ta = Math.atan2(ry, rx) + a * kant;
          const tl = lengte * (0.32 - f * 0.12);
          const tw = Math.max(0.8, t0 * (1 - f) * 0.6);
          takken += `<path d="M${tx.toFixed(1)} ${ty.toFixed(1)} l${(Math.cos(ta) * tl).toFixed(1)} ${(Math.sin(ta) * tl).toFixed(1)}" stroke="${laag.kleur}" stroke-width="${tw.toFixed(1)}" stroke-linecap="round"/>`;
        }
      } else {
        // Met blad: een tros blaadjes rond het eind van de tak.
        const r = lengte * (0.35 + rnd() * 0.2);
        takken += bladerMassa([[ex - kant * r * 0.3, ey, r]], laag.blad, [0], laag.bladKleuren, laag.onderKleur, laag.zaad + n * 13 + t);
      }
      kant = -kant;
    }
    bomen += takken + stam;
    x += tussen(laag.afstand);
    n++;
  }
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true">${bomen}</svg>`;
}

// Grote stam vlakbij, met schors en wortels; hoger dan het scherm.
const STAM = `
<svg viewBox="0 0 120 400" preserveAspectRatio="none" aria-hidden="true">
  <path d="M30 0 L90 0 C88 120 92 260 96 350 C100 372 112 388 120 400 L0 400 C10 388 22 372 24 350 C28 260 32 120 30 0 Z" fill="#7a4a2a"/>
  <path d="M30 0 L48 0 C46 120 48 260 50 360 L40 400 L0 400 C10 388 22 372 24 350 C28 260 32 120 30 0 Z" fill="#5f3a1f"/>
  <g fill="none" stroke="#4e2f18" stroke-width="2.5" stroke-linecap="round" opacity="0.7">
    <path d="M60 10 C58 60 62 100 60 150"/><path d="M74 60 C76 120 72 170 76 230"/>
    <path d="M56 200 C54 250 58 290 56 340"/><path d="M80 270 C82 310 84 340 90 380"/>
    <path d="M42 90 C40 130 42 170 40 210"/>
  </g>
  <path d="M84 0 C82 120 86 260 90 350" fill="none" stroke="#a06a40" stroke-width="4" opacity="0.6"/>
</svg>`;

// Tak naar binnen voor de eekhoorn (aan de rechterstam), met een paar blaadjes.
const TAK = `
<svg viewBox="0 0 240 60" preserveAspectRatio="none" aria-hidden="true">
  <path d="M240 18 C180 20 110 26 6 34 L4 44 C110 40 180 40 240 44 Z" fill="#6b3f22" stroke="#4e2f18" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M120 30 C110 18 98 12 84 10" fill="none" stroke="#4e2f18" stroke-width="5" stroke-linecap="round"/>
  <ellipse cx="82" cy="10" rx="11" ry="6" fill="#f28b2c" transform="rotate(-20 82 10)"/>
  <ellipse cx="10" cy="32" rx="10" ry="6" fill="#e4572e" transform="rotate(25 10 32)"/>
  <ellipse cx="22" cy="46" rx="9" ry="5" fill="#f6c445" transform="rotate(-15 22 46)"/>
</svg>`;

// Bladerdak van losse blaadjes: per tros een donkere ondergrond met daarover veel kleine
// blaadjes in herfstkleuren, dichter aan de rand zodat de omtrek rafelig is (ronde
// bollen leken op ballonnen). Vaste "willekeur" (eigen teller), zodat de tegel naadloos
// en elke keer hetzelfde is.
type Tros = [cx: number, cy: number, r: number];
const DAK_KLEUREN = ['#f28b2c', '#e4572e', '#f6c445', '#d9682a', '#f5a623', '#c8452c', '#eaa13a'];
function bladerMassa(
  trossen: Tros[],
  blad: number,
  verschuivingen: number[] = [0],
  kleuren: string[] = DAK_KLEUREN,
  onderKleur = '#a83c22',
  begin = 7,
): string {
  let zaad = begin;
  const rnd = () => {
    zaad = (zaad * 16807) % 2147483647;
    return zaad / 2147483647;
  };
  let onder = '';
  let blaadjes = '';
  for (const [cx, cy, r] of trossen) {
    const aantal = Math.round((r * r) / (blad * blad) * 2.2);
    let deze = '';
    for (let i = 0; i < aantal; i++) {
      // Meer blaadjes naar de rand toe (wortel van rnd geeft een gelijkmatige schijf; de
      // macht kleiner dan 0.5 duwt ze naar buiten).
      const hoek = rnd() * Math.PI * 2;
      const afstand = r * Math.pow(rnd(), 0.35) * 1.02;
      const x = cx + Math.cos(hoek) * afstand;
      const y = cy + Math.sin(hoek) * afstand;
      const maat = blad * (0.7 + rnd() * 0.6);
      const draai = Math.round(rnd() * 360);
      const kleur = kleuren[Math.floor(rnd() * kleuren.length)];
      deze += `<path transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${draai}) scale(${(maat / 10).toFixed(2)})" d="M0 -10 C6 -5 6 5 0 10 C-6 5 -6 -5 0 -10 Z" fill="${kleur}"/>`;
    }
    for (const dx of verschuivingen) {
      onder += `<circle cx="${cx + dx}" cy="${cy}" r="${(r * 0.86).toFixed(1)}" fill="${onderKleur}"/>`;
      blaadjes += dx ? `<g transform="translate(${dx} 0)">${deze}</g>` : deze;
    }
  }
  return onder + blaadjes;
}
function dakRand(): string {
  // Grote blaadjes (zo groot als in de hoektrossen; kleine waren te druk). De tegel steekt
  // voor een groot deel boven het scherm uit: je ziet alleen de onderkant van het dak.
  const trossen: Tros[] = [];
  for (let i = 0; i < 8; i++) trossen.push([50 + i * 100, 50 + ((i * 5) % 4) * 14, 82 + ((i * 7) % 3) * 16]);
  const massa = bladerMassa(trossen, 22, [0, -800, 800]);
  return svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 200"><rect y="-10" width="800" height="90" fill="#a83c22"/>${massa}</svg>`);
}
const DAK_HOEK = `
<svg viewBox="0 0 400 360" aria-hidden="true">
  ${bladerMassa(
    [
      [60, 50, 100], [190, 24, 86], [310, 10, 72], [380, 20, 44], [40, 190, 76],
      [135, 130, 66], [235, 82, 56], [18, 290, 52], [92, 236, 44], [178, 176, 34],
    ],
    9,
  )}
</svg>`;

// Bladertapijt op de bosgrond: een herhalende tegel vol blaadjes, onderaan het dichtst.
function bladTapijt(): string {
  let zaad = 53;
  const rnd = () => {
    zaad = (zaad * 16807) % 2147483647;
    return zaad / 2147483647;
  };
  const kleuren = [...DAK_KLEUREN, '#b8733b', '#8f5a2c'];
  let blaadjes = '';
  for (let i = 0; i < 150; i++) {
    const x = rnd() * 600;
    const y = 120 - Math.pow(rnd(), 1.6) * 110;
    const maat = 7 + rnd() * 5;
    const kleur = kleuren[Math.floor(rnd() * kleuren.length)];
    const draai = Math.round(rnd() * 360);
    const vorm = `<path transform="rotate(${draai}) scale(${(maat / 10).toFixed(2)}, ${(maat / 16).toFixed(2)})" d="M0 -10 C6 -5 6 5 0 10 C-6 5 -6 -5 0 -10 Z" fill="${kleur}"/>`;
    // Blaadjes over de naad komen aan de andere kant terug.
    for (const dx of x < 12 ? [0, 600] : x > 588 ? [0, -600] : [0]) {
      blaadjes += `<g transform="translate(${(x + dx).toFixed(1)} ${y.toFixed(1)})">${vorm}</g>`;
    }
  }
  return svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 120">${blaadjes}</svg>`);
}

// Ondergroei vooraan: een rij varens over de hele breedte (tegel) en dikke struiken in
// de hoeken, voor de bosgrond langs, zodat je echt in het bos staat.
function varen(x: number, h: number, kleur: string, buig: number): string {
  let blaadjes = '';
  for (let j = 1; j < 7; j++) {
    const y = 100 - (h * j) / 7;
    const l = 14 * (1 - j / 8);
    blaadjes += `<path d="M${x + buig * (j / 7)} ${y} q${-l} ${-4} ${-l * 1.4} ${-10} M${x + buig * (j / 7)} ${y} q${l} ${-4} ${l * 1.4} ${-10}" stroke="${kleur}" stroke-width="5" stroke-linecap="round" fill="none"/>`;
  }
  return `<path d="M${x} 100 Q${x + buig * 0.4} ${100 - h * 0.6} ${x + buig} ${100 - h}" stroke="${kleur}" stroke-width="3" fill="none"/>${blaadjes}`;
}
function varenRand(): string {
  const kleuren = ['#8a6a2a', '#a07a30', '#6f5a26', '#b0843a'];
  let v = '';
  [[20, 70, -10], [48, 88, 6], [80, 60, 12], [120, 82, -8], [150, 66, 10], [190, 90, -6], [222, 58, 8], [262, 78, -12], [296, 72, 6]].forEach(([x, h, b], i) => {
    v += varen(x, h, kleuren[i % kleuren.length], b);
  });
  return svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 100">${v}</svg>`);
}
const STRUIK = `
<svg viewBox="0 0 300 200" aria-hidden="true">
  ${bladerMassa(
    [[70, 150, 66], [160, 128, 74], [240, 160, 58], [112, 92, 46], [205, 98, 40], [34, 118, 36]],
    9,
    [0],
    ['#9b6a2a', '#b27a30', '#c58a35', '#8a5a24', '#d0742e', '#c8452c'],
    '#6d4a1e',
    91,
  )}
</svg>`;

// Bladerhoop: een berg blaadjes in herfstkleuren, onderaan breed.
const HOOP = `
<svg viewBox="0 0 200 90" preserveAspectRatio="none" aria-hidden="true">
  <path d="M4 90 C10 50 50 20 100 18 C150 20 190 50 196 90 Z" fill="#c8562e"/>
  <g>
    <ellipse cx="40" cy="62" rx="22" ry="11" fill="#f28b2c" transform="rotate(-20 40 62)"/>
    <ellipse cx="78" cy="38" rx="22" ry="11" fill="#f6c445" transform="rotate(15 78 38)"/>
    <ellipse cx="122" cy="34" rx="24" ry="11" fill="#e4572e" transform="rotate(-12 122 34)"/>
    <ellipse cx="160" cy="62" rx="22" ry="11" fill="#f5a623" transform="rotate(25 160 62)"/>
    <ellipse cx="100" cy="64" rx="26" ry="12" fill="#f28b2c" transform="rotate(6 100 64)"/>
    <ellipse cx="60" cy="80" rx="20" ry="9" fill="#e4572e" transform="rotate(10 60 80)"/>
    <ellipse cx="140" cy="82" rx="22" ry="9" fill="#f6c445" transform="rotate(-8 140 82)"/>
    <ellipse cx="100" cy="24" rx="16" ry="8" fill="#f5a623" transform="rotate(-30 100 24)"/>
  </g>
</svg>`;

// Twee soorten blaadjes (esdoorn en ovaal), in een paar herfstkleuren.
const KLEUREN: [string, string][] = [
  ['#f28b2c', '#b8561a'],
  ['#e4572e', '#9c2f17'],
  ['#f6c445', '#c08a12'],
  ['#c8452c', '#7e2414'],
  ['#f5a623', '#b56f0c'],
];
const blad = (i: number): string => {
  const [kleur, nerf] = KLEUREN[i % KLEUREN.length];
  return i % 2 === 0
    ? `<svg viewBox="0 0 40 42" aria-hidden="true"><path d="M20 2 L23 11 L30 7 L28 16 L37 15 L31 22 L35 25 L25 27 L26 33 L20 29 L14 33 L15 27 L5 25 L9 22 L3 15 L12 16 L10 7 L17 11 Z" fill="${kleur}" stroke="${nerf}" stroke-width="1.5" stroke-linejoin="round"/><path d="M20 12 V41 M20 22 L28 17 M20 22 L12 17" fill="none" stroke="${nerf}" stroke-width="1.6" stroke-linecap="round"/></svg>`
    : `<svg viewBox="0 0 40 42" aria-hidden="true"><path d="M20 2 C34 10 36 28 20 38 C4 28 6 10 20 2 Z" fill="${kleur}" stroke="${nerf}" stroke-width="1.5"/><path d="M20 6 V41 M20 18 L27 13 M20 26 L13 21" fill="none" stroke="${nerf}" stroke-width="1.6" stroke-linecap="round"/></svg>`;
};

const EEKHOORN = 'assets/achtergrond/herfst-eekhoorn.svg';
const LOOP_MS = 9000;
const TAK_MS = 4600;
const VLAAG_MS = 7500;

export function maakHerfstDecor(): Decor {
  const root = el('div', 'decor decor-herfst');
  // Drie rijen stammen met nevel ertussen: hoe verder weg, hoe bleker.
  const boomLagen = (['ver', 'midden', 'dichtbij'] as const).map((naam) => {
    const laag = el('div', `herfst-stammen herfst-stammen--${naam}`, root);
    if (naam !== 'dichtbij') el('div', `herfst-nevel herfst-nevel--${naam}`, root);
    return { laag, instelling: LAGEN[naam], maat: '' };
  });
  // Tekent de bomen opnieuw als de maat van het scherm veranderd is.
  const plaats = () => {
    for (const b of boomLagen) {
      const w = Math.round(b.laag.clientWidth);
      const h = Math.round(b.laag.clientHeight);
      if (!w || !h || b.maat === `${w}x${h}`) continue;
      b.maat = `${w}x${h}`;
      b.laag.innerHTML = tekenBomen(b.instelling, w, h);
    }
  };

  // Zonnestralen door het bladerdak en lichtvlekken die zacht glinsteren.
  const licht = el('div', 'herfst-licht', root);
  for (let i = 0; i < 4; i++) el('div', 'herfst-straal', licht);

  // Grote stammen aan de randen; de rechter heeft een tak met de eekhoorn.
  const stamLinks = el('div', 'herfst-stam herfst-stam--links', root);
  svgUitTekst(STAM, 'herfst-stam__svg', stamLinks);
  const stamRechts = el('div', 'herfst-stam herfst-stam--rechts', root);
  svgUitTekst(STAM, 'herfst-stam__svg', stamRechts);
  const tak = el('div', 'herfst-tak', root);
  svgUitTekst(TAK, 'herfst-tak__svg', tak);
  // De eekhoorn op de tak: buitenste laag loopt, middelste huppelt, binnenste draait om.
  const takEekhoorn = el('div', 'herfst-eekhoorn', tak);
  const hup = el('div', 'herfst-eekhoorn__hup', takEekhoorn);
  plaatje(EEKHOORN, 'herfst-eekhoorn__lijf', hup);

  const grond = svgUitTekst(GROND, 'herfst-grond', root);
  // Losse blaadjes op de bosgrond.
  const strooisel = grond.querySelector('.herfst-grond__blad') as SVGGElement;
  let ellipsen = '';
  for (let i = 0; i < 46; i++) {
    const x = (i * 211) % 1000;
    const y = 130 + ((i * 37) % 64);
    ellipsen += `<ellipse cx="${x}" cy="${y}" rx="9" ry="3.5" fill="${KLEUREN[i % KLEUREN.length][0]}" opacity="0.85"/>`;
  }
  strooisel.innerHTML = ellipsen;

  // Blaadjes op de bosgrond, daarvoor de varens.
  el('div', 'herfst-tapijt', root).style.backgroundImage = bladTapijt();
  // Varens over de rand van de bosgrond.
  el('div', 'herfst-varens', root).style.backgroundImage = varenRand();
  const loopbaan = el('div', 'herfst-loopbaan', root);

  plaatje('assets/achtergrond/herfst-paddenstoel.svg', 'herfst-paddenstoel herfst-paddenstoel--1', root);
  plaatje('assets/achtergrond/herfst-paddenstoel.svg', 'herfst-paddenstoel herfst-paddenstoel--2', root);
  plaatje('assets/achtergrond/herfst-paddenstoel.svg', 'herfst-paddenstoel herfst-paddenstoel--3', root);
  plaatje('assets/achtergrond/herfst-kastanje.svg', 'herfst-kastanje', root);

  // De egel zit verstopt achter de bladerhoop (het gat knipt hem onderaan af).
  const hoop = el('div', 'herfst-hoop', root);
  const gat = el('div', 'herfst-hoop__gat', hoop);
  const egel = plaatje('assets/achtergrond/herfst-egel.svg', 'herfst-egel', gat);
  svgUitTekst(HOOP, 'herfst-hoop__bladeren', hoop);

  const vlekken = el('div', 'herfst-vlekken', root);
  for (let i = 0; i < 16; i++) {
    const v = el('div', 'herfst-vlek', vlekken);
    // De meeste vlekken op de bosgrond, een paar op de stammen.
    const opGrond = i < 10;
    v.style.left = `${(i * 23 + Math.random() * 10) % 100}%`;
    v.style.top = opGrond ? `${78 + Math.random() * 18}%` : `${25 + Math.random() * 45}%`;
    v.style.setProperty('--maat', `${opGrond ? 8 + Math.random() * 10 : 3 + Math.random() * 5}vw`);
    v.style.animationDuration = `${5 + Math.random() * 5}s`;
    v.style.animationDelay = `${-Math.random() * 10}s`;
  }

  // Struiken in de hoeken, helemaal vooraan.
  svgUitTekst(STRUIK, 'herfst-struik herfst-struik--links', root);
  svgUitTekst(STRUIK, 'herfst-struik herfst-struik--rechts', root);

  // Het bladerdak bovenaan: de rand over de hele breedte en twee dikke hoektrossen.
  const dak = el('div', 'herfst-dak', root);
  el('div', 'herfst-dak__rand', dak).style.backgroundImage = dakRand();
  const links = svgUitTekst(DAK_HOEK, 'herfst-dak__hoek herfst-dak__hoek--links', dak);
  const rechts = svgUitTekst(DAK_HOEK, 'herfst-dak__hoek herfst-dak__hoek--rechts', dak);

  // Dwarrelende blaadjes: buitenste laag valt, middelste zwaait, het blad zelf draait.
  const vallen = el('div', 'herfst-vallen', root);
  for (let i = 0; i < 14; i++) {
    const v = el('div', 'herfst-val', vallen);
    v.style.left = `${(i * 7.3 + Math.random() * 5) % 100}%`;
    v.style.setProperty('--maat', `${16 + Math.random() * 16}px`);
    v.style.setProperty('--drift', `${-8 + Math.random() * 16}vw`);
    v.style.animationDuration = `${13 + Math.random() * 9}s`;
    v.style.animationDelay = `${-Math.random() * 22}s`;
    const zwaai = el('div', 'herfst-val__zwaai', v);
    zwaai.style.animationDuration = `${2.4 + Math.random() * 1.6}s`;
    zwaai.style.animationDelay = `${-Math.random() * 3}s`;
    svgUitTekst(blad(i), 'herfst-blad', zwaai);
  }
  const vlaag = el('div', 'herfst-vlaag', root);

  const stil = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let levend = true;
  let bezig = false;
  let timer: number | undefined;
  const losseTimers = new Set<number>();
  const later = (f: () => void, ms: number) => {
    const t = window.setTimeout(() => {
      losseTimers.delete(t);
      if (levend) f();
    }, ms);
    losseTimers.add(t);
  };

  // Een eekhoorn rent over de bosgrond, met kleine sprongetjes.
  const rentOverGrond = () => {
    const naarRechts = Math.random() < 0.5;
    const r = el('div', 'herfst-renner', loopbaan);
    r.style.setProperty('--van-x', naarRechts ? '-15vw' : '108vw');
    r.style.setProperty('--naar-x', naarRechts ? '108vw' : '-15vw');
    const h = el('div', 'herfst-eekhoorn__hup', r);
    // De Fluent-eekhoorn kijkt naar links: naar rechts rennen = spiegelen.
    plaatje(EEKHOORN, `herfst-eekhoorn__lijf${naarRechts ? ' gespiegeld' : ''}`, h);
    later(() => r.remove(), LOOP_MS + 200);
  };

  function plan(): void {
    window.clearTimeout(timer);
    if (!levend || stil) return;
    timer = window.setTimeout(() => {
      if (bezig) return plan();
      bezig = true;
      const opGrond = Math.random() < 0.4;
      if (opGrond) rentOverGrond();
      else kortAan(takEekhoorn, 'rent', TAK_MS);
      later(() => {
        bezig = false;
        plan();
      }, (opGrond ? LOOP_MS : TAK_MS) + 2500);
    }, 5000 + Math.random() * 9000);
  }
  plan();

  // Blaadjes die van de hoop opwaaien.
  const waaiOp = (aantal: number) => {
    for (let i = 0; i < aantal; i++) {
      const b = el('div', 'herfst-opwaai', hoop);
      b.style.left = `${25 + Math.random() * 50}%`;
      b.style.setProperty('--dx', `${-50 + Math.random() * 100}px`);
      b.style.setProperty('--dy', `${-50 - Math.random() * 60}px`);
      b.style.setProperty('--draai', `${-200 + Math.random() * 400}deg`);
      b.style.animationDelay = `${(Math.random() * 0.25).toFixed(2)}s`;
      svgUitTekst(blad(i), 'herfst-blad', b);
      window.setTimeout(() => b.remove(), 1900);
    }
  };

  const juich = () => {
    kortAan(egel, 'kijkt', 2600);
    waaiOp(7);
  };

  // Einde van een sessie: een windvlaag met een grote wervel blaadjes, de bomen zwaaien.
  const feest = () => {
    juich();
    if (stil) return;
    bezig = true;
    window.clearTimeout(timer);
    kortAan(links, 'waait', VLAAG_MS - 1000);
    kortAan(rechts, 'waait', VLAAG_MS - 1000);
    // De wervel: blaadjes op een draaiende cirkel die samen over het scherm reist.
    for (let i = 0; i < 30; i++) {
      const o = el('div', 'herfst-vlaag__blad', vlaag);
      // Alle blaadjes draaien om hetzelfde middelpunt (op 46% hoogte), elk op een eigen afstand.
      const straal = 6 + Math.random() * 14;
      o.style.top = `calc(46% - ${straal}vh)`;
      o.style.animationDelay = `${Math.random() * 0.3}s`;
      const w = el('div', 'herfst-vlaag__wervel', o);
      w.style.setProperty('--straal', `${straal}vh`);
      w.style.animationDelay = `${-(i / 30) * 1.8}s`;
      svgUitTekst(blad(i), 'herfst-blad', w);
    }
    // Losse blaadjes die meewaaien, boven en onder de wervel.
    for (let i = 0; i < 12; i++) {
      const o = el('div', 'herfst-vlaag__blad herfst-vlaag__blad--los', vlaag);
      o.style.top = `${18 + Math.random() * 60}%`;
      o.style.animationDelay = `${0.2 + Math.random() * 1.6}s`;
      const w = el('div', 'herfst-vlaag__fladder', o);
      w.style.animationDelay = `${-Math.random()}s`;
      svgUitTekst(blad(i + 1), 'herfst-blad', w);
    }
    later(() => vlaag.replaceChildren(), VLAAG_MS + 2500);
    later(() => {
      bezig = false;
      plan();
    }, VLAAG_MS + 3000);
  };

  const vernietig = () => {
    levend = false;
    window.clearTimeout(timer);
    for (const t of losseTimers) window.clearTimeout(t);
    losseTimers.clear();
  };
  return { element: root, juich, feest, plaats, vernietig };
}
