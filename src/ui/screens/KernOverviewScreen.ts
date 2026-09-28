import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { maakTopRechtsBalk } from '../components/TopRechtsBalk.ts';
import { maakSterBalk } from '../components/ProgressStars.ts';
import { KERNEN } from '../../content/lezen/kernen/kernen.index.ts';
import { haalKernVoortgang, OEFENSESSIES_VOOR_TOETS } from '../../engine/progressStore.ts';
import { speelSchermOvergang } from '../../three/transitions.ts';
import { ChapterScreen } from './ChapterScreen.ts';

// Hoofdstukkenoverzicht: alleen een lijst met voortgang. Niets is op slot — elk
// hoofdstuk (met zijn 3 oefeningen + toets) is altijd bereikbaar door op de rij te
// tikken, wat naar ChapterScreen gaat.
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
      const voortgang = haalKernVoortgang(kern.id);

      const rij = document.createElement('button');
      rij.className = 'kern-rij kern-rij--klikbaar';
      rij.addEventListener('click', () => {
        speelSchermOvergang();
        manager.push((m) => ChapterScreen(m, index));
      });

      const nummer = document.createElement('div');
      nummer.className = 'kern-rij__nummer';
      nummer.textContent = String(kern.volgnummer);
      rij.appendChild(nummer);

      const info = document.createElement('div');
      info.className = 'kern-rij__info';

      const titelEl = document.createElement('div');
      titelEl.className = 'kern-rij__titel';
      titelEl.textContent = `Lezen ${kern.volgnummer}: ${kern.titel}`;
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
