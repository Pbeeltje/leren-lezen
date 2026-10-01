import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { events } from '../../engine/events.ts';
import type { Kern, OefeningDefinitie } from '../../content/types.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { maakTopRechtsBalk } from '../components/TopRechtsBalk.ts';
import {
  haalKernVoortgang,
  markeerKernGestart,
  markeerKernVoltooid,
  verhoogBlootstelling,
  verhoogOefenSessies,
  voegMuntenToe,
} from '../../engine/progressStore.ts';
import {
  MUNTEN_OEFENING_GOED,
  MUNTEN_OEFENING_HERHAALD,
  MUNTEN_TOETS_GOED,
  MUNTEN_TOETS_HERHAALD,
  MUNTEN_TOETS_PERFECT_BONUS,
} from '../../engine/rewards.ts';
import { type OefenModus, type OefeningNummer, genereerSessie, woordenVanOefening } from '../../engine/oefeningGenerator.ts';
import { renderPlaatjeWoordKeuze } from '../../games/plaatjeWoordKeuze.ts';
import { renderWoordPlaatjeKeuze } from '../../games/woordPlaatjeKeuze.ts';
import { renderHakkenEnPlakken } from '../../games/hakkenEnPlakken.ts';
import { renderWoordBouwen } from '../../games/woordBouwen.ts';
import { renderZelfTypen } from '../../games/zelfTypen.ts';
import { renderZinInvullen } from '../../games/zinInvullen.ts';
import { renderWoordwolk } from '../../games/woordwolk.ts';
import { renderLetterHerkennen } from '../../games/letterHerkennen.ts';
import { renderKlankHerkennen } from '../../games/klankHerkennen.ts';
import { renderDrieKoppelen } from '../../games/drieKoppelen.ts';
import { speelSchermOvergang } from '../../three/transitions.ts';
import { TestResultScreen } from './TestResultScreen.ts';
import { ChapterScreen } from './ChapterScreen.ts';
import { KERNEN } from '../../content/lezen/kernen/kernen.index.ts';
import { maakVoortgangsbalk } from '../components/Voortgangsbalk.ts';
import { maakAudioKnop } from '../components/AudioKnop.ts';
import { speelAf, instructieAudioPad } from '../../engine/audioManager.ts';

export type { OefenModus };

const INSTRUCTIES: Record<OefeningDefinitie['type'], string> = {
  'plaatje-woord-keuze': 'Welk woord hoort bij het plaatje?',
  'woord-plaatje-keuze': 'Welk plaatje hoort bij het woord?',
  'hakken-en-plakken': 'Tik de letters in de juiste volgorde',
  'woord-bouwen': 'Bouw het woord met de blokjes',
  'zelf-typen': 'Typ het woord dat je op het plaatje ziet',
  'zin-invullen': 'Welk woord past in de zin?',
  woordwolk: 'Tik het woord aan dat bij het plaatje hoort',
  'letter-herkennen': 'Welk woord heeft deze letter?',
  'klank-herkennen': 'Welk woord heeft deze klank?',
  'drie-koppelen': 'Welk plaatje hoort bij welk woord?',
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
    case 'letter-herkennen':
      return renderLetterHerkennen(container, oefening, opties, afgerond);
    case 'klank-herkennen':
      return renderKlankHerkennen(container, oefening, opties, afgerond);
    case 'drie-koppelen':
      return renderDrieKoppelen(container, oefening, opties, afgerond);
  }
}

