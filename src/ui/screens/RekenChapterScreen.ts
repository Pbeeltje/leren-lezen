import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { REKEN_KERNEN } from '../../content/tellen/kernen/kernen.index.ts';
import { aantalHoofdstukken } from '../../engine/leeftijdGrens.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { maakTopRechtsBalk } from '../components/TopRechtsBalk.ts';
import { maakSterBalk } from '../components/ProgressStars.ts';
import { haalKernVoortgang, OEFENSESSIES_VOOR_TOETS } from '../../engine/progressStore.ts';
import { speelSchermOvergang } from '../../three/transitions.ts';
import { RekenOefeningScreen } from './RekenOefeningScreen.ts';
import { RekenKernOverviewScreen } from './RekenKernOverviewScreen.ts';

export function RekenChapterScreen(manager: ScreenManager, index: number): Screen {
  const kern = REKEN_KERNEN[index];

  const el = document.createElement('div');
  el.className = 'scherm';

  const titelRij = document.createElement('div');
  titelRij.className = 'hoofdstuk-titel-rij';

  const vorigeKnop = document.createElement('button');
  vorigeKnop.className = 'hoofdstuk-pijl';
  vorigeKnop.textContent = '‹';
  vorigeKnop.setAttribute('aria-label', 'Vorig hoofdstuk');
  vorigeKnop.disabled = index === 0;
  vorigeKnop.addEventListener('click', () => {
    speelSchermOvergang();
    manager.replace((m) => RekenChapterScreen(m, index - 1));
  });
  titelRij.appendChild(vorigeKnop);

  const titel = document.createElement('h1');
  titel.className = 'scherm-titel hoofdstuk-titel';
  titel.textContent = `Rekenen ${kern.volgnummer}: ${kern.titel}`;
  titelRij.appendChild(titel);

  const volgendeKnop = document.createElement('button');
  volgendeKnop.className = 'hoofdstuk-pijl';
  volgendeKnop.textContent = '›';
  volgendeKnop.setAttribute('aria-label', 'Volgend hoofdstuk');
  volgendeKnop.disabled = index >= aantalHoofdstukken(REKEN_KERNEN.length) - 1;
  volgendeKnop.addEventListener('click', () => {
    speelSchermOvergang();
    manager.replace((m) => RekenChapterScreen(m, index + 1));
  });
  titelRij.appendChild(volgendeKnop);

  el.appendChild(titelRij);

  const tegelGrid = document.createElement('div');
  tegelGrid.className = 'hoofdstuk-tegels';
  el.appendChild(tegelGrid);

  function tekenTegels(): void {
    tegelGrid.innerHTML = '';
    const voortgang = haalKernVoortgang(kern.id);

    for (let i = 1; i <= OEFENSESSIES_VOOR_TOETS; i++) {
      const tegel = document.createElement('button');
      tegel.className = 'hoofdstuk-tegel';
      if (voortgang.oefenSessies >= i) tegel.classList.add('gedaan');
      const icoon = document.createElement('img');
      icoon.src = '/assets/icons/potlood.svg';
      icoon.alt = '';
      tegel.appendChild(icoon);
      const label = document.createElement('span');
      label.textContent = `Oefening ${i}`;
      tegel.appendChild(label);
      tegel.addEventListener('click', () => {
        speelSchermOvergang();
        manager.push((m) => RekenOefeningScreen(m, kern, 'oefenen', tekenTegels));
      });
      tegelGrid.appendChild(tegel);
    }

    const toetsTegel = document.createElement('button');
    toetsTegel.className = 'hoofdstuk-tegel hoofdstuk-tegel--toets';
    const toetsIcoon = document.createElement('img');
    toetsIcoon.src = '/assets/icons/trofee.svg';
    toetsIcoon.alt = '';
    toetsTegel.appendChild(toetsIcoon);
    const toetsLabel = document.createElement('span');
    toetsLabel.textContent = 'Toets';
    toetsTegel.appendChild(toetsLabel);
    toetsTegel.appendChild(maakSterBalk(voortgang.sterren));
    toetsTegel.addEventListener('click', () => {
      speelSchermOvergang();
      manager.push((m) => RekenOefeningScreen(m, kern, 'toets', tekenTegels));
    });
    tegelGrid.appendChild(toetsTegel);
  }

  const terug = maakTerugKnop(() => {
    speelSchermOvergang();
    manager.replace((m) => RekenKernOverviewScreen(m));
  });
  let topRechts: ReturnType<typeof maakTopRechtsBalk> | null = null;

  return {
    mount(root) {
      root.appendChild(el);
      root.appendChild(terug);
      topRechts = maakTopRechtsBalk(manager);
      root.appendChild(topRechts.element);
      tekenTegels();
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
