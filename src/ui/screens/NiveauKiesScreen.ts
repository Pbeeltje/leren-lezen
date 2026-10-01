import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { haalActiefProfielId } from '../../engine/profielStore.ts';
import { AANTAL_NIVEAUS, niveauOmschrijving, niveausVoorGroep } from '../../games/muziek/muziekVragen.ts';
import { DRUM_KLEUR } from '../../games/muziek/drumstel.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { maakTopRechtsBalk } from '../components/TopRechtsBalk.ts';
import { speelSchermOvergang } from '../../three/transitions.ts';

// Niveau kiezen vóór Speel na of Ritme (verzoek van de eigenaar: niet altijd bij het
// laagste beginnen). Vijf tegels met sterren (kleuters alleen de eerste twee); op elke tegel zie je hoeveel noten of slagen
// het worden en welke drums meedoen. Niets is op slot; het laatst gekozen niveau van dit
// kind is gemarkeerd.

type Spel = 'speel-na' | 'ritme';

const sleutel = (spel: Spel) => `leren-lezen:muziekniveau:${haalActiefProfielId() ?? 'gast'}:${spel}`;

function leesLaatste(spel: Spel): number {
  try {
    const n = Number(localStorage.getItem(sleutel(spel)));
    return n >= 1 && n <= AANTAL_NIVEAUS && niveausVoorGroep().includes(n) ? n : 1;
  } catch {
    return 1;
  }
}

function bewaar(spel: Spel, niveau: number): void {
  try {
    localStorage.setItem(sleutel(spel), String(niveau));
  } catch {
    // geen opslag: dan begint de markering volgende keer weer bij 1
  }
}

export function NiveauKiesScreen(manager: ScreenManager, spel: Spel, titelTekst: string, open: (m: ScreenManager, niveau: number) => Screen): Screen {
  const el = document.createElement('div');
  el.className = 'scherm';

  const titel = document.createElement('h1');
  titel.className = 'scherm-titel';
  titel.textContent = titelTekst;
  el.appendChild(titel);

  const grid = document.createElement('div');
  grid.className = 'niveau-grid';
  el.appendChild(grid);

  const laatste = leesLaatste(spel);
  for (const niveau of niveausVoorGroep()) {
    const info = niveauOmschrijving(spel, niveau);
    const k = document.createElement('button');
    k.type = 'button';
    k.className = `niveau-tegel niveau-tegel--${niveau}`;
    if (niveau === laatste) k.classList.add('niveau-tegel--laatst');
    k.setAttribute('aria-label', `Niveau ${niveau}: ${info.min} tot ${info.max} ${spel === 'ritme' ? 'slagen' : 'noten'}`);

    const sterren = document.createElement('div');
    sterren.className = 'niveau-tegel__sterren';
    for (let i = 0; i < niveau; i++) {
      const s = document.createElement('img');
      s.src = 'assets/icons/ster.svg';
      s.alt = '';
      sterren.appendChild(s);
    }
    const aantal = document.createElement('div');
    aantal.className = 'niveau-tegel__aantal';
    aantal.innerHTML = `<img src="assets/icons/${spel === 'ritme' ? 'trommel' : 'muziek'}.svg" alt=""><span>${info.min}–${info.max}</span>`;
    k.append(sterren, aantal);
    if (info.drums) {
      const drums = document.createElement('div');
      drums.className = 'niveau-tegel__drums';
      for (const d of info.drums) {
        const stip = document.createElement('span');
        stip.style.background = DRUM_KLEUR[d];
        drums.appendChild(stip);
      }
      k.appendChild(drums);
    }
    k.addEventListener('click', () => {
      bewaar(spel, niveau);
      speelSchermOvergang();
      manager.push((m) => open(m, niveau));
    });
    grid.appendChild(k);
  }

  const terug = maakTerugKnop(() => manager.pop());
  let topRechts: ReturnType<typeof maakTopRechtsBalk> | null = null;
  return {
    mount(root) {
      root.appendChild(el);
      root.appendChild(terug);
      topRechts = maakTopRechtsBalk(manager);
      root.appendChild(topRechts.element);
      // Terug uit het spel: de markering bijwerken naar wat net gespeeld is.
      const nu = leesLaatste(spel);
      grid.querySelectorAll('.niveau-tegel').forEach((t, i) => t.classList.toggle('niveau-tegel--laatst', niveausVoorGroep()[i] === nu));
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
