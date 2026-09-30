import type { RekenKern, RekenOefeningDefinitie, RekenOefeningType, TelObject } from '../content/tellen/types.ts';

export type RekenModus = 'oefenen' | 'toets';

const OEFENEN_AANTAL = 5;
const TOETS_AANTAL = 10;
const ALLE_TYPEN: RekenOefeningType[] = [
  'hoeveelheid-naar-cijfer',
  'hoeveelheid-typen',
  'cijfer-naar-hoeveelheid',
  'dobbelsteen-naar-cijfer',
  'vingers-naar-cijfer',
  'reeks-aanvullen',
  'optellen',
  'bussom',
];

function schud<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

function kiesObject(objecten: TelObject[]): TelObject {
  return objecten[Math.floor(Math.random() * objecten.length)];
}

function kiesAfleidCijfers(bereik: [number, number], doel: number, aantal: number): number[] {
  const kandidaten: number[] = [];
  for (let getal = bereik[0]; getal <= bereik[1]; getal++) {
    if (getal !== doel) kandidaten.push(getal);
  }
  return schud(kandidaten).slice(0, Math.min(aantal, kandidaten.length));
}

// Kiest een getal uit bereik dat nog niet in `gebruikt` zit (voorkomt dat dezelfde vraag
// twee keer in één sessie voorkomt); valt terug op het volledige bereik zodra alles al
// gebruikt is (onvermijdelijk bij een klein bereik met veel vragen, bv. dobbelsteen 1-6).
function kiesUniekGetal(bereik: [number, number], gebruikt: Set<number>): number {
  const [min, max] = bereik;
  const kandidaten: number[] = [];
  for (let getal = min; getal <= max; getal++) {
    if (!gebruikt.has(getal)) kandidaten.push(getal);
  }
  const pool = kandidaten.length > 0 ? kandidaten : Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const gekozen = pool[Math.floor(Math.random() * pool.length)];
  gebruikt.add(gekozen);
  return gekozen;
}

/**
 * Welke oefentypen deze kern daadwerkelijk kan gebruiken: `kern.oefeningTypen` als die
 * gezet is, anders alle typen die zinnig zijn gegeven het bereik (dobbelsteen kan alleen
 * als het bereik 1-6 raakt; reeks-aanvullen/optellen hebben minstens 3 opeenvolgende
 * getallen resp. sommen onder de 10 nodig).
 */
function toepasbareTypen(kern: RekenKern): RekenOefeningType[] {
  if (kern.oefeningTypen) return kern.oefeningTypen;
  const [min, max] = kern.bereik;
  return ALLE_TYPEN.filter((type) => {
    if (type === 'dobbelsteen-naar-cijfer') return min <= 6;
    if (type === 'vingers-naar-cijfer') return min <= 10;
    if (type === 'dubbele-dobbelsteen-naar-cijfer') return min <= 16 && max >= 11;
    if (type === 'reeks-aanvullen') return max - min >= 2;
    if (type === 'bussom') return max >= 3 && max <= 10;
    return true;
  });
}

interface SessieTracker {
  // Eén "gebruikte getallen"-set per type, zodat bv. dobbelsteen en hoeveelheid-naar-cijfer
  // elk hun eigen onafhankelijke herhaling vermijden i.p.v. elkaars getallen te blokkeren.
  getallenPerType: Map<RekenOefeningType, Set<number>>;
  optelCombinaties: Set<string>;
}

