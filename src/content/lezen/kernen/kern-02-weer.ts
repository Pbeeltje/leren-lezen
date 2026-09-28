import type { Kern } from '../../types.ts';

// Zelfde structuurmethode-aanpak als kern-01, nu met het thema "weer" om het
// woordenbereik uit te breiden. Introduceert z, e, g, w, d, t, l, k (klankzuiver,
// geen tweetekenklanken zoals eeuw/ei/oe — "zelfde moeilijkheidsgraad" als kern-01).
const pad = (woord: string) => `/assets/images/woorden/${woord}.svg`;
const woord = (w: string) => ({ woord: w, afbeeldingPad: pad(w) });

export const kern02Weer: Kern = {
  id: 'kern-02',
  volgnummer: 2,
  titel: 'weer',
  structuurwoorden: [
    { woord: 'zon', afbeeldingPad: pad('zon'), nieuweLetters: ['z'] },
    { woord: 'regen', afbeeldingPad: pad('regen'), nieuweLetters: ['e', 'g'] },
    { woord: 'wind', afbeeldingPad: pad('wind'), nieuweLetters: ['w', 'd'] },
  ],
  nieuweLetters: ['z', 'e', 'g', 'w', 'd', 't', 'l', 'k'],
  woordenbank: [
    woord('zon'),
    woord('regen'),
    woord('wind'),
    woord('storm'),
    woord('mist'),
    woord('wolk'),
    woord('tas'),
    woord('was'),
  ],
  zinnen: [],
};
