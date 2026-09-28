import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { AVATAR_ICONEN, avatarPad, maakProfiel, zetActiefProfiel } from '../../engine/profielStore.ts';
import { speelSchermOvergang } from '../../three/transitions.ts';
import { AgeSelectScreen } from './AgeSelectScreen.ts';

export function NewProfileScreen(manager: ScreenManager): Screen {
  const el = document.createElement('div');
  el.className = 'scherm';

  const titel = document.createElement('h1');
  titel.className = 'scherm-titel';
  titel.textContent = 'Maak je profiel';
  el.appendChild(titel);

  const kaart = document.createElement('div');
  kaart.className = 'profiel-vorm';
  el.appendChild(kaart);

  const invoer = document.createElement('input');
  invoer.type = 'text';
  invoer.className = 'typen-invoer';
  invoer.placeholder = 'Jouw naam';
  invoer.maxLength = 16;
  invoer.autocomplete = 'off';
  kaart.appendChild(invoer);

  const iconenLabel = document.createElement('p');
  iconenLabel.className = 'instructie-tekst instructie-tekst--donker';
  iconenLabel.textContent = 'Kies een icoon';
  kaart.appendChild(iconenLabel);

  const iconenRij = document.createElement('div');
  iconenRij.className = 'avatar-grid';
  kaart.appendChild(iconenRij);

  let gekozenIcoon: string | null = null;
  const iconKnoppen: HTMLButtonElement[] = [];

  for (const icoonId of AVATAR_ICONEN) {
    const knop = document.createElement('button');
    knop.className = 'avatar-keuze';
    const img = document.createElement('img');
    img.src = avatarPad(icoonId);
    img.alt = '';
    knop.appendChild(img);
    knop.addEventListener('click', () => {
      gekozenIcoon = icoonId;
      for (const k of iconKnoppen) k.classList.remove('geselecteerd');
      knop.classList.add('geselecteerd');
      werkKnopStatusBij();
    });
    iconKnoppen.push(knop);
    iconenRij.appendChild(knop);
  }

  const submitKnop = document.createElement('button');
  submitKnop.className = 'typen-knop';
  submitKnop.textContent = 'Aan de slag!';
  submitKnop.disabled = true;
  kaart.appendChild(submitKnop);

  function werkKnopStatusBij(): void {
    submitKnop.disabled = invoer.value.trim().length === 0 || !gekozenIcoon;
  }
  invoer.addEventListener('input', werkKnopStatusBij);

  submitKnop.addEventListener('click', () => {
    if (submitKnop.disabled || !gekozenIcoon) return;
    const profiel = maakProfiel(invoer.value, gekozenIcoon);
    zetActiefProfiel(profiel.id);
    speelSchermOvergang();
    manager.replace((m) => AgeSelectScreen(m));
  });

  const terug = maakTerugKnop(() => manager.pop());

  return {
    mount(root) {
      root.appendChild(el);
      root.appendChild(terug);
    },
    unmount() {
      el.remove();
      terug.remove();
    },
  };
}
