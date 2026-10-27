import { isGedempt } from '../audioManager.ts';
import { bijZichtbaarheid, paginaZichtbaar } from '../zichtbaarheid.ts';

// De gedeelde klankmachine voor alle muziek: de AudioContext (start pas bij de eerste tik,
// want browsers laten pas geluid toe na een aanraking), de uitgang met begrenzer, stemmen
// die niet opstapelen, galm, en ruis. De instrumenten zelf staan elk in een eigen bestand.

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

export function context(): AudioContext | null {
  if (isGedempt()) return null;
  if (!ctx) ctx = new AudioContext();
  if (!paginaZichtbaar()) {
    hervatNaTonen = true;
    return ctx;
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

// Alle klanken gaan via één uitgang met een begrenzer. Zonder telden tien vingers tegelijk
// op tot boven de 1, en dan kraakt het (digitaal clippen). De drempel ligt hoog (-3 dB),
// zodat één losse toon even hard blijft; een zachte afronding boven 0,8 vangt de korte
// pieken op die de begrenzer net mist. Gemeten: 20 harptonen tegelijk blijven onder 0,96.
let begrenzer: DynamicsCompressorNode | null = null;
export function uitgang(c: AudioContext): AudioNode {
  if (begrenzer) return begrenzer;
  begrenzer = c.createDynamicsCompressor();
  begrenzer.threshold.value = -3;
  begrenzer.knee.value = 0;
  begrenzer.ratio.value = 20;
  begrenzer.attack.value = 0.001;
  begrenzer.release.value = 0.2;
  const rand = new Float32Array(2049);
  for (let i = 0; i < rand.length; i++) {
    const x = (i / (rand.length - 1)) * 2 - 1;
    const a = Math.abs(x);
    rand[i] = Math.sign(x) * (a <= 0.8 ? a : 0.8 + 0.2 * Math.tanh((a - 0.8) / 0.2));
  }
  const afronding = c.createWaveShaper();
  afronding.curve = rand;
  afronding.oversample = '2x';
  begrenzer.connect(afronding).connect(c.destination);
  return begrenzer;
}

// Dezelfde toon opnieuw aanslaan dempt de vorige klank van die toon (zoals een staaf of
// snaar die je opnieuw raakt): snel herhaalde tikken stapelen dan niet op. Andere tonen
// klinken gewoon door, dus akkoorden blijven. De knip-gain staat altijd op 1, zodat
// het wegdraaien nooit botst met de omhulling van de klank zelf.
const klinkt = new Map<string, GainNode>();
export function nieuweStem(c: AudioContext, sleutel: string, t: number): GainNode {
  const oud = klinkt.get(sleutel);
  if (oud) {
    oud.gain.cancelScheduledValues(t);
    oud.gain.setTargetAtTime(0, t, 0.015);
  }
  const knip = c.createGain();
  klinkt.set(sleutel, knip);
  return knip;
}

// Hoogstens `max` stemmen van één instrument tegelijk: bij een nieuwe dooft de oudste uit
// (in ongeveer `doof` s). Uitgeklonken stemmen en de vorige klank met dezelfde sleutel (die
// dempt nieuweStem al) tellen niet mee. Voor lange klanken die anders oorverdovend
// opstapelen als je over alle knoppen glijdt (klokken, fluit).
type Stem = { sleutel: string; knip: GainNode; eind: number };
const groepen = new Map<string, Stem[]>();
export function begrensStemmen(groep: string, max: number, stem: Stem, t: number, doof: number): void {
  const rij = (groepen.get(groep) ?? []).filter((s) => s.eind > t && s.sleutel !== stem.sleutel);
  while (rij.length >= max) {
    const oud = rij.shift()!;
    oud.knip.gain.cancelScheduledValues(t);
    oud.knip.gain.setTargetAtTime(0, t, doof);
  }
  rij.push(stem);
  groepen.set(groep, rij);
}

// Galm zonder terugkoppeling: een vaste nagalm (ruis die uitsterft), dus hij kan nooit
// blijven aanzwellen. Eén keer gemaakt per soort: de kamer (snaren, keyboard, ...) en een
// langere, donkere voor de klokken.
const galmen = new Map<string, GainNode>();
export function maakGalm(
  c: AudioContext,
  soort: string,
  { seconden, macht, sterkte, donker }: { seconden: number; macht: number; sterkte: number; donker?: number },
): GainNode {
  const bewaard = galmen.get(soort);
  if (bewaard) return bewaard;
  const lengte = Math.floor(c.sampleRate * seconden);
  const impuls = c.createBuffer(2, lengte, c.sampleRate);
  for (let kanaal = 0; kanaal < 2; kanaal++) {
    const d = impuls.getChannelData(kanaal);
    for (let i = 0; i < lengte; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / lengte, macht);
  }
  const zaal = c.createConvolver();
  zaal.buffer = impuls;
  const ingang = c.createGain();
  ingang.gain.value = sterkte;
  if (donker) {
    const filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = donker;
    ingang.connect(filter).connect(zaal).connect(uitgang(c));
  } else ingang.connect(zaal).connect(uitgang(c));
  galmen.set(soort, ingang);
  return ingang;
}

// Een beetje galm (zoals in een kamer) voor de snaren en het keyboard.
const galm = (c: AudioContext): GainNode => maakGalm(c, 'kamer', { seconden: 1.4, macht: 3, sterkte: 0.22 });

// galmMate: hoeveel van de gedeelde galm dit instrument krijgt (1 = alles).
export function naarUit(c: AudioContext, knoop: AudioNode, galmMate = 1): void {
  knoop.connect(uitgang(c));
  const mate = c.createGain();
  mate.gain.value = galmMate;
  knoop.connect(mate).connect(galm(c));
}

export function ruis(c: AudioContext, seconden: number): AudioBufferSourceNode {
  const lengte = Math.floor(c.sampleRate * seconden);
  const buffer = c.createBuffer(1, lengte, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < lengte; i++) data[i] = Math.random() * 2 - 1;
  const bron = c.createBufferSource();
  bron.buffer = buffer;
  return bron;
}

export function omhulling(c: AudioContext, t: number, piek: number, duur: number): GainNode {
  const g = c.createGain();
  g.gain.setValueAtTime(piek, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duur);
  g.connect(uitgang(c));
  return g;
}
