import type { Kern } from '../../types.ts';
import { bestaand } from './vll-hulp.ts';

// Veilig Leren Lezen (2e maan-versie), kern 8. Nieuw: ch (ook -cht) en nk, woorden met drie medeklinkers (mmkmm) en woorden die op een klinker eindigen.
// Letterschema volgens de doelen-posters van juf Inger (2e maanversie) en KlasCement-
// kaarten; kern 7-12 hebben geen eigen kernwoorden, dus de woorden zijn zelf gekozen.
// Plaatjes: Fluent Emoji (MIT), kooi: juf-milou-werkblad.
const bank = bestaand('bank', 'svg');
const nacht = bestaand('nacht', 'svg');
const spons = bestaand('spons', 'svg');
const web = bestaand('web', 'svg');
const sla = bestaand('sla', 'svg');
const plant = bestaand('plant', 'svg');
const fles = bestaand('fles', 'svg');
const ski = bestaand('ski', 'svg');
const krant = bestaand('krant', 'svg');

export const vllKern8: Kern = {
  id: 'vll-kern-8',
  volgnummer: 8,
  titel: 'bank, nacht & spons',
  structuurwoorden: [],
  nieuweLetters: ['ch', 'nk'],
  woordenbank: [bank, nacht, spons, web, sla, plant, fles, ski, krant],
  zinnen: [
    { zin: 'Opa zit op de ___ en leest.', doel: bank, afleiders: [spons, web] },
    { zin: 'In de ___ zie je de maan en de sterren.', doel: nacht, afleiders: [sla, plant] },
    { zin: 'Met de ___ was ik de auto.', doel: spons, afleiders: [krant, ski] },
    { zin: 'De baby drinkt melk uit een ___.', doel: fles, afleiders: [bank, web] },
    { zin: 'Papa leest de ___ bij het ontbijt.', doel: krant, afleiders: [fles, nacht] },
  ],
};
