import type { LeeftijdId } from '../content/types.ts';
import { events } from './events.ts';
import { haalActiefProfielId } from './profielStore.ts';

// Aantal voltooide oefensessies vóórdat de toets van een kern ontgrendelt.
export const OEFENSESSIES_VOOR_TOETS = 3;

export interface KernVoortgang {
  gestart: boolean;
  voltooid: boolean;
  sterren: 0 | 1 | 2 | 3;
  // Aantal keer dat een oefensessie (niet toets) voor deze kern is afgerond.
  oefenSessies: number;
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
    if (!data.kernen) data.kernen = {};
    for (const kernId in data.kernen) {
      if (typeof data.kernen[kernId].oefenSessies !== 'number') {
        // Oudere opslag zonder dit veld: als de kern al gestart/voltooid was, tellen we
        // dat als 1 sessie zodat niemand plots opnieuw vanaf 0 hoeft te oefenen.
        data.kernen[kernId].oefenSessies = data.kernen[kernId].gestart ? 1 : 0;
      }
    }
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

function legeKernVoortgang(): KernVoortgang {
  return { gestart: false, voltooid: false, sterren: 0, oefenSessies: 0 };
}

export function markeerKernGestart(kernId: string): void {
  const data = leesRuw();
  const huidig = data.kernen[kernId] ?? legeKernVoortgang();
  data.kernen[kernId] = { ...huidig, gestart: true };
  schrijfRuw(data);
}

/** Aangeroepen wanneer een oefensessie (niet toets) daadwerkelijk is afgerond. */
export function verhoogOefenSessies(kernId: string): number {
  const data = leesRuw();
  const huidig = data.kernen[kernId] ?? legeKernVoortgang();
  const oefenSessies = huidig.oefenSessies + 1;
  data.kernen[kernId] = { ...huidig, gestart: true, oefenSessies };
  schrijfRuw(data);
  return oefenSessies;
}

export function markeerKernVoltooid(kernId: string, sterren: 0 | 1 | 2 | 3): void {
  const data = leesRuw();
  const huidig = data.kernen[kernId] ?? { ...legeKernVoortgang(), gestart: true };
  data.kernen[kernId] = { ...huidig, gestart: true, voltooid: true, sterren: Math.max(huidig.sterren, sterren) as 0 | 1 | 2 | 3 };
  schrijfRuw(data);
  events.emit('kern-voltooid', { kernId, sterren });
}

export function haalKernVoortgang(kernId: string): KernVoortgang {
  return leesRuw().kernen[kernId] ?? legeKernVoortgang();
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
