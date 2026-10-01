import type { Woord } from '../../types.ts';

// Woord met plaatje. Vroeger de originele VLL-plaatjes; die mogen we niet verspreiden, dus nu
// Fluent Emoji of eigen tekeningen (bronbestanden/teken-woorden.py) in /woorden/.
export const vll = (woord: string, vereistTekst = false): Woord => ({
  woord,
  afbeeldingPad: `assets/images/woorden/${woord}.svg`,
  ...(vereistTekst ? { vereistTekst } : {}),
});

// Een woord met een al bestaand plaatje uit /assets/images/woorden/.
export const bestaand = (woord: string, ext: 'svg', vereistTekst = false): Woord => ({
  woord,
  afbeeldingPad: `assets/images/woorden/${woord}.${ext}`,
  ...(vereistTekst ? { vereistTekst } : {}),
});
