import { haalGroep } from './progressStore.ts';

// Muntenbeloningen. Losse module zodat de bedragen op één plek staan.
// "We vinden later wel een bestemming voor de munten" — voorlopig alleen sparen.
//
// Lezen en Tellen (groep 3): een set die al eens helemaal af was, levert bij herhaling de
// helft op (alles, ook de eindbonus), zodat munten niet oneindig te grinden zijn met
// dezelfde, al beheerste oefening. "Af" is per Oefening 1/2/3 apart (tot het eind
// gespeeld, overslaan telt mee); een toets pas als hij eerder perfect (3 sterren) was.
// Beginnen zonder af te maken kort nooit iets in. Kleuters krijgen nooit minder, maar ook
// hun perfect-bonus is eenmalig per toets.

export const MUNTEN_OEFENING_GOED = 2; // per goed antwoord (ook Luisteren, Ontdekken en Schrijven)
export const MUNTEN_OEFENING_SET = 5; // aan het eind van een oefening

export const MUNTEN_TOETS_GOED = 2; // per goed antwoord
export const MUNTEN_TOETS_VOLDOENDE = 10; // aan het eind, minstens de helft goed
export const MUNTEN_TOETS_PERFECT = 20; // aan het eind, alles goed (in plaats van de 10, niet erbovenop)
export const MUNTEN_TOETS_EERSTE_PERFECT = 50; // bovenop de 20, alleen de eerste keer dat deze toets perfect is

// Luisteren, Ontdekken en Schrijven: aan het eind van een hele set (alle rondes). Geen herhaal-korting.
export const MUNTEN_RONDE_SET = 5;

// Geheugenspel: per gevonden paar en per voltooid bord. Geen herhaal-korting.
export const MUNTEN_GEHEUGEN_PAAR = 2;
export const MUNTEN_GEHEUGEN_BORD = 10;

// Speel na en Ritme. Geen herhaal-korting: een set mag opnieuw, dezelfde bedragen.
// Factor: x1 t/m 6 noten/slagen, x2 boven 6, x4 boven 8 (en niet hoger). Kleuters daarbovenop x1,5.
export const MUNTEN_MUZIEK_GOED = 2;
export const MUNTEN_MUZIEK_SET = 10;

export function muziekMuntFactor(maxNoten: number): number {
  if (maxNoten > 8) return 4;
  if (maxNoten > 6) return 2;
  return 1;
}

export function muziekMunten(maxNoten: number): { perGoed: number; perSet: number } {
  const factor = muziekMuntFactor(maxNoten);
  return { perGoed: kleuterFactor(MUNTEN_MUZIEK_GOED * factor), perSet: kleuterFactor(MUNTEN_MUZIEK_SET * factor) };
}

// Kleuters verdienen iets sneller: elk bedrag x1,5, naar boven afgerond (2 wordt 3, 5 wordt 8).
// Niet automatisch: alleen aanroepen die kleuterFactor/lesMunten gebruiken.
export function kleuterFactor(bedrag: number): number {
  return haalGroep() === 'kleuter' ? Math.ceil(bedrag * 1.5) : bedrag;
}

// Lezen/Tellen: kleuterbonus, of bij een herhaling (alleen buiten kleuter) de helft,
// naar boven afgerond (5 wordt 3).
export function lesMunten(basis: number, herhaling: boolean): number {
  if (haalGroep() === 'kleuter') return kleuterFactor(basis);
  return herhaling ? Math.ceil(basis / 2) : basis;
}

// Eindbedrag van een toets. `herhaling` = deze toets was al eens perfect. Groep 3 krijgt bij
// een herhaling van alles de helft; kleuters niet, maar de perfect-bonus (en de extra voor
// de eerste keer perfect) krijgen zij ook maar één keer: daarna telt alles goed als "minstens de helft".
export function toetsEindMunten(fractie: number, herhaling: boolean): number {
  const perfectBonus = fractie === 1 && !(herhaling && haalGroep() === 'kleuter');
  const basis = perfectBonus ? MUNTEN_TOETS_PERFECT : fractie >= 0.5 ? MUNTEN_TOETS_VOLDOENDE : 0;
  const eerstePerfect = fractie === 1 && !herhaling ? MUNTEN_TOETS_EERSTE_PERFECT : 0;
  return (basis > 0 ? lesMunten(basis, herhaling) : 0) + (eerstePerfect > 0 ? lesMunten(eerstePerfect, false) : 0);
}
