import type { OefeningDefinitie } from '../content/types.ts';
import { toonGoedFeedback, toonFoutFeedback } from '../ui/components/FeedbackOverlay.ts';
import { koppelSchermToetsenbord } from '../ui/components/SchermToetsenbord.ts';

type Oefening = Extract<OefeningDefinitie, { type: 'zelf-typen' }>;

export function renderZelfTypen(
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
  plaatje.src = oefening.woord.afbeeldingPad;
  plaatje.alt = '';
  kaart.appendChild(plaatje);

  const invoer = document.createElement('input');
  invoer.type = 'text';
  invoer.className = 'typen-invoer';
  invoer.autocomplete = 'off';
  invoer.autocapitalize = 'off';
  invoer.spellcheck = false;
  invoer.placeholder = 'typ het woord...';
  kaart.appendChild(invoer);
  koppelSchermToetsenbord(invoer, 'letters');

  const knop = document.createElement('button');
  knop.className = 'typen-knop';
  knop.textContent = 'Controleer';
  kaart.appendChild(knop);

  let afgehandeld = false;

  function controleer(): void {
    if (afgehandeld) return;
    const antwoord = invoer.value.trim().toLowerCase();
    if (!antwoord) return;
    const juist = antwoord === oefening.woord.woord.toLowerCase();

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
  // Bij de eerste vraag hangt het scherm nog niet in de pagina; focus pas na het mounten.
  requestAnimationFrame(() => invoer.focus());

  return { vernietig: () => container.replaceChildren() };
}
