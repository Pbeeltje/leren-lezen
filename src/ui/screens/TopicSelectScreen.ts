import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import type { Groep } from '../../content/types.ts';
import { maakIconTile } from '../components/IconTile.ts';
import { maakTopRechtsBalk } from '../components/TopRechtsBalk.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { topicsVoorGroep } from '../../content/topics.ts';
import { speelSchermOvergang } from '../../three/transitions.ts';
import { KernOverviewScreen } from './KernOverviewScreen.ts';
import { RekenKernOverviewScreen } from './RekenKernOverviewScreen.ts';
import { ComingSoonScreen } from './ComingSoonScreen.ts';
import { ProfileSelectScreen } from './ProfileSelectScreen.ts';
import { LuisterenKiesScreen } from './LuisterenKiesScreen.ts';
import { OntdekkenKiesScreen } from './OntdekkenKiesScreen.ts';
import { GeheugenScreen } from './GeheugenScreen.ts';
import { SchrijvenKiesScreen } from './SchrijvenKiesScreen.ts';
import { BoekenkastScreen } from './BoekenkastScreen.ts';
import { MuziekKiesScreen } from './MuziekKiesScreen.ts';

export function TopicSelectScreen(manager: ScreenManager, groep: Groep): Screen {
  const el = document.createElement('div');
  el.className = 'scherm';

  const titel = document.createElement('h1');
  titel.className = 'scherm-titel';
  titel.textContent = 'Wat wil je doen?';
  el.appendChild(titel);

  const grid = document.createElement('div');
  grid.className = 'tegel-grid';
  el.appendChild(grid);

  for (const topic of topicsVoorGroep(groep)) {
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
        } else if (topic.id === 'tellen') {
          manager.push((m) => RekenKernOverviewScreen(m));
        } else if (topic.id === 'luisteren') {
          manager.push((m) => LuisterenKiesScreen(m));
        } else if (topic.id === 'ontdekken') {
          manager.push((m) => OntdekkenKiesScreen(m));
        } else if (topic.id === 'muziek') {
          manager.push((m) => MuziekKiesScreen(m));
        } else if (topic.id === 'boekjes') {
          manager.push((m) => BoekenkastScreen(m));
        } else if (topic.id === 'schrijven') {
          manager.push((m) => SchrijvenKiesScreen(m));
        } else if (topic.id === 'geheugen') {
          manager.push((m) => GeheugenScreen(m, 8));
        } else {
          manager.push((m) => ComingSoonScreen(m, topic.titel));
        }
      },
    });
    grid.appendChild(tegel);
  }

  // TopicSelectScreen wordt zowel gepusht (vanaf GroepKiesScreen) als via 'replace'
  // bereikt (vanuit ProfileSelectScreen wanneer de groep al bekend is, de gangbare
  // route voor een terugkerend profiel) -- dus de stack kan hier maar 1 diep zijn.
  // terugOfAnders pop't als er iets onder zit, en valt anders terug op het profielscherm.
  const terug = maakTerugKnop(() => manager.terugOfAnders((m) => ProfileSelectScreen(m)));
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
