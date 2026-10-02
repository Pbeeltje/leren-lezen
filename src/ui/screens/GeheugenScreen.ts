import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { maakTopRechtsBalk } from '../components/TopRechtsBalk.ts';
import { voegMuntenToe } from '../../engine/progressStore.ts';
import { MUNTEN_GEHEUGEN_BORD, MUNTEN_GEHEUGEN_PAAR, kleuterFactor } from '../../engine/rewards.ts';
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
  let verdiend = 0;
  // Wat er nog moest gebeuren toen het scherm (bv. voor de winkel) werd weggehaald.
  let wacht: (() => void) | null = null;
  let onderbroken = false;

  function nieuwBord(): void {
    if (!actief) return;
    opruimen?.();
    const kaarten = genereerGeheugenbord(aantalParen);
    // Geen actief-check hier: een bord dat net klaar is terwijl het kind in de winkel zit,
    // telt gewoon mee; de volgende stap wacht dan tot het terug is (zie `wacht`).
    const betaal = (basis: number): void => {
      const munten = kleuterFactor(basis);
      voegMuntenToe(munten);
      verdiend += munten;
    };
    opruimen = renderGeheugenSpel(oefenContainer, kaarten, () => betaal(MUNTEN_GEHEUGEN_PAAR), () => {
      betaal(MUNTEN_GEHEUGEN_BORD);
      bordenKlaar++;
      if (bordenKlaar >= AANTAL_BORDEN) {
        wacht = () => {
          if (!actief) return;
          wacht = null;
          opruimen?.();
          opruimen = null;
          instructie.style.display = 'none';
          toonKlaarKaart(oefenContainer, () => manager.pop(), verdiend);
        };
        timer = window.setTimeout(wacht, 1000);
        return;
      }
      confetti.vuurwerk('klein');
      wacht = () => {
        if (!actief) return;
        wacht = null;
        nieuwBord();
      };
      timer = window.setTimeout(wacht, 1400);
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
      // Terug van een ander scherm (bv. de winkel): het bord is blijven staan, alleen een
      // stap die nog moest komen (nieuw bord, klaar-kaart) alsnog doen.
      if (onderbroken) {
        onderbroken = false;
        actief = true;
        if (wacht) timer = window.setTimeout(wacht, 400);
      }
    },
    unmount() {
      // Het bord niet opruimen: het blijft in `el` bewaard tot het kind terugkomt. De
      // terug-knop ruimt het zelf op.
      actief = false;
      onderbroken = true;
      window.clearTimeout(timer);
      el.remove();
      terug.remove();
      topRechts?.element.remove();
      topRechts?.vernietig();
      topRechts = null;
    },
  };
}
