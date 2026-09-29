import type { GeheugenKaart } from '../engine/geheugenGenerator.ts';
import { speelAf, woordAudioPad } from '../engine/audioManager.ts';
import { toonGoedFeedback } from '../ui/components/FeedbackOverlay.ts';

// Klassiek geheugenspel (kaarten omdraaien, paren zoeken) -- puur visueel te spelen,
// met het woordgeluid als bonus-herhaling telkens als een kaart wordt omgedraaid. Geen
// "fout"-straf op een mismatch: gewoon weer dichtdraaien en nog eens proberen, net als
// overal elders in de app nooit een hard afgestrafte fout.
export function renderGeheugenSpel(
  container: HTMLElement,
  kaarten: GeheugenKaart[],
  afgerond: () => void,
): { vernietig: () => void } {
  container.innerHTML = '';

  const bord = document.createElement('div');
  bord.className = 'geheugen-bord';
  container.appendChild(bord);

  let eersteOmgedraaid: { kaart: GeheugenKaart; knop: HTMLButtonElement } | null = null;
  let vergrendeld = false;
  let gevondenParen = 0;
  const totaalParen = kaarten.length / 2;

  for (const kaart of kaarten) {
    const knop = document.createElement('button');
    knop.className = 'geheugen-kaart';

    const achterkant = document.createElement('div');
    achterkant.className = 'geheugen-kaart__achterkant';
    knop.appendChild(achterkant);

    const voorkant = document.createElement('img');
    voorkant.className = 'geheugen-kaart__voorkant';
    voorkant.src = kaart.woord.afbeeldingPad;
    voorkant.alt = '';
    knop.appendChild(voorkant);

    knop.addEventListener('click', () => {
      if (vergrendeld || knop.classList.contains('omgedraaid') || knop.classList.contains('gevonden')) return;

      knop.classList.add('omgedraaid');
      speelAf(woordAudioPad(kaart.woord.woord));

      if (!eersteOmgedraaid) {
        eersteOmgedraaid = { kaart, knop };
        return;
      }

      const tweede = { kaart, knop };
      const eerste = eersteOmgedraaid;
      eersteOmgedraaid = null;

      if (eerste.kaart.woord.woord === tweede.kaart.woord.woord) {
        eerste.knop.classList.add('gevonden');
        tweede.knop.classList.add('gevonden');
        toonGoedFeedback();
        gevondenParen++;
        if (gevondenParen === totaalParen) {
          vergrendeld = true;
          setTimeout(afgerond, 900);
        }
      } else {
        vergrendeld = true;
        setTimeout(() => {
          eerste.knop.classList.remove('omgedraaid');
          tweede.knop.classList.remove('omgedraaid');
          vergrendeld = false;
        }, 900);
      }
    });

    bord.appendChild(knop);
  }

  return { vernietig: () => container.replaceChildren() };
}
