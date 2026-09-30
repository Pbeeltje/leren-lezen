import type { Kern } from '../../types.ts';
import { bestaand } from './vll-hulp.ts';

// Veilig Leren Lezen (2e maan-versie), kern 12. Kern 12: niets nieuws, 'kilometers lezen': herhaling van woorden uit kern 7-11.
// Letterschema volgens de doelen-posters van juf Inger (2e maanversie) en KlasCement-
// kaarten; kern 7-12 hebben geen eigen kernwoorden, dus de woorden zijn zelf gekozen.
// Plaatjes: Fluent Emoji (MIT), kooi: juf-milou-werkblad.
const schoen = bestaand('schoen', 'svg');
const ring = bestaand('ring', 'svg');
const slang = bestaand('slang', 'svg');
const spin = bestaand('spin', 'svg');
const bank = bestaand('bank', 'svg');
const nacht = bestaand('nacht', 'svg');
const fles = bestaand('fles', 'svg');
const kikker = bestaand('kikker', 'svg');
const dolfijn = bestaand('dolfijn', 'svg');
const haai = bestaand('haai', 'svg');
const leeuw = bestaand('leeuw', 'svg');
const banaan = bestaand('banaan', 'svg');
const tomaat = bestaand('tomaat', 'svg');
const koning = bestaand('koning', 'svg');
const schildpad = bestaand('schildpad', 'svg');
const aardbei = bestaand('aardbei', 'svg');

export const vllKern12: Kern = {
  id: 'vll-kern-12',
  volgnummer: 12,
  titel: 'herhaling',
  structuurwoorden: [],
  nieuweLetters: [],
  woordenbank: [schoen, ring, slang, spin, bank, nacht, fles, kikker, dolfijn, haai, leeuw, banaan, tomaat, koning, schildpad, aardbei],
  zinnen: [
    { zin: 'In de ___ slaap ik in mijn bed.', doel: nacht, afleiders: [schoen, tomaat] },
    { zin: 'De ___ zwemt in de zee en springt hoog.', doel: dolfijn, afleiders: [leeuw, koning] },
  ],
};
