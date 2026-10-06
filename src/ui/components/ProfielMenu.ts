import type { ScreenManager } from '../../engine/screenManager.ts';
import {
  AVATAR_KLEUREN,
  avatarFilter,
  avatarPad,
  haalActiefProfiel,
  wijzigProfielIcoon,
  wijzigProfielKleur,
} from '../../engine/profielStore.ts';
import { haalGroep, zetGroep } from '../../engine/progressStore.ts';
import { GROEP_NAAM } from '../../content/types.ts';
import { speelSchermOvergang } from '../../three/transitions.ts';
import { isGedempt, zetGedempt } from '../../engine/audioManager.ts';
import { huidigSchrift, kiesSchrift } from '../../engine/schrift.ts';
import { THEMAS, huidigThema, kiesAchtergrond } from '../../achtergrond/achtergrond.ts';
import { eigenAchtergronden, eigenFiguren } from '../../engine/winkel.ts';
import { maakBladeraar } from './Bladeraar.ts';
import { WinkelScreen } from '../screens/WinkelScreen.ts';
import { GROEPEN, groepIcoon } from '../screens/GroepKiesScreen.ts';
import { TopicSelectScreen } from '../screens/TopicSelectScreen.ts';
import { ProfileSelectScreen } from '../screens/ProfileSelectScreen.ts';

// Profielmenu als klein kaartje: bovenaan je eigen figuur met je naam (tik = ander profiel),
// daaronder vijf plaatjestegels (Mijn figuur, Achtergrond, Geluid, Schrift, Wisselen). Mijn
// figuur, Achtergrond en Wisselen (groep kiezen) openen een eigen submenu met een terugpijl;
// Geluid en Schrift schakelen meteen om. Zo blijft het hoofdmenu kort
// en kan een kind het zonder te lezen gebruiken (verzoek van de eigenaar: "te groot").

type Weergave = 'hoofd' | 'figuur' | 'achtergrond' | 'wisselen';

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
  // Tik op je naam: naar het profielenscherm.
  const kop = maak('button', 'profiel-menu__kop', hoofd);
  kop.setAttribute('aria-label', 'Ander profiel kiezen');
  kop.addEventListener('click', () => {
    sluitPaneel();
    speelSchermOvergang();
    manager.replace((m) => ProfileSelectScreen(m));
  });
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

  // Schrift: ook een schakelaar (losse letters ↔ aan elkaar). In plaats van een icoon een
  // voorbeeldwoordje in het gekozen schrift, zodat je het verschil meteen ziet.
  const schriftTegel = tegel('Schrift', '', () => {
    kiesSchrift(huidigSchrift() === 'los' ? 'aan-elkaar' : 'los');
    werkSchriftBij();
  });
  const schriftVoorbeeld = maak('span', 'profiel-tegel__schrift');
  schriftVoorbeeld.textContent = 'aap';
  schriftTegel.img.replaceWith(schriftVoorbeeld);
  function werkSchriftBij(): void {
    const aanElkaar = huidigSchrift() === 'aan-elkaar';
    schriftTegel.tekst.textContent = aanElkaar ? 'Aan elkaar' : 'Los';
    schriftTegel.knop.setAttribute('aria-label', aanElkaar ? 'Losse letters' : 'Letters aan elkaar');
  }
  werkSchriftBij();

  const huidigeGroep = haalGroep();
  const wisselTegel = tegel('Wisselen', groepIcoon(huidigeGroep), () => toon('wisselen'));
  wisselTegel.knop.classList.add('profiel-tegel--wissel');

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

  // Onderaan de figuren en achtergronden: naar de winkel voor meer.
  function winkelKnop(ouder: HTMLElement): void {
    const k = maak('button', 'profiel-menu__winkel', ouder);
    plaatje('assets/icons/munt.svg', '', k);
    k.append('Meer in de winkel');
    k.addEventListener('click', () => {
      sluitPaneel();
      speelSchermOvergang();
      manager.push((m) => WinkelScreen(m));
    });
  }

  // Mijn figuur: dier en kleur samen, zodat je meteen ziet hoe het eruitziet.
  const figuur = submenu('Mijn figuur');
  // Alleen wat je hebt (gratis of gekocht); de rest staat in de winkel. Veel figuren? Dan
  // per bladzijde zijwaarts bladeren.
  const avatarKnoppen: HTMLButtonElement[] = [];
  for (const id of eigenFiguren()) {
    const optie = maak('button', 'avatar-keuze');
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
  const smal = window.innerWidth < 560;
  const avatarBlader = maakBladeraar(avatarKnoppen, {
    kolommen: smal ? 3 : 5,
    rijen: window.innerHeight > 700 ? 3 : 2,
  });
  figuur.appendChild(avatarBlader.element);
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

  winkelKnop(figuur);

  const achtergrond = submenu('Achtergrond');
  const achtergrondRij = maak('div', 'achtergrond-rij', achtergrond);
  const achtergrondKnoppen: HTMLButtonElement[] = [];
  for (const thema of eigenAchtergronden()) {
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

  winkelKnop(achtergrond);

  // Wisselen: meteen de groepen (de huidige gemarkeerd); een tik gaat naar de onderwerpen
  // van die groep. Het submenu ertussen voorkomt dat je per ongeluk wisselt. Ander profiel
  // kies je via je naam bovenaan.
  const wisselen = submenu('Wisselen');
  const wisselRij = maak('div', 'profiel-menu__keuzes', wisselen);
  for (const groep of GROEPEN) {
    const k = maak('button', 'profiel-keuze', wisselRij);
    plaatje(groepIcoon(groep), '', k);
    k.append(GROEP_NAAM[groep]);
    k.classList.toggle('geselecteerd', groep === huidigeGroep);
    k.addEventListener('click', () => {
      zetGroep(groep);
      sluitPaneel();
      speelSchermOvergang();
      manager.replace((m) => TopicSelectScreen(m, groep));
    });
  }

  const weergaven: Record<Weergave, HTMLElement> = { hoofd, figuur, achtergrond, wisselen };

  function markeer(): void {
    for (const k of avatarKnoppen) k.classList.toggle('geselecteerd', k.dataset.icoon === icoonId());
    for (const k of kleurKnoppen) k.classList.toggle('geselecteerd', Number(k.dataset.kleur) === huidigeKleur);
    for (const k of achtergrondKnoppen) k.classList.toggle('geselecteerd', k.dataset.thema === huidigThema());
  }

  function toon(doel: Weergave): void {
    for (const [id, w] of Object.entries(weergaven)) w.hidden = id !== doel;
    paneel.dataset.weergave = doel;
    markeer();
    if (doel === 'figuur') avatarBlader.naarItem(Math.max(0, avatarKnoppen.findIndex((k) => k.dataset.icoon === icoonId())));
  }

  function sluitPaneel(): void {
    paneel.hidden = true;
    knop.setAttribute('aria-expanded', 'false');
    toon('hoofd');
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
    // Het pijltje bovenaan het paneel wijst naar het midden van de profielknop.
    const k = knop.getBoundingClientRect();
    paneel.style.setProperty('--pijl-rechts', `${Math.max(12, window.innerWidth - 12 - (k.left + k.width / 2) - 8)}px`);
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
