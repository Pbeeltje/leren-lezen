import type { Kern } from '../../types.ts';
import { bestaand } from './vll-hulp.ts';

// Themahoofdstuk (na VLL kern 6). Kerst. bel, muts en hulst komen van het Junior Einstein-werkblad (bronbestanden/).
const bel = bestaand('bel', 'svg');
const hulst = bestaand('hulst', 'png');
const kerstboom = bestaand('kerstboom', 'svg');
const kerstman = bestaand('kerstman', 'svg');
const sneeuwpop = bestaand('sneeuwpop', 'svg');
const pakje = bestaand('pakje', 'svg');
const rendier = bestaand('rendier', 'svg');
const engel = bestaand('engel', 'svg');
const muts = bestaand('muts', 'png');

export const kern09Kerst: Kern = {
  id: 'kern-09',
  volgnummer: 20,
  titel: 'kerst',
  structuurwoorden: [],
  nieuweLetters: [],
  woordenbank: [bel, hulst, kerstboom, kerstman, sneeuwpop, pakje, rendier, engel, muts],
  zinnen: [
    { zin: 'Tingeling! Hoor je de ___?', doel: bel, afleiders: [muts, pakje] },
    { zin: 'Onder de ___ liggen de cadeautjes.', doel: kerstboom, afleiders: [muts, bel] },
    { zin: 'De ___ heeft een rode jas en een witte baard.', doel: kerstman, afleiders: [sneeuwpop, engel] },
    { zin: 'In de sneeuw maken we een ___ met een wortel als neus.', doel: sneeuwpop, afleiders: [bel, hulst] },
    { zin: 'Het ___ trekt de slee door de lucht.', doel: rendier, afleiders: [hulst, bel] },
    { zin: 'Ik krijg een ___ met een strik erom.', doel: pakje, afleiders: [rendier, hulst] },
    { zin: 'Het is koud. Zet je ___ op!', doel: muts, afleiders: [bel, pakje] },
  ],
};
