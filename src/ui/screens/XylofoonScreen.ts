import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { maakXylofoon } from '../../games/muziek/xylofoon.ts';
import { maakDrumstel } from '../../games/muziek/drumstel.ts';
import { maakInstrumentKnoppen } from '../components/InstrumentKnoppen.ts';
import { huidigInstrument } from '../../engine/winkel.ts';
import { speelSchermOvergang } from '../../three/transitions.ts';
import { WinkelScreen } from './WinkelScreen.ts';

// Vrij spelen: geen opdracht, geen goed of fout. Knoppen bovenaan wisselen tussen de
// melodie-instrumenten (xylofoon, en wat je in de winkel kocht: gitaar, harp, steelgitaar)
// en het hele drumstel (grote trom, snaredrum, tom, bekken, crash). Daarnaast de munt naar
// de instrumenten in de winkel. Geen profielmenu of muntenteller (kinderen tikten er per
// ongeluk op), en het instrument vult de rest van het scherm.
export function XylofoonScreen(manager: ScreenManager): Screen {
  const el = document.createElement('div');
  el.className = 'scherm muziek-vrij-scherm';

  const wissel = document.createElement('div');
  wissel.className = 'muziek-wissel';
  el.appendChild(wissel);

  const kaart = document.createElement('div');
  kaart.className = 'oefen-kaart muziek-kaart muziek-kaart--vrij';
  el.appendChild(kaart);

  // Opgebouwd in mount: na een uitstapje naar de winkel heeft unmount ze opgeruimd.
  let melodie: ReturnType<typeof maakXylofoon> | null = null;
  let kit: ReturnType<typeof maakDrumstel> | null = null;
  let drums = false;

  const instrumenten = maakInstrumentKnoppen(
    () => {
      drums = false;
      toon();
    },
    (koop) => {
      speelSchermOvergang();
      manager.push((m) => WinkelScreen(m, { soort: 'instrument', koop }));
    },
  );
  const drumKnop = document.createElement('button');
  drumKnop.type = 'button';
  drumKnop.className = 'muziek-wissel__knop';
  drumKnop.setAttribute('aria-label', 'Drumstel');
  drumKnop.innerHTML = '<img src="assets/icons/trommel.svg" alt=""><span>Drumstel</span>';
  drumKnop.addEventListener('click', () => {
    drums = true;
    toon();
  });
  wissel.append(...instrumenten.knoppen, drumKnop, instrumenten.winkel);

  function toon(): void {
    if (!melodie || !kit) return;
    const instrument = huidigInstrument();
    melodie.zetInstrument(instrument);
    kaart.replaceChildren(drums ? kit.element : melodie.element);
    kaart.classList.toggle('muziek-kaart--drums', drums);
    instrumenten.ververs(drums ? null : instrument);
    drumKnop.classList.toggle('muziek-wissel__knop--aan', drums);
  }

  const terug = maakTerugKnop(() => manager.pop());

  return {
    mount(root) {
      melodie = maakXylofoon([0, 1, 2, 3, 4, 5, 6, 7], undefined, huidigInstrument());
      kit = maakDrumstel(['bas', 'snare', 'tom', 'bekken', 'crash']);
      toon();
      root.appendChild(el);
      root.appendChild(terug);
    },
    unmount() {
      melodie?.opruimen();
      kit?.opruimen();
      melodie = null;
      kit = null;
      el.remove();
      terug.remove();
    },
  };
}
