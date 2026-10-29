import type { Groep } from '../content/types.ts';
import { haalActiefProfielId } from './profielStore.ts';
import { haalKernVoortgang } from './progressStore.ts';
import { leesKernen, rekenKernen } from './leeftijdGrens.ts';
import { kies } from './toeval.ts';
import type { OefeningNummer } from './oefeningGenerator.ts';
import { LUISTER_HOOFDSTUKKEN } from '../content/luisteren/hoofdstukken.ts';
import { MIN_HOOFDSTUK_WOORDEN, hoofdstukWoorden } from './luisterenGenerator.ts';
import { ONTDEKKEN_IDS, isRondeId, type RondeId } from '../games/rondeActiviteiten.ts';

// "Vandaag": drie oefeningen die de app voor dit kind kiest, zodat het niet zelf uit alle
// menu's hoeft te zoeken. Groep 3: lezen, tellen, schrijven. Kleuter: letters, tellen en
// om de dag Luisteren, Ontdekken of Schrijven. Nooit muziek of spelletjes.
// Per vak: eerst wat de vorige keer half bleef, dan de volgende stap in de hoofdstukken.
// Het plan staat vast voor de dag; alles blijft ook gewoon los te kiezen.

export const MUNTEN_DAGPLAN = 20; // als alle drie af zijn, één keer per dag (×1.5 voor kleuters)

export type Taak =
  | { soort: 'lezen' | 'tellen'; kernId: string; modus: 'oefenen' | 'toets'; nummer: OefeningNummer }
  | { soort: 'ronde'; id: RondeId }
  | { soort: 'luisteren'; hoofdstukId: string };

type Vak = 'lezen' | 'tellen' | 'schrijven' | 'ontdekken' | 'luisteren';

export interface Dagplan {
  datum: string;
  groep: Groep;
  taken: Taak[];
  klaar: boolean[];
  bonusBetaald: boolean;
}

interface DagplanData {
  plan?: Dagplan;
  // Per vak de laatst begonnen taak die (nog) niet is afgemaakt.
  onaf: Partial<Record<Vak, Taak>>;
  // Hoe vaak elk rondespel tot het eind gespeeld is: het minst gespeelde komt eerst.
  rondes: Partial<Record<RondeId, number>>;
}

function opslagSleutel(): string {
  return `leren-lezen:dagplan:${haalActiefProfielId() ?? 'gast'}`;
}

const geheugenFallback = new Map<string, DagplanData>();

function isTaak(x: unknown): x is Taak {
  if (!x || typeof x !== 'object') return false;
  const t = x as Record<string, unknown>;
  if (t.soort === 'lezen' || t.soort === 'tellen') {
    return typeof t.kernId === 'string' && (t.modus === 'oefenen' || t.modus === 'toets') && [1, 2, 3].includes(t.nummer as number);
  }
  if (t.soort === 'ronde') return isRondeId(t.id);
  if (t.soort === 'luisteren') return typeof t.hoofdstukId === 'string';
  return false;
}

function lees(): DagplanData {
  const sleutel = opslagSleutel();
  const inGeheugen = geheugenFallback.get(sleutel);
  if (inGeheugen) return inGeheugen;
  const leeg: DagplanData = { onaf: {}, rondes: {} };
  try {
    const ruw = localStorage.getItem(sleutel);
    if (!ruw) return leeg;
    const data = JSON.parse(ruw) as Partial<DagplanData>;
    if (!data || typeof data !== 'object') return leeg;
    // Opslag is niet te vertrouwen: alleen overnemen wat klopt.
    const schoon: DagplanData = { onaf: {}, rondes: {} };
    if (data.onaf && typeof data.onaf === 'object') {
      for (const [vak, taak] of Object.entries(data.onaf)) {
        if (isTaak(taak) && vakVan(taak) === vak) schoon.onaf[vak as Vak] = taak;
      }
    }
    if (data.rondes && typeof data.rondes === 'object') {
      for (const [id, aantal] of Object.entries(data.rondes)) {
        if (isRondeId(id) && Number.isFinite(aantal) && (aantal as number) >= 0) schoon.rondes[id] = aantal as number;
      }
    }
    const plan = data.plan;
    if (
      plan &&
      typeof plan.datum === 'string' &&
      (plan.groep === 'kleuter' || plan.groep === 'groep3') &&
      Array.isArray(plan.taken) &&
      plan.taken.every(isTaak) &&
      Array.isArray(plan.klaar) &&
      plan.klaar.length === plan.taken.length
    ) {
      schoon.plan = { ...plan, klaar: plan.klaar.map((k) => k === true), bonusBetaald: plan.bonusBetaald === true };
    }
    return schoon;
  } catch {
    return leeg;
  }
}

