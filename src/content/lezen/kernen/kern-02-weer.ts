import type { Kern } from '../../types.ts';

// Zelfde structuurmethode-aanpak als kern-01, nu met het thema "weer" om het
// woordenbereik uit te breiden. Introduceert z, e, g, w, d, t, l, k (klankzuiver,
// geen tweetekenklanken zoals eeuw/ei/oe — "zelfde moeilijkheidsgraad" als kern-01).
const pad = (woord: string, ext = 'svg') => `/assets/images/woorden/${woord}.${ext}`;
const woord = (w: string, vereistTekst = false, ext = 'svg') => ({ woord: w, afbeeldingPad: pad(w, ext), vereistTekst });

export const kern02Weer: Kern = {
  id: 'kern-02',
  volgnummer: 2,
  titel: 'weer',
  structuurwoorden: [
    { woord: 'zon', afbeeldingPad: pad('zon', 'jpg'), nieuweLetters: ['z'] },
    { woord: 'regen', afbeeldingPad: pad('regen'), nieuweLetters: ['e', 'g'] },
    { woord: 'wind', afbeeldingPad: pad('wind'), nieuweLetters: ['w', 'd'] },
  ],
  nieuweLetters: ['z', 'e', 'g', 'w', 'd', 't', 'l', 'k'],
  // zon/tas gebruiken de echte foto's uit bronbestanden/ (zie kern-01 voor de toelichting).
  // 'was' (verwarrend icoon) en 'storm' (het plaatje leest als een tornado, niet als
  // "hard waaien") zijn geschrapt op verzoek.
  woordenbank: [
    woord('zon', false, 'jpg'),
    woord('regen'),
    woord('wind'),
    woord('mist'),
    woord('wolk'),
    woord('tas', false, 'jpg'),
    woord('nat', true),
  ],
  // 'nat' is een bijvoeglijk naamwoord: net als eerder bij 'rood'/'warm'/'koud' heeft
  // zo'n woord geen eenduidig plaatje op zichzelf (een druppel-icoon kan net zo goed
  // "regen" of "water" betekenen). vereistTekst: true sluit daarom de oefentypen uit
  // waar alleen het kale plaatje staat (zie oefeningGenerator.ts); de zin hieronder
  // geeft de context die dat oplost voor de resterende typen.
  zinnen: [{ zin: 'Door de regen is mijn jas helemaal ___.', doel: woord('nat', true), afleiders: [woord('mist'), woord('wind')] }],
};
