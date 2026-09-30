import type { Kern } from '../../types.ts';
import { bestaand } from './vll-hulp.ts';

// Veilig Leren Lezen (2e maan-versie), kern 7. Nieuw: sch en ng, en woorden met twee medeklinkers vooraan of achteraan (mmkm/mkmm).
// Letterschema volgens de doelen-posters van juf Inger (2e maanversie) en KlasCement-
// kaarten; kern 7-12 hebben geen eigen kernwoorden, dus de woorden zijn zelf gekozen.
// Plaatjes: Fluent Emoji (MIT), kooi: juf-milou-werkblad.
const schoen = bestaand('schoen', 'svg');
const schaap = bestaand('schaap', 'svg');
const schip = bestaand('schip', 'svg');
const schaar = bestaand('schaar', 'svg');
const schelp = bestaand('schelp', 'svg');
const school = bestaand('school', 'svg');
const ring = bestaand('ring', 'svg');
const slang = bestaand('slang', 'svg');
const spin = bestaand('spin', 'svg');
const krab = bestaand('krab', 'svg');
const broek = bestaand('broek', 'svg');
const kraan = bestaand('kraan', 'svg');
const strik = bestaand('strik', 'svg');
const kerk = bestaand('kerk', 'svg');
const voetbal = bestaand('voetbal', 'svg');

export const vllKern7: Kern = {
  id: 'vll-kern-7',
  volgnummer: 7,
  titel: 'schoen, ring & slang',
  structuurwoorden: [],
  nieuweLetters: ['sch', 'ng'],
  woordenbank: [schoen, schaap, schip, schaar, schelp, school, ring, slang, spin, krab, broek, kraan, strik, kerk, voetbal],
  zinnen: [
    { zin: 'Ik doe mijn ___ aan mijn voet.', doel: schoen, afleiders: [ring, kerk] },
    { zin: 'Het ___ heeft een wollen vacht.', doel: schaap, afleiders: [schip, krab] },
    { zin: 'Mama draagt een gouden ___ om haar vinger.', doel: ring, afleiders: [strik, slang] },
    { zin: 'Met de ___ knip ik een plaatje uit.', doel: schaar, afleiders: [schoen, krab] },
    { zin: 'Op het strand vind ik een mooie ___.', doel: schelp, afleiders: [broek, kerk] },
    { zin: 'De ___ maakt een web.', doel: spin, afleiders: [schip, school] },
  ],
};
