import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { SpelKiesScreen } from './SpelKiesScreen.ts';
import { RondeScreen } from './RondeScreen.ts';
import { RONDE_ACTIVITEITEN, type RondeId } from '../../games/rondeActiviteiten.ts';

// "Schrijven": overtrekken met de vinger, in rondes van 5 (RondeScreen).
export function SchrijvenKiesScreen(manager: ScreenManager): Screen {
  const keuze = (id: RondeId, groepen: ('kleuter' | 'groep3')[]) => {
    const spel = RONDE_ACTIVITEITEN[id];
    return { icoon: spel.icoon, label: spel.titel, groepen, open: (m: ScreenManager) => RondeScreen(m, spel.titel, spel.maakVraag, undefined, id) };
  };
  return SpelKiesScreen(manager, [
    keuze('schrijven-lijnen', ['kleuter']),
    keuze('schrijven-letters', ['kleuter', 'groep3']),
    keuze('schrijven-woordjes', ['groep3']),
  ]);
}
