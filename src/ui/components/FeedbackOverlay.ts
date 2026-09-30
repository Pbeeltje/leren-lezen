import { confetti } from '../../three/particles.ts';
import { events } from '../../engine/events.ts';
import { speelAf, instructieAudioPad } from '../../engine/audioManager.ts';

// Index i van elke lijst hoort bij het audiobestand feedback-{soort}-{i+1}.mp3 (zie
// bronbestanden/audio-manifest.json) -- de tekst en het geluid moeten dus samen kiezen,
// niet allebei apart random.
// feedback-goed-5 t/m 14 komen uit opname 2 deel 3.
const GOEDE_BERICHTEN = [
  'Goed zo!',
  'Knap gedaan!',
  'Top!',
  'Yes!',
  'Super!',
  'Heel goed!',
  'Goed gedaan!',
  'Wauw!',
  'Prima!',
  'Fantastisch!',
  'Jij kunt het!',
  'Hoera!',
  'Wat knap!',
  'Helemaal goed!',
];
const FOUTE_BERICHTEN = ['Bijna!', 'Probeer nog eens!'];

let kleurTeller = 0;

export function toonGoedFeedback(): void {
  toonOverlay(GOEDE_BERICHTEN, 'goed');
  confetti.burst(kleurTeller++);
  events.emit('antwoord-goed', { muntenVerdiend: 0 });
}

export function toonFoutFeedback(): void {
  toonOverlay(FOUTE_BERICHTEN, 'fout');
}

function toonOverlay(berichten: string[], soort: 'goed' | 'fout'): void {
  const index = Math.floor(Math.random() * berichten.length);

  const overlay = document.createElement('div');
  overlay.className = 'feedback-overlay';

  const bericht = document.createElement('div');
  bericht.className = `feedback-overlay__bericht ${soort}`;
  bericht.textContent = berichten[index];
  overlay.appendChild(bericht);

  document.body.appendChild(overlay);
  speelAf(instructieAudioPad(`feedback-${soort}-${index + 1}`));
  setTimeout(() => overlay.remove(), 700);
}
