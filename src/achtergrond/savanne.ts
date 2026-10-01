import type { Decor } from './achtergrond.ts';
import { el, kortAan, plaatje, svgUitTekst } from './hulp.ts';

// Savanne: een grote acaciaboom rechts met leeuwen die eronder in de schaduw liggen te
// luieren (staart zwiept, af en toe knipperen of gapen), links een waterpoel waar af en toe
// een olifantenfamilie komt drinken, en overal hoog savannegras dat zacht wuift.
// De dag draait rond: eerst een zonsondergang (20 s, grote oranje zon die achter de bergen
// zakt, de boom wordt een silhouet), dan langzaam nacht (15 s, sterren, maan, vuurvliegjes,
// de leeuwen slapen) en dan dag (25 s), en weer zonsondergang.
// Bij een goed antwoord brult de leeuw en springt het welpje op; aan het eind van een sessie
// spuit de olifant water en vliegt er een zwerm vogels over.
// Alles is zelf getekend (geen Fluent): Fluent heeft alleen een leeuwenkop.

// De verre bergen (plat als tafelbergen, zoals op de Serengeti).
const BERGEN = `
<svg viewBox="0 0 1000 120" preserveAspectRatio="none" aria-hidden="true">
  <path class="savanne-berg--ver" d="M0 70 C60 58 120 40 190 34 C260 28 300 30 360 44 C420 58 470 62 540 56 C620 48 680 22 760 18 C840 14 900 30 1000 46 L1000 120 L0 120 Z"/>
  <path class="savanne-berg--dicht" d="M0 92 C90 84 150 70 230 72 C300 74 340 88 420 90 C520 92 600 80 700 76 C800 72 880 86 1000 82 L1000 120 L0 120 Z"/>
</svg>`;

// Een rij fijn gras op de horizon (mag meerekken).
function horizonGras(): string {
  let d = 'M0 40 ';
  for (let x = 0; x <= 1000; x += 6) d += `L${x} ${30 + ((x * 7919) % 13)} L${x + 3} ${40 - ((x * 104729) % 5)} `;
  return `<svg viewBox="0 0 1000 40" preserveAspectRatio="none" aria-hidden="true">
    <path d="${d} L1000 40 Z" fill="#b8963f"/></svg>`;
}

// De acacia: een gevorkte stam en een brede, platte kruin.
const BOOM = `
<svg viewBox="0 0 300 260" aria-hidden="true">
  <path d="M138 260 C141 226 146 196 138 166 C130 146 112 130 88 116 L95 107 C118 118 136 132 145 146 C149 122 152 102 160 84 L169 88 C163 108 161 128 159 148 C171 128 192 114 218 104 L222 113 C198 126 178 142 166 166 C159 192 161 224 166 260 Z" fill="#5b3d26"/>
  <path d="M146 150 C152 172 152 214 150 258" stroke="#6f4c30" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M92 112 L70 92 M200 108 L232 90 M162 86 L150 64 M164 88 L184 66" stroke="#5b3d26" stroke-width="6" stroke-linecap="round"/>
  <g class="savanne-boom__kruin">
    <ellipse cx="150" cy="88" rx="142" ry="22" fill="#3f5a2a"/>
    <ellipse cx="84" cy="76" rx="72" ry="24" fill="#56752f"/>
    <ellipse cx="214" cy="74" rx="80" ry="25" fill="#56752f"/>
    <ellipse cx="150" cy="62" rx="90" ry="27" fill="#648637"/>
    <ellipse cx="116" cy="52" rx="50" ry="17" fill="#739840"/>
    <ellipse cx="198" cy="54" rx="46" ry="15" fill="#739840"/>
    <ellipse cx="40" cy="80" rx="34" ry="13" fill="#648637"/>
    <ellipse cx="262" cy="78" rx="34" ry="13" fill="#648637"/>
  </g>
</svg>`;

// Een klein acaciaatje in de verte (alleen het silhouet).
const VERRE_BOOM = `
<svg viewBox="0 0 60 40" aria-hidden="true">
  <path d="M28 40 L29 22 L22 16 L24 15 L30 20 L32 13 L34 14 L32 22 L31 40 Z"/>
  <ellipse cx="30" cy="14" rx="26" ry="6"/>
  <ellipse cx="30" cy="10" rx="16" ry="5"/>
</svg>`;

// Waterpoel: een plat ovaal met een modderrand en wat glinstering.
const POEL = `
<svg viewBox="0 0 400 110" aria-hidden="true">
  <ellipse cx="200" cy="58" rx="198" ry="50" fill="#9b7b45"/>
  <ellipse cx="202" cy="56" rx="182" ry="40" fill="#5a9cc0"/>
  <ellipse cx="206" cy="52" rx="158" ry="29" fill="#78b8d8"/>
  <path d="M90 50 C130 42 170 42 200 48 M140 66 C180 60 230 60 270 66 M250 44 C280 40 300 42 320 46" stroke="#d6f0ff" stroke-width="4" stroke-linecap="round" opacity="0.7" fill="none"/>
  <g fill="#7d6336"><ellipse cx="60" cy="98" rx="30" ry="6"/><ellipse cx="330" cy="100" rx="40" ry="6"/></g>
</svg>`;

