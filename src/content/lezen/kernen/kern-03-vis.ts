import type { Kern } from '../../types.ts';

const maan = { woord: 'maan', afbeeldingPad: '/assets/images/woorden/maan.svg' };
const roos = { woord: 'roos', afbeeldingPad: '/assets/images/woorden/roos.svg' };
const vis = { woord: 'vis', afbeeldingPad: '/assets/images/woorden/vis.svg' };
// Bonusoefenwoorden: na maan/roos/vis zijn m,a,n,r,o,s,v,i bekend — genoeg voor
// nieuwe, klankzuivere woorden die niet zelf structuurwoord zijn.
const raam = { woord: 'raam', afbeeldingPad: '/assets/images/woorden/raam.svg' };
const arm = { woord: 'arm', afbeeldingPad: '/assets/images/woorden/arm.svg' };

export const kern03Vis: Kern = {
  id: 'kern-03',
  volgnummer: 3,
  structuurwoord: {
    woord: 'vis',
    afbeeldingPad: '/assets/images/woorden/vis.svg',
    nieuweLetters: ['v', 'i'],
  },
  nieuweLetters: ['v', 'i'],
  oefeningen: [
    { type: 'plaatje-woord-keuze', doel: vis, afleiders: [maan, roos] },
    { type: 'woord-plaatje-keuze', doel: vis, afleiders: [maan, roos] },
    { type: 'hakken-en-plakken', woord: vis },
    { type: 'woord-bouwen', woord: vis, afleidLetters: ['e', 'k'] },
    { type: 'plaatje-woord-keuze', doel: raam, afleiders: [maan, arm] },
    { type: 'woord-plaatje-keuze', doel: arm, afleiders: [raam, roos] },
    { type: 'hakken-en-plakken', woord: raam },
  ],
  toets: [
    { type: 'woord-plaatje-keuze', doel: vis, afleiders: [maan, roos] },
    { type: 'plaatje-woord-keuze', doel: raam, afleiders: [maan, arm] },
    { type: 'woord-plaatje-keuze', doel: arm, afleiders: [raam, vis] },
    { type: 'hakken-en-plakken', woord: raam },
    { type: 'woord-bouwen', woord: vis, afleidLetters: ['e', 'k', 'p'] },
  ],
};
