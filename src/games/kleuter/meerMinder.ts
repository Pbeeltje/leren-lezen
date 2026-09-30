import type { RondeVraag } from '../../ui/screens/RondeScreen.ts';
import { instructieAudioPad } from '../../engine/audioManager.ts';
import { toonGoedFeedback, toonFoutFeedback } from '../../ui/components/FeedbackOverlay.ts';
import { geheelTussen, kies } from './hulp.ts';

// Meer / minder / evenveel (groep 2 begrip): twee groepjes van hetzelfde ding, tik het
// groepje met meer (of minder). De "="-knop in het midden is goed als het er evenveel zijn.
// Aantallen tot 6 en een verschil van minstens 2, zodat het ook zonder tellen te zien is.

const ICONEN = ['appel', 'ster', 'telobject-eend', 'telobject-bal'];

type Vraag = 'meer' | 'minder';

export function maakMeerMinderVraag(): RondeVraag {
  const vraag = kies<Vraag>(['meer', 'minder']);
  const evenveel = Math.random() < 0.15;
  let links = geheelTussen(1, 6);
  let rechts = links;
  if (!evenveel) {
    do {
      rechts = geheelTussen(1, 6);
    } while (Math.abs(rechts - links) < 2);
  }
  if (Math.random() < 0.5) [links, rechts] = [rechts, links];
  const icoon = kies(ICONEN);

  return {
    instructie: vraag === 'meer' ? 'Waar zijn er meer?' : 'Waar zijn er minder?',
    audioPad: instructieAudioPad(`meer-minder-${vraag}`),
    render(container, afgerond) {
      container.innerHTML = '';
      const kaart = document.createElement('div');
      kaart.className = 'oefen-kaart';
      const rij = document.createElement('div');
      rij.className = 'meer-minder-rij';
      kaart.appendChild(rij);

      let klaar = false;
      const juisteKant = links === rechts ? 'gelijk' : (vraag === 'meer') === links > rechts ? 'links' : 'rechts';

      const knopVoor = (kant: 'links' | 'gelijk' | 'rechts'): HTMLButtonElement => {
        const knop = document.createElement('button');
        knop.addEventListener('click', () => {
          if (klaar) return;
          if (kant === juisteKant) {
            klaar = true;
            knop.classList.add('gevonden');
            toonGoedFeedback();
            afgerond();
            return;
          }
          knop.classList.add('fout-gekozen');
          toonFoutFeedback();
          setTimeout(() => knop.classList.remove('fout-gekozen'), 500);
        });
        return knop;
      };

      const groep = (aantal: number, kant: 'links' | 'rechts') => {
        const knop = knopVoor(kant);
        knop.className = 'meer-minder-groep';
        for (let i = 0; i < aantal; i++) {
          const img = document.createElement('img');
          img.src = `/assets/icons/${icoon}.svg`;
          img.alt = '';
          knop.appendChild(img);
        }
        return knop;
      };

      rij.appendChild(groep(links, 'links'));
      const gelijk = knopVoor('gelijk');
      gelijk.className = 'meer-minder-gelijk';
      gelijk.textContent = '=';
      gelijk.setAttribute('aria-label', 'evenveel');
      rij.appendChild(gelijk);
      rij.appendChild(groep(rechts, 'rechts'));

      container.appendChild(kaart);
      return () => container.replaceChildren();
    },
  };
}
