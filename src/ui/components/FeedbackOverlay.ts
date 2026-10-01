import { confetti } from '../../three/particles.ts';
import { events } from '../../engine/events.ts';
import { speelAf, instructieAudioPad } from '../../engine/audioManager.ts';

// Elk bericht hoort bij het audiobestand feedback-{soort}-{nr}.mp3 (zie
// bronbestanden/audio-manifest.json), zodat tekst en geluid samen gekozen worden. Het
// nummer staat er expres bij: 'Jij kunt het!' (11) is geschrapt zonder de rest te verschuiven.
interface Bericht {
  tekst: string;
  nr: number;
}
// feedback-goed-5 t/m 14 komen uit opname 2 deel 3.
const GOEDE_BERICHTEN: Bericht[] = [
  { tekst: 'Goed zo!', nr: 1 },
  { tekst: 'Knap gedaan!', nr: 2 },
  { tekst: 'Top!', nr: 3 },
  { tekst: 'Yes!', nr: 4 },
  { tekst: 'Super!', nr: 5 },
  { tekst: 'Heel goed!', nr: 6 },
  { tekst: 'Goed gedaan!', nr: 7 },
  { tekst: 'Wauw!', nr: 8 },
  { tekst: 'Prima!', nr: 9 },
  { tekst: 'Fantastisch!', nr: 10 },
  { tekst: 'Hoera!', nr: 12 },
  { tekst: 'Wat knap!', nr: 13 },
  { tekst: 'Helemaal goed!', nr: 14 },
];
const FOUTE_BERICHTEN: Bericht[] = [
  { tekst: 'Bijna!', nr: 1 },
  { tekst: 'Probeer nog eens!', nr: 2 },
];

let kleurTeller = 0;

export function toonGoedFeedback(): void {
  toonOverlay(GOEDE_BERICHTEN, 'goed');
  confetti.burst(kleurTeller++);
  events.emit('antwoord-goed', { muntenVerdiend: 0 });
}

export function toonFoutFeedback(): void {
  toonOverlay(FOUTE_BERICHTEN, 'fout');
}

function toonOverlay(berichten: Bericht[], soort: 'goed' | 'fout'): void {
  const index = Math.floor(Math.random() * berichten.length);

  const overlay = document.createElement('div');
  overlay.className = 'feedback-overlay';

  const bericht = document.createElement('div');
  bericht.className = `feedback-overlay__bericht ${soort}`;
  bericht.textContent = berichten[index].tekst;
  overlay.appendChild(bericht);

  document.body.appendChild(overlay);
  speelAf(instructieAudioPad(`feedback-${soort}-${berichten[index].nr}`));
  setTimeout(() => overlay.remove(), 700);
}
