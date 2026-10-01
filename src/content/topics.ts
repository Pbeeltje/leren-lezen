import type { Groep, Topic } from './types.ts';

// Registry van alle onderwerpen, per groep (kleuterschool / groep 3). Fase 1 bouwde alleen
// 'lezen' voor groep 3 volledig uit; de rest is een zichtbare, uitgegrijsde
// placeholder zodat het scherm meteen goed aanvoelt zonder herontwerp later.
export const TOPICS: Topic[] = [
  {
    id: 'lezen',
    groepen: ['kleuter', 'groep3'],
    titel: 'Leren lezen',
    icoonPad: 'assets/icons/boek.svg',
    beschikbaar: true,
  },
  {
    id: 'tellen',
    // Kleuters zien alleen de eerste twee hoofdstukken (engine/leeftijdGrens.ts).
    groepen: ['kleuter', 'groep3'],
    titel: 'Tellen',
    icoonPad: 'assets/icons/tellen.svg',
    beschikbaar: true,
  },
  {
    id: 'luisteren',
    // Luister-en-wijs-aan: geen lezen nodig, alleen voor de jongste kinderen.
    groepen: ['kleuter'],
    titel: 'Luisteren',
    icoonPad: 'assets/icons/luisteren.svg',
    beschikbaar: true,
  },
  {
    // Kleuterbegrippen zonder lezen: groot/klein, meer/minder, kleuren & vormen.
    id: 'ontdekken',
    groepen: ['kleuter'],
    titel: 'Ontdekken',
    icoonPad: 'assets/icons/vormen.svg',
    beschikbaar: true,
  },
  {
    // Leesboekjes bij VLL-kern 1-6: korte verhaaltjes met alleen bekende letters.
    id: 'boekjes',
    groepen: ['kleuter', 'groep3'],
    titel: 'Leesboekjes',
    icoonPad: 'assets/icons/boekjes.svg',
    beschikbaar: true,
  },
  {
    // Overtrekken met de vinger: lijnen (3-4), letters (5-6) en woordjes (6).
    id: 'schrijven',
    groepen: ['kleuter', 'groep3'],
    titel: 'Schrijven',
    icoonPad: 'assets/icons/schrijven.svg',
    beschikbaar: true,
  },
  {
    // Xylofoon, speel na en ritme; de klanken maakt de browser zelf (engine/muziek.ts).
    id: 'muziek',
    groepen: ['kleuter', 'groep3'],
    titel: 'Muziek',
    icoonPad: 'assets/icons/muziek.svg',
    beschikbaar: true,
  },
];

export function topicsVoorGroep(groep: Groep): Topic[] {
  return TOPICS.filter((topic) => topic.groepen.includes(groep));
}
