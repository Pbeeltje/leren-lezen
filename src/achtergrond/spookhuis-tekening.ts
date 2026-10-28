import { vasteToeval } from './tekenhulp.ts';

// Eigen tekeningen voor het spookhuis: het huis (naar een poppenhuis-spookhuis met een
// mansardedak, drie dakkapellen, een balkonrand en houten zuilen), de kromme boom met
// mos en een schommel, de volle maan en een vleermuisje.

const HOUT = '#a5603a';
const HOUT_LICHT = '#cf8752';
const HOUT_DONKER = '#5e3320';
const MUUR = '#4a5283';
const MUUR_DONKER = '#2d3358';
const DAK = '#3f6f63';
const DAK_DONKER = '#294f45';
const DAK_LICHT = '#6a9d8c';
const LOPER = '#c0363f';
const LICHT = 'url(#sh-raamlicht)';
const DONKER = '#1b1733';

// De muur loopt schuin uit (smal boven, breed onder), net als het dak.
const muurL = (y: number) => 70 - (22 * (y - 182)) / 250;
const dakL = (y: number) => 100 - (60 * (y - 62)) / 110;

function dakpannen(): string {
  let d = '';
  for (let y = 72; y <= 166; y += 9) {
    const l = dakL(y);
    const r = 400 - l;
    d += `M${l.toFixed(1)} ${y}`;
    const stap = (r - l) / Math.round((r - l) / 12);
    for (let x = l; x < r - 1; x += stap) d += ` a${(stap / 2).toFixed(2)} 5 0 0 0 ${stap.toFixed(2)} 0`;
  }
  return `<path d="${d}" fill="none" stroke="${DAK_DONKER}" stroke-width="1.6" opacity="0.8"/>`;
}

function planken(): string {
  let d = '';
  for (let y = 196; y < 430; y += 11) d += `M${muurL(y).toFixed(1)} ${y} H${(400 - muurL(y)).toFixed(1)} `;
  return `<path d="${d}" stroke="${MUUR_DONKER}" stroke-width="1.2" opacity="0.55"/>`;
}

function dakkapel(cx: number, licht: boolean): string {
  const raam = `M${cx - 11} 158 V126 A11 11 0 0 1 ${cx + 11} 126 V158 Z`;
  return `
  <g>
    <rect x="${cx - 21}" y="112" width="42" height="50" fill="${MUUR_DONKER}"/>
    <path d="${raam}" fill="${licht ? LICHT : DONKER}" class="${licht ? 'sh-raamlicht' : ''}"/>
    ${licht ? `<path d="M${cx} 116 V158 M${cx - 11} 138 H${cx + 11}" stroke="${HOUT_DONKER}" stroke-width="2.2"/>` : ''}
    <path d="${raam}" fill="none" stroke="${HOUT_DONKER}" stroke-width="3"/>
    <path d="M${cx - 29} 118 Q${cx - 25} 90 ${cx} 74 Q${cx + 25} 90 ${cx + 29} 118 L${cx + 22} 118 Q${cx + 19} 96 ${cx} 84 Q${cx - 19} 96 ${cx - 22} 118 Z" fill="${DAK_DONKER}"/>
    <path d="M${cx - 29} 118 Q${cx - 25} 90 ${cx} 74 Q${cx + 25} 90 ${cx + 29} 118" fill="none" stroke="${DAK_LICHT}" stroke-width="1.6" opacity="0.7"/>
  </g>`;
}

// Een raam met kozijn, kruis en (als het een eigen inhoud heeft) een clip-pad.
function raam(x: number, y: number, b: number, h: number, inhoud = '', klem = ''): string {
  return `
  <g>
    <rect x="${x - 5}" y="${y - 5}" width="${b + 10}" height="${h + 10}" rx="2" fill="${HOUT_DONKER}"/>
    <rect x="${x}" y="${y}" width="${b}" height="${h}" fill="${LICHT}" class="sh-raamlicht"/>
    ${klem ? `<g clip-path="url(#${klem})">${inhoud}</g>` : inhoud}
    <path d="M${x + b / 2} ${y} V${y + h} M${x} ${y + h * 0.45} H${x + b}" stroke="${HOUT_DONKER}" stroke-width="3"/>
    <path d="M${x} ${y} q${b * 0.18} ${h * 0.35} 0 ${h} Z M${x + b} ${y} q${-b * 0.18} ${h * 0.35} 0 ${h} Z" fill="#7d4f9e" opacity="0.85"/>
    <rect x="${x - 8}" y="${y + h + 4}" width="${b + 16}" height="5" rx="2" fill="${HOUT}"/>
  </g>`;
}

