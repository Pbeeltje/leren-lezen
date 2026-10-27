import { STAAF_KLEUREN, TONEN, speelInstrument, type Instrument } from '../../engine/muziek.ts';
import { UITERLIJK } from './uiterlijk.ts';

// Een xylofoon van gekleurde staven, lang (laag) naar kort (hoog). Tikken speelt een toon;
// met de vinger eroverheen glijden speelt ze allemaal (glissando). tonen = indexen in TONEN.
// Dezelfde knoppen worden met zetInstrument een ander instrument (harp, fluit, keyboard,
// kikkerkoor, trompetten, klokken): wat dat instrument erbij tekent staat in uiterlijk.ts,
// en alleen het gekozen instrument wordt gebouwd. Elke toon houdt zijn kleur, zodat de
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
  let huidig = instrument;
  let actief = true;
  // Per vinger de staaf waar hij nu op zit. Eén gedeelde "laatste" liet twee vingers elkaar
  // steeds overschrijven: elke trilling van een vinger speelde dan opnieuw (oorverdovend).
  const vingers = new Map<number, HTMLElement | null>();
  let staven: HTMLButtonElement[] = [];

  function maakStaaf(toon: number, positie: number): HTMLButtonElement {
    const staaf = document.createElement('button');
    staaf.type = 'button';
    staaf.className = 'xylofoon__staaf';
    staaf.style.setProperty('--kleur', STAAF_KLEUREN[toon]);
    staaf.style.setProperty('--lengte', `${100 - (toon / 7) * 42}%`);
    staaf.dataset.positie = String(positie);
    staaf.setAttribute('aria-label', `toon ${positie + 1}`);
    staaf.addEventListener('animationend', (e) => {
      if (e.target === staaf) staaf.classList.remove('xylofoon__staaf--aan');
    });
    UITERLIJK[huidig].knop?.(staaf, toon, positie, tonen);
    return staaf;
  }

  // Alles opnieuw voor het gekozen instrument: versiering achter, de knoppen, versiering voor.
  function bouw(): void {
    const u = UITERLIJK[huidig];
    staven = tonen.map(maakStaaf);
    vingers.clear();
    el.replaceChildren(...[u.achter?.(), ...staven, u.voor?.()].filter((x): x is HTMLElement => !!x));
    zetKlasse();
    leg();
  }

  function zetKlasse(): void {
    el.className = `xylofoon xylofoon--${huidig}`;
    el.classList.toggle('xylofoon--wacht', !actief);
  }

  // Trompetten (schuin) en klokken (het rek) hangen af van de maat van het vak.
  const leg = (): void => UITERLIJK[huidig].leg?.(el, staven);
  const kijker = new ResizeObserver(leg);
  kijker.observe(el);

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

  bouw();

  return {
    element: el,
    licht,
    speel,
    zetActief: (aan) => {
      actief = aan;
      zetKlasse();
    },
    zetInstrument: (nieuw) => {
      if (nieuw === huidig) return;
      huidig = nieuw;
      bouw();
    },
    opruimen: () => {
      kijker.disconnect();
      window.removeEventListener('pointerup', los);
      window.removeEventListener('pointercancel', los);
      el.remove();
    },
  };
}
