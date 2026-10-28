import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { AVATAR_ICONEN, avatarFilter, avatarPad, haalActiefProfiel, wijzigProfielIcoon } from '../../engine/profielStore.ts';
import { haalVoortgang } from '../../engine/progressStore.ts';
import { events } from '../../engine/events.ts';
import { THEMAS, huidigThema, kiesAchtergrond, type ThemaId } from '../../achtergrond/achtergrond.ts';
import { heeft, huidigInstrument, kiesInstrument, koop, prijsVan, type WinkelSoort } from '../../engine/winkel.ts';
import { INSTRUMENTEN, speelInstrument, speelNoot, TONEN, type Instrument } from '../../engine/muziek.ts';
import { confetti } from '../../three/particles.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { maakBladeraar } from '../components/Bladeraar.ts';

// Muntenwinkel: je munten rechtsboven, drie tabbladen (Figuren / Achtergronden /
// Instrumenten) en de spullen per bladzijde om zijwaarts door te bladeren. Op een slotje
// staat de prijs; tik erop om te kopen. Wat je al hebt kies je hier ook meteen.
// start: met welk tabblad de winkel opent, en eventueel meteen het koopvenster van iets
// (vanuit Speel na / Vrij spelen: de munt of een instrument met een slotje).
//
// Hoeveel kaarten er per bladzijde passen wordt gemeten (breedte van het vak, hoogte die
// overblijft onder de tabbladen), niet gegokt per schermmaat: er komen steeds spullen bij.

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

// Kaartbreedte minimaal (px) en hoogstens zoveel kolommen, zodat kaarten niet te klein
// of te breed worden. Achtergrond- en instrumentkaarten hebben een naam, dus breder.
const RASTER: Record<WinkelSoort, { minBreedte: number; maxKolommen: number }> = {
  figuur: { minBreedte: 72, maxKolommen: 8 },
  achtergrond: { minBreedte: 76, maxKolommen: 7 },
  instrument: { minBreedte: 92, maxKolommen: 7 },
};
const GAT = 8; // gap tussen de kaarten, gelijk aan .winkel__blader .bladeraar__blad
const STIPPEN = 30; // hoogte van de bladzijde-stipjes (gap + 24px tikvlak)

const ARPEGGIO = [0, 2, 4, 7];

