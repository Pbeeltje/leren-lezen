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

// Melodie-instrumenten: de xylofoon is gratis, de rest koop je in de winkel. Ze spelen
// dezelfde acht tonen (en dus dezelfde liedjes bij Speel na) met hun eigen klank.
export type Instrument = 'xylofoon' | 'gitaar' | 'harp' | 'steelgitaar' | 'keyboard';
export const INSTRUMENTEN: { id: Instrument; naam: string; icoon: string }[] = [
  { id: 'xylofoon', naam: 'Xylofoon', icoon: 'assets/icons/xylofoon.svg' },
  { id: 'gitaar', naam: 'Gitaar', icoon: 'assets/icons/gitaar.svg' },
  { id: 'harp', naam: 'Harp', icoon: 'assets/icons/harp.svg' },
  { id: 'steelgitaar', naam: 'Steelgitaar', icoon: 'assets/icons/steelgitaar.svg' },
  { id: 'keyboard', naam: 'Keyboard', icoon: 'assets/icons/keyboard.svg' },
];

// Snaren met Karplus-Strong: een kort stukje ruis (of een driehoek, de geplukte snaar) dat
// telkens na één trillingsperiode zachter en ronder terugkomt. Per toon één keer berekend.
// Alle snaren klinken een octaaf lager dan de xylofoon (hoog klonk schel). demping per
// periode bepaalt hoe lang de snaar naklinkt; helder hoeveel hoge tonen de pluk heeft.
// Daarna een filter dat dichtgaat van filterBegin naar filterEind: eerst de heldere pluk,
// dan een warme toon, zoals een echte snaar.
type Snaar = 'gitaar' | 'harp';
const SNAAR_KLANK: Record<
  Snaar,
  { octaaf: number; demping: number; helder: number; driehoek: boolean; duur: number; sterkte: number; filterBegin: number; filterEind: number }
> = {
  // Voorbeelden in bronbestanden/guitar.m4a en harp.m4a: weinig energie boven 2 kHz,
  // centroid ~1,1–1,6 kHz. De driehoek/heldere pluk klonk schel; galm te nat.
  gitaar: { octaaf: 0.5, demping: 0.9972, helder: 0.18, driehoek: false, duur: 2.2, sterkte: 0.78, filterBegin: 1600, filterEind: 850 },
  harp: { octaaf: 0.5, demping: 0.9965, helder: 0.1, driehoek: false, duur: 1.6, sterkte: 0.72, filterBegin: 1700, filterEind: 800 },
};

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

