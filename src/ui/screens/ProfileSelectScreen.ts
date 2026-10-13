import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { pasAchtergrondVanProfielToe } from '../../achtergrond/achtergrond.ts';
import { pasSchriftVanProfielToe } from '../../engine/schrift.ts';
import { maakIconTile } from '../components/IconTile.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { haalProfielen, zetActiefProfiel, avatarPad, avatarFilter, verwijderProfiel, type Profiel } from '../../engine/profielStore.ts';
import { haalGroep } from '../../engine/progressStore.ts';
import { ontgrendelAudio } from '../../engine/audioManager.ts';
import { speelSchermOvergang } from '../../three/transitions.ts';
import { GroepKiesScreen } from './GroepKiesScreen.ts';
import { TopicSelectScreen } from './TopicSelectScreen.ts';
import { NewProfileScreen } from './NewProfileScreen.ts';

function kiesProfiel(manager: ScreenManager, profiel: Profiel): void {
  ontgrendelAudio();
  zetActiefProfiel(profiel.id);
  pasAchtergrondVanProfielToe();
  pasSchriftVanProfielToe();
  speelSchermOvergang();

  const groep = haalGroep();
  if (groep) {
    manager.replace((m) => TopicSelectScreen(m, groep));
  } else {
    manager.replace((m) => GroepKiesScreen(m));
  }
}

export function ProfileSelectScreen(manager: ScreenManager): Screen {
  const el = document.createElement('div');
  el.className = 'scherm';

  const titel = document.createElement('h1');
  titel.className = 'scherm-titel';
  el.appendChild(titel);

  const grid = document.createElement('div');
  grid.className = 'tegel-grid';
  el.appendChild(grid);

  // Weghalen gaat in stappen: knop -> profiel kiezen -> venster waarin de hele naam
  // getypt moet worden. Elke stap heeft een weg terug (terugknop, Annuleren, Nee of
  // naast het venster tikken), zodat een kind dat per ongeluk drukt niet vastzit.
  let weghaalModus = false;
  let venster: HTMLDivElement | null = null;

  const weghaalKnop = document.createElement('button');
  weghaalKnop.type = 'button';
  weghaalKnop.className = 'profiel-weghaal-knop';
  weghaalKnop.innerHTML = '<img src="assets/icons/prullenbak.svg" alt=""><span>Weghalen</span>';
  weghaalKnop.addEventListener('click', () => {
    weghaalModus = !weghaalModus;
    tekenLijst();
  });

  const terug = maakTerugKnop(() => {
    weghaalModus = false;
    tekenLijst();
  });

  function sluitVenster(): void {
    venster?.remove();
    venster = null;
  }

  function vraagWeghalen(profiel: Profiel): void {
    sluitVenster();
    venster = document.createElement('div');
    venster.className = 'winkel-venster';
    venster.addEventListener('click', (e) => {
      if (e.target === venster) sluitVenster();
    });

    const doos = document.createElement('div');
    doos.className = 'winkel-venster__doos weghaal-venster';

    const img = document.createElement('img');
    img.src = avatarPad(profiel.icoonId);
    img.alt = '';
    img.className = 'weghaal-venster__plaatje';
    img.style.filter = avatarFilter(profiel.kleur);

    const vraag = document.createElement('p');
    vraag.className = 'weghaal-venster__vraag';
    vraag.textContent = `${profiel.naam} weghalen?`;

    const waarschuwing = document.createElement('p');
    waarschuwing.className = 'weghaal-venster__waarschuwing';
    waarschuwing.textContent = 'Alle voortgang, munten, aankopen en tekeningen van dit profiel gaan voor altijd weg.';

    const uitleg = document.createElement('p');
    uitleg.className = 'weghaal-venster__uitleg';
    uitleg.textContent = 'Typ de naam om het zeker te weten:';

    const invoer = document.createElement('input');
    invoer.type = 'text';
    invoer.className = 'typen-invoer weghaal-venster__invoer';
    invoer.placeholder = profiel.naam;
    invoer.autocomplete = 'off';
    invoer.spellcheck = false;

    const knoppen = document.createElement('div');
    knoppen.className = 'winkel-venster__knoppen';
    const nee = document.createElement('button');
    nee.type = 'button';
    nee.className = 'winkel-venster__knop winkel-venster__knop--nee';
    nee.textContent = 'Nee';
    nee.addEventListener('click', sluitVenster);
    const ja = document.createElement('button');
    ja.type = 'button';
    ja.className = 'winkel-venster__knop weghaal-venster__knop--ja';
    ja.textContent = 'Weghalen';
    ja.disabled = true;

    // Hoofdletters tellen niet mee: het invoerveld van de app toont alles klein.
    const klopt = () => invoer.value.trim().toLowerCase() === profiel.naam.trim().toLowerCase();
    invoer.addEventListener('input', () => {
      ja.disabled = !klopt();
    });
    invoer.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && klopt()) ja.click();
    });
    ja.addEventListener('click', () => {
      if (!klopt()) return;
      verwijderProfiel(profiel.id);
      sluitVenster();
      weghaalModus = false;
      tekenLijst();
    });

    knoppen.append(nee, ja);
    doos.append(img, vraag, waarschuwing, uitleg, invoer, knoppen);
    venster.appendChild(doos);
    (el.parentElement ?? el).appendChild(venster);
  }

  function tekenLijst(): void {
    sluitVenster();
    const profielen = haalProfielen();
    if (profielen.length === 0) weghaalModus = false;
    el.classList.toggle('scherm--weghalen', weghaalModus);
    titel.textContent = weghaalModus ? 'Welk profiel weghalen?' : profielen.length > 0 ? 'Wie speelt er?' : 'Maak je profiel!';
    grid.innerHTML = '';

    for (const profiel of profielen) {
      const tegel = maakIconTile({
        icoonPad: avatarPad(profiel.icoonId),
        label: profiel.naam,
        onClick: () => (weghaalModus ? vraagWeghalen(profiel) : kiesProfiel(manager, profiel)),
      });
      const img = tegel.querySelector('img');
      if (img) img.style.filter = avatarFilter(profiel.kleur);
      grid.appendChild(tegel);
    }

    if (!weghaalModus) {
      grid.appendChild(
        maakIconTile({
          icoonPad: 'assets/icons/plus.svg',
          label: 'Nieuw profiel',
          onClick: () => {
            ontgrendelAudio();
            speelSchermOvergang();
            manager.push((m) => NewProfileScreen(m));
          },
        }),
      );
    }

    weghaalKnop.hidden = profielen.length === 0;
    weghaalKnop.querySelector('span')!.textContent = weghaalModus ? 'Annuleren' : 'Weghalen';
    if (weghaalModus) el.parentElement?.appendChild(terug);
    else terug.remove();
  }

  tekenLijst();

  return {
    mount(root) {
      root.appendChild(el);
      root.appendChild(weghaalKnop);
      if (weghaalModus) root.appendChild(terug);
    },
    unmount() {
      sluitVenster();
      el.remove();
      weghaalKnop.remove();
      terug.remove();
    },
  };
}
