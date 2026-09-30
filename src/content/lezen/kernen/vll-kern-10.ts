import type { Kern } from '../../types.ts';
import { bestaand } from './vll-hulp.ts';

// Veilig Leren Lezen (2e maan-versie), kern 10. Nieuw: eeuw, ieuw en uw, en open lettergrepen (vo-gel, ba-naan).
// Letterschema volgens de doelen-posters van juf Inger (2e maanversie) en KlasCement-
// kaarten; kern 7-12 hebben geen eigen kernwoorden, dus de woorden zijn zelf gekozen.
// Plaatjes: Fluent Emoji (MIT), kooi: juf-milou-werkblad.
const leeuw = bestaand('leeuw', 'svg');
const vogel = bestaand('vogel', 'svg');
const hamer = bestaand('hamer', 'svg');
const banaan = bestaand('banaan', 'svg');
const tomaat = bestaand('tomaat', 'svg');
const ladder = bestaand('ladder', 'svg');
const piano = bestaand('piano', 'svg');
const radio = bestaand('radio', 'svg');
const lepel = bestaand('lepel', 'svg');

export const vllKern10: Kern = {
  id: 'vll-kern-10',
  volgnummer: 10,
  titel: 'leeuw, vogel & banaan',
  structuurwoorden: [],
  nieuweLetters: ['eeuw', 'ieuw', 'uw'],
  woordenbank: [leeuw, vogel, hamer, banaan, tomaat, ladder, piano, radio, lepel],
  zinnen: [
    { zin: 'De ___ is de koning van de dieren.', doel: leeuw, afleiders: [ladder, radio] },
    { zin: 'De ___ zingt in de boom.', doel: vogel, afleiders: [hamer, lepel] },
    { zin: 'De aap eet een gele ___.', doel: banaan, afleiders: [ladder, piano] },
    { zin: 'Met de ___ slaat papa een spijker in de muur.', doel: hamer, afleiders: [tomaat, vogel] },
    { zin: 'Ik klim op de ___ naar boven.', doel: ladder, afleiders: [banaan, radio] },
  ],
};
