import type { Kern } from '../../types.ts';
import { bestaand, vll } from './vll-hulp.ts';

// Veilig Leren Lezen maan-versie, kern 5: reus, jas, riem, bijl, hout, vuur.
// Nieuw: j, l en de klanken ie, ou, uu.
const reus = vll('reus');
const jas = vll('jas');
const riem = vll('riem');
const bijl = vll('bijl');
const hout = vll('hout');
const vuur = vll('vuur');
const wiel = bestaand('wiel', 'jpg');
const wolk = bestaand('wolk', 'svg');
const mol = bestaand('mol', 'png');
const lam = bestaand('lam', 'svg');
const bal = bestaand('bal', 'jpg');
const egel = bestaand('egel', 'jpg');
const ezel = bestaand('ezel', 'svg');
const kous = bestaand('kous', 'png');
const zout = bestaand('zout', 'jpg');
const slee = bestaand('slee', 'png');
const kameel = bestaand('kameel', 'svg');
const koud = bestaand('koud', 'svg', true);

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
  nieuweLetters: ['j', 'l'],
  woordenbank: [reus, jas, riem, bijl, hout, vuur, wiel, wolk, mol, lam, bal, egel, ezel, kous, zout, slee, kameel, koud],
  zinnen: [
    { zin: 'In de winter is het buiten ___.', doel: koud, afleiders: [vuur, hout] },
    { zin: 'De ___ is heel groot en sterk.', doel: reus, afleiders: [jas, riem] },
    { zin: 'Met de ___ hakt papa het hout.', doel: bijl, afleiders: [riem, jas] },
    { zin: 'Doe je ___ aan, het regent.', doel: jas, afleiders: [riem, bijl] },
    { zin: 'Mijn broek zakt af. Ik doe een ___ om.', doel: riem, afleiders: [jas, reus] },
    { zin: 'Bij het kampvuur is het ___ lekker warm.', doel: vuur, afleiders: [hout, reus] },
  ],
};
