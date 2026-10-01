import type { RekenOefeningDefinitie } from '../content/tellen/types.ts';
import { toonGoedFeedback, toonFoutFeedback } from '../ui/components/FeedbackOverlay.ts';
import { koppelSchermToetsenbord } from '../ui/components/SchermToetsenbord.ts';

type Oefening = Extract<RekenOefeningDefinitie, { type: 'reeks-aanvullen' }>;

export function renderReeksAanvullen(
  container: HTMLElement,
  oefening: Oefening,
  opties: { herkansingToegestaan: boolean },
  afgerond: (juist: boolean) => void,
): { vernietig: () => void } {
  container.innerHTML = '';

  const kaart = document.createElement('div');
  kaart.className = 'oefen-kaart';

  const reeksRij = document.createElement('div');
  reeksRij.className = 'reeks-rij';

  const voorTegel = document.createElement('div');
  voorTegel.className = 'reeks-getal';
  voorTegel.textContent = String(oefening.voor);
  reeksRij.appendChild(voorTegel);

  const invoer = document.createElement('input');
  invoer.type = 'text';
  invoer.inputMode = 'numeric';
  invoer.className = 'typen-invoer reeks-invoer';
  invoer.autocomplete = 'off';
  invoer.placeholder = '?';
  reeksRij.appendChild(invoer);

  const naTegel = document.createElement('div');
  naTegel.className = 'reeks-getal';
  naTegel.textContent = String(oefening.na);
  reeksRij.appendChild(naTegel);

  kaart.appendChild(reeksRij);
  koppelSchermToetsenbord(invoer, 'cijfers', reeksRij);

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
