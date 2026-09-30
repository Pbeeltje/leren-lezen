import type { OefeningDefinitie } from '../content/types.ts';
import { toonGoedFeedback, toonFoutFeedback } from '../ui/components/FeedbackOverlay.ts';
import { schudAnders } from '../engine/oefeningGenerator.ts';

type Oefening = Extract<OefeningDefinitie, { type: 'hakken-en-plakken' }>;

// "Hakken" (het woord in klanken opdelen) is hier de letterrij die al los staat;
// "plakken" (weer samenvoegen) is de tik-in-de-juiste-volgorde-actie van het kind.
export function renderHakkenEnPlakken(
  container: HTMLElement,
  oefening: Oefening,
  opties: { herkansingToegestaan: boolean },
  afgerond: (juist: boolean) => void,
): { vernietig: () => void } {
  container.innerHTML = '';

  const letters = oefening.woord.woord.split('');

  const kaart = document.createElement('div');
  kaart.className = 'oefen-kaart';

  const plaatje = document.createElement('img');
  plaatje.className = 'oefen-kaart__plaatje';
  plaatje.src = oefening.woord.afbeeldingPad;
  plaatje.alt = '';
  kaart.appendChild(plaatje);

  const sleufRij = document.createElement('div');
  sleufRij.className = 'doel-sleuf-rij';
  const sleuven: HTMLElement[] = letters.map(() => {
    const sleuf = document.createElement('div');
    sleuf.className = 'doel-sleuf';
    sleufRij.appendChild(sleuf);
    return sleuf;
  });
  kaart.appendChild(sleufRij);

  const letterRij = document.createElement('div');
  letterRij.className = 'letter-rij';
  kaart.appendChild(letterRij);

  let volgendeIndex = 0;
  let afgehandeld = false;
  const volgorde = schudAnders(letters);
  let klaarTimer: number | undefined;

  for (const letter of volgorde) {
    const tegel = document.createElement('button');
    tegel.className = 'letter-tegel';
    tegel.textContent = letter;

    tegel.addEventListener('click', () => {
      if (afgehandeld || tegel.classList.contains('gebruikt')) return;

      if (letter === letters[volgendeIndex]) {
        tegel.classList.add('gebruikt');
        const sleuf = sleuven[volgendeIndex];
        sleuf.textContent = letter;
        sleuf.classList.add('gevuld');
        volgendeIndex++;

        if (volgendeIndex === letters.length) {
          afgehandeld = true;
          toonGoedFeedback();
          klaarTimer = window.setTimeout(() => afgerond(true), 100);
        }
      } else {
        toonFoutFeedback();
        tegel.classList.add('fout-gekozen');
        if (opties.herkansingToegestaan) {
          setTimeout(() => tegel.classList.remove('fout-gekozen'), 350);
        } else {
          afgehandeld = true;
          afgerond(false);
        }
      }
    });

    letterRij.appendChild(tegel);
  }

  container.appendChild(kaart);

  return {
    vernietig: () => {
      clearTimeout(klaarTimer);
      container.replaceChildren();
    },
  };
}
