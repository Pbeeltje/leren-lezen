import type { OefeningDefinitie, Woord } from '../content/types.ts';
import { toonGoedFeedback, toonFoutFeedback } from '../ui/components/FeedbackOverlay.ts';

type Oefening = Extract<OefeningDefinitie, { type: 'drie-koppelen' }>;

function schudArray<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

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

  const gevonden = new Set<string>();
  let gekozenPlaatje: { woord: Woord; knop: HTMLButtonElement } | null = null;
  let gekozenWoord: { woord: Woord; knop: HTMLButtonElement } | null = null;
  let vergrendeld = false;

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
      gevonden.add(gekozenPlaatje.woord.woord);
      gekozenPlaatje.knop.classList.remove('geselecteerd');
      gekozenWoord.knop.classList.remove('geselecteerd');
      gekozenPlaatje.knop.classList.add('gevonden');
      gekozenWoord.knop.classList.add('gevonden');
      gekozenPlaatje.knop.disabled = true;
      gekozenWoord.knop.disabled = true;
      toonGoedFeedback();
      gekozenPlaatje = null;
      gekozenWoord = null;
      if (gevonden.size === oefening.paren.length) {
        vergrendeld = true;
        afgerond(true);
      }
      return;
    }

    toonFoutFeedback();
    if (opties.herkansingToegestaan) {
      const foutePlaatje = gekozenPlaatje.knop;
      const fouteWoord = gekozenWoord.knop;
      foutePlaatje.classList.add('fout-gekozen');
      fouteWoord.classList.add('fout-gekozen');
      vergrendeld = true;
      setTimeout(() => {
        foutePlaatje.classList.remove('fout-gekozen');
        fouteWoord.classList.remove('fout-gekozen');
        vergrendeld = false;
      }, 500);
      terugzetten();
    } else {
      vergrendeld = true;
      afgerond(false);
    }
  }

  for (const woord of schudArray(oefening.paren)) {
    const knop = document.createElement('button');
    knop.className = 'koppel-plaatje';
    const img = document.createElement('img');
    img.src = woord.afbeeldingPad;
    img.alt = '';
    knop.appendChild(img);
    knop.addEventListener('click', () => {
      if (vergrendeld || knop.disabled) return;
      if (gekozenPlaatje?.knop === knop) {
        knop.classList.remove('geselecteerd');
        gekozenPlaatje = null;
        return;
      }
      gekozenPlaatje?.knop.classList.remove('geselecteerd');
      knop.classList.add('geselecteerd');
      gekozenPlaatje = { woord, knop };
      probeerKoppeling();
    });
    plaatjesKolom.appendChild(knop);
  }

  for (const woord of schudArray(oefening.paren)) {
    const knop = document.createElement('button');
    knop.className = 'koppel-woord';
    knop.textContent = woord.woord;
    knop.addEventListener('click', () => {
      if (vergrendeld || knop.disabled) return;
      if (gekozenWoord?.knop === knop) {
        knop.classList.remove('geselecteerd');
        gekozenWoord = null;
        return;
      }
      gekozenWoord?.knop.classList.remove('geselecteerd');
      knop.classList.add('geselecteerd');
      gekozenWoord = { woord, knop };
      probeerKoppeling();
    });
    woordenKolom.appendChild(knop);
  }

  container.appendChild(kaart);

  return { vernietig: () => container.replaceChildren() };
}
