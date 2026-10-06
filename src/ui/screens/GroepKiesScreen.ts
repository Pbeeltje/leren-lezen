import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { GROEP_NAAM, type Groep } from '../../content/types.ts';
import { maakIconTile } from '../components/IconTile.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { zetGroep } from '../../engine/progressStore.ts';
import { ontgrendelAudio } from '../../engine/audioManager.ts';
import { speelSchermOvergang } from '../../three/transitions.ts';
import { TopicSelectScreen } from './TopicSelectScreen.ts';
import { ProfileSelectScreen } from './ProfileSelectScreen.ts';

// Groep kiezen (vroeger: leeftijd 3/4/5/6). Kleuterschool krijgt alles wat voor 3-5 jaar
// was, groep 3 wat voor 6 jaar was.
export const GROEPEN: Groep[] = ['kleuter', 'groep3'];

export const groepIcoon = (groep: Groep | undefined): string => `assets/icons/groep-${groep ?? 'groep3'}.svg`;

export function GroepKiesScreen(manager: ScreenManager): Screen {
  const el = document.createElement('div');
  el.className = 'scherm';

  const titel = document.createElement('h1');
  titel.className = 'scherm-titel';
  titel.textContent = 'In welke groep zit jij?';
  el.appendChild(titel);

  const grid = document.createElement('div');
  grid.className = 'tegel-grid';
  el.appendChild(grid);

  for (const groep of GROEPEN) {
    const tegel = maakIconTile({
      icoonPad: groepIcoon(groep),
      label: GROEP_NAAM[groep],
      onClick: () => {
        ontgrendelAudio();
        zetGroep(groep);
        speelSchermOvergang();
        manager.push((m) => TopicSelectScreen(m, groep));
      },
    });
    grid.appendChild(tegel);
  }

  // Wordt zowel gepusht (vanaf profielkeuze) als via 'replace' bereikt (vanuit het
  // profielmenu), dus de stack kan hier leeg zijn — terug gaat daarom altijd expliciet
  // naar het profielscherm, niet manager.pop().
  const terug = maakTerugKnop(() => {
    speelSchermOvergang();
    manager.replace((m) => ProfileSelectScreen(m));
  });

  return {
    mount(root) {
      root.appendChild(el);
      root.appendChild(terug);
    },
    unmount() {
      el.remove();
      terug.remove();
    },
  };
}
