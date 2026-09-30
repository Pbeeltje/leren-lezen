import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { maakIconTile } from '../components/IconTile.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { maakTopRechtsBalk } from '../components/TopRechtsBalk.ts';
import { speelSchermOvergang } from '../../three/transitions.ts';
import { RondeScreen, type RondeVraag } from './RondeScreen.ts';
import { maakVergelijkVraag } from '../../games/kleuter/vergelijken.ts';
import { maakMeerMinderVraag } from '../../games/kleuter/meerMinder.ts';
import { maakKleurVormVraag } from '../../games/kleuter/kleurenVormen.ts';

// "Ontdekken": kleuterbegrippen zonder lezen (groep 1-2), geïnspireerd op de onderwerpen
// die Squla voor peuters/kleuters noemt (zie onderzoek/squla.md). Elk spel is een
// RondeScreen: rondes van 5 met vuurwerk, fout is gewoon opnieuw proberen.
const SPELLEN: { icoon: string; label: string; titel: string; maakVraag: () => RondeVraag }[] = [
  { icoon: 'vergelijken', label: 'Groot of klein?', titel: 'Groot of klein?', maakVraag: maakVergelijkVraag },
  { icoon: 'meer-minder', label: 'Meer of minder?', titel: 'Meer of minder?', maakVraag: maakMeerMinderVraag },
  { icoon: 'vormen', label: 'Kleuren & vormen', titel: 'Kleuren & vormen', maakVraag: maakKleurVormVraag },
];

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

  for (const spel of SPELLEN) {
    grid.appendChild(
      maakIconTile({
        icoonPad: `/assets/icons/${spel.icoon}.svg`,
        label: spel.label,
        onClick: () => {
          speelSchermOvergang();
          manager.push((m) => RondeScreen(m, spel.titel, spel.maakVraag));
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
