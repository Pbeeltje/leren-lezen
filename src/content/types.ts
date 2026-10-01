// Kerncontracten voor alle leerinhoud. Puur data-typen, geen logica.

// Kinderen kiezen geen leeftijd maar een groep: alles voor 3-5 jaar heet nu kleuterschool,
// wat voor 6 jaar was is groep 3 (wens van de eigenaar).
export type Groep = 'kleuter' | 'groep3';
export const GROEP_NAAM: Record<Groep, string> = { kleuter: 'Kleuterschool', groep3: 'Groep 3' };

export interface Topic {
  id: string; // bv. 'lezen'
  groepen: Groep[];
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
  // Voor bijvoeglijke naamwoorden (koud, droog, heet, nat, ...): het plaatje alleen is
  // niet eenduidig (een sneeuwvlok kan net zo goed "sneeuw" of "winter" betekenen). Zet
  // dit op true om oefentypen uit te sluiten waar het woord zelf nergens als tekst bij
  // staat (hakken-en-plakken, woord-bouwen, zelf-typen) — zie beschikbareTypen() in
  // oefeningGenerator.ts. Types waar de tekst wél zichtbaar is (meerkeuze met
  // woordkeuzes, zin-invullen) blijven gewoon beschikbaar.
  vereistTekst?: boolean;
  // Met de hand gekozen woorden die er net op lijken (pijl → bijl, pijp), zoals op een
  // "onderstreep het juiste woord"-werkblad. Alleen tekst, geen plaatje nodig: ze worden
  // als foute keuzes gebruikt waar alleen woorden staan (plaatje-woord-keuze, woordwolk).
  lijktOp?: string[];
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
  | 'woordwolk'
  | 'letter-herkennen'
  | 'klank-herkennen'
  | 'drie-koppelen';

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
  // Plaatje in het midden, een wolk van woorden eromheen — precies één daarvan is het
  // doelwoord, de rest afleiders; tik het juiste woord aan. Geïnspireerd op het
  // klassieke "kleur de juiste woorden bij het plaatje"-werkblad (dat liet het
  // doelwoord meerdere keren terugkomen; hier bewust maar één keer, voor een
  // eenduidig "één goed antwoord").
  | { type: 'woordwolk'; doel: Woord; afleiders: Woord[] }
  // Basisvaardigheid: een grote letter, kies het woord waar die letter in zit.
  | { type: 'letter-herkennen'; letter: string; doel: Woord; afleiders: Woord[] }
  // Zelfde idee maar voor een tweeklank/klankcombinatie (oo, aa, au, ou, ui, eu).
  | { type: 'klank-herkennen'; klank: string; doel: Woord; afleiders: Woord[] }
  // Drie plaatjes en drie woorden door elkaar; tik steeds een plaatje en het bijbehorende
  // woord aan om ze te koppelen. Moeilijker dan de andere meerkeuze-vormen omdat je drie
  // paren tegelijk uit elkaar moet houden i.p.v. één doelwoord tussen afleiders.
  | { type: 'drie-koppelen'; paren: [Woord, Woord, Woord] };

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
  // Alleen bij de kleuterhoofdstukken (kleuter-letters.ts): de letters waar dit hoofdstuk
  // om draait. Zulke hoofdstukken hebben alleen letter-herkennen-vragen.
  letters?: string[];
}
