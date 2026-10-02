import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import type { BegrijpendVerhaal } from '../../content/lezen/begrijpend.ts';
import { BEGRIJPEND_VERHALEN } from '../../content/lezen/begrijpend.ts';
import { woordenVan } from '../../content/boekjes/boekjes.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { maakTopRechtsBalk } from '../components/TopRechtsBalk.ts';
import { maakAudioKnop } from '../components/AudioKnop.ts';
import { toonGoedFeedback, toonFoutFeedback } from '../components/FeedbackOverlay.ts';
import { speelSchermOvergang } from '../../three/transitions.ts';
import { naHuidigeAudio, speelAf, woordAudioPad, instructieAudioPad } from '../../engine/audioManager.ts';
import { isOpgenomen } from '../../engine/opnames.ts';
import { voegMuntenToe, volgendeBegrijpendVraag } from '../../engine/progressStore.ts';
import { MUNTEN_BEGRIJPEND } from '../../engine/rewards.ts';
import { schud } from '../../engine/oefeningGenerator.ts';

const KAFT_KLEUREN = ['#ff7a3d', '#3dbdff', '#3ecf6e', '#b36bff', '#ff5d8f'];
const INSTRUCTIE = 'Lees het verhaal. Kies het goede antwoord.';
const INSTRUCTIE_AUDIO = instructieAudioPad('begrijpend-lezen');

