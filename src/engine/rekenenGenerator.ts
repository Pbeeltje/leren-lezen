import type { RekenKern, RekenOefeningDefinitie, RekenOefeningType, TelObject } from '../content/tellen/types.ts';

export type RekenModus = 'oefenen' | 'toets';

const OEFENEN_AANTAL = 5;
const TOETS_AANTAL = 10;
const TYPEN: RekenOefeningType[] = ['hoeveelheid-naar-cijfer', 'cijfer-naar-hoeveelheid', 'dobbelsteen-naar-cijfer'];

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

function maakOefening(kern: RekenKern, type: RekenOefeningType): RekenOefeningDefinitie {
  const [min, max] = kern.bereik;

  if (type === 'dobbelsteen-naar-cijfer') {
    // Een dobbelsteen heeft maar 6 kanten, ongeacht het getalbereik van deze kern.
    const dobbelBereik: [number, number] = [min, Math.min(max, 6)];
    const cijfer = dobbelBereik[0] + Math.floor(Math.random() * (dobbelBereik[1] - dobbelBereik[0] + 1));
    return { type, cijfer, afleiders: kiesAfleidCijfers(dobbelBereik, cijfer, 2) };
  }

  const cijfer = min + Math.floor(Math.random() * (max - min + 1));
  const afleiders = kiesAfleidCijfers(kern.bereik, cijfer, 2);

  switch (type) {
    case 'hoeveelheid-naar-cijfer':
      return { type, aantal: cijfer, object: kiesObject(kern.objecten), afleiders };
    case 'cijfer-naar-hoeveelheid':
      return { type, cijfer, object: kiesObject(kern.objecten), afleiders };
  }
}

/** Het cijfer waar een rekenoefening om draait, voor eventuele toekomstige tracking. */
export function cijferVanOefening(oefening: RekenOefeningDefinitie): number {
  return oefening.type === 'hoeveelheid-naar-cijfer' ? oefening.aantal : oefening.cijfer;
}

export function genereerRekenSessie(kern: RekenKern, modus: RekenModus): RekenOefeningDefinitie[] {
  const aantal = modus === 'oefenen' ? OEFENEN_AANTAL : TOETS_AANTAL;
  const typeVolgorde: RekenOefeningType[] = [];
  while (typeVolgorde.length < aantal) {
    typeVolgorde.push(...schud([...TYPEN]));
  }
  return typeVolgorde.slice(0, aantal).map((type) => maakOefening(kern, type));
}
