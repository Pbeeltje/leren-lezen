// Begrijpend lezen, groep 3. Korte verhaaltjes in kleine letters (zoals de leesboekjes),
// daarna één meerkeuzevraag waarvan het antwoord letterlijk in de tekst staat.
// Elke keer dat een kind een verhaal opent, komt een andere vraag (progressStore).

export interface BegrijpendVraag {
  vraag: string;
  goed: string;
  afleiders: [string, string, string];
}

export interface BegrijpendVerhaal {
  id: string;
  titel: string;
  zinnen: string[];
  plaatjes: string[];
  vragen: BegrijpendVraag[];
}

const plaatje = (naam: string): string => `assets/images/woorden/${naam}.svg`;

export const BEGRIJPEND_VERHALEN: BegrijpendVerhaal[] = [
  {
    id: 'fiets',
    titel: 'tom en de fiets',
    plaatjes: [plaatje('fiets')],
    zinnen: [
      'tom fietst naar school.',
      'hij gaat heel hard.',
      'er ligt een steen op het pad.',
      'tom valt van zijn fiets.',
      'au! zijn knie doet pijn.',
      'mama plakt een pleister.',
    ],
    vragen: [
      {
        vraag: 'waar fietst tom naartoe?',
        goed: 'naar school',
        afleiders: ['naar de winkel', 'naar het park', 'naar huis'],
      },
      {
        vraag: 'wat ligt er op het pad?',
        goed: 'een steen',
        afleiders: ['een bal', 'een tak', 'een zak'],
      },
      {
        vraag: 'waar heeft tom pijn?',
        goed: 'aan zijn knie',
        afleiders: ['aan zijn neus', 'aan zijn hand', 'aan zijn voet'],
      },
      {
        vraag: 'wat doet mama?',
        goed: 'zij plakt een pleister',
        afleiders: ['zij huilt', 'zij fietst weg', 'zij koopt een fiets'],
      },
    ],
  },
  {
    id: 'aap',
    titel: 'de aap',
    plaatjes: [plaatje('aap'), plaatje('brood')],
    zinnen: [
      'de aap heeft een broodje.',
      'hij smeert jam op het broodje.',
      'de jam is rood en zoet.',
      'de aap neemt een grote hap.',
      'mmm, wat lekker.',
    ],
    vragen: [
      {
        vraag: 'wat heeft de aap?',
        goed: 'een broodje',
        afleiders: ['een banaan', 'een bal', 'een tas'],
      },
      {
        vraag: 'wat smeert de aap op het broodje?',
        goed: 'jam',
        afleiders: ['kaas', 'honing', 'boter'],
      },
      {
        vraag: 'welke kleur is de jam?',
        goed: 'rood',
        afleiders: ['groen', 'geel', 'blauw'],
      },
      {
        vraag: 'wat doet de aap daarna?',
        goed: 'hij neemt een hap',
        afleiders: ['hij gooit het weg', 'hij legt het weg', 'hij geeft het weg'],
      },
    ],
  },
  {
    id: 'paraplu',
    titel: 'de paraplu',
    plaatjes: [plaatje('paraplu')],
    zinnen: [
      'lisa loopt buiten.',
      'zij heeft een paraplu.',
      'de wind waait hard.',
      'de wind pakt de paraplu.',
      'de paraplu vliegt de lucht in.',
      'lisa kijkt hem na.',
    ],
    vragen: [
      {
        vraag: 'wie loopt buiten?',
        goed: 'lisa',
        afleiders: ['tom', 'mama', 'de aap'],
      },
      {
        vraag: 'wat heeft lisa bij zich?',
        goed: 'een paraplu',
        afleiders: ['een bal', 'een jas', 'een hoed'],
      },
      {
        vraag: 'wat pakt de wind?',
        goed: 'de paraplu',
        afleiders: ['de bal', 'de jas', 'lisa'],
      },
      {
        vraag: 'waar vliegt de paraplu heen?',
        goed: 'de lucht in',
        afleiders: ['het water in', 'de school in', 'de boom in'],
      },
    ],
  },
  {
    id: 'eendjes',
    titel: 'de eendjes',
    plaatjes: [plaatje('eend'), plaatje('eend'), plaatje('brood')],
    zinnen: [
      'de eendjes lopen in het park.',
      'zij vinden een zak brood.',
      'de zak ligt in het gras.',
      'de eendjes eten het brood op.',
      'zij zijn heel blij.',
    ],
    vragen: [
      {
        vraag: 'waar lopen de eendjes?',
        goed: 'in het park',
        afleiders: ['in de sloot', 'op de weg', 'in het bos'],
      },
      {
        vraag: 'wat vinden de eendjes?',
        goed: 'een zak brood',
        afleiders: ['een bal', 'een vis', 'een schoen'],
      },
      {
        vraag: 'waar ligt de zak?',
        goed: 'in het gras',
        afleiders: ['in het water', 'op de weg', 'in de boom'],
      },
      {
        vraag: 'wat eten de eendjes?',
        goed: 'het brood',
        afleiders: ['de vis', 'het gras', 'een worm'],
      },
    ],
  },
  {
    id: 'kat-hond',
    titel: 'de kat en de hond',
    plaatjes: [plaatje('kat'), plaatje('hond')],
    zinnen: [
      'de kat is moe.',
      'de hond ligt in zijn mand.',
      'de kat kruipt bij de hond.',
      'zij slapen samen.',
      'het is stil in huis.',
    ],
    vragen: [
      {
        vraag: 'hoe is de kat?',
        goed: 'moe',
        afleiders: ['boos', 'nat', 'bang'],
      },
      {
        vraag: 'waar ligt de hond?',
        goed: 'in zijn mand',
        afleiders: ['in de tuin', 'op de bank', 'in de boom'],
      },
      {
        vraag: 'waar gaat de kat slapen?',
        goed: 'bij de hond',
        afleiders: ['in de boom', 'op de kast', 'in een doos'],
      },
      {
        vraag: 'wat doen de kat en de hond?',
        goed: 'zij slapen',
        afleiders: ['zij spelen', 'zij rennen', 'zij eten'],
      },
    ],
  },
];
