import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { BOEKJES } from '../../content/boekjes/boekjes.ts';
import { aantalHoofdstukken } from '../../engine/leeftijdGrens.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { maakTopRechtsBalk } from '../components/TopRechtsBalk.ts';
import { speelSchermOvergang } from '../../three/transitions.ts';
import { BoekjeScreen } from './BoekjeScreen.ts';

const KAFT_KLEUREN = ['#ff7a3d', '#3dbdff', '#3ecf6e', '#b36bff', '#ff5d8f', '#ffb43d'];

// De boekenkast: één boekje per VLL-kern, met het kernnummer op de rug, zodat duidelijk is
// welk boekje bij welk leeshoofdstuk hoort. Niets op slot; vijf jaar ziet net als bij
// lezen alleen de eerste hoofdstukken.
export function BoekenkastScreen(manager: ScreenManager): Screen {
  const el = document.createElement('div');
  el.className = 'scherm';

  const titel = document.createElement('h1');
  titel.className = 'scherm-titel';
  titel.textContent = 'Kies een boekje';
  el.appendChild(titel);

  const kast = document.createElement('div');
  kast.className = 'boekenkast';
  el.appendChild(kast);

  BOEKJES.slice(0, aantalHoofdstukken(BOEKJES.length)).forEach((boekje, i) => {
    const kaft = document.createElement('button');
    kaft.className = 'boekje-kaft';
    kaft.style.setProperty('--kaft', KAFT_KLEUREN[i % KAFT_KLEUREN.length]);

    const nummer = document.createElement('span');
    nummer.className = 'boekje-kaft__nummer';
    nummer.textContent = String(boekje.kern);
    kaft.appendChild(nummer);

    const img = document.createElement('img');
    img.src = boekje.paginas[0].plaatjes[0];
    img.alt = '';
    img.draggable = false;
    kaft.appendChild(img);

    const naam = document.createElement('span');
    naam.className = 'boekje-kaft__titel';
    naam.textContent = boekje.titel;
    kaft.appendChild(naam);

    kaft.addEventListener('click', () => {
      speelSchermOvergang();
      manager.push((m) => BoekjeScreen(m, boekje));
    });
    kast.appendChild(kaft);
  });

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
      el.remove();
      terug.remove();
      topRechts?.element.remove();
      topRechts?.vernietig();
      topRechts = null;
    },
  };
}
