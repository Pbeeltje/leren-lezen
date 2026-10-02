import type { Kern, OefeningDefinitie, OefeningType, Woord } from '../content/types.ts';
import { haalGroep } from './progressStore.ts';
import { KLEUTER_WOORDEN } from '../content/lezen/kernen/kleuter-letters.ts';

export type OefenModus = 'oefenen' | 'toets';
export type OefeningNummer = 1 | 2 | 3;

const OEFENEN_AANTAL_WOORDEN = 5;

// Zesjarigen vonden het te makkelijk: de zwaardere vormen komen vaker voor dan de simpele
// meerkeuze, en elke reeks eindigt met zelf typen. Vijfjarigen: gelijke verdeling, geen typen.
const GEWICHT_ZES: Partial<Record<OefeningType, number>> = {
  'zin-invullen': 1.5,
  'woord-bouwen': 1.3,
  'drie-koppelen': 1.3,
  'hakken-en-plakken': 1,
  'plaatje-woord-keuze': 0.7,
  'woord-plaatje-keuze': 0.7,
  'letter-herkennen': 0.7,
  'klank-herkennen': 0.7,
  woordwolk: 0.7,
};
const isZes = () => haalGroep() !== 'kleuter'; // groep 3 (of nog niets gekozen)

function kiesType(typen: OefeningType[]): OefeningType {
  if (!isZes()) return kiesN(typen, 1)[0];
  const gewichten = typen.map((t) => GEWICHT_ZES[t] ?? 1);
  let lot = Math.random() * gewichten.reduce((a, b) => a + b, 0);
  for (let i = 0; i < typen.length; i++) {
    lot -= gewichten[i];
    if (lot <= 0) return typen[i];
  }
  return typen[typen.length - 1];
}

// Tweeklanken/klankcombinaties waarop klank-herkennen let.
// Volgorde telt: langere groepen eerst, anders wint 'aa' van 'aai' en 'ch' van 'sch'.
// 'ee' en 'ie' vóór 'eu', anders krijgt "sneeuw" de klank 'eu'.
const KLANKEN = ['eeuw', 'ieuw', 'aai', 'ooi', 'oei', 'sch', 'ng', 'nk', 'ch', 'ee', 'ie', 'oe', 'oo', 'aa', 'eu', 'au', 'ou', 'ui', 'ij', 'ei', 'uu'];
// Klanken die hetzelfde klinken: een afleider met de "tweeling" is geen eerlijk fout antwoord.
const ZELFDE_KLANK: Record<string, string[]> = { ei: ['ij'], ij: ['ei'], au: ['ou'], ou: ['au'] };

/** Fisher-Yates; sort(() => random - 0.5) is scheef verdeeld. */
export function schud<T>(items: T[]): T[] {
  const kopie = [...items];
  for (let i = kopie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [kopie[i], kopie[j]] = [kopie[j], kopie[i]];
  }
  return kopie;
}

/** Schudt, maar nooit terug in de oorspronkelijke volgorde (als dat kan): anders staat het antwoord er al. */
export function schudAnders<T>(items: T[], gelijk: (a: T, b: T) => boolean = (a, b) => a === b): T[] {
  for (let poging = 0; poging < 20; poging++) {
    const geschud = schud(items);
    if (geschud.some((item, i) => !gelijk(item, items[i]))) return geschud;
  }
  return schud(items);
}

function kiesN<T>(items: T[], n: number): T[] {
  return schud(items).slice(0, Math.max(0, n));
}

// Bij plaatje-oefeningen is een vereistTekst-woord geen eerlijke afleider: het plaatje is
// dubbelzinnig (zon bij "droog") en het woord kan net zo goed bij het doelplaatje passen
// ("nat" bij een plaatje van regen).
function kiesAfleiders(pool: Woord[], doel: Woord, aantal: number, metPlaatje: boolean): Woord[] {
  const kandidaten = pool.filter((w) => w.woord !== doel.woord && !(metPlaatje && w.vereistTekst));
  return kiesN(kandidaten, Math.min(aantal, kandidaten.length));
}

