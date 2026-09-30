import type { Kern } from '../../types.ts';
import { bestaand } from './vll-hulp.ts';

// Themahoofdstuk (na VLL kern 6). Vervoer (dit hoofdstuk was 'weer, deel 2'; de weerwoorden staan nu samen in 'weer').
const auto = bestaand('auto', 'svg');
const vliegtuig = bestaand('vliegtuig', 'svg');
const helikopter = bestaand('helikopter', 'svg');
const ambulance = bestaand('ambulance', 'svg');
const brandweerauto = bestaand('brandweerauto', 'svg');
const vrachtwagen = bestaand('vrachtwagen', 'svg');
const motor = bestaand('motor', 'svg');
const taxi = bestaand('taxi', 'svg');
const schip = bestaand('schip', 'svg');
const tram = bestaand('tram', 'svg');

export const kern08Weer2: Kern = {
  id: 'kern-08',
  volgnummer: 13,
  titel: 'vervoer',
  structuurwoorden: [],
  nieuweLetters: [],
  woordenbank: [auto, vliegtuig, helikopter, ambulance, brandweerauto, vrachtwagen, motor, taxi, schip, tram],
  zinnen: [
    { zin: 'Met het ___ vliegen we op vakantie.', doel: vliegtuig, afleiders: [schip, tram] },
    { zin: 'De ___ blust het vuur.', doel: brandweerauto, afleiders: [taxi, tram] },
    { zin: 'De ___ brengt de zieke man naar het ziekenhuis.', doel: ambulance, afleiders: [vrachtwagen, motor] },
    { zin: 'Het grote ___ vaart over de zee.', doel: schip, afleiders: [tram, taxi] },
    { zin: 'De ___ rijdt over de rails door de stad.', doel: tram, afleiders: [auto, taxi] },
    { zin: 'De ___ brengt de pakjes naar de winkel.', doel: vrachtwagen, afleiders: [helikopter, schip] },
  ],
};
