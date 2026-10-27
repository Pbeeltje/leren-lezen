import { begrensStemmen, naarUit } from './klank.ts';

// Fluit: sinus plus een beetje driehoek, met een korte aanzwelling (zelfde klank als de oude
// steelgitaar, vandaar de winkelsleutel instrument:steelgitaar). Eén stem tegelijk: glijden
// over de gaatjes stapelde anders 4-seconden-akkoorden (speakers).
export function speelFluit(c: AudioContext, toon: number, t: number): void {
  const f = toon * 0.5;
  const duur = 1.35;
  const knip = c.createGain();
  begrensStemmen('fluit', 1, { sleutel: `fluit:${t}`, knip, eind: t + duur }, t, 0.015);
  const uit = c.createGain();
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
  naarUit(c, uit.connect(knip), 0.18);
}
