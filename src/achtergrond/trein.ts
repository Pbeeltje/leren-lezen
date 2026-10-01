import type { Decor } from './achtergrond.ts';
import { el, kortAan, plaatje, svgUitTekst, zetOpPad } from './hulp.ts';

// Treinreis: groene heuvels met een spoorlijn langs de onderkant, een stenen brug over een
// riviertje, links een station (loopt een stukje buiten beeld) en rechts een sein. Af en toe
// rijdt er een stoomtrein voorbij, met rookpluimpjes uit de schoorsteen; nooit twee treinen
// tegelijk. Er zijn twee soorten: een reizigerstrein (postwagon, personenwagons en soms een
// container) en een langere goederentrein (stenen, gastanks en containers met een plaatje
// van wat erin zit). Een reizigerstrein stopt vaak bij het station; soms wacht een trein
// voor het rode sein tot het groen wordt. Bij een goed antwoord toetert de trein: een grote stoomwolk en "tuut!".
// Is er geen trein, dan piept er even een locomotief uit het station. Aan het eind van een
// sessie rijdt er een lange trein met een open wagon per dier, met sterretjes.
// Bomen en dieren zijn Fluent Emoji; trein, station, sein en brug zijn zelf getekend.

// De voorste strook (y = 212) ligt precies op de hoogte van het spoor (10vh van 34vh).
const LANDSCHAP = `
<svg viewBox="0 0 1000 300" preserveAspectRatio="none">
  <path d="M0 120 C150 80 300 95 450 118 C600 140 780 92 1000 108 L1000 300 L0 300 Z" fill="#a8d977"/>
  <path d="M0 175 C200 150 380 160 560 172 C700 182 820 160 1000 166 L1000 300 L0 300 Z" fill="#86c95e"/>
  <path d="M0 212 H1000 V300 H0 Z" fill="#6cb84a"/>
  <path d="M772 170 C760 182 700 188 688 200 C676 212 664 222 650 240 C636 260 620 280 606 300 L806 300 C786 276 764 252 748 230 C736 214 732 204 744 194 C760 184 784 178 790 170 Z" fill="#4fb3e8"/>
  <g fill="none" stroke="#bfe9fb" stroke-width="3" stroke-linecap="round" vector-effect="non-scaling-stroke" class="trein-rivier__glans">
    <path d="M690 236 C700 232 712 240 724 234" vector-effect="non-scaling-stroke"/>
    <path d="M660 276 C676 270 690 280 706 272" vector-effect="non-scaling-stroke"/>
    <path d="M728 262 C740 258 752 266 764 260" vector-effect="non-scaling-stroke"/>
  </g>
</svg>`;

// Stenen boogbrug; rekt mee met de rivier (die ook uitgerekt wordt).
const BRUG = `
<svg viewBox="0 0 200 60" preserveAspectRatio="none" aria-hidden="true">
  <path d="M0 0 H200 V60 H164 C164 16 36 16 36 60 H0 Z" fill="#d6a06a" stroke="#8a5a3a" stroke-width="3" vector-effect="non-scaling-stroke"/>
  <path d="M0 14 H200 M0 30 H44 M156 30 H200 M0 46 H36 M164 46 H200" stroke="#a87448" stroke-width="2" vector-effect="non-scaling-stroke"/>
  <path d="M30 0 V14 M80 0 V14 M130 0 V14 M180 0 V14 M18 14 V30 M170 14 V30 M14 30 V46 M184 30 V46" stroke="#a87448" stroke-width="2" vector-effect="non-scaling-stroke"/>
</svg>`;

