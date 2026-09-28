import type { ScreenManager } from '../../engine/screenManager.ts';
import { maakProfielMenu } from './ProfielMenu.ts';
import { maakMuntenTeller } from './MuntenTeller.ts';

// Combineert het profielmenu en de muntenteller tot één cluster rechtsboven,
// zodat elk scherm ná de profiel-/leeftijdkeuze deze met één aanroep kan tonen.
export function maakTopRechtsBalk(manager: ScreenManager): { element: HTMLElement; vernietig: () => void } {
  const element = document.createElement('div');
  element.className = 'top-rechts-balk';

  const profielMenu = maakProfielMenu(manager);
  const munten = maakMuntenTeller();
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
