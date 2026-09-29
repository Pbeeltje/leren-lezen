import type { Woord } from '../content/types.ts';
import { woordenpool } from './luisterenGenerator.ts';

export interface GeheugenKaart {
  id: number; // uniek per kaart (twee kaarten kunnen hetzelfde woord hebben)
  woord: Woord;
}

function schud<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

/** `aantalParen` woorden × 2 kaarten, geschud. */
export function genereerGeheugenbord(aantalParen = 4): GeheugenKaart[] {
  const pool = schud(woordenpool()).slice(0, aantalParen);
  const kaarten: GeheugenKaart[] = [];
  let id = 0;
  for (const woord of pool) {
    kaarten.push({ id: id++, woord });
    kaarten.push({ id: id++, woord });
  }
  return schud(kaarten);
}
