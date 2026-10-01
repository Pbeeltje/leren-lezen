import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { maakTopRechtsBalk } from '../components/TopRechtsBalk.ts';

// Vrij tekenen met de vinger (onder Schrijven). Grote kleurvlakken, twee diktes, gum,
// "terug" (laatste lijn weg) en een nieuw blad. Opslaan hoeft nog niet. De lijnen worden
// bewaard als punten, zodat terug en draaien/vergroten van het scherm de tekening opnieuw
// kunnen tekenen.

const KLEUREN = ['#1b1b2f', '#e53935', '#fb8c00', '#fdd835', '#43a047', '#1e88e5', '#8e24aa', '#ec407a', '#8d6e63'];
const DIKTES = [{ naam: 'dun', px: 6 }, { naam: 'dik', px: 18 }];
const GUM = 'gum';

interface Lijn {
  kleur: string; // of GUM
  dikte: number;
  punten: [number, number][]; // genormaliseerd 0..1, zodat de tekening meeschaalt
}

export function TekenScreen(manager: ScreenManager): Screen {
  const el = document.createElement('div');
  el.className = 'scherm teken-scherm';

  const blad = document.createElement('div');
  blad.className = 'teken-blad';
  const canvas = document.createElement('canvas');
  canvas.className = 'teken-canvas';
  blad.appendChild(canvas);
  el.appendChild(blad);

  const balk = document.createElement('div');
  balk.className = 'teken-balk';
  el.appendChild(balk);

  const lijnen: Lijn[] = [];
  let kleur = KLEUREN[1];
  let dikte = DIKTES[0].px;
  let huidige: Lijn | null = null;
  const ctx = canvas.getContext('2d')!;

  function knop(klasse: string, inhoud: string, label: string, actie: () => void): HTMLButtonElement {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = klasse;
    b.innerHTML = inhoud;
    b.setAttribute('aria-label', label);
    b.addEventListener('click', actie);
    balk.appendChild(b);
    return b;
  }

  const kleurKnoppen: HTMLButtonElement[] = [];
  function kiesKleur(k: string): void {
    kleur = k;
    for (const b of kleurKnoppen) b.classList.toggle('teken-knop--actief', b.dataset.kleur === k);
  }
  for (const k of KLEUREN) {
    const b = knop('teken-kleur', '', 'kleur', () => kiesKleur(k));
    b.style.background = k;
    b.dataset.kleur = k;
    kleurKnoppen.push(b);
  }
  const gumKnop = knop('teken-kleur teken-gum', '<img src="assets/icons/gum.svg" alt="">', 'gum', () => kiesKleur(GUM));
  gumKnop.dataset.kleur = GUM;
  kleurKnoppen.push(gumKnop);

  const dikteKnoppen = DIKTES.map((d) => {
    const b = knop('teken-dikte', `<span style="width:${d.px + 4}px;height:${d.px + 4}px"></span>`, d.naam, () => {
      dikte = d.px;
      for (const x of dikteKnoppen) x.classList.toggle('teken-knop--actief', x === b);
    });
    return b;
  });
  dikteKnoppen[0].classList.add('teken-knop--actief');
  knop('teken-actie', '↶', 'terug', () => {
    lijnen.pop();
    tekenAlles();
  });
  knop('teken-actie', '<img src="assets/icons/nieuw-blad.svg" alt="">', 'nieuw blad', () => {
    lijnen.length = 0;
    tekenAlles();
  });
  kiesKleur(kleur);

  function maat(): { b: number; h: number } {
    return { b: canvas.clientWidth, h: canvas.clientHeight };
  }

  function tekenLijn(l: Lijn): void {
    const { b, h } = maat();
    const schaal = Math.min(b, h) / 400; // dikte meeschalen met het blad
    ctx.globalCompositeOperation = l.kleur === GUM ? 'destination-out' : 'source-over';
    ctx.strokeStyle = l.kleur === GUM ? '#000' : l.kleur;
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth = (l.kleur === GUM ? l.dikte * 2 : l.dikte) * Math.max(0.8, schaal);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const p = l.punten.map(([x, y]) => [x * b, y * h] as const);
    if (p.length === 1) {
      ctx.beginPath();
      ctx.arc(p[0][0], p[0][1], ctx.lineWidth / 2, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    ctx.beginPath();
    ctx.moveTo(p[0][0], p[0][1]);
    // Vloeiend: door de middens van opeenvolgende punten.
    for (let i = 1; i < p.length - 1; i++) {
      ctx.quadraticCurveTo(p[i][0], p[i][1], (p[i][0] + p[i + 1][0]) / 2, (p[i][1] + p[i + 1][1]) / 2);
    }
    ctx.lineTo(p[p.length - 1][0], p[p.length - 1][1]);
    ctx.stroke();
  }

  function tekenAlles(): void {
    const { b, h } = maat();
    ctx.clearRect(0, 0, b, h);
    for (const l of lijnen) tekenLijn(l);
    ctx.globalCompositeOperation = 'source-over';
  }

  function pasGrootteAan(): void {
    const r = window.devicePixelRatio || 1;
    const { b, h } = maat();
    canvas.width = Math.round(b * r);
    canvas.height = Math.round(h * r);
    ctx.setTransform(r, 0, 0, r, 0, 0);
    tekenAlles();
  }

  function punt(e: PointerEvent): [number, number] {
    const rect = canvas.getBoundingClientRect();
    return [(e.clientX - rect.left) / rect.width, (e.clientY - rect.top) / rect.height];
  }

  canvas.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    huidige = { kleur, dikte, punten: [punt(e)] };
    lijnen.push(huidige);
    tekenLijn(huidige);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!huidige) return;
    huidige.punten.push(punt(e));
    tekenAlles();
  });
  const stop = (): void => {
    huidige = null;
  };
  canvas.addEventListener('pointerup', stop);
  canvas.addEventListener('pointercancel', stop);

  const opGrootte = new ResizeObserver(pasGrootteAan);

  const terug = maakTerugKnop(() => manager.pop());
  let topRechts: ReturnType<typeof maakTopRechtsBalk> | null = null;

  return {
    mount(root) {
      root.appendChild(el);
      root.appendChild(terug);
      topRechts = maakTopRechtsBalk(manager);
      root.appendChild(topRechts.element);
      opGrootte.observe(canvas);
    },
    unmount() {
      opGrootte.disconnect();
      el.remove();
      terug.remove();
      topRechts?.element.remove();
      topRechts?.vernietig();
      topRechts = null;
    },
  };
}
