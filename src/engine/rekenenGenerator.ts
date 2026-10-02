import type { RekenKern, RekenOefeningDefinitie, RekenOefeningType, RekenSom, SomTeken, TelObject } from '../content/tellen/types.ts';

export type RekenModus = 'oefenen' | 'toets';

const OEFENEN_AANTAL = 5;
const TOETS_AANTAL = 10;
const ALLE_TYPEN: RekenOefeningType[] = [
  'hoeveelheid-naar-cijfer',
  'hoeveelheid-typen',
  'cijfer-naar-hoeveelheid',
  'dobbelsteen-naar-cijfer',
  'vingers-naar-cijfer',
  'reeks-aanvullen',
  'optellen',
  'bussom',
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

// Kiest een getal uit bereik dat nog niet in `gebruikt` zit (voorkomt dat dezelfde vraag
// twee keer in één sessie voorkomt); valt terug op het volledige bereik zodra alles al
// gebruikt is (onvermijdelijk bij een klein bereik met veel vragen, bv. dobbelsteen 1-6).
function kiesUniekGetal(bereik: [number, number], gebruikt: Set<number>): number {
  const [min, max] = bereik;
  const kandidaten: number[] = [];
  for (let getal = min; getal <= max; getal++) {
    if (!gebruikt.has(getal)) kandidaten.push(getal);
  }
  const pool = kandidaten.length > 0 ? kandidaten : Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const gekozen = pool[Math.floor(Math.random() * pool.length)];
  gebruikt.add(gekozen);
  return gekozen;
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
    if (type === 'vingers-naar-cijfer') return min <= 10;
    if (type === 'dubbele-dobbelsteen-naar-cijfer') return max <= 12;
    if (type === 'reeks-aanvullen') return max - min >= 2;
    if (type === 'bussom') return max >= 3 && max <= 10;
    return true;
  });
}

interface SessieTracker {
  // Eén "gebruikte getallen"-set per type, zodat bv. dobbelsteen en hoeveelheid-naar-cijfer
  // elk hun eigen onafhankelijke herhaling vermijden i.p.v. elkaars getallen te blokkeren.
  getallenPerType: Map<RekenOefeningType, Set<number>>;
  optelCombinaties: Set<string>;
  somSleutels: Set<string>;
  geldStapels: Set<string>;
  modus: RekenModus;
  oefeningNummer: 1 | 2 | 3;
}

interface SomBand {
  teken: SomTeken;
  tot20: boolean;
}

const MUNT_CENT = [5, 10, 20, 50, 100, 200];

function bandVanKern(kern: RekenKern): SomBand {
  if (!kern.somTeken) throw new Error(`som zonder teken: ${kern.id}`);
  return { teken: kern.somTeken, tot20: kern.bereik[0] >= 11 };
}

function somKandidaten(band: SomBand, gebruikt: Set<string>, bezetAntwoord: Set<number>): RekenSom[] {
  const uit: RekenSom[] = [];
  if (band.teken === '+') {
    const somMin = band.tot20 ? 11 : 2;
    const somMax = band.tot20 ? 20 : 10;
    for (let a = 1; a < somMax; a++) {
      for (let b = 1; a + b <= somMax; b++) {
        const antwoord = a + b;
        if (antwoord < somMin) continue;
        const sleutel = `${a}+${b}`;
        if (gebruikt.has(sleutel) || bezetAntwoord.has(antwoord)) continue;
        uit.push({ a, b, teken: '+', antwoord });
      }
    }
    return uit;
  }
  const aMin = band.tot20 ? 11 : 1;
  const aMax = band.tot20 ? 20 : 10;
  for (let a = aMin; a <= aMax; a++) {
    for (let b = 1; b <= a; b++) {
      const antwoord = a - b;
      const sleutel = `${a}-${b}`;
      if (gebruikt.has(sleutel) || bezetAntwoord.has(antwoord)) continue;
      uit.push({ a, b, teken: '-', antwoord });
    }
  }
  return uit;
}

