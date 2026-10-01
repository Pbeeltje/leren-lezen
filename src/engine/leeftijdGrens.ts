import { haalGroep } from './progressStore.ts';

// Kleuters krijgen alleen de eerste hoofdstukken van lezen en rekenen; groep 3 alles.
const MAX_HOOFDSTUKKEN: Partial<Record<string, number>> = { kleuter: 2 };

export function aantalHoofdstukken(totaal: number): number {
  const groep = haalGroep();
  return Math.min(totaal, (groep && MAX_HOOFDSTUKKEN[groep]) || totaal);
}
