import type { Kern } from '../../types.ts';

// "Weer, deel 2": de moeilijkere weerwoorden die kern-02 nog niet kon gebruiken. Van de
// vier die de gebruiker miste (onweer, sneeuw, bliksem, hagel), hebben er maar twee
// (bliksem: b uit kern-04; hagel: h uit kern-03) puur een ontbrekende letter als reden —
// onweer/sneeuw hebben bovendien de klank "ee" nodig, die pas na kern-07 (klanken) mag.
// Voor de samenhang van het thema staan alle vier hier samen, ná kern-07, in plaats van
// verspreid over losse kernen zodra hun eigen letter/klank toevallig beschikbaar is.
const pad = (woord: string, ext = 'svg') => `/assets/images/woorden/${woord}.${ext}`;
const woord = (w: string, vereistTekst = false, ext = 'svg') => ({ woord: w, afbeeldingPad: pad(w, ext), vereistTekst });

export const kern08Weer2: Kern = {
  id: 'kern-08',
  volgnummer: 8,
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
    // 'hagel' deelt de bliksemflits in zijn plaatje met 'onweer' -- zonder tekst erbij
    // zou een kaal plaatje de twee kunnen verwisselen (zelfde soort reden als bij
    // droog/koud/heet in kern-07).
    woord('hagel', true),
  ],
  zinnen: [
    { zin: 'De lucht werd donker en we hoorden een harde knal: ___!', doel: woord('onweer'), afleiders: [woord('sneeuw'), woord('bliksem')] },
    { zin: 'Kleine, harde balletjes ijs vielen uit de lucht: het was ___.', doel: woord('hagel', true), afleiders: [woord('onweer'), woord('sneeuw')] },
  ],
};
