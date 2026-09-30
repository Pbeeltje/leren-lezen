import type { Decor } from './achtergrond.ts';
import { el, kortAan, plaatje, svgUitTekst } from './hulp.ts';

// Regenachtige zee: grijze lucht, zachte regen, golven, een bootje dat langzaam voorbij
// drijft en een vuurtoren linksonder waarvan het licht aangaat bij een goed antwoord.
const golf = (kleur: string) => `
<svg viewBox="0 0 1200 120" preserveAspectRatio="none">
  <path d="M0 40 C100 10 200 10 300 40 C400 70 500 70 600 40 C700 10 800 10 900 40 C1000 70 1100 70 1200 40 L1200 120 L0 120 Z" fill="${kleur}"/>
</svg>`;

export function maakZeeDecor(): Decor {
  const root = el('div', 'decor decor-zee');
  plaatje('/assets/achtergrond/wolk.svg', 'drijf-wolk drijf-wolk--1 zee-wolk', root);
  plaatje('/assets/achtergrond/wolk.svg', 'drijf-wolk drijf-wolk--2 zee-wolk', root);
  el('div', 'zee-regen', root);

  const golven = el('div', 'zee-golven', root);
  svgUitTekst(golf('#3f6f93'), 'zee-golf zee-golf--achter', golven);
  const boot = el('div', 'zee-boot', golven);
  plaatje('/assets/achtergrond/boot.svg', 'zee-boot__plaatje', boot);
  svgUitTekst(golf('#2f5a7c'), 'zee-golf zee-golf--midden', golven);

  // Tussen de middelste en voorste golf: de voorste golf spoelt over de rotsen.
  const toren = el('div', 'vuurtoren', golven);
  const straal = el('div', 'vuurtoren__straal', toren);
  el('div', 'vuurtoren__gloed', toren);
  plaatje('/assets/achtergrond/vuurtoren.svg', 'vuurtoren__plaatje', toren);
  svgUitTekst(golf('#244a68'), 'zee-golf zee-golf--voor', golven);

  const juich = () => {
    kortAan(toren, 'licht-aan', 2600);
    kortAan(straal, 'zwaait', 2600);
  };
  return { element: root, juich };
}
