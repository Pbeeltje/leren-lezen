// Speelt een audiobestand af als het bestaat; faalt altijd stil.
// Fase 1 levert geen clips mee (zie plan: visuele oefeningen i.p.v. audio-afhankelijkheid),
// maar games/content roepen dit al aan zodat later een .mp3 neerzetten genoeg is.

const cache = new Map<string, HTMLAudioElement>();
let bestaatNietCache = new Set<string>();
let ontgrendeld = false;

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

  element.currentTime = 0;
  element.play().catch(() => {
    // Genegeerd: audio kan nog niet ontgrendeld zijn of het bestand ontbreekt.
  });
}
