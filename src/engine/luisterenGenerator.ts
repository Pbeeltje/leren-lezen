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

/** Kiest een doelwoord en `aantalOpties - 1` afleiders, allemaal geschud. */
export function genereerLuisterVraag(aantalOpties = 3): LuisterVraag {
  const pool = woordenpool();
  const geschud = schud(pool);
  const doel = geschud[0];
  const afleiders = geschud.slice(1, aantalOpties);
  return { doel, opties: schud([doel, ...afleiders]) };
}
