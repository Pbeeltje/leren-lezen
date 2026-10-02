import type { RekenOefeningDefinitie } from '../content/tellen/types.ts';
import { schrijfBedrag } from '../content/tellen/som.ts';
import { toonFoutFeedback, toonGoedFeedback } from '../ui/components/FeedbackOverlay.ts';
import { koppelSchermToetsenbord } from '../ui/components/SchermToetsenbord.ts';

type Keuze = Extract<RekenOefeningDefinitie, { type: 'geld-keuze' }>;
type Typen = Extract<RekenOefeningDefinitie, { type: 'geld-typen' }>;
type Stukken = { munten: number[]; briefjes?: number[] };

function schudArray<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

function muntKlasse(cent: number): string {
  if (cent >= 100) return 'geld-munt geld-munt--groot';
  if (cent <= 5) return 'geld-munt geld-munt--klein';
  return 'geld-munt';
}

function maakBak(stukken: Stukken): HTMLElement {
  const bak = document.createElement('div');
  bak.className = 'geld-bak';
  for (const brief of stukken.briefjes ?? []) {
    const img = document.createElement('img');
    img.className = 'geld-brief';
    img.src = `assets/images/geld/brief-${brief}.svg`;
    img.alt = `${brief} euro`;
    bak.appendChild(img);
  }
  for (const munt of stukken.munten) {
    const img = document.createElement('img');
    img.className = muntKlasse(munt);
    img.src = `assets/images/geld/munt-${munt}.svg`;
    img.alt = munt >= 100 ? `${munt / 100} euro` : `${munt} cent`;
    bak.appendChild(img);
  }
  return bak;
}

export function renderGeldKeuze(
  container: HTMLElement,
  oefening: Keuze,
  opties: { herkansingToegestaan: boolean },
  afgerond: (juist: boolean) => void,
): { vernietig: () => void } {
  container.innerHTML = '';

  const kaart = document.createElement('div');
  kaart.className = 'oefen-kaart';
  kaart.appendChild(maakBak(oefening));

  const keuzeRij = document.createElement('div');
  keuzeRij.className = 'keuze-rij';
  kaart.appendChild(keuzeRij);

  const keuzes = schudArray([oefening.antwoordCent, ...oefening.afleidersCent]);
  let afgehandeld = false;

  for (const cent of keuzes) {
    const knop = document.createElement('button');
    knop.className = 'keuze-knop geld-bedrag';
    knop.textContent = schrijfBedrag(cent);
    knop.addEventListener('click', () => {
      if (afgehandeld) return;
      const juist = cent === oefening.antwoordCent;
      if (juist) {
        afgehandeld = true;
        knop.classList.add('goed-gekozen');
        toonGoedFeedback();
        afgerond(true);
        return;
      }
      knop.classList.add('fout-gekozen');
      toonFoutFeedback();
      if (opties.herkansingToegestaan) {
        setTimeout(() => knop.classList.remove('fout-gekozen'), 500);
      } else {
        afgehandeld = true;
        afgerond(false);
      }
    });
    keuzeRij.appendChild(knop);
  }

  container.appendChild(kaart);
  return { vernietig: () => container.replaceChildren() };
}

function bewaakVeld(
  invoer: HTMLInputElement,
  standaard: string,
  maxCijfers: number,
): { reset: () => void; onaangeroerd: () => boolean } {
  let vers = true;
  invoer.value = standaard;
  invoer.addEventListener('input', () => {
    if (vers) {
      if (invoer.value.length > standaard.length) {
        vers = false;
        invoer.value = invoer.value.slice(standaard.length).replace(/\D/g, '').slice(0, maxCijfers);
        if (invoer.value === '') {
          vers = true;
          invoer.value = standaard;
        }
      } else {
        invoer.value = standaard;
      }
      return;
    }
    const cijfers = invoer.value.replace(/\D/g, '').slice(0, maxCijfers);
    if (cijfers === '') {
      vers = true;
      invoer.value = standaard;
      return;
    }
    invoer.value = cijfers;
  });
  return {
    reset() {
      vers = true;
      invoer.value = standaard;
    },
    onaangeroerd: () => vers,
  };
}

