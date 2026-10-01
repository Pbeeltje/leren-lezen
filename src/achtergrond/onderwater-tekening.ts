// Zelf getekende onderwaterdieren en -dingen (inline SVG), los van onderwater.ts zodat de
// logica daar overzichtelijk blijft. Dieren kijken naar links, net als de Fluent-vissen;
// naar rechts zwemmen = de houder spiegelen. Onderdelen die bewegen hebben een eigen klasse
// (ow-...), de animaties staan in styles/achtergrond-onderwater.css.

// Rif in de verte: twee lagen heuvelige rotsen, van wazig lichtblauw naar wat donkerder.
export const RIF_VER = `
<svg viewBox="0 0 1000 300" preserveAspectRatio="none" aria-hidden="true">
  <path d="M0 300 L0 170 C40 150 70 118 110 128 C140 136 150 98 185 94 C215 92 228 140 262 150 C300 160 330 118 370 132 C400 144 420 178 470 174 C520 170 540 136 582 146 C622 156 642 116 690 108 C730 102 752 150 792 154 C832 158 860 112 902 118 C942 124 962 158 1000 148 L1000 300 Z" fill="#2f93c2"/>
</svg>`;

export const RIF_MIDDEN = `
<svg viewBox="0 0 1000 300" preserveAspectRatio="none" aria-hidden="true">
  <path d="M0 300 L0 196 C26 176 52 150 84 160 C110 168 118 196 150 198 C186 200 196 168 232 170 C262 172 270 206 312 214 C360 222 400 206 440 214 C490 224 530 210 570 214 C610 218 640 196 672 194 C700 192 712 162 742 158 C772 154 786 186 820 190 C856 194 872 160 908 150 C944 140 966 176 1000 172 L1000 300 Z" fill="#1d73a5"/>
</svg>`;

// Rotsen waar het koraal op groeit (links en rechts op de bodem), met wat korstkoraal.
export const ROTS = `
<svg viewBox="0 0 300 120" aria-hidden="true">
  <defs>
    <linearGradient id="ow-rots" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#7d86c4"/>
      <stop offset="1" stop-color="#4c5a92"/>
    </linearGradient>
  </defs>
  <path d="M0 120 C0 84 20 60 54 58 C70 30 112 22 140 40 C164 20 214 24 232 52 C268 50 300 80 300 120 Z" fill="url(#ow-rots)"/>
  <path d="M30 74 C44 64 60 62 74 66 M110 42 C126 34 146 36 158 46 M206 50 C220 44 236 48 246 58" fill="none" stroke="#a7b0e6" stroke-width="5" stroke-linecap="round"/>
  <path d="M0 120 C10 104 40 96 80 100 C130 104 160 92 210 96 C250 100 280 106 300 120 Z" fill="#414d80"/>
  <g fill="#ff9ec4"><circle cx="86" cy="80" r="5"/><circle cx="96" cy="86" r="3.5"/><circle cx="78" cy="88" r="3"/></g>
  <g fill="#ffd36e"><circle cx="190" cy="70" r="4.5"/><circle cx="200" cy="64" r="3"/><circle cx="182" cy="62" r="2.5"/></g>
  <g fill="#7fe0c4"><circle cx="252" cy="88" r="4"/><circle cx="40" cy="96" r="3.5"/><circle cx="140" cy="70" r="3"/></g>
</svg>`;

