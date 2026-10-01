import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import type { Groep } from '../../content/types.ts';
import { haalGroep } from '../../engine/progressStore.ts';
import { maakIconTile } from '../components/IconTile.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { maakTopRechtsBalk } from '../components/TopRechtsBalk.ts';
import { speelSchermOvergang } from '../../three/transitions.ts';

export interface SpelKeuze {
  icoon: string; // naam in assets/icons/
  label: string;
  groepen?: Groep[]; // weglaten = beide groepen
  open: (manager: ScreenManager) => Screen;
}

// Keuzescherm met spel-tegels voor een onderwerp (Schrijven, Muziek). Tegels die niet bij
// de gekozen groep passen worden niet getoond.
export function SpelKiesScreen(manager: ScreenManager, spellen: SpelKeuze[]): Screen {
  const el = document.createElement('div');
  el.className = 'scherm';

  const titel = document.createElement('h1');
  titel.className = 'scherm-titel';
  titel.textContent = 'Wat wil je doen?';
  el.appendChild(titel);

  const grid = document.createElement('div');
  grid.className = 'tegel-grid';
  el.appendChild(grid);

  const groep = haalGroep();
  for (const spel of spellen) {
    if (spel.groepen && groep && !spel.groepen.includes(groep)) continue;
    grid.appendChild(
      maakIconTile({
        icoonPad: `assets/icons/${spel.icoon}.svg`,
        label: spel.label,
        onClick: () => {
          speelSchermOvergang();
          manager.push(spel.open);
        },
      }),
    );
  }

  const terug = maakTerugKnop(() => manager.pop());
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