function schrijf(data: DagplanData): void {
  const sleutel = opslagSleutel();
  try {
    localStorage.setItem(sleutel, JSON.stringify(data));
    geheugenFallback.delete(sleutel);
  } catch {
    geheugenFallback.set(sleutel, data);
  }
}

function vakVan(taak: Taak): Vak {
  if (taak.soort === 'ronde') return taak.id.startsWith('schrijven-') ? 'schrijven' : 'ontdekken';
  return taak.soort;
}

function taakSleutel(taak: Taak): string {
  if (taak.soort === 'ronde') return `ronde:${taak.id}`;
  if (taak.soort === 'luisteren') return `luisteren:${taak.hoofdstukId}`;
  // Bij een toets doet het nummer niet mee.
  return taak.modus === 'toets' ? `${taak.soort}:${taak.kernId}:toets` : `${taak.soort}:${taak.kernId}:${taak.nummer}`;
}

function vandaag(): string {
  const nu = new Date();
  return `${nu.getFullYear()}-${String(nu.getMonth() + 1).padStart(2, '0')}-${String(nu.getDate()).padStart(2, '0')}`;
}

/** Een oefening, toets of ronde is begonnen: onthouden voor het geval hij half blijft. */
export function startTaak(taak: Taak): void {
  const data = lees();
  data.onaf[vakVan(taak)] = taak;
  schrijf(data);
}

/** Tot het eind gespeeld (ook buiten "Vandaag" om): niet meer half, en afvinken in het plan. */
export function rondTaakAf(taak: Taak): void {
  const data = lees();
  const sleutel = taakSleutel(taak);
  const vak = vakVan(taak);
  const onaf = data.onaf[vak];
  if (onaf && taakSleutel(onaf) === sleutel) delete data.onaf[vak];
  if (taak.soort === 'ronde') data.rondes[taak.id] = (data.rondes[taak.id] ?? 0) + 1;
  if (data.plan && data.plan.datum === vandaag()) {
    data.plan.taken.forEach((t, i) => {
      if (taakSleutel(t) === sleutel) data.plan!.klaar[i] = true;
    });
  }
  schrijf(data);
}

/** Was deze taak de vorige keer begonnen maar niet afgemaakt? */
export function isOnaf(taak: Taak): boolean {
  const onaf = lees().onaf[vakVan(taak)];
  return !!onaf && taakSleutel(onaf) === taakSleutel(taak);
}

/** Het plan van vandaag voor deze groep; maakt een nieuw plan als er nog geen is. */
export function haalDagplan(groep: Groep): Dagplan {
  const data = lees();
  if (data.plan && data.plan.datum === vandaag() && data.plan.groep === groep) return data.plan;
  const taken = groep === 'kleuter' ? kleuterTaken(data) : groep3Taken(data);
  data.plan = { datum: vandaag(), groep, taken, klaar: taken.map(() => false), bonusBetaald: false };
  schrijf(data);
  return data.plan;
}

/** Alle drie af en de bonus nog niet gehad: zet hem op betaald en geef true terug. */
export function neemDagBonus(): boolean {
  const data = lees();
  const plan = data.plan;
  if (!plan || plan.datum !== vandaag() || plan.bonusBetaald || !plan.klaar.every(Boolean)) return false;
  plan.bonusBetaald = true;
  schrijf(data);
  return true;
}

