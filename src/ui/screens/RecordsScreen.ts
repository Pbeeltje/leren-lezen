import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { avatarFilter, avatarPad, haalActiefProfiel } from '../../engine/profielStore.ts';
import { haalRecord, type RecordSpel } from '../../engine/records.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { maakTopRechtsBalk } from '../components/TopRechtsBalk.ts';

const SPELLEN: { spel: RecordSpel; icoon: string; label: string; profielFiguur?: boolean }[] = [
  { spel: 'vangspel', icoon: 'meteoor', label: 'Vangspel', profielFiguur: true },
  { spel: 'oversteken', icoon: 'oversteken', label: 'Oversteken' },
  { spel: 'tafeltennis', icoon: 'tafeltennis', label: 'Tafeltennis' },
  { spel: 'voeren', icoon: 'voeren', label: 'Dieren voeren' },
];

// Records: per spel het hoogste record van dit profiel, met een trofee ervoor. Alleen
// kijken, de kaarten zijn geen knoppen. Tafeltennis telt tegenstanders op rij verslagen.
export function RecordsScreen(manager: ScreenManager): Screen {
  const el = document.createElement('div');
  el.className = 'scherm';

  const titel = document.createElement('h1');
  titel.className = 'scherm-titel';
  titel.textContent = 'Records';
  el.appendChild(titel);

  const grid = document.createElement('div');
  grid.className = 'tegel-grid';
  el.appendChild(grid);

  const profiel = haalActiefProfiel();
  for (const s of SPELLEN) {
    const record = haalRecord(s.spel);
    const kaart = document.createElement('div');
    kaart.className = `icoon-tegel record-kaart${record ? '' : ' record-kaart--leeg'}`;
    const figuur = s.profielFiguur && profiel;
    kaart.innerHTML = `
      <img class="icoon-tegel__plaatje" src="${figuur ? avatarPad(profiel.icoonId) : `assets/icons/${s.icoon}.svg`}" alt="">
      <span class="icoon-tegel__label">${s.label}</span>
      <span class="record-kaart__score"><img src="assets/icons/trofee.svg" alt=""><span>${record}</span></span>`;
    if (figuur) kaart.querySelector('img')!.style.filter = avatarFilter(profiel.kleur);
    grid.appendChild(kaart);
  }

  const terug = maakTerugKnop(() => manager.pop());
  let topRechts: ReturnType<typeof maakTopRechtsBalk> | null = null;

  return {
    mount(root) {
      root.appendChild(el);
      root.appendChild(terug);
      topRechts = maakTopRechtsBalk(manager);
      root.appendChild(topRechts.element);
    },
    unmount() {
      el.remove();
      terug.remove();
      topRechts?.element.remove();
      topRechts?.vernietig();
      topRechts = null;
    },
  };
}
