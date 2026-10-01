import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { maakTopRechtsBalk } from '../components/TopRechtsBalk.ts';
import { maakXylofoon } from '../../games/muziek/xylofoon.ts';

// Vrij spelen op de xylofoon: acht staven, geen opdracht, geen goed of fout.
export function XylofoonScreen(manager: ScreenManager): Screen {
  const el = document.createElement('div');
  el.className = 'scherm';

  const titel = document.createElement('h1');
  titel.className = 'scherm-titel';
  titel.textContent = 'Xylofoon';
  el.appendChild(titel);

  const kaart = document.createElement('div');
  kaart.className = 'oefen-kaart muziek-kaart muziek-kaart--vrij';
  const xylo = maakXylofoon([0, 1, 2, 3, 4, 5, 6, 7]);
  kaart.appendChild(xylo.element);
  el.appendChild(kaart);

  const terug = maakTerugKnop(() => manager.pop());
  let topRechts: ReturnType<typeof maakTopRechtsBalk> | null = null;

  return {
    mount(root) {
      root.appendChild(el);
      root.appendChild(terug);
      topRechts = maakTopRechtsBalk(manager);
      root.appendChild(topRechts.element);
    },
    unmount() {
      xylo.opruimen();
      el.remove();
      terug.remove();
      topRechts?.element.remove();
      topRechts?.vernietig();
      topRechts = null;
    },
  };
}
