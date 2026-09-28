import type { RekenKern } from '../types.ts';

// 11-20 (tienstructuur): plaatjes tellen tot 17-20 is niet meer zinvol (te veel om in
// één oogopslag te overzien). Twee oefentypen dus i.p.v. één: reeks-aanvullen (dekt het
// hele bereik) en dubbele-dobbelsteen-naar-cijfer (een vaste "volle tien"-dobbelsteen
// plus een gewone dobbelsteen voor de eenheid, dekt 11-16 — een dobbelsteen kan nu
// eenmaal niet verder dan 6 stippen tonen).
export const rekenKern03Getallen11Tot20: RekenKern = {
  id: 'reken-kern-03',
  volgnummer: 3,
  titel: 'Getallen 11 t/m 20',
  bereik: [11, 20],
  objecten: [],
  oefeningTypen: ['reeks-aanvullen', 'dubbele-dobbelsteen-naar-cijfer'],
};
