import './styles/global.css';
import './styles/components.css';
import './styles/screens.css';

import { ScreenManager } from './engine/screenManager.ts';
import { sceneManager } from './three/sceneManager.ts';
import { mascotte } from './three/mascotte.ts';
import { ProfileSelectScreen } from './ui/screens/ProfileSelectScreen.ts';

// Kinderen drukken per ongeluk op de terug/vooruit-knoppen van de muis (knop 4 en 5), en
// de app heeft geen URL-routes, dus de browser zou de hele app verlaten. Blokkeer die
// knoppen, en houd als vangnet altijd een extra geschiedenisstap vast zodat ook een
// toetsenbord- of touchpad-"terug" op deze pagina blijft.
for (const soort of ['mousedown', 'mouseup', 'auxclick'] as const) {
  window.addEventListener(
    soort,
    (e) => {
      if (e.button === 3 || e.button === 4) e.preventDefault();
    },
    { capture: true },
  );
}
history.pushState(null, '', location.href);
window.addEventListener('popstate', () => history.pushState(null, '', location.href));

const app = document.querySelector<HTMLDivElement>('#app')!;

const drieLaag = document.createElement('div');
drieLaag.id = 'drie-laag';
app.appendChild(drieLaag);
sceneManager.init(drieLaag);
mascotte.mount();

const schermHouder = document.createElement('div');
schermHouder.id = 'scherm-houder';
schermHouder.style.position = 'relative';
schermHouder.style.width = '100%';
schermHouder.style.height = '100%';
app.appendChild(schermHouder);

const manager = new ScreenManager(schermHouder);
manager.push((m) => ProfileSelectScreen(m));