function pakSom(band: SomBand, tracker: SessieTracker, bezetAntwoord: Set<number>): RekenSom {
  let kandidaten = somKandidaten(band, tracker.somSleutels, bezetAntwoord);
  if (kandidaten.length === 0) kandidaten = somKandidaten(band, new Set(), bezetAntwoord);
  if (kandidaten.length === 0) throw new Error('geen som meer vrij');
  const som = kandidaten[Math.floor(Math.random() * kandidaten.length)];
  tracker.somSleutels.add(`${som.a}${som.teken}${som.b}`);
  return som;
}

function somAfleiders(som: RekenSom): number[] {
  const max = som.teken === '+' ? (som.antwoord <= 10 ? 10 : 20) : som.a <= 10 ? 10 : 20;
  const andere = som.teken === '+' ? som.a - som.b : som.a + som.b;
  const ruw = [som.antwoord - 1, som.antwoord + 1, som.antwoord - 2, som.antwoord + 2, andere, som.a];
  const pool = ruw.filter((n, i) => n >= 0 && n <= max && n !== som.antwoord && ruw.indexOf(n) === i);
  const gekozen = schud(pool).slice(0, 2);
  for (let n = 0; gekozen.length < 2 && n <= max; n++) {
    if (n !== som.antwoord && !gekozen.includes(n)) gekozen.push(n);
  }
  return gekozen;
}

function maakSomKeuze(band: SomBand, tracker: SessieTracker): RekenOefeningDefinitie {
  const som = pakSom(band, tracker, new Set());
  return { type: 'som-keuze', ...som, afleiders: somAfleiders(som) };
}

function maakSomTypen(band: SomBand, tracker: SessieTracker): RekenOefeningDefinitie {
  const som = pakSom(band, tracker, new Set());
  return { type: 'som-typen', ...som };
}

function maakKoppelen(banden: [SomBand, SomBand, SomBand], tracker: SessieTracker): RekenOefeningDefinitie {
  const bezet = new Set<number>();
  const paren = banden.map((band) => {
    const som = pakSom(band, tracker, bezet);
    bezet.add(som.antwoord);
    return som;
  });
  return { type: 'som-koppelen', paren: [paren[0], paren[1], paren[2]] };
}

interface GeldStapel {
  munten: number[];
  totaal: number;
  briefjes?: number[];
}

function stapelSleutel(munten: number[], briefjes?: number[]): string {
  const m = [...munten].sort((a, b) => a - b).join(',');
  const br = briefjes ? [...briefjes].sort((a, b) => a - b).join(',') : '';
  return `${br}|${m}`;
}

function muntenStapel(minN: number, maxN: number, maxCent: number, tracker: SessieTracker, fallback: number[]): GeldStapel {
  for (let poging = 0; poging < 60; poging++) {
    const n = minN + Math.floor(Math.random() * (maxN - minN + 1));
    const munten: number[] = [];
    let som = 0;
    let ok = true;
    for (let i = 0; i < n; i++) {
      const mogelijk = MUNT_CENT.filter((m) => som + m <= maxCent);
      if (mogelijk.length === 0) {
        ok = false;
        break;
      }
      const munt = mogelijk[Math.floor(Math.random() * mogelijk.length)];
      munten.push(munt);
      som += munt;
    }
    if (!ok || som <= 0 || som > maxCent) continue;
    const sleutel = stapelSleutel(munten);
    if (tracker.geldStapels.has(sleutel)) continue;
    tracker.geldStapels.add(sleutel);
    munten.sort((a, b) => b - a);
    return { munten, totaal: som };
  }
  const munten = [...fallback].sort((a, b) => b - a);
  tracker.geldStapels.add(stapelSleutel(munten));
  return { munten, totaal: munten.reduce((s, n) => s + n, 0) };
}

