import * as THREE from 'three';
import { bijZichtbaarheid, paginaZichtbaar } from '../engine/zichtbaarheid.ts';

// Eigen, kleine three.js-scene (los van de gedeelde achtergrondlaag) speciaal voor
// de woord-bouwen-oefening: klikbare houten letterblokken, zoals echte speelgoedblokken
// (beukenhout, zwart kadertje, dikke kleine letter; voorbeeld van de eigenaar in
// bronbestanden/blocksexample.jpg). De vlakken zijn canvas-texturen in het lettertype van
// de app (Baloo 2), dus geen apart 3D-lettertype nodig.

const VLAK_PX = 256;

// Vaste pseudo-willekeur per blok, zodat de houtnerf niet bij elk frame verspringt.
function willekeur(zaad: number): () => number {
  let z = zaad * 9301 + 49297;
  return () => ((z = (z * 9301 + 49297) % 233280) / 233280);
}

function houtVlak(zaad: number, letter?: string, kader = true): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = VLAK_PX;
  const g = c.getContext('2d')!;
  const rnd = willekeur(zaad);
  const verloop = g.createLinearGradient(0, 0, VLAK_PX, VLAK_PX);
  verloop.addColorStop(0, '#f3dfbd');
  verloop.addColorStop(1, '#e6c99b');
  g.fillStyle = verloop;
  g.fillRect(0, 0, VLAK_PX, VLAK_PX);
  // Houtnerf: dunne, licht golvende lijnen.
  for (let i = 0; i < 26; i++) {
    const y0 = rnd() * VLAK_PX;
    g.strokeStyle = `rgba(150, 105, 55, ${0.05 + rnd() * 0.12})`;
    g.lineWidth = 0.6 + rnd() * 1.6;
    g.beginPath();
    for (let x = 0; x <= VLAK_PX; x += 16) {
      const y = y0 + Math.sin(x / (40 + rnd() * 30) + i) * (2 + rnd() * 3);
      if (x === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.stroke();
  }
  if (kader) {
    const rand = VLAK_PX * 0.1;
    g.strokeStyle = '#1d1d1f';
    g.lineWidth = VLAK_PX * 0.055;
    g.beginPath();
    g.roundRect(rand, rand, VLAK_PX - rand * 2, VLAK_PX - rand * 2, VLAK_PX * 0.03);
    g.stroke();
  }
  if (letter) {
    g.fillStyle = '#1d1d1f';
    g.font = `700 ${Math.round(VLAK_PX * 0.7)}px ${leesLettertype()}`;
    g.textAlign = 'center';
    g.textBaseline = 'alphabetic';
    // Midden van de letter zelf in het vak, ook bij een staartje (g, j, p) of stok (b, k).
    const m = g.measureText(letter);
    const hoogte = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
    g.fillText(letter, VLAK_PX / 2, VLAK_PX / 2 + hoogte / 2 - m.actualBoundingBoxDescent);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// Hetzelfde leeslettertype als de rest van de leestekst (Andika, of schoolschrift als het
// profiel "aan elkaar" heeft gekozen: zie engine/schrift.ts).
function leesLettertype(): string {
  return getComputedStyle(document.documentElement).getPropertyValue('--leeslettertype').trim() || '"Andika", sans-serif';
}

async function laadLettertype(): Promise<void> {
  try {
    await document.fonts.load(`700 100px ${leesLettertype()}`, 'abc');
  } catch {
    // Geen webfont (offline): dan tekent het canvas met de reservefont.
  }
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
  private camera = new THREE.PerspectiveCamera(28, 1, 0.1, 30);
  private renderer: THREE.WebGLRenderer;
  private blokken: Blok[] = [];
  private raycaster = new THREE.Raycaster();
  private muisVector = new THREE.Vector2();
  private container: HTMLElement;
  private actief = true;
  private onLetterGekozen: (letter: string, blokIndex: number) => void;
  private klikLuisteraar = (event: PointerEvent) => this.klik(event);
  private afmeldZicht: () => void = () => {};
  // Bij de eerste vraag hangt de kaart nog niet in de pagina (breedte 0): volg de echte maat.
  private grootteWacht = new ResizeObserver(() => this.pasGrootteAan());

  constructor(container: HTMLElement, onLetterGekozen: (letter: string, blokIndex: number) => void) {
    this.container = container;
    this.onLetterGekozen = onLetterGekozen;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.touchAction = 'none';

    // Smalle lens van verder weg: zelfde maat, minder vertekening aan de zijkanten.
    this.camera.position.set(0, 0.5, 7.5);
    this.camera.lookAt(0, 0, 0);

    // Ruim licht: lichte beuken blokken, geen schemerige kist.
    this.scene.add(new THREE.AmbientLight(0xffffff, 2.3));
    const licht = new THREE.DirectionalLight(0xffffff, 1.5);
    licht.position.set(2, 4, 5);
    this.scene.add(licht);

    this.pasGrootteAan();
    this.afmeldZicht = bijZichtbaarheid((aan) => {
      if (!this.actief) return;
      this.renderer.setAnimationLoop(aan ? (tijd) => this.tik(tijd) : null);
    });
    if (paginaZichtbaar()) this.renderer.setAnimationLoop((tijd) => this.tik(tijd));

    this.renderer.domElement.addEventListener('pointerdown', this.klikLuisteraar);
    this.grootteWacht.observe(container);
  }

  async toonLetters(letters: string[]): Promise<void> {
    await laadLettertype();
    // De scene kan al vernietigd zijn terwijl het lettertype nog laadde.
    if (!this.actief) return;
    this.ruimOp();

    const maat = BASIS_GROOTTE * 1.35;
    const geometrie = new THREE.BoxGeometry(maat, maat, maat);
    letters.forEach((letter, index) => {
      // Volgorde van de vlakken bij BoxGeometry: rechts, links, boven, onder, voor, achter.
      const vlakken = [
        houtVlak(index * 7 + 1),
        houtVlak(index * 7 + 2),
        houtVlak(index * 7 + 3, undefined, false),
        houtVlak(index * 7 + 4, undefined, false),
        houtVlak(index * 7 + 5, letter),
        houtVlak(index * 7 + 6),
      ];
      const materialen = vlakken.map((map) => new THREE.MeshStandardMaterial({ map, roughness: 0.75 }));
      const blok = new THREE.Mesh(geometrie.clone(), materialen);
      const groep = new THREE.Group();
      groep.add(blok);
      // Een beetje scheef, zoals blokken die op tafel liggen; de bovenkant is net te zien.
      groep.userData.draai = (willekeur(index + 3)() - 0.5) * 0.26;
      groep.rotation.x = 0.16;
      groep.userData.blokIndex = index;
      this.scene.add(groep);
      this.blokken.push({ groep, letter, gebruikt: false, materialen, basisX: 0 });
    });
    geometrie.dispose();
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
    // Op een smal scherm (telefoon) werden ze zo piepklein: dan twee rijen.
    const rijen = (zichtbareBreedte * 0.92) / aantal < 1.25 && aantal > 3 ? 2 : 1;
    const perRij = Math.ceil(aantal / rijen);
    // Twee rijen op een telefoon: wat kleiner, anders vult één blok bijna de hele breedte.
    const spacing = Math.min(rijen === 2 ? 1.3 : maxSpacing, (zichtbareBreedte * (rijen === 2 ? 0.8 : 0.92)) / perRij);
    // Blok (1.35 x BASIS breed) iets smaller dan de afstand, zodat scheve blokken elkaar niet raken.
    const schaal = Math.min(1, (spacing * (rijen === 2 ? 0.82 : 0.64)) / (BASIS_GROOTTE * 1.35));
    this.blokken.forEach((blok, index) => {
      const rij = Math.floor(index / perRij);
      const inRij = rij === rijen - 1 ? aantal - perRij * (rijen - 1) : perRij;
      const kolom = index - rij * perRij;
      blok.basisX = kolom * spacing - ((inRij - 1) * spacing) / 2;
      blok.groep.position.x = blok.basisX;
      blok.groep.position.y = rijen === 2 ? (rij === 0 ? 0.62 : -0.62) * spacing : 0;
      blok.groep.scale.setScalar(schaal);
    });
  }

  private ruimOp(): void {
    for (const blok of this.blokken) {
      this.scene.remove(blok.groep);
      blok.groep.traverse((obj) => {
        if (obj instanceof THREE.Mesh) obj.geometry.dispose();
      });
      for (const materiaal of blok.materialen) {
        materiaal.map?.dispose();
        materiaal.dispose();
      }
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
      blok.groep.rotation.y = (blok.groep.userData.draai as number) + Math.sin(tijd * 0.0002 + blok.basisX) * 0.08; // rustig wiegen (3x trager op verzoek)
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
    this.afmeldZicht();
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
