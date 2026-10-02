import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { haalGroep } from '../../engine/progressStore.ts';
import { SpelKiesScreen } from './SpelKiesScreen.ts';
import { VangScreen } from './VangScreen.ts';
import { GeheugenScreen } from './GeheugenScreen.ts';
import { TekenScreen } from './TekenScreen.ts';
import { TafeltennisScreen } from './TafeltennisScreen.ts';

// Spelletjes: vangen, tafeltennis, geheugen en vrij tekenen. Kleuters 4 paren, groep 3 acht (16 kaarten).
export function SpellenKiesScreen(manager: ScreenManager): Screen {
  return SpelKiesScreen(
    manager,
    [
      { icoon: 'meteoor', label: 'Vangspel', profielFiguur: true, open: (m) => VangScreen(m) },
      { icoon: 'tafeltennis', label: 'Tafeltennis', open: (m) => TafeltennisScreen(m) },
      { icoon: 'geheugenspel', label: 'Geheugenspel', open: (m) => GeheugenScreen(m, haalGroep() === 'groep3' ? 8 : 4) },
      { icoon: 'tekenen', label: 'Tekenen', open: (m) => TekenScreen(m) },
    ],
    'Wat wil je spelen?',
  );
}
