import type { RekenKern } from '../types.ts';

// "Erbij" (optellen tot 10): per de aanvankelijk-rekenen-traditie leunt groep 3 hier op
// alledaagse taal ("erbij"/"eraf") i.p.v. de formelere "plus"/"min".
export const rekenKern04Optellen: RekenKern = {
  id: 'reken-kern-04',
  volgnummer: 4,
  titel: 'Optellen tot 10',
  // Sommen: 2 t/m 9 bij 'optellen', t/m 10 bij twee dobbelstenen (zie rekenenGenerator.ts;
  // beide typen negeren dit bereik verder).
  bereik: [2, 10],
  objecten: [],
  // Twee dobbelstenen = stippen samentellen, een plaatjesversie van dezelfde som.
  oefeningTypen: ['optellen', 'dubbele-dobbelsteen-naar-cijfer'],
};
