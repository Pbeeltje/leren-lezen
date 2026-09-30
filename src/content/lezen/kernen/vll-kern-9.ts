import type { Kern } from '../../types.ts';
import { bestaand } from './vll-hulp.ts';

// Veilig Leren Lezen (2e maan-versie), kern 9. Nieuw: aai, ooi en oei, en woorden van twee lettergrepen (em-mer, kik-ker).
// Letterschema volgens de doelen-posters van juf Inger (2e maanversie) en KlasCement-
// kaarten; kern 7-12 hebben geen eigen kernwoorden, dus de woorden zijn zelf gekozen.
// Plaatjes: Fluent Emoji (MIT), kooi: juf-milou-werkblad.
const haai = bestaand('haai', 'svg');
const kooi = { woord: 'kooi', afbeeldingPad: 'assets/images/woorden/milou/kooi.png' };
const boei = bestaand('boei', 'svg');
const emmer = bestaand('emmer', 'svg');
const kikker = bestaand('kikker', 'svg');
const appel = bestaand('appel', 'svg');
const dolfijn = bestaand('dolfijn', 'svg');
const wortel = bestaand('wortel', 'svg');
const paddenstoel = bestaand('paddenstoel', 'svg');

export const vllKern9: Kern = {
  id: 'vll-kern-9',
  volgnummer: 9,
  titel: 'haai, kooi & boei',
  structuurwoorden: [],
  nieuweLetters: ['aai', 'ooi', 'oei'],
  woordenbank: [haai, kooi, boei, emmer, kikker, appel, dolfijn, wortel, paddenstoel],
  zinnen: [
    { zin: 'De ___ zwemt in de zee en heeft scherpe tanden.', doel: haai, afleiders: [emmer, wortel] },
    { zin: 'De vogel zit in een ___.', doel: kooi, afleiders: [appel, boei] },
    { zin: 'De ___ springt in de sloot: kwak!', doel: kikker, afleiders: [emmer, wortel] },
    { zin: 'Het konijn eet een ___.', doel: wortel, afleiders: [boei, kooi] },
    { zin: 'Ik vul de ___ met water.', doel: emmer, afleiders: [dolfijn, appel] },
  ],
};
