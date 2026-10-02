import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { AVATAR_ICONEN, avatarFilter, avatarPad, haalActiefProfiel, wijzigProfielIcoon } from '../../engine/profielStore.ts';
import { haalVoortgang } from '../../engine/progressStore.ts';
import { events } from '../../engine/events.ts';
import { THEMAS, huidigThema, kiesAchtergrond } from '../../achtergrond/achtergrond.ts';
import { heeft, huidigInstrument, kiesInstrument, koop, prijsVan, type WinkelSoort } from '../../engine/winkel.ts';
import { INSTRUMENTEN, speelNoot, TONEN, type Instrument } from '../../engine/muziek.ts';
import { confetti } from '../../three/particles.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { maakBladeraar } from '../components/Bladeraar.ts';

// Muntenwinkel: bovenaan je munten, dan drie tabbladen (Figuren / Achtergronden /
// Instrumenten) met de spullen per bladzijde om zijwaarts door te bladeren. Op een slotje
// staat de prijs; tik erop om te kopen. Wat je al hebt kies je hier ook meteen.
// start: met welk tabblad de winkel opent, en eventueel meteen het koopvenster van iets
// (vanuit Speel na / Vrij spelen: de munt of een instrument met een slotje).

interface Artikel {
  soort: WinkelSoort;
  id: string;
  naam: string;
  plaatje: string;
}

const ARTIKELEN: Record<WinkelSoort, Artikel[]> = {
  figuur: AVATAR_ICONEN.map((id) => ({ soort: 'figuur', id, naam: '', plaatje: avatarPad(id) })),
  achtergrond: THEMAS.map((t) => ({ soort: 'achtergrond', id: t.id, naam: t.naam, plaatje: t.voorbeeld })),
  instrument: INSTRUMENTEN.map((i) => ({ soort: 'instrument', id: i.id, naam: i.naam, plaatje: i.icoon })),
};

