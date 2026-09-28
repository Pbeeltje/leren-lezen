import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import type { RekenKern, RekenOefeningDefinitie } from '../../content/tellen/types.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { maakTopRechtsBalk } from '../components/TopRechtsBalk.ts';
import { markeerKernGestart, markeerKernVoltooid, voegMuntenToe } from '../../engine/progressStore.ts';
import { MUNTEN_OEFENING_GOED, MUNTEN_TOETS_GOED, MUNTEN_TOETS_PERFECT_BONUS } from '../../engine/rewards.ts';
import { type RekenModus, genereerRekenSessie } from '../../engine/rekenenGenerator.ts';
import { renderHoeveelheidNaarCijfer } from '../../games/hoeveelheidNaarCijfer.ts';
import { renderCijferNaarHoeveelheid } from '../../games/cijferNaarHoeveelheid.ts';
import { renderDobbelsteenNaarCijfer } from '../../games/dobbelsteenNaarCijfer.ts';
import { speelSchermOvergang } from '../../three/transitions.ts';
import { TestResultScreen } from './TestResultScreen.ts';
import { RekenKernOverviewScreen } from './RekenKernOverviewScreen.ts';

export type { RekenModus };

const INSTRUCTIES: Record<RekenOefeningDefinitie['type'], string> = {
  'hoeveelheid-naar-cijfer': 'Hoeveel zie je? Kies het juiste cijfer',
  'cijfer-naar-hoeveelheid': 'Welk groepje heeft er zoveel?',
  'dobbelsteen-naar-cijfer': 'Welk cijfer hoort bij de dobbelsteen?',
};

function renderOefening(
  container: HTMLElement,
  oefening: RekenOefeningDefinitie,
  opties: { herkansingToegestaan: boolean },
  afgerond: (juist: boolean) => void,
): { vernietig: () => void } {
  switch (oefening.type) {
    case 'hoeveelheid-naar-cijfer':
      return renderHoeveelheidNaarCijfer(container, oefening, opties, afgerond);
    case 'cijfer-naar-hoeveelheid':
      return renderCijferNaarHoeveelheid(container, oefening, opties, afgerond);
    case 'dobbelsteen-naar-cijfer':
      return renderDobbelsteenNaarCijfer(container, oefening, opties, afgerond);
  }
}

export function RekenOefeningScreen(
  manager: ScreenManager,
  kern: RekenKern,
  modus: RekenModus,
  onAfgerond: () => void,
): Screen {
  const oefeningen = genereerRekenSessie(kern, modus);

  const el = document.createElement('div');
  el.className = 'scherm';

  const instructie = document.createElement('p');
  instructie.className = 'instructie-tekst';
  el.appendChild(instructie);

  const voortgang = document.createElement('p');
  voortgang.className = 'instructie-tekst';
  el.appendChild(voortgang);

  const oefenContainer = document.createElement('div');
  el.appendChild(oefenContainer);

  let huidigeIndex = 0;
  let aantalGoed = 0;
  let muntenDitKeer = 0;
  let opruimen: (() => void) | null = null;
  let klaarMetDeze = false;

  function toonHuidige(): void {
    klaarMetDeze = false;
    const oefening = oefeningen[huidigeIndex];
    instructie.textContent = INSTRUCTIES[oefening.type];
    voortgang.textContent = `${huidigeIndex + 1} / ${oefeningen.length}`;

    opruimen = renderOefening(
      oefenContainer,
      oefening,
      { herkansingToegestaan: modus === 'oefenen' },
      (juist) => afhandelenResultaat(juist),
    ).vernietig;
  }

  function afhandelenResultaat(juist: boolean): void {
    if (klaarMetDeze) return;
    klaarMetDeze = true;
    if (juist) {
      aantalGoed++;
      const munten = modus === 'oefenen' ? MUNTEN_OEFENING_GOED : MUNTEN_TOETS_GOED;
      voegMuntenToe(munten);
      muntenDitKeer += munten;
    }
    setTimeout(volgende, 900);
  }

  function overslaan(): void {
    if (klaarMetDeze) return;
    klaarMetDeze = true;
    volgende();
  }

  function volgende(): void {
    opruimen?.();
    huidigeIndex++;
    if (huidigeIndex >= oefeningen.length) {
      afronden();
      return;
    }
    toonHuidige();
  }

  function afronden(): void {
    if (modus === 'toets') {
      const fractie = aantalGoed / oefeningen.length;
      const sterren: 0 | 1 | 2 | 3 = fractie === 1 ? 3 : fractie >= 0.7 ? 2 : fractie >= 0.4 ? 1 : 0;
      if (fractie === 1) {
        voegMuntenToe(MUNTEN_TOETS_PERFECT_BONUS);
        muntenDitKeer += MUNTEN_TOETS_PERFECT_BONUS;
      }
      markeerKernVoltooid(kern.id, sterren);
      speelSchermOvergang();
      manager.replace((m) =>
        TestResultScreen(
          m,
          { aantalGoed, totaal: oefeningen.length, muntenVerdiend: muntenDitKeer, sterren },
          (mgr) => mgr.replace((m2) => RekenKernOverviewScreen(m2)),
        ),
      );
      return;
    }
    onAfgerond();
    manager.pop();
  }

  if (modus === 'oefenen') {
    markeerKernGestart(kern.id);
  }
  toonHuidige();

  const terug = maakTerugKnop(() => {
    opruimen?.();
    manager.pop();
  });

  const overslaanKnop = document.createElement('button');
  overslaanKnop.className = 'overslaan-knop';
  overslaanKnop.textContent = 'Overslaan';
  const overslaanIcoon = document.createElement('img');
  overslaanIcoon.src = '/assets/icons/overslaan.svg';
  overslaanIcoon.alt = '';
  overslaanKnop.appendChild(overslaanIcoon);
  overslaanKnop.addEventListener('click', overslaan);

  let topRechts: ReturnType<typeof maakTopRechtsBalk> | null = null;

  return {
    mount(root) {
      root.appendChild(el);
      root.appendChild(terug);
      root.appendChild(overslaanKnop);
      topRechts = maakTopRechtsBalk(manager);
      root.appendChild(topRechts.element);
    },
    unmount() {
      opruimen?.();
      el.remove();
      terug.remove();
      overslaanKnop.remove();
      topRechts?.element.remove();
      topRechts?.vernietig();
      topRechts = null;
    },
  };
}