// Breed station met perron, een overkapping rechts en een bankje; het loopt links een stukje
// buiten beeld.
const STATION = `
<svg viewBox="0 0 340 150" aria-hidden="true">
  <rect x="0" y="136" width="340" height="14" rx="3" fill="#d3ccbf" stroke="#8d8576" stroke-width="3"/>
  <path d="M0 140 H340" stroke="#f2e6a0" stroke-width="2" stroke-dasharray="10 6"/>
  <rect x="30" y="58" width="200" height="80" fill="#f6dfb0" stroke="#8a5a3a" stroke-width="4"/>
  <path d="M16 64 L130 14 L244 64 Z" fill="#d9483b" stroke="#7d2219" stroke-width="4" stroke-linejoin="round"/>
  <circle cx="130" cy="45" r="11" fill="#fff" stroke="#3b3b4f" stroke-width="3"/>
  <path d="M130 45 V38 M130 45 H136" stroke="#3b3b4f" stroke-width="2.5" stroke-linecap="round"/>
  <rect x="92" y="68" width="76" height="16" rx="4" fill="#2f7dd1" stroke="#1b4d86" stroke-width="2"/>
  <text x="130" y="80.5" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="12" fill="#fff">STATION</text>
  <rect x="118" y="94" width="24" height="44" rx="3" fill="#7a4f2e" stroke="#4f3a29" stroke-width="3"/>
  <circle cx="136" cy="117" r="2" fill="#ffd23f"/>
  <g fill="#cdeeff" stroke="#8a5a3a" stroke-width="3">
    <rect x="44" y="94" width="28" height="26" rx="3"/><rect x="82" y="94" width="28" height="26" rx="3"/>
    <rect x="150" y="94" width="28" height="26" rx="3"/><rect x="188" y="94" width="28" height="26" rx="3"/>
  </g>
  <path d="M58 94 V120 M44 107 H72 M96 94 V120 M82 107 H110 M164 94 V120 M150 107 H178 M202 94 V120 M188 107 H216" stroke="#8a5a3a" stroke-width="2"/>
  <!-- overkapping met palen -->
  <path d="M236 70 H334 L328 80 H236 Z" fill="#2f7dd1" stroke="#1b4d86" stroke-width="3" stroke-linejoin="round"/>
  <path d="M264 80 V136 M318 80 V136" stroke="#6a7080" stroke-width="4"/>
  <!-- bankje en een klok aan een paal -->
  <rect x="274" y="116" width="34" height="6" rx="2" fill="#a8743f" stroke="#6e4a22" stroke-width="2"/>
  <path d="M278 122 V136 M304 122 V136" stroke="#6e4a22" stroke-width="3"/>
  <circle cx="291" cy="94" r="7" fill="#fff" stroke="#3b3b4f" stroke-width="2.5"/>
  <path d="M291 94 V89.5 M291 94 H294" stroke="#3b3b4f" stroke-width="1.8" stroke-linecap="round"/>
  <g fill="#ff7ac0"><circle cx="40" cy="130" r="4"/><circle cx="48" cy="128" r="4"/><circle cx="222" cy="130" r="4"/></g>
  <g fill="#ffd23f"><circle cx="52" cy="132" r="3.5"/><circle cx="214" cy="128" r="4"/><circle cx="228" cy="131" r="3"/></g>
</svg>`;

// Sein: rood als het spoor vrij is, groen als er een trein komt (of even bij een goed antwoord).
const SEIN = `
<svg viewBox="0 0 40 140" aria-hidden="true">
  <rect x="17" y="44" width="6" height="90" fill="#6a7080" stroke="#3b3f4c" stroke-width="2"/>
  <rect x="9" y="130" width="22" height="10" rx="2" fill="#6a7080" stroke="#3b3f4c" stroke-width="2"/>
  <rect x="5" y="2" width="30" height="52" rx="10" fill="#2b2f3a" stroke="#151821" stroke-width="2"/>
  <circle class="sein__rood" cx="20" cy="16" r="9"/>
  <circle class="sein__groen" cx="20" cy="40" r="9"/>
</svg>`;

