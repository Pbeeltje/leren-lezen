import { begrensStemmen, naarUit, nieuweStem, ruis } from './klank.ts';

// Mondharmonica, op toonhoogte (een C-harmonica blaast C5-C6 in de gaatjes 4-7). De klank is
// gemeten aan een opname die de eigenaar aanleverde (7 nov, harmonica.mp3, 7-30 s, de
// aangehouden noten D5, F5 en G5): bij alle noten dezelfde verhouding van de boventonen,
// grondtoon, 2e en 3e bijna even sterk, de 4e zachter en daarboven een zacht staartje waarin
// de oneven boventonen sterker zijn dan de even. Dat staat als dB in BOVENTONEN; rietGolf()
// maakt er per toonhoogte een PeriodicWave van (bewaard). Verder uit de opname: de grondtoon
// staat er in ~25 ms, de boventonen komen ~20 ms later (lowpass die opengaat), de toon blijft
// tijdens het blazen even sterk (geen tremolo, geen vibrato, alleen een heel klein beetje
// dwalen van ±5 cent) en sommige noten glijden van onderen in. Een vorige versie had veel
// meer hoge boventonen en een tremolo; die klonk schel.
const BOVENTONEN = [0, -4.8, -1.4, -14.2, -28.7, -25.2, -21.9, -29.9, -22.2, -30.7, -21.5, -32.6, -23.3];

const golven = new Map<number, PeriodicWave>();
function rietGolf(c: AudioContext, f: number): PeriodicWave {
  const bewaard = golven.get(f);
  if (bewaard) return bewaard;
  const n = BOVENTONEN.length;
  const re = new Float32Array(n + 1);
  const im = new Float32Array(n + 1);
  BOVENTONEN.forEach((db, i) => {
    // Niet boven 12 kHz (hoge do: tot de 11e boventoon).
    if ((i + 1) * f < 12000) im[i + 1] = Math.pow(10, db / 20);
  });
  const golf = c.createPeriodicWave(re, im);
  golven.set(f, golf);
  return golf;
}

// Drie gaatjes tegelijk mag (een akkoord van buurgaatjes), anders stapelt glijden op.
export function speelMondharmonica(c: AudioContext, toon: number, t: number): void {
  const duur = 0.95;
  const knip = nieuweStem(c, `mondharmonica:${toon}`, t);
  begrensStemmen('mondharmonica', 3, { sleutel: `mondharmonica:${toon}`, knip, eind: t + duur }, t, 0.03);

  // Blazen: snel aan, gelijk blijven, aan het eind de adem weg (geen uitsterven zoals een staaf).
  const uit = c.createGain();
  uit.gain.setValueAtTime(0.0001, t);
  uit.gain.exponentialRampToValueAtTime(0.2, t + 0.025);
  uit.gain.setValueAtTime(0.2, t + 0.62);
  uit.gain.exponentialRampToValueAtTime(0.0001, t + duur);

  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.Q.value = 0.5;
  filter.frequency.setValueAtTime(toon * 1.6, t);
  filter.frequency.exponentialRampToValueAtTime(14000, t + 0.05);
  filter.connect(uit);

  const riet = c.createOscillator();
  riet.setPeriodicWave(rietGolf(c, toon));
  // Meteen op toonhoogte. Het glijden van onderen in uit de opname (3% laag) en het dwalen
  // (±0,3%) klonken bij korte tikken vals; nu alleen een heel klein beetje leven (±0,05%).
  riet.frequency.setValueAtTime(toon, t);
  const dwaal = c.createOscillator();
  dwaal.frequency.value = 0.9 + Math.random() * 0.6;
  const dwaalG = c.createGain();
  dwaalG.gain.value = toon * 0.0005;
  dwaal.connect(dwaalG).connect(riet.frequency);
  for (const o of [riet, dwaal]) {
    o.start(t);
    o.stop(t + duur);
  }
  riet.connect(filter);

  // Een zacht zuchtje adem bij het aanblazen.
  const adem = ruis(c, 0.2);
  const ademFilter = c.createBiquadFilter();
  ademFilter.type = 'bandpass';
  ademFilter.frequency.value = Math.min(5000, toon * 3);
  ademFilter.Q.value = 1;
  const ademG = c.createGain();
  ademG.gain.setValueAtTime(0.0001, t);
  ademG.gain.exponentialRampToValueAtTime(0.025, t + 0.012);
  ademG.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
  adem.connect(ademFilter).connect(ademG).connect(uit);
  adem.start(t);
  adem.stop(t + 0.2);

  naarUit(c, uit.connect(knip), 0.15);
}
