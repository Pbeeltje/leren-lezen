import { speelDrum, type DrumSoort } from '../../engine/muziek.ts';

// Drumstel met zelfgetekende onderdelen: grote trom (rood), snaredrum (blauw, plat met
// snaren eronder), tom (groen), bekken (goud) en crash (oranje, groter en schuin), op een
// podium met lampjes en spots. Vrij spelen toont het hele stel. Ritme bouwt op: bas + snare,
// dan bekken, dan tom, dan crash. Elke trom is een eigen knop, zodat twee vingers tegelijk
// kunnen trommelen. Een slag laat een stok tikken (de grote trom: schokgolven), de trom
// veren of het bekken wiebelen, met een knal in de kleur van de trom.

export const DRUM_KLEUR: Record<DrumSoort, string> = {
  bas: '#e53935',
  snare: '#1e88e5',
  bekken: '#f9a825',
  tom: '#43a047',
  crash: '#fb8c00',
};
export const DRUM_NAAM: Record<DrumSoort, string> = {
  bas: 'grote trom',
  snare: 'snaredrum',
  bekken: 'bekken',
  tom: 'tom',
  crash: 'crash',
};

// Getekend in vlakke kleuren (geen verlopen: een url(#id) tekent niet als de SVG ooit op
// display:none staat). Statieven zijn chroom: een donkere buis met een lichte streep erin,
// zodat ze op het donkere podium te zien zijn. De onderdelen die bij een slag bewegen hebben
// een klasse: .drum-trom (de ketel veert), .drum-vel (het vel trilt), .drum-schijf (het
// bekken wiebelt).
const chroom = (d: string, dik = 4): string =>
  `<path d="${d}" fill="none" stroke="#37474f" stroke-width="${dik + 2.5}" stroke-linecap="round" stroke-linejoin="round"/>
   <path d="${d}" fill="none" stroke="#cfd8dc" stroke-width="${dik - 1}" stroke-linecap="round" stroke-linejoin="round"/>`;

// Een trom van opzij (snare, tom): ketel met een lichte en een donkere kant, chromen
// spanners, onderrand en bovenop het witte vel in een chromen rand.
function trom(t: { cx: number; top: number; rx: number; ry: number; hoog: number; kleur: string; donker: string; licht: string; spanners: number[] }): string {
  const { cx, top, rx, ry, hoog, kleur, donker, licht } = t;
  const l = cx - rx;
  const r = cx + rx;
  const onder = top + hoog;
  // y van de voorrand van een ellips (midden y0) op plek x.
  const voor = (x: number, y0: number): number => y0 + ry * Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2));
  const xd = cx + rx * 0.5;
  const xl = cx - rx * 0.72;
  const spanners = t.spanners
    .map((f) => {
      const x = cx + f * rx;
      const y = voor(x, top);
      return `<path d="M${x} ${y + 1} V${voor(x, onder) - 1}" stroke="#90a4ae" stroke-width="1.6"/>
        <rect x="${x - 2.6}" y="${y + hoog * 0.28}" width="5.2" height="${hoog * 0.44}" rx="2.6" fill="#eceff1" stroke="#455a64" stroke-width="1.2"/>`;
    })
    .join('');
  return `<g class="drum-trom">
    <path d="M${l} ${top} V${onder} A${rx} ${ry} 0 0 0 ${r} ${onder} V${top} Z" fill="${kleur}"/>
    <path d="M${xd} ${top} V${voor(xd, onder)} A${rx} ${ry} 0 0 0 ${r} ${onder} V${top} Z" fill="${donker}"/>
    <path d="M${xl} ${top} V${voor(xl, onder)} L${xl + rx * 0.16} ${voor(xl + rx * 0.16, onder)} V${top} Z" fill="${licht}"/>
    ${spanners}
    <path d="M${l} ${onder} A${rx} ${ry} 0 0 0 ${r} ${onder}" fill="none" stroke="#455a64" stroke-width="4.5"/>
    <path d="M${l} ${onder} A${rx} ${ry} 0 0 0 ${r} ${onder}" fill="none" stroke="#eceff1" stroke-width="2"/>
    <g class="drum-vel">
      <ellipse cx="${cx}" cy="${top}" rx="${rx}" ry="${ry}" fill="#cfd8dc" stroke="#455a64" stroke-width="2"/>
      <ellipse cx="${cx}" cy="${top + 0.6}" rx="${rx - 3.5}" ry="${ry - 2.2}" fill="#fafafa"/>
      <ellipse cx="${cx}" cy="${top + 1}" rx="${rx * 0.26}" ry="${ry * 0.3}" fill="#eeeeee"/>
      <path d="M${l + 7} ${top - 1} Q${cx - rx * 0.5} ${top - ry + 3} ${cx - rx * 0.05} ${top - ry + 2.4}" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
    </g>
  </g>`;
}

