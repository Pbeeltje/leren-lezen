// Letters en lijnen om over te trekken, als halen (strokes) met schrijfrichting.
// Coördinaten in letter-eenheden: stokken beginnen op y=10, de x-hoogte op y=40, de
// schrijflijn ligt op y=80 en staartjes (g, j, p, q, y) lopen door tot ~105.
// Een haal is een lijst punten in schrijfvolgorde; één punt is een stip (tikken).
// Blokletters zoals op een groep-3-schrijfkaart: de o begint bovenaan en gaat linksom,
// de b eerst de stok en dan de buik, enz.

export type Punt = [number, number];
export type Haal = Punt[];

export interface Figuur {
  halen: Haal[];
  breedte: number;
}

export const LIJN_BOVEN = 10;
export const LIJN_X = 40;
export const LIJN_ONDER = 80;

function lijn(...punten: Punt[]): Punt[] {
  const uit: Punt[] = [];
  for (let i = 0; i < punten.length - 1; i++) {
    const [x1, y1] = punten[i];
    const [x2, y2] = punten[i + 1];
    const stappen = Math.max(1, Math.round(Math.hypot(x2 - x1, y2 - y1) / 2));
    for (let s = i === 0 ? 0 : 1; s <= stappen; s++) uit.push([x1 + ((x2 - x1) * s) / stappen, y1 + ((y2 - y1) * s) / stappen]);
  }
  return uit;
}

// Boog in graden; 0 = rechts, 90 = onder (schermrichting). van > tot = linksom.
function boog(cx: number, cy: number, rx: number, ry: number, van: number, tot: number): Punt[] {
  const lengte = (Math.abs(tot - van) / 360) * Math.PI * (rx + ry);
  const stappen = Math.max(2, Math.round(lengte / 2));
  const uit: Punt[] = [];
  for (let s = 0; s <= stappen; s++) {
    const a = ((van + ((tot - van) * s) / stappen) * Math.PI) / 180;
    uit.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
  }
  return uit;
}

const achterElkaar = (...delen: Punt[][]): Punt[] => delen.flat();

const RONDJE = (cx = 20): Punt[] => boog(cx, 60, 20, 20, 300, -60);

