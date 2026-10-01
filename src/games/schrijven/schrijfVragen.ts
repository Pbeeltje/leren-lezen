import type { RondeVraag } from '../../ui/screens/RondeScreen.ts';
import { instructieAudioPad } from '../../engine/audioManager.ts';
import { toonGoedFeedback } from '../../ui/components/FeedbackOverlay.ts';
import { LETTERS, LIJNEN, woordFiguur, type Figuur, type Punt } from '../../content/schrijven/letters.ts';
import { maakOvertrekker } from './overtrekken.ts';
import { kies } from '../kleuter/hulp.ts';

// De drie schrijfspellen: lijnen (vanaf 3 jaar), letters (5-6) en woordjes (6).

const W = (woord: string, ext = 'png'): string =>
  ext === 'png' ? `assets/images/woorden/vll/${woord}.png` : `assets/images/woorden/${woord}.${ext}`;

// Letters in de volgorde waarin Veilig Leren Lezen ze aanbiedt, elk met een sleutelwoord
// ("de m van maan") waar de letter duidelijk in te horen is.
export const LETTER_VOLGORDE: { letter: string; woord: string }[] = [
  { letter: 'm', woord: 'maan' },
  { letter: 'r', woord: 'roos' },
  { letter: 's', woord: 'sok' },
  { letter: 'v', woord: 'vis' },
  { letter: 'i', woord: 'ik' },
  { letter: 'k', woord: 'koek' },
  { letter: 'o', woord: 'oog' },
  { letter: 'p', woord: 'poes' },
  { letter: 'e', woord: 'pen' },
  { letter: 'n', woord: 'neus' },
  { letter: 't', woord: 'teen' },
  { letter: 'b', woord: 'buik' },
  { letter: 'g', woord: 'geit' },
  { letter: 'd', woord: 'doos' },
  { letter: 'z', woord: 'zeep' },
  { letter: 'h', woord: 'huis' },
  { letter: 'w', woord: 'weg' },
  { letter: 'a', woord: 'tak' },
  { letter: 'u', woord: 'hut' },
  { letter: 'j', woord: 'jas' },
  { letter: 'l', woord: 'uil' },
  { letter: 'f', woord: 'duif' },
];

const WOORDJES = [
  'maan', 'roos', 'vis', 'sok', 'pen', 'teen', 'neus', 'buik', 'oog', 'doos', 'poes', 'koek', 'ijs', 'zeep',
  'huis', 'weg', 'bos', 'tak', 'hut', 'jas', 'riem', 'bijl', 'hout', 'vuur', 'geit', 'uil', 'duif', 'ei',
];

const LIJN_PAREN: [string, string][] = [
  [W('bij', 'jpg'), W('bloem', 'svg')],
  [W('muis', 'jpg'), W('kaas', 'jpg')],
  [W('konijn', 'svg'), W('wortel', 'svg')],
  [W('aap', 'jpg'), W('banaan', 'svg')],
  [W('kat', 'svg'), W('vis', 'jpg')],
  [W('auto', 'svg'), W('huis', 'jpg')],
  [W('boot', 'svg'), W('eiland', 'svg')],
  [W('hond', 'svg'), W('bal', 'jpg')],
];

// Nooit twee keer achter elkaar hetzelfde.
function kiesAnders<T>(items: T[], vorige: { waarde?: T }): T {
  let x = kies(items);
  for (let i = 0; i < 6 && x === vorige.waarde; i++) x = kies(items);
  vorige.waarde = x;
  return x;
}

function letterViewBox(f: Figuur, marge: number, minBreedte: number): [number, number, number, number] {
  const xs = f.halen.flat().map(([x]) => x);
  const [min, max] = [Math.min(...xs), Math.max(...xs)];
  const breedte = Math.max(minBreedte, max - min + marge * 2);
  return [(min + max) / 2 - breedte / 2, 0, breedte, 116];
}

function hint(plaatje: string, woord: string, letter?: string): HTMLElement {
  const el = document.createElement('div');
  el.className = 'schrijf-hint';
  const img = document.createElement('img');
  img.src = plaatje;
  img.alt = '';
  img.draggable = false;
  el.appendChild(img);
  const tekst = document.createElement('span');
  tekst.className = 'schrijf-hint__woord';
  const plek = letter ? woord.indexOf(letter) : -1;
  [...woord].forEach((l, i) => {
    const s = document.createElement('span');
    s.textContent = l;
    if (i === plek) s.className = 'schrijf-hint__letter';
    tekst.appendChild(s);
  });
  el.appendChild(tekst);
  return el;
}

function kaart(container: HTMLElement, ...kinderen: HTMLElement[]): HTMLElement {
  const k = document.createElement('div');
  k.className = 'oefen-kaart schrijf-kaart';
  for (const c of kinderen) k.appendChild(c);
  container.appendChild(k);
  return k;
}

const vorigeLijn: { waarde?: number } = {};
export function maakLijnVraag(): RondeVraag {
  const figuur = LIJNEN[kiesAnders(LIJNEN.map((_, i) => i), vorigeLijn)];
  const [start, doel] = kies(LIJN_PAREN);
  const doelPunt: Punt | undefined = figuur.doelInMidden ? [100, 60] : undefined;
  return {
    instructie: 'Trek de lijn over met je vinger',
    audioPad: instructieAudioPad('schrijf-lijn'),
    render(container, afgerond) {
      const t = maakOvertrekker(
        {
          halen: [figuur.haal],
          viewBox: [-16, -16, 232, 152],
          tolerantie: 18,
          baanDikte: 20,
          startPlaatje: start,
          doelPlaatje: doel,
          doelPunt,
          plaatjeGrootte: 40,
        },
        () => {
          toonGoedFeedback();
          afgerond();
        },
      );
      const k = kaart(container, t.element);
      return () => {
        t.opruimen();
        k.remove();
      };
    },
  };
}

const vorigeLetter: { waarde?: (typeof LETTER_VOLGORDE)[number] } = {};
export function maakLetterVraag(): RondeVraag {
  const item = kiesAnders(LETTER_VOLGORDE, vorigeLetter);
  const figuur = LETTERS[item.letter];
  return {
    instructie: `Schrijf de ${item.letter} van ${item.woord}`,
    // Per letter een eigen zinnetje ("Schrijf de m van maan"), met de klank van de letter.
    audioPad: instructieAudioPad(`schrijf-letter-${item.letter}`),
    render(container, afgerond) {
      const t = maakOvertrekker(
        { halen: figuur.halen, viewBox: letterViewBox(figuur, 26, 96), tolerantie: 10, baanDikte: 11, schrijflijnen: true },
        () => {
          toonGoedFeedback();
          afgerond();
        },
      );
      const k = kaart(container, hint(W(item.woord), item.woord, item.letter), t.element);
      return () => {
        t.opruimen();
        k.remove();
      };
    },
  };
}

const vorigWoord: { waarde?: string } = {};
export function maakWoordVraag(): RondeVraag {
  const woord = kiesAnders(WOORDJES, vorigWoord);
  const figuur = woordFiguur(woord);
  return {
    instructie: 'Schrijf het woord na',
    audioPad: instructieAudioPad('schrijf-woord'),
    render(container, afgerond) {
      const t = maakOvertrekker(
        { halen: figuur.halen, viewBox: letterViewBox(figuur, 18, 120), tolerantie: 11, baanDikte: 11, schrijflijnen: true },
        () => {
          toonGoedFeedback();
          afgerond();
        },
      );
      const k = kaart(container, hint(W(woord), woord), t.element);
      return () => {
        t.opruimen();
        k.remove();
      };
    },
  };
}
