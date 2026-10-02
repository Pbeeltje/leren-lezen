import { STAAF_KLEUREN, TONEN, speelInstrument, type Instrument } from '../../engine/muziek.ts';

// Een xylofoon van gekleurde staven, lang (laag) naar kort (hoog). Tikken speelt een toon;
// met de vinger eroverheen glijden speelt ze allemaal (glissando). tonen = indexen in TONEN.
// Dezelfde knoppen worden met zetInstrument een harp (snaren), een fluit
// (gaatjes) of een keyboard. Elke toon houdt zijn kleur, zodat de stippen van Speel na
// blijven kloppen.
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
  let huidig = instrument;
  let actief = true;
  let ingedrukt = false;
  let laatste: HTMLElement | null = null;

  const staven = tonen.map((toon, positie) => {
    const staaf = document.createElement('button');
    staaf.type = 'button';
    staaf.className = 'xylofoon__staaf';
    staaf.style.setProperty('--kleur', STAAF_KLEUREN[toon]);
    staaf.style.setProperty('--lengte', `${100 - (toon / 7) * 42}%`);
    staaf.style.setProperty('--dikte', `${Math.round(11 - toon * 0.8)}px`);
    staaf.dataset.positie = String(positie);
    // Keyboard: een zwarte toets (alleen versiering) rechts van do, re, fa, sol en la, als
    // de volgende witte toets er ook is.
    if ([0, 1, 3, 4, 5].includes(toon) && tonen[positie + 1] === toon + 1) staaf.dataset.zwart = '';
    staaf.setAttribute('aria-label', `toon ${positie + 1}`);
    staaf.addEventListener('animationend', () => staaf.classList.remove('xylofoon__staaf--aan'));
    el.appendChild(staaf);
    return staaf;
  });

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

  function raak(staaf: HTMLElement): void {
    if (!actief || staaf === laatste) return;
    laatste = staaf;
    const positie = Number(staaf.dataset.positie);
    speel(positie);
    licht(positie);
    opTik?.(positie);
  }

  const staafOnder = (e: PointerEvent): HTMLElement | null =>
    (document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null)?.closest('.xylofoon__staaf') ?? null;

  el.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    ingedrukt = true;
    laatste = null;
    const s = staafOnder(e);
    if (s) raak(s);
  });
  el.addEventListener('pointermove', (e) => {
    if (!ingedrukt) return;
    const s = staafOnder(e);
    if (s) raak(s);
  });
  const los = (): void => {
    ingedrukt = false;
    laatste = null;
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
