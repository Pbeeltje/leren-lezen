import type { ScreenManager } from '../../engine/screenManager.ts';
import {
  AVATAR_ICONEN,
  AVATAR_KLEUREN,
  avatarFilter,
  avatarPad,
  haalActiefProfiel,
  wijzigProfielIcoon,
  wijzigProfielKleur,
} from '../../engine/profielStore.ts';
import { speelSchermOvergang } from '../../three/transitions.ts';
import { AgeSelectScreen } from '../screens/AgeSelectScreen.ts';
import { ProfileSelectScreen } from '../screens/ProfileSelectScreen.ts';

export function maakProfielMenu(manager: ScreenManager): { element: HTMLElement; vernietig: () => void } {
  const profiel = haalActiefProfiel();
  let huidigeKleur = profiel?.kleur ?? 0;

  const element = document.createElement('div');
  element.className = 'profiel-menu';

  const knop = document.createElement('button');
  knop.className = 'profiel-knop';
  knop.setAttribute('aria-label', 'Profielmenu');
  const icoon = document.createElement('img');
  icoon.src = avatarPad(profiel?.icoonId ?? 'vos');
  icoon.style.filter = avatarFilter(huidigeKleur);
  icoon.alt = '';
  knop.appendChild(icoon);
  element.appendChild(knop);

  const paneel = document.createElement('div');
  paneel.className = 'profiel-menu__paneel';
  paneel.hidden = true;

  const hoofdWeergave = document.createElement('div');
  hoofdWeergave.className = 'profiel-menu__weergave';

  const naam = document.createElement('p');
  naam.className = 'profiel-menu__naam';
  naam.textContent = profiel?.naam ?? '';
  hoofdWeergave.appendChild(naam);

  const avatarKnop = document.createElement('button');
  avatarKnop.className = 'profiel-menu__optie';
  avatarKnop.textContent = 'Avatar wijzigen';
  avatarKnop.addEventListener('click', () => wisselWeergave(avatarWeergave));
  hoofdWeergave.appendChild(avatarKnop);

  const kleurKnop = document.createElement('button');
  kleurKnop.className = 'profiel-menu__optie';
  kleurKnop.textContent = 'Kleur wijzigen';
  kleurKnop.addEventListener('click', () => wisselWeergave(kleurWeergave));
  hoofdWeergave.appendChild(kleurKnop);

  const leeftijdKnop = document.createElement('button');
  leeftijdKnop.className = 'profiel-menu__optie';
  leeftijdKnop.textContent = 'Andere leeftijd kiezen';
  leeftijdKnop.addEventListener('click', () => {
    sluitPaneel();
    speelSchermOvergang();
    manager.replace((m) => AgeSelectScreen(m));
  });
  hoofdWeergave.appendChild(leeftijdKnop);

  const profielKnop = document.createElement('button');
  profielKnop.className = 'profiel-menu__optie';
  profielKnop.textContent = 'Ander profiel';
  profielKnop.addEventListener('click', () => {
    sluitPaneel();
    speelSchermOvergang();
    manager.replace((m) => ProfileSelectScreen(m));
  });
  hoofdWeergave.appendChild(profielKnop);

  paneel.appendChild(hoofdWeergave);

  const avatarIconAfbeeldingen: HTMLImageElement[] = [];
  const avatarWeergave = document.createElement('div');
  avatarWeergave.className = 'avatar-grid avatar-grid--klein';
  avatarWeergave.hidden = true;
  for (const icoonId of AVATAR_ICONEN) {
    const optie = document.createElement('button');
    optie.className = 'avatar-keuze';
    const optieIcoon = document.createElement('img');
    optieIcoon.src = avatarPad(icoonId);
    optieIcoon.style.filter = avatarFilter(huidigeKleur);
    optieIcoon.alt = '';
    optie.appendChild(optieIcoon);
    avatarIconAfbeeldingen.push(optieIcoon);
    optie.addEventListener('click', () => {
      if (!profiel) return;
      wijzigProfielIcoon(profiel.id, icoonId);
      profiel.icoonId = icoonId;
      icoon.src = avatarPad(icoonId);
      sluitPaneel();
    });
    avatarWeergave.appendChild(optie);
  }
  paneel.appendChild(avatarWeergave);

  const kleurWeergave = document.createElement('div');
  kleurWeergave.className = 'kleur-rij';
  kleurWeergave.hidden = true;
  for (const kleur of AVATAR_KLEUREN) {
    const optie = document.createElement('button');
    optie.className = 'kleur-keuze';
    if (kleur === huidigeKleur) optie.classList.add('geselecteerd');
    const voorbeeld = document.createElement('img');
    voorbeeld.src = avatarPad(profiel?.icoonId ?? 'vos');
    voorbeeld.style.filter = avatarFilter(kleur);
    voorbeeld.alt = '';
    optie.appendChild(voorbeeld);
    optie.addEventListener('click', () => {
      if (!profiel) return;
      wijzigProfielKleur(profiel.id, kleur);
      huidigeKleur = kleur;
      icoon.style.filter = avatarFilter(kleur);
      for (const img of avatarIconAfbeeldingen) img.style.filter = avatarFilter(kleur);
      sluitPaneel();
    });
    kleurWeergave.appendChild(optie);
  }
  paneel.appendChild(kleurWeergave);

  function wisselWeergave(doel: HTMLElement): void {
    hoofdWeergave.hidden = true;
    avatarWeergave.hidden = doel !== avatarWeergave;
    kleurWeergave.hidden = doel !== kleurWeergave;
  }

  element.appendChild(paneel);

  function sluitPaneel(): void {
    paneel.hidden = true;
    hoofdWeergave.hidden = false;
    avatarWeergave.hidden = true;
    kleurWeergave.hidden = true;
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