// Olifant van opzij, kijkt naar rechts. Poten, slurf, oor, kop en staart zijn eigen
// groepen zodat ze los kunnen bewegen.
const OLIFANT = `
<svg viewBox="0 0 236 180" aria-hidden="true">
  <g class="olifant__staart">
    <path d="M22 80 C12 94 10 108 12 120" stroke="#7b8691" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M8 118 L16 117 L15 130 L10 130 Z" fill="#4b535c"/>
  </g>
  <g class="dier__poot dier__poot--b"><rect x="42" y="98" width="25" height="78" rx="11" fill="#76818c"/></g>
  <g class="dier__poot dier__poot--a"><rect x="134" y="98" width="25" height="78" rx="11" fill="#76818c"/></g>
  <ellipse cx="98" cy="86" rx="80" ry="54" fill="#8d99a5"/>
  <path d="M30 104 C60 132 140 136 172 106" stroke="#7d8995" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.7"/>
  <g class="dier__poot dier__poot--a">
    <rect x="58" y="102" width="27" height="76" rx="12" fill="#8d99a5"/>
    <path d="M62 174 h5 M70 175 h5 M78 174 h4" stroke="#eef0f2" stroke-width="3" stroke-linecap="round"/>
  </g>
  <g class="dier__poot dier__poot--b">
    <rect x="148" y="102" width="27" height="76" rx="12" fill="#8d99a5"/>
    <path d="M152 174 h5 M160 175 h5 M168 174 h4" stroke="#eef0f2" stroke-width="3" stroke-linecap="round"/>
  </g>
  <g class="olifant__kop">
    <g class="olifant__slurf">
      <path d="M194 78 C212 94 216 126 210 160" stroke="#8d99a5" stroke-width="18" fill="none" stroke-linecap="round"/>
      <path d="M202 104 l12 -3 M206 118 l12 -1 M208 132 l11 0 M208 146 l10 1" stroke="#76818c" stroke-width="2.5" stroke-linecap="round"/>
      <circle class="olifant__slurfpunt" cx="210" cy="164" r="1" fill="none"/>
    </g>
    <circle cx="178" cy="66" r="36" fill="#8d99a5"/>
    <path class="olifant__tand" d="M196 94 C202 106 212 110 222 106" stroke="#fffbea" stroke-width="6" fill="none" stroke-linecap="round"/>
    <g class="olifant__oor">
      <path d="M154 36 C122 30 106 58 112 88 C116 110 140 118 158 104 C164 82 164 58 154 36 Z" fill="#a1acb7"/>
      <path d="M150 46 C128 44 120 64 124 86 C128 102 142 106 152 98 C156 80 156 62 150 46 Z" fill="#c2a6a6"/>
    </g>
    <circle cx="190" cy="58" r="4" fill="#2a2f36"/>
    <circle cx="191.4" cy="56.6" r="1.3" fill="#fff"/>
    <path d="M182 50 C186 47 192 47 196 50" stroke="#76818c" stroke-width="2" fill="none" stroke-linecap="round"/>
  </g>
</svg>`;

// Gnoe van opzij (kijkt naar rechts): hoge schoft, dunne poten, baard en gekrulde horens.
const GNOE = `
<svg viewBox="0 0 200 150" aria-hidden="true">
  <g class="dier__staart">
    <path d="M36 60 C28 72 26 86 28 98" stroke="#3a332e" stroke-width="3" fill="none" stroke-linecap="round"/>
    <ellipse cx="28" cy="102" rx="3.5" ry="8" fill="#2a2420"/>
  </g>
  <g class="dier__poot dier__poot--b"><rect x="46" y="80" width="8" height="64" rx="3" fill="#4a443f"/><rect x="45" y="141" width="10" height="6" rx="2" fill="#1f1b18"/></g>
  <g class="dier__poot dier__poot--a"><rect x="132" y="80" width="8" height="64" rx="3" fill="#4a443f"/><rect x="131" y="141" width="10" height="6" rx="2" fill="#1f1b18"/></g>
  <path d="M36 64 C36 50 60 46 90 46 C112 46 128 32 146 36 C160 40 164 62 158 84 C150 96 120 98 94 96 C70 96 46 94 40 84 C36 78 36 70 36 64 Z" fill="#6b635c"/>
  <path d="M100 52 C98 64 98 78 102 90 M112 50 C110 62 110 78 114 92 M124 46 C122 60 122 78 126 92 M88 52 C86 64 86 78 90 90" stroke="#57504a" stroke-width="3" fill="none" stroke-linecap="round"/>
  <g class="dier__poot dier__poot--a"><rect x="56" y="82" width="9" height="64" rx="3" fill="#6b635c"/><rect x="55" y="143" width="11" height="6" rx="2" fill="#1f1b18"/></g>
  <g class="dier__poot dier__poot--b"><rect x="144" y="82" width="9" height="64" rx="3" fill="#6b635c"/><rect x="143" y="143" width="11" height="6" rx="2" fill="#1f1b18"/></g>
  <g class="dier__nek">
    <path d="M138 40 C150 34 164 40 172 52 L178 78 C172 86 162 84 158 78 L144 62 Z" fill="#5d5650"/>
    <path d="M136 36 C146 32 158 36 166 46" stroke="#2a2420" stroke-width="6" fill="none" stroke-linecap="round"/>
    <g class="dier__kop">
    <path d="M166 48 C174 42 184 48 188 58 L194 84 C194 92 184 95 179 89 L168 66 Z" fill="#4e4741"/>
    <ellipse cx="188" cy="88" rx="7" ry="6" fill="#2f2a26"/>
    <path d="M174 88 C174 98 180 104 186 100" stroke="#2a2420" stroke-width="4" fill="none" stroke-linecap="round"/>
    <circle cx="178" cy="60" r="2.4" fill="#141110"/>
    <ellipse cx="166" cy="52" rx="7" ry="3" fill="#5d5650" transform="rotate(-30 166 52)"/>
    <path d="M172 50 C164 44 164 36 172 32 M180 50 C188 44 192 40 192 32" stroke="#d8cfc0" stroke-width="4" fill="none" stroke-linecap="round"/>
    </g>
  </g>
</svg>`;