// Foute keuzes waar alleen tekst getoond wordt: eerst de lijkt-erop-woorden van het doel,
// aangevuld met gewone woorden uit de bank.
function tekstAfleiders(pool: Woord[], doel: Woord, aantal: number): Woord[] {
  const lijkend = kiesN(doel.lijktOp ?? [], Math.min(aantal, doel.lijktOp?.length ?? 0)).map(
    (woord): Woord => ({ woord, afbeeldingPad: '' }),
  );
  const bezet = new Set([doel.woord, ...lijkend.map((w) => w.woord)]);
  const aanvulling = kiesAfleiders(pool.filter((w) => !bezet.has(w.woord)), doel, aantal - lijkend.length, true);
  return schud([...lijkend, ...aanvulling]);
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

function klankAfleiders(pool: Woord[], doel: Woord, klank: string): Woord[] {
  const verboden = [klank, ...(ZELFDE_KLANK[klank] ?? [])];
  return pool.filter((w) => w.woord !== doel.woord && !verboden.some((k) => w.woord.includes(k)));
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
  // Heel lange woorden (lieveheersbeestje) geven te veel blokjes of letters om te tikken.
  if (doel.woord.length > 8) basis = basis.filter((type) => type !== 'woord-bouwen');
  if (doel.woord.length > 10) basis = basis.filter((type) => type !== 'hakken-en-plakken');
  if (kern.zinnen.some((z) => z.doel.woord === doel.woord)) basis.push('zin-invullen');
  if (kiesBesteLetter(doel, kern.woordenbank)) basis.push('letter-herkennen');
  const klank = vindKlank(doel.woord);
  if (klank && klankAfleiders(kern.woordenbank, doel, klank).length > 0) {
    basis.push('klank-herkennen');
  }
  // Drie plaatjes tegelijk uit elkaar houden kan alleen met genoeg andere woorden in de bank.
  if (drieKoppelKandidaten(kern, doel).length >= 2) basis.push('drie-koppelen');

  const overgebleven = basis.filter((type) => !uitgesloten.includes(type));
  return overgebleven.length > 0 ? overgebleven : basis;
}

// De twee andere woorden bij drie-koppelen: geen vereistTekst (zie kiesAfleiders).
function drieKoppelKandidaten(kern: Kern, doel: Woord): Woord[] {
  return kern.woordenbank.filter((w) => w.woord !== doel.woord && !w.vereistTekst);
}

function maakOefening(kern: Kern, doel: Woord, type: OefeningType, aantalAfleiders: number): OefeningDefinitie {
  switch (type) {
    case 'plaatje-woord-keuze':
      return { type, doel, afleiders: tekstAfleiders(kern.woordenbank, doel, aantalAfleiders) };
    case 'woord-plaatje-keuze':
      return { type, doel, afleiders: kiesAfleiders(kern.woordenbank, doel, aantalAfleiders, true) };
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
      const handAfleiders = zin.afleiders.filter((w) => w.woord !== zin.doel.woord);
      // De afleiders bij de zin zijn met de hand gekozen zodat ze níet in de zin passen;
      // willekeurige woorden uit de bank konden dat wel ("Oma geeft opa een mooie vaas").
      return {
        type,
        zin: zin.zin,
        doel: zin.doel,
        afleiders: handAfleiders.length > 0 ? handAfleiders : kiesAfleiders(kern.woordenbank, doel, aantalAfleiders, false),
        // Typen alleen aan het eind van de reeks (zie voegTypenToe), dus hier altijd meerkeuze.
        modus: 'meerkeuze',
      };
    }
    case 'woordwolk': {
      // Eén doelwoord tussen een wolk van ~6 afleiders.
      const wolkGrootte = 7;
      return { type, doel, afleiders: tekstAfleiders(kern.woordenbank, doel, wolkGrootte - 1) };
    }
    case 'letter-herkennen': {
      // Afwisselen tussen de letters die genoeg afleiders geven, i.p.v. elke keer dezelfde.
      const goedGenoeg = [...new Set(doel.woord.split(''))]
        .map((letter) => ({
          letter,
          kandidaten: kern.woordenbank.filter((w) => w.woord !== doel.woord && !w.woord.includes(letter)),
        }))
        .filter((optie) => optie.kandidaten.length >= aantalAfleiders);
      const gekozen = kiesN(goedGenoeg, 1)[0] ?? kiesBesteLetter(doel, kern.woordenbank)!;
      return { type, letter: gekozen.letter, doel, afleiders: kiesN(gekozen.kandidaten, aantalAfleiders) };
    }
    case 'klank-herkennen': {
      const klank = vindKlank(doel.woord)!;
      return { type, klank, doel, afleiders: kiesN(klankAfleiders(kern.woordenbank, doel, klank), aantalAfleiders) };
    }
    case 'drie-koppelen': {
      const overigen = kiesN(drieKoppelKandidaten(kern, doel), 2);
      const paren = schud([doel, ...overigen]) as [Woord, Woord, Woord];
      return { type, paren };
    }
  }
}

