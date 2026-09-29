import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { maakTopRechtsBalk } from '../components/TopRechtsBalk.ts';
import { voegMuntenToe } from '../../engine/progressStore.ts';
import { MUNTEN_TOETS_GOED } from '../../engine/rewards.ts';
import { genereerGeheugenbord } from '../../engine/geheugenGenerator.ts';
import { renderGeheugenSpel } from '../../games/geheugenSpel.ts';
import { confetti } from '../../three/particles.ts';

const AANTAL_PAREN = 4;

// Klassiek geheugenspel met dezelfde plaatjes/geluiden als "Luisteren". Elk voltooid
// bord (alle paren gevonden) is zijn eigen "ronde" en eindigt met een vuurwerkje,
// net als bij Luisteren -- daarna meteen een nieuw bord, eindeloos door te spelen.
export function GeheugenScreen(manager: ScreenManager): Screen {
  const el = document.createElement('div');
  el.className = 'scherm';

  const titel = document.createElement('h1');
  titel.className = 'scherm-titel';
  titel.textContent = 'Geheugenspel';
  el.appendChild(titel);

  const instructie = document.createElement('p');
  instructie.className = 'instructie-tekst';
  instructie.textContent = 'Zoek de twee plaatjes die bij elkaar horen';
  el.appendChild(instructie);

  const oefenContainer = document.createElement('div');
  el.appendChild(oefenContainer);

  let opruimen: (() => void) | null = null;

  function nieuwBord(): void {
    opruimen?.();
    const kaarten = genereerGeheugenbord(AANTAL_PAREN);
    opruimen = renderGeheugenSpel(oefenContainer, kaarten, () => {
      voegMuntenToe(MUNTEN_TOETS_GOED);
      confetti.vuurwerk('klein');
      setTimeout(nieuwBord, 1400);
    }).vernietig;
  }

  nieuwBord();

  const terug = maakTerugKnop(() => {
    opruimen?.();
    manager.pop();
  });
  let topRechts: ReturnType<typeof maakTopRechtsBalk> | null = null;

  return {
    mount(root) {
      root.appendChild(el);
      root.appendChild(terug);
      topRechts = maakTopRechtsBalk(manager);
      root.appendChild(topRechts.element);
    },
    unmount() {
      opruimen?.();
      el.remove();
      terug.remove();
      topRechts?.element.remove();
      topRechts?.vernietig();
      topRechts = null;
    },
  };
}