// Wiel met spaken (in een eigen groep, zodat het kan draaien).
const wiel = (cx: number, cy: number, r: number) => `
  <g class="trein-wiel">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="#2b2f3a"/>
    <circle cx="${cx}" cy="${cy}" r="${r - 3.5}" fill="#d9483b"/>
    <path d="M${cx - r + 3.5} ${cy} H${cx + r - 3.5} M${cx} ${cy - r + 3.5} V${cy + r - 3.5}" stroke="#2b2f3a" stroke-width="2.5"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.28}" fill="#ffd23f" stroke="#2b2f3a" stroke-width="1.5"/>
  </g>`;

// Stoomlocomotief, rijdt naar rechts (cabine links, schoorsteen rechts).
const LOC = `
<svg viewBox="0 0 160 104" aria-hidden="true">
  <rect x="2" y="70" width="8" height="6" rx="2" fill="#2b2f3a"/>
  <rect x="8" y="68" width="144" height="12" rx="3" fill="#3b3f4c"/>
  <path d="M146 66 L160 84 H140 Z" fill="#ffd23f" stroke="#2b2f3a" stroke-width="2.5" stroke-linejoin="round"/>
  <rect x="14" y="24" width="48" height="48" rx="4" fill="#2f7dd1" stroke="#1b4d86" stroke-width="3"/>
  <path d="M8 26 C8 16 68 16 68 26 Z" fill="#d9483b" stroke="#7d2219" stroke-width="3" stroke-linejoin="round"/>
  <rect x="24" y="32" width="26" height="18" rx="3" fill="#cdeeff" stroke="#1b4d86" stroke-width="2.5"/>
  <rect x="58" y="36" width="84" height="36" rx="12" fill="#d9483b" stroke="#7d2219" stroke-width="3"/>
  <path d="M82 37 V71 M110 37 V71" stroke="#ffd23f" stroke-width="5"/>
  <rect x="134" y="38" width="14" height="32" rx="6" fill="#3b3f4c" stroke="#2b2f3a" stroke-width="2"/>
  <circle cx="148" cy="46" r="4.5" fill="#fff3a6" stroke="#2b2f3a" stroke-width="2"/>
  <path d="M88 37 C88 26 104 26 104 37 Z" fill="#ffd23f" stroke="#c77d00" stroke-width="2.5"/>
  <path d="M119 37 L121 16 L115 8 H135 L129 16 L131 37 Z" fill="#3b3f4c" stroke="#2b2f3a" stroke-width="2.5" stroke-linejoin="round"/>
  <rect x="113" y="5" width="24" height="6" rx="2" fill="#ffd23f" stroke="#c77d00" stroke-width="2"/>
  ${wiel(34, 86, 16)}
  ${wiel(72, 86, 16)}
  ${wiel(108, 90, 12)}
  ${wiel(134, 92, 10)}
  <path d="M34 86 H72" stroke="#c9ccd6" stroke-width="4" stroke-linecap="round"/>
</svg>`;

// Personenwagon met drie raampjes.
const wagon = (kleur: string, donker: string) => `
<svg viewBox="0 0 120 104" aria-hidden="true">
  <rect x="0" y="70" width="8" height="6" rx="2" fill="#2b2f3a"/>
  <rect x="112" y="70" width="8" height="6" rx="2" fill="#2b2f3a"/>
  <rect x="8" y="70" width="104" height="10" rx="3" fill="#3b3f4c"/>
  <rect x="8" y="28" width="104" height="46" rx="6" fill="${kleur}" stroke="${donker}" stroke-width="3"/>
  <path d="M4 31 C4 18 116 18 116 31 Z" fill="#f6f1e7" stroke="${donker}" stroke-width="3" stroke-linejoin="round"/>
  <rect x="9.5" y="60" width="101" height="5" fill="#fff" opacity="0.7"/>
  <g fill="#cdeeff" stroke="${donker}" stroke-width="2.5">
    <rect x="18" y="36" width="22" height="18" rx="3"/><rect x="49" y="36" width="22" height="18" rx="3"/><rect x="80" y="36" width="22" height="18" rx="3"/>
  </g>
  ${wiel(30, 90, 12)}
  ${wiel(90, 90, 12)}
</svg>`;