// Gedraaide houten zuil (zoals de pilaren in het voorbeeld).
function zuil(cx: number, boven: number, onder: number): string {
  const lijf = `<rect x="${cx - 4.5}" y="${boven}" width="9" height="${onder - boven}" fill="${HOUT}"/>`;
  const bol = (y: number, rx: number, ry: number) =>
    `<ellipse cx="${cx}" cy="${y}" rx="${rx}" ry="${ry}" fill="${HOUT}"/><ellipse cx="${cx - rx * 0.35}" cy="${y - ry * 0.2}" rx="${rx * 0.35}" ry="${ry * 0.6}" fill="${HOUT_LICHT}" opacity="0.6"/>`;
  return `<g>${lijf}<rect x="${cx - 2.5}" y="${boven}" width="2" height="${onder - boven}" fill="${HOUT_LICHT}" opacity="0.5"/>
    ${bol(boven + 6, 9, 6)}${bol(boven + 40, 8, 12)}${bol((boven + onder) / 2, 7, 9)}${bol(onder - 40, 8, 12)}${bol(onder - 6, 10, 6)}</g>`;
}

function klimop(): string {
  const r = vasteToeval(41);
  const rank = (punten: [number, number][]) => {
    let d = `M${punten[0][0]} ${punten[0][1]}`;
    for (const [x, y] of punten.slice(1)) d += ` L${x} ${y}`;
    let blad = '';
    for (let i = 0; i < punten.length - 1; i++) {
      for (let t = 0.2; t < 1; t += 0.35) {
        const x = punten[i][0] + (punten[i + 1][0] - punten[i][0]) * t;
        const y = punten[i][1] + (punten[i + 1][1] - punten[i][1]) * t;
        const kant = r() < 0.5 ? -1 : 1;
        blad += `<ellipse cx="${(x + kant * 4).toFixed(1)}" cy="${y.toFixed(1)}" rx="4" ry="2.6" fill="${r() < 0.5 ? '#4f8a4a' : '#6aa95a'}" transform="rotate(${(kant * 35).toFixed(0)} ${(x + kant * 4).toFixed(1)} ${y.toFixed(1)})"/>`;
      }
    }
    return `<path d="${d}" fill="none" stroke="#3d6b3a" stroke-width="1.6"/>${blad}`;
  };
  return rank([[44, 176], [50, 196], [47, 222], [53, 248], [50, 268]])
    + rank([[104, 66], [96, 86], [90, 104], [82, 124]])
    + rank([[356, 176], [349, 200], [352, 226], [346, 246]]);
}

function spinnenweb(x: number, y: number, r: number): string {
  let d = '';
  for (let h = 0; h <= 90; h += 22.5) {
    const a = (h * Math.PI) / 180;
    d += `M${x} ${y} L${(x + Math.cos(a) * r).toFixed(1)} ${(y + Math.sin(a) * r).toFixed(1)} `;
  }
  for (const f of [0.35, 0.65, 0.95]) {
    d += `M${x + r * f} ${y}`;
    for (let h = 22.5; h <= 90; h += 22.5) {
      const a = (h * Math.PI) / 180;
      d += ` Q${(x + Math.cos(a - 0.2) * r * f * 0.8).toFixed(1)} ${(y + Math.sin(a - 0.2) * r * f * 0.8).toFixed(1)} ${(x + Math.cos(a) * r * f).toFixed(1)} ${(y + Math.sin(a) * r * f).toFixed(1)}`;
    }
  }
  return `<path d="${d}" fill="none" stroke="#f4f0ff" stroke-width="0.9" opacity="0.75"/>`;
}

