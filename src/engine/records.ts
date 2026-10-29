import { haalActiefProfielId } from './profielStore.ts';

// Records van de spelletjes, per profiel: `leren-lezen:<spel>:<profielId>`. Het
// Records-scherm (RecordsScreen) en de ranglijst (RanglijstScreen) lezen dezelfde sleutels.
export type RecordSpel = 'vangspel' | 'oversteken' | 'tafeltennis' | 'voeren' | 'geheugen';

const sleutel = (spel: RecordSpel, profielId = haalActiefProfielId() ?? 'gast'): string =>
  `leren-lezen:${spel}:${profielId}`;

// Zonder profielId: het actieve profiel. Met: een ander profiel (voor de ranglijst).
export function haalRecord(spel: RecordSpel, profielId?: string): number {
  try {
    return Number(localStorage.getItem(sleutel(spel, profielId))) || 0;
  } catch {
    return 0;
  }
}

export function zetRecord(spel: RecordSpel, n: number): void {
  try {
    localStorage.setItem(sleutel(spel), String(n));
  } catch {
    // geen opslag: dan maar geen record
  }
}
