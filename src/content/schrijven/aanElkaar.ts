import type { Figuur, Haal, Punt } from './letters.ts';

// Schrijfletters "aan elkaar" (verbonden schrift) om over te trekken, voor profielen die
// in het menu Schrift → Aan elkaar kozen (engine/schrift.ts). Zelfde eenheden als
// letters.ts: stokken vanaf y=10, x-hoogte y=40, schrijflijn y=80, staartjes tot ~105.
//
// Elke letter is één doorgaande haal (de kern) vanaf het punt waar de verbindingshaal
// aankomt. De kern bestaat uit vloeiende stukken door steunpunten; tussen twee stukken
// zit een hoek (daar keert de pen om, bv. onderaan de stok van de n). De verbindingen
// tussen de letters worden berekend: na een lage uitgang (de meeste letters) loopt de haal
// vanaf de schrijflijn omhoog naar de volgende letter, na o, b, r, v en w (hoog) loopt hij
// op de x-hoogte verder. Puntjes (i, j), het streepje van de t en het kruis van de x komen
// pas na het hele woord, net als in een schrift.

interface SchrijfLetter {
  kern: Punt[][];
  // Richting waarin de verbinding bij de kern aankomt (standaard schuin omhoog).
  in?: Punt;
  // Ronde letters (a c d g o q) beginnen bovenaan het rondje; geen aanhaal als ze vooraan staan.
  rond?: boolean;
  hoog?: boolean;
  extra?: Haal[];
}

// Vloeiende lijn (Catmull-Rom) door de steunpunten.
function vloeiend(punten: Punt[]): Punt[] {
  if (punten.length < 3) return punten;
  const uit: Punt[] = [];
  const p = (i: number): Punt => punten[Math.max(0, Math.min(punten.length - 1, i))];
  for (let i = 0; i < punten.length - 1; i++) {
    const [a, b, c, d] = [p(i - 1), p(i), p(i + 1), p(i + 2)];
    for (let s = 0; s < 12; s++) {
      const t = s / 12;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (k: 0 | 1) =>
        0.5 * (2 * b[k] + (-a[k] + c[k]) * t + (2 * a[k] - 5 * b[k] + 4 * c[k] - d[k]) * t2 + (-a[k] + 3 * b[k] - 3 * c[k] + d[k]) * t3);
      uit.push([f(0), f(1)]);
    }
  }
  uit.push(punten[punten.length - 1]);
  return uit;
}

// Gelijke stapjes van ~2 eenheden, zoals de overtrekker verwacht (VOORUIT_KIJKEN).
function herbemonster(punten: Punt[], stap = 2): Punt[] {
  const uit: Punt[] = [punten[0]];
  let rest = 0;
  for (let i = 1; i < punten.length; i++) {
    const [x1, y1] = punten[i - 1];
    const [x2, y2] = punten[i];
    const lengte = Math.hypot(x2 - x1, y2 - y1);
    let d = stap - rest;
    while (d <= lengte) {
      uit.push([x1 + ((x2 - x1) * d) / lengte, y1 + ((y2 - y1) * d) / lengte]);
      d += stap;
    }
    rest = lengte - (d - stap);
  }
  const laatste = punten[punten.length - 1];
  const vorige = uit[uit.length - 1];
  if (Math.hypot(laatste[0] - vorige[0], laatste[1] - vorige[1]) > stap * 0.3) uit.push(laatste);
  return uit;
}

const eenheid = ([x, y]: Punt): Punt => {
  const l = Math.hypot(x, y) || 1;
  return [x / l, y / l];
};

// Verbindingshaal: kubische Bézier van uitgang p (richting rp) naar ingang q (richting rq).
function verbinding(p: Punt, rp: Punt, q: Punt, rq: Punt): Punt[] {
  const d = Math.hypot(q[0] - p[0], q[1] - p[1]) * 0.45;
  const [a, b] = [eenheid(rp), eenheid(rq)];
  const c1: Punt = [p[0] + a[0] * d, p[1] + a[1] * d];
  const c2: Punt = [q[0] - b[0] * d, q[1] - b[1] * d];
  const uit: Punt[] = [];
  for (let s = 0; s <= 24; s++) {
    const t = s / 24;
    const u = 1 - t;
    const f = (k: 0 | 1) => u * u * u * p[k] + 3 * u * u * t * c1[k] + 3 * u * t * t * c2[k] + t * t * t * q[k];
    uit.push([f(0), f(1)]);
  }
  return uit;
}

