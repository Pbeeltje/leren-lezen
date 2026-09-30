import type { Kern } from '../../types.ts';
import { bestaand, vll } from './vll-hulp.ts';

// Veilig Leren Lezen maan-versie, kern 4: huis, weg, bos, tak, hut.
// Nieuw: h, w, u.
const huis = vll('huis');
const weg = vll('weg');
const bos = vll('bos');
const tak = vll('tak');
const hut = vll('hut');
const hond = bestaand('hond', 'svg');
const haan = bestaand('haan', 'svg');
const wind = bestaand('wind', 'svg');
const muts = bestaand('muts', 'png');
const onweer = bestaand('onweer', 'svg');
const panda = bestaand('panda', 'svg');
const heet = bestaand('heet', 'svg', true);

export const vllKern4: Kern = {
  id: 'vll-kern-4',
  volgnummer: 4,
  titel: 'huis, weg & bos',
  structuurwoorden: [
    { woord: 'huis', afbeeldingPad: huis.afbeeldingPad, nieuweLetters: ['h'] },
    { woord: 'weg', afbeeldingPad: weg.afbeeldingPad, nieuweLetters: ['w'] },
    { woord: 'bos', afbeeldingPad: bos.afbeeldingPad, nieuweLetters: [] },
    { woord: 'tak', afbeeldingPad: tak.afbeeldingPad, nieuweLetters: [] },
    { woord: 'hut', afbeeldingPad: hut.afbeeldingPad, nieuweLetters: ['u'] },
  ],
  nieuweLetters: ['h', 'w', 'u'],
  woordenbank: [huis, weg, bos, tak, hut, hond, haan, wind, muts, onweer, panda, heet],
  zinnen: [
    { zin: 'Pas op, de soep is nog ___!', doel: heet, afleiders: [hut, weg] },
    { zin: 'De auto rijdt over de ___.', doel: weg, afleiders: [bos, tak] },
    { zin: 'In het ___ staan heel veel bomen.', doel: bos, afleiders: [weg, hut] },
    { zin: 'De vogel zit op een ___.', doel: tak, afleiders: [hut, huis] },
    { zin: 'Wij bouwen een ___ in de boom.', doel: hut, afleiders: [tak, weg] },
    { zin: 'Na school ga ik naar ___.', doel: huis, afleiders: [bos, hut] },
  ],
};
