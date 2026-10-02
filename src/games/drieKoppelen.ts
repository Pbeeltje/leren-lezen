import type { OefeningDefinitie, Woord } from '../content/types.ts';
import { toonGoedFeedback, toonFoutFeedback } from '../ui/components/FeedbackOverlay.ts';
import { schud, schudAnders } from '../engine/oefeningGenerator.ts';

type Oefening = Extract<OefeningDefinitie, { type: 'drie-koppelen' }>;

const SVG_NS = 'http://www.w3.org/2000/svg';

export function renderDrieKoppelen(
  container: HTMLElement,
  oefening: Oefening,
  opties: { herkansingToegestaan: boolean },
  afgerond: (juist: boolean) => void,
): { vernietig: () => void } {
  container.innerHTML = '';

  const kaart = document.createElement('div');
  kaart.className = 'oefen-kaart';

  const rijen = document.createElement('div');
  rijen.className = 'koppel-rijen';
  kaart.appendChild(rijen);

  const plaatjesKolom = document.createElement('div');
  plaatjesKolom.className = 'koppel-kolom';
  rijen.appendChild(plaatjesKolom);

  const woordenKolom = document.createElement('div');
  woordenKolom.className = 'koppel-kolom';
  rijen.appendChild(woordenKolom);

  // Lijnen tussen gevonden paren, over de kolommen heen getekend.
  const lijnenLaag = document.createElementNS(SVG_NS, 'svg');
  lijnenLaag.classList.add('koppel-lijnen');
  lijnenLaag.setAttribute('aria-hidden', 'true');
  rijen.appendChild(lijnenLaag);

  const gevondenParen: { plaatje: HTMLButtonElement; woord: HTMLButtonElement; lijn: SVGLineElement }[] = [];
  let gekozenPlaatje: { woord: Woord; knop: HTMLButtonElement } | null = null;
  let gekozenWoord: { woord: Woord; knop: HTMLButtonElement } | null = null;
  let vergrendeld = false;
  let foutTimer: number | undefined;

  function tekenLijnen(): void {
    const basis = rijen.getBoundingClientRect();
    lijnenLaag.setAttribute('viewBox', `0 0 ${basis.width} ${basis.height}`);
    for (const { plaatje, woord, lijn } of gevondenParen) {
      const p = plaatje.getBoundingClientRect();
      const w = woord.getBoundingClientRect();
      // Liggende telefoon: woorden onder de plaatjes, dan van onderkant naar bovenkant.
      const onderElkaar = w.top >= p.bottom;
      lijn.setAttribute('x1', String((onderElkaar ? p.left + p.width / 2 : p.right) - basis.left));
      lijn.setAttribute('y1', String((onderElkaar ? p.bottom : p.top + p.height / 2) - basis.top));
      lijn.setAttribute('x2', String((onderElkaar ? w.left + w.width / 2 : w.left) - basis.left));
      lijn.setAttribute('y2', String((onderElkaar ? w.top : w.top + w.height / 2) - basis.top));
    }
  }

  const grootteWacht = new ResizeObserver(() => tekenLijnen());
  grootteWacht.observe(rijen);

  function terugzetten(): void {
    gekozenPlaatje?.knop.classList.remove('geselecteerd');
    gekozenWoord?.knop.classList.remove('geselecteerd');
    gekozenPlaatje = null;
    gekozenWoord = null;
  }

  function probeerKoppeling(): void {
    if (!gekozenPlaatje || !gekozenWoord || vergrendeld) return;
    const juist = gekozenPlaatje.woord.woord === gekozenWoord.woord.woord;

    if (juist) {
      for (const knop of [gekozenPlaatje.knop, gekozenWoord.knop]) {
        knop.classList.remove('geselecteerd');
        knop.classList.add('gevonden');
        knop.disabled = true;
      }
      const lijn = document.createElementNS(SVG_NS, 'line');
      lijnenLaag.appendChild(lijn);
      gevondenParen.push({ plaatje: gekozenPlaatje.knop, woord: gekozenWoord.knop, lijn });
      tekenLijnen();
      toonGoedFeedback();
      gekozenPlaatje = null;
      gekozenWoord = null;
      if (gevondenParen.length === oefening.paren.length) {
        vergrendeld = true;
        afgerond(true);
      }
      return;
    }

    toonFoutFeedback();
    const foutePlaatje = gekozenPlaatje.knop;
    const fouteWoord = gekozenWoord.knop;
    foutePlaatje.classList.add('fout-gekozen');
    fouteWoord.classList.add('fout-gekozen');
    vergrendeld = true;
    if (opties.herkansingToegestaan) {
      foutTimer = window.setTimeout(() => {
        foutePlaatje.classList.remove('fout-gekozen');
        fouteWoord.classList.remove('fout-gekozen');
        vergrendeld = false;
      }, 500);
      terugzetten();
    } else {
      afgerond(false);
    }
  }

  function maakKnop(woord: Woord, soort: 'plaatje' | 'woord'): HTMLButtonElement {
    const knop = document.createElement('button');
    knop.className = soort === 'plaatje' ? 'koppel-plaatje' : 'koppel-woord';
    if (soort === 'plaatje') {
      const img = document.createElement('img');
      img.src = woord.afbeeldingPad;
      img.alt = '';
      knop.appendChild(img);
    } else {
      knop.textContent = woord.woord;
    }
    knop.addEventListener('click', () => {
      if (vergrendeld || knop.disabled) return;
      const huidige = soort === 'plaatje' ? gekozenPlaatje : gekozenWoord;
      huidige?.knop.classList.remove('geselecteerd');
      const nieuw = huidige?.knop === knop ? null : { woord, knop };
      if (nieuw) knop.classList.add('geselecteerd');
      if (soort === 'plaatje') gekozenPlaatje = nieuw;
      else gekozenWoord = nieuw;
      probeerKoppeling();
    });
    return knop;
  }

  // Woorden nooit in precies dezelfde volgorde als de plaatjes (dan is het recht oversteken).
  const plaatjesVolgorde = schud(oefening.paren);
  const woordenVolgorde = schudAnders(plaatjesVolgorde, (a, b) => a.woord === b.woord);
  for (const woord of plaatjesVolgorde) plaatjesKolom.appendChild(maakKnop(woord, 'plaatje'));
  for (const woord of woordenVolgorde) woordenKolom.appendChild(maakKnop(woord, 'woord'));

  container.appendChild(kaart);

  return {
    vernietig: () => {
      clearTimeout(foutTimer);
      grootteWacht.disconnect();
      container.replaceChildren();
    },
  };
}
