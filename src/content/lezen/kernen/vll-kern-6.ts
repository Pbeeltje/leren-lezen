import type { Kern } from '../../types.ts';
import { bestaand, vll } from './vll-hulp.ts';

// Veilig Leren Lezen maan-versie, kern 6: geit, uil, pauw, duif, ei.
// Nieuw: f en de klanken ei, au(w). Aangevuld met eenlettergrepige woorden;
// olifant/giraf/auto/krokodil/flat passen hier niet (open lettergrepen, g als 'zj',
// Engelse a) en staan alleen nog in de themahoofdstukken.
const geit = vll('geit');
const uil = vll('uil');
const pauw = vll('pauw');
const duif = vll('duif');
const ei = vll('ei');
const fruit = bestaand('fruit', 'png');
const wolf = bestaand('wolf', 'jpg');
const spook = bestaand('spook', 'png');
const pot = bestaand('pot', 'png');
const boom = bestaand('boom', 'png');
// Extra woorden met Fluent Emoji-plaatjes (MIT), alleen met letters die al bekend zijn.
const fiets = bestaand('fiets', 'svg');
const trein = bestaand('trein', 'svg');

export const vllKern6: Kern = {
  id: 'vll-kern-6',
  volgnummer: 6,
  titel: 'geit, uil & pauw',
  structuurwoorden: [
    { woord: 'geit', afbeeldingPad: geit.afbeeldingPad, nieuweLetters: ['ei'] },
    { woord: 'uil', afbeeldingPad: uil.afbeeldingPad, nieuweLetters: [] },
    { woord: 'pauw', afbeeldingPad: pauw.afbeeldingPad, nieuweLetters: ['au'] },
    { woord: 'duif', afbeeldingPad: duif.afbeeldingPad, nieuweLetters: ['f'] },
    { woord: 'ei', afbeeldingPad: ei.afbeeldingPad, nieuweLetters: [] },
  ],
  nieuweLetters: ['ei', 'au', 'f'],
  woordenbank: [geit, uil, pauw, duif, ei, fruit, wolf, spook, pot, boom, fiets, trein],
  zinnen: [
    { zin: 'De kip legt een ___.', doel: ei, afleiders: [uil, duif] },
    { zin: "'s Nachts roept de ___ oehoe.", doel: uil, afleiders: [geit, pauw] },
    { zin: 'De ___ zet zijn staart open, vol mooie kleuren.', doel: pauw, afleiders: [duif, geit] },
    { zin: 'De ___ geeft melk en eet gras.', doel: geit, afleiders: [uil, ei] },
    { zin: 'Op het plein pikt een ___ broodkruimels.', doel: duif, afleiders: [pauw, geit] },
  ],
};
