import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { maakTopRechtsBalk } from '../components/TopRechtsBalk.ts';
import { maakAudioKnop } from '../components/AudioKnop.ts';
import { maakVoortgangsbalk } from '../components/Voortgangsbalk.ts';
import { speelAf } from '../../engine/audioManager.ts';
import { voegMuntenToe } from '../../engine/progressStore.ts';
import { MUNTEN_OEFENING_GOED } from '../../engine/rewards.ts';
import { confetti } from '../../three/particles.ts';

const RONDE_LENGTE = 5;

export interface RondeVraag {
  instructie: string;
  audioPad?: string;
  // Rendert de vraag in container; roept afgerond() aan zodra hij goed beantwoord is.
  // Fout is altijd gewoon opnieuw proberen. Geeft een opruimfunctie terug.
  render: (container: HTMLElement, afgerond: () => void) => () => void;
}

// Gedeelde schil voor de kleuterspellen: rondes van 5 vragen met een voortgangsbalk en
// een klein vuurwerkje aan het eind, daarna vanzelf een nieuwe ronde (zelfde opzet als
// LuisterenScreen). Geen hoofdstukken, geen toets, niets op slot.
export function RondeScreen(manager: ScreenManager, titelTekst: string, maakVraag: () => RondeVraag): Screen {
  const el = document.createElement('div');
  el.className = 'scherm';

  const titel = document.createElement('h1');
  titel.className = 'scherm-titel';
  titel.textContent = titelTekst;
  el.appendChild(titel);

  const instructieRij = document.createElement('div');
  instructieRij.className = 'instructie-rij';
  el.appendChild(instructieRij);

  const instructie = document.createElement('p');
  instructie.className = 'instructie-tekst';
  instructieRij.appendChild(instructie);

  let huidigeAudio: string | undefined;
  instructieRij.appendChild(maakAudioKnop(() => speelAf(huidigeAudio)));

  const voortgangsbalk = maakVoortgangsbalk(RONDE_LENGTE);
  el.appendChild(voortgangsbalk.element);

  const container = document.createElement('div');
  el.appendChild(container);

  let opruimen: (() => void) | null = null;
  let inRonde = 0;
  let timer: number | undefined;
  let actief = true;

  function volgendeVraag(): void {
    if (!actief) return;
    opruimen?.();
    opruimen = null;
    if (inRonde >= RONDE_LENGTE) {
      voortgangsbalk.zetVoortgang(RONDE_LENGTE);
      confetti.vuurwerk('klein');
      inRonde = 0;
      timer = window.setTimeout(volgendeVraag, 1400);
      return;
    }
    voortgangsbalk.zetVoortgang(inRonde);
    const vraag = maakVraag();
    instructie.textContent = vraag.instructie;
    huidigeAudio = vraag.audioPad;
    speelAf(huidigeAudio);
    let beantwoord = false;
    opruimen = vraag.render(container, () => {
      if (!actief || beantwoord) return;
      beantwoord = true;
      voegMuntenToe(MUNTEN_OEFENING_GOED);
      inRonde++;
      voortgangsbalk.zetVoortgang(inRonde);
      timer = window.setTimeout(volgendeVraag, 900);
    });
  }

  volgendeVraag();

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
