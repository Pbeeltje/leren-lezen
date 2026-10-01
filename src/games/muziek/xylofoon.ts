import { STAAF_KLEUREN, TONEN, speelNoot } from '../../engine/muziek.ts';

// Een xylofoon van gekleurde staven, lang (laag) naar kort (hoog). Tikken speelt een toon;
// met de vinger eroverheen glijden speelt ze allemaal (glissando). tonen = indexen in TONEN.
export function maakXylofoon(
  tonen: number[],
  opTik?: (positie: number) => void,
): { element: HTMLElement; licht: (positie: number) => void; zetActief: (aan: boolean) => void; opruimen: () => void } {
  const el = document.createElement('div');
  el.className = 'xylofoon';
  let actief = true;
  let ingedrukt = false;
  let laatste: HTMLElement | null = null;

  const staven = tonen.map((toon, positie) => {
    const staaf = document.createElement('button');
    staaf.type = 'button';
    staaf.className = 'xylofoon__staaf';
    staaf.style.setProperty('--kleur', STAAF_KLEUREN[toon]);
    staaf.style.setProperty('--lengte', `${100 - (toon / 7) * 42}%`);
    staaf.dataset.positie = String(positie);
    staaf.setAttribute('aria-label', `toon ${positie + 1}`);
    staaf.addEventListener('animationend', () => staaf.classList.remove('xylofoon__staaf--aan'));
    el.appendChild(staaf);
    return staaf;
  });

  function licht(positie: number): void {
    const s = staven[positie];
    s.classList.remove('xylofoon__staaf--aan');
    void s.offsetWidth; // animatie opnieuw starten
    s.classList.add('xylofoon__staaf--aan');
  }

  function raak(staaf: HTMLElement): void {
    if (!actief || staaf === laatste) return;
    laatste = staaf;
    const positie = Number(staaf.dataset.positie);
    speelNoot(TONEN[tonen[positie]]);
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
    zetActief: (aan) => {
      actief = aan;
      el.classList.toggle('xylofoon--wacht', !aan);
    },
    opruimen: () => {
      window.removeEventListener('pointerup', los);
      window.removeEventListener('pointercancel', los);
      el.remove();
    },
  };
}
