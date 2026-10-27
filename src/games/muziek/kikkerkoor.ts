import type { Uiterlijk } from './uiterlijk.ts';
import { NOOT, kikkerSvg } from './kikker.ts';
import { BELLEN, LIBEL, STRUIK, WATER, WOLK, lelieSvg, rietSvg, verPadSvg } from './vijver.ts';

// Kikkerkoor: elke knop is een kikker (kikker.ts) op een lelieblad, in een getekende vijver
// (vijver.ts) met riet ervoor en erachter. Per kikker een eigen plek, draai, maat en tempo
// van ademen, zodat ze niet in het gelid staan.
const pol = (extra: string, lis = false): string =>
  `<div class="kikker-riet ${extra}"><div class="kikker-riet__zwaai">${rietSvg(lis)}</div></div>`;

function blok(klasse: string, html: string): HTMLElement {
  const el = document.createElement('div');
  el.className = klasse;
  el.innerHTML = html;
  return el;
}

export const KIKKERKOOR: Uiterlijk = {
  achter: () =>
    blok(
      'kikker-vijver',
      `<div class="kikker-water">${WATER}</div>` +
        [1, 2, 3, 4].map((n) => `<div class="kikker-wolk kikker-wolk--${n}">${WOLK}</div>`).join('') +
        [1, 2, 3, 4, 5, 6].map((n) => `<div class="kikker-bos kikker-bos--${n}">${STRUIK}</div>`).join('') +
        `<div class="kikker-verpad kikker-verpad--1">${verPadSvg(false)}</div>` +
        `<div class="kikker-verpad kikker-verpad--2">${verPadSvg(true)}</div>` +
        `<div class="kikker-verpad kikker-verpad--3">${verPadSvg(false)}</div>` +
        `<div class="kikker-verpad kikker-verpad--4">${verPadSvg(true)}</div>` +
        `<div class="kikker-bellen">${BELLEN}</div>` +
        `<div class="kikker-libel">${LIBEL}</div>` +
        pol('kikker-riet--achter kikker-riet--a1') +
        pol('kikker-riet--achter kikker-riet--a2') +
        pol('kikker-riet--achter kikker-riet--a3') +
        pol('kikker-riet--achter kikker-riet--a4') +
        pol('kikker-riet--achter kikker-riet--a5'),
    ),
  voor: () =>
    blok(
      'kikker-voor',
      pol('kikker-riet--links', true) + pol('kikker-riet--midden') + pol('kikker-riet--ver') + pol('kikker-riet--rechts', true),
    ),
  knop(staaf, _toon, positie) {
    // Blaadjes niet op één lijn.
    const i = positie % 8;
    staaf.style.setProperty('--pad', ['0', '5', '2', '7', '1', '6', '3', '4'][i]);
    staaf.style.setProperty('--draai', ['-7', '5', '-2', '8', '-5', '6', '-3', '2'][i] + 'deg');
    staaf.style.setProperty('--groot', ['1.12', '0.98', '1.06', '1', '1.14', '0.96', '1.04', '1.08'][i]);
    staaf.style.setProperty('--knip', ['0s', '-1.4s', '-3.1s', '-0.6s', '-2.2s', '-4.4s', '-1.8s', '-2.9s'][i]);
    staaf.style.setProperty('--adem', ['3.2s', '3.8s', '2.6s', '4.2s', '3.4s', '2.5s', '3.9s', '2.9s'][i]);
    staaf.style.setProperty('--rij', String(positie % 2));
    staaf.style.setProperty('--stap', String(positie));
    staaf.style.setProperty('--blad', ['-18', '14', '4', '-10', '20', '-16', '8', '-4'][i] + 'deg');
    const zit = document.createElement('span');
    zit.className = 'kikker-zitting';
    const blad = document.createElement('span');
    blad.className = 'kikker-blad';
    blad.innerHTML = lelieSvg();
    const pop = document.createElement('span');
    pop.className = 'kikker-pop';
    pop.innerHTML = kikkerSvg(positie, (i % 4) as 0 | 1 | 2 | 3);
    const noot = document.createElement('span');
    noot.className = 'kikker-noot';
    noot.innerHTML = NOOT;
    zit.append(blad, pop, noot);
    staaf.appendChild(zit);
    // De knop zelf heeft hier geen animatie: het noot-wolkje haalt --aan weer weg.
    noot.addEventListener('animationend', () => staaf.classList.remove('xylofoon__staaf--aan'));
  },
};
