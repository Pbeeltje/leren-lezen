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
import { haalVoortgang } from '../../engine/progressStore.ts';
import { speelSchermOvergang } from '../../three/transitions.ts';
import { isGedempt, zetGedempt } from '../../engine/audioManager.ts';
import { THEMAS, huidigThema, kiesAchtergrond } from '../../achtergrond/achtergrond.ts';
import { leesBackupCode, maakBackupCode, zetBackupTerug } from '../../engine/backup.ts';
import { AgeSelectScreen } from '../screens/AgeSelectScreen.ts';
import { ProfileSelectScreen } from '../screens/ProfileSelectScreen.ts';

// Profielmenu als klein kaartje: bovenaan je eigen figuur met je naam, daaronder vier
// plaatjestegels (Mijn figuur, Achtergrond, Geluid, Wisselen) en onderaan een klein
// "Voor ouders"-knopje voor de back-up. Elke tegel behalve Geluid opent een eigen
// submenu met een terugpijl; Geluid schakelt meteen om. Zo blijft het hoofdmenu kort
// en kan een kind het zonder te lezen gebruiken (verzoek van de eigenaar: "te groot").

type Weergave = 'hoofd' | 'figuur' | 'achtergrond' | 'wisselen' | 'ouders';

function maak<K extends keyof HTMLElementTagNameMap>(tag: K, klasse: string, ouder?: HTMLElement): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  e.className = klasse;
  if (e instanceof HTMLButtonElement) e.type = 'button';
  ouder?.appendChild(e);
  return e;
}

function plaatje(src: string, klasse: string, ouder: HTMLElement): HTMLImageElement {
  const img = maak('img', klasse, ouder);
  img.src = src;
  img.alt = '';
  return img;
}