export function renderGeldTypen(
  container: HTMLElement,
  oefening: Typen,
  opties: { herkansingToegestaan: boolean },
  afgerond: (juist: boolean) => void,
): { vernietig: () => void } {
  container.innerHTML = '';

  const kaart = document.createElement('div');
  kaart.className = 'oefen-kaart';
  kaart.appendChild(maakBak(oefening));

  const velden = document.createElement('div');
  velden.className = 'geld-velden';

  const euroLabel = document.createElement('label');
  euroLabel.className = 'geld-veld';
  const euroInvoer = document.createElement('input');
  euroInvoer.type = 'text';
  euroInvoer.inputMode = 'numeric';
  euroInvoer.autocomplete = 'off';
  euroInvoer.className = 'typen-invoer som-invoer geld-euro';
  euroInvoer.setAttribute('aria-label', 'euro');
  const euroWoord = document.createElement('span');
  euroWoord.className = 'geld-label';
  euroWoord.textContent = 'euro';
  euroLabel.append(euroInvoer, euroWoord);

  const centLabel = document.createElement('label');
  centLabel.className = 'geld-veld';
  const centInvoer = document.createElement('input');
  centInvoer.type = 'text';
  centInvoer.inputMode = 'numeric';
  centInvoer.autocomplete = 'off';
  centInvoer.className = 'typen-invoer som-invoer geld-cent';
  centInvoer.setAttribute('aria-label', 'cent');
  const centWoord = document.createElement('span');
  centWoord.className = 'geld-label';
  centWoord.textContent = 'cent';
  centLabel.append(centInvoer, centWoord);

  velden.append(euroLabel, centLabel);
  kaart.appendChild(velden);

  const euroVeld = bewaakVeld(euroInvoer, '0', 2);
  const centVeld = bewaakVeld(centInvoer, '00', 2);

  const knop = document.createElement('button');
  knop.className = 'typen-knop';
  knop.textContent = 'Controleer';
  kaart.appendChild(knop);

  const euroBord = koppelSchermToetsenbord(euroInvoer, 'cijfers', velden);
  const centBord = koppelSchermToetsenbord(centInvoer, 'cijfers', velden);
  const toonBord = (welke: 'euro' | 'cent'): void => {
    euroBord?.toggleAttribute('hidden', welke !== 'euro');
    centBord?.toggleAttribute('hidden', welke !== 'cent');
  };
  euroInvoer.addEventListener('focus', () => toonBord('euro'));
  centInvoer.addEventListener('focus', () => toonBord('cent'));
  toonBord('euro');

  let afgehandeld = false;

  function controleer(): void {
    if (afgehandeld) return;
    if (euroVeld.onaangeroerd() && centVeld.onaangeroerd()) return;
    const euro = Number(euroInvoer.value);
    const cent = Number(centInvoer.value);
    if (!Number.isInteger(euro) || !Number.isInteger(cent)) return;
    const juist = euro * 100 + cent === oefening.antwoordCent;

    if (juist) {
      afgehandeld = true;
      euroInvoer.classList.add('goed-gekozen');
      centInvoer.classList.add('goed-gekozen');
      toonGoedFeedback();
      afgerond(true);
      return;
    }

    euroInvoer.classList.add('fout-gekozen');
    centInvoer.classList.add('fout-gekozen');
    toonFoutFeedback();
    if (opties.herkansingToegestaan) {
      setTimeout(() => {
        euroInvoer.classList.remove('fout-gekozen');
        centInvoer.classList.remove('fout-gekozen');
        euroVeld.reset();
        centVeld.reset();
        euroInvoer.focus();
        toonBord('euro');
      }, 500);
    } else {
      afgehandeld = true;
      afgerond(false);
    }
  }

  knop.addEventListener('click', controleer);
  for (const invoer of [euroInvoer, centInvoer]) {
    invoer.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') controleer();
    });
  }

  container.appendChild(kaart);
  euroInvoer.focus();
  return { vernietig: () => container.replaceChildren() };
}
