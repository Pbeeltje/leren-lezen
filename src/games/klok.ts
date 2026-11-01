import '../styles/klok.css';
import type { KlokTijd, RekenOefeningDefinitie } from '../content/tellen/types.ts';
import { tijdInWoorden, zelfdeKlokstand } from '../content/tellen/klok.ts';
import { toonFoutFeedback, toonGoedFeedback } from '../ui/components/FeedbackOverlay.ts';
import { schud } from '../engine/toeval.ts';

type KiesKlok = Extract<RekenOefeningDefinitie, { type: 'klok-kies-klok' }>;
type KiesTijd = Extract<RekenOefeningDefinitie, { type: 'klok-kies-tijd' }>;
type Zetten = Extract<RekenOefeningDefinitie, { type: 'klok-zetten' }>;
type Opties = { herkansingToegestaan: boolean };
type Resultaat = { vernietig: () => void };

const SVG_NS = 'http://www.w3.org/2000/svg';
// Wijzerlengtes in viewBox-eenheden (de wijzerplaat heeft straal 92).
const KLEINE_WIJZER = 46;
const GROTE_WIJZER = 74;

function svgEl<K extends keyof SVGElementTagNameMap>(naam: K, attrs: Record<string, string | number>): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG_NS, naam);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
}

interface Klok {
  svg: SVGSVGElement;
  // Hoeken in graden, 0 = naar de 12, met de klok mee.
  zetHoeken: (uurHoek: number, minuutHoek: number) => void;
  kleineWijzer: SVGLineElement;
  groteWijzer: SVGLineElement;
}

function hoekenVan(uur: number, minuut: number): [number, number] {
  return [((uur % 12) + minuut / 60) * 30, minuut * 6];
}

/** Wijzerklok met cijfers 1-12, streepjes per minuut, een korte rode en lange blauwe wijzer. */
function maakKlok(tijd: KlokTijd | null): Klok {
  const svg = svgEl('svg', { viewBox: '-100 -100 200 200', class: 'klok', role: 'img' });
  svg.appendChild(svgEl('circle', { r: 95, class: 'klok__rand' }));
  svg.appendChild(svgEl('circle', { r: 88, class: 'klok__plaat' }));
  for (let i = 0; i < 60; i++) {
    const groot = i % 5 === 0;
    const hoek = (i * 6 * Math.PI) / 180;
    const binnen = groot ? 76 : 81;
    svg.appendChild(
      svgEl('line', {
        x1: Math.sin(hoek) * binnen,
        y1: -Math.cos(hoek) * binnen,
        x2: Math.sin(hoek) * 86,
        y2: -Math.cos(hoek) * 86,
        class: groot ? 'klok__streep klok__streep--uur' : 'klok__streep',
      }),
    );
  }
  for (let n = 1; n <= 12; n++) {
    const hoek = (n * 30 * Math.PI) / 180;
    const cijfer = svgEl('text', { x: Math.sin(hoek) * 62, y: -Math.cos(hoek) * 62, class: 'klok__cijfer' });
    cijfer.textContent = String(n);
    svg.appendChild(cijfer);
  }
  const kleineWijzer = svgEl('line', { x1: 0, y1: 10, x2: 0, y2: -KLEINE_WIJZER, class: 'klok__wijzer klok__wijzer--klein' });
  const groteWijzer = svgEl('line', { x1: 0, y1: 12, x2: 0, y2: -GROTE_WIJZER, class: 'klok__wijzer klok__wijzer--groot' });
  svg.append(kleineWijzer, groteWijzer, svgEl('circle', { r: 7, class: 'klok__as' }));

  const zetHoeken = (uurHoek: number, minuutHoek: number): void => {
    kleineWijzer.setAttribute('transform', `rotate(${uurHoek})`);
    groteWijzer.setAttribute('transform', `rotate(${minuutHoek})`);
  };
  const [u, m] = tijd ? hoekenVan(tijd.uur, tijd.minuut) : [0, 0];
  zetHoeken(u, m);
  if (tijd) svg.setAttribute('aria-label', `Klok: ${tijdInWoorden(tijd)}`);
  return { svg, zetHoeken, kleineWijzer, groteWijzer };
}

