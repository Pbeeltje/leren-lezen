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
    // Alleen leeftijd 6: reken-kern-01 (getallen 1 t/m 6) is groep-3-niveau.
    // Als er ooit peuter/kleuter-geschikte tel-inhoud bijkomt, dan ook 4/5 toevoegen.
    leeftijd: [6],
    titel: 'Tellen',
    icoonPad: '/assets/icons/tellen.svg',
    beschikbaar: true,
  },
  {
    id: 'luisteren',
    // Luister-en-wijs-aan: geen lezen nodig, dus juist voor de jongste kinderen. Ook
    // beschikbaar voor 6 (leuk als korte, makkelijke afwisseling met lezen/tellen).
    leeftijd: [3, 4, 5, 6],
    titel: 'Luisteren',
    icoonPad: '/assets/icons/luisteren.svg',
    beschikbaar: true,
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
