import type { OefeningDefinitie } from '../content/types.ts';
import { toonGoedFeedback } from '../ui/components/FeedbackOverlay.ts';

type Oefening = Extract<OefeningDefinitie, { type: 'woordwolk' }>;

function schudArray<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

// Klassieke "kleur de juiste woorden bij het plaatje"-opdracht: het doelwoord komt
// een paar keer voor tussen een wolk van andere woorden uit de kern; tik ze allemaal aan.
export function renderWoordwolk(
  container: HTMLElement,
  oefening: Oefening,
  _opties: { herkansingToegestaan: boolean },
  afgerond: (juist: boolean) => void,
): { vernietig: () => void } {
  container.innerHTML = '';

  const kaart = document.createElement('div');
  kaart.className = 'oefen-kaart';

  const plaatje = document.createElement('img');
  plaatje.className = 'oefen-kaart__plaatje';
  plaatje.src = oefening.doel.afbeeldingPad;
  plaatje.alt = '';
  kaart.appendChild(plaatje);

  const wolk = document.createElement('div');
  wolk.className = 'woordwolk-rij';
  kaart.appendChild(wolk);

  const tegels = schudArray([
    ...Array.from({ length: oefening.herhaling }, () => oefening.doel.woord),
    ...oefening.afleiders.map((w) => w.woord),
  ]);

  let gevonden = 0;
  const teVinden = oefening.herhaling;

  for (const woord of tegels) {
    const knop = document.createElement('button');
    knop.className = 'woordwolk-tegel';
    knop.textContent = woord;
    knop.addEventListener('click', () => {
      if (knop.classList.contains('gevonden')) return;
      if (woord === oefening.doel.woord) {
        knop.classList.add('gevonden');
        gevonden++;
        if (gevonden === teVinden) {
          toonGoedFeedback();
          setTimeout(() => afgerond(true), 100);
        }
      } else {
        knop.classList.add('fout-gekozen');
        setTimeout(() => knop.classList.remove('fout-gekozen'), 350);
      }
    });
    wolk.appendChild(knop);
  }

  container.appendChild(kaart);

  return { vernietig: () => container.replaceChildren() };
}
