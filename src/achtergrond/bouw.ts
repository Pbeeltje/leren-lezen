import type { Decor } from './achtergrond.ts';
import { el, kortAan, plaatje, svgUitTekst } from './hulp.ts';

// Bouwplaats: zonnige lucht boven een zandvlakte. Rechts een torenkraan naast een half
// gebouwd huis in de steigers; de giek zwenkt een beetje en het dak hangt aan de haak
// (de kraan beweegt via één rAF-lus, zodat het dak bij het feest precies landt). Links een
// graafmachine met een zandberg, vooraan pionnen en een afzetting. Af en toe rijdt er een
// kiepwagen heen of terug. Bij een goed antwoord schept de graafmachine zand en kiept het
// weer uit; aan het eind van een sessie zet de kraan het dak op het huis, de steiger gaat
// weg, de ramen gaan aan, de vlag gaat in de top en er vliegt confetti. Alles zelf getekend.

const GROND = `
<svg viewBox="0 0 1000 100" preserveAspectRatio="none">
  <path d="M0 6 C120 2 220 9 360 6 C520 2 640 10 800 5 C890 3 950 7 1000 5 L1000 100 L0 100 Z" fill="#eac680"/>
  <path d="M0 44 C160 38 300 48 480 43 C640 39 820 48 1000 42 L1000 100 L0 100 Z" fill="#dcab69"/>
  <path d="M0 74 C200 70 380 77 560 73 C760 69 900 76 1000 72 L1000 100 L0 100 Z" fill="#c9925a"/>
  <g fill="#b98149" opacity="0.7">
    <ellipse cx="90" cy="86" rx="7" ry="2.5"/><ellipse cx="330" cy="90" rx="5" ry="2"/>
    <ellipse cx="610" cy="85" rx="8" ry="2.5"/><ellipse cx="870" cy="91" rx="6" ry="2"/>
  </g>
  <g fill="#cf9f60" opacity="0.6">
    <ellipse cx="220" cy="24" rx="9" ry="2.5"/><ellipse cx="540" cy="20" rx="7" ry="2"/>
    <ellipse cx="700" cy="58" rx="8" ry="2.5"/><ellipse cx="160" cy="60" rx="6" ry="2"/>
  </g>
</svg>`;

// Het dak in eigen coördinaten: (0,0) is het punt waar het aan de haak hangt.
const DAK = `
  <rect x="38" y="40" width="16" height="30" fill="#b5532f" stroke="#6e2a14" stroke-width="3"/>
  <path d="M-98 100 L0 26 L98 100 Z" fill="#e2543e" stroke="#8c2a1d" stroke-width="4" stroke-linejoin="round"/>
  <path d="M-26 46 H26 M-50 64 H50 M-74 82 H74" stroke="#bf3d2c" stroke-width="3"/>
  <rect x="-102" y="96" width="204" height="8" rx="3" fill="#fff3e0" stroke="#8c2a1d" stroke-width="2.5"/>`;

// Vakwerk van de kraan: zigzag tussen twee lijnen, met een lusje gegenereerd.
const torenVakwerk = (): string => {
  let d = '';
  for (let y = 524; y > 140; y -= 28) d += `M347 ${y} L373 ${y - 28} H347 `;
  return d;
};
const giekVakwerk = (): string => {
  let d = 'M36 112 L56 97 ';
  for (let x = 56; x < 376; x += 20) d += `L${x + 10} 112 L${x + 20} 97 `;
  return d;
};

// Kraan en huis in één tekening, zodat het dak precies op het huis kan zakken.
// Huismuur 70–230, bovenkant muur op y=360; de kraan draait om x=360.
const KRAAN_X = 360;
const HUIS_X = 150;
const KAT_Y = 120; // onderkant van het loopkatje, waar de kabel begint
const LANDING = 260 - KAT_Y; // kabellengte waarbij het dak op de muren staat

