import type { Kern } from '../../types.ts';
import { bestaand, vll } from './vll-hulp.ts';

// Veilig Leren Lezen maan-versie, kern 2: teen, een, neus, buik, oog.
// Nieuw: t, b, g en de klanken ee, eu, ui. 'een' (plaatje: het cijfer 1) is een
// functiewoord en krijgt vereistTekst + een zin. Nog geen korte a (die komt in kern 4)
// en alleen eenlettergrepige woorden.
const teen = vll('teen');
const een = vll('een', true);
const neus = vll('neus');
const buik = vll('buik');
const oog = bestaand('oog', 'svg');
const pet = bestaand('pet', 'svg');
const noot = bestaand('noot', 'svg');
const beer = bestaand('beer', 'svg');
const ster = bestaand('ster', 'svg');
const muis = bestaand('muis', 'svg');
const kaas = bestaand('kaas', 'svg');
const aap = bestaand('aap', 'svg');
const trui = bestaand('trui', 'svg');
// Extra woorden met Fluent Emoji-plaatjes (MIT), alleen met letters die al bekend zijn.
const peer = bestaand('peer', 'svg');
const boot = bestaand('boot', 'svg');
const been = bestaand('been', 'svg');
const berg = bestaand('berg', 'svg');
const taart = bestaand('taart', 'svg');
const ui = bestaand('ui', 'svg');

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
  nieuweLetters: ['t', 'ee', 'eu', 'b', 'ui', 'g'],
  woordenbank: [teen, een, neus, buik, oog, pet, noot, beer, ster, muis, kaas, aap, trui, peer, boot, been, berg, taart, ui],
  zinnen: [
    { zin: 'Ik heb ___ neus en twee ogen.', doel: een, afleiders: [teen, buik] },
    { zin: 'Aan mijn voet zit een grote ___.', doel: teen, afleiders: [neus, oog] },
    { zin: 'Na het eten zit mijn ___ vol.', doel: buik, afleiders: [oog, teen] },
    { zin: 'Met mijn ___ kan ik ruiken.', doel: neus, afleiders: [oog, buik] },
    { zin: 'Met mijn ___ kan ik zien.', doel: oog, afleiders: [neus, teen] },
    { zin: 'De ___ piept en eet een stukje kaas.', doel: muis, afleiders: [beer, ster] },
  ],
};
