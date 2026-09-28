import type { Kern } from '../../types.ts';

// Thema "dierentuindieren" (bekende, makkelijke namen — geen tweetekenklanken zoals
// leeuw/tijger die het net te moeilijk zouden maken). Introduceert f, b.
const pad = (woord: string) => `/assets/images/woorden/${woord}.svg`;
const woord = (w: string) => ({ woord: w, afbeeldingPad: pad(w) });

export const kern04Dierentuindieren: Kern = {
  id: 'kern-04',
  volgnummer: 4,
  titel: 'dierentuindieren',
  structuurwoorden: [
    { woord: 'aap', afbeeldingPad: pad('aap'), nieuweLetters: [] },
    { woord: 'olifant', afbeeldingPad: pad('olifant'), nieuweLetters: ['f'] },
    { woord: 'zebra', afbeeldingPad: pad('zebra'), nieuweLetters: ['b'] },
  ],
  nieuweLetters: ['f', 'b'],
  woordenbank: [
    woord('aap'),
    woord('olifant'),
    woord('zebra'),
    woord('giraf'),
    woord('panda'),
    woord('kameel'),
    woord('krokodil'),
    woord('vos'),
    woord('beer'),
    woord('das'),
  ],
  zinnen: [],
};
