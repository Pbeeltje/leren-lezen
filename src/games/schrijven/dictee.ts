import type { Woord } from '../../content/types.ts';
import type { Punt } from '../../content/schrijven/letters.ts';
import { LIJN_BOVEN, LIJN_ONDER, LIJN_X } from '../../content/schrijven/letters.ts';
import { schud } from '../../engine/toeval.ts';

// Schrijven zonder voorbeeld om over te trekken: het schrijfblok (dictee, overschrijven,
// luisteren en schrijven) en het schrift klein terugtonen bij het nakijken. Geen
// handschriftherkenning: het kind kijkt zelf na.

export const DICTEE_LENGTE = 10;

// Hoogstens `aantal` woorden in willekeurige volgorde, met verschillende plaatjes
// (sommige woorden delen er een).
export function kiesWoorden(woorden: Woord[], aantal = DICTEE_LENGTE): Woord[] {
  const plaatjes = new Set<string>();
  const gekozen: Woord[] = [];
  for (const w of schud(woorden)) {
    if (gekozen.length >= aantal) break;
    if (plaatjes.has(w.afbeeldingPad)) continue;
    plaatjes.add(w.afbeeldingPad);
    gekozen.push(w);
  }
  return gekozen;
}

// ---------- Schrift: wat het kind schreef, als lijnen in een vast vlak ----------

export type Schrift = Punt[][];

// Zelfde hoogte en lijnen als de letters bij overtrekken (bovenlijn 10, x-hoogte 40,
// grondlijn 80), net breed genoeg voor een woord van zes letters in kinderhandschrift.
const VIEWBOX: [number, number, number, number] = [0, 0, 280, 116];
const MIN_STAP = 1.5;

const NS = 'http://www.w3.org/2000/svg';
function svgEl<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>): SVGElementTagNameMap[K] {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
}

const pad = (punten: Punt[]): string => punten.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');

function haalElement(haal: Punt[]): SVGElement {
  if (haal.length === 1) return svgEl('circle', { cx: haal[0][0], cy: haal[0][1], r: 2.6, class: 'dictee-inkt-stip' });
  return svgEl('path', { d: pad(haal), class: 'dictee-inkt' });
}

function schriftVlak(klasse: string): SVGSVGElement {
  const svg = svgEl('svg', { viewBox: VIEWBOX.join(' '), class: klasse });
  const [vx, , vb] = VIEWBOX;
  for (const [y, stippel] of [[LIJN_BOVEN, true], [LIJN_X, true], [LIJN_ONDER, false]] as const) {
    svg.appendChild(svgEl('line', { x1: vx, x2: vx + vb, y1: y, y2: y, class: stippel ? 'overtrek__hulplijn' : 'overtrek__schrijflijn' }));
  }
  return svg;
}

// Alleen kijken: het schrift van het kind klein terug bij nakijken en in het overzicht.
export function toonSchrift(schrift: Schrift, klasse = ''): SVGSVGElement {
  const svg = schriftVlak(`dictee-schrift ${klasse}`.trim());
  for (const haal of schrift) svg.appendChild(haalElement(haal));
  return svg;
}

export interface Schrijfblok {
  element: SVGSVGElement;
  schrift: () => Schrift;
  wis: () => void;
  // Een vinger die nog op het scherm lag toen het scherm wegging (winkel) loslaten.
  laatLos: () => void;
}

// Vrij schrijven met de vinger (of muis/pen). Eén vinger tegelijk, zodat een hand die op
// het scherm rust geen strepen trekt. `bijWijziging` meldt of er iets op staat.
export function maakSchrijfblok(bijWijziging: (leeg: boolean) => void): Schrijfblok {
  const svg = schriftVlak('dictee-blok');
  const halen: Schrift = [];
  let actief: { id: number; haal: Punt[]; el: SVGElement } | null = null;

  function punt(e: PointerEvent): Punt {
    const m = svg.getScreenCTM();
    if (!m) return [0, 0];
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    const [vx, vy, vb, vh] = VIEWBOX;
    return [Math.min(vx + vb, Math.max(vx, p.x)), Math.min(vy + vh, Math.max(vy, p.y))];
  }

  function teken(): void {
    if (!actief) return;
    const nieuw = haalElement(actief.haal);
    actief.el.replaceWith(nieuw);
    actief.el = nieuw;
  }

  svg.addEventListener('pointerdown', (e) => {
    if (actief) return;
    e.preventDefault();
    svg.setPointerCapture(e.pointerId);
    const haal: Punt[] = [punt(e)];
    halen.push(haal);
    const el = haalElement(haal);
    svg.appendChild(el);
    actief = { id: e.pointerId, haal, el };
    bijWijziging(false);
  });

  svg.addEventListener('pointermove', (e) => {
    if (!actief || e.pointerId !== actief.id) return;
    const events = e.getCoalescedEvents?.() ?? [e];
    let veranderd = false;
    for (const ev of events.length ? events : [e]) {
      const p = punt(ev);
      const vorige = actief.haal[actief.haal.length - 1];
      if (Math.hypot(p[0] - vorige[0], p[1] - vorige[1]) < MIN_STAP) continue;
      actief.haal.push(p);
      veranderd = true;
    }
    if (veranderd) teken();
  });

  const stop = (e: PointerEvent) => {
    if (actief && e.pointerId === actief.id) actief = null;
  };
  svg.addEventListener('pointerup', stop);
  svg.addEventListener('pointercancel', stop);

  return {
    element: svg,
    schrift: () => halen.map((h) => h.map(([x, y]): Punt => [Math.round(x * 10) / 10, Math.round(y * 10) / 10])),
    wis() {
      actief = null;
      halen.length = 0;
      svg.querySelectorAll('.dictee-inkt, .dictee-inkt-stip').forEach((el) => el.remove());
      bijWijziging(true);
    },
    laatLos() {
      actief = null;
    },
  };
}

