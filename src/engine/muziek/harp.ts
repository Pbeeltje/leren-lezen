import { nieuweStem, naarUit } from './klank.ts';

// Harp: Karplus-Strong, een octaaf lager dan de xylofoon. Een kort stukje ruis dat
// telkens na één trillingsperiode zachter terugkomt (drie-taps-lus). Daarna een
// filter dat dichtdraait: eerst de pluk, dan een warme toon.
const HARP = { octaaf: 0.5, demping: 0.9965, helder: 0.1, duur: 1.6, sterkte: 0.72, filterBegin: 1700, filterEind: 800 };

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

export function speelHarp(c: AudioContext, toon: number, t: number): void {
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
  naarUit(c, uit.connect(nieuweStem(c, `harp:${toon}`, t)), 0.2);
  bron.start(t);
  bron.stop(t + HARP.duur);
}
