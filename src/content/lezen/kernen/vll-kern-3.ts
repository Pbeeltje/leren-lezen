import type { Kern } from '../../types.ts';
import { bestaand, vll } from './vll-hulp.ts';

// Veilig Leren Lezen maan-versie, kern 3: doos, poes, koek, ijs, zeep.
// Nieuw: d, z en de klanken oe, ij.
const doos = vll('doos');
const poes = vll('poes');
const koek = vll('koek');
const ijs = vll('ijs');
const zeep = vll('zeep');
const das = bestaand('das', 'svg');
const zon = bestaand('zon', 'jpg');
const bij = bestaand('bij', 'jpg');
const deur = bestaand('deur', 'svg');
const zebra = bestaand('zebra', 'svg');
const voet = bestaand('voet', 'jpg');
const eend = bestaand('eend', 'jpg');
const droog = bestaand('droog', 'svg', true);

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
  nieuweLetters: ['d', 'z'],
  woordenbank: [doos, poes, koek, ijs, zeep, das, zon, bij, deur, zebra, voet, eend, droog],
  zinnen: [
    { zin: 'De was is niet meer nat. Hij is ___.', doel: droog, afleiders: [zeep, koek] },
    { zin: 'De ___ speelt met een bolletje wol.', doel: poes, afleiders: [doos, koek] },
    { zin: 'Op een warme dag eet ik een ___.', doel: ijs, afleiders: [zeep, doos] },
    { zin: 'Ik was mijn handen met ___.', doel: zeep, afleiders: [ijs, koek] },
    { zin: 'Het cadeau zit in een grote ___.', doel: doos, afleiders: [poes, zeep] },
    { zin: 'Bij de thee eet ik een ___.', doel: koek, afleiders: [doos, ijs] },
  ],
};
