import type { RekenKern } from '../types.ts';

// Alleen munten, nooit een briefje. Oefening 1 is een klein bedrag; 2 en 3 gaan tot 10 euro.
export const rekenKern10Munten: RekenKern = {
  id: 'reken-kern-10',
  volgnummer: 10,
  titel: 'Munten tot 10',
  bereik: [1, 10],
  objecten: [],
  geld: 'munten',
  oefeningVolgorde: ['geld-keuze', 'geld-keuze', 'geld-typen'],
};
