import { sceneManager } from './sceneManager.ts';

// Kleine camera-"punch" bij elke schermwissel. Bewust subtiel: de echte
// overgang is de CSS-fade/slide op .scherm, dit is alleen een speels accent.

let bezig = false;
let tijd = 0;
const BASIS_Z = 8;
const DUUR = 0.35;

function stap(delta: number): boolean {
  tijd += delta;
  const voortgang = Math.min(tijd / DUUR, 1);
  const inzoom = Math.sin(voortgang * Math.PI) * 0.6;
  sceneManager.camera.position.z = BASIS_Z - inzoom;
  return voortgang >= 1;
}

let afmelden: (() => void) | null = null;

export function speelSchermOvergang(): void {
  tijd = 0;
  if (bezig) return;
  bezig = true;
  afmelden = sceneManager.opAnimatie((delta) => {
    const klaar = stap(delta);
    if (klaar) {
      sceneManager.camera.position.z = BASIS_Z;
      bezig = false;
      afmelden?.();
      afmelden = null;
    }
  });
}
