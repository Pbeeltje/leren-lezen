import type { Woord } from '../../types.ts';

// Originele Veilig Leren Lezen (maan-versie) plaatjes, uitgesneden met
// bronbestanden/crop-vll.py uit de kern 1-6 overzichtskaart.
export const vll = (woord: string, vereistTekst = false): Woord => ({
  woord,
  afbeeldingPad: `/assets/images/woorden/vll/${woord}.png`,
  ...(vereistTekst ? { vereistTekst } : {}),
});

// Een woord met een al bestaand plaatje uit /assets/images/woorden/.
export const bestaand = (woord: string, ext: 'svg' | 'jpg' | 'png', vereistTekst = false): Woord => ({
  woord,
  afbeeldingPad: `/assets/images/woorden/${woord}.${ext}`,
  ...(vereistTekst ? { vereistTekst } : {}),
});
