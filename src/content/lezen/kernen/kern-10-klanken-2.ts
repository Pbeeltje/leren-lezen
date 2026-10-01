import type { Kern } from '../../types.ts';

// Themahoofdstuk (na VLL kern 6). Woorden en lijkt-erop-woorden naar een juf-milou-werkblad 'Woord bij plaatje'; plaatjes zijn Fluent Emoji of eigen tekeningen (bronbestanden/teken-woorden.py).
const pijl = { woord: 'pijl', afbeeldingPad: 'assets/images/woorden/pijl.svg', lijktOp: ['bijl', 'pijp'] };
const gras = { woord: 'gras', afbeeldingPad: 'assets/images/woorden/gras.svg', lijktOp: ['gas', 'glas'] };
const voet = { woord: 'voet', afbeeldingPad: 'assets/images/woorden/voet.svg', lijktOp: ['vier', 'boer'] };
const kooi = { woord: 'kooi', afbeeldingPad: 'assets/images/woorden/kooi.svg', lijktOp: ['dooi', 'mooi'] };
const taart = { woord: 'taart', afbeeldingPad: 'assets/images/woorden/taart.svg', lijktOp: ['staart', 'traan'] };
const riet = { woord: 'riet', afbeeldingPad: 'assets/images/woorden/riet.svg', lijktOp: ['niet', 'riem'] };
const tuin = { woord: 'tuin', afbeeldingPad: 'assets/images/woorden/tuin.svg', lijktOp: ['puin', 'tuit'] };
const zing = { woord: 'zing', afbeeldingPad: 'assets/images/woorden/zing.svg', lijktOp: ['zin', 'hing'], vereistTekst: true };
const gier = { woord: 'gier', afbeeldingPad: 'assets/images/woorden/gier.svg', lijktOp: ['gaar', 'giet'] };
const kar = { woord: 'kar', afbeeldingPad: 'assets/images/woorden/kar.svg', lijktOp: ['kaas', 'kat'] };
const weeg = { woord: 'weeg', afbeeldingPad: 'assets/images/woorden/weeg.svg', lijktOp: ['weer', 'web'], vereistTekst: true };
const flos = { woord: 'flos', afbeeldingPad: 'assets/images/woorden/flos.svg', lijktOp: ['vlok', 'los'], vereistTekst: true };

export const kern10Klanken2: Kern = {
  id: 'kern-10',
  volgnummer: 21,
  titel: 'woord bij plaatje',
  structuurwoorden: [],
  nieuweLetters: [],
  woordenbank: [pijl, gras, voet, kooi, taart, riet, tuin, zing, gier, kar, weeg, flos],
  zinnen: [
    { zin: 'Ik ___ een liedje voor oma.', doel: zing, afleiders: [weeg, flos] },
    { zin: 'Op de weegschaal ___ ik mezelf.', doel: weeg, afleiders: [zing, flos] },
    { zin: 'Na het poetsen ___ ik tussen mijn tanden.', doel: flos, afleiders: [zing, weeg] },
    { zin: 'De ___ zit in een kooi.', doel: gier, afleiders: [kar, gras] },
  ],
};
