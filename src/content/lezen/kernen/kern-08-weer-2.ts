import type { Kern } from '../../types.ts';

// "Weer, deel 2": de weerwoorden die de gebruiker in "weer" miste (onweer, sneeuw,
// bliksem, hagel). 'sneeuw' vraagt de spelling eeuw, die VLL kern 1-6 niet aanleert; op
// verzoek toch gehouden (s-n-ee-uw is met bekende klanken goed te benaderen).
const pad = (woord: string, ext = 'svg') => `/assets/images/woorden/${woord}.${ext}`;
const woord = (w: string, vereistTekst = false, ext = 'svg') => ({ woord: w, afbeeldingPad: pad(w, ext), vereistTekst });

export const kern08Weer2: Kern = {
  id: 'kern-08',
  volgnummer: 13,
  titel: 'weer, deel 2',
  structuurwoorden: [
    { woord: 'onweer', afbeeldingPad: pad('onweer'), nieuweLetters: [] },
    { woord: 'bliksem', afbeeldingPad: pad('bliksem'), nieuweLetters: [] },
  ],
  nieuweLetters: [],
  woordenbank: [
    woord('onweer'),
    woord('bliksem'),
    woord('sneeuw'),
    // Het hagel-plaatje heeft ook een bliksemflits (net als 'onweer'), dus vereistTekst.
    woord('hagel', true),
  ],
  zinnen: [
    { zin: 'Het flitst en het rommelt. Het is ___.', doel: woord('onweer'), afleiders: [woord('sneeuw'), woord('hagel', true)] },
    { zin: 'Een fel licht flitst door de lucht: dat is de ___.', doel: woord('bliksem'), afleiders: [woord('sneeuw'), woord('hagel', true)] },
    { zin: 'Er vallen kleine balletjes ijs uit de lucht. Dat is ___.', doel: woord('hagel', true), afleiders: [woord('onweer'), woord('sneeuw')] },
    { zin: 'Het is winter. Ik maak een pop van ___.', doel: woord('sneeuw'), afleiders: [woord('onweer'), woord('bliksem')] },
  ],
};