// Een bekken: glanzende schijf met groeven, een koepeltje in het midden en een vilt met
// vleugelmoer bovenop. Heel de schijf wiebelt bij een slag.
function bekken(kleur: string, donker: string, licht: string, rx: number, ry: number): string {
  const ringen = [0.86, 0.7, 0.54, 0.38]
    .map((f) => `<ellipse cx="50" cy="${30 - (1 - f) * 2}" rx="${rx * f}" ry="${ry * f}" fill="none" stroke="${donker}" stroke-width="1" opacity="0.45"/>`)
    .join('');
  return `<g class="drum-schijf">
    <ellipse cx="50" cy="30" rx="${rx}" ry="${ry}" fill="${kleur}" stroke="${donker}" stroke-width="2"/>
    <path d="M${50 - rx + 2} 31 A${rx - 2} ${ry - 1} 0 0 0 ${50 + rx - 2} 31" fill="none" stroke="${donker}" stroke-width="2.5" opacity="0.55"/>
    ${ringen}
    <path d="M${50 - rx * 0.82} 27.5 Q${50 - rx * 0.45} ${30 - ry * 0.95} ${50 - rx * 0.05} ${30 - ry * 0.9}" fill="none" stroke="${licht}" stroke-width="3" stroke-linecap="round"/>
    <path d="M${50 + rx * 0.35} ${30 + ry * 0.55} Q${50 + rx * 0.6} ${30 + ry * 0.5} ${50 + rx * 0.78} ${30 + ry * 0.3}" fill="none" stroke="${licht}" stroke-width="2" stroke-linecap="round" opacity="0.8"/>
    <ellipse cx="50" cy="28" rx="${rx * 0.2}" ry="${ry * 0.42}" fill="${donker}"/>
    <ellipse cx="48" cy="26.6" rx="${rx * 0.09}" ry="${ry * 0.17}" fill="${licht}"/>
    <rect x="46.5" y="${28 - ry * 0.42 - 5}" width="7" height="5" rx="1.5" fill="#6d4c41"/>
    <path d="M44 ${28 - ry * 0.42 - 7} h12 l-3 3 h-6 Z" fill="#cfd8dc" stroke="#37474f" stroke-width="1"/>
  </g>`;
}

const TEKENING: Record<DrumSoort, string> = {
  bas: `<svg viewBox="0 0 100 100" aria-hidden="true">
    ${chroom('M27 82 L15 97 M73 82 L85 97', 4.5)}
    <g class="drum-trom">
      <circle cx="50" cy="48" r="46" fill="#7f1414"/>
      <circle cx="50" cy="48" r="43" fill="#d32f2f"/>
      <path d="M12 38 A39 39 0 0 1 58 9.6" fill="none" stroke="#ef7070" stroke-width="3.5" stroke-linecap="round"/>
      ${Array.from({ length: 10 }, (_, i) => `<rect x="47" y="3.5" width="6" height="8" rx="2" fill="#eceff1" stroke="#455a64" stroke-width="1.2" transform="rotate(${i * 36 + 18} 50 48)"/>`).join('')}
      <g class="drum-vel">
        <circle cx="50" cy="48" r="36" fill="#fff8e1" stroke="#9a1c1c" stroke-width="2.5"/>
        <circle cx="50" cy="48" r="30.5" fill="none" stroke="#ffca28" stroke-width="3.5"/>
        <path d="M50 29 l5.4 11.4 12.6 1.4 -9.4 8.6 2.8 12.4 -11.4 -6.4 -11.4 6.4 2.8 -12.4 -9.4 -8.6 12.6 -1.4z" fill="#e53935" stroke="#9a1c1c" stroke-width="1.6" stroke-linejoin="round"/>
        <path d="M44.5 41 l3.5 -7.5" stroke="#ff8a80" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M24 40 A27 27 0 0 1 40 23" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/>
      </g>
    </g>
  </svg>`,
  snare: `<svg viewBox="0 0 100 90" aria-hidden="true">
    ${chroom('M50 62 V80 M50 80 L29 90 M50 80 L71 90 M50 80 V90 M50 64 L28 58 M50 64 L72 58', 3.5)}
    ${trom({ cx: 50, top: 36, rx: 42, ry: 11, hoog: 16, kleur: '#1e88e5', donker: '#1565c0', licht: '#64b5f6', spanners: [-0.76, -0.4, 0, 0.4, 0.76] })}
    <path d="M24 59.5 Q50 67 76 59.5 M27 62 Q50 69 73 62" stroke="#b0bec5" stroke-width="1.5" fill="none"/>
    <rect x="89" y="41" width="6" height="11" rx="2" fill="#eceff1" stroke="#455a64" stroke-width="1.2"/>
  </svg>`,
  tom: `<svg viewBox="0 0 100 90" aria-hidden="true">
    ${chroom('M50 72 V82 M50 82 L33 89.5 M50 82 L67 89.5', 4)}
    ${trom({ cx: 50, top: 22, rx: 34, ry: 10, hoog: 40, kleur: '#43a047', donker: '#2e7d32', licht: '#81c784', spanners: [-0.7, -0.25, 0.25, 0.7] })}
  </svg>`,
  crash: `<svg viewBox="0 0 100 100" aria-hidden="true">
    ${chroom('M50 36 V90 M50 90 L32 99 M50 90 L68 99', 3.5)}
    <rect x="46" y="60" width="8" height="7" rx="2" fill="#eceff1" stroke="#37474f" stroke-width="1.2"/>
    <g class="drum-kantel" transform="rotate(-14 50 30)">${bekken('#fb8c00', '#c25100', '#ffd8a8', 49, 14)}</g>
  </svg>`,
  bekken: `<svg viewBox="0 0 100 100" aria-hidden="true">
    ${chroom('M50 34 V90 M50 90 L32 99 M50 90 L68 99', 3.5)}
    <rect x="46" y="60" width="8" height="7" rx="2" fill="#eceff1" stroke="#37474f" stroke-width="1.2"/>
    ${bekken('#fbc02d', '#c77c00', '#fff59d', 46, 12)}
  </svg>`,
};

