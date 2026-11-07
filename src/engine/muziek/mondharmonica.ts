import { begrensStemmen, naarUit, nieuweStem } from './klank.ts';

// Mondharmonica: een warme rietklank, een octaaf lager dan de knoppen (zoals de fluit en de
// trompetten), met een vleugje van het scherpe mondharmonica-geluid. Gekozen door de eigenaar
// uit vijf proeven (7 nov, tests/_tmp/mh-proef.mjs, C:\claude\leren-lezen-mondharmonica-proef):
// "4, octaaf lager warm" plus een beetje van de echte mondharmonica terug.
//
// Geschiedenis: eerst nagemaakt van een opname met een echte mondharmonica (grondtoon, 2e en
// 3e boventoon bijna even sterk, daarboven een staartje met sterke oneven boventonen). Op
// toonhoogte, kaal afgespeeld, was dat te schel, ook met een filter; een octaaf lager met
// zachtere boventonen klinkt rustig. Niet van onderen inglijden: dat klonk vals bij korte
// tikken.
const BOVENTONEN = [0, -7, -8, -19, -26, -28, -30, -34, -32, -36];

const golven = new Map<number, PeriodicWave>();
function rietGolf(c: AudioContext, f: number): PeriodicWave {
  const bewaard = golven.get(f);
  if (bewaard) return bewaard;
  const n = BOVENTONEN.length;
  const re = new Float32Array(n + 1);
  const im = new Float32Array(n + 1);
  BOVENTONEN.forEach((db, i) => {
    if ((i + 1) * f >= 10000) return;
    // Om en om sinus en cosinus: een rondere golf zonder scherpe piek, zelfde klankkleur.
    const a = Math.pow(10, db / 20);
    if (i % 2) re[i + 1] = a;
    else im[i + 1] = a;
  });
  const golf = c.createPeriodicWave(re, im);
  golven.set(f, golf);
  return golf;
}

// Drie gaatjes tegelijk mag (een akkoord van buurgaatjes), anders stapelt glijden op.
export function speelMondharmonica(c: AudioContext, toon: number, t: number): void {
  const f = toon * 0.5;
  const duur = 0.95;
  const knip = nieuweStem(c, `mondharmonica:${toon}`, t);
  begrensStemmen('mondharmonica', 3, { sleutel: `mondharmonica:${toon}`, knip, eind: t + duur }, t, 0.03);

  // Blazen: zacht aan, gelijk blijven, aan het eind de adem weg (geen uitsterven zoals een staaf).
  const uit = c.createGain();
  uit.gain.setValueAtTime(0.0001, t);
  uit.gain.exponentialRampToValueAtTime(0.12, t + 0.06);
  uit.gain.setValueAtTime(0.12, t + 0.6);
  uit.gain.exponentialRampToValueAtTime(0.0001, t + duur);

  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.Q.value = 0.5;
  filter.frequency.value = 1800;
  filter.connect(uit);

  const riet = c.createOscillator();
  riet.setPeriodicWave(rietGolf(c, f));
  riet.frequency.value = f;
  // Een lichte vibrato (5 Hz, ±0,25%) die pas bij langere noten aanzwelt.
  const vib = c.createOscillator();
  vib.frequency.value = 5;
  const vibG = c.createGain();
  vibG.gain.setValueAtTime(0, t);
  vibG.gain.linearRampToValueAtTime(f * 0.0025, t + 0.35);
  vib.connect(vibG).connect(riet.frequency);
  for (const o of [riet, vib]) {
    o.start(t);
    o.stop(t + duur);
  }
  riet.connect(filter);

  naarUit(c, uit.connect(knip), 0.3);
}
