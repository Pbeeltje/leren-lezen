import type { LeeftijdId } from '../content/types.ts';
import { events } from './events.ts';
import { haalActiefProfielId } from './profielStore.ts';

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
  // Hoe vaak elk woord al in een niet-typen oefening is voorgekomen. Bepaalt wanneer
  // de "zelf-typen"-oefening voor dat woord mag verschijnen, zie engine/oefeningGenerator.ts.
  woordBlootstelling: Record<string, number>;
}

// Elk profiel heeft zijn eigen sleutel, zodat munten/voortgang niet tussen kinderen
// door elkaar lopen. Zonder actief profiel (zou niet moeten voorkomen zodra de
// profielkeuze doorlopen is) valt dit terug op een gedeelde 'gast'-sleutel.
function opslagSleutel(): string {
  return `leren-lezen:voortgang:${haalActiefProfielId() ?? 'gast'}`;
}

function leegVoortgang(): VoortgangData {
  return { versie: 1, munten: 0, kernen: {}, woordBlootstelling: {} };
}

// In-memory fallback per profiel zodat de app nooit crasht als localStorage niet
// beschikbaar is (Safari privénavigatie, streng schoolbeleid, enz.)
const geheugenFallback = new Map<string, VoortgangData>();

function leesRuw(): VoortgangData {
  const sleutel = opslagSleutel();
  try {
    const ruw = localStorage.getItem(sleutel);
    if (!ruw) return leegVoortgang();
    const data = JSON.parse(ruw) as VoortgangData;
    if (data.versie !== 1) return leegVoortgang(); // toekomstige migraties hier
    if (typeof data.munten !== 'number') data.munten = 0;
    if (!data.woordBlootstelling) data.woordBlootstelling = {};
    return data;
  } catch {
    return geheugenFallback.get(sleutel) ?? leegVoortgang();
  }
}

function schrijfRuw(data: VoortgangData): void {
  const sleutel = opslagSleutel();
  try {
    localStorage.setItem(sleutel, JSON.stringify(data));
  } catch {
    geheugenFallback.set(sleutel, data);
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

export function haalBlootstelling(woord: string): number {
  return leesRuw().woordBlootstelling[woord] ?? 0;
}

export function verhoogBlootstelling(woord: string): number {
  const data = leesRuw();
  data.woordBlootstelling[woord] = (data.woordBlootstelling[woord] ?? 0) + 1;
  schrijfRuw(data);
  return data.woordBlootstelling[woord];
}