export function BegrijpendKiesScreen(manager: ScreenManager): Screen {
  const el = document.createElement('div');
  el.className = 'scherm';

  const titel = document.createElement('h1');
  titel.className = 'scherm-titel';
  titel.textContent = 'Kies een verhaal';
  el.appendChild(titel);

  const kast = document.createElement('div');
  kast.className = 'boekenkast';
  el.appendChild(kast);

  BEGRIJPEND_VERHALEN.forEach((verhaal, i) => {
    const kaft = document.createElement('button');
    kaft.type = 'button';
    kaft.className = 'boekje-kaft';
    kaft.style.setProperty('--kaft', KAFT_KLEUREN[i % KAFT_KLEUREN.length]);

    const img = document.createElement('img');
    img.src = verhaal.plaatjes[0];
    img.alt = '';
    img.draggable = false;
    kaft.appendChild(img);

    const naam = document.createElement('span');
    naam.className = 'boekje-kaft__titel';
    naam.textContent = verhaal.titel;
    kaft.appendChild(naam);

    kaft.addEventListener('click', () => {
      speelSchermOvergang();
      manager.push((m) => BegrijpendVerhaalScreen(m, verhaal));
    });
    kast.appendChild(kaft);
  });

  // Alleen bereikbaar via push vanaf het onderwerpmenu.
  const terug = maakTerugKnop(() => manager.pop());
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

export function BegrijpendVerhaalScreen(manager: ScreenManager, verhaal: BegrijpendVerhaal): Screen {
  const vraag = verhaal.vragen[volgendeBegrijpendVraag(verhaal.id, verhaal.vragen.length)];
  if (!vraag) throw new Error(`geen vraag in verhaal ${verhaal.id}`);
  const el = document.createElement('div');
  el.className = 'scherm begrijpend-scherm';

  const titel = document.createElement('h1');
  titel.className = 'scherm-titel';
  titel.textContent = verhaal.titel;
  el.appendChild(titel);

  const instructieRij = document.createElement('div');
  instructieRij.className = 'instructie-rij';
  const instructie = document.createElement('p');
  instructie.className = 'instructie-tekst';
  instructie.textContent = INSTRUCTIE;
  instructieRij.append(instructie, maakAudioKnop(() => speelAf(INSTRUCTIE_AUDIO)));
  el.appendChild(instructieRij);

  const kaart = document.createElement('div');
  kaart.className = 'oefen-kaart begrijpend-kaart';

  const plaatjes = document.createElement('div');
  plaatjes.className = `begrijpend-plaatjes begrijpend-plaatjes--${verhaal.plaatjes.length}`;
  for (const src of verhaal.plaatjes) {
    const img = document.createElement('img');
    img.src = src;
    img.alt = '';
    img.draggable = false;
    plaatjes.appendChild(img);
  }
  kaart.appendChild(plaatjes);

  const tekst = document.createElement('div');
  tekst.className = 'begrijpend-verhaal';
  for (const zin of verhaal.zinnen) tekst.appendChild(maakZin(zin));
  kaart.appendChild(tekst);

  const vraagEl = document.createElement('p');
  vraagEl.className = 'begrijpend-vraag';
  vraagEl.textContent = vraag.vraag;
  kaart.appendChild(vraagEl);

  const keuzeRij = document.createElement('div');
  keuzeRij.className = 'keuze-rij';
  kaart.appendChild(keuzeRij);
  el.appendChild(kaart);

  let afgehandeld = false;
  let betaald = false;
  let stopWachten: (() => void) | null = null;
  const foutTimers: number[] = [];

  for (const optie of schud([vraag.goed, ...vraag.afleiders])) {
    const knop = document.createElement('button');
    knop.type = 'button';
    knop.className = 'keuze-knop';
    knop.textContent = optie;
    knop.addEventListener('click', () => {
      if (afgehandeld) return;
      if (optie === vraag.goed) {
        afgehandeld = true;
        knop.classList.add('goed-gekozen');
        if (!betaald) {
          betaald = true;
          voegMuntenToe(MUNTEN_BEGRIJPEND);
        }
        toonGoedFeedback();
        stopWachten = naHuidigeAudio(() => manager.pop(), 300, 4000, 900);
        return;
      }
      knop.classList.add('fout-gekozen');
      toonFoutFeedback();
      foutTimers.push(window.setTimeout(() => knop.classList.remove('fout-gekozen'), 500));
    });
    keuzeRij.appendChild(knop);
  }

  const overslaanKnop = document.createElement('button');
  overslaanKnop.type = 'button';
  overslaanKnop.className = 'overslaan-knop';
  overslaanKnop.setAttribute('aria-label', 'Overslaan');
  const overslaanTekst = document.createElement('span');
  overslaanTekst.textContent = 'Overslaan';
  const overslaanIcoon = document.createElement('img');
  overslaanIcoon.src = 'assets/icons/overslaan.svg';
  overslaanIcoon.alt = '';
  overslaanKnop.append(overslaanTekst, overslaanIcoon);
  overslaanKnop.addEventListener('click', () => {
    if (afgehandeld) return;
    afgehandeld = true;
    manager.pop();
  });

  const terug = maakTerugKnop(() => manager.terugOfAnders((m) => BegrijpendKiesScreen(m)));
  let topRechts: ReturnType<typeof maakTopRechtsBalk> | null = null;
  let instructieGespeeld = false;

  return {
    mount(root) {
      root.appendChild(el);
      root.appendChild(terug);
      root.appendChild(overslaanKnop);
      topRechts = maakTopRechtsBalk(manager);
      root.appendChild(topRechts.element);
      // Instructie mag vanzelf, het verhaal niet: het kind leest dat zelf.
      if (!instructieGespeeld) {
        instructieGespeeld = true;
        speelAf(INSTRUCTIE_AUDIO);
      }
    },
    unmount() {
      stopWachten?.();
      stopWachten = null;
      for (const timer of foutTimers) window.clearTimeout(timer);
      foutTimers.length = 0;
      for (const knop of el.querySelectorAll('.fout-gekozen')) knop.classList.remove('fout-gekozen');
      el.remove();
      terug.remove();
      overslaanKnop.remove();
      topRechts?.element.remove();
      topRechts?.vernietig();
      topRechts = null;
    },
  };
}

function maakZin(zin: string): HTMLParagraphElement {
  const regel = document.createElement('p');
  regel.className = 'begrijpend-zin';
  for (const deel of zin.split(/\s+/)) {
    const [woord] = woordenVan(deel);
    if (!woord) continue;
    const knop = document.createElement('button');
    knop.type = 'button';
    knop.className = 'begrijpend-woord';
    knop.textContent = deel;
    knop.addEventListener('click', () => {
      for (const aan of regel.parentElement?.querySelectorAll('.begrijpend-woord--aan') ?? []) {
        aan.classList.remove('begrijpend-woord--aan');
      }
      knop.classList.add('begrijpend-woord--aan');
      const pad = woordAudioPad(woord);
      if (isOpgenomen(pad)) speelAf(pad);
    });
    regel.appendChild(knop);
  }
  return regel;
}