// Thomsongazelle van opzij (kijkt naar rechts): slank, met een zwarte streep op de zij,
// een witte buik en spitse horentjes.
const GAZELLE = `
<svg viewBox="0 -8 160 138" aria-hidden="true">
  <g class="dier__staart"><path d="M30 50 L24 64" stroke="#2a2420" stroke-width="4" stroke-linecap="round"/></g>
  <g class="dier__poot dier__poot--b"><rect x="40" y="68" width="6" height="58" rx="3" fill="#b07a40"/></g>
  <g class="dier__poot dier__poot--a"><rect x="112" y="68" width="6" height="58" rx="3" fill="#b07a40"/></g>
  <ellipse cx="76" cy="58" rx="48" ry="20" fill="#c98a4a"/>
  <path d="M34 62 C50 82 100 82 120 66 C112 78 50 80 34 62 Z" fill="#fff4e4"/>
  <path d="M40 62 C60 71 96 71 116 62" stroke="#3a2a20" stroke-width="4" fill="none" stroke-linecap="round"/>
  <ellipse cx="32" cy="56" rx="7" ry="11" fill="#fff4e4"/>
  <g class="dier__poot dier__poot--a"><rect x="48" y="70" width="6.5" height="58" rx="3" fill="#c98a4a"/></g>
  <g class="dier__poot dier__poot--b"><rect x="120" y="70" width="6.5" height="58" rx="3" fill="#c98a4a"/></g>
  <g class="dier__nek">
    <path d="M104 46 C110 30 120 20 128 22 L134 32 C126 38 122 48 120 60 Z" fill="#c98a4a"/>
    <g class="dier__kop">
    <ellipse cx="137" cy="30" rx="14" ry="8" fill="#c98a4a" transform="rotate(22 137 30)"/>
    <path d="M128 26 C136 30 142 34 148 38" stroke="#fff4e4" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <ellipse cx="149" cy="37" rx="3.5" ry="3" fill="#3a2a20"/>
    <circle cx="134" cy="26" r="2.2" fill="#1b130e"/>
    <ellipse cx="124" cy="20" rx="3" ry="7" fill="#c98a4a" transform="rotate(-35 124 20)"/>
    <path d="M128 20 C125 10 126 2 131 -4 M132 21 C131 11 134 3 139 -2" stroke="#3a2a20" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    </g>
  </g>
</svg>`;

// Krokodil die tot zijn ogen boven water komt (kop naar links). Alles onder y=34 is
// onder water en valt buiten de tekening.
const KROKODIL = `
<svg viewBox="0 0 160 34" aria-hidden="true">
  <path d="M6 32 C8 26 28 24 58 24 C78 24 88 18 98 18 C110 18 118 24 126 26 L160 28 L160 40 L0 40 Z" fill="#5f7a3a"/>
  <circle cx="12" cy="28" r="5" fill="#6d8a44"/>
  <circle cx="11" cy="26" r="1.2" fill="#2d3a1c"/><circle cx="15" cy="26" r="1.2" fill="#2d3a1c"/>
  <path d="M22 31 l3 3 l3 -3 l3 3 l3 -3 l3 3" stroke="#f2f0e0" stroke-width="1.6" fill="none" stroke-linejoin="round"/>
  <circle cx="96" cy="18" r="8" fill="#6d8a44"/>
  <g class="krokodil__oog"><ellipse cx="94" cy="16" rx="4" ry="3.6" fill="#e8d24a"/><ellipse cx="94" cy="16" rx="1.1" ry="3" fill="#1b1b10"/></g>
  <path d="M132 27 l4 -5 l4 5 M142 28 l4 -5 l4 5 M152 28 l4 -5 l4 5" fill="#4f6830"/>
</svg>`;

