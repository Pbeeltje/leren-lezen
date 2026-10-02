import { rekenKernen } from '../../engine/leeftijdGrens.ts';
import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { events } from '../../engine/events.ts';
import type { RekenKern, RekenOefeningDefinitie } from '../../content/tellen/types.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { maakTopRechtsBalk } from '../components/TopRechtsBalk.ts';
import {
  haalKernVoortgang,
  markeerKernGestart,
  markeerKernVoltooid,
  verhoogOefenSessies,
  voegMuntenToe,
} from '../../engine/progressStore.ts';
import {
  MUNTEN_OEFENING_GOED,
  MUNTEN_OEFENING_SET,
  MUNTEN_TOETS_GOED,
  lesMunten,
  toetsEindMunten,
} from '../../engine/rewards.ts';
import type { OefeningNummer } from '../../engine/oefeningGenerator.ts';
import { type RekenModus, genereerRekenSessie } from '../../engine/rekenenGenerator.ts';
import { renderHoeveelheidNaarCijfer } from '../../games/hoeveelheidNaarCijfer.ts';
import { renderHoeveelheidTypen } from '../../games/hoeveelheidTypen.ts';
import { renderCijferNaarHoeveelheid } from '../../games/cijferNaarHoeveelheid.ts';
import { renderDobbelsteenNaarCijfer } from '../../games/dobbelsteenNaarCijfer.ts';
import { renderDubbeleDobbelsteenNaarCijfer } from '../../games/dubbeleDobbelsteenNaarCijfer.ts';
import { renderVingersNaarCijfer } from '../../games/vingersNaarCijfer.ts';
import { renderReeksAanvullen } from '../../games/reeksAanvullen.ts';
import { renderOptellen } from '../../games/optellen.ts';
import { renderBussom } from '../../games/bussom.ts';
import { renderSomKeuze } from '../../games/somKeuze.ts';
import { renderSomKoppelen } from '../../games/somKoppelen.ts';
import { renderSomTypen } from '../../games/somTypen.ts';
import { renderGeldKeuze, renderGeldTypen } from '../../games/geld.ts';
import { speelSchermOvergang } from '../../three/transitions.ts';
import { TestResultScreen } from './TestResultScreen.ts';
import { RekenChapterScreen } from './RekenChapterScreen.ts';
import { maakVoortgangsbalk } from '../components/Voortgangsbalk.ts';
import { maakAudioKnop } from '../components/AudioKnop.ts';
import { naHuidigeAudio, speelAf, instructieAudioPad } from '../../engine/audioManager.ts';

export type { RekenModus };

const INSTRUCTIES: Record<RekenOefeningDefinitie['type'], string> = {
  'hoeveelheid-naar-cijfer': 'Hoeveel zie je? Kies het juiste cijfer',
  'hoeveelheid-typen': 'Hoeveel zie je? Typ het cijfer',
  'cijfer-naar-hoeveelheid': 'Welk groepje heeft er zoveel?',
  'dobbelsteen-naar-cijfer': 'Welk cijfer hoort bij de dobbelsteen?',
  'dubbele-dobbelsteen-naar-cijfer': 'Welk cijfer hoort bij de dobbelstenen?',
  'vingers-naar-cijfer': 'Welk cijfer hoort bij de vingers?',
  'reeks-aanvullen': 'Welk getal ontbreekt?',
  optellen: 'Hoeveel is dat samen?',
  bussom: 'Hoeveel mensen zitten er nu in de bus?',
  'som-keuze': 'Hoeveel is de som?',
  'som-koppelen': 'Welk getal hoort bij welke som?',
  'som-typen': 'Typ het antwoord',
  'geld-keuze': 'Hoeveel geld is dit?',
  'geld-typen': 'Hoeveel geld is dit? Typ het in',
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
    case 'hoeveelheid-typen':
      return renderHoeveelheidTypen(container, oefening, opties, afgerond);
    case 'cijfer-naar-hoeveelheid':
      return renderCijferNaarHoeveelheid(container, oefening, opties, afgerond);
    case 'dobbelsteen-naar-cijfer':
      return renderDobbelsteenNaarCijfer(container, oefening, opties, afgerond);
    case 'dubbele-dobbelsteen-naar-cijfer':
      return renderDubbeleDobbelsteenNaarCijfer(container, oefening, opties, afgerond);
    case 'vingers-naar-cijfer':
      return renderVingersNaarCijfer(container, oefening, opties, afgerond);
    case 'reeks-aanvullen':
      return renderReeksAanvullen(container, oefening, opties, afgerond);
    case 'optellen':
      return renderOptellen(container, oefening, opties, afgerond);
    case 'bussom':
      return renderBussom(container, oefening, opties, afgerond);
    case 'som-keuze':
      return renderSomKeuze(container, oefening, opties, afgerond);
    case 'som-koppelen':
      return renderSomKoppelen(container, oefening, opties, afgerond);
    case 'som-typen':
      return renderSomTypen(container, oefening, opties, afgerond);
    case 'geld-keuze':
      return renderGeldKeuze(container, oefening, opties, afgerond);
    case 'geld-typen':
      return renderGeldTypen(container, oefening, opties, afgerond);
  }
}

