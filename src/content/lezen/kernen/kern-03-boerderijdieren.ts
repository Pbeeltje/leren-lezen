import type { Kern } from '../../types.ts';

// Themahoofdstuk "boerderijdieren" (na VLL kern 6: alle letters zijn al bekend).
const pad = (woord: string, ext = 'svg') => `/assets/images/woorden/${woord}.${ext}`;
const woord = (w: string, ext = 'svg') => ({ woord: w, afbeeldingPad: pad(w, ext) });

export const kern03Boerderijdieren: Kern = {
  id: 'kern-03',
  volgnummer: 8,
  titel: 'boerderijdieren',
  structuurwoorden: [
    { woord: 'kat', afbeeldingPad: pad('kat'), nieuweLetters: [] },
    { woord: 'hond', afbeeldingPad: pad('hond'), nieuweLetters: [] },
    { woord: 'kip', afbeeldingPad: pad('kip'), nieuweLetters: [] },
  ],
  nieuweLetters: [],
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
  zinnen: [
    { zin: "'s Ochtends vroeg roept de ___: kukeleku!", doel: woord('haan'), afleiders: [woord('kip'), woord('eend', 'jpg')] },
    { zin: 'Het roze ___ rolt graag in de modder.', doel: woord('varken'), afleiders: [woord('lam'), woord('paard')] },
    { zin: 'Kwak kwak, zegt de ___ in de sloot.', doel: woord('eend', 'jpg'), afleiders: [woord('kip'), woord('haan')] },
  ],
};
