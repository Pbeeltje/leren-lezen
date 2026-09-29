import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { maakTopRechtsBalk } from '../components/TopRechtsBalk.ts';
import { maakAudioKnop } from '../components/AudioKnop.ts';
import { speelAf, woordAudioPad } from '../../engine/audioManager.ts';
import { voegMuntenToe } from '../../engine/progressStore.ts';
import { MUNTEN_OEFENING_GOED } from '../../engine/rewards.ts';
import { genereerLuisterVraag, type LuisterVraag } from '../../engine/luisterenGenerator.ts';
import { renderLuisterKiezen } from '../../games/luisterKiezen.ts';

// Luister-en-wijs-aan: alleen plaatjes en geluid, geen tekst, voor kinderen die nog niet
// kunnen lezen (leeftijd 3+). Geen kernen/hoofdstukken/toets -- gewoon een doorlopende
// reeks vragen, elke keer opnieuw willekeurig getrokken uit de hele poel. Niets is op
// slot en er is geen "klaar"-moment; terug gaat gewoon terug naar het onderwerpenscherm.
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

  const oefenContainer = document.createElement('div');
  el.appendChild(oefenContainer);

  let opruimen: (() => void) | null = null;

  function volgendeVraag(): void {
    opruimen?.();
    huidigeVraag = genereerLuisterVraag(3);
    opruimen = renderLuisterKiezen(oefenContainer, huidigeVraag, () => {
      voegMuntenToe(MUNTEN_OEFENING_GOED);
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
