// Speelt een audiobestand af als het bestaat; faalt altijd stil.
// Fase 1 levert geen clips mee (zie plan: visuele oefeningen i.p.v. audio-afhankelijkheid),
// maar games/content roepen dit al aan zodat later een .mp3 neerzetten genoeg is.

const cache = new Map<string, HTMLAudioElement>();
let bestaatNietCache = new Set<string>();
let ontgrendeld = false;
let huidigAfspelend: HTMLAudioElement | null = null;

const GEDEMPT_SLEUTEL = 'leren-lezen:gedempt';

// Eén globale, niet per-profiel instelling (het is een instelling van het apparaat/de
// afspeelknop, niet van welk kind er net speelt) -- zie ook progressStore.ts voor
// hetzelfde "localStorage mag nooit crashen"-patroon.
function leesGedemptUitOpslag(): boolean {
  try {
    return localStorage.getItem(GEDEMPT_SLEUTEL) === '1';
  } catch {
    return false;
  }
}

let gedempt = leesGedemptUitOpslag();

export function isGedempt(): boolean {
  return gedempt;
}

export function zetGedempt(waarde: boolean): void {
  gedempt = waarde;
  try {
    localStorage.setItem(GEDEMPT_SLEUTEL, waarde ? '1' : '0');
  } catch {
    // Genegeerd: voorkeur onthouden is fijn maar niet essentieel.
  }
  if (waarde) {
    for (const element of cache.values()) {
      element.pause();
      element.currentTime = 0;
    }
  }
}

export function ontgrendelAudio(): void {
  if (ontgrendeld) return;
  ontgrendeld = true;
  // Stille buffer afspelen op de eerste gebruikersinteractie, nodig voor iOS/Safari autoplay-beleid.
  const stilte = new Audio();
  stilte.play().catch(() => undefined);
}

export function instructieAudioPad(type: string): string {
  return `/assets/audio/instructies/${type}.mp3`;
}

export function woordAudioPad(woord: string): string {
  return `/assets/audio/woorden/${woord}.mp3`;
}

/** Stopt wat er nu speelt, bv. bij het verlaten van een scherm. */
export function stopAudio(): void {
  if (!huidigAfspelend) return;
  huidigAfspelend.pause();
  huidigAfspelend.currentTime = 0;
  huidigAfspelend = null;
}

/**
 * Roept `fn` aan zodra wat er nu speelt (bv. "Goed gedaan!") klaar is, plus een korte
 * stilte, zodat het volgende woord niet meteen tegen de feedback aan plakt. Nooit langer
 * dan `maxMs` wachten, voor als een clipje hapert.
 */
export function naHuidigeAudio(fn: () => void, stilteMs = 800, maxMs = 4000): void {
  const element = huidigAfspelend;
  let klaar = false;
  const verder = () => {
    if (klaar) return;
    klaar = true;
    window.clearTimeout(noodrem);
    element?.removeEventListener('ended', naEinde);
    window.setTimeout(fn, stilteMs);
  };
  const naEinde = () => verder();
  const noodrem = window.setTimeout(verder, maxMs);
  if (!element || element.paused || element.ended) verder();
  else element.addEventListener('ended', naEinde);
}

export function speelAf(pad: string | undefined): void {
  if (gedempt || !pad || bestaatNietCache.has(pad)) return;

  let element = cache.get(pad);
  if (!element) {
    element = new Audio(pad);
    cache.set(pad, element);
    element.addEventListener('error', () => {
      bestaatNietCache.add(pad);
      cache.delete(pad);
    });
  }

  // Zonder dit blijft een vorig clipje (bv. de feedback "Goed zo!" of het vorige
  // woord) gewoon doorspelen op de achtergrond terwijl het volgende al start -- dan
  // hoort een kind een heel ander woord dan wat er nu op het scherm staat (precies
  // gemeld: "ik hoor mais maar dat is geen optie hier"). Altijd eerst het vorige
  // clipje stoppen voordat het nieuwe begint.
  if (huidigAfspelend && huidigAfspelend !== element) {
    huidigAfspelend.pause();
    huidigAfspelend.currentTime = 0;
  }
  huidigAfspelend = element;

  element.currentTime = 0;
  element.play().catch(() => {
    // Genegeerd: audio kan nog niet ontgrendeld zijn of het bestand ontbreekt.
  });
}