// Silhouetten van koraal (tak- en bloemkoolkoraal) en wier in de verte, op de middelste rifrand.
export const verKoraal = (kleur: string): string => `
<svg viewBox="0 0 160 150" aria-hidden="true">
  <g fill="none" stroke="${kleur}" stroke-width="13" stroke-linecap="round">
    <path d="M80 150 V86 C80 62 64 52 52 30"/><path d="M80 104 C96 84 112 76 118 50"/>
    <path d="M66 70 C56 64 42 66 32 56"/><path d="M110 74 C122 72 134 64 138 40"/>
  </g>
</svg>`;
export const verWaaier = (kleur: string): string => `
<svg viewBox="0 0 140 110" aria-hidden="true">
  <g fill="${kleur}">
    <path d="M30 110 C34 80 50 70 70 70 C90 70 106 80 110 110 Z"/>
    <circle cx="40" cy="70" r="20"/><circle cx="70" cy="52" r="26"/><circle cx="102" cy="68" r="22"/>
    <circle cx="52" cy="38" r="14"/><circle cx="90" cy="40" r="15"/><circle cx="20" cy="88" r="14"/><circle cx="122" cy="90" r="13"/>
  </g>
</svg>`;
export const verWier = (kleur: string): string => `
<svg viewBox="0 0 80 220" aria-hidden="true">
  <path d="M28 220 C14 180 40 150 24 110 C10 74 36 44 26 6 C44 40 30 74 42 108 C56 148 32 182 44 220 Z M46 220 C60 186 44 160 58 128 C70 100 56 78 66 54 C78 84 70 104 74 130 C78 166 62 190 62 220 Z" fill="${kleur}"/>
</svg>`;

/** Lange kelp, een stengel met blaadjes om en om. */
export const kelp = (stengel: string, blad: string): string => {
  const punten = [
    [31, 272], [27, 236], [33, 200], [29, 164], [27, 128], [33, 92], [30, 56], [30, 24],
  ];
  const bladen = punten
    .map(([x, y], i) => {
      const k = i % 2 === 0 ? 1 : -1;
      return `<path d="M${x} ${y} C${x + 6 * k} ${y - 14} ${x + 20 * k} ${y - 26} ${x + 27 * k} ${y - 30} C${x + 24 * k} ${y - 16} ${x + 12 * k} ${y - 4} ${x} ${y} Z"/>`;
    })
    .join('');
  return `
<svg viewBox="0 0 60 300" aria-hidden="true">
  <path d="M31 300 C24 240 38 190 28 140 C20 96 36 52 30 4" fill="none" stroke="${stengel}" stroke-width="4.5" stroke-linecap="round"/>
  <g fill="${blad}">${bladen}</g>
  <ellipse cx="30" cy="6" rx="5" ry="6" fill="${blad}"/>
</svg>`;
};

// Hersenkoraal: een dikke koepel met kronkelgroeven.
export const BREINKORAAL = `
<svg viewBox="0 0 120 72" aria-hidden="true">
  <path d="M4 72 C4 34 30 10 60 10 C90 10 116 34 116 72 Z" fill="#f2a54a" stroke="#c9772a" stroke-width="2.5"/>
  <path d="M18 40 C28 24 44 16 60 16" fill="none" stroke="#ffd59a" stroke-width="5" stroke-linecap="round" opacity="0.7"/>
  <g fill="none" stroke="#c9772a" stroke-width="3" stroke-linecap="round">
    <path d="M16 66 C18 54 28 56 30 46 C32 36 42 38 46 30"/>
    <path d="M36 68 C38 58 48 60 50 50 C52 42 60 44 62 34 C64 28 72 30 74 24"/>
    <path d="M58 68 C60 60 70 62 72 52 C74 44 84 48 86 40 C88 34 94 36 96 32"/>
    <path d="M80 68 C82 60 92 62 96 54 C98 50 104 52 106 48"/>
  </g>
</svg>`;

