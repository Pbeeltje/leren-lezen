import type { OefeningDefinitie, Woord } from '../content/types.ts';
import { toonGoedFeedback, toonFoutFeedback } from '../ui/components/FeedbackOverlay.ts';
import { schud } from '../engine/oefeningGenerator.ts';

type Oefening = Extract<OefeningDefinitie, { type: 'woord-plaatje-keuze' }>;

export function renderWoordPlaatjeKeuze(
  container: HTMLElement,
  oefening: Oefening,
  opties: { herkansingToegestaan: boolean },
  afgerond: (juist: boolean) => void,
): { vernietig: () => void } {
  container.innerHTML = '';

  const kaart = document.createElement('div');
  kaart.className = 'oefen-kaart';

  const woord = document.createElement('div');
  woord.className = 'oefen-kaart__woord';
  woord.textContent = oefening.doel.woord;
  kaart.appendChild(woord);

  const keuzeRij = document.createElement('div');
  keuzeRij.className = 'keuze-rij';
  kaart.appendChild(keuzeRij);

  const opties_: Woord[] = schud([oefening.doel, ...oefening.afleiders]);
  let afgehandeld = false;

  for (const optie of opties_) {
    const knop = document.createElement('button');
    knop.className = 'keuze-knop keuze-knop--plaatje';
    const img = document.createElement('img');
    img.src = optie.afbeeldingPad;
    img.alt = '';
    knop.appendChild(img);

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