export function OefeningScreen(
  manager: ScreenManager,
  kern: Kern,
  modus: OefenModus,
  onAfgerond: () => void,
  oefeningNummer: OefeningNummer = 1,
): Screen {
  // In 'oefenen'-modus behandelt elke Oefening 1/2/3 zijn eigen, vaste derde van de
  // woordenbank (zie woordenVoorOefening() in oefeningGenerator.ts) -- zo is elke
  // oefening grotendeels nieuwe woorden i.p.v. drie keer een willekeurige greep uit
  // dezelfde hele bank; de toets doorloopt daarna alles nog eens als samenvatting.
  const oefeningen = genereerSessie(kern, modus, oefeningNummer);
  // Vastgelegd bij het starten van déze poging (niet later herberekend): bepaalt of
  // deze poging als "eerste keer" of "herhaling" beloond wordt.
  const voortgangBijStart = haalKernVoortgang(kern.id);
  const wasAlGeoefend = voortgangBijStart.gestart;
  // Een eerdere toets met 0 sterren telt niet als "gehaald": een herkansing verdient dan
  // gewoon de munten per goed antwoord.
  const wasAlGehaald = voortgangBijStart.voltooid && voortgangBijStart.sterren > 0;

  const el = document.createElement('div');
  el.className = 'scherm';

  const instructieRij = document.createElement('div');
  instructieRij.className = 'instructie-rij';
  el.appendChild(instructieRij);

  const instructie = document.createElement('p');
  instructie.className = 'instructie-tekst';
  instructieRij.appendChild(instructie);

  let huidigeAudioPad: string | undefined;
  const audioKnop = maakAudioKnop(() => speelAf(huidigeAudioPad));
  instructieRij.appendChild(audioKnop);

  const voortgangsbalk = maakVoortgangsbalk(oefeningen.length);
  el.appendChild(voortgangsbalk.element);

  const oefenContainer = document.createElement('div');
  el.appendChild(oefenContainer);

  let huidigeIndex = 0;
  let aantalGoed = 0;
  let muntenDitKeer = 0;
  let opruimen: (() => void) | null = null;
  let klaarMetDeze = false; // voorkomt dubbele afhandeling als overslaan en afgerond() elkaar kruisen
  let volgendeTimer: number | undefined;
  let gemountOp = 0;

  function toonHuidige(): void {
    klaarMetDeze = false;
    const oefening = oefeningen[huidigeIndex];
    instructie.textContent = INSTRUCTIES[oefening.type];
    huidigeAudioPad = instructieAudioPad(oefening.type);
    speelAf(huidigeAudioPad);
    voortgangsbalk.zetVoortgang(huidigeIndex);

    opruimen = renderOefening(
      oefenContainer,
      oefening,
      { herkansingToegestaan: modus === 'oefenen' },
      // Een late afgerond() van een vorige oefening (timer na overslaan) mag deze niet afhandelen.
      (juist) => {
        if (oefeningen[huidigeIndex] === oefening) afhandelenResultaat(oefening, juist);
      },
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
      for (const woord of woordenVanOefening(oefening)) verhoogBlootstelling(woord);
    }
    volgendeTimer = window.setTimeout(volgende, 900);
  }

  function overslaan(): void {
    if (klaarMetDeze) return;
    klaarMetDeze = true;
    // Overslaan telt als niet-goed (geen munten voor deze vraag) maar blokkeert het
    // kind niet als het vastzit — zie ook: geen bestraffende dead-end elders in de app.
    volgende();
  }

  function volgende(): void {
    clearTimeout(volgendeTimer);
    opruimen?.();
    opruimen = null;
    huidigeIndex++;
    if (huidigeIndex >= oefeningen.length) {
      afronden();
      return;
    }
    toonHuidige();
  }

  function afronden(): void {
    events.emit('sessie-klaar', undefined);
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
      const kernIndex = KERNEN.findIndex((k) => k.id === kern.id);
      manager.replace((m) =>
        TestResultScreen(
          m,
          { aantalGoed, totaal: oefeningen.length, muntenVerdiend: muntenDitKeer, sterren },
          (mgr) => mgr.replace((m2) => ChapterScreen(m2, kernIndex)),
        ),
      );
      return;
    }
    verhoogOefenSessies(kern.id);
    onAfgerond();
    manager.pop();
  }

  if (modus === 'oefenen') {
    markeerKernGestart(kern.id);
  }
  toonHuidige();

  const terug = maakTerugKnop(() => manager.pop());

  // Een dubbelklik op de tegel in ChapterScreen mag niet meteen een antwoord aantikken.
  const tegenDubbelklik = (event: Event): void => {
    if (performance.now() - gemountOp < 300) {
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  };
  el.addEventListener('click', tegenDubbelklik, true);
  el.addEventListener('pointerdown', tegenDubbelklik, true);
  terug.addEventListener('click', tegenDubbelklik, true);

  const overslaanKnop = document.createElement('button');
  overslaanKnop.className = 'overslaan-knop';
  overslaanKnop.setAttribute('aria-label', 'Overslaan');
  const overslaanTekst = document.createElement('span');
  overslaanTekst.textContent = 'Overslaan';
  overslaanKnop.appendChild(overslaanTekst);
  const overslaanIcoon = document.createElement('img');
  overslaanIcoon.src = 'assets/icons/overslaan.svg';
  overslaanIcoon.alt = '';
  overslaanKnop.appendChild(overslaanIcoon);
  overslaanKnop.addEventListener('click', overslaan);
  // In de rij van de voortgangsbalk (achter het kommetje), niet zwevend onderaan: zo valt hij
  // op geen enkel schermformaat over een antwoord of het toetsenbord.
  voortgangsbalk.element.appendChild(overslaanKnop);

  let topRechts: ReturnType<typeof maakTopRechtsBalk> | null = null;

  return {
    mount(root) {
      gemountOp = performance.now();
      root.appendChild(el);
      root.appendChild(terug);
      topRechts = maakTopRechtsBalk(manager);
      root.appendChild(topRechts.element);
    },
    unmount() {
      // Anders loopt de sessie na "terug" onzichtbaar door (en pop't bij de laatste vraag
      // het hoofdstukscherm weg).
      clearTimeout(volgendeTimer);
      opruimen?.();
      opruimen = null;
      el.remove();
      terug.remove();
      overslaanKnop.remove();
      topRechts?.element.remove();
      topRechts?.vernietig();
      topRechts = null;
    },
  };
}
