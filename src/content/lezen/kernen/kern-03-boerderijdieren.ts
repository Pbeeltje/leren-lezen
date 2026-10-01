import type { Kern } from '../../types.ts';
import { bestaand } from './vll-hulp.ts';

// Themahoofdstuk (na VLL kern 6). Dieren en dingen op de boerderij. 'lam' is vervangen door 'schaap': het plaatje is een schaap.
const koe = bestaand('koe', 'svg');
const kip = bestaand('kip', 'svg');
const haan = bestaand('haan', 'svg');
const eend = bestaand('eend', 'svg');
const varken = bestaand('varken', 'svg');
const ezel = bestaand('ezel', 'svg');
const paard = bestaand('paard', 'svg');
const schaap = bestaand('schaap', 'svg');
const konijn = bestaand('konijn', 'svg');
const kalkoen = bestaand('kalkoen', 'svg');
const tractor = bestaand('tractor', 'svg');

export const kern03Boerderijdieren: Kern = {
  id: 'kern-03',
  volgnummer: 14,
  titel: 'boerderijdieren',
  structuurwoorden: [],
  nieuweLetters: [],
  woordenbank: [koe, kip, haan, eend, varken, ezel, paard, schaap, konijn, kalkoen, tractor],
  zinnen: [
    { zin: 'De ___ geeft ons melk.', doel: koe, afleiders: [kip, varken] },
    { zin: 'Het ___ rolt in de modder en zegt knor.', doel: varken, afleiders: [schaap, paard] },
    { zin: 'De ___ legt elke dag een ei.', doel: kip, afleiders: [haan, koe] },
    { zin: 'Kukeleku! roept de ___ in de ochtend.', doel: haan, afleiders: [koe, ezel] },
    { zin: 'Het ___ heeft een dikke wollen vacht.', doel: schaap, afleiders: [paard, konijn] },
    { zin: 'De boer rijdt op zijn ___ over het land.', doel: tractor, afleiders: [kip, eend] },
    { zin: 'De ___ zwemt in de sloot en zegt kwak.', doel: eend, afleiders: [kip, kalkoen] },
  ],
};
