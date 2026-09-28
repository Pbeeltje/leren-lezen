// Speelt een audiobestand af als het bestaat; faalt altijd stil.
// Fase 1 levert geen clips mee (zie plan: visuele oefeningen i.p.v. audio-afhankelijkheid),
// maar games/content roepen dit al aan zodat later een .mp3 neerzetten genoeg is.

const cache = new Map<string, HTMLAudioElement>();
let bestaatNietCache = new Set<string>();
let ontgrendeld = false;

export function ontgrendelAudio(): void {
  if (ontgrendeld) return;
  ontgrendeld = true;
  // Stille buffer afspelen op de eerste gebruikersinteractie, nodig voor iOS/Safari autoplay-beleid.
  const stilte = new Audio();
  stilte.play().catch(() => undefined);
}

export function speelAf(pad: string | undefined): void {
  if (!pad || bestaatNietCache.has(pad)) return;

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
