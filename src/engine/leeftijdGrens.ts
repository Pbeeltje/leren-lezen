import { haalGroep } from './progressStore.ts';
import type { Kern } from '../content/types.ts';
import { KERNEN } from '../content/lezen/kernen/kernen.index.ts';
import { KLEUTER_KERNEN } from '../content/lezen/kernen/kleuter-letters.ts';
import type { RekenKern } from '../content/tellen/types.ts';
import { REKEN_KERNEN } from '../content/tellen/kernen/kernen.index.ts';
import { KLEUTER_REKEN_KERNEN } from '../content/tellen/kernen/kleuter-tellen.ts';
import { TIJD_KERNEN, isTijdKern } from '../content/tijd/kernen.ts';

// Leren lezen: kleuters hebben een eigen, makkelijke reeks (alleen letters herkennen).
export function leesKernen(): Kern[] {
  return haalGroep() === 'kleuter' ? KLEUTER_KERNEN : KERNEN;
}

// Tellen: kleuters ook een eigen reeks (alleen hoeveelheid bij cijfer, tot 4/6/8/10).
export function rekenKernen(): RekenKern[] {
  return haalGroep() === 'kleuter' ? KLEUTER_REKEN_KERNEN : REKEN_KERNEN;
}

// RekenChapterScreen/RekenOefeningScreen draaien twee reeksen: Tellen, en Tijd lezen
// (klokkijken, dagen, maanden; onder Leren lezen, alleen groep 3).
export type RekenReeks = 'tellen' | 'tijd';

export function kernenVanReeks(reeks: RekenReeks): RekenKern[] {
  return reeks === 'tijd' ? TIJD_KERNEN : rekenKernen();
}

export function reeksVanKern(kern: RekenKern): RekenReeks {
  return isTijdKern(kern) ? 'tijd' : 'tellen';
}

// Kleuters krijgen alleen de eerste leesboekjes; groep 3 alles.
const MAX_HOOFDSTUKKEN: Partial<Record<string, number>> = { kleuter: 2 };

export function aantalHoofdstukken(totaal: number): number {
  const groep = haalGroep();
  return Math.min(totaal, (groep && MAX_HOOFDSTUKKEN[groep]) || totaal);
}
