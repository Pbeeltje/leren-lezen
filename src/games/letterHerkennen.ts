import type { OefeningDefinitie } from '../content/types.ts';
import { toonGoedFeedback, toonFoutFeedback } from '../ui/components/FeedbackOverlay.ts';

type Oefening = Extract<OefeningDefinitie, { type: 'letter-herkennen' }>;

function schudArray<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

export function renderLetterHerkennen(
  container: HTMLElement,
  oefening: Oefening,
  opties: { herkansingToegestaan: boolean },
  afgerond: (juist: boolean) => void,
): { vernietig: () => void } {
  container.innerHTML = '';

  const kaart = document.createElement('div');
  kaart.className = 'oefen-kaart';

  const grootTeken = document.createElement('div');
  grootTeken.className = 'oefen-kaart__groot-teken';
  grootTeken.textContent = oefening.letter;
  kaart.appendChild(grootTeken);

  const keuzeRij = document.createElement('div');
  keuzeRij.className = 'keuze-rij';
  kaart.appendChild(keuzeRij);

  const opties_ = schudArray([oefening.doel, ...oefening.afleiders]);
  let afgehandeld = false;

  for (const optie of opties_) {
    const knop = document.createElement('button');
    knop.className = 'keuze-knop';
    knop.textContent = optie.woord;
    knop.addEventListener('click', () => {
      if (afgehandeld) return;
      const juist = optie.woord === oefening.doel.woord;

      if (juist) {
        afgehandeld = true;
        knop.classList.add('goed-gekozen');
        toonGoedFeedback();
        afgerond(true);
        return;
      }

      knop.classList.add('fout-gekozen');
      toonFoutFeedback();

      if (opties.herkansingToegestaan) {
        setTimeout(() => knop.classList.remove('fout-gekozen'), 500);
      } else {
        afgehandeld = true;
        afgerond(false);
      }
    });
    keuzeRij.appendChild(knop);
  }

  container.appendChild(kaart);

  return { vernietig: () => container.replaceChildren() };
}
