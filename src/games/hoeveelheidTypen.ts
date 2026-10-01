import type { RekenOefeningDefinitie } from '../content/tellen/types.ts';
import { toonGoedFeedback, toonFoutFeedback } from '../ui/components/FeedbackOverlay.ts';
import { koppelSchermToetsenbord } from '../ui/components/SchermToetsenbord.ts';

type Oefening = Extract<RekenOefeningDefinitie, { type: 'hoeveelheid-typen' }>;

export function renderHoeveelheidTypen(
  container: HTMLElement,
  oefening: Oefening,
  opties: { herkansingToegestaan: boolean },
  afgerond: (juist: boolean) => void,
): { vernietig: () => void } {
  container.innerHTML = '';

  const kaart = document.createElement('div');
  kaart.className = 'oefen-kaart';

  const plaatjesRij = document.createElement('div');
  plaatjesRij.className = 'telplaatjes-rij';
  // Vijfstructuur: hoogstens 5 per rij, zodat bv. 8 als 5 + 3 te zien is.
  plaatjesRij.style.gridTemplateColumns = `repeat(${Math.min(Math.max(oefening.aantal, 1), 5)}, auto)`;
  for (let i = 0; i < oefening.aantal; i++) {
    const img = document.createElement('img');
    img.src = oefening.object.icoonPad;
    img.alt = '';
    img.className = 'telplaatjes-rij__plaatje';
    plaatjesRij.appendChild(img);
  }
  kaart.appendChild(plaatjesRij);

  const invoer = document.createElement('input');
  invoer.type = 'text';
  invoer.inputMode = 'numeric';
  invoer.className = 'typen-invoer reeks-invoer';
  invoer.autocomplete = 'off';
  invoer.placeholder = '?';
  kaart.appendChild(invoer);
  koppelSchermToetsenbord(invoer, 'cijfers');

  const knop = document.createElement('button');
  knop.className = 'typen-knop';
  knop.textContent = 'Controleer';
  kaart.appendChild(knop);

  let afgehandeld = false;

  function controleer(): void {
    if (afgehandeld) return;
    const antwoord = invoer.value.trim();
    if (!antwoord) return;
    const juist = Number(antwoord) === oefening.aantal;

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
