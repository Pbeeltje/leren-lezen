import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import type { Groep } from '../../content/types.ts';
import { haalGroep } from '../../engine/progressStore.ts';
import { avatarFilter, avatarPad, haalActiefProfiel } from '../../engine/profielStore.ts';
import { maakIconTile } from '../components/IconTile.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { maakTopRechtsBalk } from '../components/TopRechtsBalk.ts';
import { speelSchermOvergang } from '../../three/transitions.ts';

export interface SpelKeuze {
  icoon: string; // naam in assets/icons/
  label: string;
  groepen?: Groep[]; // weglaten = beide groepen
  profielFiguur?: boolean; // tegel toont het figuur van het profiel
  open: (manager: ScreenManager) => Screen;
}

// Keuzescherm met spel-tegels voor een onderwerp (Schrijven, Muziek, Spelletjes). Tegels
// die niet bij de gekozen groep passen worden niet getoond.
export function SpelKiesScreen(manager: ScreenManager, spellen: SpelKeuze[], titelTekst = 'Wat wil je doen?'): Screen {
  const el = document.createElement('div');
  el.className = 'scherm';

  const titel = document.createElement('h1');
  titel.className = 'scherm-titel';
  titel.textContent = titelTekst;
  el.appendChild(titel);

  const grid = document.createElement('div');
  grid.className = 'tegel-grid';
  el.appendChild(grid);

  const groep = haalGroep();
  for (const spel of spellen) {
    if (spel.groepen && groep && !spel.groepen.includes(groep)) continue;
    const profiel = spel.profielFiguur ? haalActiefProfiel() : undefined;
    const tegel = maakIconTile({
      icoonPad: profiel ? avatarPad(profiel.icoonId) : `assets/icons/${spel.icoon}.svg`,
      label: spel.label,
      onClick: () => {
        speelSchermOvergang();
        manager.push(spel.open);
      },
    });
    if (profiel) {
      const img = tegel.querySelector('img');
      if (img) img.style.filter = avatarFilter(profiel.kleur);
    }
    grid.appendChild(tegel);
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