// Klein wit spookje als silhouet achter een raam (in de kamer).
const RAAMSPOOK = `<g class="sh-raamspook"><path d="M0 26 C0 6 8 0 14 0 C20 0 28 6 28 26 L24 22 L20 27 L14 22 L8 27 L4 22 Z" fill="#ffffff" opacity="0.9"/>
  <ellipse cx="10" cy="11" rx="2.2" ry="3" fill="#3a3354"/><ellipse cx="18" cy="11" rx="2.2" ry="3" fill="#3a3354"/>
  <ellipse cx="14" cy="18" rx="2.4" ry="2" fill="#3a3354"/></g>`;

// Schommelstoel (silhouet) die vanzelf schommelt.
const SCHOMMELSTOEL = `<g class="sh-stoel" fill="#5a2f4a">
  <path d="M100 380 Q118 392 136 380" fill="none" stroke="#5a2f4a" stroke-width="3" stroke-linecap="round"/>
  <rect x="104" y="350" width="4" height="34" rx="2" transform="rotate(-8 106 350)"/>
  <rect x="104" y="364" width="26" height="4" rx="2"/>
  <rect x="126" y="366" width="3" height="16"/><rect x="108" y="366" width="3" height="16"/>
</g>`;

// Een schilderij met ogen die heen en weer kijken.
const SCHILDERIJ = `<g>
  <rect x="270" y="330" width="28" height="34" rx="2" fill="#d9a441" stroke="#8a5a14" stroke-width="2"/>
  <rect x="274" y="334" width="20" height="26" fill="#6b4a6e"/>
  <ellipse cx="284" cy="345" rx="7" ry="8" fill="#e8c9a8"/>
  <path d="M277 341 Q284 332 291 341" fill="#3a2a2a"/>
  <g class="sh-schilderij-ogen"><circle cx="281.5" cy="345" r="1.4" fill="#222"/><circle cx="286.5" cy="345" r="1.4" fill="#222"/></g>
  <path d="M280 351 Q284 353 288 351" stroke="#8a4a3a" stroke-width="1" fill="none"/>
</g>`;