/** De opgegeven tijd, altijd in woorden (`kwart over één`). Leestekst: geen geluid. */
function maakTijdOpgave(tijd: KlokTijd): HTMLElement {
  const el = document.createElement('div');
  el.className = 'klok-woorden';
  el.textContent = tijdInWoorden(tijd);
  return el;
}

// Gedeelde meerkeuze-afhandeling, zoals in geld.ts.
function koppelKeuzes<T>(
  keuzeRij: HTMLElement,
  keuzes: T[],
  maakKnop: (keuze: T) => HTMLButtonElement,
  isJuist: (keuze: T) => boolean,
  opties: Opties,
  afgerond: (juist: boolean) => void,
): void {
  let afgehandeld = false;
  for (const keuze of keuzes) {
    const knop = maakKnop(keuze);
    knop.addEventListener('click', () => {
      if (afgehandeld) return;
      if (isJuist(keuze)) {
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
}

export function renderKlokKiesKlok(container: HTMLElement, oefening: KiesKlok, opties: Opties, afgerond: (juist: boolean) => void): Resultaat {
  container.innerHTML = '';
  const kaart = document.createElement('div');
  kaart.className = 'oefen-kaart klok-kaart';
  kaart.appendChild(maakTijdOpgave(oefening.tijd));

  const keuzeRij = document.createElement('div');
  keuzeRij.className = 'keuze-rij klok-keuzes';
  kaart.appendChild(keuzeRij);

  koppelKeuzes(
    keuzeRij,
    schud([oefening.tijd, ...oefening.afleiders]),
    (tijd) => {
      const knop = document.createElement('button');
      knop.className = 'keuze-knop keuze-knop--klok';
      const klok = maakKlok(tijd);
      knop.setAttribute('aria-label', klok.svg.getAttribute('aria-label') ?? '');
      knop.appendChild(klok.svg);
      return knop;
    },
    (tijd) => zelfdeKlokstand(tijd, oefening.tijd),
    opties,
    afgerond,
  );

  container.appendChild(kaart);
  return { vernietig: () => container.replaceChildren() };
}

export function renderKlokKiesTijd(container: HTMLElement, oefening: KiesTijd, opties: Opties, afgerond: (juist: boolean) => void): Resultaat {
  container.innerHTML = '';
  const kaart = document.createElement('div');
  kaart.className = 'oefen-kaart klok-kaart';
  kaart.appendChild(maakKlok(oefening.tijd).svg);

  const keuzeRij = document.createElement('div');
  keuzeRij.className = 'keuze-rij klok-tijd-keuzes';
  kaart.appendChild(keuzeRij);

  koppelKeuzes(
    keuzeRij,
    schud([oefening.tijd, ...oefening.afleiders]),
    (tijd) => {
      const knop = document.createElement('button');
      knop.className = 'keuze-knop klok-tijd-knop';
      knop.textContent = tijdInWoorden(tijd);
      return knop;
    },
    (tijd) => zelfdeKlokstand(tijd, oefening.tijd),
    opties,
    afgerond,
  );

  container.appendChild(kaart);
  return { vernietig: () => container.replaceChildren() };
}

// Hoek van een punt t.o.v. het midden: 0 = boven, met de klok mee, 0-360.
function hoekNaarPunt(x: number, y: number): number {
  return ((Math.atan2(x, -y) * 180) / Math.PI + 360) % 360;
}

function hoekVerschil(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

/**
 * Zelf de wijzers zetten. De grote wijzer springt per 5 minuten. De kleine wijzer kiest
 * een uur, en schuift net als op een echte klok mee met de minuten: bij half twee staat
 * hij dus tussen de 1 en de 2. Waar je hem neerlegt wordt het dichtstbijzijnde uur bij die
 * stand, dus "op de 2" bij kwart voor twee geeft gewoon 1:45.
 */
export function renderKlokZetten(container: HTMLElement, oefening: Zetten, opties: Opties, afgerond: (juist: boolean) => void): Resultaat {
  container.innerHTML = '';
  const kaart = document.createElement('div');
  kaart.className = 'oefen-kaart klok-kaart';

  // De klok eerst: liggend staat hij dan links (algemene oefenkaart-grid in screens.css), staand zet de CSS de
  // opgave er met `order` boven.
  const klok = maakKlok({ uur: 12, minuut: 0 });
  klok.svg.classList.add('klok--zetten');
  klok.svg.setAttribute('aria-label', 'Klok om zelf te zetten');
  kaart.appendChild(klok.svg);
  kaart.appendChild(maakTijdOpgave(oefening.tijd));

  const knop = document.createElement('button');
  knop.className = 'typen-knop';
  knop.textContent = 'Controleer';
  kaart.appendChild(knop);

  let uur = 0; // 0-11
  let minuut = 0; // 0-55, per 5
  let gepakt: 'klein' | 'groot' | null = null;
  let afgehandeld = false;

  const teken = (): void => {
    const [u, m] = hoekenVan(uur, minuut);
    klok.zetHoeken(u, m);
  };

  const plaats = (welke: 'klein' | 'groot', hoek: number): void => {
    if (welke === 'groot') minuut = (Math.round(hoek / 30) * 5) % 60;
    else uur = ((Math.round(hoek / 30 - minuut / 60) % 12) + 12) % 12;
    teken();
  };

  const puntIn = (event: PointerEvent): { x: number; y: number } => {
    const rect = klok.svg.getBoundingClientRect();
    const schaal = 200 / rect.width;
    return {
      x: (event.clientX - (rect.left + rect.width / 2)) * schaal,
      y: (event.clientY - (rect.top + rect.height / 2)) * schaal,
    };
  };

  const onDown = (event: PointerEvent): void => {
    if (afgehandeld) return;
    const { x, y } = puntIn(event);
    const hoek = hoekNaarPunt(x, y);
    const afstand = Math.hypot(x, y);
    const [uurHoek, minuutHoek] = hoekenVan(uur, minuut);
    const bijKlein = hoekVerschil(hoek, uurHoek) < 25;
    const bijGroot = hoekVerschil(hoek, minuutHoek) < 25;
    // Wijst je vinger naar één wijzer, dan die; anders (allebei of geen van beide) beslist
    // de afstand tot het midden: binnenin de kleine, verder naar buiten de grote.
    if (bijKlein !== bijGroot) gepakt = bijKlein ? 'klein' : 'groot';
    else gepakt = afstand < 52 ? 'klein' : 'groot';
    klok.svg.classList.toggle('klok--pak-klein', gepakt === 'klein');
    klok.svg.classList.toggle('klok--pak-groot', gepakt === 'groot');
    klok.svg.setPointerCapture(event.pointerId);
    plaats(gepakt, hoek);
    event.preventDefault();
  };

  const onMove = (event: PointerEvent): void => {
    if (!gepakt) return;
    const { x, y } = puntIn(event);
    plaats(gepakt, hoekNaarPunt(x, y));
  };

  const onUp = (): void => {
    gepakt = null;
    klok.svg.classList.remove('klok--pak-klein', 'klok--pak-groot');
  };

  klok.svg.addEventListener('pointerdown', onDown);
  klok.svg.addEventListener('pointermove', onMove);
  klok.svg.addEventListener('pointerup', onUp);
  klok.svg.addEventListener('pointercancel', onUp);

  knop.addEventListener('click', () => {
    if (afgehandeld) return;
    const juist = zelfdeKlokstand({ uur, minuut: minuut as KlokTijd['minuut'] }, oefening.tijd);
    if (juist) {
      afgehandeld = true;
      klok.svg.classList.add('goed-gekozen');
      toonGoedFeedback();
      afgerond(true);
      return;
    }
    klok.svg.classList.add('fout-gekozen');
    toonFoutFeedback();
    if (opties.herkansingToegestaan) {
      // De wijzers blijven staan, zodat het kind alleen hoeft te verbeteren wat fout is.
      setTimeout(() => klok.svg.classList.remove('fout-gekozen'), 500);
    } else {
      afgehandeld = true;
      afgerond(false);
    }
  });

  container.appendChild(kaart);
  return { vernietig: () => container.replaceChildren() };
}
