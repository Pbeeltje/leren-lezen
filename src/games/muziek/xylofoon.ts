import { STAAF_KLEUREN, TONEN, speelInstrument, type Instrument } from '../../engine/muziek.ts';
import { NOOT, kikkerSvg } from './kikker.ts';
import { BELLEN, LIBEL, STRUIK, WATER, WOLK, lelieSvg, rietSvg, verPadSvg } from './vijver.ts';

// Een xylofoon van gekleurde staven, lang (laag) naar kort (hoog). Tikken speelt een toon;
// met de vinger eroverheen glijden speelt ze allemaal (glissando). tonen = indexen in TONEN.
// Dezelfde knoppen worden met zetInstrument een harp (snaren), een fluit
// (gaatjes), een keyboard of een kikkerkoor. Elke toon houdt zijn kleur, zodat de
// stippen van Speel na blijven kloppen.
export function maakXylofoon(
  tonen: number[],
  opTik?: (positie: number) => void,
  instrument: Instrument = 'xylofoon',
): {
  element: HTMLElement;
  licht: (positie: number) => void;
  speel: (positie: number, wanneer?: number) => void;
  zetActief: (aan: boolean) => void;
  zetInstrument: (instrument: Instrument) => void;
  opruimen: () => void;
} {
  const el = document.createElement('div');
  const vijver = document.createElement('div');
  vijver.className = 'kikker-vijver';
  const pol = (extra: string, lis = false) =>
    `<div class="kikker-riet ${extra}"><div class="kikker-riet__zwaai">${rietSvg(lis)}</div></div>`;
  vijver.innerHTML =
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
    pol('kikker-riet--achter kikker-riet--a5');
  el.appendChild(vijver);
  const voor = document.createElement('div');
  voor.className = 'kikker-voor';
  voor.innerHTML =
    pol('kikker-riet--links', true) +
    pol('kikker-riet--midden') +
    pol('kikker-riet--ver') +
    pol('kikker-riet--rechts', true);
  let huidig = instrument;
  let actief = true;
  // Per vinger de staaf waar hij nu op zit. Eén gedeelde "laatste" liet twee vingers elkaar
  // steeds overschrijven: elke trilling van een vinger speelde dan opnieuw (oorverdovend).
  const vingers = new Map<number, HTMLElement | null>();

  const staven = tonen.map((toon, positie) => {
    const staaf = document.createElement('button');
    staaf.type = 'button';
    staaf.className = 'xylofoon__staaf';
    staaf.style.setProperty('--kleur', STAAF_KLEUREN[toon]);
    staaf.style.setProperty('--lengte', `${100 - (toon / 7) * 42}%`);
    staaf.style.setProperty('--dikte', `${Math.round(11 - toon * 0.8)}px`);
    // Kikkerkoor: blaadjes niet op één lijn. Andere instrumenten gebruiken --pad niet.
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
    staaf.dataset.positie = String(positie);
    // Keyboard: een zwarte toets (alleen versiering) rechts van do, re, fa, sol en la, als
    // de volgende witte toets er ook is.
    if ([0, 1, 3, 4, 5].includes(toon) && tonen[positie + 1] === toon + 1) staaf.dataset.zwart = '';
    staaf.setAttribute('aria-label', `toon ${positie + 1}`);
    staaf.addEventListener('animationend', (e) => {
      if (e.target === staaf) staaf.classList.remove('xylofoon__staaf--aan');
    });
    noot.addEventListener('animationend', () => staaf.classList.remove('xylofoon__staaf--aan'));
    el.appendChild(staaf);
    return staaf;
  });
  el.appendChild(voor);

  function zetKlasse(): void {
    el.className =
      huidig === 'xylofoon'
        ? 'xylofoon'
        : huidig === 'keyboard'
          ? 'xylofoon xylofoon--keyboard'
          : huidig === 'fluit'
            ? 'xylofoon xylofoon--fluit'
            : `xylofoon xylofoon--${huidig}`;
    el.classList.toggle('xylofoon--wacht', !actief);
  }
  zetKlasse();

  function licht(positie: number): void {
    const s = staven[positie];
    s.classList.remove('xylofoon__staaf--aan');
    void s.offsetWidth; // animatie opnieuw starten
    s.classList.add('xylofoon__staaf--aan');
  }

  const speel = (positie: number, wanneer = 0): void => speelInstrument(huidig, TONEN[tonen[positie]], wanneer);

  function raak(vinger: number, staaf: HTMLElement): void {
    if (!actief || staaf === vingers.get(vinger)) return;
    vingers.set(vinger, staaf);
    const positie = Number(staaf.dataset.positie);
    speel(positie);
    licht(positie);
    opTik?.(positie);
  }

  const staafOnder = (e: PointerEvent): HTMLElement | null =>
    (document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null)?.closest('.xylofoon__staaf') ?? null;

  el.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    vingers.set(e.pointerId, null);
    const s = staafOnder(e);
    if (s) raak(e.pointerId, s);
  });
  el.addEventListener('pointermove', (e) => {
    if (!vingers.has(e.pointerId)) return;
    const s = staafOnder(e);
    if (s) raak(e.pointerId, s);
  });
  const los = (e: PointerEvent): void => {
    vingers.delete(e.pointerId);
  };
  window.addEventListener('pointerup', los);
  window.addEventListener('pointercancel', los);

  return {
    element: el,
    licht,
    speel,
    zetActief: (aan) => {
      actief = aan;
      zetKlasse();
    },
    zetInstrument: (nieuw) => {
      huidig = nieuw;
      zetKlasse();
    },
    opruimen: () => {
      window.removeEventListener('pointerup', los);
      window.removeEventListener('pointercancel', los);
      el.remove();
    },
  };
}
