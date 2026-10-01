import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { SpelKiesScreen } from './SpelKiesScreen.ts';
import { RondeScreen } from './RondeScreen.ts';
import { XylofoonScreen } from './XylofoonScreen.ts';
import { NiveauKiesScreen } from './NiveauKiesScreen.ts';
import { maakRitmeVragen, maakSpeelNaVragen } from '../../games/muziek/muziekVragen.ts';

// "Muziek": vrij spelen (xylofoon of drumstel), een melodietje naspelen en een ritme natrommelen.
export function MuziekKiesScreen(manager: ScreenManager): Screen {
  return SpelKiesScreen(manager, [
    { icoon: 'xylofoon', label: 'Vrij spelen', open: (m) => XylofoonScreen(m) },
    // Eerst een niveau kiezen (hoeveel noten/slagen, welke drums).
    {
      icoon: 'speel-na',
      label: 'Speel na',
      open: (m) => NiveauKiesScreen(m, 'speel-na', 'Speel na', (m2, n) => RondeScreen(m2, 'Speel na', maakSpeelNaVragen(n))),
    },
    {
      icoon: 'trommel',
      label: 'Ritme',
      open: (m) => NiveauKiesScreen(m, 'ritme', 'Ritme', (m2, n) => RondeScreen(m2, 'Ritme', maakRitmeVragen(n))),
    },
  ]);
}
