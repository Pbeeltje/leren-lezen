import type { Kern, OefeningDefinitie, OefeningType, Woord } from '../content/types.ts';
import { haalBlootstelling } from './progressStore.ts';

export type OefenModus = 'oefenen' | 'toets';

const OEFENEN_AANTAL_WOORDEN = 5;
// Een woord moet minstens dit vaak op een andere manier geoefend zijn voordat
// "zelf-typen" (helemaal zelf typen, geen keuzes) ervoor mag verschijnen.
const MIN_BLOOTSTELLING_VOOR_TYPEN = 2;

function schud<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

function kiesN<T>(items: T[], n: number): T[] {
  return schud(items).slice(0, Math.max(0, n));
}

function kiesAfleiders(pool: Woord[], doel: Woord, aantal: number): Woord[] {
  const kandidaten = pool.filter((w) => w.woord !== doel.woord);
  return kiesN(kandidaten, Math.min(aantal, kandidaten.length));
}

function alleLettersVanPool(pool: Woord[]): string[] {
  const set = new Set<string>();
  for (const w of pool) for (const letter of w.woord) set.add(letter);
  return [...set];
}

function kiesAfleidLetters(doelWoord: string, alleLetters: string[], aantal: number): string[] {
  const kandidaten = alleLetters.filter((letter) => !doelWoord.includes(letter));
  return kiesN(kandidaten, Math.min(aantal, kandidaten.length));
}

function beschikbareTypen(kern: Kern, doel: Woord, uitgesloten: OefeningType[]): OefeningType[] {
  const basis: OefeningType[] = ['plaatje-woord-keuze', 'woord-plaatje-keuze', 'hakken-en-plakken', 'woord-bouwen'];
  if (kern.zinnen.some((z) => z.doel.woord === doel.woord)) basis.push('zin-invullen');
  if (haalBlootstelling(doel.woord) >= MIN_BLOOTSTELLING_VOOR_TYPEN) basis.push('zelf-typen');

  const overgebleven = basis.filter((type) => !uitgesloten.includes(type));
  return overgebleven.length > 0 ? overgebleven : basis;
}

function maakOefening(kern: Kern, doel: Woord, type: OefeningType, aantalAfleiders: number): OefeningDefinitie {
  switch (type) {
    case 'plaatje-woord-keuze':
      return { type, doel, afleiders: kiesAfleiders(kern.woordenbank, doel, aantalAfleiders) };
    case 'woord-plaatje-keuze':
      return { type, doel, afleiders: kiesAfleiders(kern.woordenbank, doel, aantalAfleiders) };
    case 'hakken-en-plakken':
      return { type, woord: doel };
    case 'woord-bouwen':
      return {
        type,
        woord: doel,
        afleidLetters: kiesAfleidLetters(doel.woord, alleLettersVanPool(kern.woordenbank), aantalAfleiders),
      };
    case 'zelf-typen':
      return { type, woord: doel };
    case 'zin-invullen': {
      const passendeZinnen = kern.zinnen.filter((z) => z.doel.woord === doel.woord);
      const zin = passendeZinnen[Math.floor(Math.random() * passendeZinnen.length)];
      return {
        type,
        zin: zin.zin,
        doel: zin.doel,
        afleiders: kiesAfleiders(kern.woordenbank, doel, aantalAfleiders),
        modus: Math.random() < 0.5 ? 'meerkeuze' : 'typen',
      };
    }
  }
}

/** Het woord waar een oefening om draait, ongeacht het vorm-specifieke veld. */
export function woordVanOefening(oefening: OefeningDefinitie): string {
  return 'doel' in oefening ? oefening.doel.woord : oefening.woord.woord;
}

export function genereerSessie(kern: Kern, modus: OefenModus): OefeningDefinitie[] {
  const aantalAfleiders = modus === 'oefenen' ? 2 : 3;

  if (modus === 'oefenen') {
    const woorden = kiesN(kern.woordenbank, Math.min(OEFENEN_AANTAL_WOORDEN, kern.woordenbank.length));
    return woorden.map((doel) => {
      const type = kiesN(beschikbareTypen(kern, doel, []), 1)[0];
      return maakOefening(kern, doel, type, aantalAfleiders);
    });
  }

  // Toets: de hele woordenbank van deze kern, één vraag per woord (10 woorden -> 10 vragen).
  const sessie = kern.woordenbank.map((doel) => {
    const type = kiesN(beschikbareTypen(kern, doel, []), 1)[0];
    return maakOefening(kern, doel, type, aantalAfleiders);
  });
  return schud(sessie);
}