export function maakProfielMenu(manager: ScreenManager): { element: HTMLElement; vernietig: () => void } {
  const profiel = haalActiefProfiel();
  let huidigeKleur = profiel?.kleur ?? 0;
  const icoonId = () => profiel?.icoonId ?? 'vos';

  const element = maak('div', 'profiel-menu');

  const knop = maak('button', 'profiel-knop', element);
  knop.setAttribute('aria-label', 'Profielmenu');
  knop.setAttribute('aria-expanded', 'false');
  const icoon = plaatje(avatarPad(icoonId()), '', knop);

  const paneel = maak('div', 'profiel-menu__paneel', element);
  paneel.hidden = true;

  // Alle plekken waar het eigen figuur te zien is, zodat een nieuwe keuze overal meteen klopt.
  const figuurPlaatjes: HTMLImageElement[] = [icoon];
  const kleurVoorbeelden: HTMLImageElement[] = [];
  const werkFiguurBij = () => {
    for (const img of figuurPlaatjes) {
      img.src = avatarPad(icoonId());
      img.style.filter = avatarFilter(huidigeKleur);
    }
    for (const img of kleurVoorbeelden) img.src = avatarPad(icoonId());
  };

  // ---- Hoofdweergave ----
  const hoofd = maak('div', 'profiel-menu__weergave', paneel);
  const kop = maak('div', 'profiel-menu__kop', hoofd);
  figuurPlaatjes.push(plaatje(avatarPad(icoonId()), 'profiel-menu__kop-figuur', kop));
  const naam = maak('p', 'profiel-menu__naam', kop);
  naam.textContent = profiel?.naam ?? '';

  const tegels = maak('div', 'profiel-menu__tegels', hoofd);
  function tegel(label: string, src: string, opKlik: () => void): { knop: HTMLButtonElement; img: HTMLImageElement; tekst: HTMLSpanElement } {
    const t = maak('button', 'profiel-tegel', tegels);
    t.setAttribute('aria-label', label);
    const img = plaatje(src, 'profiel-tegel__icoon', t);
    const tekst = maak('span', 'profiel-tegel__tekst', t);
    tekst.textContent = label;
    t.addEventListener('click', opKlik);
    return { knop: t, img, tekst };
  }

  const figuurTegel = tegel('Mijn figuur', avatarPad(icoonId()), () => toon('figuur'));
  figuurPlaatjes.push(figuurTegel.img);
  const themaVoorbeeld = () => THEMAS.find((t) => t.id === huidigThema())?.voorbeeld ?? THEMAS[0].voorbeeld;
  const achtergrondTegel = tegel('Achtergrond', themaVoorbeeld(), () => toon('achtergrond'));

  // Geluid opent geen submenu: het is een schakelaar en het menu blijft gewoon open.
  const geluidTegel = tegel('Geluid', 'assets/icons/geluid.svg', () => {
    zetGedempt(!isGedempt());
    werkGeluidBij();
  });
  function werkGeluidBij(): void {
    const gedempt = isGedempt();
    geluidTegel.img.src = gedempt ? 'assets/icons/geluid-uit.svg' : 'assets/icons/geluid.svg';
    geluidTegel.tekst.textContent = gedempt ? 'Geluid uit' : 'Geluid aan';
    geluidTegel.knop.setAttribute('aria-label', gedempt ? 'Geluid aanzetten' : 'Geluid uitzetten');
    geluidTegel.knop.classList.toggle('profiel-tegel--uit', gedempt);
  }
  werkGeluidBij();

  const leeftijd = haalVoortgang().laatstGekozenLeeftijd;
  const leeftijdIcoon = `assets/icons/leeftijd-${leeftijd ?? 6}.svg`;
  const wisselTegel = tegel('Wisselen', leeftijdIcoon, () => toon('wisselen'));
  wisselTegel.knop.classList.add('profiel-tegel--wissel');

  const oudersKnop = maak('button', 'profiel-menu__ouders', hoofd);
  plaatje('assets/icons/slot.svg', '', oudersKnop);
  oudersKnop.append('Voor ouders');
  oudersKnop.addEventListener('click', () => toon('ouders'));

  // ---- Submenu's: elk met een kopregel (terugpijl + titel) ----
  function submenu(titel: string): HTMLElement {
    const w = maak('div', 'profiel-menu__weergave profiel-menu__sub', paneel);
    const regel = maak('div', 'profiel-menu__subkop', w);
    const terug = maak('button', 'profiel-menu__terug', regel);
    terug.setAttribute('aria-label', 'Terug');
    plaatje('assets/icons/terug.svg', '', terug);
    terug.addEventListener('click', () => toon('hoofd'));
    const h = maak('p', 'profiel-menu__subtitel', regel);
    h.textContent = titel;
    return w;
  }

  // Mijn figuur: dier en kleur samen, zodat je meteen ziet hoe het eruitziet.
  const figuur = submenu('Mijn figuur');
  const avatarRooster = maak('div', 'avatar-grid avatar-grid--klein', figuur);
  const avatarKnoppen: HTMLButtonElement[] = [];
  for (const id of AVATAR_ICONEN) {
    const optie = maak('button', 'avatar-keuze', avatarRooster);
    optie.dataset.icoon = id;
    // Bewust géén avatarFilter hier: dit rooster laat kiezen tússen dieren, dus moet
    // hun ware kleuren tonen. Kleurtinten horen alleen bij het kleur-rooster hieronder.
    plaatje(avatarPad(id), '', optie);
    optie.addEventListener('click', () => {
      if (!profiel) return;
      wijzigProfielIcoon(profiel.id, id);
      profiel.icoonId = id;
      werkFiguurBij();
      markeer();
    });
    avatarKnoppen.push(optie);
  }
  const kleurLabel = maak('p', 'profiel-menu__label', figuur);
  kleurLabel.textContent = 'Kleur';
  const kleurRij = maak('div', 'kleur-rij', figuur);
  const kleurKnoppen: HTMLButtonElement[] = [];
  for (const kleur of AVATAR_KLEUREN) {
    const optie = maak('button', 'kleur-keuze', kleurRij);
    optie.dataset.kleur = String(kleur);
    const voorbeeld = plaatje(avatarPad(icoonId()), '', optie);
    voorbeeld.style.filter = avatarFilter(kleur);
    kleurVoorbeelden.push(voorbeeld);
    optie.addEventListener('click', () => {
      if (!profiel) return;
      wijzigProfielKleur(profiel.id, kleur);
      huidigeKleur = kleur;
      werkFiguurBij();
      markeer();
    });
    kleurKnoppen.push(optie);
  }

  const achtergrond = submenu('Achtergrond');
  const achtergrondRij = maak('div', 'achtergrond-rij', achtergrond);
  const achtergrondKnoppen: HTMLButtonElement[] = [];
  for (const thema of THEMAS) {
    const optie = maak('button', 'achtergrond-keuze', achtergrondRij);
    plaatje(thema.voorbeeld, '', optie);
    optie.append(thema.naam);
    optie.dataset.thema = thema.id;
    optie.addEventListener('click', () => {
      kiesAchtergrond(thema.id);
      achtergrondTegel.img.src = themaVoorbeeld();
      markeer();
    });
    achtergrondKnoppen.push(optie);
  }

  const wisselen = submenu('Wisselen');
  const wisselRij = maak('div', 'profiel-menu__keuzes', wisselen);
  function groteKeuze(label: string, src: string, opKlik: () => void): void {
    const k = maak('button', 'profiel-keuze', wisselRij);
    plaatje(src, '', k);
    k.append(label);
    k.addEventListener('click', () => {
      sluitPaneel();
      speelSchermOvergang();
      opKlik();
    });
  }
  groteKeuze('Ander profiel', 'assets/icons/avatar-panda.svg', () => manager.replace((m) => ProfileSelectScreen(m)));
  groteKeuze('Leeftijd', leeftijdIcoon, () => manager.replace((m) => AgeSelectScreen(m)));

  // Voor ouders: voortgang overzetten naar een ander apparaat.
  const ouders = submenu('Voor ouders');
  ouders.classList.add('backup-weergave');
  const uitleg = maak('p', 'backup-uitleg', ouders);
  uitleg.textContent = 'Back-up: zet alle profielen en voortgang over naar een ander apparaat.';
  const kanDelen = typeof navigator.share === 'function';
  const maakKnop = maak('button', 'profiel-menu__optie', ouders);
  maakKnop.textContent = kanDelen ? 'Back-up delen' : 'Back-up kopiëren';
  const codeVak = maak('textarea', 'backup-code', ouders);
  codeVak.placeholder = 'Plak hier een back-up-code';
  codeVak.rows = 3;
  const terugzetKnop = maak('button', 'profiel-menu__optie', ouders);
  terugzetKnop.textContent = 'Terugzetten';
  const melding = maak('p', 'backup-melding', ouders);

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
  terugzetKnop.addEventListener('click', async () => {
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

  const weergaven: Record<Weergave, HTMLElement> = { hoofd, figuur, achtergrond, wisselen, ouders };

  function markeer(): void {
    for (const k of avatarKnoppen) k.classList.toggle('geselecteerd', k.dataset.icoon === icoonId());
    for (const k of kleurKnoppen) k.classList.toggle('geselecteerd', Number(k.dataset.kleur) === huidigeKleur);
    for (const k of achtergrondKnoppen) k.classList.toggle('geselecteerd', k.dataset.thema === huidigThema());
  }

  function toon(doel: Weergave): void {
    for (const [id, w] of Object.entries(weergaven)) w.hidden = id !== doel;
    paneel.dataset.weergave = doel;
    markeer();
  }

  function sluitPaneel(): void {
    paneel.hidden = true;
    knop.setAttribute('aria-expanded', 'false');
    toon('hoofd');
    codeVak.value = '';
    melding.textContent = '';
    document.removeEventListener('pointerdown', opBuitenKlik);
  }

  function opBuitenKlik(event: PointerEvent): void {
    if (!element.contains(event.target as Node)) sluitPaneel();
  }

  knop.addEventListener('click', () => {
    if (!paneel.hidden) {
      sluitPaneel();
      return;
    }
    toon('hoofd');
    paneel.hidden = false;
    knop.setAttribute('aria-expanded', 'true');
    // volgende tick, anders vangt dezelfde klik het paneel meteen weer dicht
    setTimeout(() => document.addEventListener('pointerdown', opBuitenKlik), 0);
  });

  werkFiguurBij();
  toon('hoofd');

  return {
    element,
    vernietig: () => document.removeEventListener('pointerdown', opBuitenKlik),
  };
}