function snaarBuffer(c: AudioContext, soort: Snaar, freq: number): AudioBuffer {
  const sleutel = `${soort}:${freq}`;
  const bewaard = snaarBuffers.get(sleutel);
  if (bewaard) return bewaard;
  const k = SNAAR_KLANK[soort];
  const periode = Math.floor(c.sampleRate / freq);
  const lengte = Math.floor(c.sampleRate * k.duur);
  const buffer = c.createBuffer(1, lengte, c.sampleRate);
  const d = buffer.getChannelData(0);
  let glad = 0;
  for (let i = 0; i < periode; i++) {
    const ruis = Math.random() * 2 - 1;
    glad += (0.15 + 0.85 * k.helder) * (ruis - glad);
    const pluk = i < periode * 0.3 ? i / (periode * 0.3) : 1 - (i - periode * 0.3) / (periode * 0.7);
    d[i] = k.driehoek ? 0.85 * (pluk * 2 - 1) + 0.15 * glad : glad;
  }
  let gemiddeld = 0;
  for (let i = 0; i < periode; i++) gemiddeld += d[i] / periode;
  for (let i = 0; i < periode; i++) d[i] -= gemiddeld;
  // Drie buren middelen (¼ ½ ¼) dempt de hoge boventonen sneller dan twee: minder schel.
  // Het midden ligt precies één periode terug, dus de toonhoogte blijft sampleRate/periode.
  for (let i = periode; i < lengte; i++) {
    d[i] = k.demping * (0.25 * d[i - periode + 1] + 0.5 * d[i - periode] + 0.25 * (i > periode ? d[i - periode - 1] : 0));
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
  if (instrument === 'steelgitaar') {
    speelSteel(c, toon, t);
    return;
  }
  const k = SNAAR_KLANK[instrument];
  const freq = toon * k.octaaf;
  const snaar = (f: number): AudioBufferSourceNode => {
    const b = c.createBufferSource();
    b.buffer = snaarBuffer(c, instrument, f);
    return b;
  };
  // Afspeelsnelheid die de afgeronde periode rechtzet naar de echte toonhoogte.
  const stem = (f: number): number => (f * Math.floor(c.sampleRate / f)) / c.sampleRate;
  const bron = snaar(freq);
  const snelheid = stem(freq);

  const toonFilter = c.createBiquadFilter();
  toonFilter.type = 'lowpass';
  toonFilter.Q.value = 0.6;
  toonFilter.frequency.setValueAtTime(k.filterBegin, t);
  toonFilter.frequency.exponentialRampToValueAtTime(k.filterEind, t + 0.9);
  const uit = c.createGain();
  uit.gain.setValueAtTime(0, t);
  uit.gain.linearRampToValueAtTime(k.sterkte, t + 0.005);
  uit.gain.setValueAtTime(k.sterkte, t + k.duur - 0.4);
  uit.gain.linearRampToValueAtTime(0, t + k.duur);
  toonFilter.connect(uit);

  if (instrument === 'gitaar') {
    // Folkgitaar: houten klankkast (warm laag) en, heel zacht en net erna, een dunne snaar
    // een octaaf hoger zoals bij een twaalfsnarige (zelfde noot, dus Speel na blijft duidelijk).
    const kast = c.createBiquadFilter();
    kast.type = 'peaking';
    kast.frequency.value = 120;
    kast.Q.value = 1.2;
    kast.gain.value = 5;
    kast.connect(toonFilter);
    bron.playbackRate.value = snelheid;
    bron.connect(kast);
    const hoog = snaar(freq * 2);
    hoog.playbackRate.value = stem(freq * 2) * 1.0015;
    const hoogSterkte = c.createGain();
    hoogSterkte.gain.value = 0.06;
    hoog.connect(hoogSterkte).connect(kast);
    hoog.start(t + 0.012);
    hoog.stop(t + k.duur);
  } else {
    bron.playbackRate.value = snelheid;
    bron.connect(toonFilter);
  }
  naarUit(c, uit, instrument === 'gitaar' ? 0.05 : 0.2);
  bron.start(t);
  bron.stop(t + k.duur);
}

// Country pedal steel (bronbestanden/steelguitar.m4a): nette parallelle boventonen, geen
// ruis-pluk. Karplus-Strong klonk daardoor "computery". Sinussen op 1–6, zacht aanzwellen,
// een klein glijdtje (niet een hele toon) en laat licht vibrato.
function speelSteel(c: AudioContext, toon: number, t: number): void {
  const f = toon * 0.5;
  const duur = 4.2;
  const uit = c.createGain();
  uit.gain.setValueAtTime(0.0001, t);
  uit.gain.exponentialRampToValueAtTime(0.55, t + 0.08);
  uit.gain.setValueAtTime(0.55, t + 2.8);
  uit.gain.exponentialRampToValueAtTime(0.0001, t + duur);
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.Q.value = 0.7;
  filter.frequency.setValueAtTime(2600, t);
  filter.frequency.exponentialRampToValueAtTime(1500, t + 0.45);
  filter.connect(uit);
  const lfo = c.createOscillator();
  lfo.frequency.value = 4.4;
  const diepte = c.createGain();
  diepte.gain.setValueAtTime(0, t);
  diepte.gain.setValueAtTime(0, t + 0.45);
  diepte.gain.linearRampToValueAtTime(f * 0.004, t + 1);
  lfo.connect(diepte);
  lfo.start(t);
  lfo.stop(t + duur);
  const sterktes = [1, 0.52, 0.26, 0.13, 0.07, 0.035];
  for (let n = 1; n <= sterktes.length; n++) {
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(f * n * 0.976, t);
    osc.frequency.setTargetAtTime(f * n, t + 0.02, 0.045);
    diepte.connect(osc.frequency);
    const g = c.createGain();
    g.gain.value = sterktes[n - 1];
    osc.connect(g).connect(filter);
    osc.start(t);
    osc.stop(t + duur);
  }
  naarUit(c, uit, 0.55);
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