function maakOefening(kern: RekenKern, type: RekenOefeningType, tracker: SessieTracker): RekenOefeningDefinitie {
  const [min, max] = kern.bereik;
  const gebruikt = tracker.getallenPerType.get(type) ?? new Set<number>();
  tracker.getallenPerType.set(type, gebruikt);

  switch (type) {
    case 'dobbelsteen-naar-cijfer': {
      // Een dobbelsteen heeft maar 6 kanten, ongeacht het getalbereik van deze kern.
      const dobbelBereik: [number, number] = [min, Math.min(max, 6)];
      const cijfer = kiesUniekGetal(dobbelBereik, gebruikt);
      return { type, cijfer, afleiders: kiesAfleidCijfers(dobbelBereik, cijfer, 2) };
    }
    case 'vingers-naar-cijfer': {
      // Handen tonen tot en met 10 vingers, ongeacht het getalbereik van deze kern.
      const vingerBereik: [number, number] = [min, Math.min(max, 10)];
      const cijfer = kiesUniekGetal(vingerBereik, gebruikt);
      return { type, cijfer, afleiders: kiesAfleidCijfers(vingerBereik, cijfer, 2) };
    }
    case 'dubbele-dobbelsteen-naar-cijfer': {
      // Dekt 11 t/m 16 (linker dobbelsteen is altijd de vaste "volle tien").
      const eenheidBereik: [number, number] = [Math.max(1, min - 10), Math.min(6, max - 10)];
      const eenheid = kiesUniekGetal(eenheidBereik, gebruikt);
      const cijfer = 10 + eenheid;
      const afleiders = kiesAfleidCijfers([11, 16], cijfer, 2);
      return { type, eenheid, cijfer, afleiders };
    }
    case 'reeks-aanvullen': {
      // Middelste getal van 3 opeenvolgende getallen ontbreekt, bv. 11-[ ]-13.
      const antwoord = kiesUniekGetal([min + 1, max - 1], gebruikt);
      return { type, voor: antwoord - 1, antwoord, na: antwoord + 1 };
    }
    case 'optellen': {
      // Som altijd onder de 10, beide termen minstens 1. Probeer een paar keer een
      // a+b-combinatie te vinden die deze sessie nog niet is voorgekomen.
      let a = 1;
      let b = 1;
      for (let poging = 0; poging < 15; poging++) {
        const som = 2 + Math.floor(Math.random() * 8); // 2..9
        const proefA = 1 + Math.floor(Math.random() * (som - 1));
        const sleutel = `${proefA}+${som - proefA}`;
        if (!tracker.optelCombinaties.has(sleutel) || poging === 14) {
          a = proefA;
          b = som - proefA;
          tracker.optelCombinaties.add(sleutel);
          break;
        }
      }
      const som = a + b;
      const afleiders = schud(
        [som - 1, som + 1, som - 2, som + 2].filter((n) => n >= 1 && n <= 9 && n !== som),
      ).slice(0, 2);
      return { type, a, b, antwoord: som, afleiders };
    }
    case 'bussom': {
      // Totaal blijft binnen het bereik en de bus wordt nooit leeg.
      const bovengrens = Math.min(max, 10);
      for (let poging = 0; ; poging++) {
        const start = 1 + Math.floor(Math.random() * (bovengrens - 1));
        const erin = start === 1 || Math.random() < 0.5;
        const ruimte = erin ? bovengrens - start : start - 1;
        const stap = 1 + Math.floor(Math.random() * Math.min(ruimte, 4));
        const verandering = erin ? stap : -stap;
        const antwoord = start + verandering;
        const sleutel = `${start}${verandering}`;
        if (tracker.optelCombinaties.has(sleutel) && poging < 15) continue;
        tracker.optelCombinaties.add(sleutel);
        // 'start' als afleider: de klassieke fout is vergeten dat er iemand in/uit stapte.
        const kandidaten = [start, antwoord + 1, antwoord - 1, antwoord + 2].filter(
          (n, i, lijst) => n >= 1 && n <= bovengrens && n !== antwoord && lijst.indexOf(n) === i,
        );
        return { type, start, verandering, antwoord, afleiders: kandidaten.slice(0, 2) };
      }
    }
    case 'hoeveelheid-naar-cijfer': {
      const cijfer = kiesUniekGetal(kern.bereik, gebruikt);
      return { type, aantal: cijfer, object: kiesObject(kern.objecten), afleiders: kiesAfleidCijfers(kern.bereik, cijfer, 2) };
    }
    case 'hoeveelheid-typen': {
      const aantal = kiesUniekGetal(kern.bereik, gebruikt);
      return { type, aantal, object: kiesObject(kern.objecten) };
    }
    case 'cijfer-naar-hoeveelheid': {
      const cijfer = kiesUniekGetal(kern.bereik, gebruikt);
      return { type, cijfer, object: kiesObject(kern.objecten), afleiders: kiesAfleidCijfers(kern.bereik, cijfer, 2) };
    }
  }
}

export function genereerRekenSessie(kern: RekenKern, modus: RekenModus): RekenOefeningDefinitie[] {
  const aantal = modus === 'oefenen' ? OEFENEN_AANTAL : TOETS_AANTAL;
  const typen = toepasbareTypen(kern);
  const typeVolgorde: RekenOefeningType[] = [];
  while (typeVolgorde.length < aantal) {
    typeVolgorde.push(...schud([...typen]));
  }
  const tracker: SessieTracker = { getallenPerType: new Map(), optelCombinaties: new Set() };
  return typeVolgorde.slice(0, aantal).map((type) => maakOefening(kern, type, tracker));
}
