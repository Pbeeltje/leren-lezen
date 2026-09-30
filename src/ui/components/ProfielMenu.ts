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
import { isGedempt, zetGedempt } from '../../engine/audioManager.ts';
import { THEMAS, huidigThema, kiesAchtergrond } from '../../achtergrond/achtergrond.ts';
import { leesBackupCode, maakBackupCode, zetBackupTerug } from '../../engine/backup.ts';
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

  const achtergrondKnop = document.createElement('button');
  achtergrondKnop.className = 'profiel-menu__optie';
  achtergrondKnop.textContent = 'Achtergrond kiezen';
  achtergrondKnop.addEventListener('click', () => wisselWeergave(achtergrondWeergave));
  hoofdWeergave.appendChild(achtergrondKnop);

  const geluidKnop = document.createElement('button');
  geluidKnop.className = 'profiel-menu__optie';
  const geluidIcoon = document.createElement('img');
  geluidIcoon.className = 'profiel-menu__optie-icoon';
  geluidIcoon.alt = '';
  geluidKnop.appendChild(geluidIcoon);
  const geluidTekst = document.createElement('span');
  geluidKnop.appendChild(geluidTekst);
  function werkGeluidKnopBij(): void {
    const gedempt = isGedempt();
    geluidIcoon.src = gedempt ? 'assets/icons/geluid-uit.svg' : 'assets/icons/geluid.svg';
    geluidTekst.textContent = gedempt ? 'Geluid aanzetten' : 'Geluid uitzetten';
  }
  werkGeluidKnopBij();
  geluidKnop.addEventListener('click', () => {
    zetGedempt(!isGedempt());
    werkGeluidKnopBij();
    // Blijft expres open (i.t.t. de andere opties) -- dit is een aan/uit-schakelaar,
    // geen navigatie, dus geen reden om het paneel te sluiten na een klik.
  });
  hoofdWeergave.appendChild(geluidKnop);

  const leeftijdKnop = document.createElement('button');
  leeftijdKnop.className = 'profiel-menu__optie';
  leeftijdKnop.textContent = 'Andere leeftijd kiezen';
  leeftijdKnop.addEventListener('click', () => {
    sluitPaneel();
    speelSchermOvergang();
    manager.replace((m) => AgeSelectScreen(m));
  });
  hoofdWeergave.appendChild(leeftijdKnop);

  const backupKnop = document.createElement('button');
  backupKnop.className = 'profiel-menu__optie';
  backupKnop.textContent = 'Back-up';
  backupKnop.addEventListener('click', () => wisselWeergave(backupWeergave));
  hoofdWeergave.appendChild(backupKnop);

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

  const avatarWeergave = document.createElement('div');
  avatarWeergave.className = 'avatar-grid avatar-grid--klein';
  avatarWeergave.hidden = true;
  for (const icoonId of AVATAR_ICONEN) {
    const optie = document.createElement('button');
    optie.className = 'avatar-keuze';
    const optieIcoon = document.createElement('img');
    optieIcoon.src = avatarPad(icoonId);
    // Bewust géén avatarFilter hier: dit rooster laat kiezen tússen dieren, dus moet
    // hun ware kleuren tonen. Kleurtinten horen alleen bij het aparte kleur-rooster
    // hieronder (zie "de kleuren-avatar-koppeling is stuk" in de sessienotities).
    optieIcoon.alt = '';
    optie.appendChild(optieIcoon);
    optie.addEventListener('click', () => {
      if (!profiel) return;
      wijzigProfielIcoon(profiel.id, icoonId);
      profiel.icoonId = icoonId;
      icoon.src = avatarPad(icoonId);
      for (const img of kleurVoorbeelden) img.src = avatarPad(icoonId);
      sluitPaneel();
    });
    avatarWeergave.appendChild(optie);
  }
  paneel.appendChild(avatarWeergave);

  const kleurVoorbeelden: HTMLImageElement[] = [];
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
    kleurVoorbeelden.push(voorbeeld);
    optie.addEventListener('click', () => {
      if (!profiel) return;
      wijzigProfielKleur(profiel.id, kleur);
      huidigeKleur = kleur;
      icoon.style.filter = avatarFilter(kleur);
      sluitPaneel();
    });
    kleurWeergave.appendChild(optie);
  }
  paneel.appendChild(kleurWeergave);

  const achtergrondWeergave = document.createElement('div');
  achtergrondWeergave.className = 'achtergrond-rij';
  achtergrondWeergave.hidden = true;
  const achtergrondKnoppen: HTMLButtonElement[] = [];
  for (const thema of THEMAS) {
    const optie = document.createElement('button');
    optie.className = 'achtergrond-keuze';
    const voorbeeld = document.createElement('img');
    voorbeeld.src = thema.voorbeeld;
    voorbeeld.alt = '';
    optie.append(voorbeeld, thema.naam);
    optie.dataset.thema = thema.id;
    optie.addEventListener('click', () => {
      kiesAchtergrond(thema.id);
      sluitPaneel();
    });
    achtergrondKnoppen.push(optie);
    achtergrondWeergave.appendChild(optie);
  }
  paneel.appendChild(achtergrondWeergave);

  // Back-up: voortgang overzetten naar een ander apparaat (voor ouders).
  const backupWeergave = document.createElement('div');
  backupWeergave.className = 'backup-weergave';
  backupWeergave.hidden = true;
  const uitleg = document.createElement('p');
  uitleg.className = 'backup-uitleg';
  uitleg.textContent = 'Zet alle profielen en voortgang over naar een ander apparaat.';
  const maakKnop = document.createElement('button');
  maakKnop.className = 'profiel-menu__optie';
  const kanDelen = typeof navigator.share === 'function';
  maakKnop.textContent = kanDelen ? 'Back-up delen' : 'Back-up kopiëren';
  const codeVak = document.createElement('textarea');
  codeVak.className = 'backup-code';
  codeVak.placeholder = 'Plak hier een back-up-code';
  codeVak.rows = 3;
  const terugKnop = document.createElement('button');
  terugKnop.className = 'profiel-menu__optie';
  terugKnop.textContent = 'Terugzetten';
  const melding = document.createElement('p');
  melding.className = 'backup-melding';
  backupWeergave.append(uitleg, maakKnop, codeVak, terugKnop, melding);
  paneel.appendChild(backupWeergave);

  maakKnop.addEventListener('click', async () => {
    try {
      const code = await maakBackupCode();
      codeVak.value = code;
      if (kanDelen) {
        await navigator.share({ title: 'Leren Lezen back-up', text: code }).catch(() => undefined);
        melding.textContent = 'Code staat ook hierboven.';
      } else {
        await navigator.clipboard?.writeText(code).catch(() => undefined);
        codeVak.select();
        melding.textContent = 'Gekopieerd!';
      }
    } catch {
      melding.textContent = 'Back-up maken lukte niet.';
    }
  });
  terugKnop.addEventListener('click', async () => {
    try {
      const { backup, namen } = await leesBackupCode(codeVak.value);
      const lijst = namen.length ? namen.join(', ') : 'geen profielen';
      if (!window.confirm(`Deze profielen terugzetten: ${lijst}?
Bestaande profielen met dezelfde naam worden overschreven.`)) return;
      zetBackupTerug(backup);
      location.reload();
    } catch {
      melding.textContent = 'Dat is geen geldige back-up-code.';
    }
  });

  function wisselWeergave(doel: HTMLElement): void {
    hoofdWeergave.hidden = true;
    avatarWeergave.hidden = doel !== avatarWeergave;
    kleurWeergave.hidden = doel !== kleurWeergave;
    achtergrondWeergave.hidden = doel !== achtergrondWeergave;
    backupWeergave.hidden = doel !== backupWeergave;
    for (const k of achtergrondKnoppen) k.classList.toggle('geselecteerd', k.dataset.thema === huidigThema());
  }

  element.appendChild(paneel);

  function sluitPaneel(): void {
    paneel.hidden = true;
    hoofdWeergave.hidden = false;
    avatarWeergave.hidden = true;
    kleurWeergave.hidden = true;
    achtergrondWeergave.hidden = true;
    backupWeergave.hidden = true;
    codeVak.value = '';
    melding.textContent = '';
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
