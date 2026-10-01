import type { RekenKern, TelObject } from '../types.ts';

// Tellen voor kleuters: een eigen, makkelijke reeks. Alleen hoeveelheid bij cijfer en
// cijfer bij hoeveelheid, en het bereik groeit per hoofdstuk: tot 4, 6, 8 en 10.
const pad = (naam: string) => `assets/icons/${naam}.svg`;
const OBJECTEN: TelObject[] = [
  { naam: 'ster', icoonPad: pad('ster') },
  { naam: 'appel', icoonPad: pad('appel') },
  { naam: 'boom', icoonPad: pad('natuur') },
  { naam: 'eend', icoonPad: pad('telobject-eend') },
  { naam: 'bal', icoonPad: pad('telobject-bal') },
];

export const KLEUTER_REKEN_KERNEN: RekenKern[] = [4, 6, 8, 10].map((tot, i) => ({
  id: `kleuter-tellen-${i + 1}`,
  volgnummer: i + 1,
  titel: `Tellen tot ${tot}`,
  bereik: [1, tot],
  objecten: OBJECTEN,
  oefeningTypen: ['hoeveelheid-naar-cijfer', 'cijfer-naar-hoeveelheid'],
}));
