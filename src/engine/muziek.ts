import { isGedempt } from './audioManager.ts';
import { bijZichtbaarheid, paginaZichtbaar } from './zichtbaarheid.ts';

// Klanken voor Muziek, gemaakt met Web Audio (geen opnames nodig): een xylofoon (grondtoon
// plus een paar boventonen die snel wegsterven, en een tikje van de stok) en een trommel
// (lage plof plus een ruisje). De AudioContext start pas bij de eerste tik, want browsers
// laten pas geluid toe na een aanraking.

let ctx: AudioContext | null = null;
let hervatNaTonen = false;

bijZichtbaarheid((aan) => {
  if (!ctx) return;
  if (!aan) {
    if (ctx.state === 'running') hervatNaTonen = true;
    void ctx.suspend();
    return;
  }
  if (!hervatNaTonen) return;
  hervatNaTonen = false;
  if (!isGedempt() && ctx.state === 'suspended') void ctx.resume();
});

function context(): AudioContext | null {
  if (isGedempt()) return null;
  if (!ctx) ctx = new AudioContext();
  if (!paginaZichtbaar()) {
    hervatNaTonen = true;
    return ctx;
  }
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

// Melodie-instrumenten: de xylofoon is gratis, de rest koop je in de winkel. Ze spelen
// dezelfde acht tonen (en dus dezelfde liedjes bij Speel na) met hun eigen klank.
export type Instrument = 'xylofoon' | 'harp' | 'fluit' | 'keyboard' | 'kikkerkoor';
export const INSTRUMENTEN: { id: Instrument; naam: string; icoon: string }[] = [
  { id: 'xylofoon', naam: 'Xylofoon', icoon: 'assets/icons/xylofoon.svg' },
  { id: 'harp', naam: 'Harp', icoon: 'assets/icons/harp.svg' },
  { id: 'fluit', naam: 'Fluit', icoon: 'assets/icons/fluit.svg' },
  { id: 'keyboard', naam: 'Keyboard', icoon: 'assets/icons/keyboard.svg' },
  { id: 'kikkerkoor', naam: 'Kikkerkoor', icoon: 'assets/icons/kikker.svg' },
];

// Harp: Karplus-Strong, een octaaf lager dan de xylofoon. Een kort stukje ruis dat
// telkens na één trillingsperiode zachter terugkomt (drie-taps-lus). Daarna een
// filter dat dichtdraait: eerst de pluk, dan een warme toon.
const HARP = { octaaf: 0.5, demping: 0.9965, helder: 0.1, duur: 1.6, sterkte: 0.72, filterBegin: 1700, filterEind: 800 };

// Een beetje galm (zoals in een kamer) voor de snaren en het keyboard; één keer gemaakt.
let galmIn: GainNode | null = null;
function galm(c: AudioContext): GainNode {
  if (galmIn) return galmIn;
  const lengte = Math.floor(c.sampleRate * 1.4);
  const impuls = c.createBuffer(2, lengte, c.sampleRate);
  for (let kanaal = 0; kanaal < 2; kanaal++) {
    const d = impuls.getChannelData(kanaal);
    for (let i = 0; i < lengte; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / lengte, 3);
  }
  const zaal = c.createConvolver();
  zaal.buffer = impuls;
  galmIn = c.createGain();
  galmIn.gain.value = 0.22;
  galmIn.connect(zaal).connect(c.destination);
  return galmIn;
}

// galmMate: hoeveel van de gedeelde galm dit instrument krijgt (1 = alles).
function naarUit(c: AudioContext, knoop: AudioNode, galmMate = 1): void {
  knoop.connect(c.destination);
  const mate = c.createGain();
  mate.gain.value = galmMate;
  knoop.connect(mate).connect(galm(c));
}
const snaarBuffers = new Map<string, AudioBuffer>();

function snaarBuffer(c: AudioContext, freq: number): AudioBuffer {
  const sleutel = `harp:${freq}`;
  const bewaard = snaarBuffers.get(sleutel);
  if (bewaard) return bewaard;
  const periode = Math.floor(c.sampleRate / freq);
  const lengte = Math.floor(c.sampleRate * HARP.duur);
  const buffer = c.createBuffer(1, lengte, c.sampleRate);
  const d = buffer.getChannelData(0);
  let glad = 0;
  for (let i = 0; i < periode; i++) {
    const ruis = Math.random() * 2 - 1;
    glad += (0.15 + 0.85 * HARP.helder) * (ruis - glad);
    d[i] = glad;
  }
  let gemiddeld = 0;
  for (let i = 0; i < periode; i++) gemiddeld += d[i] / periode;
  for (let i = 0; i < periode; i++) d[i] -= gemiddeld;
  for (let i = periode; i < lengte; i++) {
    d[i] = HARP.demping * (0.25 * d[i - periode + 1] + 0.5 * d[i - periode] + 0.25 * (i > periode ? d[i - periode - 1] : 0));
  }
  snaarBuffers.set(sleutel, buffer);
  return buffer;
}

export function speelInstrument(instrument: Instrument, toon: number, wanneer = 0): void {
  if (instrument === 'xylofoon') {
    speelNoot(toon, wanneer);
    return;
  }
  const c = context();
  if (!c) return;
  const t = c.currentTime + wanneer;
  if (instrument === 'keyboard') {
    speelKeyboard(c, toon, t);
    return;
  }
  if (instrument === 'fluit') {
    speelSteel(c, toon, t);
    return;
  }
  if (instrument === 'kikkerkoor') {
    speelKikker(c, toon, t);
    return;
  }
  const freq = toon * HARP.octaaf;
  const bron = c.createBufferSource();
  bron.buffer = snaarBuffer(c, freq);
  bron.playbackRate.value = (freq * Math.floor(c.sampleRate / freq)) / c.sampleRate;

  const toonFilter = c.createBiquadFilter();
  toonFilter.type = 'lowpass';
  toonFilter.Q.value = 0.6;
  toonFilter.frequency.setValueAtTime(HARP.filterBegin, t);
  toonFilter.frequency.exponentialRampToValueAtTime(HARP.filterEind, t + 0.9);
  const uit = c.createGain();
  uit.gain.setValueAtTime(0, t);
  uit.gain.linearRampToValueAtTime(HARP.sterkte, t + 0.005);
  uit.gain.setValueAtTime(HARP.sterkte, t + HARP.duur - 0.4);
  uit.gain.linearRampToValueAtTime(0, t + HARP.duur);
  bron.connect(toonFilter).connect(uit);
  naarUit(c, uit, 0.2);
  bron.start(t);
  bron.stop(t + HARP.duur);
}

// Eén stem tegelijk: glijden over de snaren stapelde anders 4-seconden-akkoorden (speakers).
let steelStem: GainNode | null = null;
function speelSteel(c: AudioContext, toon: number, t: number): void {
  if (steelStem) {
    steelStem.gain.cancelScheduledValues(t);
    steelStem.gain.setValueAtTime(steelStem.gain.value, t);
    steelStem.gain.linearRampToValueAtTime(0, t + 0.04);
    steelStem = null;
  }
  const f = toon * 0.5;
  const duur = 1.35;
  const uit = c.createGain();
  steelStem = uit;
  uit.gain.setValueAtTime(0.0001, t);
  uit.gain.exponentialRampToValueAtTime(0.22, t + 0.05);
  uit.gain.setValueAtTime(0.22, t + 0.55);
  uit.gain.exponentialRampToValueAtTime(0.0001, t + duur);
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.Q.value = 0.8;
  filter.frequency.value = 1900;
  filter.connect(uit);
  const sine = c.createOscillator();
  sine.type = 'sine';
  const drie = c.createOscillator();
  drie.type = 'triangle';
  for (const osc of [sine, drie]) {
    osc.frequency.setValueAtTime(f * 0.983, t);
    osc.frequency.setTargetAtTime(f, t + 0.015, 0.04);
    osc.start(t);
    osc.stop(t + duur);
  }
  const drieG = c.createGain();
  drieG.gain.value = 0.22;
  sine.connect(filter);
  drie.connect(drieG).connect(filter);
  naarUit(c, uit, 0.18);
}

// Kikkerkoor: de noot is de luidste kikker. Twee buren kwaken net later en iets
// lager/hoger, anders is het één kikker. Een kwaak zakt in toonhoogte en heeft
// een snufje ruis; een kale sinus klinkt als een piep.
function speelKikker(c: AudioContext, toon: number, t: number): void {
  const basis = toon * 0.5;
  kwaak(c, basis, t, 0.32);
  kwaak(c, basis * 0.93, t + 0.05, 0.13);
  kwaak(c, basis * 1.07, t + 0.08, 0.09);
}

function kwaak(c: AudioContext, f: number, t: number, vol: number): void {
  for (const start of [0, 0.085]) {
    const osc = c.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(f * 1.65, t + start);
    osc.frequency.exponentialRampToValueAtTime(Math.max(50, f * 0.85), t + start + 0.07);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t + start);
    g.gain.exponentialRampToValueAtTime(vol, t + start + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + start + 0.075);
    osc.connect(g).connect(c.destination);
    osc.start(t + start);
    osc.stop(t + start + 0.1);
  }
  const r = ruis(c, 0.16);
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = 5;
  bp.frequency.setValueAtTime(Math.min(2200, f * 3.5), t);
  bp.frequency.exponentialRampToValueAtTime(Math.max(180, f * 1.2), t + 0.14);
  const rg = c.createGain();
  rg.gain.setValueAtTime(vol * 0.45, t);
  rg.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
  r.connect(bp).connect(rg).connect(c.destination);
  r.start(t);
}

