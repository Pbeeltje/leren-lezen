import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { pasAchtergrondVanProfielToe } from '../../achtergrond/achtergrond.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { AVATAR_ICONEN, AVATAR_KLEUREN, avatarFilter, avatarPad, maakProfiel, zetActiefProfiel } from '../../engine/profielStore.ts';
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

  // Los van elkaar: het icoon-rooster toont altijd de ware kleuren (anders zijn de
  // vormen niet goed te onderscheiden), de kleur-rooster toont alleen het gekozen
  // icoon in elke tint — geen van beide beïnvloedt de ander qua weergave.
  let gekozenIcoon: string | null = null;
  let gekozenKleur = 0;
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
      werkKleurVoorbeeldenBij();
      werkKnopStatusBij();
    });
    iconKnoppen.push(knop);
    iconenRij.appendChild(knop);
  }

  const kleurenLabel = document.createElement('p');
  kleurenLabel.className = 'instructie-tekst instructie-tekst--donker';
  kleurenLabel.textContent = 'Kies een kleurtje';
  kaart.appendChild(kleurenLabel);

  const kleurenRij = document.createElement('div');
  kleurenRij.className = 'kleur-rij';
  kaart.appendChild(kleurenRij);

  const kleurKnoppen: HTMLButtonElement[] = [];
  const kleurVoorbeelden: HTMLImageElement[] = [];
  for (const kleur of AVATAR_KLEUREN) {
    const knop = document.createElement('button');
    knop.className = 'kleur-keuze';
    const voorbeeld = document.createElement('img');
    voorbeeld.src = avatarPad('vos'); // totdat een icoon gekozen is: een warmgekleurd voorbeeld
    voorbeeld.alt = '';
    voorbeeld.style.filter = avatarFilter(kleur);
    knop.appendChild(voorbeeld);
    if (kleur === 0) knop.classList.add('geselecteerd');
    knop.addEventListener('click', () => {
      gekozenKleur = kleur;
      for (const k of kleurKnoppen) k.classList.remove('geselecteerd');
      knop.classList.add('geselecteerd');
    });
    kleurKnoppen.push(knop);
    kleurVoorbeelden.push(voorbeeld);
    kleurenRij.appendChild(knop);
  }

  function werkKleurVoorbeeldenBij(): void {
    if (!gekozenIcoon) return;
    for (const img of kleurVoorbeelden) img.src = avatarPad(gekozenIcoon);
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
    const profiel = maakProfiel(invoer.value, gekozenIcoon, gekozenKleur);
    zetActiefProfiel(profiel.id);
    pasAchtergrondVanProfielToe();
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
