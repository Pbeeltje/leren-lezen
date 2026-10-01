import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { maakTopRechtsBalk } from '../components/TopRechtsBalk.ts';
import { maakXylofoon } from '../../games/muziek/xylofoon.ts';
import { maakDrumstel } from '../../games/muziek/drumstel.ts';

// Vrij spelen: geen opdracht, geen goed of fout. Twee knoppen bovenaan wisselen tussen de
// xylofoon (acht staven) en het hele drumstel (grote trom, snaredrum, bekken).
export function XylofoonScreen(manager: ScreenManager): Screen {
  const el = document.createElement('div');
  el.className = 'scherm';

  const wissel = document.createElement('div');
  wissel.className = 'muziek-wissel';
  el.appendChild(wissel);

  const kaart = document.createElement('div');
  kaart.className = 'oefen-kaart muziek-kaart muziek-kaart--vrij';
  el.appendChild(kaart);

  const xylo = maakXylofoon([0, 1, 2, 3, 4, 5, 6, 7]);
  const kit = maakDrumstel(['bas', 'snare', 'bekken']);

  const knoppen = (
    [
      ['xylofoon', 'Xylofoon', xylo.element],
      ['trommel', 'Drumstel', kit.element],
    ] as const
  ).map(([icoon, naam, inhoud]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'muziek-wissel__knop';
    b.setAttribute('aria-label', naam);
    b.innerHTML = `<img src="assets/icons/${icoon}.svg" alt=""><span>${naam}</span>`;
    b.addEventListener('click', () => {
      kaart.replaceChildren(inhoud);
      kaart.classList.toggle('muziek-kaart--drums', inhoud === kit.element);
      for (const k of knoppen) k.classList.toggle('muziek-wissel__knop--aan', k === b);
    });
    wissel.appendChild(b);
    return b;
  });
  knoppen[0].click();

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