function briefStapel(
  opties: number[],
  minBrief: number,
  maxBrief: number,
  minMunten: number,
  maxMunten: number,
  tracker: SessieTracker,
): GeldStapel {
  const maxCent = 5000;
  for (let poging = 0; poging < 60; poging++) {
    const nBrief = minBrief + Math.floor(Math.random() * (maxBrief - minBrief + 1));
    const briefjes: number[] = [];
    let som = 0;
    let ok = true;
    for (let i = 0; i < nBrief; i++) {
      const mogelijk = opties.filter((b) => som + b * 100 <= maxCent - 5);
      if (mogelijk.length === 0) {
        ok = false;
        break;
      }
      const brief = mogelijk[Math.floor(Math.random() * mogelijk.length)];
      briefjes.push(brief);
      som += brief * 100;
    }
    if (!ok) continue;
    const nMunt = minMunten + Math.floor(Math.random() * (maxMunten - minMunten + 1));
    const munten: number[] = [];
    for (let i = 0; i < nMunt; i++) {
      const mogelijk = MUNT_CENT.filter((m) => som + m <= maxCent);
      if (mogelijk.length === 0) {
        ok = false;
        break;
      }
      const munt = mogelijk[Math.floor(Math.random() * mogelijk.length)];
      munten.push(munt);
      som += munt;
    }
    if (!ok || munten.length === 0 || som > maxCent) continue;
    const sleutel = stapelSleutel(munten, briefjes);
    if (tracker.geldStapels.has(sleutel)) continue;
    tracker.geldStapels.add(sleutel);
    briefjes.sort((a, b) => b - a);
    munten.sort((a, b) => b - a);
    return { munten, briefjes, totaal: som };
  }
  return { munten: [100, 50], briefjes: [5], totaal: 650 };
}

function geldAfleiders(totaal: number, munten: number[], briefjes?: number[]): number[] {
  const stukken = [...munten, ...(briefjes ?? []).map((b) => b * 100)];
  const ruw = [
    totaal - 10,
    totaal + 10,
    totaal - 20,
    totaal + 20,
    totaal - 50,
    totaal + 50,
    ...stukken.map((c) => totaal - c),
    ...stukken.map((c) => totaal + c),
  ];
  const pool = ruw.filter((n, i) => n > 0 && n !== totaal && ruw.indexOf(n) === i);
  const gekozen = schud(pool).slice(0, 2);
  let extra = 5;
  while (gekozen.length < 2 && extra < 400) {
    const n = totaal + extra;
    extra += 5;
    if (n > 0 && n !== totaal && !gekozen.includes(n)) gekozen.push(n);
  }
  return gekozen;
}

function geldVraag(type: 'geld-keuze' | 'geld-typen', stapel: GeldStapel): RekenOefeningDefinitie {
  if (type === 'geld-typen') {
    return stapel.briefjes
      ? { type, munten: stapel.munten, briefjes: stapel.briefjes, antwoordCent: stapel.totaal }
      : { type, munten: stapel.munten, antwoordCent: stapel.totaal };
  }
  const afleidersCent = geldAfleiders(stapel.totaal, stapel.munten, stapel.briefjes);
  return stapel.briefjes
    ? { type, munten: stapel.munten, briefjes: stapel.briefjes, antwoordCent: stapel.totaal, afleidersCent }
    : { type, munten: stapel.munten, antwoordCent: stapel.totaal, afleidersCent };
}

function muntenVoorNiveau(niveau: 1 | 2 | 3, tracker: SessieTracker): GeldStapel {
  if (niveau === 1) return muntenStapel(1, 3, 200, tracker, [100, 50]);
  return muntenStapel(4, 5, 1000, tracker, [200, 100, 50, 20]);
}

function briefjesVoorNiveau(niveau: 1 | 2 | 3, tracker: SessieTracker): GeldStapel {
  if (niveau === 1) return briefStapel([5], 1, 1, 1, 3, tracker);
  return briefStapel([5, 10, 20], 1, 2, 1, 4, tracker);
}

function maakGeld(kern: RekenKern, type: 'geld-keuze' | 'geld-typen', tracker: SessieTracker): RekenOefeningDefinitie {
  if (!kern.geld) throw new Error(`geld zonder soort: ${kern.id}`);
  const niveau: 1 | 2 | 3 =
    tracker.modus === 'toets' ? (type === 'geld-keuze' ? 2 : 3) : tracker.oefeningNummer;
  const stapel = kern.geld === 'munten' ? muntenVoorNiveau(niveau, tracker) : briefjesVoorNiveau(niveau, tracker);
  return geldVraag(type, stapel);
}