// Een liggende leeuw van opzij (kop naar links, kijkt een beetje naar ons).
interface LeeuwKleur { lijf: string; schaduw: string; gezicht: string; manen?: [string, string] }
function leeuwSvg(k: LeeuwKleur): string {
  let manen = '';
  if (k.manen) {
    const plukken = Array.from({ length: 12 }, (_, i) => {
      const h = (Math.PI * 2 * i) / 12;
      return `<circle cx="${(64 + Math.cos(h) * 31).toFixed(1)}" cy="${(66 + Math.sin(h) * 31).toFixed(1)}" r="13"/>`;
    }).join('');
    manen = `<g fill="${k.manen[0]}"><circle cx="64" cy="66" r="34"/>${plukken}</g><circle cx="64" cy="67" r="31" fill="${k.manen[1]}"/>`;
  }
  return `
<svg viewBox="0 0 232 130" aria-hidden="true">
  <g class="leeuw__staart">
    <path d="M194 104 C214 102 224 88 220 70" stroke="${k.lijf}" stroke-width="6" fill="none" stroke-linecap="round"/>
    <ellipse cx="220" cy="65" rx="6.5" ry="8.5" fill="${k.manen?.[0] ?? '#8a5a2c'}"/>
  </g>
  <rect x="36" y="106" width="58" height="13" rx="6.5" fill="${k.schaduw}"/>
  <path d="M78 84 C82 64 120 58 156 62 C188 66 206 84 202 104 C199 118 182 124 160 124 L92 124 C76 122 72 100 78 84 Z" fill="${k.lijf}"/>
  <ellipse cx="172" cy="99" rx="30" ry="22" fill="${k.schaduw}"/>
  <ellipse cx="150" cy="121" rx="19" ry="7" fill="${k.lijf}"/>
  <path d="M136 120 v3 M142 120 v3" stroke="${k.schaduw}" stroke-width="1.6" stroke-linecap="round"/>
  <rect x="24" y="112" width="68" height="14" rx="7" fill="${k.lijf}"/>
  <path d="M30 116 v6 M36 116 v6" stroke="${k.schaduw}" stroke-width="1.8" stroke-linecap="round"/>
  <g class="leeuw__kop">
    ${manen}
    <g class="leeuw__oren">
      <circle cx="44" cy="46" r="9" fill="${k.lijf}"/><circle cx="44" cy="46" r="4.5" fill="${k.schaduw}"/>
      <circle cx="83" cy="46" r="9" fill="${k.lijf}"/><circle cx="83" cy="46" r="4.5" fill="${k.schaduw}"/>
    </g>
    <ellipse cx="63" cy="68" rx="23" ry="22" fill="${k.gezicht}"/>
    <ellipse cx="63" cy="81" rx="13" ry="9" fill="#f8e3b8"/>
    <ellipse class="leeuw__open" cx="63" cy="86" rx="7" ry="6.5" fill="#8e2b2b"/>
    <path d="M57 72 C57 70 69 70 69 72 C69 75 65 78 63 79 C61 78 57 75 57 72 Z" fill="#7a4430"/>
    <path d="M63 79 V83 M63 83 C60 86 56 86 54 84 M63 83 C66 86 70 86 72 84" stroke="#7a4430" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <g fill="#a87a4a"><circle cx="54" cy="80" r="1"/><circle cx="51" cy="83" r="1"/><circle cx="72" cy="80" r="1"/><circle cx="75" cy="83" r="1"/></g>
    <g class="leeuw__ogen" fill="#2b1d14">
      <circle cx="54" cy="62" r="3.4"/><circle cx="72" cy="62" r="3.4"/>
      <circle cx="55.2" cy="60.8" r="1.1" fill="#fff"/><circle cx="73.2" cy="60.8" r="1.1" fill="#fff"/>
    </g>
    <g class="leeuw__slaap" stroke="#3a2416" stroke-width="3" fill="none" stroke-linecap="round">
      <path d="M48.5 61.5 Q54 67 59.5 61.5"/><path d="M66.5 61.5 Q72 67 77.5 61.5"/>
    </g>
  </g>
</svg>`;
}

const MAAN = `
<svg viewBox="0 0 100 100" aria-hidden="true">
  <path d="M62 8 A44 44 0 1 0 92 70 A36 36 0 1 1 62 8 Z" fill="#fff4c4"/>
</svg>`;

// Een vogeltje als silhouet van voren: lijfje met twee gebogen vleugels die op en neer slaan.
const ZWERMVOGEL = `
<svg viewBox="0 0 44 24" aria-hidden="true">
  <g fill="#2b1a14">
    <path class="zwermvogel__vleugel zwermvogel__vleugel--l" d="M21 12 C16 6 9 4 1 7 C8 7.5 14 10 20 15 Z"/>
    <path class="zwermvogel__vleugel zwermvogel__vleugel--r" d="M23 12 C28 6 35 4 43 7 C36 7.5 30 10 24 15 Z"/>
    <ellipse cx="22" cy="13.5" rx="3" ry="4"/>
    <circle cx="22" cy="9.5" r="2.3"/>
  </g>
</svg>`;