// Keyboard als een ouderwetse computer-MIDI (de FM-chip van een geluidskaart uit de jaren
// negentig): een sinus die door een tweede sinus van dezelfde toonhoogte wordt "gekleurd".
// Die kleuring zakt snel weg, dus eerst een heldere aanslag, dan een zachte pianotoon.
function speelKeyboard(c: AudioContext, toon: number, t: number): void {
  const f = toon * 0.5;
  const duur = 1.8;
  const drager = c.createOscillator();
  drager.frequency.value = f;
  const modulator = c.createOscillator();
  modulator.frequency.value = f;
  const kleur = c.createGain();
  kleur.gain.setValueAtTime(f * 2.2, t);
  kleur.gain.exponentialRampToValueAtTime(f * 0.35, t + 0.6);
  modulator.connect(kleur).connect(drager.frequency);
  // Een tweede laagje een octaaf hoger met eigen, snellere kleuring: het "plinkerige".
  const drager2 = c.createOscillator();
  drager2.frequency.value = f * 2;
  const modulator2 = c.createOscillator();
  modulator2.frequency.value = f * 2;
  const kleur2 = c.createGain();
  kleur2.gain.setValueAtTime(f * 2, t);
  kleur2.gain.exponentialRampToValueAtTime(f * 0.1, t + 0.25);
  modulator2.connect(kleur2).connect(drager2.frequency);
  const laag2 = c.createGain();
  laag2.gain.value = 0.25;
  const uit = c.createGain();
  uit.gain.setValueAtTime(0, t);
  uit.gain.linearRampToValueAtTime(0.32, t + 0.004);
  uit.gain.exponentialRampToValueAtTime(0.14, t + 0.3);
  uit.gain.exponentialRampToValueAtTime(0.0001, t + duur);
  drager.connect(uit);
  drager2.connect(laag2).connect(uit);
  naarUit(c, uit);
  for (const o of [drager, modulator, drager2, modulator2]) {
    o.start(t);
    o.stop(t + duur + 0.05);
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
