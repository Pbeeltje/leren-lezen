import type { Kern } from '../../types.ts';

// "Kerst": bron is een Junior Einstein-werkblad (groep 3/4) dat de gebruiker aanleverde,
// uitgesneden met bronbestanden/crop-kerst.ps1. Themahoofdstuk na VLL kern 6.
const pad = (woord: string, ext = 'png') => `/assets/images/woorden/${woord}.${ext}`;
const woord = (w: string, vereistTekst = false, ext = 'png') => ({ woord: w, afbeeldingPad: pad(w, ext), vereistTekst });

export const kern09Kerst: Kern = {
  id: 'kern-09',
  volgnummer: 14,
  titel: 'kerst',
  structuurwoorden: [
    { woord: 'bel', afbeeldingPad: pad('bel', 'svg'), nieuweLetters: [] },
    { woord: 'boom', afbeeldingPad: pad('boom'), nieuweLetters: [] },
  ],
  nieuweLetters: [],
  woordenbank: [woord('bel', false, 'svg'), woord('muts'), woord('koek'), woord('hulst'), woord('boom')],
  zinnen: [
    { zin: 'Met kerst zetten we een ___ in de kamer, vol lichtjes.', doel: woord('boom'), afleiders: [woord('bel', false, 'svg'), woord('hulst')] },
    { zin: 'Tingeling! Hoor je de ___?', doel: woord('bel', false, 'svg'), afleiders: [woord('muts'), woord('koek')] },
    { zin: 'Het is koud. Zet je ___ op je hoofd.', doel: woord('muts'), afleiders: [woord('koek'), woord('boom')] },
  ],
};