// Waaierkoraal: een fijn vertakte waaier. Wiegt heel zacht (ow-waaier).
export const WAAIERKORAAL = `
<svg viewBox="0 0 140 150" aria-hidden="true">
  <path d="M70 142 C40 122 4 88 10 44 C26 8 114 8 130 44 C136 88 100 122 70 142 Z" fill="#ff7aa2" opacity="0.28"/>
  <g fill="none" stroke="#d94a7e" stroke-linecap="round">
    <path d="M70 150 C70 130 68 118 70 100" stroke-width="6"/>
    <g stroke-width="3.5">
      <path d="M70 100 C56 80 36 64 20 40"/>
      <path d="M70 100 C64 74 56 48 50 20"/>
      <path d="M70 100 C74 72 84 46 92 18"/>
      <path d="M70 100 C86 82 106 66 122 42"/>
    </g>
    <g stroke-width="2.4">
      <path d="M44 68 C34 62 24 62 14 58"/>
      <path d="M58 62 C52 48 40 40 34 26"/>
      <path d="M62 44 C64 34 66 24 70 12"/>
      <path d="M84 58 C92 46 104 36 112 26"/>
      <path d="M98 78 C108 74 118 72 128 64"/>
      <path d="M32 54 C26 46 22 40 22 30"/>
      <path d="M106 64 C112 56 120 52 130 50"/>
    </g>
  </g>
  <g fill="#ff9dbd">
    <circle cx="20" cy="40" r="3.5"/><circle cx="50" cy="20" r="3.5"/><circle cx="92" cy="18" r="3.5"/>
    <circle cx="122" cy="42" r="3.5"/><circle cx="14" cy="58" r="3"/><circle cx="34" cy="26" r="3"/>
    <circle cx="70" cy="12" r="3"/><circle cx="112" cy="26" r="3"/><circle cx="128" cy="64" r="3"/>
  </g>
</svg>`;

/** Takkoraal (zoals het oude roze koraal), in een kleur naar keuze. */
export const takkoraal = (kleur: string, punt: string): string => `
<svg viewBox="0 0 160 150" aria-hidden="true">
  <g fill="none" stroke="${kleur}" stroke-width="13" stroke-linecap="round">
    <path d="M80 150 V86 C80 62 64 52 52 30"/>
    <path d="M80 104 C96 84 112 76 118 50"/>
    <path d="M66 70 C56 64 42 66 32 56"/>
    <path d="M110 74 C122 72 134 64 138 40"/>
    <path d="M52 30 C50 22 52 14 58 8"/>
  </g>
  <g fill="${punt}">
    <circle cx="58" cy="8" r="7"/><circle cx="118" cy="48" r="7"/><circle cx="32" cy="56" r="7"/><circle cx="138" cy="38" r="7"/>
  </g>
</svg>`;

// Buissponzen: drie paarse buizen met een donker gat bovenin.
export const BUISSPONS = `
<svg viewBox="0 0 90 110" aria-hidden="true">
  <g stroke="#5b3596" stroke-width="2.5">
    <path d="M36 110 C34 80 32 40 37 10 C44 6 56 6 62 10 C66 44 64 80 62 110 Z" fill="#a374e8"/>
    <path d="M6 110 C6 86 6 60 12 34 C18 30 30 30 36 34 C38 62 38 88 38 110 Z" fill="#8e5cd9"/>
    <path d="M58 110 C58 92 58 68 62 48 C68 44 80 44 85 48 C88 70 86 92 86 110 Z" fill="#7b4cc8"/>
  </g>
  <ellipse cx="49.5" cy="10" rx="11" ry="3.6" fill="#3b2066"/>
  <ellipse cx="24" cy="34" rx="10.5" ry="3.4" fill="#3b2066"/>
  <ellipse cx="73.5" cy="48" rx="10" ry="3.2" fill="#3b2066"/>
  <path d="M42 30 C41 50 41 70 42 90 M16 52 C15 66 15 80 16 94" fill="none" stroke="#c9a6ff" stroke-width="3" stroke-linecap="round" opacity="0.7"/>
</svg>`;

