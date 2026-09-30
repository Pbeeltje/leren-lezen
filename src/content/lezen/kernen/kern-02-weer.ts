import type { Kern } from '../../types.ts';
import { bestaand } from './vll-hulp.ts';

// Themahoofdstuk (na VLL kern 6). Alle weerwoorden samen (vroeger verdeeld over twee hoofdstukken).
const zon = bestaand('zon', 'jpg');
const regen = bestaand('regen', 'svg');
const nat = bestaand('nat', 'svg', true);
const wind = bestaand('wind', 'svg');
const wolk = bestaand('wolk', 'svg');
const koud = bestaand('koud', 'svg', true);
const regenboog = bestaand('regenboog', 'svg');
const paraplu = bestaand('paraplu', 'svg');
const onweer = bestaand('onweer', 'svg');
const bliksem = bestaand('bliksem', 'svg');
const sneeuw = bestaand('sneeuw', 'svg');
const hagel = bestaand('hagel', 'svg', true);

export const kern02Weer: Kern = {
  id: 'kern-02',
  volgnummer: 7,
  titel: 'weer',
  structuurwoorden: [],
  nieuweLetters: [],
  woordenbank: [zon, regen, nat, wind, wolk, koud, regenboog, paraplu, onweer, bliksem, sneeuw, hagel],
  zinnen: [
    { zin: 'Na de regen staat er een ___ in de lucht, met alle kleuren.', doel: regenboog, afleiders: [paraplu, wolk] },
    { zin: 'Het regent. Neem je ___ mee!', doel: paraplu, afleiders: [regenboog, zon] },
    { zin: 'Ik speel buiten in de regen. Nu ben ik helemaal ___.', doel: nat, afleiders: [zon, wolk] },
    { zin: 'In de winter is het buiten ___.', doel: koud, afleiders: [zon, wolk] },
    { zin: 'Er vallen kleine balletjes ijs uit de lucht. Dat is ___.', doel: hagel, afleiders: [onweer, regenboog] },
    { zin: 'Het flitst en het rommelt. Het is ___.', doel: onweer, afleiders: [regenboog, zon] },
    { zin: 'Een fel licht flitst door de lucht: dat is de ___.', doel: bliksem, afleiders: [paraplu, wolk] },
    { zin: 'Alles is wit, want er ligt ___.', doel: sneeuw, afleiders: [zon, wind] },
    { zin: 'De ___ blaast mijn pet van mijn hoofd.', doel: wind, afleiders: [zon, wolk] },
    { zin: 'De ___ schijnt en het is lekker warm.', doel: zon, afleiders: [wolk, regen] },
  ],
};