const BOUWPLAATS = `
<svg viewBox="0 0 420 540" aria-hidden="true">
  <defs>
    <pattern id="bouw-steen" width="24" height="12" patternUnits="userSpaceOnUse">
      <rect width="24" height="12" fill="#dc7448"/>
      <path d="M0 0.5 H24 M0 6.5 H24 M6 0 V6 M18 6 V12" stroke="#b8552f" stroke-width="1.5"/>
    </pattern>
  </defs>

  <!-- de toren -->
  <rect x="330" y="522" width="60" height="18" rx="3" fill="#b9b4ab" stroke="#7d786f" stroke-width="2.5"/>
  <path d="${torenVakwerk()}" fill="none" stroke="#e8a900" stroke-width="3" stroke-linejoin="round"/>
  <path d="M347 524 V112 M373 524 V112" stroke="#ffc21a" stroke-width="6"/>
  <path d="M344 524 V112 M376 524 V112" stroke="#9a6a00" stroke-width="1.5"/>
  <path d="M350 97 L360 42 L370 97" fill="none" stroke="#ffc21a" stroke-width="5" stroke-linejoin="round"/>

  <!-- de giek zwenkt (schaal in x rond de toren) -->
  <g class="bouw-giek-arm">
    <path d="M360 44 L150 97 M360 44 L418 100" stroke="#6b6e78" stroke-width="2"/>
    <path d="${giekVakwerk()}" fill="none" stroke="#e8a900" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M36 112 H420 M56 97 H420" stroke="#ffc21a" stroke-width="5" stroke-linecap="round"/>
    <rect x="394" y="112" width="26" height="28" rx="2" fill="#a9a49b" stroke="#6f6a62" stroke-width="2"/>
    <path d="M394 126 H420" stroke="#6f6a62" stroke-width="2"/>
    <rect x="374" y="112" width="18" height="22" rx="3" fill="#ffc21a" stroke="#9a6a00" stroke-width="2"/>
    <rect x="377" y="116" width="12" height="9" rx="1.5" fill="#bfe6ff"/>
  </g>

  <!-- huis in de steigers -->
  <g class="bouw-huis">
    <rect x="258" y="531" width="62" height="9" fill="#a8743f" stroke="#6e4a22" stroke-width="2"/>
    <g fill="#dc7448" stroke="#9a3f1d" stroke-width="2">
      <rect x="262" y="519" width="18" height="12"/><rect x="280" y="519" width="18" height="12"/><rect x="298" y="519" width="18" height="12"/>
      <rect x="271" y="507" width="18" height="12"/><rect x="289" y="507" width="18" height="12"/>
    </g>
    <g class="bouw-dak-huis" transform="translate(${HUIS_X} 260)">${DAK}</g>
    <rect x="70" y="358" width="160" height="182" fill="url(#bouw-steen)" stroke="#8c3b1f" stroke-width="4"/>
    <rect x="70" y="446" width="160" height="8" fill="#ece5d9"/>
    <g class="bouw-ramen" stroke="#fff" stroke-width="4">
      <rect class="bouw-raam" x="86" y="476" width="36" height="34" rx="2" style="transition-delay:0s"/>
      <rect class="bouw-raam" x="178" y="476" width="36" height="34" rx="2" style="transition-delay:.25s"/>
      <rect class="bouw-raam" x="86" y="384" width="36" height="34" rx="2" style="transition-delay:.5s"/>
      <rect class="bouw-raam" x="132" y="384" width="36" height="34" rx="2" style="transition-delay:.75s"/>
      <rect class="bouw-raam" x="178" y="384" width="36" height="34" rx="2" style="transition-delay:1s"/>
      <path d="M104 476 V510 M86 493 H122 M196 476 V510 M178 493 H214 M104 384 V418 M86 401 H122 M150 384 V418 M132 401 H168 M196 384 V418 M178 401 H214" stroke-width="3"/>
    </g>
    <rect x="135" y="480" width="30" height="60" rx="4" fill="#3f7fc0" stroke="#24507a" stroke-width="3"/>
    <circle cx="158" cy="512" r="2.5" fill="#ffd23f"/>
    <g class="bouw-vlag">
      <path d="M${HUIS_X} 288 V226" stroke="#6b6b6b" stroke-width="3" stroke-linecap="round"/>
      <g class="bouw-vlag__doek">
        <rect x="${HUIS_X + 1}" y="228" width="34" height="7" fill="#e0393e"/>
        <rect x="${HUIS_X + 1}" y="235" width="34" height="7" fill="#fff"/>
        <rect x="${HUIS_X + 1}" y="242" width="34" height="7" fill="#2f5fb3"/>
      </g>
    </g>
    <g class="bouw-steiger">
      <path d="M56 540 V350 M244 540 V350" stroke="#7d8ea6" stroke-width="5" stroke-linecap="round"/>
      <path d="M56 432 H244 M56 352 H244" stroke="#7d8ea6" stroke-width="3"/>
      <path d="M56 540 L70 456 M244 540 L230 456" stroke="#7d8ea6" stroke-width="3"/>
      <rect x="48" y="452" width="204" height="8" rx="2" fill="#d39a55" stroke="#8a5a2b" stroke-width="2"/>
      <rect x="48" y="370" width="204" height="8" rx="2" fill="#d39a55" stroke="#8a5a2b" stroke-width="2"/>
    </g>
  </g>

  <!-- loopkat met kabel, haak en het dak eraan -->
  <g class="bouw-kat" transform="translate(${HUIS_X + 50} 0)">
    <rect x="-13" y="111" width="26" height="9" rx="2" fill="#6b6e78" stroke="#3d3d48" stroke-width="2"/>
    <line class="bouw-kabel" x1="0" y1="${KAT_Y}" x2="0" y2="${KAT_Y + 50}" stroke="#3d3d48" stroke-width="2"/>
  </g>
  <g class="bouw-haak" transform="translate(${HUIS_X + 50} ${KAT_Y + 60})">
    <g class="bouw-last">
      <g class="bouw-dak-haak">
        <path d="M0 8 L-46 65 M0 8 L46 65" stroke="#4a4a55" stroke-width="2"/>${DAK}
      </g>
      <rect x="-9" y="-12" width="18" height="14" rx="3" fill="#ffc21a" stroke="#9a6a00" stroke-width="2"/>
      <path d="M0 2 V8 C0 14 -7 14 -7 9" fill="none" stroke="#4a4a55" stroke-width="3" stroke-linecap="round"/>
    </g>
  </g>
</svg>`;

