import type { Decor } from './achtergrond.ts';
import { el, kortAan, plaatje, svgUitTekst, zetOpPad } from './hulp.ts';

// Prinsessenkasteel op een heuvel rechtsonder (buiten het midden, waar de vragen staan),
// heuvels in de verte en roze gras vooraan met een eenhoorn. Dag en nacht wisselen zacht
// (dag 25 s, nacht 20 s, overgang 5 s): overdag een zon en soms een regenboog, 's nachts
// de maan, sterretjes, zwevende lichtjes en af en toe een klein vallend sterretje. Bij een goed antwoord gaat het kasteel stralen, spatten er
// vonkjes omhoog en springt de eenhoorn.
// Elke dag stroomt er een grote regenboog van de ene kant van de lucht naar de andere (hij
// groeit als een rivier aan, blijft even en stroomt aan de overkant weer weg). Op het gras
// pikken witte duifjes, en midden vooraan staat een bloemenperkje waar vlinders omheen
// fladderen. Kasteel (bronbestanden/teken-kasteel.py), duiven, bloemen en vlinders zijn
// zelf getekend.
const HEUVEL_PAD = 'M0 300 L0 250 C120 230 200 150 330 120 C450 95 540 130 600 150 L600 300 Z';
const HEUVEL = `
<svg viewBox="0 0 600 300" preserveAspectRatio="none">
  <path d="${HEUVEL_PAD}" fill="#6a4fa3"/>
</svg>`;
// Hetzelfde pad nog eens vóór het kasteel: zo zakt de voet van het kasteel ín de heuvel
// en zweeft het nergens, hoe het scherm de heuvel ook uitrekt.
const HEUVEL_VOOR = `
<svg viewBox="0 0 600 300" preserveAspectRatio="none">
  <path d="${HEUVEL_PAD}" fill="#6a4fa3"/>
  <path d="M0 300 L0 275 C140 262 260 230 380 225 C480 222 560 240 600 250 L600 300 Z" fill="#553d8c"/>
</svg>`;

const VERRE_HEUVELS = `
<svg viewBox="0 0 1000 200" preserveAspectRatio="none">
  <path d="M0 110 C120 60 240 70 360 105 C470 135 560 60 680 70 C800 80 900 120 1000 95 L1000 200 L0 200 Z" fill="#9b78c9" opacity="0.55"/>
  <path d="M0 150 C150 110 300 120 440 145 C580 170 720 115 860 125 C930 130 970 140 1000 138 L1000 200 L0 200 Z" fill="#8a67bd" opacity="0.7"/>
</svg>`;

// Roze weide: een glooiende bovenrand met dunne, gebogen grassprieten in een paar tinten
// en hier en daar een bloemetje. Vaste pseudo-willekeur, zodat het er elke keer hetzelfde
// uitziet.
function grasSvg(): string {
  let zaad = 7;
  const rnd = () => ((zaad = (zaad * 9301 + 49297) % 233280) / 233280);
  const rand = (x: number) => 52 + Math.sin(x / 170) * 12 + Math.sin(x / 61 + 1) * 5;
  let rug = 'M0 160 L0 ' + rand(0).toFixed(1);
  for (let x = 10; x <= 1000; x += 10) rug += ` L${x} ${rand(x).toFixed(1)}`;
  rug += ' L1000 160 Z';

  const tinten = ['#f7a8d0', '#ee8bbf', '#e071ad', '#fbc2de'];
  const sprieten = tinten.map(() => '');
  for (let x = 0; x < 1000; x += 3.2) {
    const basis = rand(x) + 6 + rnd() * 6;
    const h = 10 + rnd() * 16;
    const buig = (rnd() - 0.5) * 14;
    const i = Math.floor(rnd() * tinten.length);
    sprieten[i] += `M${x.toFixed(1)} ${basis.toFixed(1)} Q${(x + buig * 0.3).toFixed(1)} ${(basis - h * 0.6).toFixed(1)} ${(x + buig).toFixed(1)} ${(basis - h).toFixed(1)} `;
  }
  let bloemen = '';
  for (let n = 0; n < 26; n++) {
    const x = rnd() * 1000;
    const y = rand(x) + 10 + rnd() * 40;
    const kleur = ['#ffffff', '#fff3a6', '#ffd6ec'][n % 3];
    bloemen += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6" fill="${kleur}" vector-effect="non-scaling-stroke"/>`;
  }
  return `
<svg viewBox="0 0 1000 160" preserveAspectRatio="none">
  <path d="${rug}" fill="#f29bc7"/>
  <path d="M0 160 L0 110 C200 98 420 118 620 106 C800 96 920 112 1000 104 L1000 160 Z" fill="#e889bb" opacity="0.7"/>
  ${sprieten.map((d, i) => `<path d="${d}" fill="none" stroke="${tinten[i]}" stroke-width="2.2" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`).join('')}
  ${bloemen}
</svg>`;
}

