import * as THREE from 'three';
import { FontLoader, type Font } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

// Eigen, kleine three.js-scene (los van de gedeelde achtergrondlaag) speciaal voor
// de woord-bouwen-oefening: klikbare 3D letterblokjes.
// Lettertype: three.js' ingebouwde Helvetiker-demolettertype als tijdelijke oplossing
// (zie plan: Fredoka/Baloo 2 omzetten naar typeface-json is latere polish, geen blokkade voor Fase 1).

let fontCache: Font | null = null;
let fontBeloften: Promise<Font> | null = null;

function laadFont(): Promise<Font> {
  if (fontCache) return Promise.resolve(fontCache);
  if (!fontBeloften) {
    const loader = new FontLoader();
    fontBeloften = loader.loadAsync('/assets/fonts/helvetiker_bold.typeface.json').then((font) => {
      fontCache = font;
      return font;
    });
  }
  return fontBeloften;
}

interface Blok {
  mesh: THREE.Mesh;
  letter: string;
  gebruikt: boolean;
}

export class LetterBlokkenScene {
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(45, 1, 0.1, 20);
  private renderer: THREE.WebGLRenderer;
  private blokken: Blok[] = [];
  private raycaster = new THREE.Raycaster();
  private muisVector = new THREE.Vector2();
  private container: HTMLElement;
  private actief = true;
  private onLetterGekozen: (letter: string, blokIndex: number) => void;

  constructor(container: HTMLElement, onLetterGekozen: (letter: string, blokIndex: number) => void) {
    this.container = container;
    this.onLetterGekozen = onLetterGekozen;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    container.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.touchAction = 'none';

    this.camera.position.set(0, 0.4, 6);
    this.camera.lookAt(0, 0, 0);

    this.scene.add(new THREE.AmbientLight(0xffffff, 1));
    const licht = new THREE.DirectionalLight(0xffffff, 0.7);
    licht.position.set(2, 4, 5);
    this.scene.add(licht);

    this.pasGrootteAan();
    this.renderer.setAnimationLoop((tijd) => this.tik(tijd));

    this.renderer.domElement.addEventListener('pointerdown', (event) => this.klik(event));
  }

  async toonLetters(letters: string[]): Promise<void> {
    const font = await laadFont();
    this.ruimOp();

    // Vaste 1.6-eenheden-afstand kon bij een smal venster/kaart buiten het camerabeeld
    // vallen (de buitenste blokjes leken dan "verdwenen"). Bereken daarom de zichtbare
    // breedte op z=0 uit de huidige camera en pas spacing (en lettergrootte) daarop aan,
    // zodat alle blokjes altijd binnen beeld blijven, ongeacht schermbreedte.
    const afstandTotCamera = this.camera.position.z;
    const vFovRad = (this.camera.fov * Math.PI) / 180;
    const zichtbareHoogte = 2 * Math.tan(vFovRad / 2) * afstandTotCamera;
    const zichtbareBreedte = zichtbareHoogte * this.camera.aspect;
    const marge = 0.85; // laat wat lucht over aan de randen
    const maxSpacing = 1.6;
    const spacing =
      letters.length > 1 ? Math.min(maxSpacing, (zichtbareBreedte * marge) / (letters.length - 1)) : maxSpacing;
    const letterGrootte = Math.min(0.7, spacing * 0.55);

    const breedteTotaal = (letters.length - 1) * spacing;
    letters.forEach((letter, index) => {
      const geometrie = new TextGeometry(letter, {
        font,
        size: letterGrootte,
        depth: letterGrootte * 0.5,
        curveSegments: 6,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
      });
      geometrie.computeBoundingBox();
      geometrie.center();

      const kleur = new THREE.Color().setHSL((index * 0.15) % 1, 0.55, 0.6);
      const materiaal = new THREE.MeshStandardMaterial({ color: kleur, roughness: 0.4 });
      const mesh = new THREE.Mesh(geometrie, materiaal);
      mesh.position.set(index * spacing - breedteTotaal / 2, 0, 0);
      mesh.userData.blokIndex = index;
      this.scene.add(mesh);

      this.blokken.push({ mesh, letter, gebruikt: false });
    });
  }

  private ruimOp(): void {
    for (const blok of this.blokken) {
      this.scene.remove(blok.mesh);
      blok.mesh.geometry.dispose();
      (blok.mesh.material as THREE.Material).dispose();
    }
    this.blokken = [];
  }

  markeerGebruikt(blokIndex: number): void {
    const blok = this.blokken[blokIndex];
    if (!blok) return;
    blok.gebruikt = true;
    (blok.mesh.material as THREE.MeshStandardMaterial).opacity = 0.25;
    (blok.mesh.material as THREE.MeshStandardMaterial).transparent = true;
  }

  schudFout(blokIndex: number): void {
    const blok = this.blokken[blokIndex];
    if (!blok) return;
    blok.mesh.userData.schudTot = performance.now() + 300;
  }

  private klik(event: PointerEvent): void {
    if (!this.actief) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.muisVector.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.muisVector.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.muisVector, this.camera);
    const meshes = this.blokken.filter((b) => !b.gebruikt).map((b) => b.mesh);
    const treffers = this.raycaster.intersectObjects(meshes, false);
    if (treffers.length === 0) return;

    const geraakt = treffers[0].object as THREE.Mesh;
    const blokIndex = geraakt.userData.blokIndex as number;
    const blok = this.blokken[blokIndex];
    this.onLetterGekozen(blok.letter, blokIndex);
  }

  private tik(tijd: number): void {
    for (const blok of this.blokken) {
      blok.mesh.rotation.y = Math.sin(tijd * 0.0006 + blok.mesh.position.x) * 0.15;

      const schudTot = blok.mesh.userData.schudTot as number | undefined;
      if (schudTot && tijd < schudTot) {
        blok.mesh.position.x += Math.sin(tijd * 0.08) * 0.03;
      }
    }
    this.renderer.render(this.scene, this.camera);
  }

  pasGrootteAan(): void {
    const breedte = this.container.clientWidth || 320;
    const hoogte = this.container.clientHeight || 200;
    this.renderer.setSize(breedte, hoogte);
    this.camera.aspect = breedte / hoogte;
    this.camera.updateProjectionMatrix();
  }

  vernietig(): void {
    this.actief = false;
    this.ruimOp();
    this.renderer.setAnimationLoop(null);
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
