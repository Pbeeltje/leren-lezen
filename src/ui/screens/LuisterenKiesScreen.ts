import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { maakIconTile } from '../components/IconTile.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { maakTopRechtsBalk } from '../components/TopRechtsBalk.ts';
import { speelSchermOvergang } from '../../three/transitions.ts';
import { LuisterHoofdstukkenScreen } from './LuisterHoofdstukkenScreen.ts';
import { GeheugenScreen } from './GeheugenScreen.ts';

// Kleine keuze-tussenstop binnen het "Luisteren"-onderwerp: twee spelvormen die allebei
// dezelfde woorden/plaatjes/geluiden hergebruiken (zie luistenGenerator.ts), zodat het
// niet bij één enkele oefeningsoort blijft.
export function LuisterenKiesScreen(manager: ScreenManager): Screen {
  const el = document.createElement('div');
  el.className = 'scherm';

  const titel = document.createElement('h1');
  titel.className = 'scherm-titel';
  titel.textContent = 'Wat wil je spelen?';
  el.appendChild(titel);

  const grid = document.createElement('div');
  grid.className = 'tegel-grid';
  el.appendChild(grid);

  grid.appendChild(
    maakIconTile({
      icoonPad: 'assets/icons/luisteren-wijzen.svg',
      label: 'Luister & wijs',
      onClick: () => {
        speelSchermOvergang();
        manager.push((m) => LuisterHoofdstukkenScreen(m));
      },
    }),
  );

  grid.appendChild(
    maakIconTile({
      icoonPad: 'assets/icons/geheugenspel.svg',
      label: 'Geheugenspel',
      onClick: () => {
        speelSchermOvergang();
        manager.push((m) => GeheugenScreen(m));
      },
    }),
  );

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
