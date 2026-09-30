import type { Kern } from '../../types.ts';

// Herhaling van de klankcombinaties oo/aa/ee/ui/ou/eu/au (twee letters, één klank) die
// VLL kern 1-6 al aanleerde, met de klank-herkennen-oefening als hoofdmoot. De
// bijvoeglijke naamwoorden droog/koud/heet hebben vereistTekst + een zin.
const pad = (woord: string, ext = 'svg') => `/assets/images/woorden/${woord}.${ext}`;
const woord = (w: string, vereistTekst = false, ext = 'svg') => ({ woord: w, afbeeldingPad: pad(w, ext), vereistTekst });
// 'huis' gebruikt het VLL-plaatje: de oude huis.jpg-uitsnede toont aan de rand een stuk
// van de iglo ernaast.
const huis = { woord: 'huis', afbeeldingPad: '/assets/images/woorden/vll/huis.png', vereistTekst: false };

export const kern07Klanken: Kern = {
  id: 'kern-07',
  volgnummer: 12,
  titel: 'klanken',
  structuurwoorden: [
    { woord: 'huis', afbeeldingPad: huis.afbeeldingPad, nieuweLetters: [] },
    { woord: 'auto', afbeeldingPad: pad('auto'), nieuweLetters: [] },
    { woord: 'deur', afbeeldingPad: pad('deur'), nieuweLetters: [] },
  ],
  nieuweLetters: [],
  woordenbank: [
    woord('roos', false, 'jpg'),
    woord('noot', false, 'jpg'),
    woord('maan', false, 'jpg'),
    woord('raam'),
    huis,
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
  zinnen: [
    { zin: 'Mijn natte jas hing in de zon. Nu is hij weer ___.', doel: woord('droog', true), afleiders: [woord('neus'), woord('hout')] },
    { zin: 'Buiten ligt sneeuw, het is heel ___.', doel: woord('koud', true), afleiders: [woord('deur'), woord('muis', false, 'jpg')] },
    { zin: 'Pas op met die thee, hij is nog ___!', doel: woord('heet', true), afleiders: [woord('zout', false, 'jpg'), woord('auto')] },
  ],
};
