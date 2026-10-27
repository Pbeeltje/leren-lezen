// Hulp bij het tekenen van SVG-paden als tekst (landschappen, bergen, achtbaan).

export type Punt = [number, number];

/** Een punt als "x y" met één decimaal. */
export const pt = ([x, y]: Punt): string => `${x.toFixed(1)} ${y.toFixed(1)}`;

/** Vloeiende lijn door de punten (Catmull-Rom als Bézier-bochten), zonder sluiting. */
export const gladPad = (p: Punt[]): string => {
  let d = `M${pt(p[0])}`;
  for (let i = 0; i < p.length - 1; i++) {
    const [a, b, c, e] = [p[i - 1] ?? p[i], p[i], p[i + 1], p[i + 2] ?? p[i + 1]];
    const c1: Punt = [b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6];
    const c2: Punt = [c[0] - (e[0] - b[0]) / 6, c[1] - (e[1] - b[1]) / 6];
    d += ` C${pt(c1)} ${pt(c2)} ${pt(c)}`;
  }
  return d;
};

/** Vaste "willekeur" (Park-Miller): met hetzelfde zaad elke keer dezelfde tekening. */
export const vasteToeval = (zaad: number) => (): number => {
  zaad = (zaad * 16807) % 2147483647;
  return zaad / 2147483647;
};
