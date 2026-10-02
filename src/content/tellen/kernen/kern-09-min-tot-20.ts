import type { RekenKern } from '../types.ts';

// Minsommen met aftrekgetal 11 t/m 20. Uitkomst mag 0 zijn; 0 is geen aftrekker.
export const rekenKern09MinTot20: RekenKern = {
  id: 'reken-kern-09',
  volgnummer: 9,
  titel: 'Min tot 20',
  bereik: [11, 20],
  objecten: [],
  somTeken: '-',
  oefeningVolgorde: ['som-keuze', 'som-koppelen', 'som-typen'],
};
