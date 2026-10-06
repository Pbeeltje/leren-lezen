// Hoofdstukken voor Luisteren: woorden per thema. Alleen woorden die in een leeskern staan
// én een opname hebben doen mee (zie hoofdstukWoorden in luisterenGenerator.ts), dus een
// hoofdstuk groeit vanzelf mee met nieuwe opnames. Te weinig woorden -> nog "binnenkort".

export interface LuisterHoofdstuk {
  id: string;
  titel: string;
  icoonWoord: string; // welk woordplaatje op de tegel staat
  woorden: string[];
  // Eigen plaatjes voor sommige woorden in dit hoofdstuk (bv. de schattige weerplaatjes).
  plaatjes?: Record<string, string>;
}

// Woorden die alleen in Luisteren (en Geheugenspel) zitten, niet in een leeshoofdstuk:
// hun spelling is niet klankzuiver (parachute, skateboard, diplodocus ...), dus te moeilijk
// om te lezen. Plaatje: assets/images/woorden/<woord>.svg. pinguin zonder trema: het is
// alleen een bestandsnaam, deze spellen tonen geen tekst.
export const ALLEEN_LUISTEREN: string[] = [
  'parachute', 'skateboard', 'shampoo', 'diplodocus', 'tyrannosaurus', 'octopus',
  'politieauto', 'scooter', 'ufo', 'frisbee', 'pinguin',
  'saxofoon', 'accordeon', 'banjo', 'xylofoon', 'microfoon',
];

