import type { Woord } from '../../content/types.ts';
import type { RondeVraag } from '../../ui/screens/RondeScreen.ts';
import { KERNEN } from '../../content/lezen/kernen/kernen.index.ts';
import { instructieAudioPad } from '../../engine/audioManager.ts';
import { toonGoedFeedback, toonFoutFeedback } from '../../ui/components/FeedbackOverlay.ts';
import { kies, schud } from './hulp.ts';

// Vergelijken (groep 1-2 begrip): groot/klein, zwaar/licht, lang/kort. Twee keuzes,
// altijd opnieuw proberen. Bij zwaar/licht zijn beide plaatjes bewust even groot, zodat
// het kind over het ding zelf nadenkt en niet gewoon het grootste plaatje kiest.

type Soort = 'groot' | 'klein' | 'zwaar' | 'licht' | 'lang' | 'kort';

const INSTRUCTIE: Record<Soort, string> = {
  groot: 'Tik de grote.',
  klein: 'Tik de kleine.',
  zwaar: 'Welke is zwaar?',
  licht: 'Welke is licht?',
  lang: 'Welke is lang?',
  kort: 'Welke is kort?',
};

// [zwaar, licht] -- alleen woorden die een plaatje in de leeskernen hebben.
const ZWAAR_LICHT: [string, string][] = [
  ['olifant', 'muis'],
  ['beer', 'bij'],
  ['auto', 'bal'],
  ['paard', 'eend'],
  ['krokodil', 'vis'],
  ['kameel', 'kip'],
  ['varken', 'muis'],
  ['huis', 'sok'],
  ['olifant', 'ei'],
  ['zebra', 'egel'],
];

const PENNEN = ['#e53935', '#1e88e5', '#43a047', '#fb8c00', '#8e24aa'];

function woordMetPlaatje(naam: string): Woord | undefined {
  for (const kern of KERNEN) {
    const w = kern.woordenbank.find((x) => x.woord === naam);
    if (w) return w;
  }
  return undefined;
}

function zwaarLichtParen(): [string, string][] {
  return ZWAAR_LICHT.filter(([a, b]) => woordMetPlaatje(a) && woordMetPlaatje(b));
}

function plaatjesPool(): Woord[] {
  const gezien = new Set<string>();
  const pool: Woord[] = [];
  for (const kern of KERNEN) {
    for (const w of kern.woordenbank) {
      if (w.vereistTekst || gezien.has(w.woord)) continue;
      gezien.add(w.woord);
      pool.push(w);
    }
  }
  return pool;
}

const NS = 'http://www.w3.org/2000/svg';

// Een liggend ding van `lengte` px breed en 44 px hoog, uit losse onderdelen met een
// donkere rand.
function tekening(lengte: number, onderdelen: [string, Record<string, string>][], rand = true): SVGSVGElement {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', String(lengte));
  svg.setAttribute('height', '44');
  svg.setAttribute('viewBox', `0 0 ${lengte} 44`);
  for (const [tag, attrs] of onderdelen) {
    const el = document.createElementNS(NS, tag);
    if (rand) {
      el.setAttribute('stroke', '#263238');
      el.setAttribute('stroke-width', '2');
    }
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    svg.appendChild(el);
  }
  return svg;
}

function potlood(lengte: number, kleur: string): SVGSVGElement {
  return tekening(lengte, [
    ['rect', { x: '0', y: '6', width: '22', height: '32', rx: '6', fill: '#f48fb1' }],
    ['rect', { x: '18', y: '6', width: '10', height: '32', fill: '#b0bec5' }],
    ['rect', { x: '28', y: '6', width: String(lengte - 64), height: '32', fill: kleur }],
    ['polygon', { points: `${lengte - 36},6 ${lengte - 4},22 ${lengte - 36},38`, fill: '#ffe0b2' }],
    ['polygon', { points: `${lengte - 14},16.5 ${lengte - 4},22 ${lengte - 14},27.5`, fill: '#37474f' }],
  ]);
}

// Touw: een dikke streng met schuine draaiingen en een knoopje aan beide kanten.
function touw(lengte: number): SVGSVGElement {
  const draaien: [string, Record<string, string>][] = [];
  for (let x = 20; x < lengte - 20; x += 10) {
    draaien.push(['path', { d: `M${x} 14 L${x + 8} 30`, stroke: '#a1793f', 'stroke-width': '2.5', 'stroke-linecap': 'round' }]);
  }
  return tekening(lengte, [
    ['rect', { x: '12', y: '13', width: String(lengte - 24), height: '18', rx: '9', fill: '#d9b26a' }],
    ...draaien,
    ['circle', { cx: '12', cy: '22', r: '11', fill: '#c99c52' }],
    ['circle', { cx: String(lengte - 12), cy: '22', r: '11', fill: '#c99c52' }],
    ['path', { d: `M6 30 L2 40 M12 33 L12 42 M${lengte - 6} 30 L${lengte - 2} 40 M${lengte - 12} 33 L${lengte - 12} 42`, stroke: '#a1793f', 'stroke-width': '3', 'stroke-linecap': 'round', fill: 'none' }],
  ]);
}

