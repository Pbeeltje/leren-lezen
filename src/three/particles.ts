import * as THREE from 'three';
import { sceneManager } from './sceneManager.ts';

interface ActieveBurst {
  punten: THREE.Points;
  snelheden: Float32Array;
  materiaal: THREE.PointsMaterial;
  levensduur: number;
}

const KLEUREN = [0xffc93c, 0xff7a3d, 0x3dbdff, 0x3ecf6e, 0xff5d6c];

class Confetti {
  private actief: ActieveBurst[] = [];
  private afmelden: (() => void) | null = null;

  private koppel(): void {
    if (this.afmelden) return;
    this.afmelden = sceneManager.opAnimatie((delta) => this.tik(delta));
    sceneManager.beginEffect();
  }

  private ontkoppel(): void {
    if (!this.afmelden) return;
    this.afmelden();
    this.afmelden = null;
    sceneManager.eindEffect();
  }

  burst(kleurIndex = 0, oorsprong: [number, number, number] = [0, -1, 2]): void {
    this.koppel();

    const aantal = 60;
    const posities = new Float32Array(aantal * 3);
    const snelheden = new Float32Array(aantal * 3);

    for (let i = 0; i < aantal; i++) {
      posities[i * 3] = oorsprong[0];
      posities[i * 3 + 1] = oorsprong[1];
      posities[i * 3 + 2] = oorsprong[2];

      const hoek = Math.random() * Math.PI * 2;
      const kracht = 1.5 + Math.random() * 2.5;
      snelheden[i * 3] = Math.cos(hoek) * kracht;
      snelheden[i * 3 + 1] = Math.random() * 4 + 2;
      snelheden[i * 3 + 2] = Math.sin(hoek) * kracht;
    }

    const geometrie = new THREE.BufferGeometry();
    geometrie.setAttribute('position', new THREE.BufferAttribute(posities, 3));
    const materiaal = new THREE.PointsMaterial({
      color: KLEUREN[kleurIndex % KLEUREN.length],
      size: 0.18,
      transparent: true,
      opacity: 1,
    });
    const punten = new THREE.Points(geometrie, materiaal);
    sceneManager.scene.add(punten);

    this.actief.push({ punten, snelheden, materiaal, levensduur: 0 });
  }

  private tik(delta: number): void {
    const zwaartekracht = 6;

    for (let i = this.actief.length - 1; i >= 0; i--) {
      const burst = this.actief[i];
      burst.levensduur += delta;

      const posities = burst.punten.geometry.getAttribute('position') as THREE.BufferAttribute;
      for (let p = 0; p < posities.count; p++) {
        const vx = burst.snelheden[p * 3];
        let vy = burst.snelheden[p * 3 + 1];
        const vz = burst.snelheden[p * 3 + 2];

        vy -= zwaartekracht * delta;
        burst.snelheden[p * 3 + 1] = vy;

        posities.setX(p, posities.getX(p) + vx * delta);
        posities.setY(p, posities.getY(p) + vy * delta);
        posities.setZ(p, posities.getZ(p) + vz * delta);
      }
      posities.needsUpdate = true;

      burst.materiaal.opacity = Math.max(0, 1 - burst.levensduur / 1.2);

      if (burst.levensduur > 1.2) {
        sceneManager.scene.remove(burst.punten);
        burst.punten.geometry.dispose();
        burst.materiaal.dispose();
        this.actief.splice(i, 1);
      }
    }
    if (this.actief.length === 0) this.ontkoppel();
  }

  /**
   * Kort vuurwerkje na een goede toets: een paar bursts kort na elkaar, verspreid
   * over het scherm. 'groot' (perfecte score) heeft meer bursts dan 'klein'.
   * Blijft bewust kort — geen animatie die in de weg zit van het resultaatscherm.
   */
  vuurwerk(niveau: 'klein' | 'groot'): void {
    const posities: Array<[number, number, number]> = [
      [-2.5, 1, 1],
      [2.5, 1.5, 1],
      [0, 2.5, 0.5],
      [-1.5, 0.5, 2],
    ];
    const aantalBursts = niveau === 'groot' ? 4 : 2;
    for (let i = 0; i < aantalBursts; i++) {
      setTimeout(() => this.burst(i, posities[i % posities.length]), i * 180);
    }
  }
}

export const confetti = new Confetti();