export const HUIS = `
<svg viewBox="0 -62 400 512" aria-hidden="true">
  <defs>
    <linearGradient id="sh-raamlicht" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffeaa6"/><stop offset="1" stop-color="#ffab45"/>
    </linearGradient>
    <radialGradient id="sh-lampgloed"><stop offset="0" stop-color="#ffe9a0" stop-opacity="0.9"/><stop offset="1" stop-color="#ffb347" stop-opacity="0"/></radialGradient>
    <clipPath id="sh-klem-boven"><rect x="254" y="206" width="54" height="64"/></clipPath>
    <clipPath id="sh-klem-deur"><rect x="172" y="334" width="56" height="98"/></clipPath>
  </defs>

  <!-- schoorsteen achter het dak -->
  <rect x="266" y="12" width="22" height="56" fill="#5b4a64"/>
  <rect x="262" y="8" width="30" height="8" rx="2" fill="#463852"/>
  <path d="M266 26 H288 M266 40 H288 M266 54 H288 M277 16 V26 M272 26 V40 M283 40 V54" stroke="#463852" stroke-width="1.4"/>

  <!-- torentje met spits dak -->
  <rect x="176" y="-4" width="48" height="70" fill="${MUUR}"/>
  <circle cx="200" cy="26" r="12" fill="${HOUT_DONKER}"/>
  <circle cx="200" cy="26" r="9" fill="${LICHT}" class="sh-raamlicht sh-raamlicht--toren"/>
  <path d="M200 17 V35 M191 26 H209" stroke="${HOUT_DONKER}" stroke-width="2"/>
  <path d="M168 -4 L232 -4 L200 -50 Z" fill="${DAK}"/>
  <path d="M200 -50 L168 -4" stroke="${DAK_LICHT}" stroke-width="2" opacity="0.7"/>
  <path d="M200 -50 V-60" stroke="#2a2a3a" stroke-width="2"/><circle cx="200" cy="-60" r="2.6" fill="#2a2a3a"/>

  <!-- mansardedak -->
  <path d="M40 172 L360 172 L300 62 L100 62 Z" fill="${DAK}"/>
  ${dakpannen()}
  <path d="M100 62 L40 172" stroke="${DAK_LICHT}" stroke-width="2.4" opacity="0.6"/>
  <rect x="96" y="58" width="208" height="6" rx="2" fill="${DAK_DONKER}"/>
  <path d="${Array.from({ length: 17 }, (_, i) => `M${106 + i * 12} 58 l-2 -7 l2 -3 l2 3 l-2 7`).join(' ')}" fill="#22303a" stroke="#22303a" stroke-width="1"/>
  <!-- zwart katje op de nok, met een zwiepende staart -->
  <g class="sh-dakkat" fill="#120e1c">
    <path class="sh-dakkat__staart" d="M252 55 C263 56 263 45 258 40" fill="none" stroke="#120e1c" stroke-width="2.8" stroke-linecap="round"/>
    <ellipse cx="246" cy="50" rx="8" ry="8.5"/>
    <circle cx="244" cy="38.5" r="6"/>
    <path d="M238.6 36 L239 28.5 L243 33.4 Z M245 33.4 L249 28.5 L249.4 36 Z"/>
    <g class="sh-dakkat__ogen"><ellipse cx="241.8" cy="38.4" rx="1.3" ry="1.5" fill="#ffe14d"/><ellipse cx="246.4" cy="38.4" rx="1.3" ry="1.5" fill="#ffe14d"/></g>
  </g>
  ${dakkapel(130, true)}
  <g>${dakkapel(200, false)}
    <g class="sh-dakogen"><ellipse cx="195" cy="142" rx="3" ry="3.4" fill="#ffe14d"/><ellipse cx="205" cy="142" rx="3" ry="3.4" fill="#ffe14d"/>
      <circle cx="195.8" cy="142.6" r="1.3" fill="#2a2030"/><circle cx="205.8" cy="142.6" r="1.3" fill="#2a2030"/></g>
  </g>
  ${dakkapel(270, true)}

  <!-- balkonrand onderaan het dak -->
  <rect x="44" y="146" width="312" height="5" rx="2" fill="#6f9488"/>
  <path d="${Array.from({ length: 31 }, (_, i) => `M${50 + i * 10} 151 v17`).join(' ')}" stroke="#5c8176" stroke-width="4.2" stroke-linecap="round"/>

  <!-- muur -->
  <path d="M70 182 L330 182 L352 432 L48 432 Z" fill="${MUUR}"/>
  ${planken()}
  <path d="M70 182 L48 432" stroke="#5d67a0" stroke-width="3" opacity="0.6"/>

  <!-- dakrand -->
  <rect x="30" y="168" width="340" height="15" rx="3" fill="${DAK_DONKER}"/>
  <rect x="30" y="168" width="340" height="3" rx="1.5" fill="${DAK_LICHT}" opacity="0.7"/>
  <path d="${Array.from({ length: 24 }, (_, i) => `M${38 + i * 14} 183 h7 v6 h-7 Z`).join(' ')}" fill="#1f3a33"/>

  <!-- bovenverdieping -->
  ${raam(92, 206, 54, 64, spinnenweb(92, 206, 22))}
  <g>
    <path d="M172 274 V214 A28 28 0 0 1 228 214 V274 Z" fill="${HOUT_DONKER}"/>
    <path d="M178 270 V215 A22 22 0 0 1 222 215 V270 Z" fill="${LICHT}" class="sh-raamlicht sh-raamlicht--knippert"/>
    <g class="sh-kroonluchter"><path d="M200 193 V214" stroke="#3a2a20" stroke-width="1.2"/>
      <path d="M188 220 Q200 228 212 220 M200 214 V226" stroke="#7a5420" stroke-width="2" fill="none"/>
      <circle cx="188" cy="217" r="2.2" fill="#fff3b0"/><circle cx="200" cy="212" r="2.2" fill="#fff3b0"/><circle cx="212" cy="217" r="2.2" fill="#fff3b0"/></g>
    <path d="M200 193 V270 M178 236 H222" stroke="${HOUT_DONKER}" stroke-width="3"/>
    <rect x="166" y="272" width="68" height="5" rx="2" fill="${HOUT}"/>
  </g>
  ${raam(254, 206, 54, 64, `<g transform="translate(240 228)">${RAAMSPOOK}</g>`, 'sh-klem-boven')}
  <!-- scheve luik naast het linkerraam -->
  <rect x="150" y="204" width="14" height="68" rx="2" fill="#3c6b5f" transform="rotate(7 150 204)"/>
  <path d="M153 214 h8 M153 230 h8 M153 246 h8 M153 262 h8" stroke="#2a4d44" stroke-width="2" transform="rotate(7 150 204)"/>

  <!-- balkonbalk met rode loper -->
  <rect x="36" y="286" width="328" height="15" fill="${HOUT}"/>
  <rect x="36" y="284" width="328" height="5" fill="${LOPER}"/>
  <path d="${Array.from({ length: 20 }, (_, i) => `M${46 + i * 16} 296 q4 -5 8 0 q4 5 8 0`).join(' ')}" stroke="${HOUT_DONKER}" stroke-width="1.4" fill="none" opacity="0.7"/>
  <!-- lantaarn onder de balk -->
  <circle cx="200" cy="314" r="20" fill="url(#sh-lampgloed)" class="sh-lampgloed"/>
  <path d="M200 301 V306" stroke="#2a2a2a" stroke-width="1.6"/>
  <path d="M193 306 H207 L205 322 H195 Z" fill="#ffd36b" stroke="#3a2a20" stroke-width="1.6"/>
  <path d="M191 306 H209" stroke="#3a2a20" stroke-width="2.4" stroke-linecap="round"/>

  <!-- benedenverdieping -->
  ${raam(84, 322, 64, 70, SCHOMMELSTOEL)}
  ${raam(252, 322, 64, 70, SCHILDERIJ)}

  <!-- voordeur: donkere gang, gluurder en twee deurbladen -->
  <path d="M164 434 V340 A36 30 0 0 1 236 340 V434 Z" fill="${HOUT_DONKER}"/>
  <path d="M172 334 A28 20 0 0 1 228 334 Z" fill="${LICHT}" class="sh-raamlicht"/>
  <path d="M200 314 V334 M186 318 L192 334 M214 318 L208 334" stroke="${HOUT_DONKER}" stroke-width="2"/>
  <rect x="172" y="334" width="56" height="98" fill="#2a1c3a"/>
  <rect x="180" y="340" width="40" height="92" fill="#4a2f45" opacity="0.6"/>
  <g clip-path="url(#sh-klem-deur)">
    <!-- gluurder: een (gespiegeld) Fluent-plaatje dat in spookhuis.ts steeds wisselt -->
    <g class="sh-gluurder"><g transform="matrix(-1 0 0 1 440 0)">
      <image class="sh-gluurder__beeld" x="198" y="358" width="42" height="42"/>
    </g></g>
  </g>
  <g class="sh-deurblad sh-deurblad--l">
    <rect x="172" y="334" width="28" height="98" fill="#7a4428" stroke="${HOUT_DONKER}" stroke-width="1.6"/>
    <rect x="177" y="342" width="18" height="34" rx="2" fill="none" stroke="${HOUT_DONKER}" stroke-width="1.6"/>
    <rect x="177" y="384" width="18" height="40" rx="2" fill="none" stroke="${HOUT_DONKER}" stroke-width="1.6"/>
    <circle cx="196" cy="386" r="2" fill="#f2c94c"/>
  </g>
  <g class="sh-deurblad sh-deurblad--r">
    <rect x="200" y="334" width="28" height="98" fill="#7a4428" stroke="${HOUT_DONKER}" stroke-width="1.6"/>
    <rect x="205" y="342" width="18" height="34" rx="2" fill="none" stroke="${HOUT_DONKER}" stroke-width="1.6"/>
    <rect x="205" y="384" width="18" height="40" rx="2" fill="none" stroke="${HOUT_DONKER}" stroke-width="1.6"/>
    <circle cx="204" cy="386" r="2" fill="#f2c94c"/>
  </g>

  ${zuil(56, 184, 284)}${zuil(344, 184, 284)}${zuil(52, 301, 432)}${zuil(348, 301, 432)}
  ${klimop()}

  <!-- stoepje met loper -->
  <rect x="150" y="432" width="100" height="8" rx="2" fill="${HOUT}"/>
  <rect x="160" y="432" width="80" height="8" fill="${LOPER}"/>
  <rect x="138" y="440" width="124" height="9" rx="2" fill="${HOUT_DONKER}"/>
  <rect x="150" y="440" width="100" height="9" fill="#a32b33"/>
</svg>`;

