import type { Kern } from '../../types.ts';
import { bestaand } from './vll-hulp.ts';

// Themahoofdstuk (na VLL kern 6). Dierentuindieren.
const aap = bestaand('aap', 'jpg');
const olifant = bestaand('olifant', 'svg');
const zebra = bestaand('zebra', 'svg');
const giraf = bestaand('giraf', 'svg');
const panda = bestaand('panda', 'svg');
const kameel = bestaand('kameel', 'svg');
const krokodil = bestaand('krokodil', 'svg');
const das = bestaand('das', 'svg');
const leeuw = bestaand('leeuw', 'svg');
const tijger = bestaand('tijger', 'svg');
const nijlpaard = bestaand('nijlpaard', 'svg');
const neushoorn = bestaand('neushoorn', 'svg');
const slang = bestaand('slang', 'svg');
const flamingo = bestaand('flamingo', 'svg');
const kangoeroe = bestaand('kangoeroe', 'svg');
const zeehond = bestaand('zeehond', 'svg');

export const kern04Dierentuindieren: Kern = {
  id: 'kern-04',
  volgnummer: 9,
  titel: 'dierentuindieren',
  structuurwoorden: [],
  nieuweLetters: [],
  woordenbank: [aap, olifant, zebra, giraf, panda, kameel, krokodil, das, leeuw, tijger, nijlpaard, neushoorn, slang, flamingo, kangoeroe, zeehond],
  zinnen: [
    { zin: 'De ___ is de koning van de dieren.', doel: leeuw, afleiders: [slang, flamingo] },
    { zin: 'De ___ heeft een hele lange nek.', doel: giraf, afleiders: [nijlpaard, kangoeroe] },
    { zin: 'De ___ heeft een lange slurf.', doel: olifant, afleiders: [zebra, giraf] },
    { zin: 'De ___ springt en draagt haar baby in een buidel.', doel: kangoeroe, afleiders: [leeuw, slang] },
    { zin: 'De ___ is roze en staat op één poot.', doel: flamingo, afleiders: [tijger, krokodil] },
    { zin: 'De ___ kruipt over de grond en sist.', doel: slang, afleiders: [kameel, aap] },
    { zin: 'De ___ heeft twee bulten op zijn rug.', doel: kameel, afleiders: [aap, leeuw] },
    { zin: 'De ___ eet bamboe.', doel: panda, afleiders: [krokodil, zeehond] },
  ],
};
