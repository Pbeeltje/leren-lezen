import type { Decor } from './achtergrond.ts';
import { bijZichtbaarheid, paginaZichtbaar } from '../engine/zichtbaarheid.ts';
import { el, kortAan, maakRegenboog, plaatje, svgUitTekst } from './hulp.ts';

// Zee met wisselend weer: zon (20 s) -> regen (15 s) -> onweer (15 s) -> weer zon, en als
// de zon na het onweer terugkomt verschijnt er zo'n 5 seconden een rustige regenboog. Golven,
// een bootje dat langzaam voorbij drijft en een vuurtoren linksonder waarvan het licht
// aangaat bij een goed antwoord. Overgangen zijn zacht (CSS-transities van een paar seconden).
const golf = (kleur: string) => `
<svg viewBox="0 0 1200 120" preserveAspectRatio="none">
  <path d="M0 40 C100 10 200 10 300 40 C400 70 500 70 600 40 C700 10 800 10 900 40 C1000 70 1100 70 1200 40 L1200 120 L0 120 Z" fill="${kleur}"/>
</svg>`;

// Walvis, zelf getekend: alleen de bovenkant komt boven water (de voorste golf verbergt
// de rest). Grote ogen die rondkijken, een blosje en een klein fonteintje.
const WALVIS = `
<svg viewBox="0 0 200 170" aria-hidden="true">
  <g class="walvis__fontein" fill="none" stroke="#cfeeff" stroke-width="5" stroke-linecap="round">
    <path d="M118 30 C114 16 104 10 96 12"/><path d="M118 30 C122 16 132 10 140 12"/><path d="M118 30 V8"/>
  </g>
  <path d="M8 170 L8 130 C8 70 54 30 116 30 C166 30 194 70 194 130 L194 170 Z" fill="#4f86c6"/>
  <path d="M30 96 C60 80 92 76 120 80" fill="none" stroke="#6fa3dd" stroke-width="5" stroke-linecap="round" opacity="0.8"/>
  <path d="M40 74 C52 58 70 48 92 44" fill="none" stroke="#7fb3ea" stroke-width="6" stroke-linecap="round" opacity="0.6"/>
  <g class="walvis__oog">
    <ellipse cx="150" cy="78" rx="11" ry="12" fill="#fff"/>
    <circle class="walvis__pupil" cx="151" cy="79" r="6" fill="#1d2b3a"/>
    <circle class="walvis__pupil" cx="153" cy="76" r="2" fill="#fff"/>
  </g>
  <ellipse cx="166" cy="100" rx="9" ry="5" fill="#ff9fb8" opacity="0.7"/>
  <path d="M142 106 C150 112 160 112 168 108" fill="none" stroke="#1d2b3a" stroke-width="3" stroke-linecap="round"/>
</svg>`;

const BLIKSEM = `
<svg viewBox="0 0 60 160">
  <path d="M34 0 L8 86 L28 86 L18 160 L54 58 L32 58 L46 0 Z" fill="#fff6b0" stroke="#ffe066" stroke-width="3" stroke-linejoin="round"/>
</svg>`;

type Weer = 'zon' | 'regen' | 'onweer';
const DUUR: Record<Weer, number> = { zon: 20000, regen: 15000, onweer: 15000 };
const VOLGENDE: Record<Weer, Weer> = { zon: 'regen', regen: 'onweer', onweer: 'zon' };