/** De woorden waar een oefening om draait (bij drie-koppelen alle drie). */
export function woordenVanOefening(oefening: OefeningDefinitie): string[] {
  if ('paren' in oefening) return oefening.paren.map((w) => w.woord);
  return ['doel' in oefening ? oefening.doel.woord : oefening.woord.woord];
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

// Zelf typen alleen voor een woord dat eerder in dezelfde reeks al voorbijkwam, anders is
// het te moeilijk (verzoek van de eigenaar). Daarom staat zelf-typen nooit in de gewone
// vragen, maar komt het aan het eind, voor een woord dat al 1 of 2 keer langskwam.
function woordenIn(o: OefeningDefinitie): Woord[] {
  if ('paren' in o) return [...o.paren];
  if ('woord' in o) return [o.woord];
  return [o.doel];
}

function voegTypenToe(kern: Kern, sessie: OefeningDefinitie[], aantal: number, voorkeur?: Woord): void {
  const gezien = new Map<string, Woord>();
  for (const o of sessie) for (const w of woordenIn(o)) gezien.set(w.woord, w);
  const geschikt = [...gezien.values()].filter((w) => !w.vereistTekst && w.woord.length <= 8);
  const kort = schud(geschikt).sort((a, b) => Number(a.woord.length > 6) - Number(b.woord.length > 6));
  const volgorde = voorkeur && geschikt.includes(voorkeur) ? [voorkeur, ...kort.filter((w) => w !== voorkeur)] : kort;
  for (const w of volgorde.slice(0, aantal)) sessie.push(maakOefening(kern, w, 'zelf-typen', 0));
}

// Kleuterhoofdstuk: alleen "welk woord heeft deze letter?". De letters van het hoofdstuk
// om de beurt; het doelwoord begint met die letter, de andere woorden hebben hem nergens.
const KLEUTER_OEFENEN_VRAGEN = 6;
const KLEUTER_TOETS_VRAGEN = 8;
function genereerLetterSessie(kern: Kern, letters: string[], modus: OefenModus): OefeningDefinitie[] {
  const aantal = modus === 'oefenen' ? KLEUTER_OEFENEN_VRAGEN : KLEUTER_TOETS_VRAGEN;
  const volgorde = schud(letters);
  const gebruikt = new Set<string>();
  const sessie: OefeningDefinitie[] = [];
  for (let i = 0; i < aantal; i++) {
    const letter = volgorde[i % volgorde.length];
    const kandidaten = kern.woordenbank.filter((w) => w.woord[0] === letter);
    const nieuw = kandidaten.filter((w) => !gebruikt.has(w.woord));
    const doel = kiesN(nieuw.length > 0 ? nieuw : kandidaten, 1)[0];
    gebruikt.add(doel.woord);
    const afleiders = kiesN(KLEUTER_WOORDEN.filter((w) => !w.woord.includes(letter)), 2);
    sessie.push({ type: 'letter-herkennen', letter, doel, afleiders });
  }
  return sessie;
}

export function genereerSessie(kern: Kern, modus: OefenModus, oefeningNummer: OefeningNummer = 1): OefeningDefinitie[] {
  if (kern.letters) return genereerLetterSessie(kern, kern.letters, modus);
  const aantalAfleiders = modus === 'oefenen' ? 2 : 3;
  const vraagVoor = (doel: Woord) => maakOefening(kern, doel, kiesType(beschikbareTypen(kern, doel, [])), aantalAfleiders);

  if (modus === 'oefenen') {
    const pool = woordenVoorOefening(kern, oefeningNummer);
    const woorden = kiesN(pool, Math.min(OEFENEN_AANTAL_WOORDEN, pool.length));
    const sessie = woorden.map(vraagVoor);
    // Extra kies-vragen over woorden die al eerder in de reeks zaten (herhaling): minstens
    // één, en bij kleine oefeningen (3-4 woorden) zoveel dat er 6 vragen zijn vóór het typen.
    const herhalingen = kiesN(woorden, Math.max(1, 6 - woorden.length));
    for (const herhaal of herhalingen) {
      const soort = herhaal.vereistTekst
        ? kiesType(beschikbareTypen(kern, herhaal, []))
        : kiesN<OefeningType>(['plaatje-woord-keuze', 'woord-plaatje-keuze'], 1)[0];
      const eerste = sessie.findIndex((o) => woordenIn(o).includes(herhaal));
      const plek = eerste + 1 + Math.floor(Math.random() * (sessie.length - eerste));
      sessie.splice(plek, 0, maakOefening(kern, herhaal, soort, aantalAfleiders));
    }
    if (isZes()) voegTypenToe(kern, sessie, 1, herhalingen[0]);
    return sessie;
  }

  // Toets: de hele woordenbank van deze kern, één vraag per woord -- de samenvattende
  // herhaling van alles wat de 3 oefeningen afzonderlijk behandelden -- en aan het eind
  // twee keer zelf typen van woorden uit deze toets.
  const sessie = schud(kern.woordenbank.map(vraagVoor));
  if (isZes()) voegTypenToe(kern, sessie, 2);
  return sessie;
}