function groep3Taken(data: DagplanData): Taak[] {
  return [
    kernTaak(data, 'lezen', leesKernen()),
    kernTaak(data, 'tellen', rekenKernen()),
    rondeTaak(data, 'schrijven', ['schrijven-letters', 'schrijven-woordjes']),
  ];
}

function kleuterTaken(data: DagplanData): Taak[] {
  // Derde kaart: om de dag een ander vak, tenzij er in een van die vakken iets half ligt.
  const extra: Vak[] = ['luisteren', 'ontdekken', 'schrijven'];
  const dagNummer = Math.floor(Date.now() / 86_400_000);
  const vak = extra.find((v) => data.onaf[v]) ?? extra[dagNummer % extra.length];
  const derde =
    vak === 'luisteren'
      ? luisterTaak(data)
      : vak === 'ontdekken'
        ? rondeTaak(data, 'ontdekken', ONTDEKKEN_IDS)
        : rondeTaak(data, 'schrijven', ['schrijven-lijnen', 'schrijven-letters']);
  return [kernTaak(data, 'lezen', leesKernen()), kernTaak(data, 'tellen', rekenKernen()), derde];
}

// De hoofdstukken op volgorde: het eerste dat nog niet gehaald is (toets met 2+ sterren),
// en daarin de eerste oefening die nog niet af is, of anders de toets.
function kernTaak(data: DagplanData, soort: 'lezen' | 'tellen', kernen: { id: string }[]): Taak {
  const onaf = data.onaf[soort];
  if (onaf && onaf.soort === soort && kernen.some((k) => k.id === onaf.kernId)) return onaf;
  const oefenen = (kernId: string, nummer: OefeningNummer): Taak => ({ soort, kernId, modus: 'oefenen', nummer });
  const toets = (kernId: string): Taak => ({ soort, kernId, modus: 'toets', nummer: 1 });
  const nummers: OefeningNummer[] = [1, 2, 3];
  for (const kern of kernen) {
    const voortgang = haalKernVoortgang(kern.id);
    if (voortgang.voltooid && voortgang.sterren >= 2) continue;
    const open = nummers.find((n) => !voortgang.oefeningenAf.includes(n));
    if (open) return oefenen(kern.id, open);
    if (!voortgang.voltooid) return toets(kern.id);
    // Toets wel gedaan maar nog te weinig sterren: de ene dag nog eens oefenen, de andere de toets.
    return kies([toets(kern.id), oefenen(kern.id, kies(nummers))]);
  }
  // Alles gehaald: een toets die nog geen drie sterren heeft, anders gewoon iets herhalen.
  const nietPerfect = kernen.find((k) => haalKernVoortgang(k.id).sterren < 3);
  if (nietPerfect) return toets(nietPerfect.id);
  return oefenen(kies(kernen).id, kies(nummers));
}

function rondeTaak(data: DagplanData, vak: Vak, ids: RondeId[]): Taak {
  const onaf = data.onaf[vak];
  if (onaf && onaf.soort === 'ronde' && ids.includes(onaf.id)) return onaf;
  const minst = Math.min(...ids.map((id) => data.rondes[id] ?? 0));
  return { soort: 'ronde', id: kies(ids.filter((id) => (data.rondes[id] ?? 0) === minst)) };
}

function luisterTaak(data: DagplanData): Taak {
  const speelbaar = LUISTER_HOOFDSTUKKEN.filter(
    (h) => hoofdstukWoorden(h.woorden, h.plaatjes).length >= MIN_HOOFDSTUK_WOORDEN,
  );
  const onaf = data.onaf.luisteren;
  if (onaf && onaf.soort === 'luisteren' && speelbaar.some((h) => h.id === onaf.hoofdstukId)) return onaf;
  if (speelbaar.length === 0) return rondeTaak(data, 'ontdekken', ONTDEKKEN_IDS);
  const nieuw = speelbaar.find((h) => haalKernVoortgang(`luister-${h.id}`).sterren === 0);
  return { soort: 'luisteren', hoofdstukId: (nieuw ?? kies(speelbaar)).id };
}
