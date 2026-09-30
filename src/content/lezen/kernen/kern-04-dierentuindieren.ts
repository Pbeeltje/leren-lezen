import type { Kern } from '../../types.ts';

// Themahoofdstuk "dierentuindieren" (na VLL kern 6). Bekende namen, ook woorden van
// twee of drie lettergrepen; geen lastige klanken zoals leeuw/tijger. Let op: 'giraf'
// spreek je uit met een 'zj' — niet klankzuiver, maar bewust gehouden als bekend dier.
const pad = (woord: string, ext = 'svg') => `/assets/images/woorden/${woord}.${ext}`;
const woord = (w: string, ext = 'svg') => ({ woord: w, afbeeldingPad: pad(w, ext) });

export const kern04Dierentuindieren: Kern = {
  id: 'kern-04',
  volgnummer: 9,
  titel: 'dierentuindieren',
  structuurwoorden: [
    { woord: 'aap', afbeeldingPad: pad('aap', 'jpg'), nieuweLetters: [] },
    { woord: 'olifant', afbeeldingPad: pad('olifant'), nieuweLetters: [] },
    { woord: 'zebra', afbeeldingPad: pad('zebra'), nieuweLetters: [] },
  ],
  nieuweLetters: [],
  woordenbank: [
    woord('aap', 'jpg'),
    woord('olifant'),
    woord('zebra'),
    woord('giraf'),
    woord('panda'),
    woord('kameel'),
    woord('krokodil'),
    woord('vos'),
    woord('beer', 'jpg'),
    woord('das'),
  ],
  zinnen: [
    { zin: 'De ___ heeft een hele lange nek.', doel: woord('giraf'), afleiders: [woord('zebra'), woord('kameel')] },
    { zin: 'De ___ heeft een lange slurf.', doel: woord('olifant'), afleiders: [woord('krokodil'), woord('panda')] },
    { zin: 'De ___ heeft zwarte en witte strepen.', doel: woord('zebra'), afleiders: [woord('giraf'), woord('beer', 'jpg')] },
  ],
};
