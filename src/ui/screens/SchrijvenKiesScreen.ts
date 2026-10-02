import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { SpelKiesScreen } from './SpelKiesScreen.ts';
import { RondeScreen } from './RondeScreen.ts';
import { maakLetterVraag, maakLijnVraag, maakWoordVraag } from '../../games/schrijven/schrijfVragen.ts';

// "Schrijven": overtrekken met de vinger, in rondes van 5 (RondeScreen).
export function SchrijvenKiesScreen(manager: ScreenManager): Screen {
  return SpelKiesScreen(manager, [
    { icoon: 'lijnen', label: 'Lijnen', groepen: ['kleuter'], open: (m) => RondeScreen(m, 'Lijnen', maakLijnVraag) },
    { icoon: 'letters', label: 'Letters', groepen: ['kleuter', 'groep3'], open: (m) => RondeScreen(m, 'Letters', maakLetterVraag) },
    { icoon: 'woordjes', label: 'Woordjes', groepen: ['groep3'], open: (m) => RondeScreen(m, 'Woordjes', maakWoordVraag) },
  ]);
}
