import type { Kern } from '../../types.ts';

// Thema "boerderijdieren". Bouwt voort op kern-01/02; introduceert h, p.
const pad = (woord: string, ext = 'svg') => `/assets/images/woorden/${woord}.${ext}`;
const woord = (w: string, ext = 'svg') => ({ woord: w, afbeeldingPad: pad(w, ext) });

export const kern03Boerderijdieren: Kern = {
  id: 'kern-03',
  volgnummer: 8,
  titel: 'boerderijdieren',
  structuurwoorden: [
    { woord: 'kat', afbeeldingPad: pad('kat'), nieuweLetters: [] },
    { woord: 'hond', afbeeldingPad: pad('hond'), nieuweLetters: ['h'] },
    { woord: 'kip', afbeeldingPad: pad('kip'), nieuweLetters: ['p'] },
  ],
  nieuweLetters: ['h', 'p'],
  woordenbank: [
    woord('kat'),
    woord('hond'),
    woord('kip'),
    woord('varken'),
    woord('eend', 'jpg'),
    woord('haan'),
    woord('ezel'),
    woord('lam'),
    woord('paard'),
  ],
  zinnen: [],
};
