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
    // Voorlopig verborgen (geen groepen): de eigenaar is er nog niet tevreden over.
    id: 'boekjes',
    groepen: [],
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
    // Hetzelfde geheugenspel als bij Luisteren, maar met twee keer zoveel kaarten.
    // Kleuters vinden het onder Luisteren (dat groep 3 niet heeft).
    id: 'geheugen',
    groepen: ['groep3'],
    titel: 'Geheugenspel',
    icoonPad: 'assets/icons/geheugenspel.svg',
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
  {
    // Vangspel met je eigen figuurtje (de tegel toont het figuur van het profiel).
    id: 'vangen',
    groepen: ['kleuter', 'groep3'],
    titel: 'Vangspel',
    icoonPad: 'assets/icons/meteoor.svg',
    beschikbaar: true,
  },
];

export function topicsVoorGroep(groep: Groep): Topic[] {
  const lijst = TOPICS.filter((topic) => topic.groepen.includes(groep));
  // Voor kleuters zijn Luisteren en Ontdekken de belangrijkste onderwerpen: die staan voorop.
  if (groep === 'kleuter') {
    const voorop = ['luisteren', 'ontdekken'];
    const plek = (t: Topic): number => (voorop.includes(t.id) ? voorop.indexOf(t.id) : voorop.length);
    lijst.sort((a, b) => plek(a) - plek(b));
  }
  return lijst;
}