// Waar de stok raakt (in % van de knop) en welke kant hij op wijst. De grote trom heeft geen
// stok (die speel je met de voet): daar gaat een schokgolf vanaf het vel. De crash (links in
// het stel) wordt links geraakt, met een gespiegelde stok (--spiegel in de CSS).
const RAAK: Record<DrumSoort, { x: number; y: number } | null> = {
  bas: null,
  snare: { x: 56, y: 40 },
  tom: { x: 56, y: 25 },
  bekken: { x: 78, y: 29 },
  crash: { x: 23, y: 36 },
};

// Een drumstok: puntje links (bij x 0), handvat rechts.
const STOK = `<svg viewBox="0 0 100 9" preserveAspectRatio="none">
  <path d="M5 3 L100 1.2 V7.8 L5 6 Z" fill="#e9c48c" stroke="#7b5426" stroke-width="1"/>
  <path d="M10 3.6 L100 2.4" stroke="#fbe3b8" stroke-width="1.2"/>
  <ellipse cx="4.5" cy="4.5" rx="4.5" ry="3.4" fill="#f3d9aa" stroke="#7b5426" stroke-width="1"/>
</svg>`;

// Een knal: stralen in de kleur van de trom, met een witte rand.
const KNAL = `<svg viewBox="-50 -50 100 100">
  <g stroke-linecap="round">
    ${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<path d="M0 -22 V-44" transform="rotate(${a})" stroke="#fff" stroke-width="11"/>`).join('')}
    ${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<path class="drum-knal__straal" d="M0 -22 V-44" transform="rotate(${a})" stroke-width="6"/>`).join('')}
  </g>
</svg>`;

// Twinkelsterretjes rond een bekken.
const GLINSTER = `<svg viewBox="0 0 20 20"><path d="M10 0 Q11.5 8.5 20 10 Q11.5 11.5 10 20 Q8.5 11.5 0 10 Q8.5 8.5 10 0 Z" fill="#fffde7" stroke="#f9a825" stroke-width="1"/></svg>`;

function effecten(soort: DrumSoort): string {
  const raak = RAAK[soort];
  if (!raak) return `<span class="drum-golf"></span><span class="drum-golf drum-golf--2"></span>`;
  const plek = `--hx: ${raak.x}%; --hy: ${raak.y}%`;
  const glinster =
    soort === 'bekken' || soort === 'crash'
      ? [1, 2, 3].map((i) => `<span class="drum-glinster drum-glinster--${i}">${GLINSTER}</span>`).join('')
      : '';
  return `<span class="drum-knal" style="${plek}">${KNAL}</span><span class="drum-stok" style="${plek}">${STOK}</span>${glinster}`;
}

// Het podium achter het drumstel: een gordijnrand met lampjes in de kleuren van de trommen
// en twee spots. Alleen versiering (geen tikken). Bij Ritme ligt het achter het drumstel zelf,
// bij Vrij spelen vult het de hele kaart (zie CSS). Het ronde kleed is een eigen element in het
// drumstel, zodat het ook in Vrij spelen onder de trommen ligt.
function maakPodium(): HTMLElement {
  const podium = document.createElement('div');
  podium.className = 'drum-podium';
  podium.setAttribute('aria-hidden', 'true');
  const kleuren = Object.values(DRUM_KLEUR);
  const lampjes = Array.from(
    { length: 14 },
    (_, i) => `<span style="--lamp: ${kleuren[i % kleuren.length]}; --wacht: ${(-(i * 0.37) % 2.2).toFixed(2)}s"></span>`,
  ).join('');
  podium.innerHTML = `<span class="drum-podium__spot drum-podium__spot--l"></span><span class="drum-podium__spot drum-podium__spot--r"></span>
    <span class="drum-podium__lampjes">${lampjes}</span>`;
  return podium;
}

export function maakDrumstel(
  soorten: DrumSoort[],
  opTik?: (soort: DrumSoort) => void,
  nieuw?: DrumSoort,
): { element: HTMLElement; licht: (soort: DrumSoort) => void; zetActief: (aan: boolean) => void; opruimen: () => void } {
  const el = document.createElement('div');
  // Tom en crash hebben alleen maten binnen drumstel--5. Niveau 3 heeft de tom nog
  // zonder crash: zelfde klasse, maar een raster zonder lege crash-plek. Vijf drums
  // (vrij spelen, ritme vanaf niveau 4) houdt het gewone vijfraster.
  const vier = soorten.includes('tom') && !soorten.includes('crash');
  el.className = vier || soorten.length === 5 ? 'drumstel drumstel--5' : `drumstel drumstel--${soorten.length}`;
  let actief = true;
  const pads = new Map<DrumSoort, HTMLButtonElement>();
  const kleed = document.createElement('span');
  kleed.className = 'drum-kleed';
  el.append(maakPodium(), kleed);

  // Vaste plek per onderdeel, ook als er nog maar één of twee zijn.
  for (const soort of (['crash', 'tom', 'snare', 'bas', 'bekken'] as DrumSoort[]).filter((s) => soorten.includes(s))) {
    const pad = document.createElement('button');
    pad.type = 'button';
    pad.className = `drum-pad drum-pad--${soort}`;
    if (soort === nieuw) pad.classList.add('drum-pad--nieuw');
    pad.setAttribute('aria-label', DRUM_NAAM[soort]);
    pad.style.setProperty('--drum', DRUM_KLEUR[soort]);
    pad.innerHTML = TEKENING[soort] + effecten(soort);
    // Alleen de animatie van de knop zelf (de langste): die van de stok of de knal ervoor
    // zouden de slag anders halverwege afbreken.
    pad.addEventListener('animationend', (e) => {
      if (e.target === pad) pad.classList.remove('drum-pad--bonk', 'drum-pad--nieuw');
    });
    pad.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (!actief) return;
      speelDrum(soort);
      licht(soort);
      opTik?.(soort);
    });
    pads.set(soort, pad);
    el.appendChild(pad);
  }

  function licht(soort: DrumSoort): void {
    const pad = pads.get(soort);
    if (!pad) return;
    pad.classList.remove('drum-pad--bonk');
    void pad.offsetWidth;
    pad.classList.add('drum-pad--bonk');
  }

  let opruimen = (): void => {};
  if (vier) {
    const mq = window.matchMedia('(orientation: landscape) and (max-height: 600px)');
    const zet = (): void => {
      if (mq.matches) {
        el.style.gridTemplateColumns = 'repeat(4, minmax(0, 1fr))';
        el.style.gridTemplateAreas = '"tom snare bas bekken"';
      } else {
        el.style.gridTemplateColumns = 'repeat(4, minmax(0, 1fr))';
        el.style.gridTemplateAreas = '"tom tom bekken bekken" "snare snare bas bas"';
      }
    };
    zet();
    mq.addEventListener('change', zet);
    opruimen = () => mq.removeEventListener('change', zet);
  }

  return {
    element: el,
    licht,
    zetActief: (aan) => {
      actief = aan;
      el.classList.toggle('drumstel--voor', !aan);
    },
    opruimen,
  };
}
