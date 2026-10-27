import { context } from './muziek/klank.ts';
import { speelFluit } from './muziek/fluit.ts';
import { speelHarp } from './muziek/harp.ts';
import { speelKeyboard } from './muziek/keyboard.ts';
import { speelKikker } from './muziek/kikker.ts';
import { speelKlok } from './muziek/klokken.ts';
import { speelTrompet } from './muziek/trompet.ts';
import { speelXylofoon } from './muziek/xylofoon.ts';

// Klanken voor Muziek, gemaakt met Web Audio (geen opnames nodig). Dit is de ingang voor de
// rest van de app; de klankmachine staat in muziek/klank.ts en elk instrument in een eigen
// bestand in muziek/.
export { speelNoot } from './muziek/xylofoon.ts';
export { speelDrum, type DrumSoort } from './muziek/drums.ts';

// Do-re-mi tot do (C5-C6). De speel-na-spelletjes gebruiken alleen de vijftonige reeks
// (do re mi sol la): dan klinkt elk willekeurig melodietje vrolijk.
export const TONEN = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.5];
export const VIJFTONIG = [0, 1, 2, 4, 5];

// Melodie-instrumenten: de xylofoon is gratis, de rest koop je in de winkel. Ze spelen
// dezelfde acht tonen (en dus dezelfde liedjes bij Speel na) met hun eigen klank.
export type Instrument = 'xylofoon' | 'harp' | 'fluit' | 'keyboard' | 'kikkerkoor' | 'trompet' | 'klokken';
export const INSTRUMENTEN: { id: Instrument; naam: string; icoon: string }[] = [
  { id: 'xylofoon', naam: 'Xylofoon', icoon: 'assets/icons/xylofoon.svg' },
  { id: 'harp', naam: 'Harp', icoon: 'assets/icons/harp.svg' },
  { id: 'fluit', naam: 'Fluit', icoon: 'assets/icons/fluit.svg' },
  { id: 'keyboard', naam: 'Keyboard', icoon: 'assets/icons/keyboard.svg' },
  { id: 'kikkerkoor', naam: 'Kikkerkoor', icoon: 'assets/icons/kikker.svg' },
  { id: 'trompet', naam: 'Trompetten', icoon: 'assets/icons/trompet.svg' },
  { id: 'klokken', naam: 'Klokken', icoon: 'assets/icons/klokken.svg' },
];

// Elk instrument: (context, toonhoogte, starttijd, nummer van de toon 0-7).
const KLANKEN: Record<Instrument, (c: AudioContext, toon: number, t: number, nr: number) => void> = {
  xylofoon: speelXylofoon,
  harp: speelHarp,
  fluit: speelFluit,
  keyboard: speelKeyboard,
  kikkerkoor: speelKikker,
  trompet: speelTrompet,
  klokken: speelKlok,
};

export function speelInstrument(instrument: Instrument, toon: number, wanneer = 0): void {
  const c = context();
  if (!c) return;
  const nr = Math.max(0, TONEN.findIndex((x) => Math.abs(x - toon) < 1));
  KLANKEN[instrument](c, toon, c.currentTime + wanneer, nr);
}

export const STAAF_KLEUREN = ['#e53935', '#fb8c00', '#fdd835', '#43a047', '#00acc1', '#1e88e5', '#5e35b1', '#d81b60'];
