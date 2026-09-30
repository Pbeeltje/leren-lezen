import type { Kern } from '../../types.ts';

// "Klanken, deel 2": klankcombinatie-woorden (ui/ee/oo/ou) uit een "Woord bij
// plaatje"-werkblad (juf-milou.nl) dat de gebruiker aanleverde (bronbestanden/
// nogmeerwoordentwee.jpg, uitgesneden met crop-wb2.ps1). Van dat werkblad overgeslagen:
// 'kat' (staat al in "boerderijdieren"), 'zaai' (aai leert VLL kern 1-6 niet aan, en het
// plaatje is niet eenduidig) en 'flat' (Engelse uitspraak "flet", niet klankzuiver). De
// overige woorden op het werkblad waren afleiders, geen doelwoorden.
const pad = (woord: string, ext = 'png') => `/assets/images/woorden/${woord}.${ext}`;
const woord = (w: string, vereistTekst = false, ext = 'png') => ({ woord: w, afbeeldingPad: pad(w, ext), vereistTekst });

export const kern10Klanken2: Kern = {
  id: 'kern-10',
  volgnummer: 15,
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
    // 'eet' is een werkwoord: een kaal plaatje (jongen die eet) is niet eenduidig.
    woord('eet', true),
  ],
  zinnen: [
    { zin: 'De jongen ___ een stuk pizza.', doel: woord('eet', true), afleiders: [woord('mol'), woord('pot')] },
    { zin: 'In de sneeuw zit ik op de ___.', doel: woord('slee'), afleiders: [woord('trui'), woord('tuin')] },
    { zin: 'Boe! Daar is het ___!', doel: woord('spook'), afleiders: [woord('mol'), woord('fruit')] },
  ],
};
