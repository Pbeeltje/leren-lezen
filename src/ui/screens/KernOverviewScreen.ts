import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { maakMuntenTeller } from '../components/MuntenTeller.ts';
import { maakSterBalk } from '../components/ProgressStars.ts';
import { KERNEN } from '../../content/lezen/kernen/kernen.index.ts';
import { haalKernVoortgang } from '../../engine/progressStore.ts';
import { speelSchermOvergang } from '../../three/transitions.ts';
import { OefeningScreen } from './OefeningScreen.ts';

export function KernOverviewScreen(manager: ScreenManager): Screen {
  const el = document.createElement('div');
  el.className = 'scherm';

  const titel = document.createElement('h1');
  titel.className = 'scherm-titel';
  titel.textContent = 'Leren lezen';
  el.appendChild(titel);

  const lijst = document.createElement('div');
  lijst.className = 'kern-lijst';
  el.appendChild(lijst);

  function tekenLijst(): void {
    lijst.innerHTML = '';

    KERNEN.forEach((kern, index) => {
      const vorigeVoltooid = index === 0 || haalKernVoortgang(KERNEN[index - 1].id).voltooid;
      const voortgang = haalKernVoortgang(kern.id);

      const rij = document.createElement('div');
      rij.className = 'kern-rij';

      const nummer = document.createElement('div');
      nummer.className = 'kern-rij__nummer';
      nummer.textContent = String(kern.volgnummer);
      rij.appendChild(nummer);

      const info = document.createElement('div');
      info.className = 'kern-rij__info';

      const woord = document.createElement('div');
      woord.className = 'kern-rij__woord';
      woord.textContent = kern.structuurwoord.woord;
      info.appendChild(woord);

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
        manager.push((m) => OefeningScreen(m, kern, 'oefenen', tekenLijst));
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
        manager.push((m) => OefeningScreen(m, kern, 'toets', tekenLijst));
      });
      acties.appendChild(toetsKnop);

      rij.appendChild(acties);
      lijst.appendChild(rij);
    });
  }

  const terug = maakTerugKnop(() => manager.pop());
  let munten: ReturnType<typeof maakMuntenTeller> | null = null;

  return {
    mount(root) {
      root.appendChild(el);
      root.appendChild(terug);
      munten = maakMuntenTeller();
      root.appendChild(munten.element);
      tekenLijst();
    },
    unmount() {
      el.remove();
      terug.remove();
      munten?.element.remove();
      munten?.vernietig();
      munten = null;
    },
  };
}
