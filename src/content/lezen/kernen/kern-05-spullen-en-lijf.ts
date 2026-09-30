import type { Kern } from '../../types.ts';

// Bron: een echt "Circuitspelletjes kern 4"-werkblad (memory-kaartjes) dat de gebruiker
// aanleverde — vandaar dat een paar woorden hier tweetekenklanken bevatten (wiel/voet:
// ie/oe, zout: ou) die kern-02/03/04 bewust meden: dit is precies wat een echte methode
// op dit punt al gebruikt, dus vertrouwd als leidraad i.p.v. de eigen simpelere aanname.
// Introduceert j, u. Alle plaatjes in deze kern zijn de echte, door de gebruiker
// aangeleverde memory-kaartjes zelf (bronbestanden/memory.jpg, uitgesneden met
// bronbestanden/crop.ps1) — geen generieke iconen.
const pad = (woord: string) => `/assets/images/woorden/${woord}.jpg`;
const woord = (w: string) => ({ woord: w, afbeeldingPad: pad(w) });

export const kern05SpullenEnLijf: Kern = {
  id: 'kern-05',
  volgnummer: 10,
  titel: 'spullen & lijf',
  structuurwoorden: [
    { woord: 'bij', afbeeldingPad: pad('bij'), nieuweLetters: ['j'] },
    { woord: 'zout', afbeeldingPad: pad('zout'), nieuweLetters: ['u'] },
  ],
  nieuweLetters: ['j', 'u'],
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
  zinnen: [],
};
