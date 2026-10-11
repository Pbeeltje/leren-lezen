import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { avatarFilter, avatarPad, haalActiefProfielId, haalProfielen } from '../../engine/profielStore.ts';
import { haalRecord } from '../../engine/records.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { maakTopRechtsBalk } from '../components/TopRechtsBalk.ts';
import type { RecordKaart } from './RecordsScreen.ts';

// Ranglijst van één spel: de records van alle profielen op dit apparaat, hoogste bovenaan.
// Gelijke scores delen hun plek; 1, 2 en 3 krijgen goud, zilver en brons. Het actieve
// profiel is gemarkeerd. Profielen zonder record staan grijs onderaan.
export function RanglijstScreen(manager: ScreenManager, spel: RecordKaart): Screen {
  const el = document.createElement('div');
  el.className = 'scherm';

  const kop = document.createElement('h1');
  kop.className = 'scherm-titel ranglijst-kop';
  kop.innerHTML = `<img src="assets/icons/${spel.icoon}.svg" alt=""><span></span>`;
  kop.querySelector('span')!.textContent = spel.label;
  el.appendChild(kop);

  const lijst = document.createElement('ol');
  lijst.className = 'ranglijst';
  el.appendChild(lijst);

  const actief = haalActiefProfielId();
  const rijen = haalProfielen()
    .map((p) => ({ p, score: haalRecord(spel.spel, p.id) }))
    .sort((a, b) => b.score - a.score || a.p.aangemaakt - b.p.aangemaakt);
  let plek = 0;
  rijen.forEach(({ p, score }, i) => {
    if (i === 0 || score !== rijen[i - 1].score) plek = i + 1;
    const li = document.createElement('li');
    li.className = 'ranglijst__rij';
    if (p.id === actief) li.classList.add('ranglijst__rij--ik');
    if (!score) li.classList.add('ranglijst__rij--leeg');
    li.innerHTML = `
      <span class="ranglijst__plek${score && plek <= 3 ? ` ranglijst__plek--${plek}` : ''}">${score ? plek : ''}</span>
      <img class="ranglijst__figuur" src="${avatarPad(p.icoonId)}" alt="" style="filter: ${avatarFilter(p.kleur) || 'none'}">
      <span class="ranglijst__naam"></span>
      <span class="record-kaart__score"><img src="assets/icons/trofee.svg" alt=""><span>${score}</span></span>`;
    li.querySelector('.ranglijst__naam')!.textContent = p.naam;
    lijst.appendChild(li);
  });

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
