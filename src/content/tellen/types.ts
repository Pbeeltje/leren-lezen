// Contracten voor het rekenonderdeel. Zelfde vormgeving als content/types.ts (lezen),
// bewust een los model omdat de inhoud fundamenteel anders is (hoeveelheden/cijfers,
// geen woorden/letters).

export interface TelObject {
  naam: string; // bv. 'ster', puur voor referentie/alt-tekst
  icoonPad: string;
}

export type SomTeken = '+' | '-';

export interface RekenSom {
  a: number;
  b: number;
  teken: SomTeken;
  antwoord: number;
}

export type RekenOefeningType =
  | 'hoeveelheid-naar-cijfer'
  | 'hoeveelheid-typen'
  | 'cijfer-naar-hoeveelheid'
  | 'dobbelsteen-naar-cijfer'
  | 'dubbele-dobbelsteen-naar-cijfer'
  | 'vingers-naar-cijfer'
  | 'reeks-aanvullen'
  | 'optellen'
  | 'bussom'
  | 'som-keuze'
  | 'som-koppelen'
  | 'som-typen'
  | 'geld-keuze'
  | 'geld-typen';

export type RekenOefeningDefinitie =
  // Getalbeeld/tellen: N plaatjes zien, het juiste cijfer kiezen.
  | { type: 'hoeveelheid-naar-cijfer'; aantal: number; object: TelObject; afleiders: number[] }
  // Zelfde plaatjes, maar nu zelf het cijfer typen (geen keuzes).
  | { type: 'hoeveelheid-typen'; aantal: number; object: TelObject }
  // Omgekeerd: een cijfer zien, de groep met het juiste aantal plaatjes kiezen.
  | { type: 'cijfer-naar-hoeveelheid'; cijfer: number; object: TelObject; afleiders: number[] }
  // Subitiseren met het klassieke dobbelsteenbeeld: direct herkennen zonder te tellen.
  | { type: 'dobbelsteen-naar-cijfer'; cijfer: number; afleiders: number[] }
  // Twee gewone dobbelstenen, antwoord = alle stippen samen. (Een eerdere versie liet
  // één stip op de linker dobbelsteen "een tien" betekenen; dat is voor een jong kind
  // onbegrijpelijk, dus bewust vervangen door gewoon optellen.)
  | { type: 'dubbele-dobbelsteen-naar-cijfer'; links: number; rechts: number; cijfer: number; afleiders: number[] }
  // Net als dobbelsteen-naar-cijfer maar met een handplaatje (1-10 vingers) i.p.v. een
  // dobbelsteenbeeld -- bron: een echte vingertel-kaart (Engels/Nederlands) die de
  // gebruiker aanleverde.
  | { type: 'vingers-naar-cijfer'; cijfer: number; afleiders: number[] }
  // Getallenrij met een gat in het midden (bv. 11 - [ ] - 13): geen keuzes, zelf typen.
  | { type: 'reeks-aanvullen'; voor: number; antwoord: number; na: number }
  // Eenvoudig optellen ("erbij"), som altijd onder de 10.
  | { type: 'optellen'; a: number; b: number; antwoord: number; afleiders: number[] }
  // Bussom (idee: Squla groep 3): er zitten `start` mensen in de bus, bij de halte stappen
  // er `verandering` in (positief) of uit (negatief). Hoeveel zitten er nu in?
  | { type: 'bussom'; start: number; verandering: number; antwoord: number; afleiders: number[] }
  // Kale plus- of minsom, zonder plaatje. Het teken komt van de kern (`somTeken`),
  // behalve in de herhaling waar een vraag beide banden mag mengen.
  | { type: 'som-keuze'; a: number; b: number; teken: SomTeken; antwoord: number; afleiders: number[] }
  | { type: 'som-koppelen'; paren: [RekenSom, RekenSom, RekenSom] }
  | { type: 'som-typen'; a: number; b: number; teken: SomTeken; antwoord: number }
  // Geld. `briefjes` alleen als de vraag echt briefjes heeft (5, 10 of 20 euro).
  // Munten in centen: 5, 10, 20, 50, 100, 200.
  | { type: 'geld-keuze'; munten: number[]; antwoordCent: number; afleidersCent: number[]; briefjes?: number[] }
  | { type: 'geld-typen'; munten: number[]; antwoordCent: number; briefjes?: number[] };

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
  // Oefening 1, 2 en 3 elk precies dit type (mag herhaald, bv. twee keer geld-keuze).
  // De toets mengt de unieke typen gelijkmatig. Het teken en de geldmoeilijkheid
  // komen uit `somTeken` / `geld` plus het oefeningnummer, niet uit deze lijst.
  oefeningVolgorde?: [RekenOefeningType, RekenOefeningType, RekenOefeningType];
  // Vast teken voor een kale plus- of minhoofdstuk. De generator gebruikt alleen dit teken.
  somTeken?: SomTeken;
  // Munten tot 10, of munten plus briefjes van 5/10/20.
  geld?: 'munten' | 'briefjes';
  // Herhaling: elke sessie bevat plus, min en geld (behalve de koppel-oefening, die alleen sommen is).
  herhaling?: 'plus-min-geld';
}