export const LETTERS: Record<string, Figuur> = {
  a: { breedte: 40, halen: [RONDJE(), lijn([40, 40], [40, 80])] },
  b: { breedte: 40, halen: [lijn([0, 10], [0, 80]), boog(20, 60, 20, 20, 180, 540)] },
  c: { breedte: 38, halen: [boog(20, 60, 20, 20, 320, 40)] },
  d: { breedte: 40, halen: [RONDJE(), lijn([40, 10], [40, 80])] },
  e: { breedte: 40, halen: [achterElkaar(lijn([1, 60], [40, 60]), boog(20, 60, 20, 20, 360, 45))] },
  f: { breedte: 32, halen: [achterElkaar(boog(26, 22, 12, 12, 330, 180), lijn([14, 22], [14, 80])), lijn([2, 42], [30, 42])] },
  g: { breedte: 40, halen: [RONDJE(), achterElkaar(lijn([40, 40], [40, 92]), boog(24, 92, 16, 13, 0, 165))] },
  h: { breedte: 40, halen: [lijn([0, 10], [0, 80]), achterElkaar(boog(20, 60, 20, 20, 180, 360), lijn([40, 60], [40, 80]))] },
  i: { breedte: 0, halen: [lijn([0, 40], [0, 80]), [[0, 24]]] },
  j: { breedte: 24, halen: [achterElkaar(lijn([20, 40], [20, 94]), boog(8, 94, 12, 11, 0, 165)), [[20, 24]]] },
  k: { breedte: 36, halen: [lijn([0, 10], [0, 80]), lijn([34, 40], [1, 62], [36, 80])] },
  l: { breedte: 0, halen: [lijn([0, 10], [0, 80])] },
  m: {
    breedte: 56,
    halen: [
      lijn([0, 40], [0, 80]),
      achterElkaar(boog(14, 56, 14, 14, 180, 360), lijn([28, 56], [28, 80])),
      achterElkaar(boog(42, 56, 14, 14, 180, 360), lijn([56, 56], [56, 80])),
    ],
  },
  n: { breedte: 40, halen: [lijn([0, 40], [0, 80]), achterElkaar(boog(20, 60, 20, 20, 180, 360), lijn([40, 60], [40, 80]))] },
  o: { breedte: 40, halen: [boog(20, 60, 20, 20, 270, -90)] },
  p: { breedte: 40, halen: [lijn([0, 40], [0, 105]), boog(20, 60, 20, 20, 180, 540)] },
  q: { breedte: 40, halen: [RONDJE(), lijn([40, 40], [40, 105])] },
  r: { breedte: 30, halen: [lijn([0, 40], [0, 80]), boog(18, 62, 18, 20, 180, 300)] },
  s: { breedte: 36, halen: [achterElkaar(boog(18, 50, 16, 10, 330, 90), boog(18, 70, 17, 10, 270, 510))] },
  t: { breedte: 28, halen: [lijn([12, 18], [12, 80]), lijn([0, 40], [28, 40])] },
  u: { breedte: 40, halen: [achterElkaar(lijn([0, 40], [0, 60]), boog(20, 60, 20, 20, 180, 0)), lijn([40, 40], [40, 80])] },
  v: { breedte: 40, halen: [lijn([0, 40], [20, 80], [40, 40])] },
  w: { breedte: 56, halen: [lijn([0, 40], [14, 80], [28, 48], [42, 80], [56, 40])] },
  x: { breedte: 36, halen: [lijn([0, 40], [36, 80]), lijn([36, 40], [0, 80])] },
  y: { breedte: 40, halen: [lijn([0, 40], [20, 78]), lijn([40, 40], [10, 105])] },
  z: { breedte: 38, halen: [lijn([0, 40], [36, 40], [0, 80], [38, 80])] },
};

const LETTER_AFSTAND = 16;

// Een woord als één figuur: de letters naast elkaar geschoven.
export function woordFiguur(woord: string): Figuur {
  const halen: Haal[] = [];
  let x = 0;
  for (const letter of woord) {
    const f = LETTERS[letter];
    if (!f) continue;
    for (const h of f.halen) halen.push(h.map(([px, py]) => [px + x, py] as Punt));
    x += f.breedte + LETTER_AFSTAND;
  }
  return { halen, breedte: x - LETTER_AFSTAND };
}

// Lijnen en vormen voor de kleintjes, in een vak van 0..200 x 0..120: van een plaatje
// naar een plaatje ("breng de bij naar de bloem").
export interface LijnFiguur {
  naam: string;
  haal: Haal;
  // Waar het doelplaatje staat; standaard aan het eind van de lijn. Bij het rondje staat
  // het in het midden (de bij vliegt een rondje om de bloem).
  doelInMidden?: boolean;
}

function golf(): Punt[] {
  const uit: Punt[] = [];
  for (let x = 10; x <= 190; x += 2) uit.push([x, 60 - 28 * Math.sin(((x - 10) / 180) * Math.PI * 2)]);
  return uit;
}

export const LIJNEN: LijnFiguur[] = [
  { naam: 'rechte lijn', haal: lijn([10, 60], [190, 60]) },
  { naam: 'heuvel', haal: boog(100, 100, 90, 80, 180, 360) },
  { naam: 'golf', haal: golf() },
  { naam: 'zigzag', haal: lijn([10, 95], [55, 25], [100, 95], [145, 25], [190, 95]) },
  { naam: 'berg', haal: lijn([10, 105], [100, 15], [190, 105]) },
  { naam: 'trap', haal: lijn([10, 105], [10, 75], [60, 75], [60, 45], [110, 45], [110, 15], [190, 15]) },
  { naam: 'boog omlaag', haal: boog(100, 20, 90, 85, 180, 0) },
  { naam: 'rondje', haal: boog(100, 60, 50, 50, 270, -90), doelInMidden: true },
];