// ---------- Kaarten: schrijven, en daarna je eigen werk nakijken ----------

function knop(klasse: string, tekst: string, icoon?: string): HTMLButtonElement {
  const k = document.createElement('button');
  k.className = klasse;
  if (icoon) {
    const img = document.createElement('img');
    img.src = icoon;
    img.alt = '';
    k.appendChild(img);
  }
  if (tekst) {
    const s = document.createElement('span');
    s.textContent = tekst;
    k.appendChild(s);
  }
  return k;
}

function plaatje(w: Woord): HTMLImageElement {
  const img = document.createElement('img');
  img.className = 'oefen-kaart__plaatje dictee-plaatje';
  img.src = w.afbeeldingPad;
  img.alt = '';
  img.draggable = false;
  return img;
}

function oordeelTeken(d: string): SVGSVGElement {
  const svg = svgEl('svg', { viewBox: '0 0 32 32', class: 'dictee-oordeel__teken', 'aria-hidden': 'true' });
  svg.appendChild(svgEl('path', { d }));
  return svg;
}

function woordTekst(w: Woord): HTMLElement {
  const s = document.createElement('span');
  s.className = 'oefen-kaart__woord dictee-woord';
  s.textContent = w.woord;
  return s;
}

// Plaatje links (liggend) of boven, rechts het schrijfblok met Gum en Klaar. Met
// `metVoorbeeld` staat het woord erboven (overschrijven). Geeft het blok terug zodat
// het scherm bij een winkelbezoek een vinger kan loslaten.
export function maakSchrijfKaart(w: Woord, metVoorbeeld: boolean, opKlaar: (schrift: Schrift) => void): { element: HTMLElement; blok: Schrijfblok } {
  const kaart = document.createElement('div');
  kaart.className = 'oefen-kaart dictee-kaart';
  kaart.appendChild(plaatje(w));

  const vak = document.createElement('div');
  vak.className = 'dictee-schrijfvak';
  if (metVoorbeeld) vak.appendChild(woordTekst(w));
  const gum = knop('dictee-gum', 'Gum', 'assets/icons/gum.svg');
  const klaar = knop('typen-knop dictee-klaar', 'Klaar');
  klaar.disabled = true;
  gum.disabled = true;
  const blok = maakSchrijfblok((leeg) => {
    klaar.disabled = leeg;
    gum.disabled = leeg;
  });
  gum.addEventListener('click', () => blok.wis());
  klaar.addEventListener('click', () => opKlaar(blok.schrift()));
  const knoppen = document.createElement('div');
  knoppen.className = 'dictee-knoppen';
  knoppen.append(gum, klaar);
  vak.append(blok.element, knoppen);
  kaart.appendChild(vak);
  return { element: kaart, blok };
}

// Wat het kind schreef naast het goede woord, met twee grote knoppen.
export function maakNakijkKaart(w: Woord, schrift: Schrift, opOordeel: (goed: boolean) => void, foutTekst = 'Fout'): HTMLElement {
  const kaart = document.createElement('div');
  kaart.className = 'oefen-kaart dictee-kaart';
  kaart.appendChild(plaatje(w));

  const rechts = document.createElement('div');
  rechts.className = 'dictee-nakijk';
  const jij = document.createElement('div');
  jij.className = 'dictee-label';
  jij.textContent = 'Jij schreef:';
  const goed = document.createElement('div');
  goed.className = 'dictee-label';
  goed.textContent = 'Zo schrijf je het:';

  const oordeel = document.createElement('div');
  oordeel.className = 'dictee-oordeel';
  const knopGoed = knop('dictee-oordeel__knop dictee-oordeel__knop--goed', 'Goed');
  const knopFout = knop('dictee-oordeel__knop dictee-oordeel__knop--fout', foutTekst);
  // Vinkje en kruis als lijnen, niet als lettertekens: die verschillen per lettertype van
  // grootte (het ✗ stak boven de knop uit).
  knopGoed.prepend(oordeelTeken('M7 17 L13 23 L25 9'));
  knopFout.prepend(oordeelTeken('M9 9 L23 23 M23 9 L9 23'));
  knopGoed.addEventListener('click', () => opOordeel(true), { once: true });
  knopFout.addEventListener('click', () => opOordeel(false), { once: true });
  oordeel.append(knopGoed, knopFout);

  rechts.append(jij, toonSchrift(schrift), goed, woordTekst(w), oordeel);
  kaart.appendChild(rechts);
  return kaart;
}
