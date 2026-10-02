import type { RekenOefeningDefinitie } from '../content/tellen/types.ts';
import { schrijfSom } from '../content/tellen/som.ts';
import { toonFoutFeedback, toonGoedFeedback } from '../ui/components/FeedbackOverlay.ts';
import { koppelSchermToetsenbord } from '../ui/components/SchermToetsenbord.ts';

type Oefening = Extract<RekenOefeningDefinitie, { type: 'som-typen' }>;

export function renderSomTypen(
  container: HTMLElement,
  oefening: Oefening,
  opties: { herkansingToegestaan: boolean },
  afgerond: (juist: boolean) => void,
): { vernietig: () => void } {
  container.innerHTML = '';

  const kaart = document.createElement('div');
  kaart.className = 'oefen-kaart';

  const rij = document.createElement('div');
  rij.className = 'som-rij';

  const tekst = document.createElement('div');
  tekst.className = 'oefen-kaart__som';
  tekst.textContent = `${schrijfSom(oefening.a, oefening.teken, oefening.b)} =`;
  rij.appendChild(tekst);

  const invoer = document.createElement('input');
  invoer.type = 'text';
  invoer.inputMode = 'numeric';
  invoer.className = 'typen-invoer som-invoer';
  invoer.autocomplete = 'off';
  invoer.setAttribute('aria-label', 'Antwoord');
  rij.appendChild(invoer);

  kaart.appendChild(rij);
  koppelSchermToetsenbord(invoer, 'cijfers', rij);

  const knop = document.createElement('button');
  knop.className = 'typen-knop';
  knop.textContent = 'Controleer';
  kaart.appendChild(knop);

  let afgehandeld = false;

  function controleer(): void {
    if (afgehandeld) return;
    const antwoord = invoer.value.trim();
    if (!antwoord) return;
    const juist = Number(antwoord) === oefening.antwoord;

    if (juist) {
      afgehandeld = true;
      invoer.classList.add('goed-gekozen');
      toonGoedFeedback();
      afgerond(true);
      return;
    }

    invoer.classList.add('fout-gekozen');
    toonFoutFeedback();
    if (opties.herkansingToegestaan) {
      setTimeout(() => {
        invoer.classList.remove('fout-gekozen');
        invoer.value = '';
        invoer.focus();
      }, 500);
    } else {
      afgehandeld = true;
      afgerond(false);
    }
  }

  knop.addEventListener('click', controleer);
  invoer.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') controleer();
  });

  container.appendChild(kaart);
  invoer.focus();
  return { vernietig: () => container.replaceChildren() };
}
