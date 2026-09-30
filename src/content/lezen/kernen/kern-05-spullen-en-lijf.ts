import type { Kern } from '../../types.ts';

// Bron: een "Circuitspelletjes kern 4"-werkblad (memory-kaartjes) dat de gebruiker
// aanleverde; alle plaatjes zijn uitgesneden uit bronbestanden/memory.jpg met
// bronbestanden/crop.ps1. Dat werkblad hoort niet bij de maan-versie (wiel/zout/voet
// passen niet bij maan-versie kern 4); hier gewoon een themahoofdstuk na VLL kern 6.
const pad = (woord: string) => `/assets/images/woorden/${woord}.jpg`;
const woord = (w: string) => ({ woord: w, afbeeldingPad: pad(w) });

export const kern05SpullenEnLijf: Kern = {
  id: 'kern-05',
  volgnummer: 10,
  titel: 'spullen & lijf',
  structuurwoorden: [
    { woord: 'bij', afbeeldingPad: pad('bij'), nieuweLetters: [] },
    { woord: 'zout', afbeeldingPad: pad('zout'), nieuweLetters: [] },
  ],
  nieuweLetters: [],
  woordenbank: [
    woord('bij'),
    woord('tak'),
    woord('wiel'),
    woord('wol'),
    woord('zout'),
    woord('neus'),
    woord('zeep'),
    woord('voet'),
  ],
  zinnen: [
    { zin: 'Ik doe een beetje ___ op mijn ei.', doel: woord('zout'), afleiders: [woord('zeep'), woord('wol')] },
    { zin: 'Oma breit een trui van ___.', doel: woord('wol'), afleiders: [woord('zout'), woord('tak')] },
  ],
};
