import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import type { Woord } from '../../content/types.ts';
import type { SchrijfHoofdstuk } from '../../content/schrijven/hoofdstukken.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { maakTopRechtsBalk } from '../components/TopRechtsBalk.ts';
import { maakAudioKnop } from '../components/AudioKnop.ts';
import { maakVoortgangsbalk } from '../components/Voortgangsbalk.ts';
import { maakSterBalk } from '../components/ProgressStars.ts';
import { instructieAudioPad, naHuidigeAudio, speelAf, woordAudioPad } from '../../engine/audioManager.ts';
import { isOpgenomen } from '../../engine/opnames.ts';
import { haalKernVoortgang, markeerKernGestart, markeerKernVoltooid, voegMuntenToe } from '../../engine/progressStore.ts';
import { MUNTEN_TOETS_GOED, MUNTEN_TOETS_VOLDOENDE, lesMunten } from '../../engine/rewards.ts';
import { events } from '../../engine/events.ts';
import { confetti } from '../../three/particles.ts';
import { DICTEE_LENGTE, kiesWoorden, maakNakijkKaart, maakSchrijfKaart, toonSchrift, type Schrift, type Schrijfblok } from '../../games/schrijven/dictee.ts';

type Fase = 'schrijven' | 'nakijken' | 'overzicht';

const INSTRUCTIE: Record<Fase, { tekst: string; audio: string }> = {
  schrijven: { tekst: 'Schrijf het woord dat je hoort', audio: 'dictee-schrijf' },
  nakijken: { tekst: 'Kijk je werk na. Is het goed?', audio: 'dictee-nakijken' },
  overzicht: { tekst: 'Je dictee is klaar!', audio: 'dictee-klaar' },
};

// Alleen afspelen wat is ingesproken (de dictee-zinnen kunnen nog ontbreken).
function speelInstructie(fase: Fase): void {
  const pad = instructieAudioPad(INSTRUCTIE[fase].audio);
  if (isOpgenomen(pad)) speelAf(pad);
}

// Sterren uit wat het kind zelf goed rekende: alles goed 3, één fout 2, 80% 1.
// Voldoende (de toets gehaald) is dus 8 van de 10.
function sterrenVoor(goed: number, totaal: number): 0 | 1 | 2 | 3 {
  if (goed === totaal) return 3;
  const fractie = goed / totaal;
  return fractie >= 0.9 ? 2 : fractie >= 0.8 ? 1 : 0;
}

