import type { ScreenManager } from '../../engine/screenManager.ts';
import { haalActiefProfiel, avatarPad } from '../../engine/profielStore.ts';
import { speelSchermOvergang } from '../../three/transitions.ts';
import { AgeSelectScreen } from '../screens/AgeSelectScreen.ts';
import { ProfileSelectScreen } from '../screens/ProfileSelectScreen.ts';

export function maakProfielMenu(manager: ScreenManager): { element: HTMLElement; vernietig: () => void } {
  const profiel = haalActiefProfiel();

  const element = document.createElement('div');
  element.className = 'profiel-menu';

  const knop = document.createElement('button');
  knop.className = 'profiel-knop';
  knop.setAttribute('aria-label', 'Profielmenu');
  const icoon = document.createElement('img');
  icoon.src = avatarPad(profiel?.icoonId ?? 'vos');
  icoon.alt = '';
  knop.appendChild(icoon);
  element.appendChild(knop);

  const paneel = document.createElement('div');
  paneel.className = 'profiel-menu__paneel';
  paneel.hidden = true;

  const naam = document.createElement('p');
  naam.className = 'profiel-menu__naam';
  naam.textContent = profiel?.naam ?? '';
  paneel.appendChild(naam);

  const leeftijdKnop = document.createElement('button');
  leeftijdKnop.className = 'profiel-menu__optie';
  leeftijdKnop.textContent = 'Andere leeftijd kiezen';
  leeftijdKnop.addEventListener('click', () => {
    sluitPaneel();
    speelSchermOvergang();
    manager.replace((m) => AgeSelectScreen(m));
  });
  paneel.appendChild(leeftijdKnop);

  const profielKnop = document.createElement('button');
  profielKnop.className = 'profiel-menu__optie';
  profielKnop.textContent = 'Ander profiel';
  profielKnop.addEventListener('click', () => {
    sluitPaneel();
    speelSchermOvergang();
    manager.replace((m) => ProfileSelectScreen(m));
  });
  paneel.appendChild(profielKnop);

  element.appendChild(paneel);

  function sluitPaneel(): void {
    paneel.hidden = true;
    document.removeEventListener('pointerdown', opBuitenKlik);
  }

  function opBuitenKlik(event: PointerEvent): void {
    if (!element.contains(event.target as Node)) sluitPaneel();
  }

  knop.addEventListener('click', () => {
    paneel.hidden = !paneel.hidden;
    if (!paneel.hidden) {
      // volgende tick, anders vangt dezelfde klik het paneel meteen weer dicht
      setTimeout(() => document.addEventListener('pointerdown', opBuitenKlik), 0);
    }
  });

  return {
    element,
    vernietig: () => document.removeEventListener('pointerdown', opBuitenKlik),
  };
}
