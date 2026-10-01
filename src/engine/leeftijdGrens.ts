import { haalGroep } from './progressStore.ts';
import type { Kern } from '../content/types.ts';
import { KERNEN } from '../content/lezen/kernen/kernen.index.ts';
import { KLEUTER_KERNEN } from '../content/lezen/kernen/kleuter-letters.ts';
import type { RekenKern } from '../content/tellen/types.ts';
import { REKEN_KERNEN } from '../content/tellen/kernen/kernen.index.ts';
import { KLEUTER_REKEN_KERNEN } from '../content/tellen/kernen/kleuter-tellen.ts';

// Leren lezen: kleuters hebben een eigen, makkelijke reeks (alleen letters herkennen).
export function leesKernen(): Kern[] {
  return haalGroep() === 'kleuter' ? KLEUTER_KERNEN : KERNEN;
}

// Tellen: kleuters ook een eigen reeks (alleen hoeveelheid bij cijfer, tot 4/6/8/10).
export function rekenKernen(): RekenKern[] {
  return haalGroep() === 'kleuter' ? KLEUTER_REKEN_KERNEN : REKEN_KERNEN;
}

// Kleuters krijgen alleen de eerste leesboekjes; groep 3 alles.
const MAX_HOOFDSTUKKEN: Partial<Record<string, number>> = { kleuter: 2 };

export function aantalHoofdstukken(totaal: number): number {
  const groep = haalGroep();
  return Math.min(totaal, (groep && MAX_HOOFDSTUKKEN[groep]) || totaal);
}
