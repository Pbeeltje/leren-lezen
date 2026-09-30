import type { Woord } from '../content/types.ts';
import { KERNEN } from '../content/lezen/kernen/kernen.index.ts';

export interface LuisterVraag {
  doel: Woord;
  opties: Woord[]; // geschud, bevat doel + afleiders
}

function schud<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

// Eén platte, gedupliceerde-namen-vrije pool van alle woorden uit alle lees-kernen
// samen, met bijvoeglijke naamwoorden (vereistTekst) eruit gefilterd -- die hebben een
// zin nodig om ondubbelzinnig te zijn, en een driejarige kan geen zin lezen. Hergebruikt
// bewust de bestaande content/audio i.p.v. een aparte woordenlijst te onderhouden: elk
// woord dat ooit aan een leeskern wordt toegevoegd (met een plaatje) doet hier vanzelf
// mee, zolang het geen vereistTekst-woord is.
// Alleen woorden waarvan echt een opname bestaat: nieuwe woorden krijgen pas audio
// als de gebruiker een volgende opnamelijst (bronbestanden/audio-manifest*.json)
// heeft ingesproken, en een luisterspel zonder geluid is onspeelbaar.
type ManifestRegel = { path: string };
const manifesten = import.meta.glob<ManifestRegel[]>('../../bronbestanden/audio-manifest*.json', {
  eager: true,
  import: 'default',
});
const WOORDEN_MET_AUDIO = new Set(
  Object.values(manifesten)
    .flat()
    .map((regel) => regel.path.match(/audio\/woorden\/(.+)\.mp3$/)?.[1])
    .filter((w): w is string => Boolean(w)),
);

function bouwWoordenpool(): Woord[] {
  const gezien = new Set<string>();
  const pool: Woord[] = [];
  for (const kern of KERNEN) {
    for (const woord of kern.woordenbank) {
      if (woord.vereistTekst) continue;
      if (!WOORDEN_MET_AUDIO.has(woord.woord)) continue;
      if (gezien.has(woord.woord)) continue;
      gezien.add(woord.woord);
      pool.push(woord);
    }
  }
  return pool;
}

let poolCache: Woord[] | null = null;

export function woordenpool(): Woord[] {
  if (!poolCache) poolCache = bouwWoordenpool();
  return poolCache;
}

/** Woorden met onderling verschillende plaatjes (sommige woorden delen een plaatje). */
export function kiesVerschillendePlaatjes(woorden: Woord[], aantal: number): Woord[] {
  const gezien = new Set<string>();
  const gekozen: Woord[] = [];
  for (const w of woorden) {
    if (gekozen.length >= aantal) break;
    if (gezien.has(w.afbeeldingPad)) continue;
    gezien.add(w.afbeeldingPad);
    gekozen.push(w);
  }
  return gekozen;
}

/**
 * Kiest een doelwoord en `aantalOpties - 1` afleiders, allemaal geschud. `vorigDoel`
 * wordt vermeden, zodat hetzelfde woord niet twee keer achter elkaar gevraagd wordt.
 */
export function genereerLuisterVraag(aantalOpties = 3, vorigDoel?: string, woorden?: Woord[]): LuisterVraag {
  const pool = woorden && woorden.length >= aantalOpties ? woorden : woordenpool();
  const geschud = schud(pool);
  const doelIndex = geschud.length > 1 && geschud[0].woord === vorigDoel ? 1 : 0;
  const doel = geschud[doelIndex];
  const rest = geschud.filter((_, i) => i !== doelIndex);
  const afleiders = kiesVerschillendePlaatjes([doel, ...rest], aantalOpties).slice(1);
  return { doel, opties: schud([doel, ...afleiders]) };
}

/** Alle bruikbare woorden (plaatje + opname) van een luisterhoofdstuk. */
export function hoofdstukWoorden(namen: string[]): Woord[] {
  const gewenst = new Set(namen);
  return woordenpool().filter((w) => gewenst.has(w.woord));
}

/** Een willekeurig plaatje voor een woord, ook als het (nog) geen opname heeft. */
export function plaatjeVan(naam: string): string | undefined {
  for (const kern of KERNEN) {
    const w = kern.woordenbank.find((x) => x.woord === naam);
    if (w) return w.afbeeldingPad;
  }
  return undefined;
}
