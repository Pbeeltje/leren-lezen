import './styles/fonts.css';
import './styles/global.css';
import './styles/components.css';
import './styles/screens.css';
import './styles/achtergrond.css';
import './styles/achtergrond-onderwater.css';
import './styles/achtergrond-herfst.css';
import './styles/achtergrond-winter.css';
import './styles/achtergrond-kermis.css';
import './styles/achtergrond-bouw.css';
import './styles/achtergrond-trein.css';
import './styles/achtergrond-savanne.css';
import './styles/achtergrond-kasteel.css';

import { ScreenManager } from './engine/screenManager.ts';
import { sceneManager } from './three/sceneManager.ts';
import { ProfileSelectScreen } from './ui/screens/ProfileSelectScreen.ts';
import { NewProfileScreen } from './ui/screens/NewProfileScreen.ts';
import { haalProfielen } from './engine/profielStore.ts';
import { initAchtergrond } from './achtergrond/achtergrond.ts';
import { pasSchriftVanProfielToe } from './engine/schrift.ts';
import { herstelEnSpiegelOpslag, koppelAppKnoppen } from './engine/native.ts';

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

// iPhone/iPad: zonder dit zet de stille-modus-schakelaar alle Web Audio (xylofoon, drums)
// op stil (Safari 17+ / WKWebView). Gewone geluidsclips hebben er geen last van.
const audioSessie = (navigator as Navigator & { audioSession?: { type: string } }).audioSession;
if (audioSessie) audioSessie.type = 'playback';

// In de app eerst de bewaarde voortgang terugzetten (zie engine/native.ts), dan pas starten.
void herstelEnSpiegelOpslag().finally(start);

function start(): void {
  const app = document.querySelector<HTMLDivElement>('#app')!;

  const drieLaag = document.createElement('div');
  drieLaag.id = 'drie-laag';
  app.appendChild(drieLaag);
  sceneManager.init(drieLaag);
  initAchtergrond(app);
  pasSchriftVanProfielToe();

  const schermHouder = document.createElement('div');
  schermHouder.id = 'scherm-houder';
  schermHouder.style.position = 'relative';
  schermHouder.style.width = '100%';
  schermHouder.style.height = '100%';
  app.appendChild(schermHouder);

  const manager = new ScreenManager(schermHouder);
  // Nog geen profiel? Dan meteen naar "Maak je profiel" in plaats van een scherm met
  // alleen een plus-tegel.
  manager.push((m) => (haalProfielen().length ? ProfileSelectScreen(m) : NewProfileScreen(m)));
  void koppelAppKnoppen();
}
