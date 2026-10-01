import type { Decor } from './achtergrond.ts';
import { el, kortAan, maakRegenboog, plaatje, svgUitTekst, zetOpPad } from './hulp.ts';

// Prinsessenkasteel op een heuvel rechtsonder (buiten het midden, waar de vragen staan),
// heuvels in de verte en roze gras vooraan met een eenhoorn. Dag en nacht wisselen zacht
// (dag 25 s, nacht 20 s, overgang 5 s): overdag een zon en soms een regenboog, 's nachts
// de maan, sterretjes, zwevende lichtjes en af en toe een klein vallend sterretje. Bij een goed antwoord gaat het kasteel stralen, spatten er
// vonkjes omhoog en springt de eenhoorn.
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
  const regenboog = maakRegenboog('kasteel-regenboog', root);
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
  // Klein vallend sterretje: een kort lichtstreepje schuin omlaag, elke paar seconden.
  const valsterren = () => {
    if (root.dataset.tijd !== 'nacht') return;
    const v = el('div', 'kasteel-valster', nacht);
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
    // Af en toe (ongeveer de helft van de dagen) een regenboog, midden op de dag.
    if (tijd === 'dag' && Math.random() < 0.5) {
      regenboogTimer = window.setTimeout(() => kortAan(regenboog, 'verschijnt', 7000), 5000 + Math.random() * 5000);
    }
    tijdTimer = window.setTimeout(() => zetTijd(tijd === 'dag' ? 'nacht' : 'dag'), tijd === 'dag' ? DAG_DUUR : NACHT_DUUR);
  };
  zetTijd('dag');

  const vernietig = () => {
    window.clearTimeout(tijdTimer);
    window.clearTimeout(regenboogTimer);
    window.clearTimeout(valTimer);
  };
  const top = heuvelSvg.querySelector('path')!;
  return { element: root, juich, vernietig, plaats: () => zetOpPad(kasteel, top, 4, true) };
}
