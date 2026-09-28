import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { maakMuntenTeller } from '../components/MuntenTeller.ts';

export function ComingSoonScreen(manager: ScreenManager, onderwerpTitel: string): Screen {
  const el = document.createElement('div');
  el.className = 'scherm';

  const kaart = document.createElement('div');
  kaart.className = 'komt-eraan-kaart';

  const icoon = document.createElement('img');
  icoon.src = '/assets/icons/ster.svg';
  icoon.alt = '';
  kaart.appendChild(icoon);

  const tekst = document.createElement('p');
  tekst.className = 'komt-eraan-kaart__tekst';
  tekst.textContent = `${onderwerpTitel} komt binnenkort!`;
  kaart.appendChild(tekst);

  el.appendChild(kaart);

  const terug = maakTerugKnop(() => manager.pop());
  let munten: ReturnType<typeof maakMuntenTeller> | null = null;

  return {
    mount(root) {
      root.appendChild(el);
      root.appendChild(terug);
      munten = maakMuntenTeller();
      root.appendChild(munten.element);
    },
    unmount() {
      el.remove();
      terug.remove();
      munten?.element.remove();
      munten?.vernietig();
      munten = null;
    },
  };
}
