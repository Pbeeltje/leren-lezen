import type { Kern } from '../../types.ts';
import { bestaand } from './vll-hulp.ts';

// Themahoofdstuk (na VLL kern 6). Woorden met klanken als aa, ou, ui, ij, ei, eeuw en aai, buiten de VLL-woordenlijsten.
const laars = bestaand('laars', 'svg');
const zwaan = bestaand('zwaan', 'svg');
const baard = bestaand('baard', 'svg');
const touw = bestaand('touw', 'svg');
const vrouw = bestaand('vrouw', 'svg');
const sleutel = bestaand('sleutel', 'svg');
const ijsbeer = bestaand('ijsbeer', 'svg');
const eiland = bestaand('eiland', 'svg');
const haai = bestaand('haai', 'svg');
const droog = bestaand('droog', 'svg', true);

export const kern07Klanken: Kern = {
  id: 'kern-07',
  volgnummer: 12,
  titel: 'klanken',
  structuurwoorden: [],
  nieuweLetters: [],
  woordenbank: [laars, zwaan, baard, touw, vrouw, sleutel, ijsbeer, eiland, haai, droog],
  zinnen: [
    { zin: 'Opa heeft een grote grijze ___.', doel: baard, afleiders: [eiland, haai] },
    { zin: 'Met de ___ doe ik de deur open.', doel: sleutel, afleiders: [zwaan, baard] },
    { zin: 'De ___ zwemt in de zee en heeft scherpe tanden.', doel: haai, afleiders: [sleutel, laars] },
    { zin: 'Het regent, dus ik trek mijn ___ aan.', doel: laars, afleiders: [touw, eiland] },
    { zin: 'De witte ___ zwemt in de vijver.', doel: zwaan, afleiders: [sleutel, baard] },
    { zin: 'De ___ woont op het ijs.', doel: ijsbeer, afleiders: [eiland, vrouw] },
    { zin: 'De was is niet meer nat. Hij is ___.', doel: droog, afleiders: [touw, laars] },
    { zin: 'Midden in de zee ligt een klein ___ met een palmboom.', doel: eiland, afleiders: [touw, baard] },
    { zin: 'Met een ___ binden we de boot vast.', doel: touw, afleiders: [zwaan, eiland] },
  ],
};
