import { context, ruis, omhulling } from './klank.ts';

export type DrumSoort = 'bas' | 'snare' | 'bekken' | 'tom' | 'crash';

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
