import type { Instrument } from '../../engine/muziek.ts';
import { HARP } from './harp.ts';
import { KIKKERKOOR } from './kikkerkoor.ts';
import { KLOKKEN } from './klokken.ts';
import { TROMPETTEN } from './trompet.ts';
import { XYLOFOON } from './xylofoonUiterlijk.ts';

// Wat een melodie-instrument toevoegt aan de gedeelde knoppen van maakXylofoon. Alleen het
// gekozen instrument wordt gebouwd (bij wisselen opnieuw); de vorm zelf staat in muziek.css
// onder .xylofoon--<id>. Nieuw instrument: een klank in engine/muziek/, een regel in
// INSTRUMENTEN, een Uiterlijk hier (mag leeg), CSS en een icoon.
export interface Uiterlijk {
  // Versiering achter de knoppen (vijver, rek) en ervoor (riet vooraan).
  achter?: () => HTMLElement;
  voor?: () => HTMLElement;
  // Onderdelen en eigenschappen van één knop (kikker, trompet, klok, ...).
  knop?: (staaf: HTMLButtonElement, toon: number, positie: number, tonen: number[]) => void;
  // Indeling die van de maat van het vak afhangt; opnieuw bij elke maatverandering.
  leg?: (vak: HTMLElement, staven: HTMLElement[]) => void;
}

// Keyboard: een zwarte toets (alleen versiering) rechts van do, re, fa, sol en la, als de
// volgende witte toets er ook is.
const KEYBOARD: Uiterlijk = {
  knop(staaf, toon, positie, tonen) {
    if ([0, 1, 3, 4, 5].includes(toon) && tonen[positie + 1] === toon + 1) staaf.dataset.zwart = '';
  },
};

export const UITERLIJK: Record<Instrument, Uiterlijk> = {
  xylofoon: XYLOFOON,
  harp: HARP,
  fluit: {},
  keyboard: KEYBOARD,
  kikkerkoor: KIKKERKOOR,
  trompet: TROMPETTEN,
  klokken: KLOKKEN,
};
