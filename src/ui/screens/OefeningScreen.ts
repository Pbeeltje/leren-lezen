import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import type { Kern, OefeningDefinitie } from '../../content/types.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { maakTopRechtsBalk } from '../components/TopRechtsBalk.ts';
import {
  haalKernVoortgang,
  markeerKernGestart,
  markeerKernVoltooid,
  verhoogBlootstelling,
  voegMuntenToe,
} from '../../engine/progressStore.ts';
import {
  MUNTEN_OEFENING_GOED,
  MUNTEN_OEFENING_HERHAALD,
  MUNTEN_TOETS_GOED,
  MUNTEN_TOETS_HERHAALD,
  MUNTEN_TOETS_PERFECT_BONUS,
} from '../../engine/rewards.ts';
import { type OefenModus, genereerSessie, woordVanOefening } from '../../engine/oefeningGenerator.ts';
import { renderPlaatjeWoordKeuze } from '../../games/plaatjeWoordKeuze.ts';
import { renderWoordPlaatjeKeuze } from '../../games/woordPlaatjeKeuze.ts';
import { renderHakkenEnPlakken } from '../../games/hakkenEnPlakken.ts';
import { renderWoordBouwen } from '../../games/woordBouwen.ts';
import { renderZelfTypen } from '../../games/zelfTypen.ts';
import { renderZinInvullen } from '../../games/zinInvullen.ts';
import { renderWoordwolk } from '../../games/woordwolk.ts';
import { speelSchermOvergang } from '../../three/transitions.ts';
import { TestResultScreen } from './TestResultScreen.ts';
import { KernOverviewScreen } from './KernOverviewScreen.ts';

export type { OefenModus };

const INSTRUCTIES: Record<OefeningDefinitie['type'], string> = {
  'plaatje-woord-keuze': 'Welk woord hoort bij het plaatje?',
  'woord-plaatje-keuze': 'Welk plaatje hoort bij het woord?',
  'hakken-en-plakken': 'Tik de letters in de juiste volgorde',
  'woord-bouwen': 'Bouw het woord met de blokjes',
  'zelf-typen': 'Typ het woord dat je op het plaatje ziet',
  'zin-invullen': 'Welk woord past in de zin?',
  woordwolk: 'Tik alle woorden aan die bij het plaatje horen',
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
    case 'woordwolk':
      return renderWoordwolk(container, oefening, opties, afgerond);
  }
}

export function OefeningScreen(
  manager: ScreenManager,
  kern: Kern,
  modus: OefenModus,
  onAfgerond: () => void,
): Screen {
  const oefeningen = genereerSessie(kern, modus);
  // Vastgelegd bij het starten van déze poging (niet later herberekend): bepaalt of
  // deze poging als "eerste keer" of "herhaling" beloond wordt.
  const voortgangBijStart = haalKernVoortgang(kern.id);
  const wasAlGeoefend = voortgangBijStart.gestart;
  const wasAlGehaald = voortgangBijStart.voltooid;

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
  let klaarMetDeze = false; // voorkomt dubbele afhandeling als overslaan en afgerond() elkaar kruisen

  function toonHuidige(): void {
    klaarMetDeze = false;
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
    if (klaarMetDeze) return;
    klaarMetDeze = true;
    if (juist) {
      aantalGoed++;
      if (modus === 'oefenen') {
        const munten = wasAlGeoefend ? MUNTEN_OEFENING_HERHAALD : MUNTEN_OEFENING_GOED;
        voegMuntenToe(munten);
        muntenDitKeer += munten;
      } else if (!wasAlGehaald) {
        // Bij een hertoets van een al gehaalde kern komt er aan het eind één vast
        // bedrag (MUNTEN_TOETS_HERHAALD) i.p.v. per-vraag munten — zie afronden().
        voegMuntenToe(MUNTEN_TOETS_GOED);
        muntenDitKeer += MUNTEN_TOETS_GOED;
      }
    }
    // "zelf-typen" telt niet mee voor zijn eigen vrijspeelvoorwaarde; elke andere
    // vorm telt als geoefend, ongeacht of het antwoord goed was.
    if (oefening.type !== 'zelf-typen') {
      verhoogBlootstelling(woordVanOefening(oefening));
    }
    setTimeout(volgende, 900);
  }

  function overslaan(): void {
    if (klaarMetDeze) return;
    klaarMetDeze = true;
    // Overslaan telt als niet-goed (geen munten voor deze vraag) maar blokkeert het
    // kind niet als het vastzit — zie ook: geen bestraffende dead-end elders in de app.
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
      if (wasAlGehaald) {
        voegMuntenToe(MUNTEN_TOETS_HERHAALD);
        muntenDitKeer += MUNTEN_TOETS_HERHAALD;
      } else if (fractie === 1) {
        voegMuntenToe(MUNTEN_TOETS_PERFECT_BONUS);
        muntenDitKeer += MUNTEN_TOETS_PERFECT_BONUS;
      }
      markeerKernVoltooid(kern.id, sterren);
      speelSchermOvergang();
      manager.replace((m) =>
        TestResultScreen(
          m,
          { aantalGoed, totaal: oefeningen.length, muntenVerdiend: muntenDitKeer, sterren },
          (mgr) => mgr.replace((m2) => KernOverviewScreen(m2)),
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
