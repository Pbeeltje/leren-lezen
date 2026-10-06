import { haalActiefProfielId } from './profielStore.ts';

// Schrift per profiel: losse letters (Andika) of aan elkaar (Playwrite NL, een Nederlands
// schoolschrift). Geldt voor alles wat het kind leest of schrijft: de leestekst-klassen in
// screens.css, de 3D-letterblokken en de overtrek-letters. Uitleg en knoppen blijven Baloo 2.
// Het lettertype hangt aan <html data-schrift>, zodat CSS het in één regel omzet.

export type Schrift = 'los' | 'aan-elkaar';

const sleutel = (profielId: string) => `leren-lezen:schrift:${profielId}`;

function leesKeuze(): Schrift {
  const id = haalActiefProfielId();
  if (!id) return 'los';
  try {
    return localStorage.getItem(sleutel(id)) === 'aan-elkaar' ? 'aan-elkaar' : 'los';
  } catch {
    return 'los';
  }
}

export function huidigSchrift(): Schrift {
  return document.documentElement.dataset.schrift === 'aan-elkaar' ? 'aan-elkaar' : 'los';
}

/** Na het kiezen van een profiel (of bij het opstarten): diens schrift. */
export function pasSchriftVanProfielToe(): void {
  document.documentElement.dataset.schrift = leesKeuze();
}

export function kiesSchrift(schrift: Schrift): void {
  const id = haalActiefProfielId();
  if (id) {
    try {
      localStorage.setItem(sleutel(id), schrift);
    } catch {
      // geen opslag: alleen voor deze sessie
    }
  }
  document.documentElement.dataset.schrift = schrift;
}
