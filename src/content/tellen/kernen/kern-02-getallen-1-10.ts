import type { RekenKern } from '../types.ts';

const pad = (naam: string) => `assets/icons/${naam}.svg`;

export const rekenKern02Getallen1Tot10: RekenKern = {
  id: 'reken-kern-02',
  volgnummer: 2,
  titel: 'Getallen 1 t/m 10',
  bereik: [1, 10],
  objecten: [
    { naam: 'ster', icoonPad: pad('ster') },
    { naam: 'appel', icoonPad: pad('appel') },
    { naam: 'boom', icoonPad: pad('natuur') },
    { naam: 'eend', icoonPad: pad('telobject-eend') },
    { naam: 'bal', icoonPad: pad('telobject-bal') },
  ],
  oefeningTypen: ['hoeveelheid-naar-cijfer', 'hoeveelheid-typen', 'cijfer-naar-hoeveelheid', 'dobbelsteen-naar-cijfer', 'vingers-naar-cijfer'],
};
