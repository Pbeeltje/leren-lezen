import type { RekenKern } from '../types.ts';

// Kale minsommen tot 10. Aftrekker minstens 1, uitkomst mag 0 zijn (5 − 5).
export const rekenKern07MinTot10: RekenKern = {
  id: 'reken-kern-07',
  volgnummer: 7,
  titel: 'Min tot 10',
  bereik: [1, 10],
  objecten: [],
  somTeken: '-',
  oefeningVolgorde: ['som-keuze', 'som-koppelen', 'som-typen'],
};
