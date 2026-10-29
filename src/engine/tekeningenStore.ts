import { haalActiefProfielId } from './profielStore.ts';

// Tekeningen bewaren: 10 plekjes per profiel, in de opslag van de app zelf (localStorage,
// in de app ook gespiegeld naar Preferences, zie native.ts). Niets gaat naar de foto's van
// het toestel. Een tekening wordt bewaard als lijnen (niet als plaatje): klein, scherp op
// elk formaat en het kind kan later verder tekenen.

export const AANTAL_PLEKKEN = 10;

export interface Lijn {
  kleur: string; // kleurcode of 'gum'
  dikte: number;
  punten: [number, number][]; // genormaliseerd 0..1
  onder?: boolean; // op de onderste laag (anders de bovenste; oude tekeningen hadden alleen die)
}

export interface Tekening {
  lijnen: Lijn[];
  verhouding: number; // breedte / hoogte van het blad bij het bewaren (voor het plaatje in de lijst)
}

// Compact: elke coördinaat als getal 0..4095 in twee tekens (64 x 64). Punten die vlak bij
// het vorige liggen vallen weg; dat zie je niet, maar het scheelt veel ruimte.
const TEKENS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const STAP = 4095;
const MIN_AFSTAND = 0.003;

function codeer(punten: [number, number][]): string {
  let uit = '';
  let vorige: [number, number] | null = null;
  punten.forEach((p, i) => {
    const laatste = i === punten.length - 1;
    if (vorige && !laatste && Math.hypot(p[0] - vorige[0], p[1] - vorige[1]) < MIN_AFSTAND) return;
    vorige = p;
    for (const c of p) {
      const n = Math.round(Math.min(1, Math.max(0, c)) * STAP);
      uit += TEKENS[n >> 6] + TEKENS[n & 63];
    }
  });
  return uit;
}

function decodeer(tekst: string): [number, number][] {
  const getal = (i: number): number => ((TEKENS.indexOf(tekst[i]) << 6) | TEKENS.indexOf(tekst[i + 1])) / STAP;
  const punten: [number, number][] = [];
  for (let i = 0; i + 3 < tekst.length; i += 4) punten.push([getal(i), getal(i + 2)]);
  return punten;
}

type Opgeslagen = { v: number; l: { k: string; d: number; p: string; o?: 1 }[] } | null;

const sleutel = (): string => `leren-lezen:tekeningen:${haalActiefProfielId() ?? 'gast'}`;

function isGeldig(t: unknown): t is NonNullable<Opgeslagen> {
  const x = t as NonNullable<Opgeslagen> | null;
  return (
    !!x &&
    Number.isFinite(x.v) &&
    x.v > 0 &&
    Array.isArray(x.l) &&
    x.l.every((l) => !!l && typeof l.k === 'string' && Number.isFinite(l.d) && typeof l.p === 'string')
  );
}

function leesAlles(): Opgeslagen[] {
  try {
    const ruw = JSON.parse(localStorage.getItem(sleutel()) ?? '[]') as unknown;
    const lijst = Array.isArray(ruw) ? ruw : [];
    // Een kapotte plek wordt leeg; de andere tekeningen blijven.
    return Array.from({ length: AANTAL_PLEKKEN }, (_, i) => (isGeldig(lijst[i]) ? lijst[i] : null));
  } catch {
    return Array.from({ length: AANTAL_PLEKKEN }, () => null);
  }
}

function schrijfAlles(alles: Opgeslagen[]): boolean {
  try {
    localStorage.setItem(sleutel(), JSON.stringify(alles));
    return true;
  } catch {
    return false; // opslag vol of geblokkeerd
  }
}

export function haalTekeningen(): (Tekening | null)[] {
  return leesAlles().map((t) =>
    t
      ? {
          verhouding: t.v,
          lijnen: t.l.map((l) => ({ kleur: l.k, dikte: l.d, punten: decodeer(l.p), ...(l.o === 1 ? { onder: true } : {}) })),
        }
      : null,
  );
}

export function bewaarTekening(plek: number, tekening: Tekening): boolean {
  const alles = leesAlles();
  alles[plek] = {
    v: Math.round(tekening.verhouding * 1000) / 1000,
    l: tekening.lijnen.filter((l) => l.punten.length > 0).map((l) => ({ k: l.kleur, d: l.dikte, p: codeer(l.punten), ...(l.onder ? { o: 1 as const } : {}) })),
  };
  return schrijfAlles(alles);
}

export function wisTekening(plek: number): void {
  const alles = leesAlles();
  alles[plek] = null;
  schrijfAlles(alles);
}

export function eersteLegePlek(): number {
  return leesAlles().findIndex((t) => t === null);
}
