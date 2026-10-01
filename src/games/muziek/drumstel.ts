import { speelDrum, type DrumSoort } from '../../engine/muziek.ts';

// Drumstel met zelfgetekende onderdelen: grote trom (rood), snaredrum (blauw) en bekken
// (goud). Elke trom is een eigen knop, zodat twee vingers tegelijk kunnen trommelen.

export const DRUM_KLEUR: Record<DrumSoort, string> = { bas: '#e53935', snare: '#1e88e5', bekken: '#f9a825' };
export const DRUM_NAAM: Record<DrumSoort, string> = { bas: 'grote trom', snare: 'kleine trom', bekken: 'bekken' };

const TEKENING: Record<DrumSoort, string> = {
  bas: `<svg viewBox="0 0 100 100" aria-hidden="true">
    <path d="M24 86 L14 98 M76 86 L86 98" stroke="#5d4037" stroke-width="5" stroke-linecap="round"/>
    <circle cx="50" cy="48" r="44" fill="#c62828"/>
    <circle cx="50" cy="48" r="44" fill="none" stroke="#ffd54f" stroke-width="4"/>
    <circle cx="50" cy="48" r="35" fill="#fff8e1"/>
    <path d="M50 30 l5 11 12 1 -9 8 3 12 -11 -6 -11 6 3 -12 -9 -8 12 -1z" fill="#e53935"/>
  </svg>`,
  snare: `<svg viewBox="0 0 100 90" aria-hidden="true">
    <path d="M30 70 L18 88 M70 70 L82 88 M50 70 L50 88" stroke="#616161" stroke-width="4" stroke-linecap="round"/>
    <rect x="10" y="26" width="80" height="34" fill="#1e88e5"/>
    <ellipse cx="50" cy="60" rx="40" ry="11" fill="#1565c0"/>
    <path d="M18 30 v28 M34 34 v28 M50 35 v28 M66 34 v28 M82 30 v28" stroke="#e0e0e0" stroke-width="3"/>
    <ellipse cx="50" cy="26" rx="40" ry="11" fill="#f5f5f5" stroke="#bdbdbd" stroke-width="3"/>
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
): { element: HTMLElement; licht: (soort: DrumSoort) => void; zetActief: (aan: boolean) => void } {
  const el = document.createElement('div');
  el.className = `drumstel drumstel--${soorten.length}`;
  let actief = true;
  const pads = new Map<DrumSoort, HTMLButtonElement>();

  // Vaste plek per onderdeel, ook als er nog maar één of twee zijn.
  for (const soort of (['snare', 'bas', 'bekken'] as DrumSoort[]).filter((s) => soorten.includes(s))) {
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

  return {
    element: el,
    licht,
    zetActief: (aan) => {
      actief = aan;
      el.classList.toggle('drumstel--voor', !aan);
    },
  };
}
