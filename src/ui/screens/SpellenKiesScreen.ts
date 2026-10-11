import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { haalGroep } from '../../engine/progressStore.ts';
import { SpelKiesScreen } from './SpelKiesScreen.ts';
import { VangScreen } from './VangScreen.ts';
import { GeheugenScreen } from './GeheugenScreen.ts';
import { TekenScreen } from './TekenScreen.ts';
import { TafeltennisScreen } from './TafeltennisScreen.ts';
import { VoerScreen } from './VoerScreen.ts';
import { OversteekScreen } from './OversteekScreen.ts';
import { RecordsScreen } from './RecordsScreen.ts';

// Spelletjes: vangen, oversteken, tafeltennis, dieren voeren, geheugen, vrij tekenen en de records. Kleuters 4 paren, groep 3 acht (16 kaarten).
export function SpellenKiesScreen(manager: ScreenManager): Screen {
  return SpelKiesScreen(
    manager,
    [
      { icoon: 'meteoor', label: 'Vangspel', profielFiguur: true, open: (m) => VangScreen(m) },
      { icoon: 'oversteken', label: 'Oversteken', open: (m) => OversteekScreen(m) },
      { icoon: 'tafeltennis', label: 'Tafeltennis', open: (m) => TafeltennisScreen(m) },
      { icoon: 'voeren', label: 'Dieren voeren', open: (m) => VoerScreen(m) },
      { icoon: 'geheugenspel', label: 'Geheugenspel', open: (m) => GeheugenScreen(m, haalGroep() === 'groep3' ? 8 : 4) },
      { icoon: 'tekenen', label: 'Tekenen', open: (m) => TekenScreen(m) },
      { icoon: 'trofee', label: 'Records', open: (m) => RecordsScreen(m) },
    ],
    'Wat wil je spelen?',
  );
}
