import type { Kern } from '../../types.ts';
import { bestaand } from './vll-hulp.ts';

// Veilig Leren Lezen (2e maan-versie), kern 11. Nieuw: de uitgangen -ig, -lijk en -ing, en lange woorden (lie-ve-heers-beest-je).
// Letterschema volgens de doelen-posters van juf Inger (2e maanversie) en KlasCement-
// kaarten; kern 7-12 hebben geen eigen kernwoorden, dus de woorden zijn zelf gekozen.
// Plaatjes: Fluent Emoji (MIT), kooi: juf-milou-werkblad.
const koning = bestaand('koning', 'svg');
const koningin = bestaand('koningin', 'svg');
const honing = bestaand('honing', 'svg');
const tekening = bestaand('tekening', 'svg');
const vuilnisbak = bestaand('vuilnisbak', 'svg');
const schildpad = bestaand('schildpad', 'svg');
const lieveheersbeestje = bestaand('lieveheersbeestje', 'svg');
const sinaasappel = bestaand('sinaasappel', 'svg');
const aardbei = bestaand('aardbei', 'svg');
const vrolijk = bestaand('vrolijk', 'svg', true);

export const vllKern11: Kern = {
  id: 'vll-kern-11',
  volgnummer: 11,
  titel: 'koning, honing & schildpad',
  structuurwoorden: [],
  nieuweLetters: ['ig', 'lijk', 'ing'],
  woordenbank: [koning, koningin, honing, tekening, vuilnisbak, schildpad, lieveheersbeestje, sinaasappel, aardbei, vrolijk],
  zinnen: [
    { zin: 'De ___ draagt een gouden kroon.', doel: koning, afleiders: [honing, aardbei] },
    { zin: 'De bij maakt zoete ___.', doel: honing, afleiders: [koning, schildpad] },
    { zin: 'Ik maak een ___ voor oma.', doel: tekening, afleiders: [vuilnisbak, aardbei] },
    { zin: 'De ___ loopt heel langzaam.', doel: schildpad, afleiders: [sinaasappel, tekening] },
    { zin: 'Het is feest! Iedereen is ___.', doel: vrolijk, afleiders: [honing, vuilnisbak] },
  ],
};
