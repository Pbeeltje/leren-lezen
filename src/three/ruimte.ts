import * as THREE from 'three';
import { sceneManager } from './sceneManager.ts';

// Rustige ruimte-achtergrond: zachte ronde sterren in een paar kleuren die langzaam
// twinkelen, een geringde planeet en een maantje aan de randen (achter de witte kaarten),
// en rechtsonder een stukje maanbodem met kraters op de voorgrond.
// Bewust traag en gedempt: het mag niet afleiden. Vallende sterren en de raket staan in
// de DOM-laag (achtergrond/ruimte.ts), zodat er nooit twee tegelijk zijn.

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

// Maanbodem: een platte schijf, aan de rand lichter (zonlicht op de horizon) met een paar
// zachte vlekken. Alleen de buitenste rand komt in beeld, dus daar zit de tekening.
function maanSchijfTextuur(): THREE.Texture {
  const c = document.createElement('canvas');
  c.width = c.height = 1024;
  const g = c.getContext('2d')!;
  const m = 512;
  const v = g.createRadialGradient(m, m, 0, m, m, m);
  v.addColorStop(0, '#858a96');
  v.addColorStop(0.75, '#8c919d');
  v.addColorStop(0.93, '#a3a7b2');
  v.addColorStop(0.985, '#b7bbc5');
  v.addColorStop(1, '#d6d9e1');
  g.fillStyle = v;
  g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 60; i++) {
    const hoek = Math.random() * Math.PI * 2;
    const afstand = m * (0.8 + Math.random() * 0.16);
    const x = m + Math.cos(hoek) * afstand;
    const y = m + Math.sin(hoek) * afstand;
    const straal = 6 + Math.random() * 22;
    const vlek = g.createRadialGradient(x, y, 0, x, y, straal);
    vlek.addColorStop(0, Math.random() < 0.5 ? 'rgba(110,115,128,0.35)' : 'rgba(205,209,218,0.3)');
    vlek.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = vlek;
    g.fillRect(x - straal, y - straal, straal * 2, straal * 2);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Een krater van opzij gezien: lichte rand, donkere kom, iets lichtere bodem. */
function maakKrater(): THREE.Group {
  const krater = new THREE.Group();
  const lagen: [number, number, number, number][] = [
    [0xc6cad3, 1, 0, 0],
    [0x737885, 0.84, 0, 0.02],
    [0x969ba7, 0.6, 0.12, -0.12],
  ];
  lagen.forEach(([kleur, r, dx, dy], i) => {
    const schijf = new THREE.Mesh(new THREE.CircleGeometry(r, 40), new THREE.MeshBasicMaterial({ color: kleur }));
    schijf.position.set(dx, dy, i * 0.01);
    krater.add(schijf);
  });
  return krater;
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

/** Laat de ruimte zien of verbergt hem (andere achtergronden tekenen hun eigen decor). */
export function zetRuimteZichtbaar(zichtbaar: boolean): void {
  groep.visible = zichtbaar;
  sceneManager.zetDoorlopend(zichtbaar);
}

export function isRuimteZichtbaar(): boolean {
  return groep.visible;
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

  // Maanbodem op de voorgrond: de rand van een grote schijf die rechtsonder net boven de
  // schermrand uitkomt, als een glooiende heuvel, met een paar kleine kraters erop.
  const bodem = new THREE.Group();
  const schijf = new THREE.Mesh(new THREE.CircleGeometry(1, 360), new THREE.MeshBasicMaterial({ map: maanSchijfTextuur() }));
  bodem.add(schijf);
  // Plek als [deel van de breedte vanaf rechts, deel van de hoogte onder de horizon, grootte].
  const KRATERS: [number, number, number][] = [
    [0.16, 0.5, 0.17],
    [0.38, 0.32, 0.11],
    [0.58, 0.42, 0.08],
    [0.27, 0.12, 0.07],
  ];
  const kraters = KRATERS.map(() => {
    const k = maakKrater();
    bodem.add(k);
    return k;
  });
  scene.add(bodem);

  const PLANEET_DIEPTE = -6;
  const MAAN_DIEPTE = -8;
  const BODEM_DIEPTE = -4;
  function plaats(): void {
    const p = zichtveld(PLANEET_DIEPTE);
    planeet.position.set(-p.b + 0.6, -p.h + 1.0, PLANEET_DIEPTE);
    const m = zichtveld(MAAN_DIEPTE);
    // Onder de munten/profielknop rechtsboven.
    // Staand scherm (telefoon): rechts halverwege, anders zit hij achter de titels.
    if (sceneManager.camera.aspect < 1) maan.position.set(m.b - 0.9, -m.h * 0.25, MAAN_DIEPTE);
    else maan.position.set(m.b - 1.6, m.h - 2.6, MAAN_DIEPTE);

    // Bodem: hoogste punt vlak bij de rechterrand, op ~hoog van de schermhoogte, en naar
    // links aflopend tot ~breed van de breedte. Daaruit volgt de straal van de bol.
    const z = zichtveld(BODEM_DIEPTE);
    const staand = sceneManager.camera.aspect < 1;
    const breed = (staand ? 0.6 : 0.36) * z.b * 2;
    const hoog = (staand ? 0.13 : 0.2) * z.h * 2;
    const straal = (breed * breed + hoog * hoog) / (2 * hoog);
    const mx = z.b - breed * 0.08;
    const my = -z.h + hoog - straal;
    schijf.scale.setScalar(straal);
    schijf.position.set(mx, my, 0);
    bodem.position.z = BODEM_DIEPTE;
    KRATERS.forEach(([u, v, grootte], i) => {
      const x = z.b - u * breed;
      const top = my + Math.sqrt(Math.max(0, straal * straal - (x - mx) * (x - mx)));
      const r = grootte * hoog;
      // Platgedrukt: je kijkt schuin over de bodem.
      kraters[i].scale.set(r, r * 0.42, 1);
      kraters[i].position.set(x, -z.h + v * (top + z.h), 0.02);
    });
  }
  plaats();
  window.addEventListener('resize', plaats);

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
  });
}
