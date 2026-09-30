import type { Kern } from '../../types.ts';

// Themahoofdstuk (na VLL kern 6). Bron: juf-milou.nl werkblad 'Woord bij plaatje' (bronbestanden/plaatje_zin_woord_zwart_wit_g3_1.jpg), uitgesneden met bronbestanden/crop-woordbijplaatje.py, met de lijkt-erop-woorden van het blad.
const pijl = { woord: 'pijl', afbeeldingPad: 'assets/images/woorden/milou/pijl.png', lijktOp: ['bijl', 'pijp'] };
const gras = { woord: 'gras', afbeeldingPad: 'assets/images/woorden/milou/gras.png', lijktOp: ['gas', 'glas'] };
const voet = { woord: 'voet', afbeeldingPad: 'assets/images/woorden/milou/voet.png', lijktOp: ['vier', 'boer'] };
const kooi = { woord: 'kooi', afbeeldingPad: 'assets/images/woorden/milou/kooi.png', lijktOp: ['dooi', 'mooi'] };
const taart = { woord: 'taart', afbeeldingPad: 'assets/images/woorden/milou/taart.png', lijktOp: ['staart', 'traan'] };
const riet = { woord: 'riet', afbeeldingPad: 'assets/images/woorden/milou/riet.png', lijktOp: ['niet', 'riem'] };
const tuin = { woord: 'tuin', afbeeldingPad: 'assets/images/woorden/milou/tuin.png', lijktOp: ['puin', 'tuit'] };
const zing = { woord: 'zing', afbeeldingPad: 'assets/images/woorden/milou/zing.png', lijktOp: ['zin', 'hing'], vereistTekst: true };
const gier = { woord: 'gier', afbeeldingPad: 'assets/images/woorden/milou/gier.png', lijktOp: ['gaar', 'giet'] };
const kar = { woord: 'kar', afbeeldingPad: 'assets/images/woorden/milou/kar.png', lijktOp: ['kaas', 'kat'] };
const weeg = { woord: 'weeg', afbeeldingPad: 'assets/images/woorden/milou/weeg.png', lijktOp: ['weer', 'web'], vereistTekst: true };
const flos = { woord: 'flos', afbeeldingPad: 'assets/images/woorden/milou/flos.png', lijktOp: ['vlok', 'los'], vereistTekst: true };

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