// Open wagon voor het feest: lage wandjes, het dier staat erachter (dus erin).
const openWagon = (kleur: string, donker: string) => `
<svg viewBox="0 0 120 104" aria-hidden="true">
  <rect x="0" y="70" width="8" height="6" rx="2" fill="#2b2f3a"/>
  <rect x="112" y="70" width="8" height="6" rx="2" fill="#2b2f3a"/>
  <rect x="8" y="70" width="104" height="10" rx="3" fill="#3b3f4c"/>
  <rect x="8" y="54" width="104" height="22" rx="4" fill="${kleur}" stroke="${donker}" stroke-width="3"/>
  <path d="M34 56 V74 M60 56 V74 M86 56 V74" stroke="${donker}" stroke-width="2" opacity="0.6"/>
  ${wiel(30, 90, 12)}
  ${wiel(90, 90, 12)}
</svg>`;

// Onderstel dat alle wagons delen: buffers, chassis en twee wielen.
const onderstel = `
  <rect x="0" y="70" width="8" height="6" rx="2" fill="#2b2f3a"/>
  <rect x="112" y="70" width="8" height="6" rx="2" fill="#2b2f3a"/>
  <rect x="8" y="70" width="104" height="10" rx="3" fill="#3b3f4c"/>`;

// Stenenwagon: open bak met een berg grijze stenen.
const STENEN = `
<svg viewBox="0 0 120 104" aria-hidden="true">${onderstel}
  <g fill="#9aa0ab" stroke="#5f6570" stroke-width="2">
    <circle cx="28" cy="40" r="10"/><circle cx="46" cy="32" r="11"/><circle cx="64" cy="30" r="12"/>
    <circle cx="82" cy="33" r="11"/><circle cx="98" cy="40" r="9"/><circle cx="56" cy="40" r="9"/><circle cx="76" cy="42" r="8"/>
  </g>
  <g fill="#c3c8d1"><circle cx="44" cy="28" r="3"/><circle cx="62" cy="25" r="3.5"/><circle cx="80" cy="29" r="3"/></g>
  <path d="M8 40 H112 L104 74 H16 Z" fill="#8a5a3a" stroke="#4f3a29" stroke-width="3" stroke-linejoin="round"/>
  <path d="M38 42 V72 M60 42 V72 M82 42 V72" stroke="#6e4a2e" stroke-width="3"/>
  <path d="M12 48 H108" stroke="#a87448" stroke-width="2"/>
  ${wiel(30, 90, 12)}
  ${wiel(90, 90, 12)}
</svg>`;

// Gastankwagon: zilveren ketel met een koepel, een laddertje en een vlam-ruitje.
const TANK = `
<svg viewBox="0 0 120 104" aria-hidden="true">${onderstel}
  <path d="M28 66 V74 M92 66 V74" stroke="#3b3f4c" stroke-width="5"/>
  <rect x="6" y="30" width="108" height="40" rx="20" fill="#dfe4ec" stroke="#6b7280" stroke-width="3"/>
  <rect x="10" y="46" width="100" height="6" fill="#f5a524" opacity="0.9"/>
  <path d="M14 38 C40 33 80 33 106 38" stroke="#ffffff" stroke-width="3" fill="none" opacity="0.8" stroke-linecap="round"/>
  <rect x="52" y="20" width="16" height="12" rx="4" fill="#c7cdd8" stroke="#6b7280" stroke-width="2.5"/>
  <path d="M100 30 V70 M106 34 V66 M100 42 H106 M100 52 H106 M100 62 H106" stroke="#6b7280" stroke-width="2"/>
  <g transform="translate(38 58) rotate(45)">
    <rect x="-8" y="-8" width="16" height="16" fill="#ff6a3d" stroke="#fff" stroke-width="1.5"/>
  </g>
  <path d="M38 63 C34 60 35 56 38 52 C38 55 41 56 41 59 C41 61 40 62 38 63 Z" fill="#fff"/>
  ${wiel(30, 90, 12)}
  ${wiel(90, 90, 12)}
</svg>`;

