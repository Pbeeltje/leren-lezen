import { isGedempt } from './audioManager.ts';

// Klanken voor Muziek, gemaakt met Web Audio (geen opnames nodig): een xylofoon (grondtoon
// plus een paar boventonen die snel wegsterven, en een tikje van de stok) en een trommel
// (lage plof plus een ruisje). De AudioContext start pas bij de eerste tik, want browsers
// laten pas geluid toe na een aanraking.

let ctx: AudioContext | null = null;

function context(): AudioContext | null {
  if (isGedempt()) return null;
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

// Do-re-mi tot do (C5-C6). De speel-na-spelletjes gebruiken alleen de vijftonige reeks
// (do re mi sol la): dan klinkt elk willekeurig melodietje vrolijk.
export const TONEN = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.5];
export const VIJFTONIG = [0, 1, 2, 4, 5];

export function speelNoot(toon: number, wanneer = 0): void {
  const c = context();
  if (!c) return;
  const t = c.currentTime + wanneer;
  const uit = c.createGain();
  uit.gain.value = 0.35;
  uit.connect(c.destination);
  // Boventonen van een houten staaf (ongeveer 1 : 3,9 : 9,2), elk met eigen uitsterftijd.
  for (const [factor, sterkte, duur] of [[1, 1, 1.1], [3.93, 0.25, 0.35], [9.2, 0.08, 0.12]]) {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'sine';
    osc.frequency.value = toon * factor;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(sterkte, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duur);
    osc.connect(g).connect(uit);
    osc.start(t);
    osc.stop(t + duur + 0.05);
  }
}

export function speelTrom(wanneer = 0): void {
  const c = context();
  if (!c) return;
  const t = c.currentTime + wanneer;
  // Plof: een sinus die snel van 150 naar 55 Hz zakt.
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.frequency.setValueAtTime(150, t);
  osc.frequency.exponentialRampToValueAtTime(55, t + 0.18);
  g.gain.setValueAtTime(0.9, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
  osc.connect(g).connect(c.destination);
  osc.start(t);
  osc.stop(t + 0.4);
  // Vel: kort ruisje door een bandfilter.
  const lengte = Math.floor(c.sampleRate * 0.12);
  const buffer = c.createBuffer(1, lengte, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < lengte; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / lengte);
  const ruis = c.createBufferSource();
  ruis.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1800;
  const rg = c.createGain();
  rg.gain.value = 0.25;
  ruis.connect(filter).connect(rg).connect(c.destination);
  ruis.start(t);
}

export const STAAF_KLEUREN = ['#e53935', '#fb8c00', '#fdd835', '#43a047', '#00acc1', '#1e88e5', '#5e35b1', '#d81b60'];
