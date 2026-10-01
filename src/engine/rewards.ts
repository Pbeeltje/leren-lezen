import { haalGroep } from './progressStore.ts';

// Muntenbeloningen. Losse module zodat de bedragen op één plek staan.
// "We vinden later wel een bestemming voor de munten" — voorlopig alleen sparen.
//
// Herhaalde oefeningen/toetsen (een kern die al eerder geoefend/gehaald is) leveren
// minder op dan de eerste keer, zodat munten niet oneindig te grinden zijn door
// simpelweg dezelfde, al beheerste kern steeds opnieuw te spelen.

export const MUNTEN_OEFENING_GOED = 2; // per goed antwoord, eerste keer dat deze kern geoefend wordt
export const MUNTEN_OEFENING_HERHAALD = 1; // per goed antwoord, als deze kern al eerder geoefend was

export const MUNTEN_TOETS_GOED = 5; // per goed antwoord tijdens de eerste toetspoging
export const MUNTEN_TOETS_PERFECT_BONUS = 10; // extra bonus als de eerste toetspoging in één keer goed is
export const MUNTEN_TOETS_HERHAALD = 10; // vast bedrag voor een hertoets van een al eerder gehaalde kern

// Kleuters verdienen iets sneller: één munt extra per goed antwoord en het dubbele voor
// het afronden van een hele set (toetsbonus en hertoets).
export function perGoed(basis: number): number {
  return haalGroep() === 'kleuter' ? basis + 1 : basis;
}
export function voorSet(basis: number): number {
  return haalGroep() === 'kleuter' ? basis * 2 : basis;
}