function rechteHaal(a: Punt, b: Punt): Haal {
  return herbemonster([a, b]);
}

// Rondje van a, d, g en q: begint bovenaan, gaat linksom en eindigt rechts op de x-hoogte.
const RONDJE: Punt[] = [[16, 41], [9, 43], [4, 51], [3, 66], [10, 79], [20, 75], [24, 60], [25, 41]];
// Stok met lus naar boven (b, h, k, l): schuin omhoog, lus, recht naar beneden.
const LUS_OMHOOG: Punt[] = [[0, 62], [7, 38], [11, 18], [8, 10], [3, 15], [3, 40]];
const STOK_VAN_BOVEN = (x: number): Punt[] => [[x, 41], [x, 68], [x + 2, 77], [x + 7, 80], [x + 10, 79.5]];

export const LETTERS_AAN_ELKAAR: Record<string, SchrijfLetter> = {
  a: { rond: true, in: [1, 0], kern: [RONDJE, STOK_VAN_BOVEN(25)] },
  b: { hoog: true, kern: [[...LUS_OMHOOG, [3, 70], [8, 79], [18, 78], [24, 64], [20, 50], [12, 46]], [[12, 46], [21, 47], [30, 44]]] },
  c: { rond: true, in: [1, 0], kern: [[[16, 41], [9, 43], [4, 51], [3, 66], [10, 79], [21, 77], [28, 70]]] },
  d: { rond: true, in: [1, 0], kern: [[...RONDJE.slice(0, -1), [25, 30], [26, 10]], STOK_VAN_BOVEN(26).map(([x, y]) => [x, y === 41 ? 10 : y] as Punt)] },
  e: { in: [1, -0.6], kern: [[[24, 57], [25, 48], [18, 42], [8, 46], [4, 60], [8, 74], [18, 80], [28, 76]]] },
  f: { kern: [[[0, 62], [7, 38], [11, 18], [8, 10], [3, 15], [3, 40], [3, 80], [3, 98], [7, 104], [11, 96], [10, 85], [16, 79], [23, 77]]] },
  g: { rond: true, in: [1, 0], kern: [RONDJE, [[25, 41], [25, 80], [24, 96], [17, 104], [9, 100], [11, 90], [21, 82], [31, 77]]] },
  h: { kern: [[...LUS_OMHOOG, [3, 80]], [[3, 80], [3, 62], [8, 48], [15, 44], [22, 51], [23, 66], [25, 77], [30, 80], [33, 79.5]]] },
  i: { in: [0.5, -1], kern: [[[0, 41], [0, 70], [3, 78], [9, 80], [12, 79.5]]], extra: [[[0, 26]]] },
  j: { in: [0.5, -1], kern: [[[0, 41], [0, 80], [-1, 96], [-6, 104], [-13, 101], [-11, 90], [-2, 82], [9, 77]]], extra: [[[0, 26]]] },
  k: { kern: [[...LUS_OMHOOG, [3, 80]], [[3, 80], [3, 64], [10, 49], [18, 46], [20, 53], [8, 62]], [[8, 62], [16, 66], [20, 76], [26, 80], [30, 79.5]]] },
  l: { kern: [[...LUS_OMHOOG, [3, 70], [6, 78], [12, 80], [15, 79.5]]] },
  m: {
    kern: [
      [[2, 42], [3, 80]],
      [[3, 80], [3, 62], [7, 47], [13, 43], [18, 50], [19, 80]],
      [[19, 80], [19, 62], [23, 47], [29, 43], [34, 50], [35, 66], [37, 77], [42, 80], [45, 79.5]],
    ],
  },
  n: { kern: [[[2, 42], [3, 80]], [[3, 80], [3, 62], [8, 47], [15, 43], [21, 50], [22, 66], [24, 77], [29, 80], [32, 79.5]]] },
  o: { rond: true, hoog: true, in: [1, 0], kern: [[[16, 41], [9, 43], [4, 51], [3, 66], [10, 79], [20, 75], [24, 60], [22, 46], [17, 42]], [[17, 42], [25, 46], [33, 44]]] },
  p: { kern: [[[2, 42], [3, 104]], [[3, 104], [3, 64], [8, 48], [16, 42], [24, 50], [25, 66], [18, 79], [8, 78]], [[8, 78], [18, 80], [28, 78.5]]] },
  q: { rond: true, in: [1, 0], kern: [RONDJE, [[25, 41], [25, 104]], [[25, 104], [28, 92], [34, 83], [41, 79]]] },
  r: { hoog: true, kern: [[[2, 42], [3, 80]], [[3, 80], [3, 62], [8, 49], [15, 44], [23, 46]]] },
  s: { in: [0.6, -1], kern: [[[13, 41], [19, 55], [19, 70], [12, 79], [4, 77]], [[4, 77], [14, 80], [24, 78.5]]] },
  t: { kern: [[[4, 50], [8, 20]], [[8, 20], [8, 70], [11, 78], [18, 80], [22, 79.5]]], extra: [rechteHaal([0, 40], [18, 40])] },
  u: { kern: [[[2, 42], [2, 66], [6, 77], [13, 80], [20, 74], [22, 60], [23, 41]], STOK_VAN_BOVEN(23)] },
  v: { hoog: true, kern: [[[1, 42], [4, 47], [10, 64], [15, 79]], [[15, 79], [21, 62], [26, 46], [24, 41]], [[24, 41], [30, 45], [37, 43]]] },
  w: {
    hoog: true,
    kern: [[[1, 42], [5, 60], [9, 79]], [[9, 79], [14, 60], [18, 48]], [[18, 48], [22, 64], [27, 79]], [[27, 79], [32, 60], [36, 45], [34, 41]], [[34, 41], [40, 45], [47, 43]]],
  },
  x: { kern: [[[2, 44], [8, 42], [12, 52], [16, 70], [22, 80], [28, 79]]], extra: [rechteHaal([22, 42], [4, 80])] },
  y: { kern: [[[2, 42], [2, 66], [6, 77], [13, 80], [20, 74], [22, 60], [23, 41]], [[23, 41], [23, 80], [22, 96], [15, 104], [7, 100], [9, 90], [19, 82], [29, 77]]] },
  z: { kern: [[[2, 43], [22, 42]], [[22, 42], [4, 79]], [[4, 79], [16, 79.5], [26, 79]]] },
};