// Graafmachine met zandberg; giek, steel en bak zijn geneste groepen die los draaien.
const GRAVER = `
<svg viewBox="0 0 330 210" aria-hidden="true">
  <path d="M194 208 C216 160 248 128 278 128 C304 128 318 162 328 208 Z" fill="#f0c879"/>
  <path d="M278 128 C304 128 318 162 328 208 H300 C300 172 292 142 278 128 Z" fill="#ddb062"/>
  <g fill="#c99a52"><circle cx="252" cy="182" r="3"/><circle cx="286" cy="164" r="2.5"/><circle cx="268" cy="196" r="2.5"/></g>

  <rect x="12" y="172" width="146" height="34" rx="17" fill="#3d3d48"/>
  <rect x="20" y="178" width="130" height="22" rx="11" fill="#5a5a66"/>
  <g fill="#8b8b97"><circle cx="34" cy="189" r="7"/><circle cx="62" cy="189" r="7"/><circle cx="90" cy="189" r="7"/><circle cx="118" cy="189" r="7"/><circle cx="142" cy="189" r="7"/></g>
  <rect x="40" y="162" width="100" height="12" fill="#2f2f38"/>
  <rect x="128" y="94" width="7" height="26" rx="2" fill="#4a4a55"/>
  <path d="M18 162 V128 C18 122 22 118 28 118 H150 C156 118 160 122 160 128 V162 Z" fill="#ffc21a" stroke="#9a6a00" stroke-width="3" stroke-linejoin="round"/>
  <path d="M30 118 V64 C30 58 34 54 40 54 H86 C92 54 96 58 98 64 L106 118 Z" fill="#ffc21a" stroke="#9a6a00" stroke-width="3" stroke-linejoin="round"/>
  <path d="M40 112 V68 C40 65 42 63 45 63 H84 C87 63 89 65 90 68 L96 112 Z" fill="#bfe6ff" stroke="#9a6a00" stroke-width="2"/>
  <path d="M48 104 L60 70 M58 106 L66 86" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.8"/>
  <rect x="18" y="146" width="142" height="7" fill="#2f2f38"/>

  <g class="bouw-giek">
    <path d="M140 134 C150 96 180 64 222 56 L230 72 C192 80 166 104 160 138 Z" fill="#ffc21a" stroke="#9a6a00" stroke-width="3" stroke-linejoin="round"/>
    <path d="M160 112 L198 80" stroke="#c9ccd3" stroke-width="6" stroke-linecap="round"/>
    <g class="bouw-steel">
      <path d="M216 58 L234 60 L264 140 L248 146 Z" fill="#ffc21a" stroke="#9a6a00" stroke-width="3" stroke-linejoin="round"/>
      <g class="bouw-bak">
        <path class="bouw-bak__zand" d="M243 179 C230 170 234 150 251 142 C256 158 254 172 243 179 Z" fill="#e9bd6c"/>
        <path d="M250 140 L264 138 C280 154 280 176 263 187 L236 189 L242 180 Z" fill="#4a4a55" stroke="#2a2a33" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M237 189 L233 196 L240 190 L239 197 L246 189" fill="#9a9aa6" stroke="#2a2a33" stroke-width="1.5" stroke-linejoin="round"/>
        <circle cx="256" cy="142" r="4.5" fill="#2f2f38"/>
      </g>
      <circle cx="224" cy="64" r="5" fill="#2f2f38"/>
    </g>
    <circle cx="150" cy="126" r="5.5" fill="#2f2f38"/>
  </g>
</svg>`;

