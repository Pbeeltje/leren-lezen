import type { ScreenManager } from '../../engine/screenManager.ts';
import { maakProfielMenu } from './ProfielMenu.ts';
import { maakMuntenTeller } from './MuntenTeller.ts';
import { WinkelScreen } from '../screens/WinkelScreen.ts';
import { speelSchermOvergang } from '../../three/transitions.ts';

// Combineert het profielmenu en de muntenteller tot één cluster rechtsboven,
// zodat elk scherm ná de profiel-/groepkeuze deze met één aanroep kan tonen.
export function maakTopRechtsBalk(manager: ScreenManager): { element: HTMLElement; vernietig: () => void } {
  const element = document.createElement('div');
  element.className = 'top-rechts-balk';

  const profielMenu = maakProfielMenu(manager);
  // Tik op je munten: naar de winkel.
  const munten = maakMuntenTeller(() => {
    speelSchermOvergang();
    manager.push((m) => WinkelScreen(m));
  });
  element.appendChild(profielMenu.element);
  element.appendChild(munten.element);

  return {
    element,
    vernietig: () => {
      profielMenu.vernietig();
      munten.vernietig();
    },
  };
}
