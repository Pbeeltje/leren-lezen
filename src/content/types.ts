// Kerncontracten voor alle leerinhoud. Puur data-typen, geen logica.

export type LeeftijdId = 3 | 4 | 5 | 6;

export interface Topic {
  id: string; // bv. 'lezen'
  leeftijd: LeeftijdId[];
  titel: string;
  icoonPad: string;
  beschikbaar: boolean; // false => TopicSelectScreen toont ComingSoonScreen
}

export interface StructuurWoord {
  woord: string; // bv. 'maan'
  afbeeldingPad: string;
  nieuweLetters: string[]; // bv. ['m', 'a', 'n']
}

export interface Woord {
  woord: string; // klankzuiver, alleen letters die al bekend zijn binnen de kern
  afbeeldingPad: string;
}

export type OefeningDefinitie =
  | { type: 'plaatje-woord-keuze'; doel: Woord; afleiders: [Woord, Woord] }
  | { type: 'woord-plaatje-keuze'; doel: Woord; afleiders: [Woord, Woord] }
  | { type: 'hakken-en-plakken'; woord: Woord }
  | { type: 'woord-bouwen'; woord: Woord; afleidLetters: string[] };

export interface Kern {
  id: string; // bv. 'kern-01'
  volgnummer: number;
  structuurwoord: StructuurWoord;
  nieuweLetters: string[];
  oefeningen: OefeningDefinitie[]; // oefenen: makkelijker, kleinere muntenbeloning, herkansing toegestaan
  toets: OefeningDefinitie[]; // toets: moeilijker (meer afleiders, geen herkansing), grotere muntenbeloning, bepaalt sterren
}
