import type { RekenOefeningDefinitie } from '../content/tellen/types.ts';
import { toonGoedFeedback, toonFoutFeedback } from '../ui/components/FeedbackOverlay.ts';
import { maakDobbelsteen } from '../ui/components/Dobbelsteen.ts';
import { schud } from '../engine/toeval.ts';

type Oefening = Extract<RekenOefeningDefinitie, { type: 'dubbele-dobbelsteen-naar-cijfer' }>;

export function renderDubbeleDobbelsteenNaarCijfer(
  container: HTMLElement,
  oefening: Oefening,
  opties: { herkansingToegestaan: boolean },
  afgerond: (juist: boolean) => void,
): { vernietig: () => void } {
  container.innerHTML = '';

  const kaart = document.createElement('div');
  kaart.className = 'oefen-kaart';

  const dobbelRij = document.createElement('div');
  dobbelRij.className = 'dubbele-dobbelsteen-rij';
  dobbelRij.appendChild(maakDobbelsteen(oefening.links));
  const plusTeken = document.createElement('div');
  plusTeken.className = 'dubbele-dobbelsteen-plus';
  plusTeken.textContent = '+';
  dobbelRij.appendChild(plusTeken);
  dobbelRij.appendChild(maakDobbelsteen(oefening.rechts));
  kaart.appendChild(dobbelRij);

  const keuzeRij = document.createElement('div');
  keuzeRij.className = 'keuze-rij';
  kaart.appendChild(keuzeRij);

  const opties_ = schud([oefening.cijfer, ...oefening.afleiders]);
  let afgehandeld = false;

  for (const getal of opties_) {
    const knop = document.createElement('button');
    knop.className = 'keuze-knop';
    knop.textContent = String(getal);
    knop.addEventListener('click', () => {
      if (afgehandeld) return;
      const juist = getal === oefening.cijfer;

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
