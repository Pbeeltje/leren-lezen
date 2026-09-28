import type { OefeningDefinitie } from '../content/types.ts';
import { toonGoedFeedback } from '../ui/components/FeedbackOverlay.ts';
import { LetterBlokkenScene } from '../three/letterBlocks.ts';

type Oefening = Extract<OefeningDefinitie, { type: 'woord-bouwen' }>;

function schudArray<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

export function renderWoordBouwen(
  container: HTMLElement,
  oefening: Oefening,
  _opties: { herkansingToegestaan: boolean },
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
  const alleLetters = schudArray([...letters, ...oefening.afleidLetters]);

  const scene = new LetterBlokkenScene(canvasHouder, (letter, blokIndex) => {
    if (letter === letters[volgendeIndex]) {
      scene.markeerGebruikt(blokIndex);
      const sleuf = sleuven[volgendeIndex];
      sleuf.textContent = letter;
      sleuf.classList.add('gevuld');
      volgendeIndex++;

      if (volgendeIndex === letters.length) {
        toonGoedFeedback();
        setTimeout(() => afgerond(true), 100);
      }
    } else {
      scene.schudFout(blokIndex);
    }
  });
  scene.toonLetters(alleLetters);

  const groottePas = () => scene.pasGrootteAan();
  window.addEventListener('resize', groottePas);

  return {
    vernietig: () => {
      window.removeEventListener('resize', groottePas);
      scene.vernietig();
      container.replaceChildren();
    },
  };
}
