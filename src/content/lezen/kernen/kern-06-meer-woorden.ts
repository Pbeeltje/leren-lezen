import type { Kern } from '../../types.ts';

// Bron: een Larsen "woordpuzzel" (40 woord-plaatjes) die de gebruiker aanleverde
// (bronbestanden/plaatjes3.jpg, uitgesneden met bronbestanden/crop.ps1). Puur
// woordenschat-uitbreiding na VLL kern 6. 'sok' en 'vuur' gebruiken het VLL-plaatje:
// hun Larsen-uitsnede had tekst (www.larsen...) resp. een stukje van de wolf aan de rand.
const pad = (woord: string) => `/assets/images/woorden/${woord}.jpg`;
const woord = (w: string) => ({ woord: w, afbeeldingPad: pad(w) });
const vll = (w: string) => ({ woord: w, afbeeldingPad: `/assets/images/woorden/vll/${w}.png` });

export const kern06MeerWoorden: Kern = {
  id: 'kern-06',
  volgnummer: 11,
  titel: 'meer woorden',
  structuurwoorden: [
    { woord: 'bal', afbeeldingPad: pad('bal'), nieuweLetters: [] },
    { woord: 'kaas', afbeeldingPad: pad('kaas'), nieuweLetters: [] },
    { woord: 'noot', afbeeldingPad: pad('noot'), nieuweLetters: [] },
  ],
  nieuweLetters: [],
  woordenbank: [
    woord('bal'),
    woord('egel'),
    woord('gans'),
    woord('kaas'),
    woord('noot'),
    woord('oog'),
    woord('pet'),
    vll('sok'),
    woord('ster'),
    vll('vuur'),
    woord('wolf'),
  ],
  zinnen: [
    { zin: 'De ___ heeft heel veel stekels.', doel: woord('egel'), afleiders: [woord('gans'), woord('wolf')] },
    { zin: 'Op mijn hoofd zet ik een ___.', doel: woord('pet'), afleiders: [vll('sok'), woord('bal')] },
  ],
};
