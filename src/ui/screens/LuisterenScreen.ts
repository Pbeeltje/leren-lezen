import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { maakTopRechtsBalk } from '../components/TopRechtsBalk.ts';
import { maakAudioKnop } from '../components/AudioKnop.ts';
import { maakVoortgangsbalk } from '../components/Voortgangsbalk.ts';
import { speelAf, woordAudioPad } from '../../engine/audioManager.ts';
import { markeerKernVoltooid, voegMuntenToe } from '../../engine/progressStore.ts';
import { MUNTEN_OEFENING_GOED, perGoed } from '../../engine/rewards.ts';
import { genereerLuisterVraag, hoofdstukWoorden, type LuisterVraag } from '../../engine/luisterenGenerator.ts';
import type { LuisterHoofdstuk } from '../../content/luisteren/hoofdstukken.ts';
import { toonKlaarKaart } from '../components/KlaarKaart.ts';
import { renderLuisterKiezen } from '../../games/luisterKiezen.ts';
import { confetti } from '../../three/particles.ts';

const RONDE_LENGTE = 5;
const AANTAL_RONDES = 2;

// Luister-en-wijs-aan: alleen plaatjes en geluid, geen tekst, voor kinderen die nog niet
// kunnen lezen (leeftijd 3). Eén hoofdstuk (thema) = 2 rondes van 5 vragen, met een klein
// vuurwerkje na elke ronde en aan het eind een "klaar"-kaart met groot feest. Fout is
// gewoon opnieuw proberen; er is geen "gefaald"-moment.
export function LuisterenScreen(manager: ScreenManager, hoofdstuk: LuisterHoofdstuk): Screen {
  const woorden = hoofdstukWoorden(hoofdstuk.woorden, hoofdstuk.plaatjes);
  const el = document.createElement('div');
  el.className = 'scherm';

  const titel = document.createElement('h1');
  titel.className = 'scherm-titel';
  titel.textContent = hoofdstuk.titel;
  el.appendChild(titel);

  const instructieRij = document.createElement('div');
  instructieRij.className = 'instructie-rij';
  el.appendChild(instructieRij);

  const instructie = document.createElement('p');
  instructie.className = 'instructie-tekst';
  instructie.textContent = 'Welk plaatje hoort bij het geluid?';
  instructieRij.appendChild(instructie);

  let huidigeVraag: LuisterVraag | undefined;
  const audioKnop = maakAudioKnop(() => huidigeVraag && speelAf(woordAudioPad(huidigeVraag.doel.woord)));
  instructieRij.appendChild(audioKnop);

  const voortgangsbalk = maakVoortgangsbalk(RONDE_LENGTE);
  el.appendChild(voortgangsbalk.element);

  const oefenContainer = document.createElement('div');
  el.appendChild(oefenContainer);

  let opruimen: (() => void) | null = null;
  let inRonde = 0;
  let rondesKlaar = 0;
  // Na "terug" mag er niets meer doorlopen: geen nieuw woord dat op het volgende scherm
  // hardop klinkt, geen munten voor een vraag die al weg is.
  let actief = true;
  let timer: number | undefined;

  function volgendeVraag(): void {
    if (!actief) return;
    opruimen?.();
    if (inRonde >= RONDE_LENGTE) {
      voortgangsbalk.zetVoortgang(RONDE_LENGTE);
      rondesKlaar++;
      if (rondesKlaar >= AANTAL_RONDES) {
        markeerKernVoltooid(`luister-${hoofdstuk.id}`, 3);
        instructieRij.style.display = 'none';
        voortgangsbalk.element.style.display = 'none';
        opruimen = null;
        toonKlaarKaart(oefenContainer, () => manager.pop());
        return;
      }
      confetti.vuurwerk('klein');
      inRonde = 0;
      timer = window.setTimeout(volgendeVraag, 1400); // laat het vuurwerkje even zien voor de volgende ronde start
      return;
    }
    voortgangsbalk.zetVoortgang(inRonde);
    huidigeVraag = genereerLuisterVraag(3, huidigeVraag?.doel.woord, woorden);
    opruimen = renderLuisterKiezen(oefenContainer, huidigeVraag, () => {
      if (!actief) return;
      voegMuntenToe(perGoed(MUNTEN_OEFENING_GOED));
      inRonde++;
      volgendeVraag();
    }).vernietig;
  }

  volgendeVraag();

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
