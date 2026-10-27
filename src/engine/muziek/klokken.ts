import { uitgang, nieuweStem, begrensStemmen, maakGalm, ruis, omhulling } from './klank.ts';

// Klokken: een koperen klok is een stel sinussen die niet netjes boven elkaar liggen (de
// "zoem" een octaaf lager, de slagtoon, een kleine terts erboven, ...), elk met een eigen
// uitsterftijd: de hoge glans is snel weg, de zoem blijft hangen. Twee bijna gelijke
// slagtonen zweven tegen elkaar (het zingende), en de klepel geeft een tikje.
const KLOK_DELEN: [number, number, number][] = [
  // [factor, sterkte, uitsterftijd in s]
  [0.5, 0.2, 2.6],
  [1, 0.9, 2.3],
  [1.0035, 0.45, 2.1],
  [2, 0.4, 1.3],
  [2.4, 0.2, 0.9],
  [3, 0.17, 0.7],
  [4.2, 0.1, 0.4],
  [5.4, 0.07, 0.25],
  [6.8, 0.04, 0.16],
];

// Eigen galm voor de klokken: wat langer en donkerder dan de kamergalm (zie maakGalm).
const klokGalm = (c: AudioContext): GainNode => maakGalm(c, 'klok', { seconden: 2, macht: 4, sterkte: 0.16, donker: 3200 });

// Hoogstens vijf klokken tegelijk: glijden over het hele rek liet anders acht lange klanken
// (plus galm) op elkaar stapelen. De oudste dooft dan snel uit.
const KLOK_MAX = 5;

export function speelKlok(c: AudioContext, toon: number, t: number, nr: number): void {
  const lang = 1.15 - nr * 0.05; // grote klokken klinken langer
  const duur = 2.6 * lang;

  const knip = nieuweStem(c, `klokken:${toon}`, t);
  begrensStemmen('klokken', KLOK_MAX, { sleutel: `klokken:${toon}`, knip, eind: t + duur }, t, 0.08);

  const uit = c.createGain();
  uit.gain.value = 0.26;
  uit.connect(knip);
  knip.connect(uitgang(c));
  knip.connect(klokGalm(c));

  for (const [factor, sterkte, tijd] of KLOK_DELEN) {
    const osc = c.createOscillator();
    osc.frequency.value = toon * factor;
    const g = c.createGain();
    const weg = Math.min(duur, tijd * lang);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(sterkte, t + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, t + weg);
    osc.connect(g).connect(uit);
    osc.start(t);
    osc.stop(t + weg + 0.05);
  }

  // Het tikje van de klepel op het koper.
  const tik = ruis(c, 0.03);
  const tikFilter = c.createBiquadFilter();
  tikFilter.type = 'highpass';
  tikFilter.frequency.value = 3500;
  tik.connect(tikFilter).connect(omhulling(c, t, 0.08, 0.03));
  tik.start(t);
}
