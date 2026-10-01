import type { OefeningDefinitie } from '../content/types.ts';
import { toonGoedFeedback, toonFoutFeedback } from '../ui/components/FeedbackOverlay.ts';
import { schudAnders } from '../engine/oefeningGenerator.ts';
import { LetterBlokkenScene } from '../three/letterBlocks.ts';

type Oefening = Extract<OefeningDefinitie, { type: 'woord-bouwen' }>;

export function renderWoordBouwen(
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

  const canvasHouder = document.createElement('div');
  canvasHouder.className = 'blokken-canvas';
  kaart.appendChild(canvasHouder);

  container.appendChild(kaart);

  let volgendeIndex = 0;
  let afgehandeld = false;
  const alleLetters = schudAnders([...letters, ...oefening.afleidLetters]);
  let klaarTimer: number | undefined;

  const scene = new LetterBlokkenScene(canvasHouder, (letter, blokIndex) => {
    if (afgehandeld) return;

    if (letter === letters[volgendeIndex]) {
      // Dubbele letter (kaas): er staan twee A-blokken, maar het kind mag dezelfde A twee
      // keer aantikken. Zolang de letter verderop nog nodig is, valt daarom een ánder
      // blok met die letter af en blijft het aangetikte blok staan.
      const nogNodig = letters.slice(volgendeIndex + 1).includes(letter);
      const ander = scene.ongebruikteMet(letter).find((i) => i !== blokIndex);
      scene.markeerGebruikt(nogNodig && ander !== undefined ? ander : blokIndex);
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
      scene.schudFout(blokIndex);
      if (!opties.herkansingToegestaan) {
        afgehandeld = true;
        afgerond(false);
      }
    }
  });
  scene.toonLetters(alleLetters);


  return {
    vernietig: () => {
      clearTimeout(klaarTimer);
      scene.vernietig();
      container.replaceChildren();
    },
  };
}
