import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { maakSterBalk } from '../components/ProgressStars.ts';
import { maakTopRechtsBalk } from '../components/TopRechtsBalk.ts';
import { speelSchermOvergang } from '../../three/transitions.ts';

export interface ToetsResultaat {
  aantalGoed: number;
  totaal: number;
  muntenVerdiend: number;
  sterren: 0 | 1 | 2 | 3;
}

export function TestResultScreen(
  manager: ScreenManager,
  resultaat: ToetsResultaat,
  onVerder: (manager: ScreenManager) => void,
): Screen {
  const el = document.createElement('div');
  el.className = 'scherm';

  const titel = document.createElement('h1');
  titel.className = 'scherm-titel';
  titel.textContent = 'Toets klaar!';
  el.appendChild(titel);

  const kaart = document.createElement('div');
  kaart.className = 'profiel-vorm';

  const cijfer = document.createElement('div');
  cijfer.className = 'resultaat-cijfer';
  cijfer.textContent = `${resultaat.aantalGoed} / ${resultaat.totaal}`;
  kaart.appendChild(cijfer);

  kaart.appendChild(maakSterBalk(resultaat.sterren));

  const muntenRij = document.createElement('div');
  muntenRij.className = 'resultaat-munten-rij';
  const muntIcoon = document.createElement('img');
  muntIcoon.src = '/assets/icons/munt.svg';
  muntIcoon.alt = '';
  muntenRij.appendChild(muntIcoon);
  const muntenTekst = document.createElement('span');
  muntenTekst.textContent = `+${resultaat.muntenVerdiend} munten`;
  muntenRij.appendChild(muntenTekst);
  kaart.appendChild(muntenRij);

  const verderKnop = document.createElement('button');
  verderKnop.className = 'typen-knop';
  verderKnop.textContent = 'Verder';
  verderKnop.addEventListener('click', () => {
    speelSchermOvergang();
    onVerder(manager);
  });
  kaart.appendChild(verderKnop);

  el.appendChild(kaart);

  let topRechts: ReturnType<typeof maakTopRechtsBalk> | null = null;

  return {
    mount(root) {
      root.appendChild(el);
      topRechts = maakTopRechtsBalk(manager);
      root.appendChild(topRechts.element);
    },
    unmount() {
      el.remove();
      topRechts?.element.remove();
      topRechts?.vernietig();
      topRechts = null;
    },
  };
}
