import type { Groep } from '../content/types.ts';
import { haalActiefProfielId } from './profielStore.ts';
import { haalKernVoortgang } from './progressStore.ts';
import { leesKernen, rekenKernen } from './leeftijdGrens.ts';
import { kies } from './toeval.ts';
import type { OefeningNummer } from './oefeningGenerator.ts';
import { LUISTER_HOOFDSTUKKEN } from '../content/luisteren/hoofdstukken.ts';
import { MIN_HOOFDSTUK_WOORDEN, hoofdstukWoorden } from './luisterenGenerator.ts';
import { ONTDEKKEN_IDS, isRondeId, type RondeId } from '../games/rondeActiviteiten.ts';
import { BEGRIJPEND_VERHALEN } from '../content/lezen/begrijpend.ts';

// "Vandaag": drie oefeningen die de app voor dit kind kiest, zodat het niet zelf uit alle
// menu's hoeft te zoeken. Groep 3: lezen, tellen, schrijven. Kleuter: letters, tellen en
// om de dag Luisteren, Ontdekken of Schrijven. Nooit muziek of spelletjes.
// Per vak: eerst wat de vorige keer half bleef, dan de volgende stap in de hoofdstukken.
// Het plan staat vast voor de dag; alles blijft ook gewoon los te kiezen.
// Een verhaaltje lezen (begrijpend lezen) alleen voor wie al heel goed leest: groep 3 met
// alle leeshoofdstukken gehaald. Dan is de leeskaart om de dag een verhaaltje.

export const MUNTEN_DAGPLAN = 20; // als alle drie af zijn, één keer per dag (×1.5 voor kleuters)

export type Taak =
  | { soort: 'lezen' | 'tellen'; kernId: string; modus: 'oefenen' | 'toets'; nummer: OefeningNummer }
  | { soort: 'ronde'; id: RondeId }
  | { soort: 'luisteren'; hoofdstukId: string }
  | { soort: 'begrijpend'; verhaalId: string };

type Vak = 'lezen' | 'tellen' | 'schrijven' | 'ontdekken' | 'luisteren' | 'begrijpend';

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
  // Hoe vaak elk verhaaltje goed beantwoord is: het minst gelezen komt eerst.
  verhalen: Record<string, number>;
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
  if (t.soort === 'begrijpend') return BEGRIJPEND_VERHALEN.some((v) => v.id === t.verhaalId);
  return false;
}

