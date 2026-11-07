import { begrensStemmen, naarUit, nieuweStem, ruis } from './klank.ts';

// Mondharmonica: een doorslaand rietje, op toonhoogte (een C-harmonica blaast C5-C6 in de
// gaatjes 4-7). Het rietje geeft een rijke, zoemende klank: veel boventonen die langzaam
// afnemen, met een bult rond 1,3 kHz (de holte van de handen). Een eigen PeriodicWave per
// toonhoogte (bewaard), een lowpass die bij het aanblazen opengaat, een klein buiginkje
// omhoog, een lichte trilling van de adem (handen-tremolo) en een zuchtje ruis. Hoogstens
// drie gaatjes tegelijk (een akkoord van buurgaatjes mag), anders stapelt glijden op.
const golven = new Map<number, PeriodicWave>();
function rietGolf(c: AudioContext, f: number): PeriodicWave {
  const bewaard = golven.get(f);
  if (bewaard) return bewaard;
  const n = Math.max(2, Math.min(40, Math.floor(9000 / f)));
  const re = new Float32Array(n + 1);
  const im = new Float32Array(n + 1);
  for (let k = 1; k <= n; k++) {
    const hz = k * f;
    const bult = 1 + 1.2 * Math.exp(-(((hz - 1300) / 700) ** 2));
    // Even boventonen iets zwakker: het rietje slaat niet symmetrisch.
    im[k] = (bult * (k % 2 === 0 ? 0.75 : 1)) / Math.pow(k, 1.05);
  }
  const golf = c.createPeriodicWave(re, im);
  golven.set(f, golf);
  return golf;
}

export function speelMondharmonica(c: AudioContext, toon: number, t: number): void {
  const duur = 1.1;
  const knip = nieuweStem(c, `mondharmonica:${toon}`, t);
  begrensStemmen('mondharmonica', 3, { sleutel: `mondharmonica:${toon}`, knip, eind: t + duur }, t, 0.03);

  const uit = c.createGain();
  uit.gain.setValueAtTime(0.0001, t);
  uit.gain.exponentialRampToValueAtTime(0.18, t + 0.035);
  uit.gain.exponentialRampToValueAtTime(0.145, t + 0.2);
  uit.gain.setValueAtTime(0.145, t + 0.6);
  uit.gain.exponentialRampToValueAtTime(0.0001, t + duur);

  // Adem-tremolo: de sterkte golft zacht (5 Hz), pas na het aanblazen.
  const trem = c.createGain();
  trem.gain.value = 1;
  const lfo = c.createOscillator();
  lfo.frequency.value = 5;
  const diepte = c.createGain();
  diepte.gain.setValueAtTime(0, t);
  diepte.gain.linearRampToValueAtTime(0.12, t + 0.3);
  lfo.connect(diepte).connect(trem.gain);
  lfo.start(t);
  lfo.stop(t + duur);

  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.Q.value = 0.7;
  filter.frequency.setValueAtTime(900, t);
  filter.frequency.exponentialRampToValueAtTime(4200, t + 0.06);
  filter.frequency.setTargetAtTime(3000, t + 0.25, 0.3);
  filter.connect(trem).connect(uit);

  const riet = c.createOscillator();
  riet.setPeriodicWave(rietGolf(c, toon));
  riet.frequency.setValueAtTime(toon * 0.975, t);
  riet.frequency.setTargetAtTime(toon, t + 0.01, 0.03);
  riet.start(t);
  riet.stop(t + duur);
  riet.connect(filter);

  // Adem: een zuchtje ruis rond de klank, vooral bij het aanblazen.
  const adem = ruis(c, duur);
  const ademFilter = c.createBiquadFilter();
  ademFilter.type = 'bandpass';
  ademFilter.frequency.value = Math.min(6000, toon * 3);
  ademFilter.Q.value = 1.2;
  const ademG = c.createGain();
  ademG.gain.setValueAtTime(0.0001, t);
  ademG.gain.exponentialRampToValueAtTime(0.05, t + 0.02);
  ademG.gain.exponentialRampToValueAtTime(0.012, t + 0.15);
  ademG.gain.exponentialRampToValueAtTime(0.0001, t + duur);
  adem.connect(ademFilter).connect(ademG).connect(uit);
  adem.start(t);
  adem.stop(t + duur);

  naarUit(c, uit.connect(knip), 0.15);
}
