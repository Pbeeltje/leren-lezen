// Eén kikker voor het koor, van voren: grote ogen bovenop de kop, achterpoten opzij,
// voorpootjes op het blad. Elke kikker heeft een eigen groen (n % 8); houding zet de blik.
// Bij een kwaak blaast de keelzak op (.kk-keel), de oogleden knipperen (.kk-knipper).
// Vlakke kleuren, geen verlopen: een url(#id) naar een SVG die op display:none staat
// (een ander instrument) tekent in Chrome niets.

const HUIDEN: [huid: string, schaduw: string, rand: string][] = [
  ['#86d65a', '#56a83c', '#1f5a1e'],
  ['#62c66c', '#349649', '#164f26'],
  ['#acd84c', '#77a72c', '#3a5614'],
  ['#55c290', '#26926b', '#0e5038'],
  ['#7ccb58', '#4b9a36', '#1d531c'],
  ['#98de70', '#5aad46', '#225d21'],
  ['#60bd5c', '#378c3d', '#16491c'],
  ['#bcdd5e', '#84aa37', '#425f17'],
];

// Silhouet: eerst alles dik in de randkleur, dan de vulling erover. Zo krijgen kop, lijf
// en poten samen één buitenrand, zonder naden ertussen.
const POTEN = `
  <path d="M14 88 C6 89 1 93 3 96 C8 97.5 20 97 26 94 Z"/>
  <path d="M86 88 C94 89 99 93 97 96 C92 97.5 80 97 74 94 Z"/>
  <path d="M32 70 C16 66 6 76 9 86 C12 94 28 95 36 88 Z"/>
  <path d="M68 70 C84 66 94 76 91 86 C88 94 72 95 64 88 Z"/>`;
const LIJF = `
  <path d="M50 42 C30 42 22 62 26 80 C29 92 40 96 50 96 C60 96 71 92 74 80 C78 62 70 42 50 42 Z"/>
  <ellipse cx="50" cy="47" rx="31" ry="20"/>
  <circle cx="34" cy="30" r="12"/>
  <circle cx="66" cy="30" r="12"/>`;
const HANDEN = `
  <circle cx="39" cy="90" r="5"/><circle cx="34.5" cy="93.5" r="2.7"/><circle cx="39" cy="95.6" r="2.7"/><circle cx="43.5" cy="94" r="2.7"/>
  <circle cx="61" cy="90" r="5"/><circle cx="56.5" cy="94" r="2.7"/><circle cx="61" cy="95.6" r="2.7"/><circle cx="65.5" cy="93.5" r="2.7"/>`;

export function kikkerSvg(n: number, houding: 0 | 1 | 2 | 3): string {
  const [huid, schaduw, rand] = HUIDEN[n % HUIDEN.length];
  const kijkX = houding === 2 ? -2 : houding === 0 ? 1.8 : 0;
  const kijkY = houding === 3 ? -2 : houding === 1 ? 1.6 : 0.4;
  const oog = (x: number) => `
    <circle cx="${x}" cy="29" r="8.6" fill="#fff"/>
    <circle cx="${x + kijkX}" cy="${29 + kijkY}" r="4.9" fill="#1d1d1d"/>
    <circle cx="${x + kijkX + 1.9}" cy="${29 + kijkY - 2}" r="1.9" fill="#fff"/>
    <circle cx="${x + kijkX - 1.6}" cy="${29 + kijkY + 2}" r="0.9" fill="#fff" opacity="0.8"/>
    <circle class="kk-knipper" cx="${x}" cy="29" r="9" fill="${huid}"/>`;
  return `
<svg viewBox="0 0 100 100" aria-hidden="true">
  <g class="kk-lijf">
    <g fill="${rand}" stroke="${rand}" stroke-width="5" stroke-linejoin="round">${POTEN}${LIJF}</g>
    <g fill="${schaduw}">${POTEN}</g>
    <g fill="${huid}">${LIJF}</g>
    <ellipse cx="40" cy="37" rx="11" ry="4" fill="#fff" opacity="0.28"/>
    <ellipse cx="24" cy="80" rx="5" ry="3.4" fill="${schaduw}" opacity="0.8"/>
    <ellipse cx="78" cy="84" rx="4" ry="2.8" fill="${schaduw}" opacity="0.8"/>
    <ellipse cx="50" cy="31" rx="3.6" ry="2.4" fill="${schaduw}" opacity="0.7"/>
    <ellipse cx="50" cy="80" rx="16" ry="14" fill="#f3f8c8"/>
    ${oog(34)}${oog(66)}
    <ellipse cx="25" cy="55" rx="4.6" ry="2.7" fill="#ff8fa8" opacity="0.6"/>
    <ellipse cx="75" cy="55" rx="4.6" ry="2.7" fill="#ff8fa8" opacity="0.6"/>
    <circle cx="46" cy="42" r="1.2" fill="${rand}"/>
    <circle cx="54" cy="42" r="1.2" fill="${rand}"/>
    <g class="kk-keel">
      <ellipse cx="50" cy="65" rx="14" ry="10.5" fill="#fbeaa8" stroke="${rand}" stroke-width="1.8"/>
      <ellipse cx="44.5" cy="61" rx="4.4" ry="2.6" fill="#fff" opacity="0.75"/>
    </g>
    <path class="kk-mond" d="M27 52 Q50 66 73 52" fill="none" stroke="${rand}" stroke-width="2.8" stroke-linecap="round"/>
    <g fill="${rand}" stroke="${rand}" stroke-width="3.2">${HANDEN}</g>
    <g fill="${huid}">${HANDEN}</g>
  </g>
</svg>`;
}

// Muzieknootje dat bij een kwaak omhoog zweeft, in de kleur van het blad (currentColor).
const NOOT_VORM = `
  <rect x="12.5" y="6" width="4" height="26"/>
  <path d="M12.5 6 L28 1.5 V10 L16.5 13.5 Z"/>
  <ellipse cx="9" cy="31.5" rx="7.5" ry="5.8" transform="rotate(-18 9 31.5)"/>`;
export const NOOT = `
<svg viewBox="-3 -2 36 44" aria-hidden="true">
  <g fill="#fff" stroke="#fff" stroke-width="5" stroke-linejoin="round">${NOOT_VORM}</g>
  <g fill="currentColor">${NOOT_VORM}</g>
</svg>`;
