import type { Kern } from '../../types.ts';

const maan = { woord: 'maan', afbeeldingPad: '/assets/images/woorden/maan.svg' };
const roos = { woord: 'roos', afbeeldingPad: '/assets/images/woorden/roos.svg' };
const vis = { woord: 'vis', afbeeldingPad: '/assets/images/woorden/vis.svg' };

export const kern02Roos: Kern = {
  id: 'kern-02',
  volgnummer: 2,
  structuurwoord: {
    woord: 'roos',
    afbeeldingPad: '/assets/images/woorden/roos.svg',
    nieuweLetters: ['r', 'o'],
  },
  nieuweLetters: ['r', 'o'],
  oefeningen: [
    { type: 'plaatje-woord-keuze', doel: roos, afleiders: [maan, vis] },
    { type: 'woord-plaatje-keuze', doel: roos, afleiders: [maan, vis] },
    { type: 'hakken-en-plakken', woord: roos },
    { type: 'woord-bouwen', woord: roos, afleidLetters: ['e', 'p'] },
  ],
  toets: [
    { type: 'woord-plaatje-keuze', doel: roos, afleiders: [maan, vis] },
    { type: 'hakken-en-plakken', woord: roos },
    { type: 'woord-bouwen', woord: roos, afleidLetters: ['e', 'p', 'k'] },
  ],
};
