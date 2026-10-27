import { nieuweStem, naarUit, ruis, omhulling } from './klank.ts';

// Trompet (heraut): de klankkleur komt uit een opname van echte trompetten. Daarin zijn de
// boventonen tot ~3 kHz bijna even sterk als de grondtoon (met een bult rond 1,9 kHz), en
// daarboven zakken ze ~20 dB per octaaf. KOPERKLEUR is die curve (Hz, dB); elke toon krijgt
// een eigen golfvorm met die boventonen. Een filter dat in 40 ms opengaat laat de hoge
// boventonen net na de lage binnenkomen (het koperen aanblazen), de lippen zetten de toon
// iets te laag in, en er is meteen een licht vibrato (±10 cent, 5,3 Hz) zoals in de opname.
// Twee stemmen een paar cent uit elkaar klinken als een groepje trompetten. Weinig galm.
const KOPERKLEUR = [
  [0, -7], [700, -7], [1000, -4], [1900, -1], [2400, -5], [3000, -6],
  [3500, -11], [4500, -17], [6000, -23], [8000, -32], [11000, -38],
] as const;
const koperGolven = new Map<number, PeriodicWave>();
function koperGolf(c: AudioContext, f: number): PeriodicWave {
  const bewaard = koperGolven.get(f);
  if (bewaard) return bewaard;
  const n = Math.max(2, Math.floor(11000 / f));
  const re = new Float32Array(n + 1);
  const im = new Float32Array(n + 1);
  for (let k = 1; k <= n; k++) {
    const hz = k * f;
    let i = 1;
    while (i < KOPERKLEUR.length - 1 && KOPERKLEUR[i][0] < hz) i++;
    const [f1, d1] = KOPERKLEUR[i - 1];
    const [f2, d2] = KOPERKLEUR[i];
    const db = d1 + ((d2 - d1) * (hz - f1)) / (f2 - f1);
    im[k] = Math.pow(10, db / 20);
  }
  const golf = c.createPeriodicWave(re, im);
  koperGolven.set(f, golf);
  return golf;
}

export function speelTrompet(c: AudioContext, toon: number, t: number): void {
  const f = toon * 0.5;
  const duur = 0.85;
  const eind = t + duur;

  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.Q.value = 0.7;
  filter.frequency.setValueAtTime(f * 2, t);
  filter.frequency.exponentialRampToValueAtTime(12000, t + 0.04);
  filter.frequency.setValueAtTime(12000, eind - 0.15);
  filter.frequency.exponentialRampToValueAtTime(f * 3, eind);

  const env = c.createGain();
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(1, t + 0.03);
  env.gain.linearRampToValueAtTime(0.9, t + 0.12);
  env.gain.setValueAtTime(0.9, eind - 0.15);
  env.gain.exponentialRampToValueAtTime(0.0001, eind);

  const trilling = c.createOscillator();
  trilling.frequency.value = 5.3;
  const trilDiepte = c.createGain();
  trilDiepte.gain.setValueAtTime(0, t);
  trilDiepte.gain.setValueAtTime(0, t + 0.08);
  trilDiepte.gain.linearRampToValueAtTime(10, t + 0.3);
  trilling.connect(trilDiepte);

  const stemmen = [-5, 5].map((cent) => {
    const osc = c.createOscillator();
    osc.setPeriodicWave(koperGolf(c, f));
    osc.detune.value = cent;
    osc.frequency.setValueAtTime(f * 0.96, t);
    osc.frequency.exponentialRampToValueAtTime(f, t + 0.035);
    trilDiepte.connect(osc.detune);
    osc.connect(filter);
    return osc;
  });

  filter.connect(env);
  const uit = c.createGain();
  uit.gain.value = 0.19;
  env.connect(uit);
  naarUit(c, uit.connect(nieuweStem(c, `trompet:${toon}`, t)), 0.12);

  // Een zuchtje adem bij het aanzetten.
  const adem = ruis(c, 0.07);
  const ademFilter = c.createBiquadFilter();
  ademFilter.type = 'bandpass';
  ademFilter.frequency.value = 2500;
  ademFilter.Q.value = 0.8;
  adem.connect(ademFilter).connect(omhulling(c, t, 0.05, 0.07));
  adem.start(t);

  for (const o of [...stemmen, trilling]) {
    o.start(t);
    o.stop(eind + 0.05);
  }
}