// Slang: een golvend lijf met een kop rechts (oogje en tongetje) en een puntige staart.
function slang(lengte: number): SVGSVGElement {
  const eind = lengte - 34;
  const golven = Math.max(1, Math.round((eind - 10) / 70));
  const stap = (eind - 10) / golven;
  let d = 'M6 24';
  for (let i = 0; i < golven; i++) {
    const x = 10 + i * stap;
    d += ` C${(x + stap * 0.25).toFixed(1)} 8 ${(x + stap * 0.25).toFixed(1)} 8 ${(x + stap * 0.5).toFixed(1)} 22 S${(x + stap * 0.75).toFixed(1)} 36 ${(x + stap).toFixed(1)} 22`;
  }
  return tekening(lengte, [
    ['path', { d, fill: 'none', stroke: '#263238', 'stroke-width': '15', 'stroke-linecap': 'round' }],
    ['path', { d, fill: 'none', stroke: '#66bb6a', 'stroke-width': '11', 'stroke-linecap': 'round' }],
    ['path', { d, fill: 'none', stroke: '#fff176', 'stroke-width': '3', 'stroke-dasharray': '4 9', 'stroke-linecap': 'round' }],
    ['path', { d: `M${lengte - 8} 22 L${lengte - 1} 19 M${lengte - 8} 22 L${lengte - 1} 25`, stroke: '#e53935', 'stroke-width': '2', 'stroke-linecap': 'round', fill: 'none' }],
    ['ellipse', { cx: String(lengte - 22), cy: '22', rx: '15', ry: '11', fill: '#66bb6a', stroke: '#263238', 'stroke-width': '2' }],
    ['circle', { cx: String(lengte - 20), cy: '18', r: '3', fill: '#263238' }],
    ['circle', { cx: String(lengte - 19), cy: '17', r: '1', fill: '#ffffff' }],
  ], false);
}

// Ladder (liggend): twee bomen met sporten om de 30 px.
function ladder(lengte: number): SVGSVGElement {
  const sporten: [string, Record<string, string>][] = [];
  const aantal = Math.max(2, Math.round((lengte - 20) / 30));
  for (let i = 0; i <= aantal; i++) {
    const x = 8 + ((lengte - 22) * i) / aantal;
    sporten.push(['rect', { x: x.toFixed(1), y: '8', width: '6', height: '28', fill: '#c98b4b' }]);
  }
  return tekening(lengte, [
    ...sporten,
    ['rect', { x: '2', y: '3', width: String(lengte - 4), height: '7', rx: '3', fill: '#a8703a' }],
    ['rect', { x: '2', y: '34', width: String(lengte - 4), height: '7', rx: '3', fill: '#a8703a' }],
  ]);
}

// Dingen die lang of kort kunnen zijn; [lang, kort] krijgen dezelfde soort.
const LANGE_DINGEN: ((lengte: number) => SVGSVGElement)[] = [
  (l) => potlood(l, kies(PENNEN)),
  touw,
  slang,
  ladder,
];

interface Optie {
  inhoud: () => Node;
  juist: boolean;
}

function maakOpties(soort: Soort): { opties: Optie[]; kolom: boolean } {
  if (soort === 'groot' || soort === 'klein') {
    const w = kies(plaatjesPool());
    const maak = (schaal: number) => () => {
      const img = document.createElement('img');
      img.src = w.afbeeldingPad;
      img.alt = '';
      img.style.width = `${schaal}%`;
      img.style.height = `${schaal}%`;
      return img;
    };
    return { opties: [{ inhoud: maak(100), juist: soort === 'groot' }, { inhoud: maak(42), juist: soort === 'klein' }], kolom: false };
  }
  if (soort === 'zwaar' || soort === 'licht') {
    const paren = zwaarLichtParen();
    const [zwaar, licht] = kies(paren).map((n) => woordMetPlaatje(n)!);
    const maak = (w: Woord) => () => {
      const img = document.createElement('img');
      img.src = w.afbeeldingPad;
      img.alt = '';
      return img;
    };
    return { opties: [{ inhoud: maak(zwaar), juist: soort === 'zwaar' }, { inhoud: maak(licht), juist: soort === 'licht' }], kolom: false };
  }
  // Zelfde ding (en bij het potlood dezelfde kleur) in lang en kort.
  const kleur = kies(PENNEN);
  const ding = kies(LANGE_DINGEN);
  const teken = ding === LANGE_DINGEN[0] ? (l: number) => potlood(l, kleur) : ding;
  return {
    opties: [
      { inhoud: () => teken(360), juist: soort === 'lang' },
      { inhoud: () => teken(150), juist: soort === 'kort' },
    ],
    kolom: true,
  };
}

export function maakVergelijkVraag(): RondeVraag {
  // Zwaar/licht alleen als er (na een content-wijziging) nog paren met plaatjes zijn.
  const soorten: Soort[] = ['groot', 'klein', 'lang', 'kort'];
  if (zwaarLichtParen().length > 0) soorten.push('zwaar', 'licht');
  const soort = kies(soorten);
  const { opties, kolom } = maakOpties(soort);
  return {
    instructie: INSTRUCTIE[soort],
    audioPad: instructieAudioPad(`vergelijk-${soort}`),
    render(container, afgerond) {
      container.innerHTML = '';
      const kaart = document.createElement('div');
      kaart.className = 'oefen-kaart';
      const rij = document.createElement('div');
      rij.className = kolom ? 'vergelijk-rij vergelijk-rij--kolom' : 'vergelijk-rij';
      kaart.appendChild(rij);
      let klaar = false;
      for (const optie of schud(opties)) {
        const knop = document.createElement('button');
        knop.className = kolom ? 'vergelijk-optie vergelijk-optie--breed' : 'vergelijk-optie';
        knop.appendChild(optie.inhoud());
        knop.addEventListener('click', () => {
          if (klaar) return;
          if (optie.juist) {
            klaar = true;
            knop.classList.add('gevonden');
            toonGoedFeedback();
            afgerond();
            return;
          }
          knop.classList.add('fout-gekozen');
          toonFoutFeedback();
          setTimeout(() => knop.classList.remove('fout-gekozen'), 500);
        });
        rij.appendChild(knop);
      }
      container.appendChild(kaart);
      return () => container.replaceChildren();
    },
  };
}
