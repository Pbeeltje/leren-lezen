import type { Kern, Woord } from '../../types.ts';
import { KERNEN } from './kernen.index.ts';

// Leren lezen voor kleuters: een eigen, makkelijke reeks. Alleen "welk woord heeft deze
// letter?": een grote letter en een paar woorden, precies één daarvan heeft die letter
// (vooraan, dat zien en horen ze het makkelijkst). Per hoofdstuk drie of vier letters,
// ongeveer in de volgorde van groep 3; het laatste hoofdstuk herhaalt alles.
// Woorden komen uit de gewone leeskernen, alleen korte (hoogstens 5 letters).
const MAX_LENGTE = 5;

const gezien = new Set<string>();
export const KLEUTER_WOORDEN: Woord[] = [];
for (const kern of KERNEN) {
  for (const woord of kern.woordenbank) {
    if (woord.woord.length > MAX_LENGTE || gezien.has(woord.woord)) continue;
    gezien.add(woord.woord);
    KLEUTER_WOORDEN.push(woord);
  }
}

const GROEPEN = [
  ['m', 's', 'v'],
  ['r', 'k', 'p'],
  ['n', 't', 'b'],
  ['h', 'd', 'z'],
  ['l', 'w', 'g', 'f'],
];

function letterKern(nummer: number, letters: string[], titel: string): Kern {
  return {
    id: `kleuter-letters-${nummer}`,
    volgnummer: nummer,
    titel,
    structuurwoorden: [],
    nieuweLetters: letters,
    letters,
    // De doelwoorden: begint met een van de letters van dit hoofdstuk.
    woordenbank: KLEUTER_WOORDEN.filter((w) => letters.includes(w.woord[0])),
    zinnen: [],
  };
}

const opsomming = (l: string[]): string => `${l.slice(0, -1).join(', ')} & ${l[l.length - 1]}`;

export const KLEUTER_KERNEN: Kern[] = [
  ...GROEPEN.map((letters, i) => letterKern(i + 1, letters, opsomming(letters))),
  letterKern(GROEPEN.length + 1, GROEPEN.flat(), 'alle letters'),
];
