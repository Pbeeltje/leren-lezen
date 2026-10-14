import type { ThemaId } from '../../achtergrond/achtergrond.ts';

// Wat er bij Oversteken door de banen rijdt, loopt, zwemt of vliegt, per achtergrond.
// Fluent-plaatjes kijken bijna allemaal naar links; `kijkt: 'r'` voor de uitzonderingen,
// dan spiegelt het spel ze als ze naar links gaan (en de rest als ze naar rechts gaan).

// Eigen tekeningen die lopen (OversteekScreen: TEKENINGEN).
export type Tekening = 'gnoe' | 'stegosaurus' | 'triceratops';

export interface Soort {
  src?: string; // plaatje; zonder src een eigen tekening (`teken`)
  teken?: Tekening | 'boomstam' | 'schots' | 'vlot' | 'trein'; // trein: de trein uit de achtergrond
  goederen?: boolean; // trein: goederenwagons in plaats van reizigers
  // Breedte van het vak voor één plaatje, in vakjes. Getekend wordt het hooguit HOOG_MAX
  // (1,15) breed, behalve met `lang`; de rest van het vak is ruimte, geen botsing.
  maat: number;
  kijkt?: 'l' | 'r' | 'geen';
  lang?: boolean; // lang voertuig: het plaatje wordt in de lengte uitgerekt tot de hele maat
  snel?: number; // snelheidsfactor (1 = gewoon)
  aantal?: [number, number]; // kudde of zwerm: zoveel achter elkaar
  wagon?: string; // trein: kop + wagons
  wagons?: [number, number];
  draai?: number; // graden, zodat een schuin plaatje (raket, komeet) recht vooruit wijst
  spin?: boolean; // tolt (meteoren)
  dobber?: boolean; // deint op en neer (lopende dieren, bootjes)
  kleuren?: boolean; // botsauto's: elke auto een andere kleur
  sporadisch?: boolean; // komt af en toe, snel, met knipperlicht vooraf
  banen?: number; // kolos: zo veel banen hoog (rijdt in de onderste, botst in allemaal)
}

// Extra uitdagingen: vanaf level 10 komt er één bij (willekeurig uit de lijst van de
// achtergrond), vanaf level 15 nog één. `icoon` staat in de levelbanner als hij erbij komt.
// icoon: pad naar een plaatje, of de naam van een eigen tekening (`Tekening`).
export type Uitdaging = { icoon: string } & (
  // Een hele baan gaat af en toe 'aan' (stroom op de rails, drakenvuur, laser), met lamp vooraf.
  | { wat: 'baan-aan'; stijl: 'stroom' | 'vuur' | 'laser'; bron?: string }
  // Valt uit de lucht op een vakje; een groeiende schaduw laat zien waar.
  | { wat: 'inslag'; src: string; gloed?: boolean }
  // Diertjes steken de andere kant op over (van de overkant naar beneden) en kunnen ook verongelukken.
  | { wat: 'overstekers'; src: string; kleur?: string }
  // Iets reusachtigs dat meerdere banen breed is.
  | { wat: 'kolos'; ding: Soort }
  | { wat: 'lavaland' } // alle banen zijn lava met stenen
  | { wat: 'lawine' } // sneeuw schuift van onderen omhoog en bedekt baan na baan
  | { wat: 'storm' } // windvlagen blazen je opzij
  | { wat: 'donker'; mist?: boolean } // je ziet alleen een kring om je heen
  | { wat: 'zinken' } // sommige vlotten zakken even onder water
  | { wat: 'keren' } // het verkeer in een baan stopt en rijdt de andere kant op
);

export interface OversteekThema {
  weg: string; // grond van de gevaarlijke banen (css: .ov-grond--<weg>)
  veilig: string; // grond van start, middenberm en overkant
  vijanden: Soort[];
  // Snelle uitschieters met waarschuwingslicht, vanaf level 4.
  zeldzaam: Soort[];
  // Water vanaf level 4: alleen staan op wat drijft. Geen dieren als vlot: kinderen zien
  // een dier als gevaar (zoals op de weg) en durfden er niet op.
  rivier?: { water: string; drijvers: Soort[] };
  overkant: string[]; // versiering op de finish
  uitdagingen: Uitdaging[];
}

