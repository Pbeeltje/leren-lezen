import type { RekenKern } from '../types.ts';

// Briefjes van 5, 10 en 20 plus munten. Oefening 1 alleen een briefje van 5.
export const rekenKern11Briefjes: RekenKern = {
  id: 'reken-kern-11',
  volgnummer: 11,
  titel: 'Munten en briefjes',
  bereik: [1, 50],
  objecten: [],
  geld: 'briefjes',
  oefeningVolgorde: ['geld-keuze', 'geld-keuze', 'geld-typen'],
};
