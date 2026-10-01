import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { maakTopRechtsBalk } from '../components/TopRechtsBalk.ts';
import { maakSterBalk } from '../components/ProgressStars.ts';
import { REKEN_KERNEN } from '../../content/tellen/kernen/kernen.index.ts';
import { aantalHoofdstukken } from '../../engine/leeftijdGrens.ts';
import { haalKernVoortgang, haalGroep, OEFENSESSIES_VOOR_TOETS } from '../../engine/progressStore.ts';
import { speelSchermOvergang } from '../../three/transitions.ts';
import { RekenChapterScreen } from './RekenChapterScreen.ts';
import { TopicSelectScreen } from './TopicSelectScreen.ts';
import { GroepKiesScreen } from './GroepKiesScreen.ts';

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

    REKEN_KERNEN.slice(0, aantalHoofdstukken(REKEN_KERNEN.length)).forEach((kern, index) => {
      const voortgang = haalKernVoortgang(kern.id);

      const rij = document.createElement('button');
      rij.className = 'kern-rij kern-rij--klikbaar';
      rij.addEventListener('click', () => {
        speelSchermOvergang();
        manager.push((m) => RekenChapterScreen(m, index));
      });

      const nummer = document.createElement('div');
      nummer.className = 'kern-rij__nummer';
      nummer.textContent = String(kern.volgnummer);
      rij.appendChild(nummer);

      const info = document.createElement('div');
      info.className = 'kern-rij__info';

      const titelEl = document.createElement('div');
      titelEl.className = 'kern-rij__titel';
      titelEl.textContent = `Rekenen ${kern.volgnummer}: ${kern.titel}`;
      info.appendChild(titelEl);

      const detailRij = document.createElement('div');
      detailRij.className = 'kern-rij__detail';
      detailRij.appendChild(maakSterBalk(voortgang.sterren));
      const oefenTekst = document.createElement('span');
      oefenTekst.className = 'kern-rij__oefentekst';
      oefenTekst.textContent = `${Math.min(voortgang.oefenSessies, OEFENSESSIES_VOOR_TOETS)}/${OEFENSESSIES_VOOR_TOETS} geoefend`;
      detailRij.appendChild(oefenTekst);
      info.appendChild(detailRij);

      rij.appendChild(info);
      lijst.appendChild(rij);
    });
  }

  // Zie KernOverviewScreen.ts voor waarom dit terugOfAnders is i.p.v. pop().
  const terug = maakTerugKnop(() =>
    manager.terugOfAnders((m) => {
      const groep = haalGroep();
      return groep ? TopicSelectScreen(m, groep) : GroepKiesScreen(m);
    }),
  );
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
