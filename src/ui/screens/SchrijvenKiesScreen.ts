import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { SpelKiesScreen } from './SpelKiesScreen.ts';
import { RondeScreen } from './RondeScreen.ts';
import { maakLetterVraag, maakLijnVraag, maakWoordVraag } from '../../games/schrijven/schrijfVragen.ts';

// "Schrijven": overtrekken met de vinger, in rondes van 5 (RondeScreen).
export function SchrijvenKiesScreen(manager: ScreenManager): Screen {
  return SpelKiesScreen(manager, [
    { icoon: 'lijnen', label: 'Lijnen', open: (m) => RondeScreen(m, 'Lijnen', maakLijnVraag) },
    { icoon: 'letters', label: 'Letters', leeftijden: [5, 6], open: (m) => RondeScreen(m, 'Letters', maakLetterVraag) },
    { icoon: 'woordjes', label: 'Woordjes', leeftijden: [6], open: (m) => RondeScreen(m, 'Woordjes', maakWoordVraag) },
  ]);
}