// Zeester met stipjes.
export const ZEESTER = `
<svg viewBox="0 0 60 60" aria-hidden="true">
  <path d="M30 5 L36.5 23.1 L55.7 23.7 L40.5 35.4 L45.9 53.8 L30 43 L14.1 53.8 L19.5 35.4 L4.3 23.7 L23.5 23.1 Z" fill="#ff8c42" stroke="#ff8c42" stroke-width="7" stroke-linejoin="round"/>
  <path d="M30 5 L36.5 23.1 L55.7 23.7 L40.5 35.4 L45.9 53.8 L30 43 L14.1 53.8 L19.5 35.4 L4.3 23.7 L23.5 23.1 Z" fill="none" stroke="#d9652a" stroke-width="1.5" stroke-linejoin="round" transform="translate(30 31) scale(1.13) translate(-30 -31)"/>
  <g fill="#ffd2a6">
    <circle cx="30" cy="31" r="3"/><circle cx="30" cy="18" r="2"/><circle cx="42" cy="27" r="2"/>
    <circle cx="38" cy="41" r="2"/><circle cx="22" cy="41" r="2"/><circle cx="18" cy="27" r="2"/>
  </g>
</svg>`;

// Schatkist, half in het zand. Het deksel (ow-deksel) kan op een kiertje open; dan zie je
// het goud en een glinstering (ow-glans).
export const SCHATKIST = `
<svg viewBox="0 0 120 100" aria-hidden="true" overflow="visible">
  <g transform="rotate(-4 60 70)">
    <path d="M16 48 C30 34 90 34 104 48 Z" fill="#ffd34d" stroke="#d99a1a" stroke-width="2"/>
    <circle cx="44" cy="42" r="5" fill="#ffe27a" stroke="#d99a1a" stroke-width="1.5"/>
    <circle cx="70" cy="40" r="5" fill="#ffe27a" stroke="#d99a1a" stroke-width="1.5"/>
    <rect x="10" y="46" width="100" height="46" rx="4" fill="#9a5b2c" stroke="#5e3517" stroke-width="3"/>
    <path d="M12 62 H108 M12 77 H108" stroke="#7a4420" stroke-width="2"/>
    <rect x="20" y="46" width="9" height="46" fill="#d9a640" stroke="#8a6116" stroke-width="2"/>
    <rect x="91" y="46" width="9" height="46" fill="#d9a640" stroke="#8a6116" stroke-width="2"/>
    <rect x="52" y="52" width="16" height="18" rx="3" fill="#d9a640" stroke="#8a6116" stroke-width="2"/>
    <circle cx="60" cy="60" r="2.6" fill="#5e3517"/>
    <g class="ow-deksel">
      <path d="M10 48 C10 22 110 22 110 48 Z" fill="#a8652f" stroke="#5e3517" stroke-width="3" stroke-linejoin="round"/>
      <path d="M20 47 C20 31 29 29 29 29 L29 47 Z M91 47 L91 29 C91 29 100 31 100 47 Z" fill="#d9a640" stroke="#8a6116" stroke-width="2"/>
      <path d="M24 34 C40 28 80 28 96 34" fill="none" stroke="#c98446" stroke-width="3" stroke-linecap="round"/>
    </g>
    <path class="ow-glans" d="M44 38 L47 30 L50 38 L58 41 L50 44 L47 52 L44 44 L36 41 Z" fill="#fffbe0"/>
  </g>
  <path d="M-6 100 C14 84 40 82 60 86 C82 82 106 84 126 100 Z" fill="#ecc98b"/>
</svg>`;

// Anker, schuin in het zand.
export const ANKER = `
<svg viewBox="0 0 100 124" aria-hidden="true">
  <g fill="none" stroke="#5c6974" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="50" cy="12" r="8" stroke-width="6"/>
    <path d="M28 28 H72" stroke-width="8"/>
    <path d="M50 20 V108" stroke-width="9"/>
    <path d="M14 76 C16 100 36 112 50 112 C64 112 84 100 86 76" stroke-width="8"/>
  </g>
  <path d="M6 82 L14 64 L24 80 Z M94 82 L86 64 L76 80 Z" fill="#5c6974" stroke="#5c6974" stroke-width="4" stroke-linejoin="round"/>
  <path d="M47 30 V100 M30 26 H48" fill="none" stroke="#8d9ba6" stroke-width="2.5" stroke-linecap="round"/>
  <g fill="#3f8f5c"><circle cx="44" cy="70" r="3"/><circle cx="56" cy="84" r="2.5"/><circle cx="22" cy="92" r="2.5"/></g>
</svg>`;

