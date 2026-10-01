import { haalGroep } from './progressStore.ts';
import type { Kern } from '../content/types.ts';
import { KERNEN } from '../content/lezen/kernen/kernen.index.ts';
import { KLEUTER_KERNEN } from '../content/lezen/kernen/kleuter-letters.ts';

// Leren lezen: kleuters hebben een eigen, makkelijke reeks (alleen letters herkennen).
export function leesKernen(): Kern[] {
  return haalGroep() === 'kleuter' ? KLEUTER_KERNEN : KERNEN;
}

// Kleuters krijgen alleen de eerste hoofdstukken van rekenen; groep 3 alles.
const MAX_HOOFDSTUKKEN: Partial<Record<string, number>> = { kleuter: 2 };

export function aantalHoofdstukken(totaal: number): number {
  const groep = haalGroep();
  return Math.min(totaal, (groep && MAX_HOOFDSTUKKEN[groep]) || totaal);
}
