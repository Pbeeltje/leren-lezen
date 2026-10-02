import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { SpelKiesScreen } from './SpelKiesScreen.ts';
import { RondeScreen } from './RondeScreen.ts';
import { XylofoonScreen } from './XylofoonScreen.ts';
import { NiveauKiesScreen } from './NiveauKiesScreen.ts';
import { maakRitmeVragen, maakSpeelNaVragen, niveauOmschrijving } from '../../games/muziek/muziekVragen.ts';
import { muziekMunten } from '../../engine/rewards.ts';
import type { Instrument } from '../../engine/muziek.ts';
import { speelSchermOvergang } from '../../three/transitions.ts';
import { WinkelScreen } from './WinkelScreen.ts';

// "Muziek": vrij spelen (xylofoon of drumstel), een melodietje naspelen en een ritme natrommelen.
export function MuziekKiesScreen(manager: ScreenManager): Screen {
  return SpelKiesScreen(manager, [
    { icoon: 'xylofoon', label: 'Vrij spelen', open: (m) => XylofoonScreen(m) },
    // Eerst een niveau kiezen (hoeveel noten/slagen, welke drums).
    {
      icoon: 'speel-na',
      label: 'Speel na',
      open: (m) =>
        NiveauKiesScreen(m, 'speel-na', 'Speel na', (m2, n) => {
          const naarWinkel = (koop?: Instrument): void => {
            speelSchermOvergang();
            m2.push((m3) => WinkelScreen(m3, { soort: 'instrument', koop }));
          };
          return RondeScreen(m2, 'Speel na', maakSpeelNaVragen(n, naarWinkel), muziekMunten(niveauOmschrijving('speel-na', n).max));
        }),
    },
    {
      icoon: 'trommel',
      label: 'Ritme',
      open: (m) => NiveauKiesScreen(m, 'ritme', 'Ritme', (m2, n) => RondeScreen(m2, 'Ritme', maakRitmeVragen(n), muziekMunten(niveauOmschrijving('ritme', n).max))),
    },
  ]);
}
