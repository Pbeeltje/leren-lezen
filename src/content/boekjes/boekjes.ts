// Leesboekjes, zoals Veilig Leren Lezen er bij elke kern een had: een kort verhaaltje met
// alleen de letters die het kind tot en met die kern kent (gecontroleerd door
// bronbestanden/check-boekjes.mts). Plaatjes zijn de bestaande woordplaatjes. Alles klein
// geschreven, net als in de eerste VLL-boekjes: hoofdletters komen pas later.

export interface BoekjePagina {
  plaatjes: string[];
  tekst: string;
}

export interface Boekje {
  id: string;
  kern: number; // bij welke VLL-kern het hoort (Lezen 1-6)
  titel: string;
  paginas: BoekjePagina[];
}

const vll = (w: string): string => `assets/images/woorden/vll/${w}.png`;
const pl = (bestand: string): string => `assets/images/woorden/${bestand}`;

export const BOEKJES: Boekje[] = [
  {
    id: 'boekje-1',
    kern: 1,
    titel: 'vos en kip',
    paginas: [
      { plaatjes: [pl('vos.svg')], tekst: 'vos.' },
      { plaatjes: [pl('kip.svg')], tekst: 'kip.' },
      { plaatjes: [pl('vos.svg'), pl('kip.svg')], tekst: 'vos en kip.' },
      { plaatjes: [pl('kip.svg'), vll('sok')], tekst: 'kip in sok!' },
      { plaatjes: [pl('vos.svg'), vll('sok')], tekst: 'vos ook in sok!' },
      { plaatjes: [vll('maan')], tekst: 'vos en kip en maan.' },
    ],
  },
  {
    id: 'boekje-2',
    kern: 2,
    titel: 'beer',
    paginas: [
      { plaatjes: [pl('beer.jpg')], tekst: 'een beer.' },
      { plaatjes: [pl('beer.jpg'), pl('boot.svg')], tekst: 'beer is in een boot.' },
      { plaatjes: [pl('peer.svg')], tekst: 'beer eet een peer.' },
      { plaatjes: [pl('peer.svg'), pl('peer.svg')], tekst: 'nog een peer!' },
      { plaatjes: [pl('kers.svg')], tekst: 'beer eet ook een kers.' },
      { plaatjes: [pl('beer.jpg')], tekst: 'ik ben beer!' },
    ],
  },
  {
    id: 'boekje-3',
    kern: 3,
    titel: 'poes en de doos',
    paginas: [
      { plaatjes: [vll('poes')], tekst: 'de poes.' },
      { plaatjes: [vll('doos')], tekst: 'de doos.' },
      { plaatjes: [vll('poes'), vll('doos')], tekst: 'de poes zit in de doos.' },
      { plaatjes: [vll('poes')], tekst: 'poes is moe.' },
      { plaatjes: [vll('koek')], tekst: 'kijk, een koek!' },
      { plaatjes: [vll('poes'), vll('koek')], tekst: 'poes eet de koek op.' },
    ],
  },
  {
    id: 'boekje-4',
    kern: 4,
    titel: 'de hut in het bos',
    paginas: [
      { plaatjes: [pl('hut.svg')], tekst: 'dit is een hut.' },
      { plaatjes: [pl('hut.svg'), vll('bos')], tekst: 'de hut is in het bos.' },
      { plaatjes: [pl('tak.svg'), pl('weg.svg')], tekst: 'een tak op de weg.' },
      { plaatjes: [vll('bos')], tekst: 'wat is dat?' },
      { plaatjes: [pl('hond.svg')], tekst: 'het is een hond!' },
      { plaatjes: [pl('hond.svg'), vll('huis')], tekst: 'hond en ik gaan naar huis.' },
    ],
  },
  {
    id: 'boekje-5',
    kern: 5,
    titel: 'de reus',
    paginas: [
      { plaatjes: [vll('reus')], tekst: 'dit is een reus.' },
      { plaatjes: [vll('reus'), pl('hout.svg')], tekst: 'de reus wil hout.' },
      { plaatjes: [vll('bijl')], tekst: 'hij pakt de bijl.' },
      { plaatjes: [vll('bijl'), pl('hout.svg')], tekst: 'hak, hak, hak!' },
      { plaatjes: [vll('vuur')], tekst: 'nu is het vuur aan.' },
      { plaatjes: [vll('reus'), vll('vuur')], tekst: 'de reus is lekker warm.' },
    ],
  },
  {
    id: 'boekje-6',
    kern: 6,
    titel: 'de boerderij',
    paginas: [
      { plaatjes: [vll('geit')], tekst: 'dit is de geit.' },
      { plaatjes: [vll('geit')], tekst: 'de geit eet gras.' },
      { plaatjes: [vll('pauw')], tekst: 'daar is de pauw.' },
      { plaatjes: [vll('duif')], tekst: 'de duif zit op het dak.' },
      { plaatjes: [vll('uil')], tekst: 'en wie is dat? de uil!' },
      { plaatjes: [pl('kip.svg'), vll('ei')], tekst: 'de kip legt een ei.' },
      { plaatjes: [vll('geit'), vll('pauw'), vll('uil')], tekst: 'dag geit, dag pauw, dag uil!' },
    ],
  },
];

export function paginaAudioPad(boekje: Boekje, pagina: number): string {
  return `assets/audio/boekjes/${boekje.id}-${pagina + 1}.mp3`;
}

// De losse woorden van een zin, zonder leestekens (voor tikken-om-te-horen).
export function woordenVan(tekst: string): string[] {
  return tekst.split(/\s+/).map((w) => w.replace(/[.,!?]/g, '')).filter(Boolean);
}
