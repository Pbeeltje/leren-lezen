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

function potlood(lengte: number, kleur: string): SVGSVGElement {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', String(lengte));
  svg.setAttribute('height', '44');
  svg.setAttribute('viewBox', `0 0 ${lengte} 44`);
  const onderdelen: [string, Record<string, string>][] = [
    ['rect', { x: '0', y: '6', width: '22', height: '32', rx: '6', fill: '#f48fb1' }],
    ['rect', { x: '18', y: '6', width: '10', height: '32', fill: '#b0bec5' }],
    ['rect', { x: '28', y: '6', width: String(lengte - 64), height: '32', fill: kleur }],
    ['polygon', { points: `${lengte - 36},6 ${lengte - 4},22 ${lengte - 36},38`, fill: '#ffe0b2' }],
    ['polygon', { points: `${lengte - 14},16.5 ${lengte - 4},22 ${lengte - 14},27.5`, fill: '#37474f' }],
  ];
  for (const [tag, attrs] of onderdelen) {
    const el = document.createElementNS(ns, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    el.setAttribute('stroke', '#263238');
    el.setAttribute('stroke-width', '2');
    svg.appendChild(el);
  }
  return svg;
}

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
  const kleur = kies(PENNEN);
  return {
    opties: [
      { inhoud: () => potlood(360, kleur), juist: soort === 'lang' },
      { inhoud: () => potlood(150, kleur), juist: soort === 'kort' },
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
