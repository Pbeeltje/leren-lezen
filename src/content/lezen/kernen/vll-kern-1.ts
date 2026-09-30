import type { Kern } from '../../types.ts';
import { bestaand, vll } from './vll-hulp.ts';

// Veilig Leren Lezen maan-versie, kern 1: structuurwoorden maan, roos, vis, ik, sok,
// aan, pen, en (bron: de VLL kern 1-6 overzichtskaart in bronbestanden/). Letters:
// m, aa, n, r, oo, s, v, i, k, o, p, e. ik/aan/en zijn functiewoorden: het VLL-plaatje
// (jongen bij spiegel, lamp, twee bijen) werkt alleen samen met de tekst, dus vereistTekst.
// De korte a komt pas in kern 4 (tak); woorden als arm/ram staan daarom daar.
const maan = vll('maan');
const roos = vll('roos');
const vis = vll('vis');
const ik = vll('ik', true);
const sok = vll('sok');
const aan = vll('aan', true);
const pen = vll('pen');
const en = vll('en', true);
const raam = bestaand('raam', 'svg');
const vaas = bestaand('vaas', 'svg');
const oor = bestaand('oor', 'jpg');
const kip = bestaand('kip', 'svg');
const vos = bestaand('vos', 'svg');
// Extra woorden met Fluent Emoji-plaatjes (MIT), alleen met letters die al bekend zijn.
const kaars = bestaand('kaars', 'svg');
const kroon = bestaand('kroon', 'svg');
const kers = bestaand('kers', 'svg');

export const vllKern1: Kern = {
  id: 'vll-kern-1',
  volgnummer: 1,
  titel: 'maan, roos & vis',
  structuurwoorden: [
    { woord: 'maan', afbeeldingPad: maan.afbeeldingPad, nieuweLetters: ['m', 'aa', 'n'] },
    { woord: 'roos', afbeeldingPad: roos.afbeeldingPad, nieuweLetters: ['r', 'oo', 's'] },
    { woord: 'vis', afbeeldingPad: vis.afbeeldingPad, nieuweLetters: ['v', 'i'] },
    { woord: 'ik', afbeeldingPad: ik.afbeeldingPad, nieuweLetters: ['k'] },
    { woord: 'sok', afbeeldingPad: sok.afbeeldingPad, nieuweLetters: ['o'] },
    { woord: 'aan', afbeeldingPad: aan.afbeeldingPad, nieuweLetters: [] },
    { woord: 'pen', afbeeldingPad: pen.afbeeldingPad, nieuweLetters: ['p', 'e'] },
    { woord: 'en', afbeeldingPad: en.afbeeldingPad, nieuweLetters: [] },
  ],
  nieuweLetters: ['m', 'aa', 'n', 'r', 'oo', 's', 'v', 'i', 'k', 'o', 'p', 'e'],
  woordenbank: [maan, roos, vis, ik, sok, aan, pen, en, raam, vaas, oor, kip, vos, kaars, kroon, kers],
  zinnen: [
    { zin: 'Ik kijk in de spiegel. Daar ben ___!', doel: ik, afleiders: [en, aan] },
    { zin: 'Het is donker. Doe de lamp maar ___.', doel: aan, afleiders: [en, ik] },
    { zin: 'Papa ___ mama gaan samen naar de winkel.', doel: en, afleiders: [ik, aan] },
    { zin: "'s Avonds schijnt de ___ aan de hemel.", doel: maan, afleiders: [roos, vis] },
    { zin: 'In de tuin bloeit een rode ___.', doel: roos, afleiders: [maan, sok] },
    { zin: 'In de vijver zwemt een ___.', doel: vis, afleiders: [maan, roos] },
    { zin: 'Ik schrijf mijn naam met een ___.', doel: pen, afleiders: [sok, vis] },
    { zin: 'Aan mijn voet zit een ___.', doel: sok, afleiders: [pen, roos] },
    { zin: 'Jip kijkt naar buiten door het ___.', doel: raam, afleiders: [vaas, oor] },
    { zin: 'De bloemen staan in de ___.', doel: vaas, afleiders: [raam, roos] },
  ],
};