// Kiepwagen met een lading zand, kijkt naar rechts; de wielen draaien los.
const wiel = (x: number) => `
  <g transform="translate(${x} 97)"><g class="bouw-wiel">
    <circle r="19" fill="#2f2f38"/><circle r="9" fill="#b9bcc6"/>
    <path d="M-8 0 H8 M0 -8 V8" stroke="#6b6e78" stroke-width="3"/>
  </g></g>`;
const KIEPWAGEN = `
<svg viewBox="0 0 200 118" aria-hidden="true">
  <path d="M16 34 C40 10 92 4 128 34 Z" fill="#c98a45" stroke="#94602a" stroke-width="2.5"/>
  <path d="M8 30 H134 L124 78 H22 Z" fill="#ff8a1f" stroke="#9c4a00" stroke-width="3" stroke-linejoin="round"/>
  <path d="M46 34 V74 M78 34 V74 M108 34 V74" stroke="#e06f0a" stroke-width="4"/>
  <rect x="14" y="74" width="176" height="12" rx="4" fill="#3d3d48"/>
  <path d="M138 78 V40 C138 34 142 30 148 30 H168 C176 30 180 36 182 42 L190 62 V78 Z" fill="#ffc21a" stroke="#9a6a00" stroke-width="3" stroke-linejoin="round"/>
  <path d="M146 38 H166 C170 38 172 40 174 44 L180 58 H146 Z" fill="#bfe6ff" stroke="#9a6a00" stroke-width="2"/>
  <circle cx="186" cy="68" r="3.5" fill="#fff3b0"/>
  ${wiel(48)}${wiel(156)}
</svg>`;

const PION = `
<svg viewBox="0 0 40 50" aria-hidden="true">
  <path d="M13 45 L18.5 6 C19.2 2 20.8 2 21.5 6 L27 45 Z" fill="#ff7a2f" stroke="#c4471a" stroke-width="2" stroke-linejoin="round"/>
  <path d="M16 24 H24 L25.2 32 H14.8 Z" fill="#fff"/>
  <rect x="3" y="43" width="34" height="6" rx="2" fill="#e2572b" stroke="#a83a16" stroke-width="1.5"/>
</svg>`;

const AFZETTING = `
<svg viewBox="0 0 120 64" aria-hidden="true">
  <path d="M18 30 V58 M102 30 V58" stroke="#6b6e78" stroke-width="6"/>
  <path d="M8 60 H28 M92 60 H112" stroke="#4a4a55" stroke-width="5" stroke-linecap="round"/>
  <rect x="4" y="12" width="112" height="20" rx="4" fill="#fff" stroke="#b3261e" stroke-width="2.5"/>
  <path d="M14 13 L30 13 L20 31 L4 31 Z M44 13 L60 13 L50 31 L34 31 Z M74 13 L90 13 L80 31 L64 31 Z M104 13 L116 13 L116 18 L110 31 L94 31 Z" fill="#e0393e"/>
  <circle cx="60" cy="8" r="5" fill="#ffd23f" stroke="#c77d00" stroke-width="2"/>
</svg>`;

const KIEP_MS = 16000;
const CONFETTI = ['#ff6b6b', '#ffd23f', '#4dabf7', '#69db7c', '#b197fc', '#ff922b'];

