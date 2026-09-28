import type { Kern } from '../../types.ts';

// Bron: een echt "Circuitspelletjes kern 4"-werkblad (memory-kaartjes) dat de gebruiker
// aanleverde — vandaar dat een paar woorden hier tweetekenklanken bevatten (wiel/voet:
// ie/oe, zout: ou) die kern-02/03/04 bewust meden: dit is precies wat een echte methode
// op dit punt al gebruikt, dus vertrouwd als leidraad i.p.v. de eigen simpelere aanname.
// Introduceert j, u.
const pad = (woord: string) => `/assets/images/woorden/${woord}.svg`;
const woord = (w: string) => ({ woord: w, afbeeldingPad: pad(w) });

export const kern05SpullenEnLijf: Kern = {
  id: 'kern-05',
  volgnummer: 5,
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
