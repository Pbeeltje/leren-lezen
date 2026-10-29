import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import {
  AANTAL_PLEKKEN,
  bewaarTekening,
  eersteLegePlek,
  haalTekeningen,
  wisTekening,
  type Lijn,
} from '../../engine/tekeningenStore.ts';
import { haalActiefProfielId } from '../../engine/profielStore.ts';

// Vrij tekenen met de vinger (onder Spelletjes). Zo groot mogelijk blad en alleen
// tekenknoppen plus terug (in de balk): geen profielmenu of munten, want daar tikten de
// kinderen per ongeluk op. Grote kleurvlakken, gum, dunner/dikker, twee lagen,
// "terug" (laatste lijn weg) en een nieuw blad. Het hartje bewaart de tekening in een van
// de 10 plekjes van dit profiel (engine/tekeningenStore.ts); het lijstje opent ze weer.
// De lijnen worden bewaard als punten, zodat terug en draaien/vergroten van het scherm de
// tekening opnieuw kunnen tekenen.
//
// Twee lagen, elk een eigen canvas: je begint op de bovenste. Op de onderste kun je
// inkleuren en gummen zonder de lijnen erboven te raken; de bovenste laag is dan even wat
// doorzichtig, zodat je ziet dat je eronder zit.

const KLEUREN = ['#1b1b2f', '#e53935', '#fb8c00', '#fdd835', '#43a047', '#1e88e5', '#8e24aa', '#ec407a', '#8d6e63'];
// Elke stap 50% dikker (of terug): één maat dunner dan gewoon en drie dikker.
const DIKTES = [4, 6, 9, 13.5, 20.25];
const GEWONE_DIKTE = 1;
const GUM = 'gum';

// Twee blaadjes over elkaar; het gekozen blaadje is gekleurd.
function laagIcoon(onder: boolean): string {
  const vol = 'fill="#fdd835" stroke="#1b1b2f"';
  const leeg = 'fill="#fff" stroke="#9aa5b8"';
  return (
    '<svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true" stroke-width="2.4" stroke-linejoin="round">' +
    `<rect x="10" y="3" width="19" height="19" rx="3" ${onder ? vol : leeg}/>` +
    `<rect x="3" y="10" width="19" height="19" rx="3" ${onder ? leeg : vol}${onder ? ' fill-opacity="0.75"' : ''}/>` +
    '</svg>'
  );
}

// Het blad waar je mee bezig was blijft (per profiel) staan als je het tekenen verlaat en
// terugkomt, zolang de app open is. Alleen in het geheugen: na het sluiten van de app een
// nieuw blad. Bewaren gaat bij het verlaten; de lijnen zelf zijn gewoon dezelfde array.
interface Blad {
  lijnen: Lijn[];
  plek: number | null;
  gewijzigd: boolean;
  kleur: string;
  dikte: number;
  onder: boolean;
}
const openBladen = new Map<string, Blad>();