// Kromme kale boom met hangend mos. Takken zijn eigen groepen (met hun eigen draaipunt),
// zodat ze in de wind net iets anders bewegen dan de stam. Aan de lange tak hangt een
// schommel, op de bovenste tak zit de uil (in spookhuis.ts erbij gezet).
function mos(punten: [number, number, number][]): string {
  return punten
    .map(([x, y, l], i) => `<path class="sh-mos" style="--i:${i}" d="M${x} ${y} q${i % 2 ? 3 : -3} ${l / 2} 0 ${l} q-1.5 3 1 5" fill="none" stroke="#7cb85f" stroke-width="2.6" stroke-linecap="round" opacity="0.85"/>`)
    .join('');
}

const STAM = '#2a2838';
const STAM_LICHT = '#4a4860';
const tak = (d: string, w: number) =>
  `<path d="${d}" stroke="${STAM}" stroke-width="${w}" fill="none" stroke-linecap="round"/>
   <path d="${d}" stroke="${STAM_LICHT}" stroke-width="${Math.max(1, w * 0.22)}" fill="none" stroke-linecap="round" transform="translate(${(w * 0.25).toFixed(1)} ${(-w * 0.2).toFixed(1)})" opacity="0.8"/>`;

export const BOOM = `
<svg viewBox="0 0 320 430" aria-hidden="true">
  <g class="sh-boom">
    <g class="sh-tak sh-tak--links">
      ${tak('M118 170 C96 150 70 130 52 96 C44 80 30 66 14 60', 11)}
      ${tak('M60 108 C54 96 56 80 46 68', 5)}
      ${tak('M34 72 C30 60 34 50 28 40', 3.5)}
      ${mos([[44, 86, 34], [58, 104, 26], [74, 124, 40], [26, 64, 22]])}
    </g>
    <g class="sh-tak sh-tak--boven">
      ${tak('M132 130 C134 100 126 76 140 50 C148 36 146 22 152 10', 9)}
      ${tak('M138 60 C156 56 170 44 186 46', 4.5)}
      ${tak('M130 92 C116 82 112 64 100 54', 4)}
      ${mos([[150, 54, 22], [176, 48, 18], [108, 62, 20]])}
    </g>
    <g class="sh-tak sh-tak--rechts">
      ${tak('M140 236 C170 226 210 224 250 218 C272 214 292 206 312 196', 12)}
      ${tak('M270 214 C282 200 284 186 296 176', 5)}
      ${mos([[210, 228, 30], [290, 208, 26], [304, 200, 20]])}
      <g class="sh-schommel">
        <path d="M232 224 V340 M262 220 V340" stroke="#c9b48a" stroke-width="2"/>
        <rect x="224" y="338" width="46" height="8" rx="3" fill="#8a5a34"/>
        <rect x="224" y="338" width="46" height="2.5" rx="1" fill="#b07a4a"/>
      </g>
    </g>
    <g class="sh-tak sh-tak--uil">
      ${tak('M136 168 C160 154 190 150 224 138 C238 133 250 126 262 116', 9)}
      ${mos([[176, 154, 26], [246, 130, 22]])}
    </g>
    <path d="M86 430 C96 410 104 380 100 340 C96 300 112 268 118 236 C124 204 112 172 122 140 C126 124 128 116 130 108
             L144 110 C140 134 144 160 140 190 C136 222 152 250 146 290 C142 330 156 380 176 430 Z" fill="${STAM}"/>
    <path d="M139 116 C136 150 141 180 137 210 C134 240 148 262 143 300 C140 330 150 370 166 420" stroke="${STAM_LICHT}" stroke-width="3" fill="none" opacity="0.7"/>
    <path d="M86 430 C70 426 58 428 46 430 L96 418 Z M176 430 C192 424 206 426 222 430 L166 418 Z" fill="${STAM}"/>
    <!-- knoest met oogjes -->
    <ellipse cx="124" cy="300" rx="11" ry="15" fill="#120f1e"/>
    <g class="sh-knoestogen"><ellipse cx="120" cy="298" rx="2.6" ry="3.2" fill="#ffe14d"/><ellipse cx="128.5" cy="298" rx="2.6" ry="3.2" fill="#ffe14d"/></g>
  </g>
</svg>`;

