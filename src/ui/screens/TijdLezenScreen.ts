import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { maakIconTile } from '../components/IconTile.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { maakTopRechtsBalk } from '../components/TopRechtsBalk.ts';
import { maakSterBalk } from '../components/ProgressStars.ts';
import { haalKernVoortgang } from '../../engine/progressStore.ts';
import { TIJD_ICONEN, TIJD_KERNEN } from '../../content/tijd/kernen.ts';
import { speelSchermOvergang } from '../../three/transitions.ts';
import { RekenChapterScreen } from './RekenChapterScreen.ts';
import { LerenLezenKiesScreen } from './LerenLezenKiesScreen.ts';

// Tijd lezen: klokkijken, dagen van de week en maanden van het jaar. Elk hoofdstuk heeft
// net als bij Tellen 3 oefeningen en een toets (RekenChapterScreen met reeks 'tijd').
export function TijdLezenScreen(manager: ScreenManager): Screen {
  const el = document.createElement('div');
  el.className = 'scherm';

  const titel = document.createElement('h1');
  titel.className = 'scherm-titel';
  titel.textContent = 'Tijd lezen';
  el.appendChild(titel);

  const grid = document.createElement('div');
  grid.className = 'tegel-grid tegel-grid--tijd';
  el.appendChild(grid);

  function tekenTegels(): void {
    grid.replaceChildren();
    TIJD_KERNEN.forEach((kern, index) => {
      const tegel = maakIconTile({
        icoonPad: TIJD_ICONEN[kern.id],
        label: kern.titel,
        onClick: () => {
          speelSchermOvergang();
          manager.push((m) => RekenChapterScreen(m, index, 'tijd'));
        },
      });
      tegel.appendChild(maakSterBalk(haalKernVoortgang(kern.id).sterren));
      grid.appendChild(tegel);
    });
  }

  // Het hoofdstukscherm komt hier via 'replace' terug, dan is de stack maar 1 diep.
  const terug = maakTerugKnop(() => manager.terugOfAnders((m) => LerenLezenKiesScreen(m)));
  let topRechts: ReturnType<typeof maakTopRechtsBalk> | null = null;

  return {
    mount(root) {
      root.appendChild(el);
      root.appendChild(terug);
      topRechts = maakTopRechtsBalk(manager);
      root.appendChild(topRechts.element);
      tekenTegels();
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
