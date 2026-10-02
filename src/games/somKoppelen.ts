import type { RekenOefeningDefinitie, RekenSom } from '../content/tellen/types.ts';
import { schrijfSom } from '../content/tellen/som.ts';
import { toonFoutFeedback, toonGoedFeedback } from '../ui/components/FeedbackOverlay.ts';
import { schud, schudAnders } from '../engine/oefeningGenerator.ts';

type Oefening = Extract<RekenOefeningDefinitie, { type: 'som-koppelen' }>;

const SVG_NS = 'http://www.w3.org/2000/svg';

function zelfde(a: RekenSom, b: RekenSom): boolean {
  return a.a === b.a && a.b === b.b && a.teken === b.teken;
}

export function renderSomKoppelen(
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

  const somKolom = document.createElement('div');
  somKolom.className = 'koppel-kolom';
  rijen.appendChild(somKolom);

  const uitkomstKolom = document.createElement('div');
  uitkomstKolom.className = 'koppel-kolom';
  rijen.appendChild(uitkomstKolom);

  const lijnenLaag = document.createElementNS(SVG_NS, 'svg');
  lijnenLaag.classList.add('koppel-lijnen');
  lijnenLaag.setAttribute('aria-hidden', 'true');
  rijen.appendChild(lijnenLaag);

  const gevondenParen: { som: HTMLButtonElement; uitkomst: HTMLButtonElement; lijn: SVGLineElement }[] = [];
  let gekozenSom: { som: RekenSom; knop: HTMLButtonElement } | null = null;
  let gekozenUitkomst: { som: RekenSom; knop: HTMLButtonElement } | null = null;
  let vergrendeld = false;
  let foutTimer: number | undefined;

  function tekenLijnen(): void {
    const basis = rijen.getBoundingClientRect();
    lijnenLaag.setAttribute('viewBox', `0 0 ${basis.width} ${basis.height}`);
    for (const { som, uitkomst, lijn } of gevondenParen) {
      const p = som.getBoundingClientRect();
      const w = uitkomst.getBoundingClientRect();
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
    gekozenSom?.knop.classList.remove('geselecteerd');
    gekozenUitkomst?.knop.classList.remove('geselecteerd');
    gekozenSom = null;
    gekozenUitkomst = null;
  }

  function probeerKoppeling(): void {
    if (!gekozenSom || !gekozenUitkomst || vergrendeld) return;
    const juist = zelfde(gekozenSom.som, gekozenUitkomst.som);

    if (juist) {
      for (const knop of [gekozenSom.knop, gekozenUitkomst.knop]) {
        knop.classList.remove('geselecteerd');
        knop.classList.add('gevonden');
        knop.disabled = true;
      }
      const lijn = document.createElementNS(SVG_NS, 'line');
      lijnenLaag.appendChild(lijn);
      gevondenParen.push({ som: gekozenSom.knop, uitkomst: gekozenUitkomst.knop, lijn });
      tekenLijnen();
      toonGoedFeedback();
      gekozenSom = null;
      gekozenUitkomst = null;
      if (gevondenParen.length === oefening.paren.length) {
        vergrendeld = true;
        afgerond(true);
      }
      return;
    }

    toonFoutFeedback();
    const fouteSom = gekozenSom.knop;
    const fouteUitkomst = gekozenUitkomst.knop;
    fouteSom.classList.add('fout-gekozen');
    fouteUitkomst.classList.add('fout-gekozen');
    vergrendeld = true;
    if (opties.herkansingToegestaan) {
      foutTimer = window.setTimeout(() => {
        fouteSom.classList.remove('fout-gekozen');
        fouteUitkomst.classList.remove('fout-gekozen');
        vergrendeld = false;
      }, 500);
      terugzetten();
    } else {
      afgerond(false);
    }
  }

  function maakKnop(som: RekenSom, soort: 'som' | 'uitkomst'): HTMLButtonElement {
    const knop = document.createElement('button');
    knop.className = soort === 'som' ? 'koppel-woord koppel-som' : 'koppel-woord koppel-uitkomst';
    knop.textContent = soort === 'som' ? schrijfSom(som.a, som.teken, som.b) : String(som.antwoord);
    knop.addEventListener('click', () => {
      if (vergrendeld || knop.disabled) return;
      const huidige = soort === 'som' ? gekozenSom : gekozenUitkomst;
      huidige?.knop.classList.remove('geselecteerd');
      const nieuw = huidige?.knop === knop ? null : { som, knop };
      if (nieuw) knop.classList.add('geselecteerd');
      if (soort === 'som') gekozenSom = nieuw;
      else gekozenUitkomst = nieuw;
      probeerKoppeling();
    });
    return knop;
  }

  const somVolgorde = schud([...oefening.paren]);
  const uitkomstVolgorde = schudAnders(somVolgorde);
  for (const som of somVolgorde) somKolom.appendChild(maakKnop(som, 'som'));
  for (const som of uitkomstVolgorde) uitkomstKolom.appendChild(maakKnop(som, 'uitkomst'));

  container.appendChild(kaart);
  return {
    vernietig: () => {
      clearTimeout(foutTimer);
      grootteWacht.disconnect();
      container.replaceChildren();
    },
  };
}
