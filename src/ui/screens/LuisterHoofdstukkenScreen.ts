import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { maakIconTile } from '../components/IconTile.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { maakTopRechtsBalk } from '../components/TopRechtsBalk.ts';
import { speelSchermOvergang } from '../../three/transitions.ts';
import { haalKernVoortgang } from '../../engine/progressStore.ts';
import { LUISTER_HOOFDSTUKKEN } from '../../content/luisteren/hoofdstukken.ts';
import { hoofdstukWoorden, plaatjeVan } from '../../engine/luisterenGenerator.ts';
import { LuisterenScreen } from './LuisterenScreen.ts';

// Minstens zoveel woorden met opname nodig om een hoofdstuk te kunnen spelen.
const MIN_WOORDEN = 4;

export function LuisterHoofdstukkenScreen(manager: ScreenManager): Screen {
  const el = document.createElement('div');
  el.className = 'scherm';

  const titel = document.createElement('h1');
  titel.className = 'scherm-titel';
  titel.textContent = 'Luister & wijs';
  el.appendChild(titel);

  const grid = document.createElement('div');
  grid.className = 'tegel-grid';
  el.appendChild(grid);

  function bouw(): void {
    grid.replaceChildren();
    for (const hoofdstuk of LUISTER_HOOFDSTUKKEN) {
      const speelbaar = hoofdstukWoorden(hoofdstuk.woorden).length >= MIN_WOORDEN;
      const sterren = haalKernVoortgang(`luister-${hoofdstuk.id}`).sterren;
      grid.appendChild(
        maakIconTile({
          icoonPad: plaatjeVan(hoofdstuk.icoonWoord) ?? 'assets/icons/luisteren.svg',
          label: hoofdstuk.titel,
          beschikbaar: speelbaar,
          badge: !speelbaar ? 'binnenkort' : sterren > 0 ? '★★★' : undefined,
          onClick: () => {
            speelSchermOvergang();
            manager.push((m) => LuisterenScreen(m, hoofdstuk));
          },
        }),
      );
    }
  }
  bouw();

  const terug = maakTerugKnop(() => manager.pop());
  let topRechts: ReturnType<typeof maakTopRechtsBalk> | null = null;

  return {
    mount(root) {
      bouw(); // sterren bijwerken na terugkomen uit een hoofdstuk
      root.appendChild(el);
      root.appendChild(terug);
      topRechts = maakTopRechtsBalk(manager);
      root.appendChild(topRechts.element);
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
