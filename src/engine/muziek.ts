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

export type DrumSoort = 'bas' | 'snare' | 'bekken' | 'tom' | 'crash';

function ruis(c: AudioContext, seconden: number): AudioBufferSourceNode {
  const lengte = Math.floor(c.sampleRate * seconden);
  const buffer = c.createBuffer(1, lengte, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < lengte; i++) data[i] = Math.random() * 2 - 1;
  const bron = c.createBufferSource();
  bron.buffer = buffer;
  return bron;
}

function omhulling(c: AudioContext, t: number, piek: number, duur: number): GainNode {
  const g = c.createGain();
  g.gain.setValueAtTime(piek, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duur);
  g.connect(c.destination);
  return g;
}

// Drumstel: grote trom (lage plof), snaredrum (knal met ruis) en bekken (lang sissen).
export function speelDrum(soort: DrumSoort, wanneer = 0): void {
  const c = context();
  if (!c) return;
  const t = c.currentTime + wanneer;
  if (soort === 'bas') {
    const osc = c.createOscillator();
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.18);
    osc.connect(omhulling(c, t, 1, 0.38));
    osc.start(t);
    osc.stop(t + 0.42);
    const tik = ruis(c, 0.03);
    const f = c.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 1500;
    tik.connect(f).connect(omhulling(c, t, 0.25, 0.03));
    tik.start(t);
  } else if (soort === 'snare') {
    const toon = c.createOscillator();
    toon.type = 'triangle';
    toon.frequency.setValueAtTime(230, t);
    toon.frequency.exponentialRampToValueAtTime(160, t + 0.08);
    toon.connect(omhulling(c, t, 0.5, 0.12));
    toon.start(t);
    toon.stop(t + 0.15);
    const r = ruis(c, 0.25);
    const f = c.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = 1200;
    r.connect(f).connect(omhulling(c, t, 0.55, 0.2));
    r.start(t);
  } else if (soort === 'tom') {
    // Toms: een zingende toon die omlaag zakt, met een tikje erbij.
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(190, t);
    osc.frequency.exponentialRampToValueAtTime(105, t + 0.3);
    osc.connect(omhulling(c, t, 0.9, 0.45));
    osc.start(t);
    osc.stop(t + 0.5);
    const tik = ruis(c, 0.04);
    const f = c.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 900;
    tik.connect(f).connect(omhulling(c, t, 0.3, 0.04));
    tik.start(t);
  } else if (soort === 'crash') {
    // Crash: een harde, brede klap die lang naruist (langer en voller dan het bekken).
    const r = ruis(c, 2.6);
    const hoog = c.createBiquadFilter();
    hoog.type = 'highpass';
    hoog.frequency.value = 2500;
    const glans = c.createBiquadFilter();
    glans.type = 'peaking';
    glans.frequency.value = 6000;
    glans.gain.value = 6;
    r.connect(hoog).connect(glans).connect(omhulling(c, t, 0.6, 2.4));
    r.start(t);
  } else {
    const r = ruis(c, 1.4);
    const hoog = c.createBiquadFilter();
    hoog.type = 'highpass';
    hoog.frequency.value = 5000;
    const glans = c.createBiquadFilter();
    glans.type = 'peaking';
    glans.frequency.value = 9000;
    glans.gain.value = 8;
    r.connect(hoog).connect(glans).connect(omhulling(c, t, 0.4, 1.2));
    r.start(t);
  }
}

export function speelTrom(wanneer = 0): void {
  speelDrum('bas', wanneer);
}

export const STAAF_KLEUREN = ['#e53935', '#fb8c00', '#fdd835', '#43a047', '#00acc1', '#1e88e5', '#5e35b1', '#d81b60'];
