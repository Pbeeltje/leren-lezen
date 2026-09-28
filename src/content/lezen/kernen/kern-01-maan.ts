import type { Kern } from '../../types.ts';

// Veilig Leren Lezen, maan-versie (1991): eerste structuurwoord "maan".
// De drie structuurwoorden maan/roos/vis worden eerst als geheel (globaal) herkend,
// vóór ze in kern 2 en 3 verder ontleed worden — vandaar dat kern 1 al met alle drie
// de plaatjes werkt, ook al zijn roos en vis nog niet "geleerd".
const maan = { woord: 'maan', afbeeldingPad: '/assets/images/woorden/maan.svg' };
const roos = { woord: 'roos', afbeeldingPad: '/assets/images/woorden/roos.svg' };
const vis = { woord: 'vis', afbeeldingPad: '/assets/images/woorden/vis.svg' };

export const kern01Maan: Kern = {
  id: 'kern-01',
  volgnummer: 1,
  structuurwoord: {
    woord: 'maan',
    afbeeldingPad: '/assets/images/woorden/maan.svg',
    nieuweLetters: ['m', 'a', 'n'],
  },
  nieuweLetters: ['m', 'a', 'n'],
  oefeningen: [
    { type: 'plaatje-woord-keuze', doel: maan, afleiders: [roos, vis] },
    { type: 'woord-plaatje-keuze', doel: maan, afleiders: [roos, vis] },
    { type: 'hakken-en-plakken', woord: maan },
    { type: 'woord-bouwen', woord: maan, afleidLetters: ['o', 'p'] },
  ],
  toets: [
    { type: 'woord-plaatje-keuze', doel: maan, afleiders: [roos, vis] },
    { type: 'hakken-en-plakken', woord: maan },
    { type: 'woord-bouwen', woord: maan, afleidLetters: ['o', 'p', 'r'] },
  ],
};
