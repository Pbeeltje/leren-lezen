import type { Kern } from '../../types.ts';

// Veilig Leren Lezen, maan-versie (1991): de eerste kern introduceert de
// structuurwoorden maan, roos en vis (m/a/n, r/o/s, v/i). Met die 8 letters
// bekend is er genoeg klankzuiver materiaal voor een gemengde woordenbank van
// 10 woorden — zie engine/oefeningGenerator.ts voor hoe daaruit een gemengde
// oefen-/toetssessie wordt samengesteld (oefenen: 5 willekeurige woorden, elk
// met een ander oefentype; toets: alle 10 woorden, elk 1x = 10 vragen).
const pad = (woord: string, ext = 'svg') => `/assets/images/woorden/${woord}.${ext}`;
const woord = (w: string, ext = 'svg') => ({ woord: w, afbeeldingPad: pad(w, ext) });

// maan/roos/vis/arm/oor gebruiken de echte foto's uit de Larsen woordpuzzel resp.
// Circuitspelletjes-memory (bronbestanden/), uitgesneden met bronbestanden/crop.ps1 —
// geen generieke iconen, zie de sessienotities over "gebruik mijn eigen plaatjes".
const maan = woord('maan', 'jpg');
const roos = woord('roos', 'jpg');
const vis = woord('vis', 'jpg');
const raam = woord('raam');
const arm = woord('arm', 'jpg');
const oma = woord('oma');
const mais = woord('mais');
const vaas = woord('vaas');
const oor = woord('oor', 'jpg');
// 'mars' (met een chocoladereep-icoon) las eerder te makkelijk als "chocolade" i.p.v.
// het beoogde woord — geen goede plaatje-woordmatch zonder een merkspecifieke wikkel na
// te bootsen. Vervangen door 'ram' (het dier), een ondubbelzinnig plaatje.
const ram = woord('ram');

export const kern01MaanRoosVis: Kern = {
  id: 'kern-01',
  volgnummer: 1,
  titel: 'maan, roos & vis',
  structuurwoorden: [
    { woord: 'maan', afbeeldingPad: pad('maan', 'jpg'), nieuweLetters: ['m', 'a', 'n'] },
    { woord: 'roos', afbeeldingPad: pad('roos', 'jpg'), nieuweLetters: ['r', 'o', 's'] },
    { woord: 'vis', afbeeldingPad: pad('vis', 'jpg'), nieuweLetters: ['v', 'i'] },
  ],
  nieuweLetters: ['m', 'a', 'n', 'r', 'o', 's', 'v', 'i'],
  woordenbank: [maan, roos, vis, raam, arm, oma, mais, vaas, oor, ram],
  // Zinnen mogen woorden buiten het bekende-letters-bereik bevatten (die leest een
  // ouder/oudere leerling eventueel voor of het kind herkent ze op het plaatje) —
  // alleen het doelwoord zelf moet uit de woordenbank komen.
  zinnen: [
    { zin: "'s Avonds schijnt de ___ aan de hemel.", doel: maan, afleiders: [roos, vis] },
    { zin: 'Oma geeft opa een mooie ___.', doel: roos, afleiders: [maan, vaas] },
    { zin: 'In de vijver zwemt een ___.', doel: vis, afleiders: [maan, roos] },
    { zin: 'Jip kijkt naar buiten door het ___.', doel: raam, afleiders: [vaas, oor] },
    { zin: 'Papa tilt de doos met zijn sterke ___.', doel: arm, afleiders: [oor, raam] },
    { zin: 'Op zondag gaan we op bezoek bij ___.', doel: oma, afleiders: [arm, ram] },
    { zin: 'Op de boerderij groeit gele ___.', doel: mais, afleiders: [roos, vaas] },
    { zin: 'De bloemen staan in de ___.', doel: vaas, afleiders: [raam, roos] },
    { zin: 'Het konijn heeft een lang ___.', doel: oor, afleiders: [arm, ram] },
    { zin: 'In de wei staat een ___.', doel: ram, afleiders: [mais, vaas] },
  ],
};