// Octopus op de bodem: vier armen (ow-arm) die los krullen en ogen (ow-ogen) die knipperen.
export const OCTOPUS = `
<svg viewBox="0 0 140 120" aria-hidden="true" overflow="visible">
  <defs>
    <linearGradient id="ow-octo" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ff8f7e"/>
      <stop offset="1" stop-color="#e65a6c"/>
    </linearGradient>
  </defs>
  <g fill="none" stroke="#ec6a72" stroke-width="12" stroke-linecap="round">
    <path class="ow-arm ow-arm--1" d="M48 66 C34 72 22 84 16 98 C12 108 22 112 26 104"/>
    <path class="ow-arm ow-arm--2" d="M60 72 C54 86 50 100 54 110 C56 116 64 114 62 108"/>
    <path class="ow-arm ow-arm--3" d="M82 72 C88 86 92 100 88 110 C86 116 78 114 80 108"/>
    <path class="ow-arm ow-arm--4" d="M94 66 C108 72 120 84 126 98 C130 108 120 112 116 104"/>
  </g>
  <path d="M38 74 C30 34 48 8 72 8 C96 8 114 34 106 74 C94 80 50 80 38 74 Z" fill="url(#ow-octo)" stroke="#c94457" stroke-width="2.5"/>
  <ellipse cx="62" cy="24" rx="10" ry="6" fill="#ffc2b6" opacity="0.7" transform="rotate(-20 62 24)"/>
  <g class="ow-ogen">
    <ellipse cx="60" cy="52" rx="8" ry="9" fill="#fff"/><ellipse cx="86" cy="52" rx="8" ry="9" fill="#fff"/>
    <circle cx="58" cy="53" r="4.5" fill="#1d2b3a"/><circle cx="84" cy="53" r="4.5" fill="#1d2b3a"/>
    <circle cx="56.5" cy="51" r="1.6" fill="#fff"/><circle cx="82.5" cy="51" r="1.6" fill="#fff"/>
  </g>
  <circle cx="50" cy="64" r="4" fill="#ff9aa2" opacity="0.8"/><circle cx="96" cy="64" r="4" fill="#ff9aa2" opacity="0.8"/>
  <path d="M66 66 C70 70 76 70 80 66" fill="none" stroke="#7a2235" stroke-width="2.5" stroke-linecap="round"/>
</svg>`;

// Kwal: een kloppend hoedje (ow-hoed) met golvende armen (ow-armen).
export const KWAL = `
<svg viewBox="0 0 80 140" aria-hidden="true" overflow="visible">
  <defs>
    <linearGradient id="ow-kwal" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffc4ec"/>
      <stop offset="1" stop-color="#c79bff"/>
    </linearGradient>
  </defs>
  <g class="ow-kwal-armen" fill="none" stroke-linecap="round">
    <path d="M32 44 C26 62 38 78 30 96 C24 110 34 122 28 134" stroke="#f29ad8" stroke-width="5" opacity="0.85"/>
    <path d="M48 44 C54 62 42 80 50 98 C56 112 46 124 52 136" stroke="#e48ee0" stroke-width="5" opacity="0.85"/>
    <g stroke="#ffe0f6" stroke-width="1.8" opacity="0.8">
      <path d="M14 44 C12 64 18 84 12 106"/>
      <path d="M24 46 C22 68 28 88 22 114"/>
      <path d="M58 46 C60 68 54 88 58 114"/>
      <path d="M66 44 C68 64 62 84 68 106"/>
    </g>
  </g>
  <g class="ow-hoed">
    <path d="M6 44 C6 18 22 4 40 4 C58 4 74 18 74 44 C68 48 62 44 56 48 C50 44 46 48 40 46 C34 48 30 44 24 48 C18 44 12 48 6 44 Z" fill="url(#ow-kwal)" stroke="#ffffff" stroke-opacity="0.6" stroke-width="2"/>
    <path d="M18 30 C20 18 30 10 40 10" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.6"/>
    <circle cx="32" cy="30" r="2.6" fill="#7a3d8f"/><circle cx="48" cy="30" r="2.6" fill="#7a3d8f"/>
    <path d="M35 37 C38 40 42 40 45 37" fill="none" stroke="#7a3d8f" stroke-width="2" stroke-linecap="round"/>
  </g>
</svg>`;