export function RekenOefeningScreen(
  manager: ScreenManager,
  kern: RekenKern,
  modus: RekenModus,
  onAfgerond: () => void,
  oefeningNummer: OefeningNummer = 1,
): Screen {
  const oefeningen = genereerRekenSessie(kern, modus, oefeningNummer);
  // Vastgelegd bij het starten van déze poging: "eerste keer" of "herhaling" (zie rewards.ts).
  const voortgangBijStart = haalKernVoortgang(kern.id);
  const herhaling =
    modus === 'oefenen' ? voortgangBijStart.oefeningenAf.includes(oefeningNummer) : voortgangBijStart.sterren === 3;
  const muntenPerGoed = lesMunten(modus === 'oefenen' ? MUNTEN_OEFENING_GOED : MUNTEN_TOETS_GOED, herhaling);

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
  let klaarMetDeze = false;
  // Zonder deze timer-handle liep een antwoord vlak voor "terug" nog door op het
  // volgende scherm: nieuwe vraag + instructie-audio, of bij de laatste toetsvraag zelfs
  // een sprong naar het resultaatscherm.
  let timer: number | undefined;
  let stopWachten: (() => void) | null = null;
  let actief = true;
  let onderbroken = false;
  let isAfgerond = false; // de eindbonus maar één keer, ook als een winkelbezoek volgende() opnieuw plant

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
      (juist) => afhandelenResultaat(juist),
    ).vernietig;
  }

  function afhandelenResultaat(juist: boolean): void {
    if (klaarMetDeze || !actief) return;
    klaarMetDeze = true;
    voortgangsbalk.zetVoortgang(huidigeIndex + 1);
    if (juist) {
      aantalGoed++;
      voegMuntenToe(muntenPerGoed);
      muntenDitKeer += muntenPerGoed;
    }
    stopWachten = naHuidigeAudio(volgende, 300, 4000, 900); // eerst "Goed gedaan!" laten uitpraten
  }

  function overslaan(): void {
    if (klaarMetDeze || !actief) return;
    klaarMetDeze = true;
    volgende();
  }

  function volgende(): void {
    if (!actief) return;
    stopWachten?.();
    stopWachten = null;
    opruimen?.();
    huidigeIndex++;
    if (huidigeIndex >= oefeningen.length) {
      afronden();
      return;
    }
    toonHuidige();
  }

  function afronden(): void {
    if (isAfgerond) return;
    isAfgerond = true;
    events.emit('sessie-klaar', undefined);
    if (modus === 'toets') {
      const fractie = aantalGoed / oefeningen.length;
      const sterren: 0 | 1 | 2 | 3 = fractie === 1 ? 3 : fractie >= 0.7 ? 2 : fractie >= 0.4 ? 1 : 0;
      const eind = toetsEindMunten(fractie, herhaling);
      if (eind > 0) {
        voegMuntenToe(eind);
        muntenDitKeer += eind;
      }
      markeerKernVoltooid(kern.id, sterren);
      speelSchermOvergang();
      const kernIndex = rekenKernen().findIndex((k) => k.id === kern.id);
      manager.replace((m) =>
        TestResultScreen(
          m,
          { aantalGoed, totaal: oefeningen.length, muntenVerdiend: muntenDitKeer, sterren },
          (mgr) => mgr.replace((m2) => RekenChapterScreen(m2, kernIndex)),
        ),
      );
      return;
    }
    verhoogOefenSessies(kern.id, oefeningNummer);
    onAfgerond();
    manager.pop();
    // Na de pop, zodat de muntenteller van het hoofdstukscherm de eindbonus laat oppulsen.
    voegMuntenToe(lesMunten(MUNTEN_OEFENING_SET, herhaling));
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
      actief = true;
      root.appendChild(el);
      root.appendChild(terug);
      topRechts = maakTopRechtsBalk(manager);
      root.appendChild(topRechts.element);
      // Terug van een ander scherm (bv. de winkel): unmount heeft de vraag opgeruimd, dus
      // dezelfde vraag opnieuw tonen, of door naar de volgende als hij al beantwoord was.
      if (onderbroken) {
        onderbroken = false;
        voortgangsbalk.element.appendChild(overslaanKnop);
        if (klaarMetDeze) timer = window.setTimeout(volgende, 0);
        else toonHuidige();
      }
    },
    unmount() {
      actief = false;
      onderbroken = true;
      window.clearTimeout(timer);
      stopWachten?.();
      stopWachten = null;
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
