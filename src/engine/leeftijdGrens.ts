import { haalVoortgang } from './progressStore.ts';

// Vijfjarigen krijgen alleen de eerste hoofdstukken van lezen en rekenen; zes jaar alles.
const MAX_HOOFDSTUKKEN: Partial<Record<number, number>> = { 5: 2 };

export function aantalHoofdstukken(totaal: number): number {
  const leeftijd = haalVoortgang().laatstGekozenLeeftijd;
  return Math.min(totaal, (leeftijd && MAX_HOOFDSTUKKEN[leeftijd]) || totaal);
}
