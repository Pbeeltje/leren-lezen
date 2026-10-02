import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { maakTopRechtsBalk } from '../components/TopRechtsBalk.ts';
import { maakSterBalk } from '../components/ProgressStars.ts';
import { rekenKernen } from '../../engine/leeftijdGrens.ts';
import { haalKernVoortgang, haalGroep, haalLaatsteKern, OEFENSESSIES_VOOR_TOETS } from '../../engine/progressStore.ts';
import { maakBladzijden } from '../components/Bladzijden.ts';
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

  let bladzijden: ReturnType<typeof maakBladzijden> | null = null;

  function tekenLijst(): void {
    bladzijden?.vernietig();
    const kernen = rekenKernen();
    const laatste = haalLaatsteKern('tellen');
    const rijen = kernen.map((kern, index) => {
      const voortgang = haalKernVoortgang(kern.id);

      const rij = document.createElement('button');
      rij.className = 'kern-rij kern-rij--klikbaar';
      if (kern.id === laatste) rij.classList.add('kern-rij--laatst');
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
      return rij;
    });
    const geopend = laatste ? kernen.findIndex((kern) => kern.id === laatste) : 0;
    bladzijden = maakBladzijden(rijen, { startIndex: geopend < 0 ? 0 : geopend, soort: 'lijst' });
    el.appendChild(bladzijden.element);
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
      bladzijden?.vernietig();
      bladzijden = null;
    },
  };
}
