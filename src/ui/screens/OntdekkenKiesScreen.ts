import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { maakIconTile } from '../components/IconTile.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { maakTopRechtsBalk } from '../components/TopRechtsBalk.ts';
import { speelSchermOvergang } from '../../three/transitions.ts';
import { RondeScreen } from './RondeScreen.ts';
import { ONTDEKKEN_IDS, RONDE_ACTIVITEITEN } from '../../games/rondeActiviteiten.ts';

// "Ontdekken": kleuterbegrippen zonder lezen (groep 1-2), geïnspireerd op de onderwerpen
// die Squla voor peuters/kleuters noemt (zie onderzoek/squla.md). Elk spel is een
// RondeScreen: rondes van 5 met vuurwerk, fout is gewoon opnieuw proberen. De spellen
// zelf staan in games/rondeActiviteiten.ts.

export function OntdekkenKiesScreen(manager: ScreenManager): Screen {
  const el = document.createElement('div');
  el.className = 'scherm';

  const titel = document.createElement('h1');
  titel.className = 'scherm-titel';
  titel.textContent = 'Wat wil je spelen?';
  el.appendChild(titel);

  const grid = document.createElement('div');
  grid.className = 'tegel-grid';
  el.appendChild(grid);

  for (const id of ONTDEKKEN_IDS) {
    const spel = RONDE_ACTIVITEITEN[id];
    grid.appendChild(
      maakIconTile({
        icoonPad: `assets/icons/${spel.icoon}.svg`,
        label: spel.titel,
        onClick: () => {
          speelSchermOvergang();
          manager.push((m) => RondeScreen(m, spel.titel, spel.maakVraag, undefined, id));
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
