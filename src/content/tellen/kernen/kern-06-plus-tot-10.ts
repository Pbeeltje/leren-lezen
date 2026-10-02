import type { RekenKern } from '../types.ts';

// Kale plussommen tot 10, zonder plaatje. Kern 04 blijft de erbij-versie met plaatjes.
export const rekenKern06PlusTot10: RekenKern = {
  id: 'reken-kern-06',
  volgnummer: 6,
  titel: 'Plus tot 10',
  bereik: [1, 10],
  objecten: [],
  somTeken: '+',
  oefeningVolgorde: ['som-keuze', 'som-koppelen', 'som-typen'],
};