// Zeeschildpad van opzij (kijkt naar links). De voorste vin (ow-vin--voor), de vin erachter
// (ow-vin--ver) en de achtervin (ow-vin--achter) roeien los, zoals de pteranodon vleugelt.
export const SCHILDPAD = `
<svg viewBox="0 0 200 124" aria-hidden="true" overflow="visible">
  <defs>
    <linearGradient id="ow-schild" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#6dbb6a"/>
      <stop offset="1" stop-color="#3f8248"/>
    </linearGradient>
  </defs>
  <g stroke="#2b5a33" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">
    <path class="ow-vin ow-vin--ver" d="M80 66 C72 54 58 42 40 34 C50 46 60 58 70 72 Z" fill="#7fb860"/>
    <path class="ow-vin ow-vin--achter" d="M150 74 C162 80 174 86 186 98 C170 98 156 92 144 82 Z" fill="#8cc46b"/>
    <ellipse cx="102" cy="70" rx="58" ry="20" fill="#eedfa6"/>
    <path d="M60 78 H146 M70 86 H136" fill="none" stroke="#c9b67a" stroke-width="2"/>
    <path d="M42 70 C46 32 78 18 104 18 C134 18 160 36 164 70 C130 78 76 78 42 70 Z" fill="url(#ow-schild)"/>
    <path d="M72 30 L84 46 L70 64 M84 46 H122 M122 46 L136 30 M122 46 L138 66 M104 20 V46 M84 46 L100 70 M122 46 L104 70" fill="none" stroke="#9fdc93" stroke-width="2.4"/>
    <path d="M42 70 C76 78 130 78 164 70" fill="none" stroke="#2b5a33" stroke-width="3"/>
    <path d="M50 68 C42 66 36 64 28 66 C14 68 6 60 8 52 C10 42 22 38 32 42 C40 46 46 54 54 60 Z" fill="#a5d47f"/>
    <g fill="#7fb35c" stroke="none"><circle cx="24" cy="46" r="2.6"/><circle cx="34" cy="50" r="2.2"/><circle cx="18" cy="56" r="2"/></g>
    <path class="ow-vin ow-vin--voor" d="M66 72 C56 88 42 102 22 114 C42 114 64 102 80 84 Z" fill="#9ccf78"/>
  </g>
  <circle cx="18" cy="50" r="4" fill="#fff"/><circle cx="17" cy="50.5" r="2.5" fill="#1d2b3a"/>
  <circle cx="16.4" cy="49.4" r="0.9" fill="#fff"/>
  <path d="M8 58 C12 61 16 61 20 59" fill="none" stroke="#2b5a33" stroke-width="2" stroke-linecap="round"/>
</svg>`;