export const MAAN = `
<svg viewBox="0 0 200 200" aria-hidden="true">
  <defs><radialGradient id="sh-maan" cx="0.42" cy="0.38" r="0.65">
    <stop offset="0" stop-color="#fdfbe8"/><stop offset="0.7" stop-color="#e6ecd6"/><stop offset="1" stop-color="#c7d6c4"/>
  </radialGradient></defs>
  <circle cx="100" cy="100" r="100" fill="url(#sh-maan)"/>
  <g fill="#b9c9b5" opacity="0.55">
    <circle cx="70" cy="64" r="16"/><circle cx="128" cy="120" r="22"/><circle cx="62" cy="134" r="10"/>
    <circle cx="140" cy="62" r="8"/><circle cx="102" cy="162" r="9"/><circle cx="104" cy="92" r="6"/>
  </g>
</svg>`;

export const VLEERMUIS = `
<svg viewBox="0 0 60 30" aria-hidden="true">
  <path class="sh-vleugel sh-vleugel--l" d="M30 14 C24 6 14 3 2 7 C8 10 9 14 7 19 C12 15 16 16 18 21 C21 16 26 16 30 18 Z" fill="#1a1528"/>
  <path class="sh-vleugel sh-vleugel--r" d="M30 14 C36 6 46 3 58 7 C52 10 51 14 53 19 C48 15 44 16 42 21 C39 16 34 16 30 18 Z" fill="#1a1528"/>
  <ellipse cx="30" cy="16" rx="5" ry="6.5" fill="#241d36"/>
  <path d="M26.5 11 L26 5 L29 9.5 Z M33.5 11 L34 5 L31 9.5 Z" fill="#241d36"/>
  <circle cx="28.2" cy="14" r="1.1" fill="#ffd54f"/><circle cx="31.8" cy="14" r="1.1" fill="#ffd54f"/>
</svg>`;

