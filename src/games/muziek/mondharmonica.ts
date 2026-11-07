import type { Uiterlijk } from './uiterlijk.ts';
import { NOOT } from './xylofoonUiterlijk.ts';

// Mondharmonica: een rode kam tussen twee glimmende dekplaten, met acht gaatjes. Elk gaatje
// is een knop (de hele kolom, plaat boven en onder erbij, zodat tikken en glijden makkelijk
// raken) met een rand in de kleur van de toon; de notennaam staat in de bovenplaat
// gegraveerd, zoals de nummers op een echte mondharmonica. Bij blazen licht het gaatje op,
// glanst de plaat in de kleur van de toon en zweeft er een nootje omhoog. Het lijf is
// versiering (achter de knoppen); de vorm staat in muziek.css onder .xylofoon--mondharmonica.
export const MONDHARMONICA: Uiterlijk = {
  achter() {
    const lijf = document.createElement('div');
    lijf.className = 'mh-lijf';
    lijf.innerHTML =
      '<span class="mh-kam"></span><span class="mh-plaat mh-plaat--boven"></span><span class="mh-plaat mh-plaat--onder"></span>';
    return lijf;
  },
  knop(staaf) {
    staaf.insertAdjacentHTML('beforeend', `<span class="xylo-noot">${NOOT}</span>`);
  },
};