export function maakZeeDecor(): Decor {
  const root = el('div', 'decor decor-zee');
  el('div', 'zee-lucht zee-lucht--zon', root);
  el('div', 'zee-lucht zee-lucht--regen', root);
  el('div', 'zee-lucht zee-lucht--onweer', root);
  // Achter de zon en de wolken, zodat de wolken er een beetje voor schuiven.
  const regenboog = maakRegenboog('zee-regenboog', root);
  plaatje('assets/achtergrond/zon.svg', 'zee-zon', root);
  plaatje('assets/achtergrond/wolk.svg', 'drijf-wolk drijf-wolk--1 zee-wolk', root);
  plaatje('assets/achtergrond/wolk.svg', 'drijf-wolk drijf-wolk--2 zee-wolk', root);
  plaatje('assets/achtergrond/wolk.svg', 'drijf-wolk drijf-wolk--3 zee-wolk zee-wolk--storm', root);
  const bliksemHouder = el('div', 'zee-bliksem', root);
  el('div', 'zee-regen', root);
  const flits = el('div', 'zee-flits', root);

  const golven = el('div', 'zee-golven', root);
  const achterGolf = svgUitTekst(golf('#3f6f93'), 'zee-golf zee-golf--achter', golven);
  const boot = el('div', 'zee-boot', golven);
  const kantel = el('div', 'zee-boot__kantel', boot);
  plaatje('assets/achtergrond/boot-eigen.svg', 'zee-boot__plaatje', kantel);
  const middenGolf = svgUitTekst(golf('#2f5a7c'), 'zee-golf zee-golf--midden', golven);
  const walvis = svgUitTekst(WALVIS, 'zee-walvis', golven);

  // Tussen de middelste en voorste golf: de voorste golf spoelt over de rotsen.
  const toren = el('div', 'vuurtoren', golven);
  const straal = el('div', 'vuurtoren__straal', toren);
  el('div', 'vuurtoren__gloed', toren);
  plaatje('assets/achtergrond/vuurtoren.svg', 'vuurtoren__plaatje', toren);
  svgUitTekst(golf('#244a68'), 'zee-golf zee-golf--voor', golven);

  let weer: Weer = 'zon';
  let weerTimer: number | undefined;
  let bliksemTimer: number | undefined;
  let regenboogTimer: number | undefined;

  const bliksemInslag = () => {
    if (weer !== 'onweer') return;
    const schicht = svgUitTekst(BLIKSEM, 'zee-schicht', bliksemHouder);
    schicht.style.left = `${10 + Math.random() * 80}%`;
    kortAan(flits, 'aan', 500);
    window.setTimeout(() => schicht.remove(), 500);
    bliksemTimer = window.setTimeout(bliksemInslag, 2500 + Math.random() * 3500);
  };

  const zetWeer = (nieuw: Weer) => {
    // Na het onweer: eerst de lucht laten opklaren, dan de regenboog.
    if (weer === 'onweer' && nieuw === 'zon') regenboogTimer = window.setTimeout(() => kortAan(regenboog, 'verschijnt', 5000), 2200);
    weer = nieuw;
    root.dataset.weer = nieuw;
    window.clearTimeout(bliksemTimer);
    if (nieuw === 'onweer') bliksemTimer = window.setTimeout(bliksemInslag, 2500);
    weerTimer = window.setTimeout(() => zetWeer(VOLGENDE[nieuw]), DUUR[nieuw]);
  };
  zetWeer('zon');

  // De boot drijft óp het water: elk frame de hoogte van de achterste en de middelste golf
  // onder het midden van de boot opzoeken (de hoogste telt, anders zakt hij achter de
  // middelste golf weg) en de romp daar een stukje in laten zakken, scheef met de
  // helling mee. Met een vaste hoogte hing hij in de lucht zodra er een golfdal onder kwam.
  const golfPad = achterGolf.querySelector('path')!;
  const middenPad = middenGolf.querySelector('path')!;
  const STAP = 5;
  const hoogteOp: number[] = [];
  {
    const punten: [number, number][] = [];
    const lengte = golfPad.getTotalLength();
    for (let l = 0; l <= lengte; l += 3) {
      const q = golfPad.getPointAtLength(l);
      if (punten.length && q.x < punten[punten.length - 1][0]) break; // bovenrand is klaar
      punten.push([q.x, q.y]);
    }
    let j = 0;
    for (let x = 0; x <= 1200; x += STAP) {
      while (j < punten.length - 2 && punten[j + 1][0] < x) j++;
      const [x1, y1] = punten[j];
      const [x2, y2] = punten[Math.min(j + 1, punten.length - 1)];
      hoogteOp.push(x2 === x1 ? y1 : y1 + ((y2 - y1) * (x - x1)) / (x2 - x1));
    }
  }
  const golfY = (x: number): number => {
    const xx = ((x % 1200) + 1200) % 1200;
    const i = Math.floor(xx / STAP);
    const t = (xx - i * STAP) / STAP;
    return hoogteOp[i] * (1 - t) + hoogteOp[Math.min(i + 1, hoogteOp.length - 1)] * t;
  };

  let walvisGezien = false;
  let walvisTimer: number | undefined;
  let frame = 0;
  let levend = true;
  const drijf = () => {
    if (!levend || !paginaZichtbaar()) return;
    frame = requestAnimationFrame(drijf);
    const vak = boot.getBoundingClientRect();
    const golvenVak = golven.getBoundingClientRect();
    const m1 = golfPad.getScreenCTM();
    const m2 = middenPad.getScreenCTM();
    if (!m1 || !m2 || !vak.width) return;
    const midden = vak.left + vak.width / 2;
    // Beide golven hebben dezelfde vorm (pad), alleen een andere hoogte en verschuiving.
    const opGolf = (m: DOMMatrix) => {
      const x = (midden - m.e) / m.a;
      return { y: golfY(x) * m.d + m.f, helling: ((golfY(x + 12) - golfY(x - 12)) * m.d) / (24 * m.a) };
    };
    const a = opGolf(m1);
    const b = opGolf(m2);
    const water = a.y < b.y ? a : b;
    boot.style.bottom = `${golvenVak.bottom - water.y - vak.height * 0.2}px`;
    const helling = water.helling;
    kantel.style.transform = `rotate(${(Math.atan(helling) * 180) / Math.PI * 0.8}deg)`;
    // Pas als de boot helemaal van het scherm is (en dan nog een paar seconden), komt de
    // walvis één keer per tocht kijken; zo is het nooit te druk.
    if (vak.right < window.innerWidth * 0.5) walvisGezien = false;
    if (!walvisGezien && vak.left > window.innerWidth) {
      walvisGezien = true;
      walvis.style.left = `${18 + Math.random() * 22}%`;
      walvisTimer = window.setTimeout(() => kortAan(walvis, 'duikt-op', 12000), 3500);
    }
  };
  const afmeldZicht = bijZichtbaarheid((aan) => {
    if (!levend) return;
    cancelAnimationFrame(frame);
    if (aan) frame = requestAnimationFrame(drijf);
  });
  if (paginaZichtbaar()) frame = requestAnimationFrame(drijf);

  const juich = () => {
    kortAan(toren, 'licht-aan', 2600);
    kortAan(straal, 'zwaait', 2600);
  };
  const vernietig = () => {
    levend = false;
    afmeldZicht();
    window.clearTimeout(weerTimer);
    window.clearTimeout(bliksemTimer);
    window.clearTimeout(regenboogTimer);
    window.clearTimeout(walvisTimer);
    cancelAnimationFrame(frame);
  };
  return { element: root, juich, vernietig };
}
