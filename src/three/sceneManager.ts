import * as THREE from 'three';

// Eén gedeelde laag achter de hele DOM-UI. Puur decoratief/reactief; blokkeert nooit
// klikken (pointer-events: none staat al op #drie-laag in global.css).

class SceneManager {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  private renderer?: THREE.WebGLRenderer;
  private klok = new THREE.Timer();
  private animatieFuncties = new Set<(delta: number, verlopen: number) => void>();
  private sterren?: THREE.Points;

  init(container: HTMLElement): void {
    if (this.renderer) return; // al geïnitialiseerd

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    this.camera.position.set(0, 0, 8);

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const richtingsLicht = new THREE.DirectionalLight(0xffffff, 0.6);
    richtingsLicht.position.set(3, 5, 4);
    this.scene.add(richtingsLicht);

    this.maakAchtergrondSterren();

    this.pasGrootteAan();
    window.addEventListener('resize', () => this.pasGrootteAan());

    this.renderer.setAnimationLoop((tijd) => this.tik(tijd));
  }

  private maakAchtergrondSterren(): void {
    const aantal = 180;
    const posities = new Float32Array(aantal * 3);
    for (let i = 0; i < aantal; i++) {
      posities[i * 3] = (Math.random() - 0.5) * 30;
      posities[i * 3 + 1] = (Math.random() - 0.5) * 20;
      posities[i * 3 + 2] = -10 - Math.random() * 10;
    }
    const geometrie = new THREE.BufferGeometry();
    geometrie.setAttribute('position', new THREE.BufferAttribute(posities, 3));
    const materiaal = new THREE.PointsMaterial({ color: 0xffffff, size: 0.12, transparent: true, opacity: 0.7 });
    this.sterren = new THREE.Points(geometrie, materiaal);
    this.scene.add(this.sterren);
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

    if (this.sterren) {
      this.sterren.rotation.y = verlopen * 0.01;
    }

    this.animatieFuncties.forEach((fn) => fn(delta, verlopen));
    this.renderer?.render(this.scene, this.camera);
  }
}

export const sceneManager = new SceneManager();
