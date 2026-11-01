import type { Woord } from '../types.ts';
import { KERNEN } from '../lezen/kernen/kernen.index.ts';
import { woordAudioPad } from '../../engine/audioManager.ts';
import { isOpgenomen } from '../../engine/opnames.ts';

// Schrijven voor groep 3 volgt de leeshoofdstukken: dezelfde woorden, in dezelfde
// volgorde steeds moeilijker (mkm, lange klanken, clusters, ui/ei, sch, ...). Elk
// hoofdstuk: overtrekken, overschrijven, luisteren en schrijven, en een dictee als toets.
// Alleen hoofdstukken met korte, klankzuivere woorden: de themahoofdstukken (weer,
// dierentuin, vervoer, ...) en Lange woorden passen niet op een schrijfregel.
const SCHRIJF_KERNEN = new Set([
  'lezen-01', 'lezen-02', 'lezen-03', 'lezen-04', 'lezen-05', 'lezen-06', 'lezen-07', 'lezen-08',
  'lezen-09', 'lezen-24', 'lezen-10', 'lezen-11', 'lezen-12', 'lezen-29', 'lezen-13', 'lezen-14',
  'lezen-15', 'lezen-16', 'lezen-23',
]);
// Langer past niet op een telefoon, ook niet in kinderhandschrift.
const MAX_LETTERS = 6;
// Niet op gehoor te schrijven: leenwoorden, of met een trema.
const NIET_KLANKZUIVER = new Set(['douche', 'ski', 'mais', 'piano', 'radio']);

export interface SchrijfHoofdstuk {
  id: string; // 'schrijven-' + id van het leeshoofdstuk, voor de voortgang
  volgnummer: number;
  titel: string;
  woorden: Woord[];
  // Woorden met een opname: alleen die kun je dicteren.
  dicteeWoorden: Woord[];
}

export const SCHRIJF_HOOFDSTUKKEN: SchrijfHoofdstuk[] = KERNEN.filter((kern) => SCHRIJF_KERNEN.has(kern.id)).map((kern, i) => {
  const gezien = new Set<string>();
  const woorden = kern.woordenbank.filter((w) => {
    if (w.vereistTekst || w.woord.length > MAX_LETTERS || NIET_KLANKZUIVER.has(w.woord) || gezien.has(w.woord)) return false;
    gezien.add(w.woord);
    return true;
  });
  return {
    id: `schrijven-${kern.id}`,
    volgnummer: i + 1,
    titel: kern.titel,
    woorden,
    dicteeWoorden: woorden.filter((w) => isOpgenomen(woordAudioPad(w.woord))),
  };
});
