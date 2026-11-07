import { begrensStemmen, naarUit, nieuweStem, ruis } from './klank.ts';

// Mondharmonica, op toonhoogte (een C-harmonica blaast C5-C6 in de gaatjes 4-7). De klank is
// gemeten aan een opname die de eigenaar aanleverde (7 nov, harmonica.mp3, 7-30 s, de
// aangehouden noten D5, F5 en G5): bij alle noten dezelfde verhouding van de boventonen,
// grondtoon, 2e en 3e bijna even sterk, de 4e zachter en daarboven een zacht staartje waarin
// de oneven boventonen sterker zijn dan de even (GEMETEN, in dB).
//
// Precies die verhouding, kaal en stil afgespeeld, brandde in de oren: in de opname zit de
// mondharmonica in een kamer, in een liedje, en beweegt de toon steeds een beetje. Daarom
// (ZACHTER) de 3e boventoon iets zachter en alles vanaf de 4e 6 dB zachter, een vaste zachte
// lowpass rond 3 kHz, boventonen om en om in een andere fase (rondere golf), een zachtere
// aanzet (45 ms), meer galm en iets zachter.
// Geen glijden van onderen in: dat klonk vals bij korte tikken.
const GEMETEN = [0, -4.8, -1.4, -14.2, -28.7, -25.2, -21.9, -29.9, -22.2, -30.7, -21.5, -32.6, -23.3];
const ZACHTER = GEMETEN.map((db, i) => db - (i === 2 ? 3 : i >= 3 ? 6 : 0));

const golven = new Map<number, PeriodicWave>();
function rietGolf(c: AudioContext, f: number): PeriodicWave {
  const bewaard = golven.get(f);
  if (bewaard) return bewaard;
  const n = ZACHTER.length;
  const re = new Float32Array(n + 1);
  const im = new Float32Array(n + 1);
  ZACHTER.forEach((db, i) => {
    if ((i + 1) * f >= 10000) return;
    // Wisselende fase (sinus, cosinus): een rondere golf zonder scherpe piek, zelfde klankkleur.
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
  const duur = 0.95;
  const knip = nieuweStem(c, `mondharmonica:${toon}`, t);
  begrensStemmen('mondharmonica', 3, { sleutel: `mondharmonica:${toon}`, knip, eind: t + duur }, t, 0.03);

  // Blazen: zacht aan, gelijk blijven, aan het eind de adem weg (geen uitsterven zoals een staaf).
  const uit = c.createGain();
  uit.gain.setValueAtTime(0.0001, t);
  uit.gain.exponentialRampToValueAtTime(0.12, t + 0.045);
  uit.gain.setValueAtTime(0.12, t + 0.6);
  uit.gain.exponentialRampToValueAtTime(0.0001, t + duur);

  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.Q.value = 0.5;
  filter.frequency.value = 3000;
  filter.connect(uit);

  // Eén rietje, op toonhoogte, met een heel klein beetje leven (±0,05%, ~1 Hz). Twee rietjes
  // die een paar cent verschillen doven elkaar halverwege de noot uit (een golvende toon).
  const riet = c.createOscillator();
  riet.setPeriodicWave(rietGolf(c, toon));
  riet.frequency.value = toon;
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
  ademFilter.frequency.value = Math.min(3000, toon * 2);
  ademFilter.Q.value = 1;
  const ademG = c.createGain();
  ademG.gain.setValueAtTime(0.0001, t);
  ademG.gain.exponentialRampToValueAtTime(0.015, t + 0.02);
  ademG.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
  adem.connect(ademFilter).connect(ademG).connect(uit);
  adem.start(t);
  adem.stop(t + 0.2);

  naarUit(c, uit.connect(knip), 0.35);
}