const HERHALING_BANDEN: SomBand[] = [
  { teken: '+', tot20: false },
  { teken: '+', tot20: true },
  { teken: '-', tot20: false },
  { teken: '-', tot20: true },
];

function maakHerhalingKoppelen(tracker: SessieTracker, overslaan: number): RekenOefeningDefinitie {
  const banden = HERHALING_BANDEN.filter((_, i) => i !== overslaan);
  return maakKoppelen([banden[0], banden[1], banden[2]], tracker);
}

function genereerHerhaling(modus: RekenModus, oefeningNummer: 1 | 2 | 3, tracker: SessieTracker): RekenOefeningDefinitie[] {
  const plus10: SomBand = { teken: '+', tot20: false };
  const plus20: SomBand = { teken: '+', tot20: true };
  const min10: SomBand = { teken: '-', tot20: false };
  const min20: SomBand = { teken: '-', tot20: true };
  const muntKeuze = (): RekenOefeningDefinitie => geldVraag('geld-keuze', muntenStapel(2, 4, 1000, tracker, [100, 50, 20]));
  const briefKeuze = (): RekenOefeningDefinitie => geldVraag('geld-keuze', briefStapel([5, 10, 20], 1, 2, 1, 3, tracker));
  const muntTypen = (): RekenOefeningDefinitie => geldVraag('geld-typen', muntenStapel(2, 4, 1000, tracker, [200, 100, 50]));
  const briefTypen = (): RekenOefeningDefinitie => geldVraag('geld-typen', briefStapel([5, 10, 20], 1, 2, 1, 3, tracker));

  if (modus === 'toets') {
    return schud([
      maakSomKeuze(plus10, tracker),
      maakSomKeuze(plus20, tracker),
      maakSomKeuze(min10, tracker),
      maakSomKeuze(min20, tracker),
      muntKeuze(),
      muntKeuze(),
      briefKeuze(),
      maakSomTypen(plus10, tracker),
      maakSomTypen(min20, tracker),
      muntTypen(),
      briefTypen(),
      maakHerhalingKoppelen(tracker, 0),
    ]);
  }
  if (oefeningNummer === 1) {
    return schud([
      maakSomKeuze(plus10, tracker),
      maakSomKeuze(plus20, tracker),
      maakSomKeuze(min10, tracker),
      maakSomKeuze(min20, tracker),
      muntKeuze(),
      muntKeuze(),
      briefKeuze(),
      briefKeuze(),
    ]);
  }
  if (oefeningNummer === 2) {
    return [0, 1, 2, 3, 4].map((i) => maakHerhalingKoppelen(tracker, i % 4));
  }
  return schud([
    maakSomTypen(plus10, tracker),
    maakSomTypen(plus20, tracker),
    maakSomTypen(min10, tracker),
    maakSomTypen(min20, tracker),
    muntTypen(),
    muntTypen(),
    briefTypen(),
    briefTypen(),
  ]);
}

function mengGelijk(typen: readonly RekenOefeningType[], aantal: number): RekenOefeningType[] {
  const uniek: RekenOefeningType[] = [];
  for (const type of typen) {
    if (!uniek.includes(type)) uniek.push(type);
  }
  const basis = Math.floor(aantal / uniek.length);
  let rest = aantal % uniek.length;
  const lijst: RekenOefeningType[] = [];
  for (const type of uniek) {
    const n = basis + (rest > 0 ? 1 : 0);
    if (rest > 0) rest--;
    for (let i = 0; i < n; i++) lijst.push(type);
  }
  return schud(lijst);
}

