// Contracten voor het rekenonderdeel. Zelfde vormgeving als content/types.ts (lezen),
// bewust een los model omdat de inhoud fundamenteel anders is (hoeveelheden/cijfers,
// geen woorden/letters).

export interface TelObject {
  naam: string; // bv. 'ster', puur voor referentie/alt-tekst
  icoonPad: string;
}

export type RekenOefeningType =
  | 'hoeveelheid-naar-cijfer'
  | 'cijfer-naar-hoeveelheid'
  | 'dobbelsteen-naar-cijfer'
  | 'reeks-aanvullen'
  | 'optellen';

export type RekenOefeningDefinitie =
  // Getalbeeld/tellen: N plaatjes zien, het juiste cijfer kiezen.
  | { type: 'hoeveelheid-naar-cijfer'; aantal: number; object: TelObject; afleiders: number[] }
  // Omgekeerd: een cijfer zien, de groep met het juiste aantal plaatjes kiezen.
  | { type: 'cijfer-naar-hoeveelheid'; cijfer: number; object: TelObject; afleiders: number[] }
  // Subitiseren met het klassieke dobbelsteenbeeld: direct herkennen zonder te tellen.
  | { type: 'dobbelsteen-naar-cijfer'; cijfer: number; afleiders: number[] }
  // Getallenrij met een gat in het midden (bv. 11 - [ ] - 13): geen keuzes, zelf typen.
  | { type: 'reeks-aanvullen'; voor: number; antwoord: number; na: number }
  // Eenvoudig optellen ("erbij"), som altijd onder de 10.
  | { type: 'optellen'; a: number; b: number; antwoord: number; afleiders: number[] };

export interface RekenKern {
  id: string; // bv. 'reken-kern-01'
  volgnummer: number;
  titel: string; // bv. 'Getallen 1 t/m 6'
  bereik: [number, number]; // bv. [1, 6]
  objecten: TelObject[];
  // Optioneel: beperk welke oefentypen deze kern gebruikt (bv. reeksen i.p.v. tel-
  // plaatjes voor 11-20, waar 20 sterretjes tellen niet meer zinvol is). Zonder deze
  // lijst worden alle typen gebruikt die bij het bereik passen (zie rekenenGenerator.ts).
  oefeningTypen?: RekenOefeningType[];
}