// Grote regenboog over de hele breedte: zeven bogen met pathLength 1, zodat ze in CSS met
// stroke-dashoffset van de ene kant naar de andere kunnen aangroeien en weer wegstromen.
function regenboogSvg(): string {
  const kleuren = ['#ff8a8a', '#ffb36b', '#ffe27a', '#9fe3a3', '#8ccaff', '#a9a2ff', '#d6a3ff'];
  const bogen = kleuren
    .map((k, i) => {
      const rx = 540 - i * 15;
      const ry = 360 - i * 15;
      return `<path d="M${500 - rx} 400 A${rx} ${ry} 0 0 1 ${500 + rx} 400" stroke="${k}" pathLength="1" style="--i:${i}"/>`;
    })
    .join('');
  return `<svg viewBox="0 0 1000 400" preserveAspectRatio="none" aria-hidden="true">
    <g fill="none" stroke-width="15" vector-effect="non-scaling-stroke">${bogen}</g></svg>`;
}

// Wit duifje van opzij (kijkt naar rechts). De kop is een eigen groep om te pikken.
const DUIF = `
<svg viewBox="0 0 80 60" aria-hidden="true">
  <path d="M30 52 l-3 6 M30 52 l1 6 M42 52 l-1 6 M42 52 l3 6" stroke="#f08aa8" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M8 30 L0 24 L2 36 Z" fill="#dfe4f0"/>
  <ellipse cx="34" cy="38" rx="24" ry="15" fill="#ffffff" stroke="#c9cfe0" stroke-width="1.5"/>
  <path class="duif__vleugel" d="M20 32 C30 22 46 24 50 34 C42 40 28 42 20 32 Z" fill="#e6eaf5" stroke="#c9cfe0" stroke-width="1.2"/>
  <g class="duif__kop">
    <path d="M50 34 C52 26 54 20 58 18" stroke="#ffffff" stroke-width="10" stroke-linecap="round" fill="none"/>
    <circle cx="60" cy="18" r="9" fill="#ffffff" stroke="#c9cfe0" stroke-width="1.5"/>
    <path d="M68 17 L76 20 L68 22 Z" fill="#ffb05e"/>
    <circle cx="62" cy="16" r="2" fill="#3a3550"/>
    <circle cx="57" cy="21" r="2.4" fill="#ffc2d6" opacity="0.8"/>
  </g>
</svg>`;

