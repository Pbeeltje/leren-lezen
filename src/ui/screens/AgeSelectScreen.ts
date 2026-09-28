import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import type { LeeftijdId } from '../../content/types.ts';
import { maakIconTile } from '../components/IconTile.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { zetLaatstGekozenLeeftijd } from '../../engine/progressStore.ts';
import { ontgrendelAudio } from '../../engine/audioManager.ts';
import { speelSchermOvergang } from '../../three/transitions.ts';
import { TopicSelectScreen } from './TopicSelectScreen.ts';
import { ProfileSelectScreen } from './ProfileSelectScreen.ts';

const LEEFTIJDEN: LeeftijdId[] = [3, 4, 5, 6];

export function AgeSelectScreen(manager: ScreenManager): Screen {
  const el = document.createElement('div');
  el.className = 'scherm';

  const titel = document.createElement('h1');
  titel.className = 'scherm-titel';
  titel.textContent = 'Hoe oud ben jij?';
  el.appendChild(titel);

  const grid = document.createElement('div');
  grid.className = 'tegel-grid';
  el.appendChild(grid);

  for (const leeftijd of LEEFTIJDEN) {
    const tegel = maakIconTile({
      icoonPad: `/assets/icons/leeftijd-${leeftijd}.svg`,
      label: `${leeftijd} jaar`,
      onClick: () => {
        ontgrendelAudio();
        zetLaatstGekozenLeeftijd(leeftijd);
        speelSchermOvergang();
        manager.push((m) => TopicSelectScreen(m, leeftijd));
      },
    });
    grid.appendChild(tegel);
  }

  // AgeSelectScreen wordt zowel gepusht (vanaf profielkeuze) als via 'replace' bereikt
  // (vanuit het profielmenu "andere leeftijd kiezen"), dus de stack kan hier leeg zijn —
  // terug gaat daarom altijd expliciet naar het profielscherm, niet manager.pop().
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