export function WinkelScreen(manager: ScreenManager, start?: { soort: WinkelSoort; koop?: string }): Screen {
  const profiel = haalActiefProfiel();
  const el = document.createElement('div');
  el.className = 'scherm winkel';

  const titel = document.createElement('h1');
  titel.className = 'scherm-titel winkel__titel';
  titel.textContent = 'Winkel';
  const beurs = document.createElement('div');
  beurs.className = 'winkel__beurs';
  beurs.setAttribute('aria-label', 'Munten');
  beurs.innerHTML = '<img src="assets/icons/munt.svg" alt=""><span></span>';
  const beursAantal = beurs.querySelector('span')!;
  const tabs = document.createElement('div');
  tabs.className = 'winkel__tabs';
  const vak = document.createElement('div');
  vak.className = 'winkel__vak';
  el.append(titel, tabs, vak);

  const SOORTEN: Record<WinkelSoort, { naam: string; tabIcoon: string; gekozen: () => string | undefined; kies: (id: string) => void }> = {
    figuur: {
      naam: 'Figuren',
      tabIcoon: avatarPad(profiel?.icoonId ?? 'kat'),
      gekozen: () => profiel?.icoonId,
      kies: (id) => {
        if (!profiel) return;
        wijzigProfielIcoon(profiel.id, id);
        profiel.icoonId = id;
      },
    },
    achtergrond: {
      naam: 'Achtergronden',
      tabIcoon: 'assets/icons/ster.svg',
      gekozen: huidigThema,
      kies: (id) => kiesAchtergrond(id as ThemaId),
    },
    instrument: {
      naam: 'Instrumenten',
      tabIcoon: 'assets/icons/harp.svg',
      gekozen: huidigInstrument,
      kies: (id) => kiesInstrument(id as Instrument),
    },
  };

  let soort: WinkelSoort = start?.soort ?? 'figuur';
  const tabKnoppen = (Object.keys(SOORTEN) as WinkelSoort[]).map((id) => {
    const k = document.createElement('button');
    k.type = 'button';
    k.className = 'winkel__tab';
    k.setAttribute('aria-label', SOORTEN[id].naam);
    k.innerHTML = `<img src="${SOORTEN[id].tabIcoon}" alt=""><span>${SOORTEN[id].naam}</span>`;
    k.addEventListener('click', () => {
      if (soort === id) return;
      soort = id;
      teken();
    });
    tabs.appendChild(k);
    return { id, k };
  });

  const munten = () => haalVoortgang().munten;

  function kies(a: Artikel): void {
    SOORTEN[a.soort].kies(a.id);
    teken();
  }

  function plaatje(a: Artikel, klasse?: string): HTMLImageElement {
    const img = document.createElement('img');
    img.src = a.plaatje;
    img.alt = '';
    if (klasse) img.className = klasse;
    if (a.soort === 'figuur') img.style.filter = avatarFilter(profiel?.kleur);
    return img;
  }

  function kaart(a: Artikel, eigen: boolean, gekozen: boolean, saldo: number): HTMLElement {
    const k = document.createElement('button');
    k.type = 'button';
    k.className = `winkel-kaart winkel-kaart--${a.soort}`;
    k.appendChild(plaatje(a));
    if (a.naam) {
      const n = document.createElement('span');
      n.className = 'winkel-kaart__naam';
      n.textContent = a.naam;
      k.appendChild(n);
    }
    const label = document.createElement('span');
    label.className = 'winkel-kaart__label';
    const prijs = prijsVan(a.soort, a.id);
    if (gekozen) {
      k.classList.add('winkel-kaart--gekozen');
      label.textContent = '✓';
      k.setAttribute('aria-label', `${a.naam || a.id}: gekozen`);
    } else if (eigen) {
      label.textContent = 'Kies';
      k.setAttribute('aria-label', `${a.naam || a.id} kiezen`);
    } else {
      k.classList.add('winkel-kaart--slot');
      const slot = document.createElement('img');
      slot.className = 'winkel-kaart__slot';
      slot.src = 'assets/icons/slot.svg';
      slot.alt = '';
      k.appendChild(slot);
      if (saldo < prijs) k.classList.add('winkel-kaart--te-duur');
      label.innerHTML = `<img src="assets/icons/munt.svg" alt="">${prijs}`;
      k.setAttribute('aria-label', `${a.naam || a.id} kopen voor ${prijs} munten`);
    }
    k.appendChild(label);
    k.addEventListener('click', () => (eigen ? kies(a) : vraagKoop(a)));
    return k;
  }

  // Hoeveel rijen van `hoogte` passen er in `ruimte`.
  const rijenIn = (ruimte: number, hoogte: number) => Math.max(1, Math.floor((ruimte + GAT) / (hoogte + GAT)));

  function teken(): void {
    beursAantal.textContent = String(munten());
    for (const t of tabKnoppen) t.k.classList.toggle('winkel__tab--aan', t.id === soort);
    el.dataset.soort = soort;

    // Wat je al hebt staat vooraan, dan hoef je niet te zoeken; verder de vaste volgorde.
    const alle = ARTIKELEN[soort];
    const eigen = new Set(alle.filter((a) => heeft(a.soort, a.id)).map((a) => a.id));
    const artikelen = [...alle.filter((a) => eigen.has(a.id)), ...alle.filter((a) => !eigen.has(a.id))];
    const gekozenId = SOORTEN[soort].gekozen();
    const saldo = munten();
    const kaarten = artikelen.map((a) => kaart(a, eigen.has(a.id), a.id === gekozenId, saldo));

    // Kolommen uit de breedte van het vak; daarna alles op één bladzijde zetten om de
    // hoogste kaart te meten, en zoveel rijen nemen als er in de overgebleven hoogte passen.
    const { minBreedte, maxKolommen } = RASTER[soort];
    const vakStijl = getComputedStyle(vak);
    const binnen = (kant: 'Left' | 'Top') =>
      parseFloat(vakStijl[`padding${kant}`]) + parseFloat(vakStijl[`padding${kant === 'Left' ? 'Right' : 'Bottom'}`]);
    const breedte = vak.clientWidth - binnen('Left');
    const kolommen = Math.max(2, Math.min(maxKolommen, Math.floor((breedte + GAT) / (minBreedte + GAT))));
    const klasse = `winkel__blader winkel__blader--${soort}`;
    vak.replaceChildren(maakBladeraar(kaarten, { kolommen, rijen: kaarten.length, klasse }).element);
    const kaartHoogte = Math.max(...kaarten.map((k) => k.offsetHeight));

    // Staan de tabbladen niet bovenin de balk (position: fixed), dan gaan ze van de hoogte af.
    const schermStijl = getComputedStyle(el);
    const tabsInVak = getComputedStyle(tabs).position === 'fixed' ? 0 : tabs.offsetHeight + parseFloat(schermStijl.rowGap);
    const ruimte =
      el.clientHeight -
      parseFloat(schermStijl.paddingTop) -
      parseFloat(schermStijl.paddingBottom) -
      tabsInVak -
      binnen('Top') -
      8; // de schaduw onder het vak
    let rijen = rijenIn(ruimte, kaartHoogte);
    // Past alles niet op één bladzijde, dan komen er stipjes onder: die ruimte eraf.
    if (kolommen * rijen < kaarten.length) rijen = rijenIn(ruimte - STIPPEN, kaartHoogte);
    rijen = Math.min(rijen, Math.ceil(kaarten.length / kolommen));

    const blader = maakBladeraar(kaarten, { kolommen, rijen, klasse });
    vak.replaceChildren(blader.element);
    const i = artikelen.findIndex((a) => a.id === gekozenId);
    if (i >= 0) blader.naarItem(i);
  }

  // Kopen: een groot venstertje met het plaatje, de naam en de prijs. Een instrument laat
  // zich meteen horen (en nog eens met de luidspreker). Te weinig munten? Dan zie je met
  // een spaarbalk hoe ver je bent, in plaats van een koopknop.
  let venster: HTMLElement | null = null;
  function sluitVenster(): void {
    venster?.remove();
    venster = null;
  }
  const speelVoor = (a: Artikel) => ARPEGGIO.forEach((t, i) => speelInstrument(a.id as Instrument, TONEN[t], i * 0.16));

  function vraagKoop(a: Artikel): void {
    sluitVenster();
    const prijs = prijsVan(a.soort, a.id);
    const saldo = munten();
    const tekort = prijs - saldo;
    venster = document.createElement('div');
    venster.className = 'winkel-venster';
    venster.addEventListener('click', (e) => {
      if (e.target === venster) sluitVenster();
    });
    const doos = document.createElement('div');
    doos.className = 'winkel-venster__doos';
    doos.appendChild(plaatje(a, 'winkel-venster__plaatje'));
    if (a.naam) {
      const naam = document.createElement('p');
      naam.className = 'winkel-venster__naam';
      naam.textContent = a.naam;
      doos.appendChild(naam);
    }
    if (a.soort === 'instrument') {
      const luister = document.createElement('button');
      luister.type = 'button';
      luister.className = 'winkel-venster__luister';
      luister.setAttribute('aria-label', 'Luisteren');
      luister.innerHTML = '<img src="assets/icons/luidspreker.svg" alt="">';
      luister.addEventListener('click', () => speelVoor(a));
      doos.appendChild(luister);
      speelVoor(a);
    }
    const prijsEl = document.createElement('p');
    prijsEl.className = 'winkel-venster__prijs';
    prijsEl.innerHTML = `<img src="assets/icons/munt.svg" alt="">${prijs}`;
    doos.appendChild(prijsEl);

    const knoppen = document.createElement('div');
    knoppen.className = 'winkel-venster__knoppen';
    const nee = document.createElement('button');
    nee.type = 'button';
    nee.className = 'winkel-venster__knop winkel-venster__knop--nee';
    nee.textContent = tekort > 0 ? 'Oké' : 'Nee';
    nee.addEventListener('click', sluitVenster);
    knoppen.append(nee);
    if (tekort > 0) {
      const balk = document.createElement('div');
      balk.className = 'winkel-venster__balk';
      balk.innerHTML = '<span></span>';
      balk.querySelector('span')!.style.width = `${Math.round((100 * Math.max(0, saldo)) / prijs)}%`;
      const sparen = document.createElement('p');
      sparen.className = 'winkel-venster__sparen';
      sparen.innerHTML = `Nog <b>${tekort}</b> <img src="assets/icons/munt.svg" alt=""> sparen!`;
      doos.append(balk, sparen);
    } else {
      const ja = document.createElement('button');
      ja.type = 'button';
      ja.className = 'winkel-venster__knop winkel-venster__knop--ja';
      ja.textContent = 'Kopen!';
      ja.addEventListener('click', () => {
        if (!koop(a.soort, a.id)) return;
        sluitVenster();
        if (a.soort === 'instrument') speelVoor(a);
        else ARPEGGIO.forEach((t, i) => speelNoot(TONEN[t], i * 0.09));
        confetti.vuurwerk('klein');
        kies(a);
      });
      knoppen.append(ja);
    }
    doos.appendChild(knoppen);
    venster.appendChild(doos);
    el.appendChild(venster);
  }

  const afmelden = events.on('munten-veranderd', () => {
    beursAantal.textContent = String(munten());
  });
  let resizeFrame = 0;
  const opResize = () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(teken);
  };

  const terug = maakTerugKnop(() => manager.pop());
  let meteenKopen = start?.koop ? ARTIKELEN[soort].find((a) => a.id === start.koop) : undefined;
  return {
    mount(root) {
      root.append(el, terug, beurs);
      // Pas in de pagina valt er iets te meten.
      teken();
      if (meteenKopen && !heeft(meteenKopen.soort, meteenKopen.id)) vraagKoop(meteenKopen);
      meteenKopen = undefined;
      window.addEventListener('resize', opResize);
    },
    unmount() {
      afmelden();
      cancelAnimationFrame(resizeFrame);
      window.removeEventListener('resize', opResize);
      el.remove();
      terug.remove();
      beurs.remove();
    },
  };
}
