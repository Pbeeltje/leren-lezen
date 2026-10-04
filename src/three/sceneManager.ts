import * as THREE from 'three';
import { bijZichtbaarheid, paginaZichtbaar } from '../engine/zichtbaarheid.ts';

// Eén gedeelde laag achter de hele DOM-UI. Puur decoratief/reactief; blokkeert nooit
// klikken (pointer-events: none staat al op #drie-laag in global.css).
// De lus draait zolang de ruimte op het scherm staat (ook in menu's) of een kort effect
// (confetti) de canvas nodig heeft, en stopt als de pagina naar de achtergrond gaat.

class SceneManager {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  private renderer?: THREE.WebGLRenderer;
  private laag?: HTMLElement;
  private klok = new THREE.Timer();
  private animatieFuncties = new Set<(delta: number, verlopen: number) => void>();
  private loopAan = false;
  private doorlopend = true;
  private effecten = 0;

  init(container: HTMLElement): void {
    if (this.renderer) return; // al geïnitialiseerd

    this.laag = container;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    this.camera.position.set(0, 0, 8);

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const richtingsLicht = new THREE.DirectionalLight(0xffffff, 0.6);
    richtingsLicht.position.set(3, 5, 4);
    this.scene.add(richtingsLicht);


    this.pasGrootteAan();
    window.addEventListener('resize', () => this.pasGrootteAan());
    bijZichtbaarheid(() => this.werkLoopBij());
    this.werkLoopBij();
  }

  /** De ruimte-meshes staan op het scherm en moeten blijven animeren. */
  zetDoorlopend(aan: boolean): void {
    this.doorlopend = aan;
    this.werkLoopBij();
  }

  /** Een kort effect (confetti) heeft de canvas even nodig, ook bij een ander thema. */
  beginEffect(): void {
    this.effecten++;
    this.werkLoopBij();
  }

  eindEffect(): void {
    this.effecten = Math.max(0, this.effecten - 1);
    this.werkLoopBij();
  }

  private werkLoopBij(): void {
    if (!this.renderer || !this.laag) return;
    const aan = paginaZichtbaar() && (this.doorlopend || this.effecten > 0);
    this.laag.hidden = !aan;
    if (aan === this.loopAan) return;
    this.loopAan = aan;
    this.renderer.setAnimationLoop(aan ? (tijd) => this.tik(tijd) : null);
  }

  private pasGrootteAan(): void {
    if (!this.renderer) return;
    const breedte = window.innerWidth;
    const hoogte = window.innerHeight;
    this.renderer.setSize(breedte, hoogte);
    this.camera.aspect = breedte / hoogte;
    this.camera.updateProjectionMatrix();
  }

  /** Registreer een functie die elk frame draait. Retourneert een afmeldfunctie. */
  opAnimatie(fn: (delta: number, verlopen: number) => void): () => void {
    this.animatieFuncties.add(fn);
    return () => this.animatieFuncties.delete(fn);
  }

  private tik(tijd: number): void {
    this.klok.update(tijd);
    // Begrensd: na een tijd in een ander tabblad is de eerste delta anders seconden groot.
    const delta = Math.min(this.klok.getDelta(), 0.1);
    const verlopen = this.klok.getElapsed();

    this.animatieFuncties.forEach((fn) => fn(delta, verlopen));
    this.renderer?.render(this.scene, this.camera);
  }
}

export const sceneManager = new SceneManager();
