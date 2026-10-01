import type { Kern } from '../../types.ts';
import { bestaand, vll } from './vll-hulp.ts';

// Veilig Leren Lezen maan-versie, kern 5: reus, jas, riem, bijl, hout, vuur.
// Nieuw: j, l en de klanken ie, ou, uu. Alleen eenlettergrepige woorden: egel/ezel/
// kameel vragen open lettergrepen, die pas na kern 6 aan bod komen.
const reus = vll('reus');
const jas = vll('jas');
const riem = vll('riem');
const bijl = vll('bijl');
const hout = bestaand('hout', 'svg');
const vuur = vll('vuur');
const wiel = bestaand('wiel', 'jpg');
const wolk = bestaand('wolk', 'svg');
const mol = bestaand('mol', 'png');
const bal = bestaand('bal', 'jpg');
const kous = bestaand('kous', 'png');
const zout = bestaand('zout', 'jpg');
const slee = bestaand('slee', 'png');
const wol = bestaand('wol', 'jpg');
const koud = bestaand('koud', 'svg', true);
// Extra woorden met Fluent Emoji-plaatjes (MIT), alleen met letters die al bekend zijn.
const lamp = bestaand('lamp', 'svg');
const bril = bestaand('bril', 'svg');
const bloem = bestaand('bloem', 'svg');
const blad = bestaand('blad', 'svg');
const slak = bestaand('slak', 'svg');
const klok = bestaand('klok', 'svg');
const stoel = bestaand('stoel', 'svg');
const mier = bestaand('mier', 'svg');
const vlieg = bestaand('vlieg', 'svg');
const melk = bestaand('melk', 'svg');
const jurk = bestaand('jurk', 'svg');
const vlag = bestaand('vlag', 'svg');

export const vllKern5: Kern = {
  id: 'vll-kern-5',
  volgnummer: 5,
  titel: 'reus, jas & riem',
  structuurwoorden: [
    { woord: 'reus', afbeeldingPad: reus.afbeeldingPad, nieuweLetters: [] },
    { woord: 'jas', afbeeldingPad: jas.afbeeldingPad, nieuweLetters: ['j'] },
    { woord: 'riem', afbeeldingPad: riem.afbeeldingPad, nieuweLetters: ['ie'] },
    { woord: 'bijl', afbeeldingPad: bijl.afbeeldingPad, nieuweLetters: ['l'] },
    { woord: 'hout', afbeeldingPad: hout.afbeeldingPad, nieuweLetters: ['ou'] },
    { woord: 'vuur', afbeeldingPad: vuur.afbeeldingPad, nieuweLetters: ['uu'] },
  ],
  nieuweLetters: ['j', 'ie', 'l', 'ou', 'uu'],
  woordenbank: [reus, jas, riem, bijl, hout, vuur, wiel, wolk, mol, bal, kous, zout, slee, wol, koud, lamp, bril, bloem, blad, slak, klok, stoel, mier, vlieg, melk, jurk, vlag],
  zinnen: [
    { zin: 'In de winter is het buiten ___.', doel: koud, afleiders: [vuur, hout] },
    { zin: 'De ___ is heel groot en sterk.', doel: reus, afleiders: [jas, riem] },
    { zin: 'Met de ___ hakt papa het hout.', doel: bijl, afleiders: [riem, jas] },
    { zin: 'Doe je ___ aan, het regent.', doel: jas, afleiders: [riem, bijl] },
    { zin: 'Mijn broek zakt af. Ik doe een ___ om.', doel: riem, afleiders: [jas, reus] },
    { zin: 'Pas op! Het ___ is heel heet.', doel: vuur, afleiders: [jas, reus] },
  ],
};