function maakOefening(kern: RekenKern, type: RekenOefeningType, tracker: SessieTracker): RekenOefeningDefinitie {
  const [min, max] = kern.bereik;
  const gebruikt = tracker.getallenPerType.get(type) ?? new Set<number>();
  tracker.getallenPerType.set(type, gebruikt);

  switch (type) {
    case 'dobbelsteen-naar-cijfer': {
      // Een dobbelsteen heeft maar 6 kanten, ongeacht het getalbereik van deze kern.
      const dobbelBereik: [number, number] = [min, Math.min(max, 6)];
      const cijfer = kiesUniekGetal(dobbelBereik, gebruikt);
      return { type, cijfer, afleiders: kiesAfleidCijfers(dobbelBereik, cijfer, 2) };
    }
    case 'vingers-naar-cijfer': {
      // Handen tonen tot en met 10 vingers, ongeacht het getalbereik van deze kern.
      const vingerBereik: [number, number] = [min, Math.min(max, 10)];
      const cijfer = kiesUniekGetal(vingerBereik, gebruikt);
      return { type, cijfer, afleiders: kiesAfleidCijfers(vingerBereik, cijfer, 2) };
    }
    case 'dubbele-dobbelsteen-naar-cijfer': {
      // Twee gewone dobbelstenen, alle stippen samen; som hoogstens 10 (en nooit boven 12).
      const grens = Math.min(12, Math.max(max, 10));
      let links = 1;
      let rechts = 1;
      for (let poging = 0; poging < 20; poging++) {
        links = 1 + Math.floor(Math.random() * 6);
        rechts = 1 + Math.floor(Math.random() * 6);
        const sleutel = `d${links}+${rechts}`;
        if (links + rechts <= grens && (!tracker.optelCombinaties.has(sleutel) || poging === 19)) {
          tracker.optelCombinaties.add(sleutel);
          break;
        }
      }
      if (links + rechts > grens) [links, rechts] = [1, 1];
      const cijfer = links + rechts;
      // Soms de stippen van alleen de grootste dobbelsteen (de klassieke fout "maar één
      // geteld"), verder buurgetallen. Geschud, anders stond het goede antwoord altijd in
      // het midden van de drie knoppen.
      const buren = schud([cijfer - 2, cijfer - 1, cijfer + 1, cijfer + 2]);
      const kandidaten = (Math.random() < 0.5 ? [Math.max(links, rechts), ...buren] : buren).filter(
        (n, i, lijst) => n >= 1 && n <= grens && n !== cijfer && lijst.indexOf(n) === i,
      );
      return { type, links, rechts, cijfer, afleiders: kandidaten.slice(0, 2) };
    }
    case 'reeks-aanvullen': {
      // Middelste getal van 3 opeenvolgende getallen ontbreekt, bv. 11-[ ]-13.
      const antwoord = kiesUniekGetal([min + 1, max - 1], gebruikt);
      return { type, voor: antwoord - 1, antwoord, na: antwoord + 1 };
    }
    case 'optellen': {
      // Som altijd onder de 10, beide termen minstens 1. Probeer een paar keer een
      // a+b-combinatie te vinden die deze sessie nog niet is voorgekomen.
      let a = 1;
      let b = 1;
      for (let poging = 0; poging < 15; poging++) {
        const som = 2 + Math.floor(Math.random() * 8); // 2..9
        const proefA = 1 + Math.floor(Math.random() * (som - 1));
        const sleutel = `${proefA}+${som - proefA}`;
        if (!tracker.optelCombinaties.has(sleutel) || poging === 14) {
          a = proefA;
          b = som - proefA;
          tracker.optelCombinaties.add(sleutel);
          break;
        }
      }
      const som = a + b;
      const afleiders = schud(
        [som - 1, som + 1, som - 2, som + 2].filter((n) => n >= 1 && n <= 9 && n !== som),
      ).slice(0, 2);
      return { type, a, b, antwoord: som, afleiders };
    }
    case 'bussom': {
      // Totaal blijft binnen het bereik en de bus wordt nooit leeg.
      const bovengrens = Math.min(max, 10);
      for (let poging = 0; ; poging++) {
        const start = 1 + Math.floor(Math.random() * (bovengrens - 1));
        const erin = start === 1 || Math.random() < 0.5;
        const ruimte = erin ? bovengrens - start : start - 1;
        const stap = 1 + Math.floor(Math.random() * Math.min(ruimte, 4));
        const verandering = erin ? stap : -stap;
        const antwoord = start + verandering;
        const sleutel = `${start}${verandering}`;
        if (tracker.optelCombinaties.has(sleutel) && poging < 15) continue;
        tracker.optelCombinaties.add(sleutel);
        // 'start' als afleider: de klassieke fout is vergeten dat er iemand in/uit stapte.
        // De buren geschud: anders was het goede antwoord bij 'eraf' altijd het kleinste
        // getal en kon er bij een volle bus maar één afleider overblijven.
        const buren = schud([antwoord + 1, antwoord - 1, antwoord + 2, antwoord - 2]);
        const kandidaten = [start, ...buren].filter(
          (n, i, lijst) => n >= 1 && n <= bovengrens && n !== antwoord && lijst.indexOf(n) === i,
        );
        return { type, start, verandering, antwoord, afleiders: kandidaten.slice(0, 2) };
      }
    }
    case 'hoeveelheid-naar-cijfer': {
      const cijfer = kiesUniekGetal(kern.bereik, gebruikt);
      return { type, aantal: cijfer, object: kiesObject(kern.objecten), afleiders: kiesAfleidCijfers(kern.bereik, cijfer, 2) };
    }
    case 'hoeveelheid-typen': {
      const aantal = kiesUniekGetal(kern.bereik, gebruikt);
      return { type, aantal, object: kiesObject(kern.objecten) };
    }
    case 'cijfer-naar-hoeveelheid': {
      const cijfer = kiesUniekGetal(kern.bereik, gebruikt);
      return { type, cijfer, object: kiesObject(kern.objecten), afleiders: kiesAfleidCijfers(kern.bereik, cijfer, 2) };
    }
    case 'som-keuze':
      return maakSomKeuze(bandVanKern(kern), tracker);
    case 'som-typen':
      return maakSomTypen(bandVanKern(kern), tracker);
    case 'som-koppelen': {
      const band = bandVanKern(kern);
      return maakKoppelen([band, band, band], tracker);
    }
    case 'geld-keuze':
    case 'geld-typen':
      return maakGeld(kern, type, tracker);
    default: {
      const nooit: never = type;
      throw new Error(`onbekend rekentype: ${nooit}`);
    }
  }
}

