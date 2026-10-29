import type { GeheugenKaart } from '../engine/geheugenGenerator.ts';
import { naHuidigeAudio, speelAf, woordAudioPad } from '../engine/audioManager.ts';
import { toonGoedFeedback } from '../ui/components/FeedbackOverlay.ts';

// Klassiek geheugenspel (kaarten omdraaien, paren zoeken) -- puur visueel te spelen,
// met het woordgeluid als bonus-herhaling telkens als een kaart wordt omgedraaid. Geen
// "fout"-straf op een mismatch: gewoon weer dichtdraaien en nog eens proberen, net als
// overal elders in de app nooit een hard afgestrafte fout. `paarGevonden` krijgt de twee
// kaarten (twee spelers kleuren ze in hun eigen kleur); `misser` komt als een verkeerd paar
// weer dicht is (dan is de ander aan de beurt).
export function renderGeheugenSpel(
  container: HTMLElement,
  kaarten: GeheugenKaart[],
  paarGevonden: (knoppen: HTMLButtonElement[]) => void,
  afgerond: () => void,
  misser?: () => void,
): { vernietig: () => void } {
  container.innerHTML = '';

  const bord = document.createElement('div');
  bord.className = 'geheugen-bord';
  container.appendChild(bord);

  let eersteOmgedraaid: { kaart: GeheugenKaart; knop: HTMLButtonElement } | null = null;
  let vergrendeld = false;
  let gevondenParen = 0;
  let stopWachten: (() => void) | null = null;
  let weg = false;
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
        gevondenParen++;
        paarGevonden([eerste.knop, tweede.knop]);
        const laatste = gevondenParen === totaalParen;
        // Bord dicht tot woord en "Goed zo!" uitgesproken zijn: de volgende kaart speelt
        // zijn woord af en zou de feedback anders meteen afkappen.
        vergrendeld = true;
        const verder = () => (laatste ? afgerond() : (vergrendeld = false));
        stopWachten = naHuidigeAudio(() => {
          // Scherm intussen weg (bv. winkel): geen "Goed zo!" over het volgende scherm heen.
          if (!bord.isConnected) return verder();
          toonGoedFeedback();
          stopWachten = naHuidigeAudio(verder, laatste ? 300 : 100, 4000, laatste ? 900 : 0);
        }, 0, 2500);
      } else {
        vergrendeld = true;
        setTimeout(() => {
          eerste.knop.classList.remove('omgedraaid');
          tweede.knop.classList.remove('omgedraaid');
          vergrendeld = false;
          if (!weg) misser?.();
        }, 900);
      }
    });

    bord.appendChild(knop);
  }

  return {
    vernietig: () => {
      weg = true;
      stopWachten?.();
      container.replaceChildren();
    },
  };
}