// Klein schoolvisje (zilverblauw met een gele streep); de staart (ow-staart) kwispelt.
export const SCHOOLVIS = `
<svg viewBox="0 0 62 30" aria-hidden="true" overflow="visible">
  <path class="ow-staart" d="M47 15 L60 5 C58 12 58 18 60 25 Z" fill="#3a86c8"/>
  <path d="M3 15 C9 6 26 3 38 8 C44 10 48 13 50 15 C48 17 44 20 38 22 C26 27 9 24 3 15 Z" fill="#8fd3f5" stroke="#2f6fa8" stroke-width="1.5"/>
  <path d="M8 13 C18 7 32 6 44 12" fill="none" stroke="#3a86c8" stroke-width="4" stroke-linecap="round" opacity="0.7"/>
  <path d="M10 16 C20 14 34 14 46 15.5" fill="none" stroke="#ffd84a" stroke-width="2.4" stroke-linecap="round"/>
  <circle cx="11" cy="13" r="2.6" fill="#fff"/><circle cx="10.4" cy="13.2" r="1.5" fill="#1d2b3a"/>
</svg>`;

// Verre silhouetten (heel af en toe, wazig achter de stralen): een manta en een walvis.
export const MANTA = `
<svg viewBox="0 0 200 100" aria-hidden="true" overflow="visible">
  <g fill="#0d5687">
    <path class="ow-vleugel ow-vleugel--boven" d="M48 46 C70 30 100 8 132 3 C122 20 120 34 134 47 Z"/>
    <path class="ow-vleugel ow-vleugel--onder" d="M48 54 C70 70 100 92 132 97 C122 80 120 66 134 53 Z"/>
    <path d="M30 50 C30 42 50 36 80 38 C120 40 140 46 152 50 C140 54 120 60 80 62 C50 64 30 58 30 50 Z"/>
  </g>
  <path d="M33 46 C24 44 20 40 21 35 M33 54 C24 56 20 60 21 65 M150 50 H198" fill="none" stroke="#0d5687" stroke-width="3" stroke-linecap="round"/>
</svg>`;

export const WALVIS = `
<svg viewBox="0 0 300 112" aria-hidden="true" overflow="visible">
  <g fill="#0d5687">
    <path class="ow-walvis-staart" d="M262 54 C274 40 286 32 299 28 C293 42 290 50 292 56 C290 62 293 72 299 84 C286 80 274 70 262 60 Z"/>
    <path d="M10 56 C14 36 50 26 100 28 C160 30 210 40 250 50 C260 53 268 55 276 55 L276 59 C250 66 200 82 140 84 C80 86 30 78 14 66 C10 62 10 58 10 56 Z"/>
    <path d="M86 74 C98 92 120 104 142 106 C132 94 118 84 110 74 Z"/>
  </g>
  <path d="M14 62 C36 66 60 66 80 62" fill="none" stroke="#3a8ec0" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
  <circle cx="44" cy="52" r="2.5" fill="#3a8ec0"/>
</svg>`;

// Lichtnetje (caustics) voor op het zand: een tegel die naadloos herhaalt.
export const KAUSTIEK = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="80" viewBox="0 0 160 80"><path d="M0 20 C20 10 40 30 60 18 C80 6 100 28 120 16 C140 6 150 22 160 20 M0 60 C24 50 44 70 70 58 C96 46 116 68 140 56 C150 52 156 60 160 60 M20 0 C26 20 14 40 24 60 C30 72 22 76 20 80 M80 0 C88 18 72 36 84 56 C90 68 78 74 80 80 M130 0 C124 24 140 40 128 62 C124 70 132 76 130 80" fill="none" stroke="#fffbe6" stroke-width="2.2" stroke-linecap="round"/></svg>`;

// Wateroppervlak bovenaan: golvende lichtlijntjes, ook naadloos.
export const OPPERVLAK = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="40" viewBox="0 0 240 40"><path d="M0 12 C30 4 50 20 80 12 C110 4 130 20 160 12 C190 4 210 20 240 12 M0 28 C20 22 40 34 60 28 C80 22 100 34 120 28 C140 22 160 34 180 28 C200 22 220 34 240 28" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/></svg>`;