// Glooiende heuvels: de verre (met kale boompjes) en de heuvel onder het huis (rechts plat).
export const VERTE = `
<svg viewBox="0 0 1000 200" preserveAspectRatio="none" aria-hidden="true">
  <path d="M0 120 C120 80 230 96 340 116 C450 136 560 84 690 92 C800 100 900 124 1000 110 L1000 200 L0 200 Z" fill="#253b52" opacity="0.8"/>
  <path d="M0 150 C160 120 300 132 440 150 C590 170 720 128 860 136 C930 140 970 146 1000 144 L1000 200 L0 200 Z" fill="#203447"/>
</svg>`;

// Gras langs een bovenrand: dunne gebogen sprieten in een paar tinten (non-scaling-stroke,
// want de laag wordt in de breedte uitgerekt), met hier en daar een paars paddenstoeltje.
function gras(rand: (x: number) => number, breed: number, hoog: number, zaad: number, tinten: string[]): string {
  const r = vasteToeval(zaad);
  const sprieten = tinten.map(() => '');
  for (let x = 0; x <= breed; x += 2.6 + r() * 2.4) {
    const y = rand(x) + 1 + r() * 2;
    const h = hoog * (0.45 + r() * 0.75);
    const buig = (r() - 0.5) * hoog * 0.9;
    sprieten[Math.floor(r() * tinten.length)] += `M${x.toFixed(1)} ${y.toFixed(1)} q${(buig * 0.25).toFixed(1)} ${(-h * 0.6).toFixed(1)} ${buig.toFixed(1)} ${(-h).toFixed(1)} `;
  }
  return sprieten.map((d, i) => `<path d="${d}" fill="none" stroke="${tinten[i]}" stroke-width="1.8" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`).join('');
}
const randPad = (rand: (x: number) => number, breed: number, hoog: number) => {
  let d = `M0 ${hoog} L0 ${rand(0).toFixed(1)}`;
  for (let x = 10; x <= breed; x += 10) d += ` L${x} ${rand(x).toFixed(1)}`;
  return `${d} L${breed} ${hoog} Z`;
};

