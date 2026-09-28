import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { maakIconTile } from '../components/IconTile.ts';
import { haalProfielen, zetActiefProfiel, avatarPad, type Profiel } from '../../engine/profielStore.ts';
import { haalVoortgang } from '../../engine/progressStore.ts';
import { ontgrendelAudio } from '../../engine/audioManager.ts';
import { speelSchermOvergang } from '../../three/transitions.ts';
import { AgeSelectScreen } from './AgeSelectScreen.ts';
import { TopicSelectScreen } from './TopicSelectScreen.ts';
import { NewProfileScreen } from './NewProfileScreen.ts';

function kiesProfiel(manager: ScreenManager, profiel: Profiel): void {
  ontgrendelAudio();
  zetActiefProfiel(profiel.id);
  speelSchermOvergang();

  const leeftijd = haalVoortgang().laatstGekozenLeeftijd;
  if (leeftijd) {
    manager.replace((m) => TopicSelectScreen(m, leeftijd));
  } else {
    manager.replace((m) => AgeSelectScreen(m));
  }
}

export function ProfileSelectScreen(manager: ScreenManager): Screen {
  const el = document.createElement('div');
  el.className = 'scherm';

  const titel = document.createElement('h1');
  titel.className = 'scherm-titel';
  el.appendChild(titel);

  const grid = document.createElement('div');
  grid.className = 'tegel-grid';
  el.appendChild(grid);

  function tekenLijst(): void {
    const profielen = haalProfielen();
    titel.textContent = profielen.length > 0 ? 'Wie speelt er?' : 'Maak je profiel!';
    grid.innerHTML = '';

    for (const profiel of profielen) {
      grid.appendChild(
        maakIconTile({
          icoonPad: avatarPad(profiel.icoonId),
          label: profiel.naam,
          onClick: () => kiesProfiel(manager, profiel),
        }),
      );
    }

    grid.appendChild(
      maakIconTile({
        icoonPad: '/assets/icons/plus.svg',
        label: 'Nieuw profiel',
        onClick: () => {
          ontgrendelAudio();
          speelSchermOvergang();
          manager.push((m) => NewProfileScreen(m));
        },
      }),
    );
  }

  tekenLijst();

  return {
    mount(root) {
      root.appendChild(el);
    },
    unmount() {
      el.remove();
    },
  };
}
