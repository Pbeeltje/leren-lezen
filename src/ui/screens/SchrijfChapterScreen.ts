import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import type { OefeningNummer } from '../../engine/oefeningGenerator.ts';
import { SCHRIJF_HOOFDSTUKKEN } from '../../content/schrijven/hoofdstukken.ts';
import { SCHRIJF_OEFENINGEN, hoofdstukVragen } from '../../games/schrijven/hoofdstukVragen.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { maakTopRechtsBalk } from '../components/TopRechtsBalk.ts';
import { maakSterBalk } from '../components/ProgressStars.ts';
import { haalKernVoortgang, OEFENSESSIES_VOOR_TOETS, verhoogOefenSessies, zetLaatsteKern } from '../../engine/progressStore.ts';
import { MUNTEN_OEFENING_GOED, MUNTEN_OEFENING_SET, lesMunten } from '../../engine/rewards.ts';
import { speelSchermOvergang } from '../../three/transitions.ts';
import { RondeScreen } from './RondeScreen.ts';
import { DicteeScreen } from './DicteeScreen.ts';
import { SchrijfHoofdstukkenScreen } from './SchrijfHoofdstukkenScreen.ts';

// Eén schrijfhoofdstuk (groep 3), opgezet als een leeshoofdstuk (ChapterScreen): drie
// oefeningen (overtrekken, overschrijven, luisteren en schrijven) en het dictee als toets.
// Niets op slot. Pijltjes wisselen van hoofdstuk; terug gaat naar het overzicht.
export function SchrijfChapterScreen(manager: ScreenManager, index: number): Screen {
  const hoofdstuk = SCHRIJF_HOOFDSTUKKEN[index];

  const el = document.createElement('div');
  el.className = 'scherm';

  const titelRij = document.createElement('div');
  titelRij.className = 'hoofdstuk-titel-rij';

  const pijl = (tekst: string, label: string, naar: number): HTMLButtonElement => {
    const knop = document.createElement('button');
    knop.className = 'hoofdstuk-pijl';
    knop.textContent = tekst;
    knop.setAttribute('aria-label', label);
    knop.disabled = naar < 0 || naar >= SCHRIJF_HOOFDSTUKKEN.length;
    knop.addEventListener('click', () => {
      speelSchermOvergang();
      manager.replace((m) => SchrijfChapterScreen(m, naar));
    });
    return knop;
  };

  const titel = document.createElement('h1');
  titel.className = 'scherm-titel hoofdstuk-titel';
  titel.textContent = `Schrijven ${hoofdstuk.volgnummer}: ${hoofdstuk.titel}`;
  titelRij.append(pijl('‹', 'Vorig hoofdstuk', index - 1), titel, pijl('›', 'Volgend hoofdstuk', index + 1));
  el.appendChild(titelRij);

  const tegelGrid = document.createElement('div');
  tegelGrid.className = 'hoofdstuk-tegels';
  el.appendChild(tegelGrid);

  function tegel(icoon: string, tekst: string, open: () => void): HTMLButtonElement {
    const t = document.createElement('button');
    t.className = 'hoofdstuk-tegel';
    const img = document.createElement('img');
    img.src = `assets/icons/${icoon}.svg`;
    img.alt = '';
    const label = document.createElement('span');
    label.textContent = tekst;
    t.append(img, label);
    t.addEventListener('click', () => {
      zetLaatsteKern('schrijven', hoofdstuk.id);
      speelSchermOvergang();
      open();
    });
    return t;
  }

  function tekenTegels(): void {
    tegelGrid.innerHTML = '';
    const voortgang = haalKernVoortgang(hoofdstuk.id);

    for (let i = 1; i <= OEFENSESSIES_VOOR_TOETS; i++) {
      const nummer = i as OefeningNummer;
      const { titel: naam, icoon } = SCHRIJF_OEFENINGEN[nummer];
      const t = tegel(icoon, naam, () => {
        const herhaling = haalKernVoortgang(hoofdstuk.id).oefeningenAf.includes(nummer);
        const beloning = { perGoed: lesMunten(MUNTEN_OEFENING_GOED, herhaling), perSet: lesMunten(MUNTEN_OEFENING_SET, herhaling) };
        manager.push((m) =>
          RondeScreen(m, naam, hoofdstukVragen(hoofdstuk, nummer), beloning, undefined, () => verhoogOefenSessies(hoofdstuk.id, nummer)),
        );
      });
      if (voortgang.oefeningenAf.includes(nummer)) t.classList.add('gedaan');
      tegelGrid.appendChild(t);
    }

    const toets = tegel('trofee', 'Dictee', () => manager.push((m) => DicteeScreen(m, hoofdstuk)));
    toets.classList.add('hoofdstuk-tegel--toets');
    toets.appendChild(maakSterBalk(voortgang.sterren));
    tegelGrid.appendChild(toets);
  }

  const terug = maakTerugKnop(() => {
    speelSchermOvergang();
    manager.replace((m) => SchrijfHoofdstukkenScreen(m));
  });
  let topRechts: ReturnType<typeof maakTopRechtsBalk> | null = null;

  // De tweede klik van een dubbelklik op het vorige scherm mag hier niets openen.
  let gemountOp = 0;
  const tegenDubbelklik = (event: Event): void => {
    if (performance.now() - gemountOp < 300) {
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  };
  el.addEventListener('click', tegenDubbelklik, true);
  terug.addEventListener('click', tegenDubbelklik, true);

  return {
    mount(root) {
      gemountOp = performance.now();
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