// Postwagon: oranje dichte wagon met een grote envelop.
const POST = `
<svg viewBox="0 0 120 104" aria-hidden="true">${onderstel}
  <rect x="8" y="28" width="104" height="46" rx="6" fill="#ff8a1f" stroke="#a5480a" stroke-width="3"/>
  <path d="M4 31 C4 18 116 18 116 31 Z" fill="#f6f1e7" stroke="#a5480a" stroke-width="3" stroke-linejoin="round"/>
  <rect x="36" y="36" width="48" height="30" rx="3" fill="#fff" stroke="#a5480a" stroke-width="2.5"/>
  <path d="M37 37 L60 54 L83 37" fill="none" stroke="#a5480a" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M14 34 V70 M106 34 V70" stroke="#e06f0a" stroke-width="3"/>
  ${wiel(30, 90, 12)}
  ${wiel(90, 90, 12)}
</svg>`;

// Containerwagon: platte wagen met een gekleurde container en een plaatje van de lading.
const CONTAINERKLEUREN: [string, string][] = [
  ['#2f7dd1', '#1b4d86'], ['#d9483b', '#7d2219'], ['#3aa65a', '#1f6a35'], ['#f2a51f', '#a8680a'], ['#8a5cd6', '#563396'],
];
const LADINGEN = ['banaan', 'appel', 'vis', 'kaas', 'fiets', 'knuffel', 'voetbal', 'auto', 'boek', 'melk', 'puzzel', 'gitaar', 'wortel', 'sinaasappel'];
const container = (kleur: string, donker: string, lading: string) => `
<svg viewBox="0 0 120 104" aria-hidden="true">${onderstel}
  <rect x="6" y="66" width="108" height="6" rx="2" fill="#5a5f6e"/>
  <rect x="8" y="24" width="104" height="42" rx="3" fill="${kleur}" stroke="${donker}" stroke-width="3"/>
  <path d="M18 27 V63 M28 27 V63 M92 27 V63 M102 27 V63" stroke="${donker}" stroke-width="2" opacity="0.55"/>
  <rect x="38" y="29" width="44" height="32" rx="5" fill="#fff" opacity="0.92"/>
  <image href="assets/images/woorden/${lading}.svg" x="42" y="31" width="36" height="28" preserveAspectRatio="xMidYMid meet"/>
  ${wiel(30, 90, 12)}
  ${wiel(90, 90, 12)}
</svg>`;

const WAGONKLEUREN: [string, string][] = [
  ['#4cc277', '#2a7a45'],
  ['#ffb340', '#b0681a'],
  ['#5aa9f0', '#2a63a0'],
  ['#c77dff', '#7d3fb0'],
  ['#ff7ac0', '#b8407e'],
  ['#ffd23f', '#b08a10'],
];
const DIEREN = ['koe', 'varken', 'schaap', 'haan', 'kuiken', 'schildpad'];

interface Trein {
  element: HTMLElement;
  loc: HTMLElement;
  stop: () => void;
}

const kies = <T,>(lijst: T[]): T => lijst[Math.floor(Math.random() * lijst.length)];

