import type { Decor } from './achtergrond.ts';
import { el, kortAan, plaatje, svgUitTekst } from './hulp.ts';

// Onder water: lichtstralen van boven, een zandbodem met wuivend zeewier, koraal, een
// anemoon met een clownvisje erin, een krab die heen en weer loopt en opstijgende belletjes.
// Af en toe zwemt er een vis voorbij (nooit twee tegelijk). Bij een goed antwoord springt
// het clownvisje uit de anemoon; aan het eind van een sessie zwemmen een schildpad en een
// school visjes voorbij. Dieren zijn Fluent Emoji, de rest is zelf getekend.

const ZAND = `
<svg viewBox="0 0 1000 200" preserveAspectRatio="none">
  <path d="M0 90 C150 60 300 70 450 95 C620 122 800 70 1000 85 L1000 200 L0 200 Z" fill="#e2bd7c"/>
  <path d="M0 140 C200 115 400 125 600 140 C780 152 900 128 1000 132 L1000 200 L0 200 Z" fill="#f0d39b"/>
</svg>`;

const zeewier = (kleur: string, licht: string) => `
<svg viewBox="0 0 80 220" aria-hidden="true">
  <path d="M28 220 C14 180 40 150 24 110 C10 74 36 44 26 6 C44 40 30 74 42 108 C56 148 32 182 44 220 Z" fill="${kleur}"/>
  <path d="M46 220 C60 186 44 160 58 128 C70 100 56 78 66 54 C78 84 70 104 74 130 C78 166 62 190 62 220 Z" fill="${licht}"/>
</svg>`;

const KORAAL = `
<svg viewBox="0 0 160 150" aria-hidden="true">
  <g fill="none" stroke="#ff7f8f" stroke-width="13" stroke-linecap="round">
    <path d="M80 150 V86 C80 62 64 52 52 30"/>
    <path d="M80 104 C96 84 112 76 118 50"/>
    <path d="M66 70 C56 64 42 66 32 56"/>
    <path d="M110 74 C122 72 134 64 138 40"/>
    <path d="M52 30 C50 22 52 14 58 8"/>
  </g>
  <g fill="#ffb3bd">
    <circle cx="58" cy="8" r="7"/><circle cx="118" cy="48" r="7"/><circle cx="32" cy="56" r="7"/><circle cx="138" cy="38" r="7"/>
  </g>
</svg>`;

// Anemoon: tentakels in een eigen groep, zodat ze los kunnen wuiven.
const ANEMOON = `
<svg viewBox="0 0 160 120" aria-hidden="true">
  <g class="anemoon__tentakels" fill="none" stroke-linecap="round" stroke-width="10">
    <path d="M30 96 C20 70 26 50 16 30" stroke="#c77dff"/>
    <path d="M48 92 C44 62 52 42 44 18" stroke="#d99bff"/>
    <path d="M66 90 C66 60 74 40 68 10" stroke="#c77dff"/>
    <path d="M84 90 C88 60 84 38 92 12" stroke="#d99bff"/>
    <path d="M102 90 C110 64 106 44 118 22" stroke="#c77dff"/>
    <path d="M120 94 C134 72 130 54 144 36" stroke="#d99bff"/>
  </g>
  <g fill="#f2d7ff">
    <circle cx="16" cy="30" r="6"/><circle cx="44" cy="18" r="6"/><circle cx="68" cy="10" r="6"/>
    <circle cx="92" cy="12" r="6"/><circle cx="118" cy="22" r="6"/><circle cx="144" cy="36" r="6"/>
  </g>
  <path d="M18 120 C18 96 40 86 80 86 C120 86 142 96 142 120 Z" fill="#9b4dca"/>
</svg>`;

// Clownvisje, zelf getekend (kijkt naar links, net als de Fluent-vissen).
const CLOWNVIS = `
<svg viewBox="0 0 120 80" aria-hidden="true">
  <path d="M96 40 L118 18 C120 32 120 48 118 62 Z" fill="#ff8a1f" stroke="#1d2b3a" stroke-width="3" stroke-linejoin="round"/>
  <path d="M50 14 C60 4 76 6 80 16 Z M54 66 C62 74 74 74 78 64 Z" fill="#ff8a1f" stroke="#1d2b3a" stroke-width="3" stroke-linejoin="round"/>
  <ellipse cx="56" cy="40" rx="46" ry="28" fill="#ff8a1f" stroke="#1d2b3a" stroke-width="3"/>
  <path d="M34 15 C42 28 42 52 34 65 L44 67 C52 52 52 28 44 13 Z" fill="#fff" stroke="#1d2b3a" stroke-width="2.5"/>
  <path d="M70 13 C78 28 78 52 70 67 L80 66 C88 52 88 28 80 14 Z" fill="#fff" stroke="#1d2b3a" stroke-width="2.5"/>
  <circle cx="22" cy="34" r="6" fill="#fff"/><circle cx="21" cy="34" r="3.5" fill="#1d2b3a"/>
  <path d="M12 48 C16 51 20 51 24 49" fill="none" stroke="#1d2b3a" stroke-width="2.5" stroke-linecap="round"/>
</svg>`;

const VISSEN = ['vis.svg', 'vis-tropisch.svg', 'kogelvis.svg'];
const RUST_MS = 4000;

