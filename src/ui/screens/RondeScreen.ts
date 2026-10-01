import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { maakTopRechtsBalk } from '../components/TopRechtsBalk.ts';
import { maakAudioKnop } from '../components/AudioKnop.ts';
import { maakVoortgangsbalk } from '../components/Voortgangsbalk.ts';
import { naHuidigeAudio, speelAf } from '../../engine/audioManager.ts';
import { voegMuntenToe } from '../../engine/progressStore.ts';
import { MUNTEN_OEFENING_GOED, perGoed } from '../../engine/rewards.ts';
import { confetti } from '../../three/particles.ts';
import { toonKlaarKaart } from '../components/KlaarKaart.ts';

const RONDE_LENGTE = 5;
const AANTAL_RONDES = 2;

export interface RondeVraag {
  instructie: string;
  audioPad?: string;
  // false: de instructie alleen bij de eerste vraag vanzelf laten horen, omdat hij elke
  // keer hetzelfde is (speel na, ritme). De luidsprekerknop herhaalt hem altijd.
  instructieElkeVraag?: boolean;
  // Rendert de vraag in container; roept afgerond() aan zodra hij goed beantwoord is.
  // Fout is altijd gewoon opnieuw proberen. Geeft een opruimfunctie terug.
  render: (container: HTMLElement, afgerond: () => void) => () => void;
}

// Gedeelde schil voor de kleuterspellen: 2 rondes van 5 vragen met een voortgangsbalk,
// een klein vuurwerkje na elke ronde en dan de klaar-kaart (zelfde opzet als
// LuisterenScreen). Geen toets, niets op slot, fout is opnieuw proberen.
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
  let rondesKlaar = 0;
  let timer: number | undefined;
  let actief = true;

  function volgendeVraag(): void {
    if (!actief) return;
    opruimen?.();
    opruimen = null;
    if (inRonde >= RONDE_LENGTE) {
      voortgangsbalk.zetVoortgang(RONDE_LENGTE);
      rondesKlaar++;
      if (rondesKlaar >= AANTAL_RONDES) {
        instructieRij.style.display = 'none';
        voortgangsbalk.element.style.display = 'none';
        toonKlaarKaart(container, () => manager.pop());
        return;
      }
      confetti.vuurwerk('klein');
      inRonde = 0;
      timer = window.setTimeout(volgendeVraag, 1400);
      return;
    }
    voortgangsbalk.zetVoortgang(inRonde);
    const vraag = maakVraag();
    instructie.textContent = vraag.instructie;
    const eersteVraag = rondesKlaar === 0 && inRonde === 0;
    huidigeAudio = vraag.audioPad;
    if (eersteVraag || vraag.instructieElkeVraag !== false) speelAf(huidigeAudio);
    let beantwoord = false;
    opruimen = vraag.render(container, () => {
      if (!actief || beantwoord) return;
      beantwoord = true;
      voegMuntenToe(perGoed(MUNTEN_OEFENING_GOED));
      inRonde++;
      voortgangsbalk.zetVoortgang(inRonde);
      naHuidigeAudio(volgendeVraag); // eerst "Goed gedaan!" laten uitpraten
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