// Dictee, de toets van een schrijfhoofdstuk (groep 3): tien woorden horen en zelf
// opschrijven, daarna zelf nakijken (geschreven woord naast het goede woord: goed of
// fout) en een overzicht. Geen handschriftherkenning. Munten krijg je voor het schrijven
// en het afmaken, niet voor wat je goed rekent: anders loont het om alles goed te keuren.
export function DicteeScreen(manager: ScreenManager, hoofdstuk: SchrijfHoofdstuk): Screen {
  markeerKernGestart(hoofdstuk.id);
  const el = document.createElement('div');
  el.className = 'scherm dictee';

  const titel = document.createElement('h1');
  titel.className = 'scherm-titel';
  titel.textContent = 'Dictee';
  el.appendChild(titel);

  const instructieRij = document.createElement('div');
  instructieRij.className = 'instructie-rij';
  el.appendChild(instructieRij);
  const instructie = document.createElement('p');
  instructie.className = 'instructie-tekst';
  instructieRij.appendChild(instructie);
  // Bij het schrijven herhaalt de knop het woord, daarna de instructie.
  instructieRij.appendChild(
    maakAudioKnop(() => (fase === 'schrijven' ? speelAf(woordAudioPad(woorden[index].woord)) : speelInstructie(fase))),
  );

  const voortgangsbalk = maakVoortgangsbalk(Math.min(DICTEE_LENGTE, hoofdstuk.dicteeWoorden.length));
  el.appendChild(voortgangsbalk.element);

  const container = document.createElement('div');
  container.className = 'dictee-vak';
  el.appendChild(container);

  let woorden: Woord[] = [];
  let antwoorden: Schrift[] = [];
  let oordelen: boolean[] = [];
  let fase: Fase = 'schrijven';
  let index = 0;
  let verdiend = 0;
  let herhaling = false;
  let blok: Schrijfblok | null = null;
  let stopWachten: (() => void) | null = null;

  function zetFase(nieuw: Fase): void {
    fase = nieuw;
    instructie.textContent = INSTRUCTIE[nieuw].tekst;
    voortgangsbalk.element.style.display = nieuw === 'overzicht' ? 'none' : '';
  }

  function begin(): void {
    woorden = kiesWoorden(hoofdstuk.dicteeWoorden);
    antwoorden = [];
    oordelen = [];
    index = 0;
    verdiend = 0;
    // Al eens gehaald: de helft van de munten, zoals bij een herhaalde toets.
    herhaling = haalKernVoortgang(hoofdstuk.id).sterren > 0;
    zetFase('schrijven');
    toonSchrijfvraag();
    // Eerst de opdracht, dan het eerste woord.
    speelInstructie('schrijven');
    stopWachten = naHuidigeAudio(speelWoord, 300);
  }

  function speelWoord(): void {
    stopWachten = null;
    if (fase === 'schrijven') speelAf(woordAudioPad(woorden[index].woord));
  }

  function toonSchrijfvraag(): void {
    container.innerHTML = '';
    voortgangsbalk.zetVoortgang(index);
    const kaart = maakSchrijfKaart(woorden[index], false, (schrift) => {
      antwoorden[index] = schrift;
      const munten = lesMunten(MUNTEN_TOETS_GOED, herhaling);
      voegMuntenToe(munten);
      verdiend += munten;
      index++;
      if (index < woorden.length) {
        toonSchrijfvraag();
        speelWoord();
      } else {
        blok = null;
        index = 0;
        zetFase('nakijken');
        toonNakijkvraag();
        speelInstructie('nakijken');
      }
    });
    blok = kaart.blok;
    container.appendChild(kaart.element);
  }

  function toonNakijkvraag(): void {
    container.innerHTML = '';
    voortgangsbalk.zetVoortgang(index);
    container.appendChild(
      maakNakijkKaart(woorden[index], antwoorden[index], (goed) => {
        oordelen[index] = goed;
        index++;
        if (index < woorden.length) toonNakijkvraag();
        else toonOverzicht();
      }),
    );
  }

  function toonOverzicht(): void {
    zetFase('overzicht');
    container.innerHTML = '';
    const eind = lesMunten(MUNTEN_TOETS_VOLDOENDE, herhaling);
    voegMuntenToe(eind);
    verdiend += eind;
    const aantalGoed = oordelen.filter(Boolean).length;
    const sterren = sterrenVoor(aantalGoed, woorden.length);
    markeerKernVoltooid(hoofdstuk.id, sterren);

    const kaart = document.createElement('div');
    kaart.className = 'oefen-kaart dictee-overzicht';
    const score = document.createElement('h2');
    score.className = 'dictee-score';
    score.textContent = `${aantalGoed} van de ${woorden.length} goed`;
    kaart.append(score, maakSterBalk(sterren));

    const lijst = document.createElement('ol');
    lijst.className = 'dictee-lijst';
    woorden.forEach((w, i) => {
      const rij = document.createElement('li');
      rij.className = `dictee-rij dictee-rij--${oordelen[i] ? 'goed' : 'fout'}`;
      const img = document.createElement('img');
      img.className = 'dictee-rij__plaatje';
      img.src = w.afbeeldingPad;
      img.alt = '';
      const woord = document.createElement('span');
      woord.className = 'oefen-kaart__woord dictee-rij__woord';
      woord.textContent = w.woord;
      const teken = document.createElement('span');
      teken.className = 'dictee-rij__teken';
      teken.textContent = oordelen[i] ? '✓' : '✗';
      rij.append(img, toonSchrift(antwoorden[i], 'dictee-rij__schrift'), woord, teken);
      lijst.appendChild(rij);
    });
    kaart.appendChild(lijst);

    const munten = document.createElement('div');
    munten.className = 'resultaat-munten-rij';
    const munt = document.createElement('img');
    munt.src = 'assets/icons/munt.svg';
    munt.alt = '';
    const muntTekst = document.createElement('span');
    muntTekst.textContent = `+${verdiend} munten`;
    munten.append(munt, muntTekst);
    kaart.appendChild(munten);

    const knoppen = document.createElement('div');
    knoppen.className = 'dictee-eind-knoppen';
    const opnieuw = document.createElement('button');
    opnieuw.className = 'typen-knop';
    opnieuw.textContent = 'Nog een keer';
    opnieuw.addEventListener('click', begin);
    const huis = document.createElement('button');
    huis.className = 'klaar-kaart__knop';
    huis.setAttribute('aria-label', 'Klaar, terug');
    const huisIcoon = document.createElement('img');
    huisIcoon.src = 'assets/icons/huis.svg';
    huisIcoon.alt = '';
    huis.appendChild(huisIcoon);
    huis.addEventListener('click', () => manager.pop());
    knoppen.append(opnieuw, huis);
    kaart.appendChild(knoppen);

    container.appendChild(kaart);
    el.scrollTop = 0;
    if (sterren > 0) confetti.vuurwerk(sterren === 3 ? 'groot' : 'klein');
    events.emit('sessie-klaar', undefined);
    speelInstructie('overzicht');
  }

  begin();

  const terug = maakTerugKnop(() => manager.pop());
  let topRechts: ReturnType<typeof maakTopRechtsBalk> | null = null;
  let onderbroken = false;

  return {
    kindslot: true,
    mount(root) {
      root.appendChild(el);
      root.appendChild(terug);
      topRechts = maakTopRechtsBalk(manager);
      root.appendChild(topRechts.element);
      // Terug uit de winkel: het blad en wat er al geschreven is blijven staan (zoals
      // Geheugen), alleen het woord nog een keer laten horen.
      if (onderbroken) {
        onderbroken = false;
        speelWoord();
      }
    },
    unmount() {
      onderbroken = true;
      stopWachten?.();
      stopWachten = null;
      blok?.laatLos();
      el.remove();
      terug.remove();
      topRechts?.element.remove();
      topRechts?.vernietig();
      topRechts = null;
    },
  };
}
