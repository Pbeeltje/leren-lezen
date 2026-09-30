import type { Kern } from '../../types.ts';
import { bestaand } from './vll-hulp.ts';

// Themahoofdstuk (na VLL kern 6). Speelgoed (vroeger 'meer woorden': die woorden staan nu in de VLL-hoofdstukken).
const bal = bestaand('bal', 'jpg');
const ballon = bestaand('ballon', 'svg');
const vlieger = bestaand('vlieger', 'svg');
const knuffel = bestaand('knuffel', 'svg');
const trommel = bestaand('trommel', 'svg');
const gitaar = bestaand('gitaar', 'svg');
const puzzel = bestaand('puzzel', 'svg');
const dobbelsteen = bestaand('dobbelsteen', 'svg');
const robot = bestaand('robot', 'svg');
const raket = bestaand('raket', 'svg');
const step = bestaand('step', 'svg');
const krijtje = bestaand('krijtje', 'svg');

export const kern06MeerWoorden: Kern = {
  id: 'kern-06',
  volgnummer: 11,
  titel: 'speelgoed',
  structuurwoorden: [],
  nieuweLetters: [],
  woordenbank: [bal, ballon, vlieger, knuffel, trommel, gitaar, puzzel, dobbelsteen, robot, raket, step, krijtje],
  zinnen: [
    { zin: 'Het waait. Ik laat mijn ___ hoog in de lucht vliegen.', doel: vlieger, afleiders: [trommel, puzzel] },
    { zin: 'Op mijn feestje hangt een rode ___.', doel: ballon, afleiders: [step, robot] },
    { zin: 'In bed slaap ik met mijn zachte ___.', doel: knuffel, afleiders: [gitaar, trommel] },
    { zin: 'Boem boem! Ik sla op de ___.', doel: trommel, afleiders: [puzzel, step] },
    { zin: 'Ik gooi de ___ en het zijn zes stippen.', doel: dobbelsteen, afleiders: [knuffel, gitaar] },
    { zin: 'Met een ___ tekenen we op de stoep.', doel: krijtje, afleiders: [ballon, trommel] },
    { zin: 'De ___ vliegt naar de maan.', doel: raket, afleiders: [step, puzzel] },
    { zin: 'Ik schop de ___ in het doel.', doel: bal, afleiders: [robot, knuffel] },
  ],
};