// Bloemenperkje: blaadjes, roze rozen, paarse en blauwe hortensia's en gele bloemetjes.
function bloemenSvg(): string {
  let zaad = 11;
  const rnd = () => ((zaad = (zaad * 9301 + 49297) % 233280) / 233280);
  let d = '';
  for (let i = 0; i < 16; i++) {
    const x = 20 + rnd() * 320;
    const y = 70 + rnd() * 40;
    d += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(14 + rnd() * 10).toFixed(1)}" ry="7" fill="${rnd() < 0.5 ? '#6fbf73' : '#5aa862'}" transform="rotate(${((rnd() - 0.5) * 60).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
  }
  const hortensia = (cx: number, cy: number, kleur: string, licht: string) => {
    let h = '';
    for (let i = 0; i < 14; i++) {
      const hoek = rnd() * Math.PI * 2;
      const a = rnd() * 18;
      h += `<circle cx="${(cx + Math.cos(hoek) * a).toFixed(1)}" cy="${(cy + Math.sin(hoek) * a * 0.8).toFixed(1)}" r="6.5" fill="${i % 3 ? kleur : licht}" stroke="#ffffff" stroke-width="1"/>`;
    }
    return h;
  };
  const roos = (cx: number, cy: number, r: number, kleur: string, donker: string) =>
    [0, 72, 144, 216, 288]
      .map((h) => `<circle cx="${(cx + Math.cos((h * Math.PI) / 180) * r * 0.5).toFixed(1)}" cy="${(cy + Math.sin((h * Math.PI) / 180) * r * 0.5).toFixed(1)}" r="${(r * 0.6).toFixed(1)}" fill="${kleur}" stroke="${donker}" stroke-width="1.3"/>`)
      .join('') +
    `<circle cx="${cx}" cy="${cy}" r="${(r * 0.62).toFixed(1)}" fill="${kleur}" stroke="${donker}" stroke-width="1.3"/>` +
    `<path d="M${cx - r * 0.5} ${cy} C${cx - r * 0.5} ${cy - r * 0.6} ${cx + r * 0.5} ${cy - r * 0.6} ${cx + r * 0.4} ${cy + r * 0.1} C${cx + r * 0.3} ${cy + r * 0.5} ${cx - r * 0.2} ${cy + r * 0.4} ${cx - r * 0.1} ${cy}" fill="none" stroke="${donker}" stroke-width="1.6" stroke-linecap="round"/>`;
  d += hortensia(50, 66, '#b58be8', '#d6bdf5') + hortensia(310, 64, '#8fb4f0', '#c2d6fa') + hortensia(190, 58, '#b58be8', '#d6bdf5');
  const rozen: [number, number, number, string, string][] = [
    [100, 70, 15, '#ff8fc0', '#d9609a'], [130, 56, 13, '#ffc0d9', '#e08bb0'], [150, 80, 14, '#ff8fc0', '#d9609a'],
    [240, 72, 15, '#ffc0d9', '#e08bb0'], [262, 54, 12, '#ff8fc0', '#d9609a'], [215, 86, 12, '#ff8fc0', '#d9609a'],
    [76, 92, 11, '#ffc0d9', '#e08bb0'], [285, 90, 12, '#ffc0d9', '#e08bb0'],
  ];
  for (const [x, y, r, k, dk] of rozen) d += roos(x, y, r, k, dk);
  for (let i = 0; i < 14; i++) {
    const x = 20 + rnd() * 320;
    const y = 82 + rnd() * 26;
    const blaadjes = [0, 72, 144, 216, 288]
      .map((h) => `<circle cx="${(x + Math.cos((h * Math.PI) / 180) * 3.6).toFixed(1)}" cy="${(y + Math.sin((h * Math.PI) / 180) * 3.6).toFixed(1)}" r="2.8"/>`)
      .join('');
    d += `<g fill="#ffe066">${blaadjes}</g><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2" fill="#f2a33a"/>`;
  }
  return `<svg viewBox="0 30 360 90" aria-hidden="true">${d}</svg>`;
}

// Vlinder (van boven): twee vleugelparen die open en dicht gaan.
const vlinderSvg = (kleur: string, licht: string) => `
<svg viewBox="0 0 40 32" aria-hidden="true">
  <g class="vlinder__vleugel vlinder__vleugel--l">
    <path d="M19 15 C10 2 1 4 3 13 C4 19 12 19 19 17 Z M19 17 C12 20 6 26 10 29 C14 31 18 24 19 19 Z" fill="${kleur}" stroke="#7a4f8a" stroke-width="1"/>
    <circle cx="9" cy="11" r="2.4" fill="${licht}"/>
  </g>
  <g class="vlinder__vleugel vlinder__vleugel--r">
    <path d="M21 15 C30 2 39 4 37 13 C36 19 28 19 21 17 Z M21 17 C28 20 34 26 30 29 C26 31 22 24 21 19 Z" fill="${kleur}" stroke="#7a4f8a" stroke-width="1"/>
    <circle cx="31" cy="11" r="2.4" fill="${licht}"/>
  </g>
  <rect x="18.6" y="9" width="2.8" height="16" rx="1.4" fill="#5a3a6a"/>
  <path d="M19.5 9 C18 5 16 4 15 3 M20.5 9 C22 5 24 4 25 3" stroke="#5a3a6a" stroke-width="1" fill="none" stroke-linecap="round"/>
</svg>`;

const MAAN = `
<svg viewBox="0 0 100 100" aria-hidden="true">
  <path d="M62 8 A44 44 0 1 0 92 70 A36 36 0 1 1 62 8 Z" fill="#fff4c4"/>
</svg>`;

const DAG_DUUR = 25000;
const NACHT_DUUR = 20000;

export function maakKasteelDecor(): Decor {
  const root = el('div', 'decor decor-kasteel');
  el('div', 'kasteel-lucht kasteel-lucht--dag', root);
  plaatje('assets/achtergrond/zon.svg', 'kasteel-zon', root);
  svgUitTekst(MAAN, 'kasteel-maan', root);
  const nacht = el('div', 'kasteel-nachtlaag', root);
  for (let i = 0; i < 28; i++) {
    const s = el('div', 'kasteel-ster', nacht);
    s.style.left = `${Math.random() * 100}%`;
    s.style.top = `${Math.random() * 55}%`;
    s.style.animationDelay = `${(Math.random() * 4).toFixed(2)}s`;
  }
  // Voor de verre heuvels, zodat de voeten van de regenboog erachter verdwijnen.
  const regenboog = svgUitTekst(regenboogSvg(), 'kasteel-boog', root);
  svgUitTekst(VERRE_HEUVELS, 'kasteel-verte', root);

  const heuvel = el('div', 'kasteel-heuvel', root);
  const heuvelSvg = svgUitTekst(HEUVEL, 'kasteel-heuvel__svg', heuvel);
  const kasteel = el('div', 'kasteel', heuvel);
  plaatje('assets/achtergrond/kasteel-eigen.svg', 'kasteel__plaatje', kasteel);
  svgUitTekst(HEUVEL_VOOR, 'kasteel-heuvel__svg', heuvel);
  const lichtjes = el('div', 'kasteel-lichtjes', heuvel);
  for (let i = 0; i < 9; i++) {
    const l = el('div', 'kasteel-lichtje', lichtjes);
    l.style.left = `${40 + Math.random() * 55}%`;
    l.style.top = `${20 + Math.random() * 50}%`;
    l.style.animationDelay = `${(Math.random() * 6).toFixed(2)}s`;
    l.style.animationDuration = `${(5 + Math.random() * 4).toFixed(2)}s`;
  }

  svgUitTekst(grasSvg(), 'kasteel-gras', root);

  // Bloemenperkje midden vooraan, met vlinders eromheen.
  const perk = el('div', 'kasteel-perk', root);
  svgUitTekst(bloemenSvg(), 'kasteel-perk__bloemen', perk);
  const vlinderKleuren: [string, string][] = [['#ff9ccd', '#fff0f7'], ['#9cc8ff', '#eef6ff'], ['#ffd66b', '#fff7d6']];
  const vlinders = vlinderKleuren.map(([k, l], i) => {
    const v = el('div', `kasteel-vlinder kasteel-vlinder--${i + 1}`, perk);
    const binnen = el('div', 'kasteel-vlinder__fladder', v);
    svgUitTekst(vlinderSvg(k, l), 'kasteel-vlinder__svg', binnen);
    return v;
  });

  // Duifjes die in het gras pikken (in JS, zodat ze niet in de pas lopen).
  const duiven = [1, 2, 3].map((n) => {
    const d = el('div', `kasteel-duif kasteel-duif--${n}`, root);
    svgUitTekst(DUIF, 'kasteel-duif__svg', d);
    return d;
  });
  const eenhoorn = el('div', 'eenhoorn', root);
  plaatje('assets/achtergrond/eenhoorn.svg', 'eenhoorn__lijf', eenhoorn);

  const juich = () => {
    kortAan(kasteel, 'straalt', 1600);
    kortAan(eenhoorn, 'juicht', 1200);
    for (let i = 0; i < 12; i++) {
      const v = el('div', 'kasteel-vonk', kasteel);
      const hoek = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
      const afstand = 60 + Math.random() * 90;
      v.style.setProperty('--dx', `${Math.cos(hoek) * afstand}px`);
      v.style.setProperty('--dy', `${Math.sin(hoek) * afstand}px`);
      v.style.background = ['#ffe36e', '#ff9ad5', '#b8f0ff', '#ffffff'][i % 4];
      window.setTimeout(() => v.remove(), 1300);
    }
    // Een duifje fladdert even op en de vlinders gaan sneller.
    kortAan(duiven[Math.floor(Math.random() * duiven.length)], 'fladdert', 1100);
    for (const v of vlinders) kortAan(v, 'blij', 1600);
    for (const teken of ['♥', '★', '♥']) {
      const h = el('div', 'eenhoorn__hartje', eenhoorn);
      h.textContent = teken;
      h.style.left = `${30 + Math.random() * 40}%`;
      window.setTimeout(() => h.remove(), 1300);
    }
  };
  let tijdTimer: number | undefined;
  let regenboogTimer: number | undefined;
  let valTimer: number | undefined;
  let pikTimer: number | undefined;
  const stil = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Pikken: steeds een willekeurig duifje, één of twee keer kort na elkaar (niet 's nachts).
  const pik = () => {
    if (root.dataset.tijd !== 'nacht') {
      const d = duiven[Math.floor(Math.random() * duiven.length)];
      kortAan(d, 'pikt', 520);
      if (Math.random() < 0.5) window.setTimeout(() => kortAan(d, 'pikt', 520), 600);
    }
    pikTimer = window.setTimeout(pik, 700 + Math.random() * 1500);
  };
  if (!stil) pik();
  // Klein vallend sterretje: een kort lichtstreepje schuin omlaag, elke paar seconden.
  const valsterren = () => {
    if (root.dataset.tijd !== 'nacht') return;
    const v = el('div', 'valster', nacht);
    v.style.left = `${10 + Math.random() * 70}%`;
    v.style.top = `${4 + Math.random() * 30}%`;
    window.setTimeout(() => v.remove(), 1400);
    valTimer = window.setTimeout(valsterren, 2500 + Math.random() * 3500);
  };
  const zetTijd = (tijd: 'dag' | 'nacht') => {
    root.dataset.tijd = tijd;
    window.clearTimeout(regenboogTimer);
    window.clearTimeout(valTimer);
    // Pas als de nacht echt gevallen is (na de overgang van 5 s).
    if (tijd === 'nacht') valTimer = window.setTimeout(valsterren, 4500);
    // Elke dag stroomt de regenboog over de lucht, de ene keer van links, de andere keer van rechts.
    if (tijd === 'dag' && !stil) {
      regenboogTimer = window.setTimeout(() => {
        regenboog.classList.toggle('kasteel-boog--andersom', Math.random() < 0.5);
        kortAan(regenboog, 'stroomt', 19000);
      }, 3000 + Math.random() * 2000);
    }
    tijdTimer = window.setTimeout(() => zetTijd(tijd === 'dag' ? 'nacht' : 'dag'), tijd === 'dag' ? DAG_DUUR : NACHT_DUUR);
  };
  zetTijd('dag');

  const vernietig = () => {
    window.clearTimeout(tijdTimer);
    window.clearTimeout(regenboogTimer);
    window.clearTimeout(valTimer);
    window.clearTimeout(pikTimer);
  };
  const top = heuvelSvg.querySelector('path')!;
  return { element: root, juich, vernietig, plaats: () => zetOpPad(kasteel, top, 4, true) };
}