export function maakTreinDecor(): Decor {
  const root = el('div', 'decor decor-trein');
  plaatje('assets/achtergrond/zon.svg', 'trein-zon', root);
  plaatje('assets/achtergrond/wolk.svg', 'drijf-wolk drijf-wolk--1', root);
  plaatje('assets/achtergrond/wolk.svg', 'drijf-wolk drijf-wolk--2', root);

  // Bomen vóór het landschap in de DOM: de heuvel valt over hun voet.
  const bomen = [
    plaatje('assets/achtergrond/boom.svg', 'trein-boom trein-boom--1', root),
    plaatje('assets/achtergrond/den.svg', 'trein-boom trein-boom--2', root),
    plaatje('assets/achtergrond/boom.svg', 'trein-boom trein-boom--3', root),
  ];
  const land = svgUitTekst(LANDSCHAP, 'trein-landschap', root);
  const achter = land.querySelector('path') as SVGPathElement;

  const station = svgUitTekst(STATION, 'trein-station', root);
  const sein = el('div', 'trein-sein', root);
  svgUitTekst(SEIN, 'trein-sein__svg', sein);
  el('div', 'trein-leuning', root);
  svgUitTekst(BRUG, 'trein-brug', root);
  el('div', 'trein-spoor', root);
  const baan = el('div', 'trein-baan', root);

  const plaats = () => {
    for (const b of bomen) zetOpPad(b, achter, 6);
  };

  const stil = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let levend = true;
  let trein: Trein | null = null;
  let gluurLoc: HTMLElement | null = null;
  let planTimer: number | undefined;
  const timers = new Set<number>();
  const wacht = (fn: () => void, ms: number): number => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      if (levend) fn();
    }, ms);
    timers.add(id);
    return id;
  };

  const maakLoc = (ouder: HTMLElement): HTMLElement => {
    const loc = el('div', 'trein-loc', ouder);
    svgUitTekst(LOC, 'trein-loc__svg', loc);
    const rook = el('div', 'trein-rook', loc);
    for (let i = 0; i < 3; i++) el('div', 'trein-pluim', rook);
    return loc;
  };

  const maakWagon = (ouder: HTMLElement, svg: string, soort = ''): HTMLElement => {
    const w = el('div', `trein-wagon${soort ? ` trein-wagon--${soort}` : ''}`, ouder);
    svgUitTekst(svg, 'trein-wagon__svg', w);
    return w;
  };

  type Stop = 'station' | 'sein' | null;

  // Een trein rijdt van links naar rechts over het hele scherm, met een vaste snelheid in
  // pixels per seconde (dus even rustig op een telefoon als op een groot scherm). Met een
  // stop remt hij af, staat even stil (wielen ook) en trekt weer op.
  const rijd = (vul: (t: HTMLElement) => void, klaar: () => void, stop: Stop = null): Trein => {
    const t = el('div', 'trein-trein', baan);
    vul(t);
    const loc = maakLoc(t);
    const lengte = t.offsetWidth;
    const breedte = root.clientWidth || window.innerWidth;
    const snelheid = Math.min(150, Math.max(70, breedte * 0.11));
    const versnel = snelheid * 0.55; // px/s²: in bijna 2 s op snelheid of stil
    let x = -lengte;
    let v = snelheid;
    let doel: number | null = null;
    let wachtTot = 0;
    let staat = false;
    let raf = 0;
    let vorige = 0;

    // Waar de trein (zijn linkerkant) moet stoppen.
    if (stop === 'station') {
      // De personenwagons midden voor het station.
      const s = station.getBoundingClientRect();
      const r = root.getBoundingClientRect();
      // Midden van het stuk station dat in beeld is.
      const midStation = (Math.max(s.left, r.left) + s.right) / 2 - r.left;
      const personen = [...t.querySelectorAll<HTMLElement>('.trein-wagon--personen')];
      if (personen.length) {
        const a = personen[0].offsetLeft;
        const b = personen[personen.length - 1].offsetLeft + personen[personen.length - 1].offsetWidth;
        doel = midStation - (a + b) / 2;
      }
    } else if (stop === 'sein') {
      const s = sein.getBoundingClientRect();
      const r = root.getBoundingClientRect();
      doel = s.left - r.left - lengte - breedte * 0.02;
    }
    if (doel !== null && doel < -lengte + 40) doel = null;

    const nieuw: Trein = { element: t, loc, stop: () => cancelAnimationFrame(raf) };
    trein = nieuw;
    // Bij een stop voor het sein blijft het rood tot de trein weer mag.
    sein.classList.toggle('groen', stop !== 'sein' || doel === null);

    const stap = (nu: number) => {
      if (!levend || trein !== nieuw) return;
      const dt = Math.min(0.05, vorige ? (nu - vorige) / 1000 : 0);
      vorige = nu;
      if (doel !== null && !staat) {
        const rest = doel - x;
        if (rest <= 0.5) {
          x = doel;
          v = 0;
          staat = true;
          t.classList.add('trein-trein--staat');
          wachtTot = nu + (stop === 'station' ? 4500 + Math.random() * 2500 : 3000 + Math.random() * 2000);
          if (stop === 'station') wacht(() => trein === nieuw && toet(loc, true), 900);
        } else {
          v = Math.min(snelheid, Math.sqrt(2 * versnel * rest), v + versnel * dt);
          x += Math.max(v, 6) * dt;
        }
      } else if (staat && nu < wachtTot) {
        // even stilstaan
      } else {
        if (staat) {
          staat = false;
          doel = null;
          t.classList.remove('trein-trein--staat');
          if (stop === 'sein') {
            sein.classList.add('groen');
            kortAan(sein, 'knippert', 1000);
          }
        }
        v = Math.min(snelheid, v + versnel * dt);
        x += Math.max(v, 6) * dt;
      }
      t.style.transform = `translateX(${x}px)`;
      if (x >= breedte) {
        t.remove();
        trein = null;
        sein.classList.remove('groen');
        klaar();
        return;
      }
      raf = requestAnimationFrame(stap);
    };
    t.style.transform = `translateX(${x}px)`;
    raf = requestAnimationFrame(stap);
    return nieuw;
  };

  // Reizigerstrein: postwagon achter de loc, twee of drie personenwagons, soms een container.
  // Goederentrein: langer, alleen stenen, gastanks en containers.
  const vulReizigers = (t: HTMLElement) => {
    if (Math.random() < 0.5) maakWagon(t, container(...kies(CONTAINERKLEUREN), kies(LADINGEN)), 'container');
    const kleuren = [...WAGONKLEUREN].sort(() => Math.random() - 0.5);
    const n = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < n; i++) maakWagon(t, wagon(...kleuren[i]), 'personen');
    maakWagon(t, POST, 'post');
  };
  const vulGoederen = (t: HTMLElement) => {
    const n = 5 + Math.floor(Math.random() * 4);
    let vorige = '';
    for (let i = 0; i < n; i++) {
      // Soms twee dezelfde achter elkaar (zoals een rij tanks), maar niet te vaak.
      const soort = Math.random() < 0.35 && vorige ? vorige : kies(['stenen', 'tank', 'container', 'container']);
      vorige = soort;
      if (soort === 'stenen') maakWagon(t, STENEN, 'stenen');
      else if (soort === 'tank') maakWagon(t, TANK, 'tank');
      else maakWagon(t, container(...kies(CONTAINERKLEUREN), kies(LADINGEN)), 'container');
    }
  };

  function plan(ms = 9000 + Math.random() * 14000): void {
    window.clearTimeout(planTimer);
    if (!levend || stil) return;
    planTimer = wacht(() => {
      if (trein || gluurLoc) return plan(2500);
      const reizigers = Math.random() < 0.55;
      const lot = Math.random();
      const stop: Stop = reizigers ? (lot < 0.6 ? 'station' : lot < 0.8 ? 'sein' : null) : lot < 0.35 ? 'sein' : null;
      rijd(reizigers ? vulReizigers : vulGoederen, () => plan(), stop);
    }, ms);
  }
  plan(3000 + Math.random() * 5000);

  // "Tuut!": een tekstwolkje, en bij een locomotief ook een grote stoomwolk uit de schoorsteen.
  const toet = (doel: HTMLElement, stoom: boolean) => {
    const delen: HTMLElement[] = [];
    if (stoom) {
      const wolk = el('div', 'trein-stoom', doel);
      for (let i = 0; i < 5; i++) el('span', 'trein-stoom__bol', wolk);
      delen.push(wolk);
    }
    const roep = el('div', 'trein-roep', doel);
    roep.textContent = 'tuut!';
    delen.push(roep);
    wacht(() => delen.forEach((d) => d.remove()), 1600);
  };

  // Een locomotief die even uit het station piept, toetert en weer terugrijdt.
  const gluur = () => {
    const loc = maakLoc(baan);
    loc.classList.add('trein-loc--gluur');
    gluurLoc = loc;
    wacht(() => toet(loc, true), 250);
    wacht(() => {
      loc.remove();
      if (gluurLoc === loc) gluurLoc = null;
    }, 2700);
  };

  const zichtbareLoc = (): HTMLElement | null => {
    if (!trein) return null;
    const r = trein.loc.getBoundingClientRect();
    const midden = r.left + r.width / 2;
    const breedte = window.innerWidth;
    return midden > breedte * 0.06 && midden < breedte * 0.94 ? trein.loc : null;
  };

  const juich = () => {
    kortAan(sein, 'knippert', 1400);
    const loc = zichtbareLoc() ?? gluurLoc;
    if (loc) toet(loc, true);
    else if (!trein && !stil) gluur();
    else toet(sein, false);
  };

  // Laat een trein (of de gluurlocomotief) zacht verdwijnen, zodat er plaats is.
  const vervaag = (e: HTMLElement, stopTrein?: () => void) => {
    stopTrein?.();
    e.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, fill: 'forwards' });
    wacht(() => e.remove(), 420);
  };

  // Einde van een sessie: een lange trein met in elke open wagon een dier.
  const feest = () => {
    if (stil) {
      juich();
      return;
    }
    window.clearTimeout(planTimer);
    let wachtMs = 0;
    if (trein) {
      vervaag(trein.element, trein.stop);
      trein = null;
      wachtMs = 450;
    }
    if (gluurLoc) {
      vervaag(gluurLoc);
      gluurLoc = null;
      wachtMs = 450;
    }
    kortAan(sein, 'knippert', 1400);
    toet(sein, false);
    wacht(() => {
      const dieren: HTMLElement[] = [];
      const lang = rijd((t) => {
        DIEREN.forEach((naam, i) => {
          const w = maakWagon(t, openWagon(...WAGONKLEUREN[(i + 2) % WAGONKLEUREN.length]));
          // Het dier vóór de wagon-svg in de DOM: de wandjes vallen over zijn pootjes.
          const dier = el('div', `trein-dier trein-dier--${naam}`, w);
          w.prepend(dier);
          dier.style.animationDelay = `${-i * 0.27}s`;
          // De Fluent-dieren kijken naar links; de trein rijdt naar rechts.
          plaatje(`assets/achtergrond/${naam}.svg`, 'trein-dier__lijf gespiegeld', dier);
          dieren.push(dier);
        });
      }, () => plan());
      wacht(() => {
        if (trein === lang) toet(lang.loc, true);
      }, 1500);
      // Sterretjes boven de dieren zolang de trein rijdt.
      let n = 0;
      const ster = () => {
        if (trein !== lang) return;
        const dier = dieren[n % dieren.length];
        const s = el('div', 'trein-ster', dier);
        s.textContent = ['★', '♥', '✦'][n % 3];
        wacht(() => s.remove(), 1200);
        n += 1;
        wacht(ster, 380);
      };
      wacht(ster, 900);
    }, wachtMs);
  };

  const vernietig = () => {
    levend = false;
    window.clearTimeout(planTimer);
    for (const id of timers) window.clearTimeout(id);
    timers.clear();
    trein?.stop();
    trein = null;
  };
  return { element: root, juich, feest, plaats, vernietig };
}
