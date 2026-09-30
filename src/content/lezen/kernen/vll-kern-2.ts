import type { Kern } from '../../types.ts';
import { bestaand, vll } from './vll-hulp.ts';

// Veilig Leren Lezen maan-versie, kern 2: teen, een, neus, buik, oog.
// Nieuw: t, b, g en de klanken ee, eu, ui. 'een' (plaatje: het cijfer 1) is een
// functiewoord en krijgt vereistTekst + een zin.
const teen = vll('teen');
const een = vll('een', true);
const neus = vll('neus');
const buik = vll('buik');
const oog = vll('oog');
const pet = bestaand('pet', 'jpg');
const noot = bestaand('noot', 'jpg');
const kat = bestaand('kat', 'svg');
const beer = bestaand('beer', 'jpg');
const ster = bestaand('ster', 'jpg');
const muis = bestaand('muis', 'jpg');
const regen = bestaand('regen', 'svg');
const kaas = bestaand('kaas', 'jpg');
const aap = bestaand('aap', 'jpg');
const trui = bestaand('trui', 'png');
const gans = bestaand('gans', 'jpg');

export const vllKern2: Kern = {
  id: 'vll-kern-2',
  volgnummer: 2,
  titel: 'teen, neus & buik',
  structuurwoorden: [
    { woord: 'teen', afbeeldingPad: teen.afbeeldingPad, nieuweLetters: ['t', 'ee'] },
    { woord: 'een', afbeeldingPad: een.afbeeldingPad, nieuweLetters: [] },
    { woord: 'neus', afbeeldingPad: neus.afbeeldingPad, nieuweLetters: ['eu'] },
    { woord: 'buik', afbeeldingPad: buik.afbeeldingPad, nieuweLetters: ['b', 'ui'] },
    { woord: 'oog', afbeeldingPad: oog.afbeeldingPad, nieuweLetters: ['g'] },
  ],
  nieuweLetters: ['t', 'b', 'g'],
  woordenbank: [teen, een, neus, buik, oog, pet, noot, kat, beer, ster, muis, regen, kaas, aap, trui, gans],
  zinnen: [
    { zin: 'Ik heb ___ neus en twee ogen.', doel: een, afleiders: [teen, buik] },
    { zin: 'Aan mijn voet zit een grote ___.', doel: teen, afleiders: [neus, oog] },
    { zin: 'Na het eten zit mijn ___ vol.', doel: buik, afleiders: [oog, teen] },
    { zin: 'Met mijn ___ kan ik ruiken.', doel: neus, afleiders: [oog, buik] },
    { zin: 'Met mijn ___ kan ik zien.', doel: oog, afleiders: [neus, teen] },
    { zin: 'De ___ eet graag een stukje kaas.', doel: muis, afleiders: [beer, kat] },
  ],
};
