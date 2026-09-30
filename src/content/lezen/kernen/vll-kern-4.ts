import type { Kern } from '../../types.ts';
import { bestaand, vll } from './vll-hulp.ts';

// Veilig Leren Lezen maan-versie, kern 4: huis, weg, bos, tak, hut.
// Nieuw: h, w en de korte klinkers a (tak) en u (hut).
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
const heet = bestaand('heet', 'svg', true);
const kat = bestaand('kat', 'svg');
const gans = bestaand('gans', 'jpg');
const arm = bestaand('arm', 'jpg');
const ram = bestaand('ram', 'svg');
// Extra woorden met Fluent Emoji-plaatjes (MIT), alleen met letters die al bekend zijn.
const hand = bestaand('hand', 'svg');
const tand = bestaand('tand', 'svg');
const bus = bestaand('bus', 'svg');
const hart = bestaand('hart', 'svg');
const mond = bestaand('mond', 'svg');
const tent = bestaand('tent', 'svg');

export const vllKern4: Kern = {
  id: 'vll-kern-4',
  volgnummer: 4,
  titel: 'huis, weg & bos',
  structuurwoorden: [
    { woord: 'huis', afbeeldingPad: huis.afbeeldingPad, nieuweLetters: ['h'] },
    { woord: 'weg', afbeeldingPad: weg.afbeeldingPad, nieuweLetters: ['w'] },
    { woord: 'bos', afbeeldingPad: bos.afbeeldingPad, nieuweLetters: [] },
    { woord: 'tak', afbeeldingPad: tak.afbeeldingPad, nieuweLetters: ['a'] },
    { woord: 'hut', afbeeldingPad: hut.afbeeldingPad, nieuweLetters: ['u'] },
  ],
  nieuweLetters: ['h', 'w', 'a', 'u'],
  woordenbank: [huis, weg, bos, tak, hut, hond, haan, wind, muts, onweer, heet, kat, gans, arm, ram, hand, tand, bus, hart, mond, tent],
  zinnen: [
    { zin: 'Pas op, de soep is nog ___!', doel: heet, afleiders: [hut, weg] },
    { zin: 'De auto rijdt over de ___.', doel: weg, afleiders: [bos, tak] },
    { zin: 'In het ___ staan heel veel bomen.', doel: bos, afleiders: [weg, hut] },
    { zin: 'De vogel zit in de boom op een ___.', doel: tak, afleiders: [hut, huis] },
    { zin: 'Van takken en een deken bouw ik een ___.', doel: hut, afleiders: [tak, weg] },
    { zin: 'Na school ga ik naar ___.', doel: huis, afleiders: [bos, hut] },
  ],
};
