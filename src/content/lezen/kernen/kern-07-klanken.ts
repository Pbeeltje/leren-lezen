import type { Kern } from '../../types.ts';

// Klanken-kern: geen nieuwe letters, maar de klankcombinaties oo/aa/ee/ui/ou/eu/au (twee
// letters, één klank) die eerdere kernen bewust meden. Gebruikt woorden die eerder uit
// bronmateriaal (plaatjes3.jpg) zijn overgeslagen omdat ze toen nog te moeilijk waren —
// nu wél op hun plek dankzij de klank-herkennen-oefening. "leuk" (bijvoeglijk naamwoord,
// geen eenduidig plaatje — zelfde reden als eerder bij "rood"/"warm") is vervangen door
// "neus". "koud"/"droog"/"heet" zijn dezelfde soort bijvoeglijke naamwoorden, maar komen
// hier alsnog terug (met een zin erbij i.p.v. een kaal plaatje) omdat ze thematisch goed
// passen bij kern-02 (weer) — ze konden daar destijds nog niet mee, want ze introduceren
// juist de klanken (ou/oo/ee) die deze kern bewaart.
const pad = (woord: string, ext = 'svg') => `/assets/images/woorden/${woord}.${ext}`;
const woord = (w: string, vereistTekst = false, ext = 'svg') => ({ woord: w, afbeeldingPad: pad(w, ext), vereistTekst });

export const kern07Klanken: Kern = {
  id: 'kern-07',
  volgnummer: 12,
  titel: 'klanken',
  structuurwoorden: [
    { woord: 'huis', afbeeldingPad: pad('huis', 'jpg'), nieuweLetters: [] },
    { woord: 'auto', afbeeldingPad: pad('auto'), nieuweLetters: [] },
    { woord: 'deur', afbeeldingPad: pad('deur'), nieuweLetters: [] },
  ],
  nieuweLetters: [],
  // roos/noot/maan/huis/muis/zout/neus gebruiken de echte foto's uit bronbestanden/
  // (zie kern-01/05/06 voor de toelichting) — de rest (raam/hout/deur/auto) had nog geen
  // bronfoto en behoudt het generieke icoon.
  woordenbank: [
    woord('roos', false, 'jpg'),
    woord('noot', false, 'jpg'),
    woord('maan', false, 'jpg'),
    woord('raam'),
    woord('huis', false, 'jpg'),
    woord('muis', false, 'jpg'),
    woord('zout', false, 'jpg'),
    woord('hout'),
    woord('deur'),
    woord('neus', false, 'jpg'),
    woord('auto'),
    woord('droog', true),
    woord('koud', true),
    woord('heet', true),
  ],
  // Alle drie bijvoeglijke naamwoorden -> vereistTekst: true (zie de toelichting hierboven
  // en in Woord/oefeningGenerator.ts): zonder een zin erbij kan een sneeuwvlok- of
  // vuur-plaatje net zo goed "winter" of "vuur" betekenen.
  zinnen: [
    { zin: 'Er is geen wolk te zien, het is helemaal ___ weer.', doel: woord('droog', true), afleiders: [woord('neus'), woord('hout')] },
    { zin: 'Buiten ligt sneeuw, het is heel ___.', doel: woord('koud', true), afleiders: [woord('deur'), woord('muis')] },
    { zin: 'Pas op met die thee, hij is nog ___!', doel: woord('heet', true), afleiders: [woord('zout'), woord('auto')] },
  ],
};
