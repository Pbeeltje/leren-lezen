import type { Kern, OefeningDefinitie, OefeningType, Woord } from '../content/types.ts';
import { haalBlootstelling } from './progressStore.ts';

export type OefenModus = 'oefenen' | 'toets';
export type OefeningNummer = 1 | 2 | 3;

const OEFENEN_AANTAL_WOORDEN = 5;
// Een woord moet minstens dit vaak op een andere manier geoefend zijn voordat
// "zelf-typen" (helemaal zelf typen, geen keuzes) ervoor mag verschijnen.
const MIN_BLOOTSTELLING_VOOR_TYPEN = 2;

// Tweeklanken/klankcombinaties waarop klank-herkennen let (zie kern-07-klanken.ts).
// 'oe' erbij vanaf kern-09 (koek) -- een van de meest voorkomende Nederlandse
// klankcombinaties, dus de moeite waard ook al is er (nog) maar één woord voor.
const KLANKEN = ['oo', 'aa', 'au', 'ou', 'ui', 'eu', 'ee', 'oe'];

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

/** De klank uit KLANKEN die in dit woord voorkomt, of null als geen enkele erin zit. */
function vindKlank(woord: string): string | null {
  return KLANKEN.find((klank) => woord.includes(klank)) ?? null;
}

// Voor letter-herkennen: kies, van de letters die dit woord bevat, degene waarvoor de
// rest van de bank de meeste bruikbare afleiders (woorden zonder die letter) oplevert.
function kiesBesteLetter(doel: Woord, pool: Woord[]): { letter: string; kandidaten: Woord[] } | null {
  const letters = [...new Set(doel.woord.split(''))];
  let beste: { letter: string; kandidaten: Woord[] } | null = null;
  for (const letter of letters) {
    const kandidaten = pool.filter((w) => w.woord !== doel.woord && !w.woord.includes(letter));
    if (!beste || kandidaten.length > beste.kandidaten.length) beste = { letter, kandidaten };
  }
  return beste && beste.kandidaten.length > 0 ? beste : null;
}

// Oefentypen waarbij het doelwoord zelf nergens als tekst op het scherm staat -- het
// plaatje moet dus op zichzelf ondubbelzinnig zijn. Niet geschikt voor woorden met
// vereistTekst (zie Woord in content/types.ts).
const ALLEEN_PLAATJE_TYPEN: OefeningType[] = ['hakken-en-plakken', 'woord-bouwen', 'zelf-typen'];

function beschikbareTypen(kern: Kern, doel: Woord, uitgesloten: OefeningType[]): OefeningType[] {
  let basis: OefeningType[] = [
    'plaatje-woord-keuze',
    'woord-plaatje-keuze',
    'hakken-en-plakken',
    'woord-bouwen',
    'woordwolk',
  ];
  if (doel.vereistTekst) basis = basis.filter((type) => !ALLEEN_PLAATJE_TYPEN.includes(type));
  if (kern.zinnen.some((z) => z.doel.woord === doel.woord)) basis.push('zin-invullen');
  if (!doel.vereistTekst && haalBlootstelling(doel.woord) >= MIN_BLOOTSTELLING_VOOR_TYPEN) basis.push('zelf-typen');
  if (kiesBesteLetter(doel, kern.woordenbank)) basis.push('letter-herkennen');
  const klank = vindKlank(doel.woord);
  if (klank && kern.woordenbank.some((w) => w.woord !== doel.woord && !w.woord.includes(klank))) {
    basis.push('klank-herkennen');
  }
  // Drie plaatjes tegelijk uit elkaar houden kan alleen met genoeg andere woorden in de bank.
  if (kern.woordenbank.length >= 3) basis.push('drie-koppelen');

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
    case 'woordwolk': {
      // Eén doelwoord tussen een wolk van ~6 afleiders.
      const wolkGrootte = 7;
      return { type, doel, afleiders: kiesAfleiders(kern.woordenbank, doel, wolkGrootte - 1) };
    }
    case 'letter-herkennen': {
      const gekozen = kiesBesteLetter(doel, kern.woordenbank)!;
      return { type, letter: gekozen.letter, doel, afleiders: kiesN(gekozen.kandidaten, aantalAfleiders) };
    }
    case 'klank-herkennen': {
      const klank = vindKlank(doel.woord)!;
      const kandidaten = kern.woordenbank.filter((w) => w.woord !== doel.woord && !w.woord.includes(klank));
      return { type, klank, doel, afleiders: kiesN(kandidaten, aantalAfleiders) };
    }
    case 'drie-koppelen': {
      const overigen = kiesN(
        kern.woordenbank.filter((w) => w.woord !== doel.woord),
        2,
      );
      const paren = schud([doel, ...overigen]) as [Woord, Woord, Woord];
      return { type, paren };
    }
  }
}

/** Het woord waar een oefening om draait, ongeacht het vorm-specifieke veld. */
export function woordVanOefening(oefening: OefeningDefinitie): string {
  if ('paren' in oefening) return oefening.paren[0].woord;
  return 'doel' in oefening ? oefening.doel.woord : oefening.woord.woord;
}

/**
 * Verdeelt de woordenbank in 3 vaste, ongeveer even grote stukken (round-robin op
 * index) zodat Oefening 1/2/3 van eenzelfde kern elk hun eigen deel van de woorden
 * behandelen in plaats van elke keer een willekeurige (en dus deels overlappende)
 * steekproef uit de hele bank -- de toets blijft de hele bank in één keer, en is zo
 * de enige plek die alles herhaalt/samenvat.
 */
function woordenVoorOefening(kern: Kern, nummer: OefeningNummer): Woord[] {
  const deel = kern.woordenbank.filter((_, i) => i % 3 === nummer - 1);
  return deel.length > 0 ? deel : kern.woordenbank;
}

export function genereerSessie(kern: Kern, modus: OefenModus, oefeningNummer: OefeningNummer = 1): OefeningDefinitie[] {
  const aantalAfleiders = modus === 'oefenen' ? 2 : 3;

  if (modus === 'oefenen') {
    const pool = woordenVoorOefening(kern, oefeningNummer);
    const woorden = kiesN(pool, Math.min(OEFENEN_AANTAL_WOORDEN, pool.length));
    return woorden.map((doel) => {
      const type = kiesN(beschikbareTypen(kern, doel, []), 1)[0];
      return maakOefening(kern, doel, type, aantalAfleiders);
    });
  }

  // Toets: de hele woordenbank van deze kern, één vraag per woord -- de samenvattende
  // herhaling van alles wat de 3 oefeningen afzonderlijk behandelden.
  const sessie = kern.woordenbank.map((doel) => {
    const type = kiesN(beschikbareTypen(kern, doel, []), 1)[0];
    return maakOefening(kern, doel, type, aantalAfleiders);
  });
  return schud(sessie);
}
