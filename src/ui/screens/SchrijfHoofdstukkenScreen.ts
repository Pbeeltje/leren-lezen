import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { SCHRIJF_HOOFDSTUKKEN } from '../../content/schrijven/hoofdstukken.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { maakTopRechtsBalk } from '../components/TopRechtsBalk.ts';
import { maakSterBalk } from '../components/ProgressStars.ts';
import { haalKernVoortgang, haalLaatsteKern, OEFENSESSIES_VOOR_TOETS } from '../../engine/progressStore.ts';
import { maakBladzijden } from '../components/Bladzijden.ts';
import { speelSchermOvergang } from '../../three/transitions.ts';
import { SchrijfChapterScreen } from './SchrijfChapterScreen.ts';
import { SchrijvenKiesScreen } from './SchrijvenKiesScreen.ts';

// Overzicht van de schrijfhoofdstukken (groep 3), zoals KernOverviewScreen voor lezen:
// een lijst met sterren van het dictee en hoeveel oefeningen af zijn. Niets op slot.
export function SchrijfHoofdstukkenScreen(manager: ScreenManager): Screen {
  const el = document.createElement('div');
  el.className = 'scherm';

  const titel = document.createElement('h1');
  titel.className = 'scherm-titel';
  titel.textContent = 'Woorden schrijven';
  el.appendChild(titel);

  let bladzijden: ReturnType<typeof maakBladzijden> | null = null;

  function tekenLijst(): void {
    bladzijden?.vernietig();
    const laatste = haalLaatsteKern('schrijven');
    const rijen = SCHRIJF_HOOFDSTUKKEN.map((hoofdstuk, index) => {
      const voortgang = haalKernVoortgang(hoofdstuk.id);

      const rij = document.createElement('button');
      rij.className = 'kern-rij kern-rij--klikbaar';
      if (hoofdstuk.id === laatste) rij.classList.add('kern-rij--laatst');
      rij.addEventListener('click', () => {
        speelSchermOvergang();
        manager.push((m) => SchrijfChapterScreen(m, index));
      });

      const nummer = document.createElement('div');
      nummer.className = 'kern-rij__nummer';
      nummer.textContent = String(hoofdstuk.volgnummer);
      rij.appendChild(nummer);

      const info = document.createElement('div');
      info.className = 'kern-rij__info';
      const titelEl = document.createElement('div');
      titelEl.className = 'kern-rij__titel';
      titelEl.textContent = `Schrijven ${hoofdstuk.volgnummer}: ${hoofdstuk.titel}`;
      info.appendChild(titelEl);

      const detailRij = document.createElement('div');
      detailRij.className = 'kern-rij__detail';
      detailRij.appendChild(maakSterBalk(voortgang.sterren));
      const oefenTekst = document.createElement('span');
      oefenTekst.className = 'kern-rij__oefentekst';
      oefenTekst.textContent = `${voortgang.oefeningenAf.length}/${OEFENSESSIES_VOOR_TOETS} geoefend`;
      detailRij.appendChild(oefenTekst);
      info.appendChild(detailRij);

      rij.appendChild(info);
      return rij;
    });
    const geopend = laatste ? SCHRIJF_HOOFDSTUKKEN.findIndex((h) => h.id === laatste) : 0;
    bladzijden = maakBladzijden(rijen, { startIndex: geopend < 0 ? 0 : geopend, soort: 'lijst' });
    el.appendChild(bladzijden.element);
  }

  // Gepusht vanaf SchrijvenKiesScreen, maar SchrijfChapterScreen komt hier via 'replace'
  // terug (stack dan 1 diep): terugOfAnders valt dan terug op het schrijfmenu.
  const terug = maakTerugKnop(() => manager.terugOfAnders((m) => SchrijvenKiesScreen(m)));
  let topRechts: ReturnType<typeof maakTopRechtsBalk> | null = null;

  let gemountOp = 0;
  const tegenDubbelklik = (event: Event): void => {
    if (performance.now() - gemountOp < 300) {
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  };
  el.addEventListener('click', tegenDubbelklik, true);
  terug.addEventListener('click', tegenDubbelklik, true);

  return {
    mount(root) {
      gemountOp = performance.now();
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
