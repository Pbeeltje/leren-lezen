import type { Decor } from './achtergrond.ts';
import { el, kortAan, plaatje, svgUitTekst, zetOpPad } from './hulp.ts';

// Groene wei met heuvels en bomen; een T-rex links en een triceratops rechts die bij een
// goed antwoord opspringen en juichen.
const HEUVELS = `
<svg viewBox="0 0 1000 300" preserveAspectRatio="none">
  <path d="M0 150 C160 60 320 70 480 130 C640 190 820 80 1000 120 L1000 300 L0 300 Z" fill="#7ccf5d"/>
  <path d="M0 210 C200 150 380 170 560 210 C740 250 880 180 1000 200 L1000 300 L0 300 Z" fill="#5db847"/>
  <path d="M0 260 C250 235 500 250 750 262 C860 267 940 255 1000 250 L1000 300 L0 300 Z" fill="#4aa63a"/>
</svg>`;

export function maakDinoDecor(): Decor {
  const root = el('div', 'decor decor-dino');
  plaatje('/assets/achtergrond/zon.svg', 'dino-zon', root);
  plaatje('/assets/achtergrond/wolk.svg', 'drijf-wolk drijf-wolk--1', root);
  plaatje('/assets/achtergrond/wolk.svg', 'drijf-wolk drijf-wolk--2', root);
  const heuvels = svgUitTekst(HEUVELS, 'dino-heuvels', root);
  const [achter, midden] = [...heuvels.querySelectorAll('path')];

  // [plaatje, klasse, op welke heuvel]: de kleine bomen aan de rand staan verder weg.
  const bomen: [HTMLImageElement, SVGPathElement][] = [
    [plaatje('/assets/achtergrond/den.svg', 'dino-boom dino-boom--1', root), achter],
    [plaatje('/assets/achtergrond/boom.svg', 'dino-boom dino-boom--2', root), midden],
    [plaatje('/assets/achtergrond/boom.svg', 'dino-boom dino-boom--3', root), midden],
    [plaatje('/assets/achtergrond/den.svg', 'dino-boom dino-boom--4', root), achter],
  ];

  const trex = el('div', 'dino dino--trex', root);
  plaatje('/assets/achtergrond/trex.svg', 'dino__lijf', trex);
  const tri = el('div', 'dino dino--tri', root);
  plaatje('/assets/achtergrond/triceratops.svg', 'dino__lijf', tri);

  const plaatsBomen = () => {
    for (const [boom, pad] of bomen) zetOpPad(boom, pad);
  };

  const juich = () => {
    for (const d of [trex, tri]) {
      kortAan(d, 'juicht', 1200);
      const hoera = el('div', 'dino__hoera', d);
      hoera.textContent = ['★', '♥', '✦'][Math.floor(Math.random() * 3)];
      window.setTimeout(() => hoera.remove(), 1200);
    }
  };
  return { element: root, juich, plaats: plaatsBomen };
}
