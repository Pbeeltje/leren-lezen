import type { Kern } from '../../types.ts';

// "Kerst": bron is een echt Junior Einstein-werkblad (groep 3/4) dat de gebruiker
// aanleverde. Net als kern-08 staat dit na kern-07 omdat de woorden klanken nodig
// hebben die deze curriculum bewust tot kern-07 bewaarde: boom (oo) en koek (oe, nieuw
// toegevoegd aan KLANKEN in oefeningGenerator.ts vanaf deze kern). bel/muts/hulst
// hebben zelf geen nieuwe klank nodig (enkel b/h/u, al bekend sinds kern-03/04/05) maar
// blijven bij hun bronwerkblad-thema i.p.v. los verspreid te worden.
const pad = (woord: string, ext = 'png') => `/assets/images/woorden/${woord}.${ext}`;
const woord = (w: string, vereistTekst = false, ext = 'png') => ({ woord: w, afbeeldingPad: pad(w, ext), vereistTekst });

export const kern09Kerst: Kern = {
  id: 'kern-09',
  volgnummer: 9,
  titel: 'kerst',
  structuurwoorden: [
    { woord: 'bel', afbeeldingPad: pad('bel'), nieuweLetters: [] },
    { woord: 'boom', afbeeldingPad: pad('boom'), nieuweLetters: [] },
  ],
  nieuweLetters: [],
  woordenbank: [woord('bel'), woord('muts'), woord('koek'), woord('hulst'), woord('boom')],
  zinnen: [],
};
