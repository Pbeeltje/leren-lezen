import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { maakTopRechtsBalk } from '../components/TopRechtsBalk.ts';
import { voegMuntenToe } from '../../engine/progressStore.ts';
import { MUNTEN_TOETS_GOED } from '../../engine/rewards.ts';
import { genereerGeheugenbord } from '../../engine/geheugenGenerator.ts';
import { renderGeheugenSpel } from '../../games/geheugenSpel.ts';
import { confetti } from '../../three/particles.ts';
import { toonKlaarKaart } from '../components/KlaarKaart.ts';

const AANTAL_BORDEN = 3;

// Klassiek geheugenspel met dezelfde plaatjes/geluiden als "Luisteren". Elk voltooid
// bord eindigt met een vuurwerkje; na 3 borden volgt de klaar-kaart met groot feest.
// Kleuters spelen met 4 paren, groep 3 met 8 (een groter bord, zie .geheugen-bord--groot).
export function GeheugenScreen(manager: ScreenManager, aantalParen = 4): Screen {
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
  let actief = true;
  let timer: number | undefined;
  let bordenKlaar = 0;

  function nieuwBord(): void {
    if (!actief) return;
    opruimen?.();
    const kaarten = genereerGeheugenbord(aantalParen);
    opruimen = renderGeheugenSpel(oefenContainer, kaarten, () => {
      if (!actief) return;
      voegMuntenToe(MUNTEN_TOETS_GOED);
      bordenKlaar++;
      if (bordenKlaar >= AANTAL_BORDEN) {
        timer = window.setTimeout(() => {
          if (!actief) return;
          opruimen?.();
          opruimen = null;
          instructie.style.display = 'none';
          toonKlaarKaart(oefenContainer, () => manager.pop());
        }, 1000);
        return;
      }
      confetti.vuurwerk('klein');
      timer = window.setTimeout(nieuwBord, 1400);
    }).vernietig;
    if (aantalParen > 4) oefenContainer.querySelector('.geheugen-bord')?.classList.add('geheugen-bord--groot');
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
      actief = false;
      window.clearTimeout(timer);
      opruimen?.();
      el.remove();
      terug.remove();
      topRechts?.element.remove();
      topRechts?.vernietig();
      topRechts = null;
    },
  };
}