export function maakBouwDecor(): Decor {
  const root = el('div', 'decor decor-bouw');
  plaatje('assets/achtergrond/zon.svg', 'bouw-zon', root);
  plaatje('assets/achtergrond/wolk.svg', 'drijf-wolk drijf-wolk--1', root);
  plaatje('assets/achtergrond/wolk.svg', 'drijf-wolk drijf-wolk--2', root);

  svgUitTekst(GROND, 'bouw-grond', root);
  const plaats = svgUitTekst(BOUWPLAATS, 'bouw-plaats', root);
  const giekArm = plaats.querySelector('.bouw-giek-arm') as SVGGElement;
  const kat = plaats.querySelector('.bouw-kat') as SVGGElement;
  const kabel = plaats.querySelector('.bouw-kabel') as SVGLineElement;
  const haak = plaats.querySelector('.bouw-haak') as SVGGElement;
  const last = plaats.querySelector('.bouw-last') as SVGGElement;
  const dakOpHuis = plaats.querySelector('.bouw-dak-huis') as SVGGElement;

  const kiepBaan = el('div', 'bouw-kiepbaan', root);
  const graver = svgUitTekst(GRAVER, 'bouw-graver', root);
  const bak = graver.querySelector('.bouw-bak') as SVGGElement;
  svgUitTekst(AFZETTING, 'bouw-afzetting', root);
  for (let i = 1; i <= 4; i++) svgUitTekst(PION, `bouw-pion bouw-pion--${i}`, root);

  const stil = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let levend = true;
  let timer: number | undefined;
  let resetTimer: number | undefined;
  let rafId = 0;

  // ---- De kraan: loopkat (kx), kabellengte (kl), zwenk (zw) en slingeren (hoek). ----
  const stand = { kx: HUIS_X + 50, kl: 70, zw: 1, hoek: 0 };
  // Tijdens het feest: van welke stand naar welke, vanaf wanneer.
  let feestStart = -1;
  let feestVan = { ...stand };
  let feestBezig = false; // van het begin tot het huis weer "in aanbouw" is

  const teken = () => {
    giekArm.setAttribute('transform', `translate(${KRAAN_X} 0) scale(${stand.zw} 1) translate(${-KRAAN_X} 0)`);
    const x = KRAAN_X + (stand.kx - KRAAN_X) * stand.zw;
    kat.setAttribute('transform', `translate(${x} 0)`);
    kabel.setAttribute('y2', String(KAT_Y + stand.kl - 12));
    haak.setAttribute('transform', `translate(${x} ${KAT_Y + stand.kl})`);
    last.setAttribute('transform', `rotate(${stand.hoek})`);
  };

  const zacht = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
  const naar = (a: number, b: number, t: number) => a + (b - a) * zacht(t);

  // Rustig: de giek zwenkt een beetje, het katje rijdt heen en weer, de last schommelt.
  // De grenzen houden het dak boven het huis en weg van de toren.
  let vorige = 0;
  const lus = (nu: number) => {
    if (!levend) return;
    const dt = Math.min(0.1, vorige ? (nu - vorige) / 1000 : 0);
    vorige = nu;
    const t = nu / 1000;
    if (feestStart >= 0) {
      const f = nu - feestStart;
      if (f < 1800) {
        const p = f / 1800;
        stand.kx = naar(feestVan.kx, HUIS_X, p);
        stand.kl = naar(feestVan.kl, 60, p);
        stand.zw = naar(feestVan.zw, 1, p);
        stand.hoek = naar(feestVan.hoek, 0, p);
      } else if (f < 3000) {
        stand.kx = HUIS_X;
        stand.zw = 1;
        stand.hoek = 0;
        stand.kl = naar(60, LANDING, (f - 1800) / 1200);
      } else {
        if (!plaats.classList.contains('bouw-af')) klaar();
        stand.kl = naar(LANDING, 60, (f - 3000) / 1500);
        if (f >= 4500) feestStart = -1;
      }
    } else {
      const k = 1 - Math.exp(-dt * 1.5);
      stand.kx += (HUIS_X + 42 + 40 * Math.sin(t * 0.13 + 0.5) - stand.kx) * k;
      stand.kl += (70 + 24 * Math.sin(t * 0.31) - stand.kl) * k;
      stand.zw += (0.94 + 0.06 * Math.sin(t * 0.21) - stand.zw) * k;
      stand.hoek += (3 * Math.sin(t * 1.1) - stand.hoek) * k;
    }
    teken();
    rafId = requestAnimationFrame(lus);
  };
  teken();
  if (!stil) rafId = requestAnimationFrame(lus);

  // ---- De kiepwagen rijdt af en toe heen of terug (nooit tijdens het feest). ----
  let naarRechts = Math.random() < 0.5;
  function plan(): void {
    window.clearTimeout(timer);
    if (!levend || stil) return;
    timer = window.setTimeout(() => {
      if (feestBezig) return plan();
      const k = el('div', 'bouw-kiep', kiepBaan);
      k.style.setProperty('--van-x', naarRechts ? '-16vw' : '104vw');
      k.style.setProperty('--naar-x', naarRechts ? '104vw' : '-16vw');
      const schok = el('div', 'bouw-kiep__schok', k);
      const svg = svgUitTekst(KIEPWAGEN, 'bouw-kiep__lijf', schok);
      if (!naarRechts) svg.classList.add('gespiegeld');
      naarRechts = !naarRechts;
      window.setTimeout(() => k.remove(), KIEP_MS + 200);
      window.setTimeout(plan, KIEP_MS);
    }, 6000 + Math.random() * 12000);
  }
  plan();

  // Zandkorrels vanuit de bak van de graafmachine.
  const korrels = (aantal: number, omhoog: number) => {
    const vak = bak.getBoundingClientRect();
    const r = root.getBoundingClientRect();
    for (let i = 0; i < aantal; i++) {
      const c = el('div', 'bouw-korrel', root);
      c.style.left = `${vak.left - r.left + vak.width * (0.2 + Math.random() * 0.6)}px`;
      c.style.top = `${vak.top - r.top + vak.height * 0.5}px`;
      c.style.setProperty('--dx', `${(Math.random() - 0.5) * 70}px`);
      c.style.setProperty('--op', `${-omhoog * (0.5 + Math.random() * 0.5)}px`);
      const maat = 4 + Math.random() * 5;
      c.style.width = c.style.height = `${maat}px`;
      c.style.animationDelay = `${(Math.random() * 0.15).toFixed(2)}s`;
      window.setTimeout(() => c.remove(), 1400);
    }
  };

  const juich = () => {
    kortAan(graver, 'graaft', 2000);
    if (stil) return;
    window.setTimeout(() => levend && korrels(6, 26), 300);
    window.setTimeout(() => levend && korrels(14, 46), 1500);
  };

  // Het dak is geland: steiger weg, ramen aan, vlag in de top, confetti.
  const klaar = () => {
    plaats.classList.add('bouw-af');
    if (!stil) {
      const vak = dakOpHuis.getBoundingClientRect();
      const r = root.getBoundingClientRect();
      for (let i = 0; i < 28; i++) {
        const c = el('div', 'bouw-confetti', root);
        c.style.left = `${vak.left - r.left + vak.width * (0.15 + Math.random() * 0.7)}px`;
        c.style.top = `${vak.top - r.top + vak.height * 0.3}px`;
        c.style.background = CONFETTI[i % CONFETTI.length];
        c.style.setProperty('--dx', `${(Math.random() - 0.5) * 260}px`);
        c.style.setProperty('--op', `${-60 - Math.random() * 110}px`);
        c.style.setProperty('--draai', `${(Math.random() - 0.5) * 900}deg`);
        c.style.animationDelay = `${(Math.random() * 0.4).toFixed(2)}s`;
        window.setTimeout(() => c.remove(), 3000);
      }
    }
    // Na een poosje wordt er een nieuw huis gebouwd: alles zacht terug.
    window.clearTimeout(resetTimer);
    resetTimer = window.setTimeout(() => {
      plaats.classList.remove('bouw-af');
      feestBezig = false;
    }, 11000);
  };

  const feest = () => {
    juich();
    if (feestBezig) return;
    feestBezig = true;
    if (stil) {
      klaar();
      return;
    }
    feestVan = { ...stand };
    feestStart = performance.now();
  };

  const vernietig = () => {
    levend = false;
    window.clearTimeout(timer);
    window.clearTimeout(resetTimer);
    cancelAnimationFrame(rafId);
  };
  return { element: root, juich, feest, vernietig };
}
