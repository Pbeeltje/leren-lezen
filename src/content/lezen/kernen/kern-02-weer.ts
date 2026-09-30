import type { Kern } from '../../types.ts';

// Themahoofdstuk "weer" (na VLL kern 6, dus alle letters/klanken zijn al bekend).
// Geschrapt: 'was' (verwarrend icoon), 'storm' (het plaatje leest als een tornado) en
// 'mist' (het mist-icoon is niet van 'wolk' te onderscheiden).
const pad = (woord: string, ext = 'svg') => `/assets/images/woorden/${woord}.${ext}`;
const woord = (w: string, vereistTekst = false, ext = 'svg') => ({ woord: w, afbeeldingPad: pad(w, ext), vereistTekst });

export const kern02Weer: Kern = {
  id: 'kern-02',
  volgnummer: 7,
  titel: 'weer',
  structuurwoorden: [
    { woord: 'zon', afbeeldingPad: pad('zon', 'jpg'), nieuweLetters: [] },
    { woord: 'regen', afbeeldingPad: pad('regen'), nieuweLetters: [] },
    { woord: 'wind', afbeeldingPad: pad('wind'), nieuweLetters: [] },
  ],
  nieuweLetters: [],
  // nat en koud zijn bijvoeglijke naamwoorden: vereistTekst + een zin (zie Woord in types.ts).
  woordenbank: [
    woord('zon', false, 'jpg'),
    woord('regen'),
    woord('wind'),
    woord('wolk'),
    woord('tas', false, 'jpg'),
    woord('nat', true),
    woord('koud', true),
  ],
  zinnen: [
    { zin: 'Door de regen is mijn jas helemaal ___.', doel: woord('nat', true), afleiders: [woord('wolk'), woord('wind')] },
    { zin: 'Buiten ligt sneeuw, het is heel ___.', doel: woord('koud', true), afleiders: [woord('wolk'), woord('tas', false, 'jpg')] },
    { zin: 'De ___ waait hard. Houd je muts vast!', doel: woord('wind'), afleiders: [woord('zon', false, 'jpg'), woord('regen')] },
  ],
};
