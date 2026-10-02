import { speelDrum, type DrumSoort } from '../../engine/muziek.ts';

// Drumstel met zelfgetekende onderdelen: grote trom (rood), snaredrum (blauw, plat met
// snaren eronder), tom (groen), bekken (goud) en crash (oranje, groter en schuin). Vrij
// spelen toont het hele stel. Ritme bouwt op: bas + snare, dan bekken, dan tom, dan crash.
// Elke trom is een eigen knop, zodat twee vingers tegelijk kunnen trommelen.

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

const TEKENING: Record<DrumSoort, string> = {
  bas: `<svg viewBox="0 0 100 100" aria-hidden="true">
    <path d="M24 86 L14 98 M76 86 L86 98" stroke="#5d4037" stroke-width="5" stroke-linecap="round"/>
    <circle cx="50" cy="48" r="44" fill="#c62828"/>
    <circle cx="50" cy="48" r="44" fill="none" stroke="#ffd54f" stroke-width="4"/>
    <circle cx="50" cy="48" r="35" fill="#fff8e1"/>
    <path d="M50 30 l5 11 12 1 -9 8 3 12 -11 -6 -11 6 3 -12 -9 -8 12 -1z" fill="#e53935"/>
  </svg>`,
  snare: `<svg viewBox="0 0 100 90" aria-hidden="true">
    <path d="M50 58 V80 M50 80 L30 90 M50 80 L70 90 M50 80 V90" stroke="#616161" stroke-width="4" stroke-linecap="round"/>
    <rect x="8" y="36" width="84" height="16" fill="#1e88e5"/>
    <ellipse cx="50" cy="52" rx="42" ry="11" fill="#1565c0"/>
    <path d="M16 40 v13 M30 44 v13 M50 45 v13 M70 44 v13 M84 40 v13" stroke="#e0e0e0" stroke-width="3"/>
    <path d="M22 57 Q50 66 78 57 M24 60 Q50 69 76 60" stroke="#bdbdbd" stroke-width="1.5" fill="none"/>
    <ellipse cx="50" cy="36" rx="42" ry="11" fill="#f5f5f5" stroke="#bdbdbd" stroke-width="3"/>
  </svg>`,
  tom: `<svg viewBox="0 0 100 90" aria-hidden="true">
    <path d="M50 70 V88" stroke="#616161" stroke-width="5" stroke-linecap="round"/>
    <rect x="16" y="22" width="68" height="40" fill="#43a047"/>
    <ellipse cx="50" cy="62" rx="34" ry="10" fill="#2e7d32"/>
    <path d="M22 26 v35 M36 30 v36 M50 31 v36 M64 30 v36 M78 26 v35" stroke="#e0e0e0" stroke-width="3"/>
    <ellipse cx="50" cy="22" rx="34" ry="10" fill="#f5f5f5" stroke="#bdbdbd" stroke-width="3"/>
  </svg>`,
  crash: `<svg viewBox="0 0 100 100" aria-hidden="true">
    <path d="M50 36 V90 M50 90 L32 99 M50 90 L68 99" stroke="#616161" stroke-width="4" stroke-linecap="round"/>
    <g transform="rotate(-14 50 30)">
      <ellipse cx="50" cy="30" rx="49" ry="14" fill="#fb8c00" stroke="#e65100" stroke-width="2"/>
      <ellipse cx="50" cy="28" rx="34" ry="8" fill="none" stroke="#ffcc80" stroke-width="2" opacity="0.9"/>
      <ellipse cx="50" cy="28" rx="18" ry="4" fill="none" stroke="#ffe0b2" stroke-width="1.5" opacity="0.8"/>
      <ellipse cx="50" cy="27" rx="8" ry="4" fill="#ef6c00"/>
    </g>
  </svg>`,
  bekken: `<svg viewBox="0 0 100 100" aria-hidden="true">
    <path d="M50 34 V90 M50 90 L32 99 M50 90 L68 99" stroke="#616161" stroke-width="4" stroke-linecap="round"/>
    <ellipse cx="50" cy="30" rx="46" ry="12" fill="#fbc02d" stroke="#f57f17" stroke-width="2"/>
    <ellipse cx="50" cy="28" rx="30" ry="6" fill="none" stroke="#fff176" stroke-width="2" opacity="0.8"/>
    <ellipse cx="50" cy="27" rx="9" ry="4" fill="#f9a825"/>
  </svg>`,
};

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

  // Vaste plek per onderdeel, ook als er nog maar één of twee zijn.
  for (const soort of (['crash', 'tom', 'snare', 'bas', 'bekken'] as DrumSoort[]).filter((s) => soorten.includes(s))) {
    const pad = document.createElement('button');
    pad.type = 'button';
    pad.className = `drum-pad drum-pad--${soort}`;
    if (soort === nieuw) pad.classList.add('drum-pad--nieuw');
    pad.setAttribute('aria-label', DRUM_NAAM[soort]);
    pad.innerHTML = TEKENING[soort];
    pad.addEventListener('animationend', () => pad.classList.remove('drum-pad--bonk', 'drum-pad--nieuw'));
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