const LETTER_AFSTAND = 10;

const verschuif = (punten: Punt[], dx: number): Punt[] => punten.map(([x, y]) => [x + dx, y] as Punt);

// Een woord (of één letter) als één doorgaande haal, met de puntjes en streepjes erna.
export function woordFiguurAanElkaar(woord: string): Figuur {
  const pad: Punt[] = [];
  const extra: Haal[] = [];
  let uitgang: { punt: Punt; hoog: boolean } | null = null;
  for (const teken of woord) {
    const letter = LETTERS_AAN_ELKAAR[teken];
    if (!letter) continue;
    const x0 = uitgang ? uitgang.punt[0] + LETTER_AFSTAND : 0;
    const kern = verschuif(letter.kern.flatMap((stuk) => vloeiend(stuk)), x0);
    const ingang = kern[0];
    const richting = letter.in ?? [0.5, -1];
    if (uitgang) {
      pad.push(...verbinding(uitgang.punt, uitgang.hoog ? [1, 0.1] : [1, -0.2], ingang, richting));
    } else if (!letter.rond) {
      // Aanhaal: vanaf de schrijflijn links van de letter omhoog naar het begin.
      const links = Math.min(...kern.map(([x]) => x));
      pad.push(...verbinding([links - 8, 76], [1, -0.6], ingang, richting));
    }
    pad.push(...kern);
    for (const h of letter.extra ?? []) extra.push(verschuif(h, x0));
    uitgang = { punt: kern[kern.length - 1], hoog: !!letter.hoog };
  }
  const halen = [herbemonster(pad), ...extra];
  const xs = halen.flat().map(([x]) => x);
  return { halen, breedte: Math.max(...xs) - Math.min(...xs) };
}
