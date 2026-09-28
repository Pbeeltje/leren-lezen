import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import type { Kern, OefeningDefinitie } from '../../content/types.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { maakTopRechtsBalk } from '../components/TopRechtsBalk.ts';
import {
  markeerKernGestart,
  markeerKernVoltooid,
  verhoogBlootstelling,
  voegMuntenToe,
} from '../../engine/progressStore.ts';
import { MUNTEN_OEFENING_GOED, MUNTEN_TOETS_GOED, MUNTEN_TOETS_PERFECT_BONUS } from '../../engine/rewards.ts';
import { type OefenModus, genereerSessie, woordVanOefening } from '../../engine/oefeningGenerator.ts';
import { renderPlaatjeWoordKeuze } from '../../games/plaatjeWoordKeuze.ts';
import { renderWoordPlaatjeKeuze } from '../../games/woordPlaatjeKeuze.ts';
import { renderHakkenEnPlakken } from '../../games/hakkenEnPlakken.ts';
import { renderWoordBouwen } from '../../games/woordBouwen.ts';
import { renderZelfTypen } from '../../games/zelfTypen.ts';
import { renderZinInvullen } from '../../games/zinInvullen.ts';

export type { OefenModus };

const INSTRUCTIES: Record<OefeningDefinitie['type'], string> = {
  'plaatje-woord-keuze': 'Welk woord hoort bij het plaatje?',
  'woord-plaatje-keuze': 'Welk plaatje hoort bij het woord?',
  'hakken-en-plakken': 'Tik de letters in de juiste volgorde',
  'woord-bouwen': 'Bouw het woord met de blokjes',
  'zelf-typen': 'Typ het woord dat je op het plaatje ziet',
  'zin-invullen': 'Welk woord past in de zin?',
};

function renderOefening(
  container: HTMLElement,
  oefening: OefeningDefinitie,
  opties: { herkansingToegestaan: boolean },
  afgerond: (juist: boolean) => void,
): { vernietig: () => void } {
  switch (oefening.type) {
    case 'plaatje-woord-keuze':
      return renderPlaatjeWoordKeuze(container, oefening, opties, afgerond);
    case 'woord-plaatje-keuze':
      return renderWoordPlaatjeKeuze(container, oefening, opties, afgerond);
    case 'hakken-en-plakken':
      return renderHakkenEnPlakken(container, oefening, opties, afgerond);
    case 'woord-bouwen':
      return renderWoordBouwen(container, oefening, opties, afgerond);
    case 'zelf-typen':
      return renderZelfTypen(container, oefening, opties, afgerond);
    case 'zin-invullen':
      return renderZinInvullen(container, oefening, opties, afgerond);
  }
}

export function OefeningScreen(
  manager: ScreenManager,
  kern: Kern,
  modus: OefenModus,
  onAfgerond: () => void,
): Screen {
  const oefeningen = genereerSessie(kern, modus);

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
  let opruimen: (() => void) | null = null;

  function toonHuidige(): void {
    const oefening = oefeningen[huidigeIndex];
    instructie.textContent = INSTRUCTIES[oefening.type];
    voortgang.textContent = `${huidigeIndex + 1} / ${oefeningen.length}`;

    opruimen = renderOefening(
      oefenContainer,
      oefening,
      { herkansingToegestaan: modus === 'oefenen' },
      (juist) => afhandelenResultaat(oefening, juist),
    ).vernietig;
  }

  function afhandelenResultaat(oefening: OefeningDefinitie, juist: boolean): void {
    if (juist) {
      aantalGoed++;
      voegMuntenToe(modus === 'oefenen' ? MUNTEN_OEFENING_GOED : MUNTEN_TOETS_GOED);
    }
    // "zelf-typen" telt niet mee voor zijn eigen vrijspeelvoorwaarde; elke andere
    // vorm telt als geoefend, ongeacht of het antwoord goed was.
    if (oefening.type !== 'zelf-typen') {
      verhoogBlootstelling(woordVanOefening(oefening));
    }
    setTimeout(volgende, 900);
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
      if (fractie === 1) voegMuntenToe(MUNTEN_TOETS_PERFECT_BONUS);
      markeerKernVoltooid(kern.id, sterren);
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
  let topRechts: ReturnType<typeof maakTopRechtsBalk> | null = null;

  return {
    mount(root) {
      root.appendChild(el);
      root.appendChild(terug);
      topRechts = maakTopRechtsBalk(manager);
      root.appendChild(topRechts.element);
    },
    unmount() {
      opruimen?.();
      el.remove();
      terug.remove();
      topRechts?.element.remove();
      topRechts?.vernietig();
      topRechts = null;
    },
  };
}