export function genereerRekenSessie(
  kern: RekenKern,
  modus: RekenModus,
  oefeningNummer: 1 | 2 | 3 = 1,
): RekenOefeningDefinitie[] {
  const tracker: SessieTracker = {
    getallenPerType: new Map(),
    optelCombinaties: new Set(),
    somSleutels: new Set(),
    geldStapels: new Set(),
    modus,
    oefeningNummer,
  };
  if (kern.herhaling === 'plus-min-geld') return genereerHerhaling(modus, oefeningNummer, tracker);

  const aantal = modus === 'oefenen' ? OEFENEN_AANTAL : TOETS_AANTAL;
  let typeVolgorde: RekenOefeningType[];
  if (kern.oefeningVolgorde) {
    const vast = kern.oefeningVolgorde[oefeningNummer - 1];
    typeVolgorde = modus === 'toets' ? mengGelijk(kern.oefeningVolgorde, aantal) : Array.from({ length: aantal }, () => vast);
  } else {
    const typen = toepasbareTypen(kern);
    // Zelf typen (hoeveelheid-typen, reeks-aanvullen) twee keer zo vaak: meerkeuze alleen
    // was te makkelijk voor zesjarigen.
    const TYPEN: RekenOefeningType[] = ['hoeveelheid-typen', 'reeks-aanvullen'];
    const gewogen = typen.flatMap((t) => (TYPEN.includes(t) && typen.length > 1 ? [t, t] : [t]));
    typeVolgorde = [];
    while (typeVolgorde.length < aantal) {
      typeVolgorde.push(...schud([...gewogen]));
    }
    typeVolgorde = typeVolgorde.slice(0, aantal);
  }
  return typeVolgorde.map((type) => maakOefening(kern, type, tracker));
}
