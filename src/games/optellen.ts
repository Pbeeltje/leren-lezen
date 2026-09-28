import type { RekenOefeningDefinitie } from '../content/tellen/types.ts';
import { toonGoedFeedback, toonFoutFeedback } from '../ui/components/FeedbackOverlay.ts';

type Oefening = Extract<RekenOefeningDefinitie, { type: 'optellen' }>;

function schudArray<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

export function renderOptellen(
  container: HTMLElement,
  oefening: Oefening,
  opties: { herkansingToegestaan: boolean },
  afgerond: (juist: boolean) => void,
): { vernietig: () => void } {
  container.innerHTML = '';

  const kaart = document.createElement('div');
  kaart.className = 'oefen-kaart';

  const som = document.createElement('div');
  som.className = 'oefen-kaart__som';
  som.textContent = `${oefening.a} + ${oefening.b} = ?`;
  kaart.appendChild(som);

  const keuzeRij = document.createElement('div');
  keuzeRij.className = 'keuze-rij';
  kaart.appendChild(keuzeRij);

  const opties_ = schudArray([oefening.antwoord, ...oefening.afleiders]);
  let afgehandeld = false;

  for (const getal of opties_) {
    const knop = document.createElement('button');
    knop.className = 'keuze-knop';
    knop.textContent = String(getal);
    knop.addEventListener('click', () => {
      if (afgehandeld) return;
      const juist = getal === oefening.antwoord;

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
