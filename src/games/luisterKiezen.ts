import type { LuisterVraag } from '../engine/luisterenGenerator.ts';
import { toonGoedFeedback, toonFoutFeedback } from '../ui/components/FeedbackOverlay.ts';
import { speelAf, woordAudioPad } from '../engine/audioManager.ts';

// Puur plaatjes, geen tekst nergens op het scherm -- dit is voor kinderen die nog niet
// kunnen lezen. Geen toets-achtige "fout is meteen voorbij"-modus: altijd opnieuw
// proberen, precies zoals de rest van de app niets op slot zet of afstraft.
export function renderLuisterKiezen(
  container: HTMLElement,
  vraag: LuisterVraag,
  afgerond: () => void,
): { vernietig: () => void } {
  container.innerHTML = '';

  const kaart = document.createElement('div');
  kaart.className = 'oefen-kaart';

  const rij = document.createElement('div');
  rij.className = 'luister-rij';
  kaart.appendChild(rij);

  let afgehandeld = false;

  for (const optie of vraag.opties) {
    const knop = document.createElement('button');
    knop.className = 'luister-plaatje';
    const img = document.createElement('img');
    img.src = optie.afbeeldingPad;
    img.alt = '';
    knop.appendChild(img);
    knop.addEventListener('click', () => {
      if (afgehandeld) return;
      const juist = optie.woord === vraag.doel.woord;

      if (juist) {
        afgehandeld = true;
        knop.classList.add('gevonden');
        toonGoedFeedback();
        setTimeout(afgerond, 900);
        return;
      }

      knop.classList.add('fout-gekozen');
      toonFoutFeedback();
      setTimeout(() => knop.classList.remove('fout-gekozen'), 500);
    });
    rij.appendChild(knop);
  }

  container.appendChild(kaart);
  speelAf(woordAudioPad(vraag.doel.woord));

  return { vernietig: () => container.replaceChildren() };
}
