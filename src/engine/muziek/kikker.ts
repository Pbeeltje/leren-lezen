import { nieuweStem, naarUit, ruis, omhulling } from './klank.ts';

// Kikkerkoor: elke tik is één kikker met één kwaak. Een kwaak is een zoemende stem
// (zaagtand op de toon, een octaaf lager) die snel aan en uit ratelt, door een "mond"
// (twee filters) die opengaat en weer dichtgaat: k-wa-ak. Elke kikker heeft zijn eigen
// ratel en mond: do is een dikke brulkikker, de hoge do een klein boomkikkertje.
const KWAKEN = [
  { ratel: 21, duur: 0.32, mond: 520 },
  { ratel: 25, duur: 0.29, mond: 580 },
  { ratel: 29, duur: 0.27, mond: 660 },
  { ratel: 23, duur: 0.26, mond: 620 },
  { ratel: 33, duur: 0.23, mond: 740 },
  { ratel: 37, duur: 0.21, mond: 820 },
  { ratel: 42, duur: 0.19, mond: 900 },
  { ratel: 47, duur: 0.17, mond: 980 },
];
let ratelGolf: PeriodicWave | null = null;

export function speelKikker(c: AudioContext, toon: number, t: number, nr: number): void {
  const k = KWAKEN[nr];
  const los = 1 + (Math.random() - 0.5) * 0.08; // geen twee kwaken precies gelijk
  const f = toon / 2;
  const duur = k.duur * los;
  const eind = t + duur;

  const stem = c.createOscillator();
  stem.type = 'sawtooth';
  stem.frequency.setValueAtTime(f * 0.84, t);
  stem.frequency.exponentialRampToValueAtTime(f, t + 0.04);
  stem.frequency.setValueAtTime(f, t + duur * 0.65);
  stem.frequency.exponentialRampToValueAtTime(f * 0.86, eind);

  // Ratel: korte stootjes (een golf met smalle toppen) zetten de stem aan en uit.
  ratelGolf ??= c.createPeriodicWave(new Float32Array([0, 1, 0.75, 0.45, 0.2]), new Float32Array(5));
  const ratel = c.createGain();
  ratel.gain.value = 0.23;
  const lfo = c.createOscillator();
  lfo.setPeriodicWave(ratelGolf);
  lfo.frequency.value = k.ratel * los;
  const diepte = c.createGain();
  diepte.gain.value = 0.77;
  lfo.connect(diepte).connect(ratel.gain);
  stem.connect(ratel);

  const env = c.createGain();
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(1, t + 0.015);
  env.gain.setValueAtTime(1, t + duur * 0.6);
  env.gain.exponentialRampToValueAtTime(0.0001, eind);

  // Mond: de eerste formant gaat open (wa) en weer half dicht (ak); de tweede geeft kraak.
  const mond = c.createBiquadFilter();
  mond.type = 'bandpass';
  mond.Q.value = 2.5;
  mond.frequency.setValueAtTime(k.mond * 0.6, t);
  mond.frequency.exponentialRampToValueAtTime(k.mond, t + duur * 0.35);
  mond.frequency.exponentialRampToValueAtTime(k.mond * 0.75, eind);
  const kraak = c.createBiquadFilter();
  kraak.type = 'bandpass';
  kraak.Q.value = 6;
  kraak.frequency.value = k.mond * 2.1;
  const lijf = c.createBiquadFilter();
  lijf.type = 'lowpass';
  lijf.frequency.value = f * 3;
  for (const [filter, sterkte] of [[mond, 1.1], [kraak, 0.45], [lijf, 0.35]] as const) {
    const g = c.createGain();
    g.gain.value = sterkte;
    ratel.connect(filter).connect(g).connect(env);
  }
  const uit = c.createGain();
  uit.gain.value = 0.65;
  env.connect(uit);
  naarUit(c, uit.connect(nieuweStem(c, `kikker:${toon}`, t)), 0.25);

  // De k van kwaak: een tikje ruis.
  const tik = ruis(c, 0.03);
  const tikFilter = c.createBiquadFilter();
  tikFilter.type = 'bandpass';
  tikFilter.frequency.value = 1900;
  tikFilter.Q.value = 1.5;
  tik.connect(tikFilter).connect(omhulling(c, t, 0.14, 0.03));
  tik.start(t);

  for (const o of [stem, lfo]) {
    o.start(t);
    o.stop(eind + 0.05);
  }
}
