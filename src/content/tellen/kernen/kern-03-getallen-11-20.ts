import type { RekenKern } from '../types.ts';

// 11-20 (tienstructuur): plaatjes tellen tot 17-20 is niet meer zinvol (te veel om in
// één oogopslag te overzien), dus deze kern leunt op reeks-aanvullen (getallenrij met
// een gat) i.p.v. hoeveelheid/dobbelsteen-oefeningen — dat laatste kan sowieso niet,
// een dobbelsteen heeft maar 6 kanten.
export const rekenKern03Getallen11Tot20: RekenKern = {
  id: 'reken-kern-03',
  volgnummer: 3,
  titel: 'Getallen 11 t/m 20',
  bereik: [11, 20],
  objecten: [],
  oefeningTypen: ['reeks-aanvullen'],
};