const o = (n: string): string => `assets/oversteken/${n}.svg`;
const w = (n: string): string => `assets/images/woorden/${n}.svg`;
const a = (n: string): string => `assets/achtergrond/${n}.svg`;
const i = (n: string): string => `assets/icons/${n}.svg`;

const BOOMSTAM: Soort = { teken: 'boomstam', maat: 1 };
const ZINKEN = (icoon: string): Uitdaging => ({ wat: 'zinken', icoon });

export const OVERSTEEK_THEMAS: Record<ThemaId, OversteekThema> = {
  bouw: {
    weg: 'asfalt',
    veilig: 'stoep',
    vijanden: [
      { src: w('auto'), maat: 1.25 },
      { src: w('taxi'), maat: 1.25 },
      { src: o('suv'), maat: 1.3 },
      { src: o('politie'), maat: 1.3, snel: 1.2 },
      { src: w('bus'), maat: 1.8, lang: true, snel: 0.75 },
      { src: o('bestelwagen'), maat: 1.45, lang: true, snel: 0.85 },
      { src: o('oplegger'), maat: 2, lang: true, snel: 0.7 },
      { src: o('pickup'), maat: 1.5 },
      { src: w('scooter'), maat: 1, snel: 1.3 },
      { src: o('brandweer'), maat: 1.7, lang: true, snel: 0.9 },
    ],
    zeldzaam: [
      { src: w('ambulance'), maat: 1.45, lang: true, snel: 2.4 },
      { src: o('raceauto'), maat: 1.5, kijkt: 'r', snel: 2.8 },
    ],
    overkant: [o('bouwkraan'), o('afzetting'), w('huis'), o('afzetting'), o('bouwkraan')],
    uitdagingen: [
      { wat: 'inslag', src: o('baksteen'), icoon: o('baksteen') },
      // Uitzonderlijk transport: een reuzentruck over twee rijbanen.
      { wat: 'kolos', ding: { src: o('oplegger'), maat: 2.2, banen: 2, snel: 1.2 }, icoon: o('oplegger') },
    ],
  },
  savanne: {
    weg: 'savanne',
    veilig: 'gras-droog',
    vijanden: [
      { teken: 'gnoe', maat: 1.3, kijkt: 'r', aantal: [3, 5], dobber: true, snel: 1.1 },
      { src: w('zebra'), maat: 1.2, kijkt: 'r', aantal: [2, 3], dobber: true },
      { src: w('olifant'), maat: 1.15, snel: 0.6, dobber: true },
      { src: w('neushoorn'), maat: 1.5, snel: 1.3, dobber: true },
      { src: w('giraf'), maat: 1.4, snel: 0.8, dobber: true },
      { src: o('buffel'), maat: 1.4, kijkt: 'r', aantal: [1, 2], dobber: true },
    ],
    // Op hol geslagen kudde: veel gnoes, heel snel.
    zeldzaam: [{ teken: 'gnoe', maat: 1.3, kijkt: 'r', aantal: [6, 9], dobber: true, snel: 2.4 }],
    rivier: { water: 'rivier', drijvers: [BOOMSTAM, { teken: 'vlot', maat: 1 }] },
    // Afrikaanse bomen (eigen tekeningen), niet de Europese boom uit de woordplaatjes.
    overkant: [o('acacia'), w('giraf'), o('baobab'), w('olifant'), o('acacia')],
    uitdagingen: [
      // De grote trek: een kudde gnoes die drie banen vult.
      { wat: 'kolos', ding: { teken: 'gnoe', maat: 1.3, kijkt: 'r', aantal: [6, 8], dobber: true, banen: 3, snel: 1.3 }, icoon: 'gnoe' },
      ZINKEN(o('golf')),
    ],
  },
  boerderij: {
    weg: 'zandpad',
    veilig: 'gras',
    vijanden: [
      { src: a('koe'), maat: 1.4, snel: 0.7, dobber: true, aantal: [1, 3] },
      { src: w('tractor'), maat: 1.5, snel: 0.9 },
      { src: a('varken'), maat: 1.1, kijkt: 'r', dobber: true, aantal: [1, 2] },
      { src: a('schaap'), maat: 1.1, dobber: true, aantal: [2, 4] },
      { src: w('geit'), maat: 1.1, dobber: true, snel: 1.2 },
      { src: a('kuiken'), maat: 0.8, kijkt: 'r', dobber: true, aantal: [3, 5], snel: 0.8 },
      { src: o('paard'), maat: 1.4, kijkt: 'r', dobber: true, snel: 1.4 },
    ],
    zeldzaam: [{ src: w('tractor'), maat: 1.5, snel: 2.4 }],
    rivier: { water: 'sloot', drijvers: [BOOMSTAM, { src: o('lotus'), maat: 1, aantal: [2, 3], kijkt: 'geen' }] },
    overkant: [w('molen'), a('haan'), w('tractor'), w('kip'), w('molen')],
    uitdagingen: [
      // Waarom stak de kip over? Kippen lopen van de overkant naar beneden.
      { wat: 'overstekers', src: w('kip'), icoon: w('kip') },
      ZINKEN(o('lotus')),
    ],
  },
  ruimte: {
    weg: 'ruimte',
    veilig: 'maan',
    vijanden: [
      // Meteorenzwerm: een paar draaiende stenen vlak achter elkaar.
      { src: i('meteoor'), maat: 1, aantal: [2, 4], spin: true, kijkt: 'geen', snel: 1.1 },
      { src: o('komeet'), maat: 1.3, draai: 45 },
      { src: w('ufo'), maat: 1.3, kijkt: 'geen', dobber: true, snel: 0.8 },
      { src: o('steen'), maat: 1, aantal: [1, 3], spin: true, kijkt: 'geen', snel: 0.7 },
    ],
    zeldzaam: [
      { src: w('raket'), maat: 1.4, kijkt: 'r', draai: 45, snel: 2.8 },
      { src: o('satelliet'), maat: 1.6, kijkt: 'geen', spin: true, snel: 1.6 },
    ],
    overkant: [o('planeet'), w('maan'), w('raket'), w('maan'), o('planeet')],
    uitdagingen: [
      { wat: 'inslag', src: i('meteoor'), gloed: true, icoon: i('meteoor') },
      { wat: 'baan-aan', stijl: 'laser', bron: w('ufo'), icoon: w('ufo') },
    ],
  },
  dino: {
    weg: 'oerwoud',
    veilig: 'oergras',
    vijanden: [
      { teken: 'stegosaurus', maat: 1.15, snel: 0.75, dobber: true },
      { teken: 'triceratops', maat: 1.4, dobber: true },
      { src: o('sauropode'), maat: 1.15, snel: 0.55, dobber: true },
      { src: o('trex'), maat: 1.5, kijkt: 'r', snel: 1.3, dobber: true },
      { src: w('diplodocus'), maat: 1.15, snel: 0.6, dobber: true },
    ],
    zeldzaam: [{ src: o('trex'), maat: 1.6, kijkt: 'r', snel: 2.6, dobber: true }],
    // Een lavarivier: springen over stenen.
    rivier: { water: 'lava', drijvers: [{ src: o('steen'), maat: 1, aantal: [2, 3], kijkt: 'geen' }] },
    overkant: [o('vulkaan'), w('ei'), a('boomvaren'), w('ei'), o('vulkaan')],
    uitdagingen: [
      { wat: 'lavaland', icoon: o('vulkaan') },
      // Lavabommen uit de vulkaan.
      { wat: 'inslag', src: o('steen'), gloed: true, icoon: w('vuur') },
    ],
  },
  zee: {
    weg: 'zee',
    veilig: 'zandbank',
    vijanden: [
      { src: w('zeilboot'), maat: 1.4, kijkt: 'geen', dobber: true, snel: 0.8 },
      { src: o('motorboot'), maat: 1.4, dobber: true },
      { src: w('schip'), maat: 1.9, lang: true, snel: 0.55, dobber: true },
      { src: w('kano'), maat: 1.3, kijkt: 'geen', dobber: true, snel: 0.7 },
      { src: w('haai'), maat: 1.4, snel: 1.2, dobber: true },
      { src: w('dolfijn'), maat: 1.2, aantal: [2, 3], dobber: true, snel: 1.3 },
    ],
    zeldzaam: [{ src: o('speedboot'), maat: 1.5, snel: 2.8, dobber: true }],
    overkant: [a('vuurtoren'), w('parasol'), a('krab'), w('emmer'), a('vuurtoren')],
    uitdagingen: [
      // Een cruiseschip, twee banen breed.
      { wat: 'kolos', ding: { src: w('schip'), maat: 2.2, banen: 2, dobber: true, snel: 0.9 }, icoon: w('schip') },
      { wat: 'overstekers', src: a('krab'), icoon: a('krab') },
    ],
  },
  onderwater: {
    weg: 'diep',
    veilig: 'zeebodem',
    vijanden: [
      { src: w('haai'), maat: 1.5, snel: 1.1, dobber: true },
      { src: w('kwal'), maat: 1, kijkt: 'geen', aantal: [1, 3], dobber: true, snel: 0.6 },
      { src: a('kogelvis'), maat: 1, dobber: true, snel: 0.8 },
      { src: o('tropische-vis'), maat: 0.9, aantal: [3, 5], dobber: true, snel: 1.2 },
      { src: w('octopus'), maat: 1.1, kijkt: 'geen', dobber: true, snel: 0.7 },
      { src: o('walvis'), maat: 1.15, snel: 0.5, dobber: true },
    ],
    zeldzaam: [{ src: w('haai'), maat: 1.6, snel: 2.6, dobber: true }],
    overkant: [a('schelp'), a('octopus'), a('schildpad'), a('krab'), a('schelp')],
    uitdagingen: [
      // Roze kwallen zwemmen de andere kant op.
      { wat: 'overstekers', src: w('kwal'), kleur: 'hue-rotate(70deg) saturate(1.4)', icoon: w('kwal') },
      // De diepzee: je ziet alleen wat je lampje beschijnt.
      { wat: 'donker', icoon: o('zaklamp') },
    ],
  },
  herfst: {
    weg: 'bospad',
    veilig: 'bladeren',
    vijanden: [
      { src: o('everzwijn'), maat: 1.3, kijkt: 'r', snel: 1.2, dobber: true },
      { src: o('hert'), maat: 1.3, snel: 1.1, dobber: true },
      { src: w('das'), maat: 1.1, dobber: true, snel: 0.8 },
      { src: w('egel'), maat: 0.9, dobber: true, snel: 0.5, aantal: [1, 3] },
      { src: w('muis'), maat: 0.8, dobber: true, snel: 1.4, aantal: [2, 3] },
    ],
    zeldzaam: [{ src: o('everzwijn'), maat: 1.3, kijkt: 'r', snel: 2.4, aantal: [3, 4], dobber: true }],
    rivier: { water: 'beek', drijvers: [BOOMSTAM, { src: o('herfstblad'), maat: 1, aantal: [2, 3], kijkt: 'geen' }] },
    overkant: [a('herfst-paddenstoel'), a('herfst-eekhoorn'), a('esdoornblad'), a('herfst-egel'), a('herfst-paddenstoel')],
    uitdagingen: [
      // Kastanjes vallen uit de bomen.
      { wat: 'inslag', src: a('herfst-kastanje'), icoon: a('herfst-kastanje') },
      { wat: 'donker', mist: true, icoon: o('mist') },
      ZINKEN(o('herfstblad')),
    ],
  },
  winter: {
    weg: 'ijsbaan',
    veilig: 'sneeuw',
    vijanden: [
      { src: w('slee'), maat: 1.3, kijkt: 'geen', snel: 1.3 },
      { src: o('skier'), maat: 1.2, kijkt: 'r', snel: 1.4 },
      { src: w('pinguin'), maat: 0.9, kijkt: 'geen', aantal: [2, 4], dobber: true, snel: 0.6 },
      { src: o('sneeuwpop'), maat: 1.1, kijkt: 'geen', snel: 0.5, dobber: true },
      { src: o('hert'), maat: 1.3, dobber: true },
    ],
    zeldzaam: [{ src: o('skier'), maat: 1.2, kijkt: 'r', snel: 3 }],
    rivier: { water: 'wak', drijvers: [{ teken: 'schots', maat: 1 }] },
    overkant: [a('sneeuwpop'), a('den'), a('winter-pinguin'), a('den'), a('sneeuwpop')],
    uitdagingen: [
      { wat: 'lawine', icoon: w('sneeuw') },
      { wat: 'storm', icoon: o('wind') },
      ZINKEN(o('golf')),
    ],
  },
  kasteel: {
    weg: 'gele-stenen',
    veilig: 'gras',
    vijanden: [
      { src: o('paard'), maat: 1.4, kijkt: 'r', dobber: true, snel: 1.3 },
      { src: w('eenhoorn'), maat: 1.1, dobber: true },
      { src: w('draak'), maat: 1.3, dobber: true, snel: 0.8 },
      { src: w('kar'), maat: 1.3, kijkt: 'r', snel: 0.7 },
    ],
    zeldzaam: [{ src: w('draak'), maat: 1.5, snel: 2.6, dobber: true }],
    rivier: { water: 'gracht', drijvers: [BOOMSTAM, { src: o('lotus'), maat: 1, aantal: [2, 3], kijkt: 'geen' }] },
    overkant: [w('vlag'), w('kroon'), a('kasteel-eigen'), w('sleutel'), w('vlag')],
    uitdagingen: [
      // Een draak aan de kant blaast vuur over een hele baan.
      { wat: 'baan-aan', stijl: 'vuur', bron: w('draak'), icoon: w('draak') },
      ZINKEN(o('lotus')),
    ],
  },
  kermis: {
    weg: 'kermis',
    veilig: 'ruitjes',
    vijanden: [
      { src: w('auto'), maat: 1.2, kleuren: true, snel: 1.2 },
      { src: o('draaimolenpaard'), maat: 1.1, dobber: true, aantal: [2, 3], snel: 0.8 },
      { src: w('ballon'), maat: 0.9, kijkt: 'geen', dobber: true, aantal: [2, 4], snel: 0.6 },
      { src: o('clown'), maat: 1, kijkt: 'geen', spin: true },
    ],
    zeldzaam: [{ src: w('auto'), maat: 1.2, kleuren: true, snel: 2.6 }],
    // Zwembanden in allerlei kleuren: hop van band naar band.
    rivier: { water: 'eendjes', drijvers: [{ src: o('zwemband'), maat: 1, aantal: [2, 4], kijkt: 'geen', kleuren: true, dobber: true }] },
    overkant: [a('reuzenrad'), a('kermis-popcorn'), o('teddybeer'), a('kermis-ijsje'), a('reuzenrad')],
    uitdagingen: [
      // Botsauto's stoppen en rijden achteruit.
      { wat: 'keren', icoon: o('keren') },
      // Zwembanden lopen even leeg.
      ZINKEN(o('zwemband')),
    ],
  },
  trein: {
    weg: 'rails',
    veilig: 'perron',
    vijanden: [
      // De trein uit de achtergrond. Lange treinen komen af en toe en snel, met het
      // knipperlicht van de overweg; rangeerlocjes met één wagon rijden af en aan.
      { teken: 'trein', maat: 1, wagons: [2, 3], sporadisch: true, snel: 2.4 },
      { teken: 'trein', maat: 1, wagons: [3, 4], goederen: true, sporadisch: true, snel: 2 },
      { teken: 'trein', maat: 1, wagons: [1, 1], snel: 0.8 },
      { teken: 'trein', maat: 1, wagons: [0, 1], goederen: true, snel: 1 },
    ],
    zeldzaam: [{ teken: 'trein', maat: 1, wagons: [5, 6], goederen: true, sporadisch: true, snel: 3 }],
    overkant: [a('locomotief'), w('klok'), o('verkeerslicht'), w('tas'), a('locomotief')],
    uitdagingen: [
      // Stroom op de rails: een hele baan, met een blauw lampje vooraf.
      { wat: 'baan-aan', stijl: 'stroom', icoon: w('bliksem') },
      // Rangeren: de locjes stoppen en rijden terug.
      { wat: 'keren', icoon: o('keren') },
    ],
  },
};
