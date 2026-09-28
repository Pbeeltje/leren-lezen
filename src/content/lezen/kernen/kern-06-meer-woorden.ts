import type { Kern } from '../../types.ts';

// Bron: een Larsen "woordpuzzel" (40 woord-plaatjes) die de gebruiker aanleverde. Deze
// kern gebruikt alleen woorden die met de al bekende 22 letters klankzuiver zijn — dus
// puur woordenschat-uitbreiding, geen nieuwe letters, net als gevraagd ("zelfde
// moeilijkheidsgraad, gewoon meer woorden"). Woorden met tweeklanken (duim, fruit, huis,
// koe, muis, poes, uil, hoed, geit, trein) en kleurwoorden (rood — geen eenduidig plaatje)
// zijn bewust overgeslagen voor een latere, aparte kern.
const pad = (woord: string) => `/assets/images/woorden/${woord}.svg`;
const woord = (w: string) => ({ woord: w, afbeeldingPad: pad(w) });

export const kern06MeerWoorden: Kern = {
  id: 'kern-06',
  volgnummer: 6,
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
    woord('sok'),
    woord('ster'),
    woord('vuur'),
    woord('wolf'),
  ],
  zinnen: [],
};