// Een pol savannegras: willekeurige sprieten, smal onderaan bij elkaar.
const GRASKLEUREN = ['#c9a64a', '#b8963f', '#d8b75a', '#a48a36', '#9aa03e', '#c2b052'];
function grasPol(): string {
  const n = 7 + Math.floor(Math.random() * 4);
  let sprieten = '';
  for (let i = 0; i < n; i++) {
    const x = 16 + Math.random() * 28;
    const top = x + (Math.random() - 0.5) * 34;
    const h = 22 + Math.random() * 26;
    const kleur = GRASKLEUREN[Math.floor(Math.random() * GRASKLEUREN.length)];
    sprieten += `<path d="M${(x - 2.6).toFixed(1)} 50 Q${(x + (top - x) * 0.35).toFixed(1)} ${(50 - h * 0.55).toFixed(1)} ${top.toFixed(1)} ${(50 - h).toFixed(1)} Q${(x + (top - x) * 0.25 + 1).toFixed(1)} ${(50 - h * 0.5).toFixed(1)} ${(x + 2.6).toFixed(1)} 50 Z" fill="${kleur}"/>`;
  }
  return `<svg viewBox="0 0 60 50" aria-hidden="true">${sprieten}</svg>`;
}

type Tijd = 'avond' | 'nacht' | 'dag';
const DAGCYCLUS: [Tijd, number][] = [
  ['avond', 20000],
  ['nacht', 15000],
  ['dag', 25000],
];

