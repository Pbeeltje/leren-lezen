import type { RekenOefeningDefinitie } from '../content/tellen/types.ts';
import { toonGoedFeedback, toonFoutFeedback } from '../ui/components/FeedbackOverlay.ts';

type Oefening = Extract<RekenOefeningDefinitie, { type: 'cijfer-naar-hoeveelheid' }>;

function schudArray<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

function maakGroep(icoonPad: string, aantal: number): HTMLElement {
  const groep = document.createElement('div');
  groep.className = 'telplaatjes-groepje';
  for (let i = 0; i < aantal; i++) {
    const img = document.createElement('img');
    img.src = icoonPad;
    img.alt = '';
    groep.appendChild(img);
  }
  return groep;
}

export function renderCijferNaarHoeveelheid(
  container: HTMLElement,
  oefening: Oefening,
  opties: { herkansingToegestaan: boolean },
  afgerond: (juist: boolean) => void,
): { vernietig: () => void } {
  container.innerHTML = '';

  const kaart = document.createElement('div');
  kaart.className = 'oefen-kaart';

  const cijferEl = document.createElement('div');
  cijferEl.className = 'oefen-kaart__cijfer';
  cijferEl.textContent = String(oefening.cijfer);
  kaart.appendChild(cijferEl);

  const keuzeRij = document.createElement('div');
  keuzeRij.className = 'keuze-rij';
  kaart.appendChild(keuzeRij);

  const opties_ = schudArray([oefening.cijfer, ...oefening.afleiders]);
  let afgehandeld = false;

  for (const aantal of opties_) {
    const knop = document.createElement('button');
    knop.className = 'keuze-knop keuze-knop--groep';
    knop.appendChild(maakGroep(oefening.object.icoonPad, aantal));

    knop.addEventListener('click', () => {
      if (afgehandeld) return;
      const juist = aantal === oefening.cijfer;

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
