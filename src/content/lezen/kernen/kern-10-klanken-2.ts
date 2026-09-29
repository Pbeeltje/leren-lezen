import type { Kern } from '../../types.ts';

// "Klanken, deel 2": nog een set klankcombinatie-woorden (ui/ee/oo/ou), dit keer uit een
// echt "Woord bij plaatje"-werkblad (juf-milou.nl) dat de gebruiker aanleverde. Net als
// kern-07/08/09 staat dit na kern-07 omdat ui/ee/oo/ou pas dan mogen. Van het bronwerkblad
// is 'kat' overgeslagen (al gebruikt in kern-03); 'moe'/'bol'/'lees'/'snee'/'koos'/'poos'/
// 'riet'/'tuur'/'kop'/'als'/'vla'/'een'/'ren'/'aai'/'haai' waren afleiders op dat werkblad,
// geen doelwoorden, en zijn hier dus niet meegenomen.
const pad = (woord: string, ext = 'png') => `/assets/images/woorden/${woord}.${ext}`;
const woord = (w: string, vereistTekst = false, ext = 'png') => ({ woord: w, afbeeldingPad: pad(w, ext), vereistTekst });

export const kern10Klanken2: Kern = {
  id: 'kern-10',
  volgnummer: 10,
  titel: 'klanken, deel 2',
  structuurwoorden: [
    { woord: 'fruit', afbeeldingPad: pad('fruit'), nieuweLetters: [] },
    { woord: 'spook', afbeeldingPad: pad('spook'), nieuweLetters: [] },
  ],
  nieuweLetters: [],
  woordenbank: [
    woord('fruit'),
    woord('tuin'),
    woord('slee'),
    woord('mol'),
    woord('spook'),
    woord('trui'),
    woord('pot'),
    woord('kous'),
    woord('flat'),
    // 'eet' en 'zaai' zijn werkwoorden -- een kaal plaatje (jongen die eet / man die
    // strooit) is niet eenduidig zonder tekst erbij (zelfde reden als bij droog/koud/heet).
    woord('eet', true),
    woord('zaai', true),
  ],
  zinnen: [
    { zin: 'De jongen ___ een stuk pizza.', doel: woord('eet', true), afleiders: [woord('mol'), woord('pot')] },
    { zin: 'De tuinman ___ zaadjes in de aarde.', doel: woord('zaai', true), afleiders: [woord('spook'), woord('trui')] },
  ],
};
