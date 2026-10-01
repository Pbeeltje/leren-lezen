import type { Topic } from './types.ts';

// Registry van alle onderwerpen, over alle leeftijden heen. Fase 1 bouwt alleen
// 'lezen' voor leeftijd 6 volledig uit; de rest is een zichtbare, uitgegrijsde
// placeholder zodat het scherm meteen goed aanvoelt zonder herontwerp later.
export const TOPICS: Topic[] = [
  {
    id: 'lezen',
    leeftijd: [5, 6],
    titel: 'Leren lezen',
    icoonPad: 'assets/icons/boek.svg',
    beschikbaar: true,
  },
  {
    id: 'tellen',
    // Vijf jaar ziet alleen de eerste twee hoofdstukken (engine/leeftijdGrens.ts).
    leeftijd: [5, 6],
    titel: 'Tellen',
    icoonPad: 'assets/icons/tellen.svg',
    beschikbaar: true,
  },
  {
    id: 'luisteren',
    // Luister-en-wijs-aan: geen lezen nodig, alleen voor de jongste kinderen.
    leeftijd: [3],
    titel: 'Luisteren',
    icoonPad: 'assets/icons/luisteren.svg',
    beschikbaar: true,
  },
  {
    // Kleuterbegrippen zonder lezen: groot/klein, meer/minder, kleuren & vormen.
    id: 'ontdekken',
    leeftijd: [3],
    titel: 'Ontdekken',
    icoonPad: 'assets/icons/vormen.svg',
    beschikbaar: true,
  },
  {
    // Overtrekken met de vinger: lijnen (3-4), letters (5-6) en woordjes (6).
    id: 'schrijven',
    leeftijd: [3, 4, 5, 6],
    titel: 'Schrijven',
    icoonPad: 'assets/icons/schrijven.svg',
    beschikbaar: true,
  },
  {
    id: 'natuur',
    leeftijd: [3, 4, 5, 6],
    titel: 'Natuur',
    icoonPad: 'assets/icons/natuur.svg',
    beschikbaar: false,
  },
];

export function topicsVoorLeeftijd(leeftijd: number): Topic[] {
  return TOPICS.filter((topic) => topic.leeftijd.includes(leeftijd as never));
}
