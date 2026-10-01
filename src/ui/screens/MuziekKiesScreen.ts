import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { SpelKiesScreen } from './SpelKiesScreen.ts';
import { RondeScreen } from './RondeScreen.ts';
import { XylofoonScreen } from './XylofoonScreen.ts';
import { maakRitmeVragen, maakSpeelNaVragen } from '../../games/muziek/muziekVragen.ts';

// "Muziek": vrij spelen op de xylofoon, een melodietje naspelen en een ritme natrommelen.
export function MuziekKiesScreen(manager: ScreenManager): Screen {
  return SpelKiesScreen(manager, [
    { icoon: 'xylofoon', label: 'Xylofoon', open: (m) => XylofoonScreen(m) },
    { icoon: 'speel-na', label: 'Speel na', open: (m) => RondeScreen(m, 'Speel na', maakSpeelNaVragen()) },
    { icoon: 'trommel', label: 'Ritme', open: (m) => RondeScreen(m, 'Ritme', maakRitmeVragen()) },
  ]);
}
