// Profielen ("wie speelt er?") zodat meerdere kinderen op hetzelfde apparaat elk hun
// eigen voortgang/munten hebben. Bij elke app-start kies je een profiel of maak je een
// nieuwe aan (zie ProfileSelectScreen); welk profiel actief is, staat in sessionStorage
// zodat een her-laad van de pagina niet terug naar het kiesscherm springt, maar een
// nieuwe sessie (nieuw tabblad/venster) wel weer met kiezen begint.

export interface Profiel {
  id: string;
  naam: string;
  icoonId: string;
  kleur: number; // hue-rotate in graden (0 = originele kleuren)
  aangemaakt: number;
}

// Kleurtinten (hue-rotate) waarmee dezelfde avatars extra variatie krijgen —
// vooral handig als twee kinderen dezelfde favoriet (bv. de eenhoorn) willen.
export const AVATAR_KLEUREN = [0, 45, 90, 150, 200, 260, 320] as const;

export function avatarFilter(kleur: number | undefined): string {
  const waarde = kleur ?? 0;
  return waarde === 0 ? '' : `hue-rotate(${waarde}deg) saturate(1.9) contrast(1.12)`;
}

// De eerste vijf zijn gratis (zie engine/winkel.ts), de rest koop je met munten.
export const AVATAR_ICONEN = [
  'jongen',
  'meisje',
  'robot',
  'kat',
  'hond',
  'vos',
  'leeuw',
  'panda',
  'eenhoorn',
  'spook',
  'tijger',
  'koala',
  'pinguin',
  'vlinder',
  'draak',
  'aap',
  'varken',
  'koe',
  'kikker',
  'konijn',
  'hamster',
  'muis',
  'ijsbeer',
  'beer',
  'kuiken',
  'uil',
  'octopus',
  'dolfijn',
  'schildpad',
  'trex',
  'dino',
  'stegosaurus',
  'paard',
  'zebra',
  'giraf',
  'olifant',
  'egel',
  'luiaard',
  'papegaai',
  'flamingo',
  'lieveheersbeestje',
  'slak',
  'krab',
  'haai',
  'wolf',
  'alien',
  'monstertje',
  'sneeuwpop',
  'ninja',
  'fee',
  'superheld',
  'tovenaar',
  'astronaut',
  'prinses',
  'clown',
  'pompoen',
] as const;
export type AvatarIcoon = (typeof AVATAR_ICONEN)[number];

export function avatarPad(icoonId: string): string {
  return `assets/icons/avatar-${icoonId}.svg`;
}

const PROFIELEN_SLEUTEL = 'leren-lezen:profielen';
const ACTIEF_PROFIEL_SLEUTEL = 'leren-lezen:actief-profiel';

// Zonder werkende opslag leven profielen en het actieve profiel alleen in het geheugen
// van deze paginasessie (anders is een net gemaakt profiel meteen weer weg).
let profielenInGeheugen: Profiel[] | null = null;
let actiefInGeheugen: string | null = null;

function isGeldigProfiel(p: unknown): p is Profiel {
  const x = p as Profiel | null;
  return !!x && typeof x.id === 'string' && typeof x.naam === 'string' && typeof x.icoonId === 'string';
}

function leesProfielen(): Profiel[] {
  if (profielenInGeheugen) return profielenInGeheugen;
  try {
    const ruw = localStorage.getItem(PROFIELEN_SLEUTEL);
    if (!ruw) return [];
    const data = JSON.parse(ruw);
    return Array.isArray(data) ? data.filter(isGeldigProfiel) : [];
  } catch {
    return [];
  }
}

function schrijfProfielen(profielen: Profiel[]): void {
  try {
    localStorage.setItem(PROFIELEN_SLEUTEL, JSON.stringify(profielen));
    profielenInGeheugen = null;
  } catch {
    profielenInGeheugen = profielen;
  }
}

export function haalProfielen(): Profiel[] {
  return leesProfielen();
}

// Zelfde grens als het invoerveld: past op de profieltegel en in het menu.
export const MAX_NAAM_LENGTE = 16;

export function maakProfiel(naam: string, icoonId: string, kleur = 0): Profiel {
  const profiel: Profiel = {
    id: `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
    naam: naam.trim().slice(0, MAX_NAAM_LENGTE),
    icoonId,
    kleur,
    aangemaakt: Date.now(),
  };
  const profielen = leesProfielen();
  profielen.push(profiel);
  schrijfProfielen(profielen);
  return profiel;
}

export function wijzigProfielIcoon(id: string, icoonId: string): void {
  const profielen = leesProfielen();
  const profiel = profielen.find((p) => p.id === id);
  if (!profiel) return;
  profiel.icoonId = icoonId;
  schrijfProfielen(profielen);
}

export function wijzigProfielKleur(id: string, kleur: number): void {
  const profielen = leesProfielen();
  const profiel = profielen.find((p) => p.id === id);
  if (!profiel) return;
  profiel.kleur = kleur;
  schrijfProfielen(profielen);
}

export function zetActiefProfiel(id: string): void {
  actiefInGeheugen = id;
  try {
    sessionStorage.setItem(ACTIEF_PROFIEL_SLEUTEL, id);
  } catch {
    // negeren: zonder opslag blijft het actieve profiel gewoon in het geheugen van deze run
  }
}

export function haalActiefProfielId(): string | null {
  try {
    return sessionStorage.getItem(ACTIEF_PROFIEL_SLEUTEL) ?? actiefInGeheugen;
  } catch {
    return actiefInGeheugen;
  }
}

export function haalActiefProfiel(): Profiel | null {
  const id = haalActiefProfielId();
  if (!id) return null;
  return leesProfielen().find((profiel) => profiel.id === id) ?? null;
}