const heuvelRand = (x: number) => {
  if (x >= 600) return 80 + Math.sin(x / 37) * 1.2;
  const t = x / 600;
  return 150 - 70 * t * t * (3 - 2 * t) + Math.sin(x / 41) * 2;
};
export const HEUVEL = `
<svg viewBox="0 0 1000 200" preserveAspectRatio="none" aria-hidden="true">
  <path d="${randPad(heuvelRand, 1000, 200)}" fill="#2c4a46"/>
  <path d="${randPad((x) => heuvelRand(x) + 22 + Math.sin(x / 90) * 5, 1000, 200)}" fill="#284441"/>
  ${gras(heuvelRand, 1000, 12, 5, ['#3f6b5c', '#4a7a66', '#345a4f'])}
</svg>`;

const voorRand = (x: number) => 36 + Math.sin(x / 130) * 6 + Math.sin(x / 47 + 1) * 2.5;
function paddenstoeltjes(): string {
  const r = vasteToeval(23);
  let d = '';
  for (let n = 0; n < 14; n++) {
    const x = 20 + r() * 960;
    const y = voorRand(x) + 8 + r() * 30;
    d += `<rect x="${(x - 0.8).toFixed(1)}" y="${(y - 3).toFixed(1)}" width="1.6" height="3.4" fill="#e6dcef"/>`
      + `<ellipse cx="${x.toFixed(1)}" cy="${(y - 3).toFixed(1)}" rx="2.6" ry="1.9" fill="${n % 3 ? '#9a5cc8' : '#c8607a'}"/>`;
  }
  return d;
}
export const VOORGROND = `
<svg viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true">
  <path d="${randPad(voorRand, 1000, 100)}" fill="#1e3532"/>
  <path d="${randPad((x) => voorRand(x) + 26 + Math.sin(x / 70) * 4, 1000, 100)}" fill="#1a2f2c"/>
  ${paddenstoeltjes()}
  ${gras(voorRand, 1000, 18, 9, ['#2f5247', '#3a6354', '#28463e'])}
  ${gras((x) => voorRand(x) + 30 + Math.sin(x / 70) * 4, 1000, 14, 13, ['#24413a', '#2c4d44'])}
</svg>`;

// Scheef houten hekje met `n` planken.
export const hek = (n: number, zaad: number): string => {
  const r = vasteToeval(zaad);
  const b = n * 26;
  let planken = '';
  for (let i = 0; i < n; i++) {
    const x = 8 + i * 26;
    if (r() < 0.1) continue; // hier en daar ontbreekt een plank
    const h = 4 + r() * 8;
    planken += `<path d="M${x - 6} 70 L${x - 6} ${14 + h} L${x} ${4 + h} L${x + 6} ${14 + h} L${x + 6} 70 Z" fill="#6e5848" stroke="#3e3028" stroke-width="1.5" transform="rotate(${((r() - 0.5) * 16).toFixed(1)} ${x} 70)"/>`;
  }
  return `<svg viewBox="0 0 ${b} 70" aria-hidden="true">
    <path d="M0 ${34 + r() * 4} L${b} ${30 + r() * 4} M0 ${54} L${b} ${50 + r() * 4}" stroke="#5a4638" stroke-width="5" stroke-linecap="round"/>
    ${planken}</svg>`;
};
