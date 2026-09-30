import type { OefeningDefinitie } from '../content/types.ts';
import { toonGoedFeedback, toonFoutFeedback } from '../ui/components/FeedbackOverlay.ts';
import { schud } from '../engine/oefeningGenerator.ts';

type Oefening = Extract<OefeningDefinitie, { type: 'woordwolk' }>;

// Plaatje in het midden, één doelwoord verstopt tussen een wolk van afleiders; tik het
// juiste woord aan. Losjes geïnspireerd op het klassieke "kleur de juiste woorden bij
// het plaatje"-werkblad (dat liet het doelwoord vaker terugkomen — hier bewust maar
// één keer, voor een eenduidig "één goed antwoord").
export function renderWoordwolk(
  container: HTMLElement,
  oefening: Oefening,
  opties: { herkansingToegestaan: boolean },
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

  const tegels = schud([oefening.doel, ...oefening.afleiders]);
  let afgehandeld = false;

  for (const optie of tegels) {
    const knop = document.createElement('button');
    knop.className = 'woordwolk-tegel';
    knop.textContent = optie.woord;
    knop.addEventListener('click', () => {
      if (afgehandeld) return;
      const juist = optie.woord === oefening.doel.woord;

      if (juist) {
        afgehandeld = true;
        knop.classList.add('gevonden');
        toonGoedFeedback();
        afgerond(true);
        return;
      }

      knop.classList.add('fout-gekozen');
      toonFoutFeedback();

      if (opties.herkansingToegestaan) {
        setTimeout(() => knop.classList.remove('fout-gekozen'), 350);
      } else {
        afgehandeld = true;
        afgerond(false);
      }
    });
    wolk.appendChild(knop);
  }

  container.appendChild(kaart);

  return { vernietig: () => container.replaceChildren() };
}
