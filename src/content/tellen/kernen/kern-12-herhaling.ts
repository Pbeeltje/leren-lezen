import type { RekenKern } from '../types.ts';

// Herhaling: plus (tot 10 en tot 20), min (beide banden) en geld door elkaar.
// Aantallen wijken af: oefenen 8 / 5 / 8, toets 12. Zie rekenenGenerator.ts.
export const rekenKern12Herhaling: RekenKern = {
  id: 'reken-kern-12',
  volgnummer: 12,
  titel: 'Plus, min en geld',
  bereik: [0, 20],
  objecten: [],
  herhaling: 'plus-min-geld',
};
