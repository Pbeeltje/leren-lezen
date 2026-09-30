import * as THREE from 'three';
import { sceneManager } from './sceneManager.ts';

// Rustige ruimte-achtergrond: zachte ronde sterren in een paar kleuren die langzaam
// twinkelen, een geringde planeet en een maantje aan de randen (achter de witte kaarten),
// en af en toe een vallende ster. Bewust traag en gedempt: het mag niet afleiden.

const rustigeBeweging = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function zachteStipTextuur(): THREE.Texture {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const verloop = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  verloop.addColorStop(0, 'rgba(255,255,255,1)');
  verloop.addColorStop(0.25, 'rgba(255,255,255,0.85)');
  verloop.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = verloop;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

function streepjesTextuur(kleuren: string[]): THREE.Texture {
  const c = document.createElement('canvas');
  c.width = 16;
  c.height = 128;
  const g = c.getContext('2d')!;
  const band = c.height / kleuren.length;
  kleuren.forEach((k, i) => {
    g.fillStyle = k;
    g.fillRect(0, i * band, c.width, band + 1);
  });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Afstand vanaf de camera -> halve zichtbare breedte/hoogte op die diepte.
function zichtveld(diepte: number): { b: number; h: number } {
  const cam = sceneManager.camera;
  const h = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * (cam.position.z - diepte);
  return { b: h * cam.aspect, h };
}

const groep = new THREE.Group();
let vraagVallendeSter = false;

/** Laat de ruimte zien of verbergt hem (andere achtergronden tekenen hun eigen decor). */
export function zetRuimteZichtbaar(zichtbaar: boolean): void {
  groep.visible = zichtbaar;
}

/** Een vallende ster als beloning voor een goed antwoord. */
export function schietVallendeSter(): void {
  vraagVallendeSter = true;
}

export function maakRuimte(): void {
  const scene = groep;
  sceneManager.scene.add(groep);
  const stip = zachteStipTextuur();

  // Drie sterrenlagen met eigen kleur, grootte en twinkeltempo.
  const lagen: { punten: THREE.Points; tempo: number; basis: number }[] = [];
  const soorten = [
    { kleur: 0xffffff, grootte: 0.16, aantal: 160, tempo: 0.9, basis: 0.75 },
    { kleur: 0xbfd8ff, grootte: 0.22, aantal: 60, tempo: 0.6, basis: 0.6 },
    { kleur: 0xffe6a8, grootte: 0.3, aantal: 25, tempo: 0.4, basis: 0.55 },
  ];
  for (const s of soorten) {
    const posities = new Float32Array(s.aantal * 3);
    for (let i = 0; i < s.aantal; i++) {
      posities[i * 3] = (Math.random() - 0.5) * 34;
      posities[i * 3 + 1] = (Math.random() - 0.5) * 22;
      posities[i * 3 + 2] = -10 - Math.random() * 10;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(posities, 3));
    const mat = new THREE.PointsMaterial({
      color: s.kleur,
      size: s.grootte,
      map: stip,
      transparent: true,
      opacity: s.basis,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const punten = new THREE.Points(geo, mat);
    scene.add(punten);
    lagen.push({ punten, tempo: s.tempo, basis: s.basis });
  }

  // Nevel: een paar grote, heel zwakke gekleurde gloeiwolken ver weg.
  const nevels: THREE.Sprite[] = [];
  for (const [kleur, x, y, schaal] of [
    [0x7a4cff, -7, 4, 14],
    [0x1fb5c9, 8, -3, 16],
    [0xff5fa8, 3, 6, 10],
  ] as const) {
    const mat = new THREE.SpriteMaterial({ map: stip, color: kleur, transparent: true, opacity: 0.1, depthWrite: false, blending: THREE.AdditiveBlending });
    const nevel = new THREE.Sprite(mat);
    nevel.position.set(x, y, -18);
    nevel.scale.set(schaal, schaal, 1);
    scene.add(nevel);
    nevels.push(nevel);
  }

  // Geringde planeet linksonder, half buiten beeld.
  const planeet = new THREE.Group();
  const bol = new THREE.Mesh(
    new THREE.SphereGeometry(1.6, 40, 28),
    new THREE.MeshStandardMaterial({
      map: streepjesTextuur(['#f6a96b', '#f7c58f', '#e58c5a', '#f7c58f', '#f6a96b', '#d97a4e', '#f7c58f']),
      roughness: 0.9,
    }),
  );
  planeet.add(bol);
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(2.1, 2.9, 64),
    new THREE.MeshBasicMaterial({ color: 0xffe0b8, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false }),
  );
  ring.rotation.x = 1.15; // schuin, zodat de ring als ellips zichtbaar is
  planeet.add(ring);
  planeet.rotation.z = 0.35;
  scene.add(planeet);

  // Klein maantje rechtsboven.
  const maan = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 32, 20),
    new THREE.MeshStandardMaterial({ color: 0xcfd6e6, roughness: 1, flatShading: true }),
  );
  scene.add(maan);

  const PLANEET_DIEPTE = -6;
  const MAAN_DIEPTE = -8;
  function plaats(): void {
    const p = zichtveld(PLANEET_DIEPTE);
    planeet.position.set(-p.b + 0.6, -p.h + 1.0, PLANEET_DIEPTE);
    const m = zichtveld(MAAN_DIEPTE);
    // Onder de munten/profielknop rechtsboven.
    // Staand scherm (telefoon): rechts halverwege, anders zit hij achter de titels.
    if (sceneManager.camera.aspect < 1) maan.position.set(m.b - 0.9, -m.h * 0.25, MAAN_DIEPTE);
    else maan.position.set(m.b - 1.6, m.h - 2.6, MAAN_DIEPTE);
  }
  plaats();
  window.addEventListener('resize', plaats);

  // Vallende ster: een korte, lichte streep die af en toe diagonaal door beeld schiet.
  const staartMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
  const staartGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(1.2, 0.45, 0)]);
  const vallend = new THREE.Line(staartGeo, staartMat);
  scene.add(vallend);
  let volgendeVal = 6 + Math.random() * 8;
  let valTijd = -1;
  const valStart = new THREE.Vector3();

  sceneManager.opAnimatie((delta, verlopen) => {
    bol.rotation.y += delta * 0.05;
    maan.rotation.y += delta * 0.03;
    if (rustigeBeweging || !groep.visible) return;

    lagen.forEach((laag, i) => {
      const mat = laag.punten.material as THREE.PointsMaterial;
      mat.opacity = laag.basis * (0.75 + 0.25 * Math.sin(verlopen * laag.tempo + i * 2));
      laag.punten.rotation.y = verlopen * (0.004 + i * 0.002);
    });
    planeet.position.y += Math.sin(verlopen * 0.4) * delta * 0.03;

    volgendeVal -= delta;
    if ((volgendeVal <= 0 || vraagVallendeSter) && valTijd < 0) {
      vraagVallendeSter = false;
      const v = zichtveld(-12);
      valStart.set((Math.random() * 1.2 - 0.2) * v.b, v.h * (0.3 + Math.random() * 0.6), -12);
      valTijd = 0;
    }
    if (valTijd >= 0) {
      valTijd += delta;
      const duur = 1.1;
      const t = valTijd / duur;
      vallend.position.set(valStart.x - t * 7, valStart.y - t * 2.6, valStart.z);
      staartMat.opacity = Math.sin(Math.PI * Math.min(t, 1)) * 0.7;
      if (t >= 1) {
        valTijd = -1;
        staartMat.opacity = 0;
        volgendeVal = 12 + Math.random() * 14;
      }
    }
  });
}
