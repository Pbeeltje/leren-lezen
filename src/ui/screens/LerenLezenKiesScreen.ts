import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { maakIconTile } from '../components/IconTile.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { maakTopRechtsBalk } from '../components/TopRechtsBalk.ts';
import { haalGroep } from '../../engine/progressStore.ts';
import { speelSchermOvergang } from '../../three/transitions.ts';
import { KernOverviewScreen } from './KernOverviewScreen.ts';
import { BegrijpendKiesScreen } from './BegrijpendLezenScreen.ts';
import { TijdLezenScreen } from './TijdLezenScreen.ts';
import { TopicSelectScreen } from './TopicSelectScreen.ts';
import { GroepKiesScreen } from './GroepKiesScreen.ts';

// Leren lezen voor groep 3: woorden (de hoofdstukken), begrijpend lezen (verhaaltjes) en
// tijd lezen (klok, dagen, maanden). Kleuters gaan vanaf het onderwerp meteen naar hun letters.
export function LerenLezenKiesScreen(manager: ScreenManager): Screen {
  const el = document.createElement('div');
  el.className = 'scherm';

  const titel = document.createElement('h1');
  titel.className = 'scherm-titel';
  titel.textContent = 'Leren lezen';
  el.appendChild(titel);

  const grid = document.createElement('div');
  grid.className = 'tegel-grid';
  el.appendChild(grid);

  const onderdelen: { icoon: string; label: string; scherm: (m: ScreenManager) => Screen }[] = [
    { icoon: 'boek', label: 'Woorden lezen', scherm: KernOverviewScreen },
    { icoon: 'begrijpend', label: 'Begrijpend lezen', scherm: BegrijpendKiesScreen },
    { icoon: 'tijd', label: 'Tijd lezen', scherm: TijdLezenScreen },
  ];
  for (const onderdeel of onderdelen) {
    grid.appendChild(
      maakIconTile({
        icoonPad: `assets/icons/${onderdeel.icoon}.svg`,
        label: onderdeel.label,
        onClick: () => {
          speelSchermOvergang();
          manager.push(onderdeel.scherm);
        },
      }),
    );
  }

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
