import type { Kern } from '../../types.ts';
import { bestaand } from './vll-hulp.ts';

// Themahoofdstuk (na VLL kern 6). Spullen in huis en een paar lichaamsdelen.
const schaar = bestaand('schaar', 'svg');
const lepel = bestaand('lepel', 'svg');
const kopje = bestaand('kopje', 'svg');
const bad = bestaand('bad', 'svg');
const douche = bestaand('douche', 'svg');
const spiegel = bestaand('spiegel', 'svg');
const telefoon = bestaand('telefoon', 'svg');
const tandenborstel = bestaand('tandenborstel', 'svg');
const tong = bestaand('tong', 'svg');
const duim = bestaand('duim', 'svg');
const vinger = bestaand('vinger', 'svg');

export const kern05SpullenEnLijf: Kern = {
  id: 'kern-05',
  volgnummer: 16,
  titel: 'spullen & lijf',
  structuurwoorden: [],
  nieuweLetters: [],
  woordenbank: [schaar, lepel, kopje, bad, douche, spiegel, telefoon, tandenborstel, tong, duim, vinger],
  zinnen: [
    { zin: 'Met de ___ knip ik papier.', doel: schaar, afleiders: [lepel, spiegel] },
    { zin: 'Ik eet mijn soep met een ___.', doel: lepel, afleiders: [schaar, duim] },
    { zin: '\'s Avonds poets ik mijn tanden met mijn ___.', doel: tandenborstel, afleiders: [telefoon, lepel] },
    { zin: 'In de ___ kijk ik naar mezelf.', doel: spiegel, afleiders: [bad, kopje] },
    { zin: 'Oma belt ons op met de ___.', doel: telefoon, afleiders: [spiegel, schaar] },
    { zin: 'Ik zit in het warme ___ met veel schuim.', doel: bad, afleiders: [telefoon, schaar] },
    { zin: 'Ik steek mijn ___ uit bij de dokter: aaa!', doel: tong, afleiders: [spiegel, kopje] },
  ],
};
