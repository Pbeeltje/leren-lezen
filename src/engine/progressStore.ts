import type { LeeftijdId } from '../content/types.ts';
import { events } from './events.ts';

export interface KernVoortgang {
  gestart: boolean;
  voltooid: boolean;
  sterren: 0 | 1 | 2 | 3;
}

export interface VoortgangData {
  versie: 1;
  laatstGekozenLeeftijd?: LeeftijdId;
  munten: number;
  kernen: Record<string, KernVoortgang>;
}

const OPSLAG_SLEUTEL = 'leren-lezen:voortgang';

function leegVoortgang(): VoortgangData {
  return { versie: 1, munten: 0, kernen: {} };
}

// In-memory fallback zodat de app nooit crasht als localStorage niet beschikbaar is
// (Safari privénavigatie, streng schoolbeleid, enz.)
let geheugenFallback: VoortgangData | null = null;

function leesRuw(): VoortgangData {
  try {
    const ruw = localStorage.getItem(OPSLAG_SLEUTEL);
    if (!ruw) return leegVoortgang();
    const data = JSON.parse(ruw) as VoortgangData;
    if (data.versie !== 1) return leegVoortgang(); // toekomstige migraties hier
    if (typeof data.munten !== 'number') data.munten = 0;
    return data;
  } catch {
    return geheugenFallback ?? leegVoortgang();
  }
}

function schrijfRuw(data: VoortgangData): void {
  try {
    localStorage.setItem(OPSLAG_SLEUTEL, JSON.stringify(data));
  } catch {
    geheugenFallback = data;
  }
}

export function haalVoortgang(): VoortgangData {
  return leesRuw();
}

export function zetLaatstGekozenLeeftijd(leeftijd: LeeftijdId): void {
  const data = leesRuw();
  data.laatstGekozenLeeftijd = leeftijd;
  schrijfRuw(data);
}

export function voegMuntenToe(aantal: number): number {
  const data = leesRuw();
  data.munten += aantal;
  schrijfRuw(data);
  events.emit('munten-veranderd', { totaal: data.munten, verschil: aantal });
  return data.munten;
}

export function markeerKernGestart(kernId: string): void {
  const data = leesRuw();
  const huidig = data.kernen[kernId] ?? { gestart: false, voltooid: false, sterren: 0 };
  data.kernen[kernId] = { ...huidig, gestart: true };
  schrijfRuw(data);
}

export function markeerKernVoltooid(kernId: string, sterren: 0 | 1 | 2 | 3): void {
  const data = leesRuw();
  const huidig = data.kernen[kernId] ?? { gestart: true, voltooid: false, sterren: 0 };
  data.kernen[kernId] = { gestart: true, voltooid: true, sterren: Math.max(huidig.sterren, sterren) as 0 | 1 | 2 | 3 };
  schrijfRuw(data);
  events.emit('kern-voltooid', { kernId, sterren });
}

export function haalKernVoortgang(kernId: string): KernVoortgang {
  return leesRuw().kernen[kernId] ?? { gestart: false, voltooid: false, sterren: 0 };
}
