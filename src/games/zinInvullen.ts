import type { OefeningDefinitie } from '../content/types.ts';
import { toonGoedFeedback, toonFoutFeedback } from '../ui/components/FeedbackOverlay.ts';
import { schud } from '../engine/oefeningGenerator.ts';

type Oefening = Extract<OefeningDefinitie, { type: 'zin-invullen' }>;

export function renderZinInvullen(
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

  const zinEl = document.createElement('p');
  zinEl.className = 'zin-tekst';
  zinEl.textContent = oefening.zin.replace('___', '▁▁▁▁▁');
  kaart.appendChild(zinEl);

  let afgehandeld = false;

  function afhandelen(juist: boolean): void {
    if (afgehandeld) return;
    if (juist) {
      afgehandeld = true;
      toonGoedFeedback();
      afgerond(true);
      return;
    }
    toonFoutFeedback();
    if (!opties.herkansingToegestaan) {
      afgehandeld = true;
      afgerond(false);
    }
  }

  if (oefening.modus === 'meerkeuze') {
    const keuzeRij = document.createElement('div');
    keuzeRij.className = 'keuze-rij';
    const alleOpties = schud([oefening.doel, ...oefening.afleiders]);

    for (const optie of alleOpties) {
      const knop = document.createElement('button');
      knop.className = 'keuze-knop';
      knop.textContent = optie.woord;
      knop.addEventListener('click', () => {
        if (afgehandeld) return;
        const juist = optie.woord === oefening.doel.woord;
        knop.classList.add(juist ? 'goed-gekozen' : 'fout-gekozen');
        if (!juist && opties.herkansingToegestaan) {
          setTimeout(() => knop.classList.remove('fout-gekozen'), 500);
        }
        afhandelen(juist);
      });
      keuzeRij.appendChild(knop);
    }
    kaart.appendChild(keuzeRij);
  } else {
    const invoer = document.createElement('input');
    invoer.type = 'text';
    invoer.className = 'typen-invoer';
    invoer.autocomplete = 'off';
    invoer.autocapitalize = 'off';
    invoer.spellcheck = false;
    invoer.placeholder = 'typ het woord...';
    kaart.appendChild(invoer);

    const knop = document.createElement('button');
    knop.className = 'typen-knop';
    knop.textContent = 'Controleer';
    kaart.appendChild(knop);

    const controleer = (): void => {
      if (afgehandeld) return;
      const antwoord = invoer.value.trim().toLowerCase();
      if (!antwoord) return;
      const juist = antwoord === oefening.doel.woord.toLowerCase();

      invoer.classList.add(juist ? 'goed-gekozen' : 'fout-gekozen');
      if (!juist && opties.herkansingToegestaan) {
        setTimeout(() => {
          invoer.classList.remove('fout-gekozen');
          invoer.value = '';
          invoer.focus();
        }, 500);
      }
      afhandelen(juist);
    };

    knop.addEventListener('click', controleer);
    invoer.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') controleer();
    });
    // Bij de eerste vraag hangt het scherm nog niet in de pagina; focus pas na het mounten.
    requestAnimationFrame(() => invoer.focus());
  }

  container.appendChild(kaart);

  return { vernietig: () => container.replaceChildren() };
}
