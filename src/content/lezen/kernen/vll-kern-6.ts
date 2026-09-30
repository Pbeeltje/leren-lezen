import type { Kern } from '../../types.ts';
import { bestaand, vll } from './vll-hulp.ts';

// Veilig Leren Lezen maan-versie, kern 6: geit, uil, pauw, duif, ei.
// Nieuw: f en de klanken ei, au(w).
const geit = vll('geit');
const uil = vll('uil');
const pauw = vll('pauw');
const duif = vll('duif');
const ei = vll('ei');
const olifant = bestaand('olifant', 'svg');
const giraf = bestaand('giraf', 'svg');
const flat = bestaand('flat', 'png');
const fruit = bestaand('fruit', 'png');
const auto = bestaand('auto', 'svg');
const wolf = bestaand('wolf', 'jpg');
const krokodil = bestaand('krokodil', 'svg');

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
  nieuweLetters: ['f'],
  woordenbank: [geit, uil, pauw, duif, ei, olifant, giraf, flat, fruit, auto, wolf, krokodil],
  zinnen: [
    { zin: 'De kip legt een ___.', doel: ei, afleiders: [uil, duif] },
    { zin: "'s Nachts roept de ___ oehoe.", doel: uil, afleiders: [geit, pauw] },
    { zin: 'De ___ heeft een prachtige staart.', doel: pauw, afleiders: [duif, geit] },
    { zin: 'De ___ geeft melk en eet gras.', doel: geit, afleiders: [uil, ei] },
    { zin: 'Op het plein pikt een ___ broodkruimels.', doel: duif, afleiders: [pauw, geit] },
  ],
};
