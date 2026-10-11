import type { KlokTijd } from './types.ts';

const UUR_WOORDEN = ['twaalf', 'één', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen', 'tien', 'elf'];

/** Uur zoals op de wijzerklok: 1-12 (0 en 12 worden 12, 13 wordt 1). */
export function klokUur(uur: number): number {
  return ((((uur - 1) % 12) + 12) % 12) + 1;
}

/** `13:15`, `8:30`: uren zonder voorloopnul, minuten altijd twee cijfers. */
export function schrijfTijd(tijd: KlokTijd): string {
  return `${tijd.uur}:${String(tijd.minuut).padStart(2, '0')}`;
}

/** Zoals je het zegt: `drie uur`, `kwart over één`, `half twee`, `kwart voor twee`. */
export function tijdInWoorden(tijd: KlokTijd): string {
  const uur = UUR_WOORDEN[tijd.uur % 12];
  const volgend = UUR_WOORDEN[(tijd.uur + 1) % 12];
  switch (tijd.minuut) {
    case 0:
      return `${uur} uur`;
    case 15:
      return `kwart over ${uur}`;
    case 30:
      return `half ${volgend}`;
    case 45:
      return `kwart voor ${volgend}`;
  }
}

/** Wijzen twee tijden op de klok hetzelfde aan? (1:15 en 13:15 wel.) */
export function zelfdeKlokstand(a: KlokTijd, b: KlokTijd): boolean {
  return a.uur % 12 === b.uur % 12 && a.minuut === b.minuut;
}
