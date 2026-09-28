// Klassiek dobbelsteenbeeld (1-6): het canonieke voorbeeld van een "getalbeeld" in de
// Nederlandse rekendidactiek — een vaste stippenopmaak die een kind leert herkennen
// zonder te hoeven tellen (subitiseren).
const PATRONEN: Record<number, Array<[number, number]>> = {
  1: [[1, 1]],
  2: [
    [0, 0],
    [2, 2],
  ],
  3: [
    [0, 0],
    [1, 1],
    [2, 2],
  ],
  4: [
    [0, 0],
    [0, 2],
    [2, 0],
    [2, 2],
  ],
  5: [
    [0, 0],
    [0, 2],
    [1, 1],
    [2, 0],
    [2, 2],
  ],
  6: [
    [0, 0],
    [0, 2],
    [1, 0],
    [1, 2],
    [2, 0],
    [2, 2],
  ],
};

export function maakDobbelsteen(getal: number): HTMLElement {
  const doos = document.createElement('div');
  doos.className = 'dobbelsteen';

  const stippen = PATRONEN[getal] ?? [];
  for (let rij = 0; rij < 3; rij++) {
    for (let kolom = 0; kolom < 3; kolom++) {
      const vak = document.createElement('div');
      vak.className = 'dobbelsteen__vak';
      if (stippen.some(([r, k]) => r === rij && k === kolom)) {
        const punt = document.createElement('div');
        punt.className = 'dobbelsteen__punt';
        vak.appendChild(punt);
      }
      doos.appendChild(vak);
    }
  }

  return doos;
}
