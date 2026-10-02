import type { Groep } from '../content/types.ts';
import { events } from './events.ts';
import { haalActiefProfielId } from './profielStore.ts';
import type { OefeningNummer } from './oefeningGenerator.ts';
import type { Instrument } from './muziek.ts';

// Aantal voltooide oefensessies vóórdat de toets van een kern ontgrendelt.
export const OEFENSESSIES_VOOR_TOETS = 3;

export interface KernVoortgang {
  gestart: boolean;
  voltooid: boolean;
  sterren: 0 | 1 | 2 | 3;
  // Aantal keer dat een oefensessie (niet toets) voor deze kern is afgerond.
  oefenSessies: number;
  // Welke Oefening 1/2/3 al eens tot het eind gespeeld is (bepaalt de herhaal-korting op
  // munten, zie engine/rewards.ts). Oude opslag heeft het niet: dan telt geen enkele als af.
  oefeningenAf: OefeningNummer[];
}

export interface VoortgangData {
  versie: 1;
  laatstGekozenGroep?: Groep;
  // Oud (van vóór de groepen): 3-5 wordt kleuter, 6 wordt groep 3. Zie leesRuw().
  laatstGekozenLeeftijd?: number;
  munten: number;
  kernen: Record<string, KernVoortgang>;
  // Hoe vaak elk woord al in een niet-typen oefening is voorgekomen. Bepaalt wanneer
  // de "zelf-typen"-oefening voor dat woord mag verschijnen, zie engine/oefeningGenerator.ts.
  woordBlootstelling: Record<string, number>;
  // Wat dit kind in de winkel heeft (sleutels als 'figuur:vos' en 'achtergrond:zee').
  // Ontbreekt bij oude opslag; engine/winkel.ts vult het dan één keer met wat het kind al gebruikte.
  gekocht?: string[];
  // Laatst gekozen melodie-instrument (Speel na en Vrij spelen openen ermee).
  instrument?: Instrument;
  // Laatst geopende oefening of toets, per groep en menu ('kleuter:lezen' → kern-id).
  // Het hoofdstukkenoverzicht opent op de bladzijde waar die kern staat.
  laatsteKern?: Record<string, string>;
  // Begrijpend lezen: welke vraag dit kind de vorige keer bij dat verhaal zag.
  // De volgende keer dat het verhaal opengaat, komt de vraag erna.
  begrijpendVraag?: Record<string, number>;
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
  // Lukte schrijven eerder niet (vol/geblokkeerd, terwijl lezen wél werkt), dan is het
  // geheugen de nieuwste stand; anders "vergeet" de app elke munt meteen weer.
  const inGeheugen = geheugenFallback.get(sleutel);
  if (inGeheugen) return inGeheugen;
  try {
    const ruw = localStorage.getItem(sleutel);
    if (!ruw) return leegVoortgang();
    const data = JSON.parse(ruw) as VoortgangData;
    if (data.versie !== 1) return leegVoortgang(); // toekomstige migraties hier
    if (typeof data.munten !== 'number') data.munten = 0;
    if (!data.woordBlootstelling) data.woordBlootstelling = {};
    if (!data.kernen) data.kernen = {};
    if (!data.laatstGekozenGroep && typeof data.laatstGekozenLeeftijd === 'number') {
      data.laatstGekozenGroep = data.laatstGekozenLeeftijd >= 6 ? 'groep3' : 'kleuter';
    }
    for (const kernId in data.kernen) {
      if (!data.kernen[kernId] || typeof data.kernen[kernId] !== 'object') {
        delete data.kernen[kernId];
        continue;
      }
      if (typeof data.kernen[kernId].oefenSessies !== 'number') {
        // Oudere opslag zonder dit veld: als de kern al gestart/voltooid was, tellen we
        // dat als 1 sessie zodat niemand plots opnieuw vanaf 0 hoeft te oefenen.
        data.kernen[kernId].oefenSessies = data.kernen[kernId].gestart ? 1 : 0;
      }
      // Niet afleiden uit oefenSessies: dat telt sessies, niet welke oefening (Rekenen had
      // tot nu toe niet eens een nummer), en ten onrechte "af" zou munten kosten.
      if (!Array.isArray(data.kernen[kernId].oefeningenAf)) data.kernen[kernId].oefeningenAf = [];
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
    geheugenFallback.delete(sleutel);
  } catch {
    geheugenFallback.set(sleutel, data);
  }
}

export function haalVoortgang(): VoortgangData {
  return leesRuw();
}

export const haalGroep = (): Groep | undefined => leesRuw().laatstGekozenGroep;

export function zetGroep(groep: Groep): void {
  const data = leesRuw();
  data.laatstGekozenGroep = groep;
  delete data.laatstGekozenLeeftijd;
  schrijfRuw(data);
}

export function voegMuntenToe(aantal: number): number {
  const data = leesRuw();
  data.munten += aantal;
  schrijfRuw(data);
  events.emit('munten-veranderd', { totaal: data.munten, verschil: aantal });
  return data.munten;
}

export function zetGekocht(gekocht: string[]): void {
  const data = leesRuw();
  data.gekocht = gekocht;
  schrijfRuw(data);
}

export function zetInstrument(instrument: Instrument): void {
  const data = leesRuw();
  data.instrument = instrument;
  schrijfRuw(data);
}

export type KernMenu = 'lezen' | 'tellen' | 'luisteren';

function laatsteKernSleutel(menu: KernMenu): string | undefined {
  const groep = haalGroep();
  if (!groep) return undefined;
  return `${groep}:${menu}`;
}

/** Onthoud welke kern dit kind net opende, zodat het overzicht daar weer opent. */
export function zetLaatsteKern(menu: KernMenu, kernId: string): void {
  const sleutel = laatsteKernSleutel(menu);
  if (!sleutel) return;
  const data = leesRuw();
  data.laatsteKern = { ...data.laatsteKern, [sleutel]: kernId };
  schrijfRuw(data);
}

export function haalLaatsteKern(menu: KernMenu): string | undefined {
  const sleutel = laatsteKernSleutel(menu);
  if (!sleutel) return undefined;
  const id = leesRuw().laatsteKern?.[sleutel];
  return typeof id === 'string' ? id : undefined;
}

/** Koopt iets als er genoeg munten zijn; geeft false (en verandert niets) als dat niet zo is. */
export function koopMetMunten(sleutel: string, prijs: number): boolean {
  const data = leesRuw();
  const gekocht = data.gekocht ?? [];
  if (gekocht.includes(sleutel)) return true;
  if (data.munten < prijs) return false;
  data.munten -= prijs;
  data.gekocht = [...gekocht, sleutel];
  schrijfRuw(data);
  events.emit('munten-veranderd', { totaal: data.munten, verschil: -prijs });
  return true;
}

function legeKernVoortgang(): KernVoortgang {
  return { gestart: false, voltooid: false, sterren: 0, oefenSessies: 0, oefeningenAf: [] };
}

export function markeerKernGestart(kernId: string): void {
  const data = leesRuw();
  const huidig = data.kernen[kernId] ?? legeKernVoortgang();
  data.kernen[kernId] = { ...huidig, gestart: true };
  schrijfRuw(data);
}

/** Aangeroepen wanneer een oefensessie (niet toets) daadwerkelijk is afgerond. */
export function verhoogOefenSessies(kernId: string, nummer: OefeningNummer): number {
  const data = leesRuw();
  const huidig = data.kernen[kernId] ?? legeKernVoortgang();
  const oefenSessies = huidig.oefenSessies + 1;
  const oefeningenAf = huidig.oefeningenAf.includes(nummer) ? huidig.oefeningenAf : [...huidig.oefeningenAf, nummer];
  data.kernen[kernId] = { ...huidig, gestart: true, oefenSessies, oefeningenAf };
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

/** Index van de vraag die dit kind nu bij dit verhaal te zien krijgt. De volgende keer een andere. */
export function volgendeBegrijpendVraag(verhaalId: string, aantal: number): number {
  if (aantal < 1) throw new Error(`verhaal ${verhaalId} heeft geen vragen`);
  const data = leesRuw();
  const vorige = data.begrijpendVraag?.[verhaalId];
  const index = typeof vorige === 'number' ? (vorige + 1) % aantal : 0;
  data.begrijpendVraag = { ...data.begrijpendVraag, [verhaalId]: index };
  schrijfRuw(data);
  return index;
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
