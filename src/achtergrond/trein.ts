import type { Decor } from './achtergrond.ts';
import { el, kortAan, plaatje, svgUitTekst, zetOpPad } from './hulp.ts';

// Treinreis: groene heuvels met een spoorlijn langs de onderkant, een stenen brug over een
// riviertje, links een stationnetje en rechts een sein. Af en toe rijdt er een stoomtrein
// (locomotief met twee wagons) voorbij, met rookpluimpjes uit de schoorsteen; nooit twee
// treinen tegelijk. Bij een goed antwoord toetert de trein: een grote stoomwolk en "tuut!".
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

const STATION = `
<svg viewBox="0 0 200 150" aria-hidden="true">
  <rect x="0" y="136" width="200" height="14" rx="3" fill="#d3ccbf" stroke="#8d8576" stroke-width="3"/>
  <rect x="30" y="58" width="140" height="80" fill="#f6dfb0" stroke="#8a5a3a" stroke-width="4"/>
  <path d="M16 64 L100 14 L184 64 Z" fill="#d9483b" stroke="#7d2219" stroke-width="4" stroke-linejoin="round"/>
  <circle cx="100" cy="45" r="11" fill="#fff" stroke="#3b3b4f" stroke-width="3"/>
  <path d="M100 45 V38 M100 45 H106" stroke="#3b3b4f" stroke-width="2.5" stroke-linecap="round"/>
  <rect x="62" y="68" width="76" height="16" rx="4" fill="#2f7dd1" stroke="#1b4d86" stroke-width="2"/>
  <text x="100" y="80.5" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="12" fill="#fff">STATION</text>
  <rect x="88" y="94" width="24" height="44" rx="3" fill="#7a4f2e" stroke="#4f3a29" stroke-width="3"/>
  <circle cx="106" cy="117" r="2" fill="#ffd23f"/>
  <g fill="#cdeeff" stroke="#8a5a3a" stroke-width="3">
    <rect x="44" y="94" width="30" height="26" rx="3"/>
    <rect x="126" y="94" width="30" height="26" rx="3"/>
  </g>
  <path d="M59 94 V120 M44 107 H74 M141 94 V120 M126 107 H156" stroke="#8a5a3a" stroke-width="2"/>
  <g fill="#ff7ac0"><circle cx="40" cy="130" r="4"/><circle cx="48" cy="128" r="4"/><circle cx="160" cy="130" r="4"/></g>
  <g fill="#ffd23f"><circle cx="52" cy="132" r="3.5"/><circle cx="152" cy="128" r="4"/><circle cx="166" cy="131" r="3"/></g>
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
  anim: Animation;
}

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

  svgUitTekst(STATION, 'trein-station', root);
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

  const maakWagon = (ouder: HTMLElement, svg: string): HTMLElement => {
    const w = el('div', 'trein-wagon', ouder);
    svgUitTekst(svg, 'trein-wagon__svg', w);
    return w;
  };

  // Een trein rijdt van links naar rechts over het hele scherm, met een vaste snelheid in
  // pixels per seconde (dus even rustig op een telefoon als op een groot scherm).
  const rijd = (vul: (t: HTMLElement) => void, klaar: () => void): Trein => {
    const t = el('div', 'trein-trein', baan);
    vul(t);
    const loc = maakLoc(t);
    const lengte = t.offsetWidth;
    const breedte = root.clientWidth || window.innerWidth;
    const snelheid = Math.min(150, Math.max(70, breedte * 0.11));
    const anim = t.animate(
      [{ transform: `translateX(${-lengte}px)` }, { transform: `translateX(${breedte}px)` }],
      { duration: ((breedte + lengte) / snelheid) * 1000, easing: 'linear', fill: 'forwards' },
    );
    const nieuw = { element: t, loc, anim };
    trein = nieuw;
    sein.classList.add('groen');
    anim.onfinish = () => {
      t.remove();
      if (trein !== nieuw) return;
      trein = null;
      sein.classList.remove('groen');
      klaar();
    };
    return nieuw;
  };

  function plan(ms = 9000 + Math.random() * 14000): void {
    window.clearTimeout(planTimer);
    if (!levend || stil) return;
    planTimer = wacht(() => {
      if (trein || gluurLoc) return plan(2500);
      rijd((t) => {
        maakWagon(t, wagon(...WAGONKLEUREN[0]));
        maakWagon(t, wagon(...WAGONKLEUREN[1]));
      }, () => plan());
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
  const vervaag = (e: HTMLElement, anim?: Animation) => {
    e.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, fill: 'forwards' });
    wacht(() => {
      anim?.cancel();
      e.remove();
    }, 420);
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
      vervaag(trein.element, trein.anim);
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
    trein?.anim.cancel();
    trein = null;
  };
  return { element: root, juich, feest, plaats, vernietig };
}
