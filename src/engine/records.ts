import { haalActiefProfielId } from './profielStore.ts';

// Records van de spelletjes, per profiel: `leren-lezen:<spel>:<profielId>`. Het
// Records-scherm (RecordsScreen) leest dezelfde sleutels.
export type RecordSpel = 'vangspel' | 'oversteken' | 'tafeltennis' | 'voeren';

const sleutel = (spel: RecordSpel): string => `leren-lezen:${spel}:${haalActiefProfielId() ?? 'gast'}`;

export function haalRecord(spel: RecordSpel): number {
  try {
    return Number(localStorage.getItem(sleutel(spel))) || 0;
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
