import * as THREE from 'three';
import { sceneManager } from './sceneManager.ts';

// Procedurele mascotte: een blob met oogjes, geen geïmporteerd 3D-model nodig.
// Let op: dit is een eigen bedenksel in de sfeer van de jaren '80-'90, geen
// historische VLL-mascotte — die bestond toen nog niet (pas "Kim" vanaf 2014).

type Reactie = 'rustig' | 'goed' | 'fout';

const BASIS_SCHAAL = 0.75;
const BASIS_Y = -3.3;

class Mascotte {
  private groep = new THREE.Group();
  private lichaam?: THREE.Mesh;
  private reactie: Reactie = 'rustig';
  private reactieTijd = 0;
  private gemonteerd = false;

  mount(): void {
    if (this.gemonteerd) return;
    this.gemonteerd = true;

    const lichaamGeometrie = new THREE.SphereGeometry(1, 32, 32);
    const lichaamMateriaal = new THREE.MeshStandardMaterial({ color: 0xff7a3d, roughness: 0.4 });
    this.lichaam = new THREE.Mesh(lichaamGeometrie, lichaamMateriaal);
    this.groep.add(this.lichaam);

    const oogGeometrie = new THREE.SphereGeometry(0.16, 16, 16);
    const oogMateriaal = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const pupilGeometrie = new THREE.SphereGeometry(0.08, 12, 12);
    const pupilMateriaal = new THREE.MeshStandardMaterial({ color: 0x1b1b2f });

    for (const zijde of [-1, 1]) {
      const oog = new THREE.Mesh(oogGeometrie, oogMateriaal);
      oog.position.set(0.32 * zijde, 0.25, 0.85);
      this.groep.add(oog);

      const pupil = new THREE.Mesh(pupilGeometrie, pupilMateriaal);
      pupil.position.set(0.32 * zijde, 0.25, 0.98);
      this.groep.add(pupil);
    }

    this.groep.position.set(0, BASIS_Y, 1.5);
    this.groep.scale.setScalar(BASIS_SCHAAL);
    sceneManager.scene.add(this.groep);

    sceneManager.opAnimatie((delta, verlopen) => this.tik(delta, verlopen));
  }

  private tik(delta: number, verlopen: number): void {
    const zweef = Math.sin(verlopen * 1.6) * 0.08;
    this.groep.position.y = BASIS_Y + zweef;
    this.groep.rotation.z = Math.sin(verlopen * 0.8) * 0.03;

    if (this.reactie === 'rustig') return;

    this.reactieTijd += delta; // niet per frame: op een 120Hz-scherm was de reactie anders half zo lang
    const voortgang = Math.min(this.reactieTijd / 0.5, 1);

    if (this.reactie === 'goed') {
      const puls = 1 + Math.sin(voortgang * Math.PI) * 0.35;
      this.groep.scale.set(BASIS_SCHAAL * puls, BASIS_SCHAAL * (2 - puls), BASIS_SCHAAL * puls);
    } else {
      const schud = Math.sin(voortgang * Math.PI * 4) * (1 - voortgang) * 0.25;
      this.groep.rotation.z = schud;
    }

    if (voortgang >= 1) {
      this.reactie = 'rustig';
      this.groep.scale.setScalar(BASIS_SCHAAL);
    }
  }

  reageerGoed(): void {
    this.reactie = 'goed';
    this.reactieTijd = 0;
  }

  reageerFout(): void {
    this.reactie = 'fout';
    this.reactieTijd = 0;
  }
}

export const mascotte = new Mascotte();
