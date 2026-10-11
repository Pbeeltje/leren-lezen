// Dagen van de week en maanden van het jaar, in volgorde. De week begint op maandag,
// zoals op school en op de Nederlandse kalender.
export const DAGEN = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'];

export const MAANDEN = [
  'januari',
  'februari',
  'maart',
  'april',
  'mei',
  'juni',
  'juli',
  'augustus',
  'september',
  'oktober',
  'november',
  'december',
];

export type KalenderSoort = 'dagen' | 'maanden';

export function kalenderLijst(soort: KalenderSoort): string[] {
  return soort === 'dagen' ? DAGEN : MAANDEN;
}
