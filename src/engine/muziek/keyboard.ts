import { nieuweStem, naarUit } from './klank.ts';

// Keyboard als een ouderwetse computer-MIDI (de FM-chip van een geluidskaart uit de jaren
// negentig): een sinus die door een tweede sinus van dezelfde toonhoogte wordt "gekleurd".
// Die kleuring zakt snel weg, dus eerst een heldere aanslag, dan een zachte pianotoon.
export function speelKeyboard(c: AudioContext, toon: number, t: number): void {
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
  naarUit(c, uit.connect(nieuweStem(c, `keyboard:${toon}`, t)));
  for (const o of [drager, modulator, drager2, modulator2]) {
    o.start(t);
    o.stop(t + duur + 0.05);
  }
}