export function TekenScreen(manager: ScreenManager): Screen {
  const el = document.createElement('div');
  el.className = 'scherm teken-scherm';

  const blad = document.createElement('div');
  blad.className = 'teken-blad';
  const canvasOnder = document.createElement('canvas');
  canvasOnder.className = 'teken-onderlaag';
  const canvas = document.createElement('canvas');
  canvas.className = 'teken-canvas';
  const maatVoorbeeld = document.createElement('div');
  maatVoorbeeld.className = 'teken-maat';
  blad.append(canvasOnder, canvas, maatVoorbeeld);
  el.appendChild(blad);

  // Twee groepjes: de knoppen voor het blad (terug, ongedaan, nieuw, bewaren, lagen) en
  // alles om mee te tekenen (kleuren, gum, dikte). Op een breed scherm elk een rij; op een
  // telefoon vallen ze samen in een raster (zie screens.css).
  const balk = document.createElement('div');
  balk.className = 'teken-balk';
  const groepBlad = document.createElement('div');
  groepBlad.className = 'teken-groep';
  const groepPen = document.createElement('div');
  groepPen.className = 'teken-groep';
  balk.append(groepBlad, groepPen);
  el.appendChild(balk);

  // Terug als eerste knop in de balk, met wat ruimte erna.
  const terug = document.createElement('button');
  terug.type = 'button';
  terug.className = 'teken-actie teken-terug';
  terug.innerHTML = '<img src="assets/icons/terug.svg" alt="">';
  terug.setAttribute('aria-label', 'Terug');
  terug.addEventListener('click', () => manager.pop());
  groepBlad.appendChild(terug);

  const profiel = haalActiefProfielId() ?? 'gast';
  const vorig = openBladen.get(profiel);
  const lijnen: Lijn[] = vorig?.lijnen ?? [];
  let kleur = vorig?.kleur ?? KLEUREN[1];
  let dikteStap = GEWONE_DIKTE;
  if (vorig) {
    // Dichtstbijzijnde maat (ook voor een blad van voor de nieuwe maten).
    dikteStap = DIKTES.reduce((best, d, i) => (Math.abs(d - vorig.dikte) < Math.abs(DIKTES[best] - vorig.dikte) ? i : best), 0);
  }
  let onder = vorig?.onder ?? false;
  let huidige: Lijn | null = null;
  const ctxBoven = canvas.getContext('2d')!;
  const ctxOnder = canvasOnder.getContext('2d')!;

  function knop(groep: HTMLElement, klasse: string, inhoud: string, label: string, actie: () => void): HTMLButtonElement {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = klasse;
    b.innerHTML = inhoud;
    b.setAttribute('aria-label', label);
    b.addEventListener('click', actie);
    groep.appendChild(b);
    return b;
  }

  knop(groepBlad, 'teken-actie', '↶', 'terug', () => {
    lijnen.pop();
    gewijzigd = true;
    tekenAlles();
  });
  knop(groepBlad, 'teken-actie', '<img src="assets/icons/nieuw-blad.svg" alt="">', 'nieuw blad', () => {
    // Niet per ongeluk een tekening kwijtraken: eerst vragen, tenzij het blad leeg is of
    // alles al bewaard is. Met plaatjes en een groot vinkje/kruis, zodat je niet hoeft te lezen.
    if (lijnen.length > 0 && gewijzigd) vraagNieuwBlad();
    else nieuwBlad();
  });
  const bewaarKnop = knop(groepBlad, 'teken-actie', '<img src="assets/icons/bewaar.svg" alt="">', 'bewaar', bewaar);
  knop(groepBlad, 'teken-actie', '<img src="assets/icons/tekeningen.svg" alt="">', 'mijn tekeningen', () => toonLijst(false));
  const laagKnop = knop(groepBlad, 'teken-actie teken-laag', '', 'laag', () => kiesLaag(!onder));

  function kiesLaag(o: boolean): void {
    onder = o;
    laagKnop.innerHTML = laagIcoon(o);
    laagKnop.setAttribute('aria-label', o ? 'onderste laag' : 'bovenste laag');
    laagKnop.classList.toggle('teken-knop--actief', o);
    blad.classList.toggle('teken-blad--onder', o);
  }

  const kleurKnoppen: HTMLButtonElement[] = [];
  function kiesKleur(k: string): void {
    kleur = k;
    for (const b of kleurKnoppen) b.classList.toggle('teken-knop--actief', b.dataset.kleur === k);
  }
  for (const k of KLEUREN) {
    const b = knop(groepPen, 'teken-kleur', '', 'kleur', () => kiesKleur(k));
    b.style.background = k;
    b.dataset.kleur = k;
    kleurKnoppen.push(b);
  }
  const gumKnop = knop(groepPen, 'teken-kleur teken-gum', '<img src="assets/icons/gum.svg" alt="">', 'gum', () => kiesKleur(GUM));
  gumKnop.dataset.kleur = GUM;
  kleurKnoppen.push(gumKnop);

  // Dunner en dikker: dezelfde twee knoppen als vroeger (kleine en grote stip), maar nu een
  // stap terug of verder. Bij elke tik zie je even hoe dik de pen nu is, midden op het blad.
  const dunner = knop(groepPen, 'teken-dikte', '<span style="width:8px;height:8px"></span>', 'dunner', () => zetDikte(dikteStap - 1));
  const dikker = knop(groepPen, 'teken-dikte', '<span style="width:20px;height:20px"></span>', 'dikker', () => zetDikte(dikteStap + 1));
  function toonDikteKnoppen(): void {
    dunner.disabled = dikteStap === 0;
    dikker.disabled = dikteStap === DIKTES.length - 1;
  }
  function zetDikte(stap: number): void {
    dikteStap = Math.min(DIKTES.length - 1, Math.max(0, stap));
    toonDikteKnoppen();
    const { b, h } = maat();
    const px = lijnDikte(kleur === GUM ? GUM : '', DIKTES[dikteStap], b, h);
    maatVoorbeeld.style.width = maatVoorbeeld.style.height = `${px}px`;
    maatVoorbeeld.style.background = kleur === GUM ? '#fff' : kleur;
    maatVoorbeeld.classList.remove('teken-maat--zichtbaar');
    void maatVoorbeeld.offsetWidth; // animatie opnieuw starten
    maatVoorbeeld.classList.add('teken-maat--zichtbaar');
  }
  toonDikteKnoppen();

  // In welk plekje deze tekening staat (null: nog niet bewaard), en of er sinds het
  // bewaren (of openen) nog iets is getekend.
  let plek: number | null = vorig?.plek ?? null;
  let gewijzigd = vorig?.gewijzigd ?? false;

  function nieuwBlad(): void {
    lijnen.length = 0;
    plek = null;
    gewijzigd = false;
    kiesLaag(false);
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
          kiesLaag(false);
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
    // Elke laag apart (de gum van de bovenste laag mag de onderste niet raken), dan op elkaar.
    const lagen = [true, false].map((o) => {
      const laag = document.createElement('canvas');
      laag.width = c.width;
      laag.height = c.height;
      const g = laag.getContext('2d')!;
      g.setTransform(2, 0, 0, 2, 0, 0);
      for (const l of lijnenVan) if (!!l.onder === o) tekenLijn(l, g, b, h);
      return laag;
    });
    const g = c.getContext('2d')!;
    for (const laag of lagen) g.drawImage(laag, 0, 0);
    return c;
  }
  kiesKleur(kleur);
  kiesLaag(onder);

  function maat(): { b: number; h: number } {
    return { b: canvas.clientWidth, h: canvas.clientHeight };
  }

  function lijnDikte(k: string, dikte: number, b: number, h: number): number {
    const schaal = Math.min(b, h) / 400; // dikte meeschalen met het blad
    return (k === GUM ? dikte * 2 : dikte) * Math.max(0.8, schaal);
  }

  function tekenLijn(l: Lijn, ctx: CanvasRenderingContext2D, b = maat().b, h = maat().h): void {
    ctx.globalCompositeOperation = l.kleur === GUM ? 'destination-out' : 'source-over';
    ctx.strokeStyle = l.kleur === GUM ? '#000' : l.kleur;
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth = lijnDikte(l.kleur, l.dikte, b, h);
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

  function tekenLaag(o: boolean): void {
    const ctx = o ? ctxOnder : ctxBoven;
    const { b, h } = maat();
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, b, h);
    for (const l of lijnen) if (!!l.onder === o) tekenLijn(l, ctx);
    ctx.globalCompositeOperation = 'source-over';
  }

  function tekenAlles(): void {
    tekenLaag(true);
    tekenLaag(false);
  }

  function pasGrootteAan(): void {
    const r = window.devicePixelRatio || 1;
    const { b, h } = maat();
    for (const [c, ctx] of [[canvas, ctxBoven], [canvasOnder, ctxOnder]] as const) {
      c.width = Math.round(b * r);
      c.height = Math.round(h * r);
      ctx.setTransform(r, 0, 0, r, 0, 0);
    }
    tekenAlles();
  }

  function punt(e: PointerEvent): [number, number] {
    const rect = canvas.getBoundingClientRect();
    return [(e.clientX - rect.left) / rect.width, (e.clientY - rect.top) / rect.height];
  }

  canvas.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    huidige = { kleur, dikte: DIKTES[dikteStap], punten: [punt(e)], ...(onder ? { onder: true } : {}) };
    lijnen.push(huidige);
    gewijzigd = true;
    tekenLijn(huidige, onder ? ctxOnder : ctxBoven);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!huidige) return;
    huidige.punten.push(punt(e));
    tekenLaag(!!huidige.onder);
  });
  const stop = (): void => {
    huidige = null;
  };
  canvas.addEventListener('pointerup', stop);
  canvas.addEventListener('pointercancel', stop);

  const opGrootte = new ResizeObserver(pasGrootteAan);

  return {
    kindslot: true,
    mount(root) {
      root.appendChild(el);
      opGrootte.observe(canvas);
    },
    unmount() {
      huidige = null;
      openBladen.set(profiel, { lijnen, plek, gewijzigd, kleur, dikte: DIKTES[dikteStap], onder });
      opGrootte.disconnect();
      sluitLijst();
      el.remove();
    },
  };
}