export function WinkelScreen(manager: ScreenManager, start?: { soort: WinkelSoort; koop?: string }): Screen {
  const profiel = haalActiefProfiel();
  const el = document.createElement('div');
  el.className = 'scherm winkel';

  const kop = document.createElement('div');
  kop.className = 'winkel__kop';
  const titel = document.createElement('h1');
  titel.className = 'scherm-titel';
  titel.textContent = 'Winkel';
  const beurs = document.createElement('div');
  beurs.className = 'winkel__beurs';
  beurs.innerHTML = '<img src="assets/icons/munt.svg" alt=""><span></span>';
  const beursAantal = beurs.querySelector('span')!;
  kop.append(titel, beurs);
  el.appendChild(kop);

  const tabs = document.createElement('div');
  tabs.className = 'winkel__tabs';
  el.appendChild(tabs);
  const vak = document.createElement('div');
  vak.className = 'winkel__vak';
  el.appendChild(vak);

  let soort: WinkelSoort = start?.soort ?? 'figuur';
  const tabKnoppen = (
    [
      ['figuur', 'Figuren', avatarPad(profiel?.icoonId ?? 'kat')],
      ['achtergrond', 'Achtergronden', 'assets/icons/ster.svg'],
      ['instrument', 'Instrumenten', 'assets/icons/gitaar.svg'],
    ] as const
  ).map(([id, naam, src]) => {
    const k = document.createElement('button');
    k.type = 'button';
    k.className = 'winkel__tab';
    k.setAttribute('aria-label', naam);
    k.innerHTML = `<img src="${src}" alt=""><span>${naam}</span>`;
    k.addEventListener('click', () => {
      soort = id;
      teken();
    });
    tabs.appendChild(k);
    return { id, k };
  });

  const munten = () => haalVoortgang().munten;
  const gekozen = (a: Artikel) =>
    a.soort === 'figuur' ? profiel?.icoonId === a.id : a.soort === 'instrument' ? huidigInstrument() === a.id : huidigThema() === a.id;

  function kies(a: Artikel): void {
    if (a.soort === 'figuur') {
      if (!profiel) return;
      wijzigProfielIcoon(profiel.id, a.id);
      profiel.icoonId = a.id;
    } else if (a.soort === 'instrument') {
      kiesInstrument(a.id as Instrument);
    } else {
      kiesAchtergrond(a.id as (typeof THEMAS)[number]['id']);
    }
    teken();
  }

  function kaart(a: Artikel): HTMLElement {
    const k = document.createElement('button');
    k.type = 'button';
    k.className = `winkel-kaart winkel-kaart--${a.soort}`;
    const img = document.createElement('img');
    img.src = a.plaatje;
    img.alt = '';
    if (a.soort === 'figuur') img.style.filter = avatarFilter(profiel?.kleur);
    k.appendChild(img);
    if (a.naam) {
      const n = document.createElement('span');
      n.className = 'winkel-kaart__naam';
      n.textContent = a.naam;
      k.appendChild(n);
    }
    const label = document.createElement('span');
    label.className = 'winkel-kaart__label';
    if (gekozen(a)) {
      k.classList.add('winkel-kaart--gekozen');
      label.textContent = '✓';
      k.setAttribute('aria-label', `${a.naam || a.id}: gekozen`);
    } else if (heeft(a.soort, a.id)) {
      label.textContent = 'Kies';
      k.setAttribute('aria-label', `${a.naam || a.id} kiezen`);
    } else {
      k.classList.add('winkel-kaart--slot');
      const slot = document.createElement('img');
      slot.className = 'winkel-kaart__slot';
      slot.src = 'assets/icons/slot.svg';
      slot.alt = '';
      k.appendChild(slot);
      if (munten() < prijsVan(a.soort, a.id)) k.classList.add('winkel-kaart--te-duur');
      label.innerHTML = `<img src="assets/icons/munt.svg" alt="">${prijsVan(a.soort, a.id)}`;
      k.setAttribute('aria-label', `${a.naam || a.id} kopen voor ${prijsVan(a.soort, a.id)} munten`);
    }
    k.appendChild(label);
    k.addEventListener('click', () => {
      if (heeft(a.soort, a.id)) kies(a);
      else vraagKoop(a);
    });
    return k;
  }

  function teken(): void {
    beursAantal.textContent = String(munten());
    for (const t of tabKnoppen) t.k.classList.toggle('winkel__tab--aan', t.id === soort);
    // Wat je al hebt staat vooraan, dan hoef je niet te zoeken; verder de vaste volgorde.
    const alle = ARTIKELEN[soort];
    const artikelen = [...alle.filter((a) => heeft(a.soort, a.id)), ...alle.filter((a) => !heeft(a.soort, a.id))];
    const smal = window.innerWidth < 560;
    const hoog = window.innerHeight;
    const opties =
      soort === 'figuur'
        ? { kolommen: smal ? 3 : 5, rijen: hoog > 700 ? 3 : 2 }
        : soort === 'instrument'
          ? { kolommen: smal ? 2 : 4, rijen: smal ? 2 : 1 }
          : // Kleine kaartjes, zodat alle achtergronden (en een paar nieuwe) op één bladzijde passen.
            { kolommen: smal ? 3 : 6, rijen: smal ? (hoog >= 700 ? 4 : 3) : hoog >= 620 ? 2 : 1 };
    const blader = maakBladeraar(artikelen.map(kaart), { ...opties, klasse: `winkel__blader winkel__blader--${soort}` });
    vak.replaceChildren(blader.element);
    const i = artikelen.findIndex(gekozen);
    if (i >= 0) blader.naarItem(i);
  }

  // Kopen: een groot venstertje met het plaatje en de prijs. Te weinig munten? Dan zie je
  // hoeveel je nog moet sparen in plaats van een koopknop.
  let venster: HTMLElement | null = null;
  function sluitVenster(): void {
    venster?.remove();
    venster = null;
  }
  function vraagKoop(a: Artikel): void {
    sluitVenster();
    const prijs = prijsVan(a.soort, a.id);
    const tekort = prijs - munten();
    venster = document.createElement('div');
    venster.className = 'winkel-venster';
    venster.addEventListener('click', (e) => {
      if (e.target === venster) sluitVenster();
    });
    const doos = document.createElement('div');
    doos.className = 'winkel-venster__doos';
    const img = document.createElement('img');
    img.src = a.plaatje;
    img.alt = '';
    img.className = 'winkel-venster__plaatje';
    if (a.soort === 'figuur') img.style.filter = avatarFilter(profiel?.kleur);
    const prijsEl = document.createElement('p');
    prijsEl.className = 'winkel-venster__prijs';
    prijsEl.innerHTML = `<img src="assets/icons/munt.svg" alt="">${prijs}`;
    const knoppen = document.createElement('div');
    knoppen.className = 'winkel-venster__knoppen';
    const nee = document.createElement('button');
    nee.type = 'button';
    nee.className = 'winkel-venster__knop winkel-venster__knop--nee';
    nee.textContent = tekort > 0 ? 'Oké' : 'Nee';
    nee.addEventListener('click', sluitVenster);
    if (tekort > 0) {
      const sparen = document.createElement('p');
      sparen.className = 'winkel-venster__sparen';
      sparen.innerHTML = `Nog <b>${tekort}</b> <img src="assets/icons/munt.svg" alt=""> sparen!`;
      knoppen.append(nee);
      doos.append(img, prijsEl, sparen, knoppen);
    } else {
      const ja = document.createElement('button');
      ja.type = 'button';
      ja.className = 'winkel-venster__knop winkel-venster__knop--ja';
      ja.textContent = 'Kopen!';
      ja.addEventListener('click', () => {
        if (!koop(a.soort, a.id)) return;
        sluitVenster();
        [0, 2, 4, 7].forEach((t, i) => speelNoot(TONEN[t], i * 0.09)); // do-mi-sol-do
        confetti.vuurwerk('klein');
        kies(a);
      });
      knoppen.append(nee, ja);
      doos.append(img, prijsEl, knoppen);
    }
    venster.appendChild(doos);
    el.appendChild(venster);
  }

  const afmelden = events.on('munten-veranderd', () => {
    beursAantal.textContent = String(munten());
  });
  const opResize = () => teken();
  teken();
  const meteenKopen = start?.koop && ARTIKELEN[soort].find((a) => a.id === start.koop);
  if (meteenKopen && !heeft(meteenKopen.soort, meteenKopen.id)) vraagKoop(meteenKopen);

  const terug = maakTerugKnop(() => manager.pop());
  return {
    mount(root) {
      root.appendChild(el);
      root.appendChild(terug);
      window.addEventListener('resize', opResize);
    },
    unmount() {
      afmelden();
      window.removeEventListener('resize', opResize);
      el.remove();
      terug.remove();
    },
  };
}