export function maakOnderwaterDecor(): Decor {
  const root = el('div', 'decor decor-onderwater');
  const stralen = el('div', 'onderwater-stralen', root);
  for (let i = 0; i < 4; i++) el('div', 'onderwater-straal', stralen);
  plaatje('assets/achtergrond/kwal.svg', 'onderwater-kwal', root);

  const belletjes = el('div', 'onderwater-belletjes', root);
  for (let i = 0; i < 12; i++) {
    const b = el('div', 'belletje', belletjes);
    b.style.left = `${Math.random() * 100}%`;
    const maat = 6 + Math.random() * 14;
    b.style.width = b.style.height = `${maat}px`;
    b.style.animationDuration = `${7 + Math.random() * 7}s`;
    b.style.animationDelay = `${-Math.random() * 14}s`;
  }

  const zwemmers = el('div', 'onderwater-zwemmers', root);
  svgUitTekst(ZAND, 'onderwater-zand', root);
  svgUitTekst(KORAAL, 'onderwater-koraal', root);
  svgUitTekst(zeewier('#2f9e5b', '#4cc277'), 'onderwater-wier onderwater-wier--1', root);
  svgUitTekst(zeewier('#3aa86a', '#62d08a'), 'onderwater-wier onderwater-wier--2', root);
  svgUitTekst(zeewier('#2f9e5b', '#4cc277'), 'onderwater-wier onderwater-wier--3', root);
  svgUitTekst(zeewier('#3aa86a', '#62d08a'), 'onderwater-wier onderwater-wier--4', root);

  // Het clownvisje zit achter de anemoon en springt eruit bij een goed antwoord.
  const anemoon = el('div', 'anemoon', root);
  const clown = svgUitTekst(CLOWNVIS, 'anemoon__vis', anemoon);
  svgUitTekst(ANEMOON, 'anemoon__plant', anemoon);

  plaatje('assets/achtergrond/schelp.svg', 'onderwater-schelp', root);
  const krabLoop = el('div', 'onderwater-krab', root);
  const krab = plaatje('assets/achtergrond/krab.svg', 'onderwater-krab__lijf', krabLoop);
  const octopus = el('div', 'onderwater-octopus', root);
  plaatje('assets/achtergrond/octopus.svg', 'onderwater-octopus__lijf', octopus);

  const stil = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let levend = true;
  let bezig = false;
  let timer: number | undefined;

  // Een dier zwemt van de ene kant naar de andere, met een golvende beweging.
  const zwem = (src: string, klasse: string, hoogte: number, naarRechts: boolean, ms: number, vertraging = 0): HTMLElement => {
    const z = el('div', `zwemmer ${klasse}`, zwemmers);
    z.style.top = `${hoogte}%`;
    z.style.setProperty('--van-x', naarRechts ? '-25vw' : '110vw');
    z.style.setProperty('--naar-x', naarRechts ? '110vw' : '-25vw');
    z.style.animationDuration = `${ms}ms`;
    z.style.animationDelay = `${vertraging}ms`;
    const golf = el('div', 'zwemmer__golf', z);
    golf.style.animationDelay = `${-Math.random() * 3}s`;
    // De Fluent-dieren kijken naar links: naar rechts zwemmen = spiegelen.
    const img = plaatje(src, 'zwemmer__lijf', golf);
    if (naarRechts) img.classList.add('gespiegeld');
    window.setTimeout(() => z.remove(), ms + vertraging + 200);
    return z;
  };

  function plan(): void {
    window.clearTimeout(timer);
    if (!levend || stil) return;
    timer = window.setTimeout(() => {
      if (bezig) return plan();
      bezig = true;
      const ms = 14000 + Math.random() * 6000;
      const src = VISSEN[Math.floor(Math.random() * VISSEN.length)];
      zwem(`assets/achtergrond/${src}`, 'zwemmer--vis', 18 + Math.random() * 40, Math.random() < 0.5, ms);
      window.setTimeout(() => {
        bezig = false;
        plan();
      }, ms + RUST_MS);
    }, 2500 + Math.random() * 6000);
  }
  plan();

  const bubbelWolk = (bij: HTMLElement, aantal: number) => {
    for (let i = 0; i < aantal; i++) {
      const b = el('div', 'belletje belletje--los', bij);
      b.style.left = `${30 + Math.random() * 40}%`;
      const maat = 6 + Math.random() * 10;
      b.style.width = b.style.height = `${maat}px`;
      b.style.animationDelay = `${(Math.random() * 0.5).toFixed(2)}s`;
      window.setTimeout(() => b.remove(), 2200);
    }
  };

  const juich = () => {
    kortAan(clown, 'springt', 1600);
    kortAan(krab, 'juicht', 1200);
    bubbelWolk(anemoon, 6);
  };

  // Einde van een sessie: een schildpad met een schooltje visjes erachter.
  const feest = () => {
    juich();
    if (stil) return;
    bezig = true;
    window.clearTimeout(timer);
    const naarRechts = Math.random() < 0.5;
    const ms = 11000;
    zwem('assets/achtergrond/schildpad.svg', 'zwemmer--schildpad', 22, naarRechts, ms);
    for (let i = 0; i < 8; i++) {
      const rij = i % 3;
      zwem('assets/achtergrond/vis.svg', 'zwemmer--school', 18 + rij * 7 + Math.random() * 3, naarRechts, ms, 900 + i * 260);
    }
    bubbelWolk(octopus, 8);
    window.setTimeout(() => {
      bezig = false;
      plan();
    }, ms + 3200);
  };

  const vernietig = () => {
    levend = false;
    window.clearTimeout(timer);
  };
  return { element: root, juich, feest, vernietig };
}
