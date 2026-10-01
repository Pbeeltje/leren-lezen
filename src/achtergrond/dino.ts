import type { Decor } from './achtergrond.ts';
import { STEGO, TREX } from './dino-tekening.ts';
import { el, kortAan, plaatje, svgUitTekst, zetOpPad } from './hulp.ts';

// Groene wei met heuvels, bomen en een vulkaan; een T-rex links en een triceratops rechts
// die bij een goed antwoord opspringen. Aan het eind van een hele sessie barst de vulkaan uit.
// Een stegosaurus loopt langzaam heen en weer over de voorste heuvel (achter de grote dino's
// langs), blijft soms even staan om te snuffelen en draait aan het eind van zijn rondje om.
// Loopt hij langs de T-rex, dan kijkt die verrast omlaag en brult vriendelijk (één keer per
// keer dat hij langskomt); de stegosaurus kwispelt terug. Bij prefers-reduced-motion staat
// hij stil.
const HEUVELS = `
<svg viewBox="0 0 1000 300" preserveAspectRatio="none">
  <path d="M0 150 C160 60 320 70 480 130 C640 190 820 80 1000 120 L1000 300 L0 300 Z" fill="#7ccf5d"/>
  <path d="M0 210 C200 150 380 170 560 210 C740 250 880 180 1000 200 L1000 300 L0 300 Z" fill="#5db847"/>
  <path d="M0 260 C250 235 500 250 750 262 C860 267 940 255 1000 250 L1000 300 L0 300 Z" fill="#4aa63a"/>
</svg>`;

/** Hoe diep de stegosaurus in de voorste heuvel staat (deel van de heuvelhoogte daar). */
const STEG_ZAK = 0.4;
/** Hoe lang de T-rex reageert (ms); moet passen bij tr-verrast in de CSS. */
const VERRAST_MS = 2800;