function lees(): DagplanData {
  const sleutel = opslagSleutel();
  const inGeheugen = geheugenFallback.get(sleutel);
  if (inGeheugen) return inGeheugen;
  const leeg: DagplanData = { onaf: {}, rondes: {}, verhalen: {} };
  try {
    const ruw = localStorage.getItem(sleutel);
    if (!ruw) return leeg;
    const data = JSON.parse(ruw) as Partial<DagplanData>;
    if (!data || typeof data !== 'object') return leeg;
    // Opslag is niet te vertrouwen: alleen overnemen wat klopt.
    const schoon: DagplanData = { onaf: {}, rondes: {}, verhalen: {} };
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
    if (data.verhalen && typeof data.verhalen === 'object') {
      for (const [id, aantal] of Object.entries(data.verhalen)) {
        if (BEGRIJPEND_VERHALEN.some((v) => v.id === id) && Number.isFinite(aantal) && aantal >= 0) schoon.verhalen[id] = aantal;
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
  if (taak.soort === 'begrijpend') return `begrijpend:${taak.verhaalId}`;
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
  if (taak.soort === 'begrijpend') data.verhalen[taak.verhaalId] = (data.verhalen[taak.verhaalId] ?? 0) + 1;
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

/**
 * Schudknop: kaart `index` wordt een ander passend volgend stapje. Dat mag ook uit een ander
 * vak komen (twee keer lezen is goed), alleen niet iets wat al op een andere kaart staat.
 * Nog eens tikken loopt alle mogelijkheden rond. Geeft het (bijgewerkte) plan terug.
 */
export function wisselTaak(index: number): Dagplan | null {
  const data = lees();
  const plan = data.plan;
  if (!plan || plan.datum !== vandaag() || plan.klaar[index] || !plan.taken[index]) return null;
  const opAndereKaarten = new Set(plan.taken.filter((_, j) => j !== index).map(taakSleutel));
  // Eigen vak vooraan, dan om en om met de andere vakken.
  const rijen = [index, ...plan.taken.keys()].filter((j, k, lijst) => lijst.indexOf(j) === k).map((j) => kandidatenVoor(data, plan.groep, j));
  const kandidaten = zonderDubbele(mengRijen(rijen)).filter((t) => !opAndereKaarten.has(taakSleutel(t)));
  const huidig = taakSleutel(plan.taken[index]);
  const plek = kandidaten.findIndex((t) => taakSleutel(t) === huidig);
  const volgende = kandidaten[(plek + 1) % kandidaten.length];
  if (!volgende || taakSleutel(volgende) === huidig) return plan;
  plan.taken[index] = volgende;
  schrijf(data);
  return plan;
}

// Alle redelijke keuzes voor een kaart, de gewone keuze vooraan. Kaart 0 is lezen, 1 tellen,
// 2 schrijven (groep 3) of luisteren/ontdekken/schrijven door elkaar (kleuter).
function kandidatenVoor(data: DagplanData, groep: Groep, index: number): Taak[] {
  if (index === 0) {
    const lezen = kernKandidaten(data, 'lezen', leesKernen());
    return groep === 'groep3' && leestAlHeelGoed() ? mengRijen([lezen, verhaalKandidaten(data)]) : lezen;
  }
  if (index === 1) return kernKandidaten(data, 'tellen', rekenKernen());
  if (groep === 'groep3') return rondeKandidaten(data, 'schrijven', ['schrijven-letters', 'schrijven-woordjes']);
  return mengRijen([
    luisterKandidaten(data),
    rondeKandidaten(data, 'ontdekken', ONTDEKKEN_IDS),
    rondeKandidaten(data, 'schrijven', ['schrijven-lijnen', 'schrijven-letters']),
  ]);
}

// Om en om uit elke rij, zodat de eerste tik meteen iets heel anders kan geven.
function mengRijen(rijen: Taak[][]): Taak[] {
  const gemengd: Taak[] = [];
  for (let i = 0; i < Math.max(0, ...rijen.map((r) => r.length)); i++) {
    for (const rij of rijen) if (rij[i]) gemengd.push(rij[i]);
  }
  return gemengd;
}

function zonderDubbele(taken: Taak[]): Taak[] {
  const gezien = new Set<string>();
  return taken.filter((t) => {
    const sleutel = taakSleutel(t);
    if (gezien.has(sleutel)) return false;
    gezien.add(sleutel);
    return true;
  });
}

// Voor lezen/tellen: wat half bleef, de open oefeningen en de toets van het huidige
// hoofdstuk, het begin van het volgende en een herhaling van het vorige.
function kernKandidaten(data: DagplanData, soort: 'lezen' | 'tellen', kernen: { id: string }[]): Taak[] {
  const lijst: Taak[] = [];
  const onaf = data.onaf[soort];
  if (onaf && onaf.soort === soort && kernen.some((k) => k.id === onaf.kernId)) lijst.push(onaf);
  const nummers: OefeningNummer[] = [1, 2, 3];
  const gehaald = (id: string): boolean => {
    const v = haalKernVoortgang(id);
    return v.voltooid && v.sterren >= 2;
  };
  const open = (id: string): OefeningNummer[] => nummers.filter((n) => !haalKernVoortgang(id).oefeningenAf.includes(n));
  const oefenen = (kernId: string, nummer: OefeningNummer): Taak => ({ soort, kernId, modus: 'oefenen', nummer });
  const toets = (kernId: string): Taak => ({ soort, kernId, modus: 'toets', nummer: 1 });
  const i = kernen.findIndex((k) => !gehaald(k.id));
  if (i < 0) {
    // Alles gehaald: een paar herhalingen, vast per dag zodat schudden rond kan lopen.
    const dag = Math.floor(Date.now() / 86_400_000);
    for (let n = 0; n < 4; n++) lijst.push(oefenen(kernen[(dag * 5 + n * 7) % kernen.length].id, nummers[(dag + n) % 3]));
    return zonderDubbele(lijst);
  }
  const kern = kernen[i];
  for (const n of open(kern.id)) lijst.push(oefenen(kern.id, n));
  if (open(kern.id).length === 0) lijst.push(oefenen(kern.id, kies(nummers)));
  lijst.push(toets(kern.id));
  const volgende = kernen.slice(i + 1).find((k) => !gehaald(k.id));
  if (volgende) lijst.push(oefenen(volgende.id, open(volgende.id)[0] ?? 1));
  if (i > 0) lijst.push(oefenen(kernen[i - 1].id, kies(nummers)));
  return zonderDubbele(lijst);
}

// Rondespellen: wat half bleef, dan van minst naar meest gespeeld.
function rondeKandidaten(data: DagplanData, vak: Vak, ids: RondeId[]): Taak[] {
  const lijst: Taak[] = [];
  const onaf = data.onaf[vak];
  if (onaf && onaf.soort === 'ronde' && ids.includes(onaf.id)) lijst.push(onaf);
  const opVolgorde = [...ids].sort((a, b) => (data.rondes[a] ?? 0) - (data.rondes[b] ?? 0));
  for (const id of opVolgorde) lijst.push({ soort: 'ronde', id });
  return zonderDubbele(lijst);
}

// Luisteren: wat half bleef en de eerste twee hoofdstukken zonder sterren.
function luisterKandidaten(data: DagplanData): Taak[] {
  const speelbaar = LUISTER_HOOFDSTUKKEN.filter(
    (h) => hoofdstukWoorden(h.woorden, h.plaatjes).length >= MIN_HOOFDSTUK_WOORDEN,
  );
  const lijst: Taak[] = [];
  const onaf = data.onaf.luisteren;
  if (onaf && onaf.soort === 'luisteren' && speelbaar.some((h) => h.id === onaf.hoofdstukId)) lijst.push(onaf);
  const nieuw = speelbaar.filter((h) => haalKernVoortgang(`luister-${h.id}`).sterren === 0);
  for (const h of (nieuw.length ? nieuw : speelbaar).slice(0, 2)) lijst.push({ soort: 'luisteren', hoofdstukId: h.id });
  return zonderDubbele(lijst);
}

// Verhaaltjes: wat half bleef, dan van minst naar meest gelezen.
function verhaalKandidaten(data: DagplanData): Taak[] {
  const lijst: Taak[] = [];
  const onaf = data.onaf.begrijpend;
  if (onaf && onaf.soort === 'begrijpend') lijst.push(onaf);
  const opVolgorde = [...BEGRIJPEND_VERHALEN].sort((a, b) => (data.verhalen[a.id] ?? 0) - (data.verhalen[b.id] ?? 0));
  for (const v of opVolgorde) lijst.push({ soort: 'begrijpend', verhaalId: v.id });
  return zonderDubbele(lijst);
}

// Heel goed in lezen: alle leeshoofdstukken gehaald (toets met 2+ sterren).
function leestAlHeelGoed(): boolean {
  return leesKernen().every((k) => {
    const v = haalKernVoortgang(k.id);
    return v.voltooid && v.sterren >= 2;
  });
}

function groep3Taken(data: DagplanData): Taak[] {
  const dagNummer = Math.floor(Date.now() / 86_400_000);
  const verhaal = leestAlHeelGoed() && (data.onaf.begrijpend || dagNummer % 2 === 0);
  return [
    verhaal ? verhaalTaak(data) : kernTaak(data, 'lezen', leesKernen()),
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

function verhaalTaak(data: DagplanData): Taak {
  const onaf = data.onaf.begrijpend;
  if (onaf && onaf.soort === 'begrijpend') return onaf;
  const minst = Math.min(...BEGRIJPEND_VERHALEN.map((v) => data.verhalen[v.id] ?? 0));
  return { soort: 'begrijpend', verhaalId: kies(BEGRIJPEND_VERHALEN.filter((v) => (data.verhalen[v.id] ?? 0) === minst)).id };
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
