// Profielen ("wie speelt er?") zodat meerdere kinderen op hetzelfde apparaat elk hun
// eigen voortgang/munten hebben. Bij elke app-start kies je een profiel of maak je een
// nieuwe aan (zie ProfileSelectScreen); welk profiel actief is, staat in sessionStorage
// zodat een her-laad van de pagina niet terug naar het kiesscherm springt, maar een
// nieuwe sessie (nieuw tabblad/venster) wel weer met kiezen begint.

export interface Profiel {
  id: string;
  naam: string;
  icoonId: string;
  aangemaakt: number;
}

export const AVATAR_ICONEN = ['vos', 'kat', 'hond', 'leeuw', 'panda', 'eenhoorn', 'robot', 'spook'] as const;
export type AvatarIcoon = (typeof AVATAR_ICONEN)[number];

export function avatarPad(icoonId: string): string {
  return `/assets/icons/avatar-${icoonId}.svg`;
}

const PROFIELEN_SLEUTEL = 'leren-lezen:profielen';
const ACTIEF_PROFIEL_SLEUTEL = 'leren-lezen:actief-profiel';

function leesProfielen(): Profiel[] {
  try {
    const ruw = localStorage.getItem(PROFIELEN_SLEUTEL);
    if (!ruw) return [];
    const data = JSON.parse(ruw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function schrijfProfielen(profielen: Profiel[]): void {
  try {
    localStorage.setItem(PROFIELEN_SLEUTEL, JSON.stringify(profielen));
  } catch {
    // geen opslag beschikbaar: profielen bestaan dan alleen voor deze paginasessie
  }
}

export function haalProfielen(): Profiel[] {
  return leesProfielen();
}

export function maakProfiel(naam: string, icoonId: string): Profiel {
  const profiel: Profiel = {
    id: `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
    naam: naam.trim(),
    icoonId,
    aangemaakt: Date.now(),
  };
  const profielen = leesProfielen();
  profielen.push(profiel);
  schrijfProfielen(profielen);
  return profiel;
}

export function zetActiefProfiel(id: string): void {
  try {
    sessionStorage.setItem(ACTIEF_PROFIEL_SLEUTEL, id);
  } catch {
    // negeren: zonder opslag blijft het actieve profiel gewoon in het geheugen van deze run
  }
}

export function haalActiefProfielId(): string | null {
  try {
    return sessionStorage.getItem(ACTIEF_PROFIEL_SLEUTEL);
  } catch {
    return null;
  }
}

export function haalActiefProfiel(): Profiel | null {
  const id = haalActiefProfielId();
  if (!id) return null;
  return leesProfielen().find((profiel) => profiel.id === id) ?? null;
}
