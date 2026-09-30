import * as THREE from 'three';
import { FontLoader, type Font } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

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
  groep: THREE.Group;
  letter: string;
  gebruikt: boolean;
  materialen: THREE.MeshStandardMaterial[];
  basisX: number;
}

// Maten bij schaal 1; bij een andere schermbreedte wordt de hele groep geschaald.
const BASIS_GROOTTE = 0.8;

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
  private klikLuisteraar = (event: PointerEvent) => this.klik(event);
  // Bij de eerste vraag hangt de kaart nog niet in de pagina (breedte 0): volg de echte maat.
  private grootteWacht = new ResizeObserver(() => this.pasGrootteAan());

  constructor(container: HTMLElement, onLetterGekozen: (letter: string, blokIndex: number) => void) {
    this.container = container;
    this.onLetterGekozen = onLetterGekozen;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.touchAction = 'none';

    this.camera.position.set(0, 0.3, 4.5);
    this.camera.lookAt(0, 0, 0);

    this.scene.add(new THREE.AmbientLight(0xffffff, 1));
    const licht = new THREE.DirectionalLight(0xffffff, 0.7);
    licht.position.set(2, 4, 5);
    this.scene.add(licht);

    this.pasGrootteAan();
    this.renderer.setAnimationLoop((tijd) => this.tik(tijd));

    this.renderer.domElement.addEventListener('pointerdown', this.klikLuisteraar);
    this.grootteWacht.observe(container);
  }

  async toonLetters(letters: string[]): Promise<void> {
    const font = await laadFont();
    // De scene kan al vernietigd zijn terwijl het lettertype nog laadde.
    if (!this.actief) return;
    this.ruimOp();

    // Elk blokje is een gekleurd kubusje met de letter ervoor: het hele blokje is
    // aantikbaar, niet alleen de dunne lijnen van de letter (lastig bij een i of l).
    const blokGeometrie = new RoundedBoxGeometry(BASIS_GROOTTE * 1.4, BASIS_GROOTTE * 1.5, BASIS_GROOTTE * 0.6, 3, 0.12);
    letters.forEach((letter, index) => {
      const letterGeometrie = new TextGeometry(letter, {
        font,
        size: BASIS_GROOTTE,
        depth: BASIS_GROOTTE * 0.2,
        curveSegments: 6,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
      });
      letterGeometrie.computeBoundingBox();
      letterGeometrie.center();

      const tint = (index * 0.15) % 1;
      const blokMateriaal = new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(tint, 0.75, 0.75), roughness: 0.5 });
      const letterMateriaal = new THREE.MeshStandardMaterial({ color: 0x2d2a4a, roughness: 0.4 });
      const blok = new THREE.Mesh(blokGeometrie.clone(), blokMateriaal);
      const tekst = new THREE.Mesh(letterGeometrie, letterMateriaal);
      tekst.position.z = BASIS_GROOTTE * 0.4;

      const groep = new THREE.Group();
      groep.add(blok, tekst);
      groep.userData.blokIndex = index;
      this.scene.add(groep);
      this.blokken.push({ groep, letter, gebruikt: false, materialen: [blokMateriaal, letterMateriaal], basisX: 0 });
    });
    blokGeometrie.dispose();
    this.plaatsBlokken();
  }

  // Vaste afstanden vielen bij een smal venster buiten beeld: reken de zichtbare breedte
  // op z=0 uit de huidige camera en schaal afstand en grootte daarop (ook na een resize).
  private plaatsBlokken(): void {
    const aantal = this.blokken.length;
    if (aantal === 0) return;
    const vFovRad = (this.camera.fov * Math.PI) / 180;
    const zichtbareBreedte = 2 * Math.tan(vFovRad / 2) * this.camera.position.z * this.camera.aspect;
    const maxSpacing = 1.8;
    // Plaats voor aantal blokjes van ~1.4 lettergrootte breed, met wat lucht aan de randen.
    const spacing = Math.min(maxSpacing, (zichtbareBreedte * 0.92) / aantal);
    const schaal = Math.min(1, (spacing * 0.6) / BASIS_GROOTTE);
    const breedteTotaal = (aantal - 1) * spacing;
    this.blokken.forEach((blok, index) => {
      blok.basisX = index * spacing - breedteTotaal / 2;
      blok.groep.position.x = blok.basisX;
      blok.groep.scale.setScalar(schaal);
    });
  }

  private ruimOp(): void {
    for (const blok of this.blokken) {
      this.scene.remove(blok.groep);
      blok.groep.traverse((obj) => {
        if (obj instanceof THREE.Mesh) obj.geometry.dispose();
      });
      for (const materiaal of blok.materialen) materiaal.dispose();
    }
    this.blokken = [];
  }

  markeerGebruikt(blokIndex: number): void {
    const blok = this.blokken[blokIndex];
    if (!blok) return;
    blok.gebruikt = true;
    for (const materiaal of blok.materialen) {
      materiaal.transparent = true;
      materiaal.opacity = 0.25;
    }
  }

  schudFout(blokIndex: number): void {
    const blok = this.blokken[blokIndex];
    if (!blok) return;
    blok.groep.userData.schudTot = performance.now() + 300;
  }

  private klik(event: PointerEvent): void {
    if (!this.actief) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.muisVector.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.muisVector.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.muisVector, this.camera);
    const groepen = this.blokken.filter((b) => !b.gebruikt).map((b) => b.groep);
    const treffers = this.raycaster.intersectObjects(groepen, true);
    if (treffers.length === 0) return;

    const groep = treffers[0].object.parent as THREE.Group;
    const blokIndex = groep.userData.blokIndex as number;
    const blok = this.blokken[blokIndex];
    if (!blok) return;
    this.onLetterGekozen(blok.letter, blokIndex);
  }

  private tik(tijd: number): void {
    const nu = performance.now();
    for (const blok of this.blokken) {
      blok.groep.rotation.y = Math.sin(tijd * 0.0006 + blok.basisX) * 0.15;
      // Schudden rond de vaste plek, zodat een blokje na een fout niet langzaam wegdrijft.
      const schudTot = blok.groep.userData.schudTot as number | undefined;
      blok.groep.position.x = schudTot && nu < schudTot ? blok.basisX + Math.sin(nu * 0.08) * 0.08 : blok.basisX;
    }
    this.renderer.render(this.scene, this.camera);
  }

  pasGrootteAan(): void {
    const breedte = this.container.clientWidth || 320;
    const hoogte = this.container.clientHeight || 200;
    // false: de CSS bepaalt de weergavemaat, anders blijft een inline 320px-breedte hangen.
    this.renderer.setSize(breedte, hoogte, false);
    this.camera.aspect = breedte / hoogte;
    this.camera.updateProjectionMatrix();
    this.plaatsBlokken();
  }

  vernietig(): void {
    if (!this.actief) return;
    this.actief = false;
    this.grootteWacht.disconnect();
    this.ruimOp();
    this.renderer.setAnimationLoop(null);
    this.renderer.domElement.removeEventListener('pointerdown', this.klikLuisteraar);
    this.renderer.dispose();
    // Browsers houden maar ~16 WebGL-contexten tegelijk; zonder dit kan na veel
    // woord-bouwen-oefeningen de achtergrondlaag zijn context kwijtraken.
    this.renderer.forceContextLoss();
    this.renderer.domElement.remove();
  }
}
