import type { Decor } from './achtergrond.ts';
import { el, kortAan, plaatje, svgUitTekst, zetOpPad } from './hulp.ts';

// Prinsessenkasteel op een heuvel rechtsonder (buiten het midden, waar de vragen staan),
// in een zachte avondlucht met twinkelende sterretjes en zwevende lichtjes. Bij een goed
// antwoord gaat het kasteel stralen en spatten er vonkjes omhoog.
const HEUVEL = `
<svg viewBox="0 0 600 300" preserveAspectRatio="none">
  <path d="M0 300 L0 250 C120 230 200 150 330 120 C450 95 540 130 600 150 L600 300 Z" fill="#6a4fa3"/>
  <path d="M0 300 L0 275 C140 262 260 230 380 225 C480 222 560 240 600 250 L600 300 Z" fill="#553d8c"/>
</svg>`;

export function maakKasteelDecor(): Decor {
  const root = el('div', 'decor decor-kasteel');
  for (let i = 0; i < 28; i++) {
    const s = el('div', 'kasteel-ster', root);
    s.style.left = `${Math.random() * 100}%`;
    s.style.top = `${Math.random() * 55}%`;
    s.style.animationDelay = `${(Math.random() * 4).toFixed(2)}s`;
  }
  const heuvel = el('div', 'kasteel-heuvel', root);
  const heuvelSvg = svgUitTekst(HEUVEL, 'kasteel-heuvel__svg', heuvel);
  const kasteel = el('div', 'kasteel', heuvel);
  plaatje('/assets/achtergrond/kasteel.svg', 'kasteel__plaatje', kasteel);
  for (let i = 0; i < 9; i++) {
    const l = el('div', 'kasteel-lichtje', heuvel);
    l.style.left = `${40 + Math.random() * 55}%`;
    l.style.top = `${20 + Math.random() * 50}%`;
    l.style.animationDelay = `${(Math.random() * 6).toFixed(2)}s`;
    l.style.animationDuration = `${(5 + Math.random() * 4).toFixed(2)}s`;
  }

  const juich = () => {
    kortAan(kasteel, 'straalt', 1600);
    for (let i = 0; i < 12; i++) {
      const v = el('div', 'kasteel-vonk', kasteel);
      const hoek = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
      const afstand = 60 + Math.random() * 90;
      v.style.setProperty('--dx', `${Math.cos(hoek) * afstand}px`);
      v.style.setProperty('--dy', `${Math.sin(hoek) * afstand}px`);
      v.style.background = ['#ffe36e', '#ff9ad5', '#b8f0ff', '#ffffff'][i % 4];
      window.setTimeout(() => v.remove(), 1300);
    }
  };
  const top = heuvelSvg.querySelector('path')!;
  return { element: root, juich, plaats: () => zetOpPad(kasteel, top, 10) };
}
