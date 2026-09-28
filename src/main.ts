import './styles/global.css';
import './styles/components.css';
import './styles/screens.css';

import { ScreenManager } from './engine/screenManager.ts';
import { sceneManager } from './three/sceneManager.ts';
import { mascotte } from './three/mascotte.ts';
import { ProfileSelectScreen } from './ui/screens/ProfileSelectScreen.ts';

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
