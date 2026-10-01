import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { maakTopRechtsBalk } from '../components/TopRechtsBalk.ts';
import {
  AANTAL_PLEKKEN,
  bewaarTekening,
  eersteLegePlek,
  haalTekeningen,
  wisTekening,
  type Lijn,
} from '../../engine/tekeningenStore.ts';

// Vrij tekenen met de vinger (onder Schrijven). Grote kleurvlakken, twee diktes, gum,
// "terug" (laatste lijn weg) en een nieuw blad. Het hartje bewaart de tekening in een van
// de 10 plekjes van dit profiel (engine/tekeningenStore.ts); het lijstje opent ze weer.
// De lijnen worden bewaard als punten, zodat terug en draaien/vergroten van het scherm de
// tekening opnieuw kunnen tekenen.

const KLEUREN = ['#1b1b2f', '#e53935', '#fb8c00', '#fdd835', '#43a047', '#1e88e5', '#8e24aa', '#ec407a', '#8d6e63'];
const DIKTES = [{ naam: 'dun', px: 6 }, { naam: 'dik', px: 18 }];
const GUM = 'gum';


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
  const hoofdCtx = canvas.getContext('2d')!;
  const ctx = hoofdCtx;

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
    gewijzigd = true;
    tekenAlles();
  });
  knop('teken-actie', '<img src="assets/icons/nieuw-blad.svg" alt="">', 'nieuw blad', () => {
    // Niet per ongeluk een tekening kwijtraken: eerst vragen, tenzij het blad leeg is of
    // alles al bewaard is. Met plaatjes en een groot vinkje/kruis, zodat je niet hoeft te lezen.
    if (lijnen.length > 0 && gewijzigd) vraagNieuwBlad();
    else nieuwBlad();
  });
  const bewaarKnop = knop('teken-actie', '<img src="assets/icons/bewaar.svg" alt="">', 'bewaar', bewaar);
  knop('teken-actie', '<img src="assets/icons/tekeningen.svg" alt="">', 'mijn tekeningen', () => toonLijst(false));

  // In welk plekje deze tekening staat (null: nog niet bewaard), en of er sinds het
  // bewaren (of openen) nog iets is getekend.
  let plek: number | null = null;
  let gewijzigd = false;

  function nieuwBlad(): void {
    lijnen.length = 0;
    plek = null;
    gewijzigd = false;
    tekenAlles();
  }

  function vraagNieuwBlad(): void {
    sluitLijst();
    const venster = document.createElement('div');
    venster.className = 'teken-lijst';
    venster.addEventListener('click', (e) => {
      if (e.target === venster) sluitLijst();
    });
    const doos = document.createElement('div');
    doos.className = 'teken-lijst__doos teken-vraag';
    doos.innerHTML = '<img class="teken-vraag__plaatje" src="assets/icons/nieuw-blad.svg" alt=""><p>Nieuw blad?</p>';
    const knoppen = document.createElement('div');
    knoppen.className = 'teken-vraag__knoppen';
    const nee = document.createElement('button');
    nee.type = 'button';
    nee.className = 'teken-vraag__knop teken-vraag__knop--nee';
    nee.textContent = '✕';
    nee.setAttribute('aria-label', 'nee, verder tekenen');
    nee.addEventListener('click', sluitLijst);
    const ja = document.createElement('button');
    ja.type = 'button';
    ja.className = 'teken-vraag__knop teken-vraag__knop--ja';
    ja.textContent = '✓';
    ja.setAttribute('aria-label', 'ja, nieuw blad');
    ja.addEventListener('click', () => {
      sluitLijst();
      nieuwBlad();
    });
    knoppen.append(nee, ja);
    doos.appendChild(knoppen);
    venster.appendChild(doos);
    document.body.appendChild(venster);
    lijst = venster;
  }

  function bewaar(): void {
    if (lijnen.length === 0) return;
    const doel = plek ?? eersteLegePlek();
    if (doel < 0) {
      toonLijst(true); // alles vol: kies welke weg mag
      return;
    }
    bewaarIn(doel);
  }

  function bewaarIn(doel: number): void {
    const { b, h } = maat();
    if (!bewaarTekening(doel, { lijnen, verhouding: b / Math.max(1, h) })) return;
    plek = doel;
    gewijzigd = false;
    bewaarKnop.classList.remove('teken-actie--bewaard');
    void bewaarKnop.offsetWidth; // animatie opnieuw starten
    bewaarKnop.classList.add('teken-actie--bewaard');
  }

  // De 10 plekjes. Gewoon: tik een tekening om hem te openen. Vol (vervangen = true): tik
  // de tekening die weg mag, dan komt de nieuwe daar. Weggooien met het prullenbakje,
  // twee keer tikken (de eerste keer gaat hij wiebelen).
  let lijst: HTMLElement | null = null;
  function sluitLijst(): void {
    lijst?.remove();
    lijst = null;
  }
  function toonLijst(vervangen: boolean): void {
    sluitLijst();
    const venster = document.createElement('div');
    venster.className = 'teken-lijst';
    venster.addEventListener('click', (e) => {
      if (e.target === venster) sluitLijst();
    });
    const doos = document.createElement('div');
    doos.className = 'teken-lijst__doos';
    venster.appendChild(doos);

    const kop = document.createElement('div');
    kop.className = 'teken-lijst__kop';
    kop.innerHTML = vervangen
      ? '<img src="assets/icons/bewaar.svg" alt=""><span>Alles is vol. Welke mag weg?</span>'
      : '<img src="assets/icons/tekeningen.svg" alt=""><span>Mijn tekeningen</span>';
    const sluit = document.createElement('button');
    sluit.type = 'button';
    sluit.className = 'teken-lijst__sluit';
    sluit.textContent = '✕';
    sluit.setAttribute('aria-label', 'sluiten');
    sluit.addEventListener('click', sluitLijst);
    kop.appendChild(sluit);
    doos.appendChild(kop);

    const rooster = document.createElement('div');
    rooster.className = 'teken-lijst__rooster';
    doos.appendChild(rooster);

    const tekeningen = haalTekeningen();
    for (let i = 0; i < AANTAL_PLEKKEN; i++) {
      const t = tekeningen[i];
      const vak = document.createElement('div');
      vak.className = 'teken-plek';
      if (!t) {
        vak.classList.add('teken-plek--leeg');
        rooster.appendChild(vak);
        continue;
      }
      if (i === plek) vak.classList.add('teken-plek--huidig');
      const open = document.createElement('button');
      open.type = 'button';
      open.className = 'teken-plek__open';
      open.setAttribute('aria-label', vervangen ? 'vervang deze tekening' : 'open deze tekening');
      open.appendChild(miniatuur(t.lijnen, t.verhouding));
      open.addEventListener('click', () => {
        if (vervangen) {
          bewaarIn(i);
        } else {
          lijnen.length = 0;
          lijnen.push(...t.lijnen);
          plek = i;
          gewijzigd = false;
          tekenAlles();
        }
        sluitLijst();
      });
      vak.appendChild(open);
      if (!vervangen) {
        const weg = document.createElement('button');
        weg.type = 'button';
        weg.className = 'teken-plek__weg';
        weg.innerHTML = '<img src="assets/icons/prullenbak.svg" alt="">';
        weg.setAttribute('aria-label', 'weggooien');
        weg.addEventListener('click', () => {
          if (!vak.classList.contains('teken-plek--weg')) {
            vak.classList.add('teken-plek--weg');
            return;
          }
          wisTekening(i);
          if (plek === i) plek = null;
          toonLijst(false);
        });
        vak.appendChild(weg);
      }
      rooster.appendChild(vak);
    }
    // Aan de body, zodat het venster ook boven de terugknop en de muntenteller ligt.
    document.body.appendChild(venster);
    lijst = venster;
  }

  function miniatuur(lijnenVan: Lijn[], verhouding: number): HTMLCanvasElement {
    const c = document.createElement('canvas');
    const b = 160;
    const h = Math.round(b / Math.min(3, Math.max(0.33, verhouding)));
    c.width = b * 2;
    c.height = h * 2;
    const g = c.getContext('2d')!;
    g.setTransform(2, 0, 0, 2, 0, 0);
    for (const l of lijnenVan) tekenLijn(l, g, b, h);
    g.globalCompositeOperation = 'source-over';
    return c;
  }
  kiesKleur(kleur);

  function maat(): { b: number; h: number } {
    return { b: canvas.clientWidth, h: canvas.clientHeight };
  }

  function tekenLijn(l: Lijn, ctx = hoofdCtx, b = maat().b, h = maat().h): void {
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
    gewijzigd = true;
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
      sluitLijst();
      el.remove();
      terug.remove();
      topRechts?.element.remove();
      topRechts?.vernietig();
      topRechts = null;
    },
  };
}
