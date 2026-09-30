import type { RekenKern } from '../types.ts';

// Aanvankelijk rekenen (groep 3, ~1980-1995): geen enkele dominante methode zoals
// Veilig Leren Lezen voor lezen — het veld was rond 1985 ongeveer fifty-fifty verdeeld
// tussen mechanistische en realistische rekenmethodes. Wél stabiel en methode-overstijgend:
// het "getalbeeld" — een vaste visuele opmaak van een hoeveelheid die een kind leert
// herkennen zonder te tellen (subitiseren), met het dobbelsteenbeeld als het klassieke
// voorbeeld, en de vijfstructuur (getallen rond 5 opbouwen) als organiserend principe
// voor het bereik tot en met 10. Getallen 1 t/m 6 dekken zowel de vijfstructuur als het
// volledige dobbelsteenbereik — een logische eerste stap vóór 7 t/m 10.
const pad = (naam: string) => `assets/icons/${naam}.svg`;

export const rekenKern01Getallen1Tot6: RekenKern = {
  id: 'reken-kern-01',
  volgnummer: 1,
  titel: 'Getallen 1 t/m 6',
  bereik: [1, 6],
  objecten: [
    { naam: 'ster', icoonPad: pad('ster') },
    { naam: 'appel', icoonPad: pad('appel') },
    { naam: 'boom', icoonPad: pad('natuur') },
    { naam: 'eend', icoonPad: pad('telobject-eend') },
    { naam: 'bal', icoonPad: pad('telobject-bal') },
  ],
  // Reeksen en optellen zijn eigen, aparte kernen (03/04) — hier alleen de
  // hoeveelheid/getalbeeld-oefeningen.
  oefeningTypen: ['hoeveelheid-naar-cijfer', 'hoeveelheid-typen', 'cijfer-naar-hoeveelheid', 'dobbelsteen-naar-cijfer', 'vingers-naar-cijfer'],
};
