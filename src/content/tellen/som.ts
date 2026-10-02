import type { SomTeken } from './types.ts';

const MINTEKEN = '\u2212';

/** `3 + 4` of `8 − 2`. Min is altijd U+2212, nooit een koppelteken. */
export function schrijfSom(a: number, teken: SomTeken, b: number): string {
  return `${a} ${teken === '+' ? '+' : MINTEKEN} ${b}`;
}

/** Nederlandse notatie: `1,50`, hele euro's als `2`, centen altijd twee cijfers. */
export function schrijfBedrag(cent: number): string {
  const euro = Math.floor(cent / 100);
  const rest = cent % 100;
  if (rest === 0) return String(euro);
  return `${euro},${String(rest).padStart(2, '0')}`;
}
