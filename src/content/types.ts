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

// Een kant-en-klare invulzin voor één woord uit de woordenbank, met plaatjecontext.
// "___" in de zin markeert de plek van het doelwoord.
export interface ZinsVoorbeeld {
  zin: string; // bv. "'s Avonds schijnt de ___ aan de hemel."
  doel: Woord;
  afleiders: Woord[]; // voor de meerkeuze-variant van deze zin
}

export type OefeningType =
  | 'plaatje-woord-keuze'
  | 'woord-plaatje-keuze'
  | 'hakken-en-plakken'
  | 'woord-bouwen'
  | 'zin-invullen'
  | 'zelf-typen'
  | 'woordwolk';

export type OefeningDefinitie =
  | { type: 'plaatje-woord-keuze'; doel: Woord; afleiders: Woord[] }
  | { type: 'woord-plaatje-keuze'; doel: Woord; afleiders: Woord[] }
  | { type: 'hakken-en-plakken'; woord: Woord }
  | { type: 'woord-bouwen'; woord: Woord; afleidLetters: string[] }
  // Het kind typt het woord helemaal zelf (geen keuzes) — verschijnt pas nadat
  // een woord al een paar keer op een andere manier geoefend is, zie
  // engine/oefeningGenerator.ts (MIN_BLOOTSTELLING_VOOR_TYPEN).
  | { type: 'zelf-typen'; woord: Woord }
  // Zin met een gat, plaatjecontext erbij; soms meerkeuze, soms zelf typen.
  | { type: 'zin-invullen'; zin: string; doel: Woord; afleiders: Woord[]; modus: 'meerkeuze' | 'typen' }
  // Plaatje in het midden, een wolk van woorden eromheen — het doelwoord komt
  // `herhaling` keer voor tussen de afleiders; tik alle juiste exemplaren aan.
  // Geïnspireerd op het klassieke "kleur de juiste woorden bij het plaatje"-werkblad.
  | { type: 'woordwolk'; doel: Woord; afleiders: Woord[]; herhaling: number };

export interface Kern {
  id: string; // bv. 'kern-01'
  volgnummer: number;
  titel: string; // bv. 'maan, roos & vis'
  structuurwoorden: StructuurWoord[]; // de nieuwe woorden die in deze kern ontleed worden
  nieuweLetters: string[];
  // Woordenbank waaruit oefen- en toetssessies random samengesteld worden (zie
  // engine/oefeningGenerator.ts): klankzuivere woorden, incl. de structuurwoorden,
  // opgebouwd uit letters die in of vóór deze kern zijn geleerd. Een oefensessie pakt
  // een handvol woorden hieruit (5) en wijst elk woord willekeurig één oefentype toe;
  // de toets doorloopt de hele bank één keer (dus net zoveel vragen als woorden).
  woordenbank: Woord[];
  // Optionele invulzinnen voor (een deel van) de woordenbank, voor de zin-invullen-oefening.
  zinnen: ZinsVoorbeeld[];
}