export function maakDinoDecor(): Decor {
  const root = el('div', 'decor decor-dino');
  plaatje('assets/achtergrond/zon.svg', 'dino-zon', root);
  plaatje('assets/achtergrond/wolk.svg', 'drijf-wolk drijf-wolk--1', root);
  plaatje('assets/achtergrond/wolk.svg', 'drijf-wolk drijf-wolk--2', root);
  // Vóór de heuvels in de DOM, zodat de achterste heuvel over de voet van de vulkaan valt.
  const vulkaan = el('div', 'vulkaan', root);
  const rook = el('div', 'vulkaan__rook', vulkaan);
  for (let i = 0; i < 3; i++) el('div', 'vulkaan__pluim', rook).style.animationDelay = `${i * 1.3}s`;
  el('div', 'vulkaan__gloed', vulkaan);
  plaatje('assets/achtergrond/vulkaan.svg', 'vulkaan__berg', vulkaan);
  const heuvels = svgUitTekst(HEUVELS, 'dino-heuvels', root);
  const [achter, midden, voor] = [...heuvels.querySelectorAll('path')];

  // [plaatje, klasse, op welke heuvel]: boomvarens (zelf getekend, zoals in de tijd van de
  // dinosaurussen); de kleine aan de rand staan verder weg, twee zijn gespiegeld.
  const bomen: [HTMLImageElement, SVGPathElement][] = [
    [plaatje('assets/achtergrond/boomvaren.svg', 'dino-boom dino-boom--1', root), achter],
    [plaatje('assets/achtergrond/boomvaren.svg', 'dino-boom dino-boom--2', root), midden],
    [plaatje('assets/achtergrond/boomvaren.svg', 'dino-boom dino-boom--3', root), midden],
    [plaatje('assets/achtergrond/boomvaren.svg', 'dino-boom dino-boom--4', root), achter],
  ];

  // De stegosaurus staat vóór de T-rex en triceratops in de DOM: hij loopt achter ze langs.
  // Buitenste div verschuift (transform), de binnenste spiegelt als hij naar rechts loopt.
  const steg = el('div', 'dino-steg', root);
  const stegDraai = el('div', 'dino-steg__draai', steg);
  svgUitTekst(STEGO, 'dino-steg__lijf', stegDraai);

  const trex = el('div', 'dino dino--trex', root);
  svgUitTekst(TREX, 'dino__lijf', trex);
  const tri = el('div', 'dino dino--tri', root);
  plaatje('assets/achtergrond/triceratops.svg', 'dino__lijf', tri);

  const stil = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let levend = true;
  let frame = 0;
  const timers = new Set<number>();
  const later = (f: () => void, ms: number) => {
    const t = window.setTimeout(() => {
      timers.delete(t);
      f();
    }, ms);
    timers.add(t);
  };

  // Bovenrand van de voorste heuvel in schermpixels: [x, hoogte boven de onderkant].
  let grond: [number, number][] = [];
  const grondOp = (x: number): number => {
    if (!grond.length) return 0;
    for (let i = 1; i < grond.length; i++) {
      const [x1, h1] = grond[i];
      if (x1 >= x) {
        const [x0, h0] = grond[i - 1];
        return x1 === x0 ? h1 : h0 + ((h1 - h0) * (x - x0)) / (x1 - x0);
      }
    }
    return grond[grond.length - 1][1];
  };
  const meetGrond = () => {
    const matrix = voor.getScreenCTM();
    if (!matrix) return;
    const onder = root.getBoundingClientRect().bottom;
    const lengte = voor.getTotalLength();
    grond = [];
    // Het eerste stuk van het pad is de bovenrand (van x 0 naar 1000).
    for (let l = 0; l <= lengte; l += 4) {
      const p = voor.getPointAtLength(l);
      grond.push([p.x * matrix.a + matrix.e, onder - (p.y * matrix.d + matrix.f)]);
      if (p.x >= 1000) break;
    }
  };

  // ---- Lopen ----
  let breedte = 0; // schermbreedte van de decorlaag
  let stegB = 0; // breedte van de stegosaurus
  let x = 0; // linkerkant van de stegosaurus
  let richting: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
  let doelLinks = 0; // hier draait hij om als hij naar links loopt
  let doelRechts = 0; // en hier als hij naar rechts loopt
  let toestand: 'loopt' | 'staat' = 'loopt';
  let rustTot = 0; // tot wanneer hij stilstaat (performance.now)
  let omdraaienNaRust = false;
  let volgendeSnuffel = 0; // wanneer hij onderweg weer even stopt
  let gereageerd = false; // de T-rex heeft op deze passage al gereageerd
  let laatsteReactie = -Infinity;
  let vorige = 0;
  let geplaatst = false;

  const kiesDoelen = () => {
    const triVak = tri.getBoundingClientRect();
    // Links: helemaal langs de T-rex (dan reageert hij); rechts: ergens vóór de triceratops.
    doelLinks = breedte * (0.005 + Math.random() * 0.03);
    const maxRechts = Math.min(breedte * 0.98, triVak.left + triVak.width * 0.35) - stegB;
    doelRechts = Math.max(doelLinks + stegB, Math.min(maxRechts, breedte * (0.5 + Math.random() * 0.22)));
  };

  const zetSteg = () => {
    const h = grondOp(x + stegB / 2);
    steg.style.transform = `translate(${x.toFixed(1)}px, ${(-h * (1 - STEG_ZAK)).toFixed(1)}px)`;
    steg.classList.toggle('dino-steg--rechts', richting > 0);
  };

  const plaats = () => {
    zetOpPad(vulkaan, achter, 18, true);
    for (const [boom, pad] of bomen) zetOpPad(boom, pad);
    breedte = root.clientWidth;
    stegB = steg.offsetWidth;
    meetGrond();
    if (!geplaatst) {
      x = breedte * (stil ? 0.3 : 0.2 + Math.random() * 0.3);
      geplaatst = true;
      steg.classList.add('geplaatst');
    }
    kiesDoelen();
    x = Math.min(Math.max(x, doelLinks), Math.max(doelLinks, breedte - stegB));
    zetSteg();
  };

  const stopEven = (nu: number, ms: number, omdraaien: boolean) => {
    toestand = 'staat';
    rustTot = nu + ms;
    omdraaienNaRust = omdraaien;
    steg.classList.remove('loopt');
    steg.classList.add('snuffelt');
  };

  const loopVerder = (nu: number) => {
    toestand = 'loopt';
    volgendeSnuffel = nu + 6000 + Math.random() * 9000;
    steg.classList.remove('snuffelt');
    steg.classList.add('loopt');
  };

  // De T-rex kijkt omlaag naar de stegosaurus: een sprongetje met "!", dan een vriendelijke brul.
  const reageer = () => {
    kortAan(trex, 'verrast', VERRAST_MS);
    kortAan(steg, 'kwispelt', 2400);
    roep('!', 'dino-roep dino-roep--uitroep', 0, 900);
    roep('roaar!', 'dino-roep', 1100, 1400);
  };
  const roep = (tekst: string, klasse: string, na: number, duur: number) =>
    later(() => {
      const wolkje = el('div', klasse, trex);
      wolkje.textContent = tekst;
      later(() => wolkje.remove(), duur);
    }, na);

  const kijkNaarTrex = (nu: number) => {
    const vak = trex.getBoundingClientRect();
    const midden = x + stegB / 2;
    // Vlak onder de kop (rechterkant van de T-rex) ziet hij de stegosaurus het best.
    const dichtbij = midden > vak.left + vak.width * 0.55 && midden < vak.right + vak.width * 0.1;
    const ver = midden < vak.left - stegB || midden > vak.right + stegB;
    if (ver) gereageerd = false;
    if (dichtbij && !gereageerd && nu - laatsteReactie > 8000) {
      gereageerd = true;
      laatsteReactie = nu;
      reageer();
    }
  };

  const stap = (nu: number) => {
    if (!levend) return;
    if (!geplaatst) {
      frame = requestAnimationFrame(stap);
      return;
    }
    const dt = Math.min(100, nu - (vorige || nu));
    vorige = nu;
    if (toestand === 'staat') {
      if (nu >= rustTot) {
        if (omdraaienNaRust) richting = richting > 0 ? -1 : 1;
        if (omdraaienNaRust) kiesDoelen();
        loopVerder(nu);
      }
    } else {
      // Langzaam: ongeveer 2% van de schermbreedte per seconde.
      const snelheid = Math.min(30, Math.max(14, breedte * 0.02));
      x += (richting * snelheid * dt) / 1000;
      if (richting < 0 && x <= doelLinks) {
        x = doelLinks;
        stopEven(nu, 1500 + Math.random() * 1800, true);
      } else if (richting > 0 && x >= doelRechts) {
        x = doelRechts;
        stopEven(nu, 1500 + Math.random() * 1800, true);
      } else if (nu >= volgendeSnuffel) {
        stopEven(nu, 2500 + Math.random() * 2000, false);
      }
      zetSteg();
      kijkNaarTrex(nu);
    }
    frame = requestAnimationFrame(stap);
  };
  if (!stil) {
    loopVerder(performance.now());
    frame = requestAnimationFrame(stap);
  }

  const feest = () => {
    kortAan(vulkaan, 'barst-uit', 3000);
    for (let i = 0; i < 26; i++) {
      const brok = el('div', 'vulkaan__lava', vulkaan);
      const hoek = -Math.PI / 2 + (Math.random() - 0.5) * 1.6;
      const kracht = 90 + Math.random() * 170;
      brok.style.setProperty('--dx', `${Math.cos(hoek) * kracht}px`);
      brok.style.setProperty('--dy', `${Math.sin(hoek) * kracht}px`);
      brok.style.animationDelay = `${(Math.random() * 0.6).toFixed(2)}s`;
      const maat = 8 + Math.random() * 14;
      brok.style.width = brok.style.height = `${maat}px`;
      later(() => brok.remove(), 2600);
    }
    juich();
  };

  const juich = () => {
    for (const d of [trex, tri]) {
      kortAan(d, 'juicht', 1200);
      const hoera = el('div', 'dino__hoera', d);
      hoera.textContent = ['★', '♥', '✦'][Math.floor(Math.random() * 3)];
      later(() => hoera.remove(), 1200);
    }
    kortAan(steg, 'kwispelt', 1200);
  };

  const vernietig = () => {
    levend = false;
    cancelAnimationFrame(frame);
    for (const t of timers) window.clearTimeout(t);
    timers.clear();
  };
  return { element: root, juich, feest, plaats, vernietig };
}
