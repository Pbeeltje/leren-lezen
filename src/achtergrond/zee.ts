import type { Decor } from './achtergrond.ts';
import { el, kortAan, maakRegenboog, plaatje, svgUitTekst } from './hulp.ts';

// Zee met wisselend weer: zon (20 s) -> regen (15 s) -> onweer (15 s) -> weer zon, en als
// de zon na het onweer terugkomt verschijnt er zo'n 5 seconden een rustige regenboog. Golven,
// een bootje dat langzaam voorbij drijft en een vuurtoren linksonder waarvan het licht
// aangaat bij een goed antwoord. Overgangen zijn zacht (CSS-transities van een paar seconden).
const golf = (kleur: string) => `
<svg viewBox="0 0 1200 120" preserveAspectRatio="none">
  <path d="M0 40 C100 10 200 10 300 40 C400 70 500 70 600 40 C700 10 800 10 900 40 C1000 70 1100 70 1200 40 L1200 120 L0 120 Z" fill="${kleur}"/>
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
  svgUitTekst(golf('#3f6f93'), 'zee-golf zee-golf--achter', golven);
  const boot = el('div', 'zee-boot', golven);
  plaatje('assets/achtergrond/boot-eigen.svg', 'zee-boot__plaatje', boot);
  svgUitTekst(golf('#2f5a7c'), 'zee-golf zee-golf--midden', golven);

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

  const juich = () => {
    kortAan(toren, 'licht-aan', 2600);
    kortAan(straal, 'zwaait', 2600);
  };
  const vernietig = () => {
    window.clearTimeout(weerTimer);
    window.clearTimeout(bliksemTimer);
    window.clearTimeout(regenboogTimer);
  };
  return { element: root, juich, vernietig };
}