export const LUISTER_HOOFDSTUKKEN: LuisterHoofdstuk[] = [
  {
    id: 'boerderij',
    titel: 'Boerderij',
    icoonWoord: 'kip',
    woorden: ['kip', 'haan', 'eend', 'varken', 'ezel', 'paard', 'schaap', 'koe', 'konijn', 'kalkoen', 'kat', 'hond', 'gans', 'ram', 'muis', 'tractor'],
  },
  {
    id: 'dierentuin',
    titel: 'Dierentuin',
    icoonWoord: 'olifant',
    woorden: ['aap', 'olifant', 'zebra', 'giraf', 'panda', 'kameel', 'krokodil', 'leeuw', 'tijger', 'nijlpaard', 'neushoorn', 'slang', 'flamingo', 'kangoeroe', 'zeehond', 'beer'],
  },
  {
    id: 'dieren',
    titel: 'Nog meer dieren',
    icoonWoord: 'vos',
    woorden: ['vos', 'wolf', 'egel', 'das', 'mol', 'bij', 'vis', 'uil', 'duif', 'pauw', 'geit', 'slak', 'mier', 'vlieg', 'haai', 'zwaan', 'ijsbeer', 'lam', 'kikker', 'dolfijn', 'spin', 'krab', 'schildpad', 'lieveheersbeestje', 'vogel', 'leeuw', 'octopus', 'walvis', 'pinguin', 'vlinder', 'rups', 'eekhoorn', 'vleermuis', 'kwal', 'kreeft', 'hagedis'],
  },
  {
    id: 'eten',
    titel: 'Eten',
    icoonWoord: 'kaas',
    woorden: ['kaas', 'koek', 'fruit', 'noot', 'zout', 'ijs', 'ei', 'brood', 'soep', 'peer', 'kers', 'taart', 'melk', 'appel', 'banaan', 'tomaat', 'wortel', 'aardbei', 'sinaasappel', 'honing', 'sla', 'paddenstoel'],
  },
  {
    id: 'lijf',
    titel: 'Mijn lijf',
    icoonWoord: 'neus',
    woorden: ['arm', 'neus', 'oog', 'oor', 'voet', 'teen', 'buik', 'hand', 'tand', 'mond', 'been', 'duim', 'tong', 'vinger'],
  },
  {
    id: 'spullen',
    titel: 'Kleren & spullen',
    icoonWoord: 'sok',
    woorden: ['pet', 'sok', 'trui', 'kous', 'muts', 'tas', 'jas', 'riem', 'pen', 'vaas', 'pot', 'bel', 'wiel', 'deur', 'raam', 'boek', 'bed', 'stoel', 'lamp', 'klok', 'bril', 'schaar', 'lepel', 'kopje', 'sleutel', 'laars', 'kroon', 'schoen', 'ring', 'broek', 'strik', 'emmer', 'hamer', 'ladder', 'fles', 'spons', 'krant', 'bank', 'kraan', 'paraplu', 'parasol', 'shampoo', 'kam', 'borstel', 'onderbroek', 'magneet'],
  },
  {
    id: 'buiten',
    titel: 'Buiten',
    icoonWoord: 'zon',
    plaatjes: {
      zon: 'assets/images/woorden/weer/zon.svg',
      wolk: 'assets/images/woorden/weer/wolk.svg',
      regen: 'assets/images/woorden/weer/regen.svg',
      onweer: 'assets/images/woorden/weer/onweer.svg',
      bliksem: 'assets/images/woorden/weer/bliksem.svg',
      sneeuw: 'assets/images/woorden/weer/sneeuw.svg',
      hagel: 'assets/images/woorden/weer/hagel.svg',
      wind: 'assets/images/woorden/weer/wind.svg',
      regenboog: 'assets/images/woorden/weer/regenboog.svg',
    },
    woorden: ['zon', 'maan', 'ster', 'wolk', 'regen', 'wind', 'sneeuw', 'onweer', 'bliksem', 'boom', 'tak', 'roos', 'tuin', 'huis', 'vuur', 'hout', 'hagel', 'bloem', 'blad', 'regenboog', 'hulst', 'nacht', 'plant', 'schelp', 'kerk', 'school'],
  },
  {
    id: 'speelgoed',
    titel: 'Speelgoed',
    icoonWoord: 'bal',
    woorden: ['bal', 'voetbal', 'ballon', 'vlieger', 'knuffel', 'trommel', 'gitaar', 'piano', 'puzzel', 'robot', 'blok', 'dobbelsteen', 'kegel', 'schommel', 'slee', 'schaats', 'ski', 'spook', 'radio', 'jojo', 'glijbaan', 'toverstaf', 'frisbee', 'trompet'],
  },
  {
    id: 'vervoer',
    titel: 'Vervoer',
    icoonWoord: 'auto',
    woorden: ['auto', 'bus', 'fiets', 'step', 'trein', 'tram', 'taxi', 'motor', 'vrachtwagen', 'tractor', 'ambulance', 'brandweerauto', 'boot', 'schip', 'vliegtuig', 'helikopter', 'raket', 'parachute', 'skateboard', 'kano', 'zeilboot', 'politieauto', 'scooter', 'kabelbaan', 'ufo'],
  },
  {
    id: 'gereedschap',
    titel: 'Gereedschap',
    icoonWoord: 'hamer',
    woorden: ['hamer', 'spijker', 'zaag', 'schroevendraaier', 'moersleutel', 'tang', 'schaar', 'plakband', 'kwast', 'verf', 'ladder', 'emmer', 'pan', 'bijl', 'touw', 'haak', 'zaklamp', 'liniaal', 'batterij', 'gereedschapskist', 'potlood', 'magneet'],
  },
  {
    id: 'muziek',
    titel: 'Muziek',
    icoonWoord: 'gitaar',
    woorden: ['gitaar', 'piano', 'trommel', 'trompet', 'triangel', 'fluit', 'viool', 'harp', 'xylofoon', 'saxofoon', 'accordeon', 'banjo', 'tuba', 'tamboerijn', 'orgel', 'drumstel', 'gong', 'bel', 'microfoon', 'koptelefoon', 'luidspreker', 'megafoon', 'radio'],
  },
  {
    id: 'dinos',
    titel: "Dino's & draken",
    icoonWoord: 'tyrannosaurus',
    woorden: ['tyrannosaurus', 'stegosaurus', 'diplodocus', 'mammoet', 'draak', 'eenhoorn', 'hagedis', 'krokodil'],
  },
];
