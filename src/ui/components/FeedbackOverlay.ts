import { confetti } from '../../three/particles.ts';
import { mascotte } from '../../three/mascotte.ts';

const GOEDE_BERICHTEN = ['Goed zo!', 'Knap gedaan!', 'Top!', 'Yes!'];
const FOUTE_BERICHTEN = ['Bijna!', 'Probeer nog eens!'];

let kleurTeller = 0;

export function toonGoedFeedback(): void {
  toonOverlay(GOEDE_BERICHTEN, 'goed');
  confetti.burst(kleurTeller++);
  mascotte.reageerGoed();
}

export function toonFoutFeedback(): void {
  toonOverlay(FOUTE_BERICHTEN, 'fout');
  mascotte.reageerFout();
}

function toonOverlay(berichten: string[], soort: 'goed' | 'fout'): void {
  const overlay = document.createElement('div');
  overlay.className = 'feedback-overlay';

  const bericht = document.createElement('div');
  bericht.className = `feedback-overlay__bericht ${soort}`;
  bericht.textContent = berichten[Math.floor(Math.random() * berichten.length)];
  overlay.appendChild(bericht);

  document.body.appendChild(overlay);
  setTimeout(() => overlay.remove(), 700);
}
