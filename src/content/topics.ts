import type { Topic } from './types.ts';

// Registry van alle onderwerpen, over alle leeftijden heen. Fase 1 bouwt alleen
// 'lezen' voor leeftijd 6 volledig uit; de rest is een zichtbare, uitgegrijsde
// placeholder zodat het scherm meteen goed aanvoelt zonder herontwerp later.
export const TOPICS: Topic[] = [
  {
    id: 'lezen',
    leeftijd: [6],
    titel: 'Leren lezen',
    icoonPad: '/assets/icons/boek.svg',
    beschikbaar: true,
  },
  {
    id: 'tellen',
    leeftijd: [4, 5, 6],
    titel: 'Tellen',
    icoonPad: '/assets/icons/tellen.svg',
    beschikbaar: false,
  },
  {
    id: 'vormen-kleuren',
    leeftijd: [3, 4, 5],
    titel: 'Vormen & kleuren',
    icoonPad: '/assets/icons/vormen.svg',
    beschikbaar: false,
  },
  {
    id: 'natuur',
    leeftijd: [3, 4, 5, 6],
    titel: 'Natuur',
    icoonPad: '/assets/icons/natuur.svg',
    beschikbaar: false,
  },
];

export function topicsVoorLeeftijd(leeftijd: number): Topic[] {
  return TOPICS.filter((topic) => topic.leeftijd.includes(leeftijd as never));
}
