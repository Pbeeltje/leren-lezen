import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import type { LeeftijdId } from '../../content/types.ts';
import { maakIconTile } from '../components/IconTile.ts';
import { maakMuntenTeller } from '../components/MuntenTeller.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { topicsVoorLeeftijd } from '../../content/topics.ts';
import { speelSchermOvergang } from '../../three/transitions.ts';
import { KernOverviewScreen } from './KernOverviewScreen.ts';
import { ComingSoonScreen } from './ComingSoonScreen.ts';

export function TopicSelectScreen(manager: ScreenManager, leeftijd: LeeftijdId): Screen {
  const el = document.createElement('div');
  el.className = 'scherm';

  const titel = document.createElement('h1');
  titel.className = 'scherm-titel';
  titel.textContent = 'Wat wil je doen?';
  el.appendChild(titel);

  const grid = document.createElement('div');
  grid.className = 'tegel-grid';
  el.appendChild(grid);

  for (const topic of topicsVoorLeeftijd(leeftijd)) {
    const tegel = maakIconTile({
      icoonPad: topic.icoonPad,
      label: topic.titel,
      beschikbaar: topic.beschikbaar,
      badge: topic.beschikbaar ? undefined : 'binnenkort',
      onClick: () => {
        if (!topic.beschikbaar) return;
        speelSchermOvergang();
        if (topic.id === 'lezen') {
          manager.push((m) => KernOverviewScreen(m));
        } else {
          manager.push((m) => ComingSoonScreen(m, topic.titel));
        }
      },
    });
    grid.appendChild(tegel);
  }

  const terug = maakTerugKnop(() => manager.pop());
  let munten: ReturnType<typeof maakMuntenTeller> | null = null;

  return {
    mount(root) {
      root.appendChild(el);
      root.appendChild(terug);
      munten = maakMuntenTeller();
      root.appendChild(munten.element);
    },
    unmount() {
      el.remove();
      terug.remove();
      munten?.element.remove();
      munten?.vernietig();
      munten = null;
    },
  };
}