export function maakSavanneDecor(): Decor {
  const root = el('div', 'decor decor-savanne savanne--begin');
  root.dataset.tijd = 'avond';
  el('div', 'savanne-lucht savanne-lucht--avond', root);
  el('div', 'savanne-lucht savanne-lucht--nacht', root);
  const sterren = el('div', 'savanne-sterren', root);
  for (let i = 0; i < 70; i++) {
    const s = el('div', 'savanne-ster', sterren);
    s.style.left = `${Math.random() * 100}%`;
    s.style.top = `${Math.random() * 62}%`;
    const maat = 1.5 + Math.random() * 2.5;
    s.style.width = s.style.height = `${maat}px`;
    s.style.animationDelay = `${-Math.random() * 4}s`;
    s.style.animationDuration = `${2.5 + Math.random() * 3}s`;
  }
  svgUitTekst(MAAN, 'savanne-maan', root);
  plaatje('assets/achtergrond/wolk.svg', 'drijf-wolk drijf-wolk--1 savanne-wolk', root);
  plaatje('assets/achtergrond/wolk.svg', 'drijf-wolk drijf-wolk--2 savanne-wolk', root);
  const zon = el('div', 'savanne-zon', root);
  el('div', 'savanne-zon__dag', zon);
  el('div', 'savanne-zon__avond', zon);
  svgUitTekst(BERGEN, 'savanne-bergen', root);
  el('div', 'savanne-waas', root);
  const zwerm = el('div', 'savanne-zwerm', root);

  // Alles op de grond in één laag, die per tijd van de dag een kleurfilter krijgt.
  const land = el('div', 'savanne-land', root);
  for (let n = 1; n <= 5; n++) {
    const b = el('div', `savanne-verreboom savanne-verreboom--${n}`, land);
    svgUitTekst(VERRE_BOOM, 'savanne-verreboom__svg', b);
  }
  el('div', 'savanne-vlakte savanne-f', land);
  svgUitTekst(horizonGras(), 'savanne-horizongras savanne-f', land);
  // Graspollen verspreid over de vlakte: verder weg (hoger) kleiner en bleker.
  const midgras = el('div', 'savanne-midgras savanne-f', land);
  for (let i = 0; i < 16; i++) {
    const p = el('div', 'savanne-pol savanne-pol--midden', midgras);
    const diepte = Math.random();
    p.style.left = `${(i / 16) * 100 + Math.random() * 5 - 2}%`;
    p.style.bottom = `${9 + diepte * 17}vh`;
    p.style.setProperty('--maat', `${1 - diepte * 0.55}`);
    p.style.opacity = `${1 - diepte * 0.35}`;
    p.style.animationDelay = `${-Math.random() * 5}s`;
    p.innerHTML = grasPol();
  }
  const boom = el('div', 'savanne-boom', land);
  svgUitTekst(BOOM, 'savanne-boom__svg savanne-f', boom);
  const poel = svgUitTekst(POEL, 'savanne-poel savanne-f', land);
  const kudde = el('div', 'savanne-kudde', land);

  const leeuwen = el('div', 'savanne-leeuwen', land);
  const maakLeeuw = (soort: string, kleur: LeeuwKleur) => {
    const l = el('div', `savanne-leeuw savanne-leeuw--${soort}`, leeuwen);
    svgUitTekst(leeuwSvg(kleur), 'savanne-leeuw__svg savanne-f', l);
    return l;
  };
  const leeuwin = maakLeeuw('leeuwin', { lijf: '#e6b465', schaduw: '#d29f52', gezicht: '#efc277' });
  const koning = maakLeeuw('koning', { lijf: '#e0a44f', schaduw: '#c98d40', gezicht: '#eab461', manen: ['#94491f', '#b5622a'] });
  const welp = maakLeeuw('welp', { lijf: '#efc57c', schaduw: '#dcae66', gezicht: '#f5d08e' });
  const alleLeeuwen = [koning, leeuwin, welp];
  const zzz = el('div', 'savanne-zzz', koning);
  for (let i = 0; i < 3; i++) el('span', '', zzz).textContent = 'z';
  const brul = el('div', 'savanne-brul', koning);
  for (let i = 0; i < 3; i++) el('span', '', brul);

  // Voorste rij gras over de hele breedte; valt over de voeten van de dieren.
  const voor = el('div', 'savanne-voorgras savanne-f', land);
  const aantal = 22;
  for (let i = 0; i < aantal; i++) {
    const p = el('div', 'savanne-pol', voor);
    p.style.left = `${(i / aantal) * 104 - 4 + Math.random() * 2}%`;
    p.style.setProperty('--maat', `${0.8 + Math.random() * 0.45}`);
    p.style.animationDelay = `${-Math.random() * 5}s`;
    p.innerHTML = grasPol();
  }

  const vuurvliegjes = el('div', 'savanne-vuurvliegjes', root);
  for (let i = 0; i < 12; i++) {
    const v = el('div', 'savanne-vuurvlieg', vuurvliegjes);
    v.style.left = `${3 + Math.random() * 94}%`;
    v.style.bottom = `${3 + Math.random() * 24}vh`;
    v.style.animationDelay = `${-Math.random() * 6}s, ${-Math.random() * 2}s`;
    v.style.animationDuration = `${5 + Math.random() * 4}s, ${1.4 + Math.random() * 1.4}s`;
  }

  const stil = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let levend = true;
  const losseTimers = new Set<number>();
  const later = (fn: () => void, ms: number) => {
    const t = window.setTimeout(() => {
      losseTimers.delete(t);
      if (levend) fn();
    }, ms);
    losseTimers.add(t);
  };

  // De eerste stand meteen tonen (zon al laag), daarna pas overgangen.
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('savanne--begin')));

  // ---- Dag en nacht ----
  let tijdStap = 0;
  let tijdTimer: number | undefined;
  function volgendeTijd(): void {
    window.clearTimeout(tijdTimer);
    if (!levend || stil) return;
    const [tijd, duur] = DAGCYCLUS[tijdStap % DAGCYCLUS.length];
    root.dataset.tijd = tijd;
    if (tijd === 'avond') later(vliegZwerm, 5000 + Math.random() * 6000);
    tijdStap++;
    tijdTimer = window.setTimeout(volgendeTijd, duur);
  }

  // Een zwerm vogels in V-vorm vliegt langs de lucht.
  function vliegZwerm(): void {
    const r = root.getBoundingClientRect();
    const n = 5 + Math.floor(Math.random() * 4);
    const naarRechts = Math.random() < 0.5;
    const y0 = r.height * (0.14 + Math.random() * 0.2);
    const duur = 14000 + Math.random() * 4000;
    for (let i = 0; i < n; i++) {
      const v = el('div', 'savanne-zwermvogel', zwerm);
      svgUitTekst(ZWERMVOGEL, 'savanne-zwermvogel__svg', v);
      const rij = Math.ceil(i / 2);
      const kant = i % 2 ? 1 : -1;
      const dx = -rij * 26 * (naarRechts ? 1 : -1);
      const dy = rij * kant * 13;
      const start = naarRechts ? -80 : r.width + 80;
      const eind = naarRechts ? r.width + 140 : -140;
      v.style.setProperty('--flap', `${0.45 + Math.random() * 0.2}s`);
      const anim = v.animate(
        [
          { transform: `translate(${start + dx}px, ${y0 + dy}px)` },
          { transform: `translate(${(start + eind) / 2 + dx}px, ${y0 + dy - 18}px)` },
          { transform: `translate(${eind + dx}px, ${y0 + dy + 6}px)` },
        ],
        { duration: duur, easing: 'linear', fill: 'forwards' },
      );
      anim.onfinish = () => v.remove();
    }
  }

  // ---- Leeuwen ----
  let knipTimer: number | undefined;
  function knipper(): void {
    window.clearTimeout(knipTimer);
    if (!levend || stil) return;
    knipTimer = window.setTimeout(() => {
      const l = alleLeeuwen[Math.floor(Math.random() * alleLeeuwen.length)];
      const ogen = l.querySelector('.leeuw__ogen');
      if (ogen) kortAan(ogen, 'knipper', 260);
      if (Math.random() < 0.18 && root.dataset.tijd !== 'nacht') kortAan(l, 'gaapt', 2400);
      else if (Math.random() < 0.25) kortAan(l, 'oorflap', 500);
      knipper();
    }, 1800 + Math.random() * 3200);
  }
  knipper();

  // ---- Bezoekers bij de waterpoel ----
  // Elke keer een willekeurig groepje: een olifantenfamilie, een paar gnoes of een paar
  // gazellen. Ze lopen van links naar de overkant van de poel, drinken een tijdje en lopen
  // dan weer links het beeld uit. Los daarvan komt af en toe een krokodil boven.
  type Soort = 'olifant' | 'gnoe' | 'gazelle';
  let bezoekTimer: number | undefined;
  let bezoekBezig = false;
  let aanHetWater: HTMLElement[] = [];
  const maakDier = (soort: Soort, klein = false) => {
    const o = el('div', `savanne-dier savanne-${soort}${klein ? ` savanne-${soort}--klein` : ''}`, kudde);
    svgUitTekst(soort === 'olifant' ? OLIFANT : soort === 'gnoe' ? GNOE : GAZELLE, 'savanne-dier__svg savanne-f', o);
    // Niet allemaal in de pas, en niet allemaal tegelijk de kop omhoog bij het drinken.
    o.style.setProperty('--stapvertraging', `${-Math.random()}s`);
    o.style.setProperty('--drinkvertraging', `${-Math.random() * 5}s`);
    return o;
  };
  function bezoek(gekozen?: Soort): void {
    window.clearTimeout(bezoekTimer);
    if (!levend || stil || bezoekBezig) return;
    bezoekBezig = true;
    const r = root.getBoundingClientRect();
    const p = poel.getBoundingClientRect();
    const wl = p.left - r.left;
    const kans = Math.random();
    const soort: Soort = gekozen ?? (kans < 0.45 ? 'olifant' : kans < 0.75 ? 'gnoe' : 'gazelle');
    let dieren: { o: HTMLElement; x: number; b: number }[];
    if (soort === 'olifant') {
      // Ze staan aan de overkant en steken hun slurf erin. De eerste grote vooraan, een
      // tweede grote erachter (links) en het jong rechts naast zijn moeder.
      const bodem = r.bottom - (p.top + p.height * 0.2);
      const familie: boolean[] = [false];
      const k = Math.random();
      if (k < 0.55) familie.push(true);
      else if (k < 0.8) familie.push(false, true);
      let leider = { x: 0, b: 0 };
      dieren = familie.map((klein, i) => {
        const o = maakDier('olifant', klein);
        const b = o.offsetWidth;
        let x: number;
        if (klein) {
          x = leider.x + leider.b * 0.98;
          o.style.bottom = `${bodem - b * 0.05}px`;
          o.style.zIndex = '2';
        } else if (i === 0) {
          x = wl + p.width * 0.3 - b * 0.5;
          leider = { x, b };
          o.style.bottom = `${bodem}px`;
        } else {
          x = leider.x - b * 0.62;
          o.style.bottom = `${bodem + 6}px`;
          o.style.zIndex = '0';
        }
        return { o, x, b };
      });
    } else {
      // Gnoes en gazellen staan naast elkaar langs de oever, met de voeten net in het water.
      const n = soort === 'gnoe' ? 3 + Math.floor(Math.random() * 3) : 2 + Math.floor(Math.random() * 3);
      const bodem = r.bottom - (p.top + p.height * 0.3);
      dieren = Array.from({ length: n }, (_, i) => {
        const o = maakDier(soort);
        const b = o.offsetWidth;
        const x = wl + p.width * 0.02 + (i * (p.width * 0.66 - b)) / Math.max(1, n - 1) + (Math.random() - 0.5) * b * 0.15;
        o.style.bottom = `${bodem + (Math.random() - 0.5) * b * 0.1}px`;
        o.style.zIndex = String(1 + Math.floor(Math.random() * 2));
        return { o, x, b };
      }).reverse(); // de voorste (rechtse) loopt voorop
    }
    const snelheid = Math.max(45, r.width * 0.06) * (soort === 'gazelle' ? 1.5 : soort === 'gnoe' ? 1.2 : 1);
    let langste = 0;
    dieren.forEach(({ o, x, b }, i) => {
      const start = -b - 20 - i * b * 0.6;
      const duur = ((x - start) / snelheid) * 1000;
      langste = Math.max(langste, duur);
      o.style.transform = `translateX(${start}px)`;
      o.classList.add('loopt');
      const heen = o.animate([{ transform: `translateX(${start}px)` }, { transform: `translateX(${x}px)` }], {
        duration: duur, easing: 'ease-out', fill: 'forwards',
      });
      heen.onfinish = () => {
        if (!levend) return;
        o.classList.remove('loopt');
        o.classList.add('drinkt');
        aanHetWater.push(o);
      };
    });
    const drinkDuur = 9000 + Math.random() * 6000;
    later(() => {
      aanHetWater = aanHetWater.filter((o) => !dieren.some((d) => d.o === o));
      let laatste = 0;
      dieren.forEach(({ o, x, b }, i) => {
        o.classList.remove('drinkt', 'spuit');
        o.classList.add('loopt', 'gespiegeld');
        const eind = -b - 40;
        const duur = ((x - eind) / snelheid) * 1000;
        const vertraging = (dieren.length - 1 - i) * 400;
        laatste = Math.max(laatste, duur + vertraging);
        const terug = o.animate([{ transform: `translateX(${x}px)` }, { transform: `translateX(${eind}px)` }], {
          duration: duur, delay: vertraging, easing: 'ease-in', fill: 'forwards',
        });
        terug.onfinish = () => o.remove();
      });
      later(() => {
        bezoekBezig = false;
        bezoekTimer = window.setTimeout(() => bezoek(), 8000 + Math.random() * 12000);
      }, laatste);
    }, langste + drinkDuur);
  }
  bezoekTimer = window.setTimeout(() => bezoek(), 1500 + Math.random() * 1500);

  // De krokodil: komt rustig boven tot zijn ogen, drijft even, knippert en zakt weer weg.
  let krokTimer: number | undefined;
  function krokodil(): void {
    window.clearTimeout(krokTimer);
    if (!levend || stil) return;
    const lr = land.getBoundingClientRect();
    const p = poel.getBoundingClientRect();
    const breedte = p.width * 0.3;
    const links = p.left - lr.left + p.width * (0.38 + Math.random() * 0.25);
    const waterlijn = p.top + p.height * (0.52 + Math.random() * 0.12);
    const k = el('div', 'savanne-krokodil');
    land.insertBefore(k, kudde);
    k.style.left = `${links}px`;
    k.style.bottom = `${lr.bottom - waterlijn}px`;
    k.style.width = `${breedte}px`;
    if (Math.random() < 0.5) k.classList.add('gespiegeld');
    const svg = svgUitTekst(KROKODIL, 'savanne-krokodil__svg savanne-f', k);
    const rimpel = el('div', 'savanne-rimpel');
    land.insertBefore(rimpel, k);
    rimpel.style.left = `${links + breedte * 0.5}px`;
    rimpel.style.top = `${waterlijn - lr.top}px`;
    rimpel.style.width = `${breedte * 1.3}px`;
    const blijf = 4000 + Math.random() * 4000;
    const totaal = 2600 + blijf + 2600;
    const op = 2600 / totaal;
    const neer = (2600 + blijf) / totaal;
    const dx = (Math.random() - 0.5) * breedte * 0.4;
    svg.animate(
      [
        { transform: 'translate(0, 100%)', easing: 'ease-out' },
        { transform: 'translate(0, 0)', offset: op },
        { transform: `translate(${dx / 2}px, 5%)`, offset: (op + neer) / 2 },
        { transform: `translate(${dx}px, 0)`, offset: neer, easing: 'ease-in' },
        { transform: `translate(${dx}px, 100%)` },
      ],
      { duration: totaal, fill: 'forwards' },
    ).onfinish = () => {
      k.remove();
      rimpel.remove();
    };
    later(() => kortAan(k, 'knipper', 400), 2600 + blijf * 0.45);
    krokTimer = window.setTimeout(krokodil, totaal + 14000 + Math.random() * 22000);
  }
  krokTimer = window.setTimeout(krokodil, 8000 + Math.random() * 12000);

  // Water uit de slurf: druppels in een boog omhoog en weer naar beneden.
  const spuit = (o: HTMLElement) => {
    kortAan(o, 'spuit', 2600);
    later(() => {
      const punt = o.querySelector('.olifant__slurfpunt');
      if (!punt) return;
      const lr = land.getBoundingClientRect();
      const pr = punt.getBoundingClientRect();
      for (let i = 0; i < 22; i++) {
        const d = el('div', 'savanne-druppel', land);
        d.style.left = `${pr.left - lr.left}px`;
        d.style.top = `${pr.top - lr.top}px`;
        const dx = 20 + Math.random() * 90;
        const op = 70 + Math.random() * 70;
        const anim = d.animate(
          [
            { transform: 'translate(0, 0) scale(0.6)', opacity: 1 },
            { transform: `translate(${dx * 0.5}px, ${-op}px) scale(1)`, opacity: 1, offset: 0.45 },
            { transform: `translate(${dx}px, ${op * 0.4}px) scale(0.8)`, opacity: 0 },
          ],
          { duration: 1100 + Math.random() * 500, delay: i * 45, easing: 'ease-out', fill: 'forwards' },
        );
        anim.onfinish = () => d.remove();
      }
    }, 650);
  };

  volgendeTijd();

  const juich = () => {
    kortAan(koning, 'brult', 1600);
    kortAan(welp, 'springt', 1300);
  };

  const feest = () => {
    juich();
    later(() => kortAan(leeuwin, 'springt', 1300), 500);
    if (stil) return;
    vliegZwerm();
    // Olifanten aan het water spuiten; is er niemand, dan komt er een olifantenfamilie.
    const olifanten = aanHetWater.filter((o) => o.classList.contains('savanne-olifant'));
    if (olifanten.length) olifanten.forEach((o, i) => later(() => spuit(o), i * 500));
    else bezoek('olifant');
  };

  const vernietig = () => {
    levend = false;
    window.clearTimeout(tijdTimer);
    window.clearTimeout(knipTimer);
    window.clearTimeout(bezoekTimer);
    window.clearTimeout(krokTimer);
    for (const t of losseTimers) window.clearTimeout(t);
    losseTimers.clear();
  };
  return { element: root, juich, feest, vernietig };
}
