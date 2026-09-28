import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { maakTopRechtsBalk } from '../components/TopRechtsBalk.ts';
import { maakSterBalk } from '../components/ProgressStars.ts';
import { REKEN_KERNEN } from '../../content/tellen/kernen/kernen.index.ts';
import { haalKernVoortgang } from '../../engine/progressStore.ts';
import { speelSchermOvergang } from '../../three/transitions.ts';
import { RekenOefeningScreen } from './RekenOefeningScreen.ts';

export function RekenKernOverviewScreen(manager: ScreenManager): Screen {
  const el = document.createElement('div');
  el.className = 'scherm';

  const titel = document.createElement('h1');
  titel.className = 'scherm-titel';
  titel.textContent = 'Rekenen';
  el.appendChild(titel);

  const lijst = document.createElement('div');
  lijst.className = 'kern-lijst';
  el.appendChild(lijst);

  function tekenLijst(): void {
    lijst.innerHTML = '';

    REKEN_KERNEN.forEach((kern, index) => {
      const vorigeVoltooid = index === 0 || haalKernVoortgang(REKEN_KERNEN[index - 1].id).voltooid;
      const voortgang = haalKernVoortgang(kern.id);

      const rij = document.createElement('div');
      rij.className = 'kern-rij';

      const nummer = document.createElement('div');
      nummer.className = 'kern-rij__nummer';
      nummer.textContent = String(kern.volgnummer);
      rij.appendChild(nummer);

      const info = document.createElement('div');
      info.className = 'kern-rij__info';

      const titelEl = document.createElement('div');
      titelEl.className = 'kern-rij__woord';
      titelEl.textContent = `Rekenen ${kern.volgnummer}: ${kern.titel}`;
      info.appendChild(titelEl);

      info.appendChild(maakSterBalk(voortgang.sterren));
      rij.appendChild(info);

      const acties = document.createElement('div');
      acties.className = 'kern-rij__acties';

      const oefenKnop = document.createElement('button');
      oefenKnop.className = 'kern-rij__knop oefenen';
      oefenKnop.textContent = 'Oefenen';
      oefenKnop.disabled = !vorigeVoltooid;
      oefenKnop.addEventListener('click', () => {
        speelSchermOvergang();
        manager.push((m) => RekenOefeningScreen(m, kern, 'oefenen', tekenLijst));
      });
      acties.appendChild(oefenKnop);

      const toetsKnop = document.createElement('button');
      toetsKnop.className = 'kern-rij__knop toets';
      const toetsIcoon = document.createElement('img');
      toetsIcoon.src = '/assets/icons/trofee.svg';
      toetsIcoon.alt = '';
      toetsKnop.appendChild(toetsIcoon);
      toetsKnop.appendChild(document.createTextNode('Toets'));
      toetsKnop.disabled = !vorigeVoltooid || !voortgang.gestart;
      toetsKnop.addEventListener('click', () => {
        speelSchermOvergang();
        manager.push((m) => RekenOefeningScreen(m, kern, 'toets', tekenLijst));
      });
      acties.appendChild(toetsKnop);

      rij.appendChild(acties);
      lijst.appendChild(rij);
    });
  }

  const terug = maakTerugKnop(() => manager.pop());
  let topRechts: ReturnType<typeof maakTopRechtsBalk> | null = null;

  return {
    mount(root) {
      root.appendChild(el);
      root.appendChild(terug);
      topRechts = maakTopRechtsBalk(manager);
      root.appendChild(topRechts.element);
      tekenLijst();
    },
    unmount() {
      el.remove();
      terug.remove();
      topRechts?.element.remove();
      topRechts?.vernietig();
      topRechts = null;
    },
  };
}
