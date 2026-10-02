import type { RekenKern } from '../types.ts';

// Alleen plussommen met uitkomst 11 t/m 20. De makkelijke sommen tot 10 zitten hier niet in.
export const rekenKern08PlusTot20: RekenKern = {
  id: 'reken-kern-08',
  volgnummer: 8,
  titel: 'Plus tot 20',
  bereik: [11, 20],
  objecten: [],
  somTeken: '+',
  oefeningVolgorde: ['som-keuze', 'som-koppelen', 'som-typen'],
};
