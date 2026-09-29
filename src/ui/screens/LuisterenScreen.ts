import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { maakTopRechtsBalk } from '../components/TopRechtsBalk.ts';
import { maakAudioKnop } from '../components/AudioKnop.ts';
import { maakVoortgangsbalk } from '../components/Voortgangsbalk.ts';
import { speelAf, woordAudioPad } from '../../engine/audioManager.ts';
import { voegMuntenToe } from '../../engine/progressStore.ts';
import { MUNTEN_OEFENING_GOED } from '../../engine/rewards.ts';
import { genereerLuisterVraag, type LuisterVraag } from '../../engine/luisterenGenerator.ts';
import { renderLuisterKiezen } from '../../games/luisterKiezen.ts';
import { confetti } from '../../three/particles.ts';

const RONDE_LENGTE = 5;

// Luister-en-wijs-aan: alleen plaatjes en geluid, geen tekst, voor kinderen die nog niet
// kunnen lezen (leeftijd 3+). Geen kernen/hoofdstukken/toets -- wel een korte, herkenbare
// ronde van 5 vragen met een klein vuurwerkje aan het eind (net zo'n opsteker als na een
// goede toets bij de oudere kinderen), waarna vanzelf een nieuwe ronde begint. Niets is
// op slot en er is geen "gefaald"-moment: fout is gewoon opnieuw proberen. Terug gaat
// terug naar het onderwerpenscherm.
export function LuisterenScreen(manager: ScreenManager): Screen {
  const el = document.createElement('div');
  el.className = 'scherm';

  const titel = document.createElement('h1');
  titel.className = 'scherm-titel';
  titel.textContent = 'Luisteren';
  el.appendChild(titel);

  const instructieRij = document.createElement('div');
  instructieRij.className = 'instructie-rij';
  el.appendChild(instructieRij);

  const instructie = document.createElement('p');
  instructie.className = 'instructie-tekst';
  instructie.textContent = 'Welk plaatje hoort bij het geluid?';
  instructieRij.appendChild(instructie);

  let huidigeVraag: LuisterVraag;
  const audioKnop = maakAudioKnop(() => speelAf(woordAudioPad(huidigeVraag.doel.woord)));
  instructieRij.appendChild(audioKnop);

  const voortgangsbalk = maakVoortgangsbalk(RONDE_LENGTE);
  el.appendChild(voortgangsbalk.element);

  const oefenContainer = document.createElement('div');
  el.appendChild(oefenContainer);

  let opruimen: (() => void) | null = null;
  let inRonde = 0;

  function volgendeVraag(): void {
    opruimen?.();
    if (inRonde >= RONDE_LENGTE) {
      voortgangsbalk.zetVoortgang(RONDE_LENGTE);
      confetti.vuurwerk('klein');
      inRonde = 0;
      setTimeout(volgendeVraag, 1400); // laat het vuurwerkje even zien voor de volgende ronde start
      return;
    }
    voortgangsbalk.zetVoortgang(inRonde);
    huidigeVraag = genereerLuisterVraag(3);
    opruimen = renderLuisterKiezen(oefenContainer, huidigeVraag, () => {
      voegMuntenToe(MUNTEN_OEFENING_GOED);
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
      opruimen?.();
      el.remove();
      terug.remove();
      topRechts?.element.remove();
      topRechts?.vernietig();
      topRechts = null;
    },
  };
}
