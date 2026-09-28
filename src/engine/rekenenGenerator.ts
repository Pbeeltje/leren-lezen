import type { RekenKern, RekenOefeningDefinitie, RekenOefeningType, TelObject } from '../content/tellen/types.ts';

export type RekenModus = 'oefenen' | 'toets';

const OEFENEN_AANTAL = 5;
const TOETS_AANTAL = 10;
const ALLE_TYPEN: RekenOefeningType[] = [
  'hoeveelheid-naar-cijfer',
  'cijfer-naar-hoeveelheid',
  'dobbelsteen-naar-cijfer',
  'reeks-aanvullen',
  'optellen',
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
    if (type === 'reeks-aanvullen') return max - min >= 2;
    if (type === 'optellen') return true;
    return true;
  });
}

function maakOefening(kern: RekenKern, type: RekenOefeningType): RekenOefeningDefinitie {
  const [min, max] = kern.bereik;

  switch (type) {
    case 'dobbelsteen-naar-cijfer': {
      // Een dobbelsteen heeft maar 6 kanten, ongeacht het getalbereik van deze kern.
      const dobbelBereik: [number, number] = [min, Math.min(max, 6)];
      const cijfer = dobbelBereik[0] + Math.floor(Math.random() * (dobbelBereik[1] - dobbelBereik[0] + 1));
      return { type, cijfer, afleiders: kiesAfleidCijfers(dobbelBereik, cijfer, 2) };
    }
    case 'reeks-aanvullen': {
      // Middelste getal van 3 opeenvolgende getallen ontbreekt, bv. 11-[ ]-13.
      const antwoord = min + 1 + Math.floor(Math.random() * (max - min - 1));
      return { type, voor: antwoord - 1, antwoord, na: antwoord + 1 };
    }
    case 'optellen': {
      // Som altijd onder de 10, beide termen minstens 1.
      const som = 2 + Math.floor(Math.random() * 8); // 2..9
      const a = 1 + Math.floor(Math.random() * (som - 1));
      const b = som - a;
      const afleiders = schud(
        [som - 1, som + 1, som - 2, som + 2].filter((n) => n >= 1 && n <= 9 && n !== som),
      ).slice(0, 2);
      return { type, a, b, antwoord: som, afleiders };
    }
    case 'hoeveelheid-naar-cijfer': {
      const cijfer = min + Math.floor(Math.random() * (max - min + 1));
      return { type, aantal: cijfer, object: kiesObject(kern.objecten), afleiders: kiesAfleidCijfers(kern.bereik, cijfer, 2) };
    }
    case 'cijfer-naar-hoeveelheid': {
      const cijfer = min + Math.floor(Math.random() * (max - min + 1));
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
  return typeVolgorde.slice(0, aantal).map((type) => maakOefening(kern, type));
}
