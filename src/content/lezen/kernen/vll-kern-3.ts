import type { Kern } from '../../types.ts';
import { bestaand, vll } from './vll-hulp.ts';

// Veilig Leren Lezen maan-versie, kern 3: doos, poes, koek, ijs, zeep.
// Nieuw: d, z en de klanken oe, ij. Nog geen korte a (kern 4). 'droog' staat hier
// bewust niet: zijn plaatje (een zon) is niet te onderscheiden van 'zon'.
const doos = vll('doos');
const poes = vll('poes');
const koek = vll('koek');
const ijs = vll('ijs');
const zeep = vll('zeep');
const zon = bestaand('zon', 'jpg');
const bij = bestaand('bij', 'jpg');
const deur = bestaand('deur', 'svg');
const voet = bestaand('voet', 'jpg');
const eend = bestaand('eend', 'jpg');
// Extra woorden met Fluent Emoji-plaatjes (MIT), alleen met letters die al bekend zijn.
const boek = bestaand('boek', 'svg');
const hoed = bestaand('hoed', 'svg');
const soep = bestaand('soep', 'svg');
const zee = bestaand('zee', 'svg');
const bed = bestaand('bed', 'svg');
const koe = bestaand('koe', 'svg');
const brood = bestaand('brood', 'svg');

export const vllKern3: Kern = {
  id: 'vll-kern-3',
  volgnummer: 3,
  titel: 'doos, poes & koek',
  structuurwoorden: [
    { woord: 'doos', afbeeldingPad: doos.afbeeldingPad, nieuweLetters: ['d'] },
    { woord: 'poes', afbeeldingPad: poes.afbeeldingPad, nieuweLetters: ['oe'] },
    { woord: 'koek', afbeeldingPad: koek.afbeeldingPad, nieuweLetters: [] },
    { woord: 'ijs', afbeeldingPad: ijs.afbeeldingPad, nieuweLetters: ['ij'] },
    { woord: 'zeep', afbeeldingPad: zeep.afbeeldingPad, nieuweLetters: ['z'] },
  ],
  nieuweLetters: ['d', 'oe', 'ij', 'z'],
  woordenbank: [doos, poes, koek, ijs, zeep, zon, bij, deur, voet, eend, boek, hoed, soep, zee, bed, koe, brood],
  zinnen: [
    { zin: 'De ___ speelt met een bolletje wol.', doel: poes, afleiders: [doos, koek] },
    { zin: 'Het is warm. Ik lik aan een ___.', doel: ijs, afleiders: [zeep, doos] },
    { zin: 'Ik was mijn handen met ___.', doel: zeep, afleiders: [ijs, koek] },
    { zin: 'Het cadeau zit in een grote ___.', doel: doos, afleiders: [poes, zeep] },
    { zin: 'Bij de thee eet ik een ___.', doel: koek, afleiders: [doos, ijs] },
  ],
};
