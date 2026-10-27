import { context, uitgang, nieuweStem } from './klank.ts';

// Xylofoon: drie sinussen van een houten staaf, elk met eigen uitsterftijd. speelNoot is
// dezelfde klank voor de andere spelletjes (een plingetje bij goed, ...).
export function speelNoot(toon: number, wanneer = 0): void {
  const c = context();
  if (!c) return;
  speelXylofoon(c, toon, c.currentTime + wanneer);
}

export function speelXylofoon(c: AudioContext, toon: number, t: number): void {
  const uit = c.createGain();
  uit.gain.value = 0.35;
  uit.connect(nieuweStem(c, `xylofoon:${toon}`, t)).connect(uitgang(c));
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
