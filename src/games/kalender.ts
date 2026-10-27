import '../styles/kalender.css';
import type { RekenOefeningDefinitie } from '../content/tellen/types.ts';
import { toonFoutFeedback, toonGoedFeedback } from '../ui/components/FeedbackOverlay.ts';
import { schud } from '../engine/toeval.ts';

// Dagen van de week en maanden van het jaar (Tijd lezen). De namen zijn leestekst: geen
// audio, in het leeslettertype.

type Invullen = Extract<RekenOefeningDefinitie, { type: 'dag-invullen' | 'maand-invullen' }>;
type Volgorde = Extract<RekenOefeningDefinitie, { type: 'dag-volgorde' | 'maand-volgorde' }>;
type VoorNa = Extract<RekenOefeningDefinitie, { type: 'dag-voor-na' | 'maand-voor-na' }>;
type Opties = { herkansingToegestaan: boolean };
type Resultaat = { vernietig: () => void };

function maakKaart(): HTMLDivElement {
  const kaart = document.createElement('div');
  kaart.className = 'oefen-kaart kalender-kaart';
  return kaart;
}

/** Een vakje in het rijtje: een naam, of leeg met een vraagteken. */
function maakVakje(naam: string | null): HTMLDivElement {
  const vakje = document.createElement('div');
  vakje.className = naam ? 'kalender-vakje' : 'kalender-vakje kalender-vakje--leeg';
  vakje.textContent = naam ?? '?';
  return vakje;
}

function vulVakje(vakje: HTMLElement, naam: string): void {
  vakje.textContent = naam;
  vakje.classList.remove('kalender-vakje--leeg');
  vakje.classList.add('kalender-vakje--goed');
}

/** Meerkeuzeknoppen; `bijGoed` vult het gat in voordat de oefening klaar is. */
function maakKeuzes(
  kaart: HTMLElement,
  antwoord: string,
  afleiders: string[],
  opties: Opties,
  bijGoed: () => void,
  afgerond: (juist: boolean) => void,
): void {
  const keuzeRij = document.createElement('div');
  keuzeRij.className = 'keuze-rij';
  kaart.appendChild(keuzeRij);
  let afgehandeld = false;
  for (const naam of schud([antwoord, ...afleiders])) {
    const knop = document.createElement('button');
    knop.className = 'keuze-knop kalender-knop';
    knop.textContent = naam;
    knop.addEventListener('click', () => {
      if (afgehandeld) return;
      if (naam === antwoord) {
        afgehandeld = true;
        knop.classList.add('goed-gekozen');
        bijGoed();
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
}

/** maandag ... woensdag: welke ontbreekt? */
export function renderKalenderInvullen(
  container: HTMLElement,
  oefening: Invullen,
  opties: Opties,
  afgerond: (juist: boolean) => void,
): Resultaat {
  container.innerHTML = '';
  const kaart = maakKaart();
  const rij = document.createElement('div');
  rij.className = 'kalender-rij';
  const vakjes = oefening.rij.map((naam, i) => maakVakje(i === oefening.gat ? null : naam));
  rij.append(...vakjes);
  kaart.appendChild(rij);

  const antwoord = oefening.rij[oefening.gat];
  maakKeuzes(kaart, antwoord, oefening.afleiders, opties, () => vulVakje(vakjes[oefening.gat], antwoord), afgerond);
  container.appendChild(kaart);
  return { vernietig: () => container.replaceChildren() };
}

/** Welke dag komt na dinsdag? Met het rijtje "dinsdag ?" erbij als steuntje. */
export function renderKalenderVoorNa(
  container: HTMLElement,
  oefening: VoorNa,
  opties: Opties,
  afgerond: (juist: boolean) => void,
): Resultaat {
  container.innerHTML = '';
  const kaart = maakKaart();

  const vraag = document.createElement('p');
  vraag.className = 'kalender-vraag';
  const woord = oefening.type === 'dag-voor-na' ? 'dag' : 'maand';
  const richting = document.createElement('strong');
  richting.textContent = oefening.richting;
  vraag.append(`Welke ${woord} komt `, richting, ` ${oefening.naam}?`);
  kaart.appendChild(vraag);

  const rij = document.createElement('div');
  rij.className = 'kalender-rij';
  const gegeven = maakVakje(oefening.naam);
  const gat = maakVakje(null);
  rij.append(...(oefening.richting === 'na' ? [gegeven, gat] : [gat, gegeven]));
  kaart.appendChild(rij);

  maakKeuzes(kaart, oefening.antwoord, oefening.afleiders, opties, () => vulVakje(gat, oefening.antwoord), afgerond);
  container.appendChild(kaart);
  return { vernietig: () => container.replaceChildren() };
}

/** Rijtje door elkaar: tik ze op volgorde, elk goed gekozen woord schuift in het volgende vakje. */
export function renderKalenderVolgorde(
  container: HTMLElement,
  oefening: Volgorde,
  opties: Opties,
  afgerond: (juist: boolean) => void,
): Resultaat {
  container.innerHTML = '';
  const kaart = maakKaart();

  const rij = document.createElement('div');
  rij.className = 'kalender-rij kalender-rij--volgorde';
  const vakjes = oefening.rij.map(() => maakVakje(null));
  vakjes.forEach((vakje, i) => (vakje.textContent = String(i + 1)));
  rij.append(...vakjes);
  kaart.appendChild(rij);

  const keuzeRij = document.createElement('div');
  keuzeRij.className = 'keuze-rij';
  kaart.appendChild(keuzeRij);

  // Nooit al in de goede volgorde beginnen.
  let geschud = schud(oefening.rij);
  while (geschud.every((naam, i) => naam === oefening.rij[i])) geschud = schud(oefening.rij);

  let volgende = 0;
  let afgehandeld = false;
  for (const naam of geschud) {
    const knop = document.createElement('button');
    knop.className = 'keuze-knop kalender-knop';
    knop.textContent = naam;
    knop.addEventListener('click', () => {
      if (afgehandeld) return;
      if (naam === oefening.rij[volgende]) {
        vulVakje(vakjes[volgende], naam);
        knop.classList.add('kalender-knop--weg');
        knop.disabled = true;
        volgende++;
        if (volgende === oefening.rij.length) {
          afgehandeld = true;
          toonGoedFeedback();
          afgerond(true);
        }
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
