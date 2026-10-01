import type { Decor } from './achtergrond.ts';
import { el, kortAan, plaatje, svgUitTekst } from './hulp.ts';

// Boerderij: een vlakke Hollandse polder met een lange horizon. Achteraan een rij bomen en
// een dorpje met een kerktoren, daarvoor smalle akkers (weiland, een bollenveld met tulpen)
// met een klassieke stellingmolen waarvan de wieken (wit zeil op een houten hekwerk) rustig
// tegen de klok in draaien. Daarvoor slootjes die in perspectief naar de horizon lopen (met
// glinsteringen, een houten bruggetje en riet), een wuivend tarweveld, een geploegde akker
// en een rode schuur, een zandweg waarover af en toe een tractor rijdt, en vooraan een hek
// met een koe, een varken, een schaap, een haan en kuikentjes. Bij een goed antwoord springt
// de koe op met "boe!"; aan het eind van een sessie springen alle dieren na elkaar. Dieren
// en tractor zijn Fluent Emoji; polder, molen, schuur, brug, riet, tarwe en hek zijn zelf
// getekend.

// ---- Polder (viewBox 1000 x 300, rekt mee met het scherm) ----
// Alle perceelranden en slootjes lopen naar één verdwijnpunt boven de horizon, zodat ze
// vooraan breder zijn dan achteraan. De plekken (y) gebruikt de CSS ook (in % van 300).
const HORIZON = 96;
const VP = { x: 500, y: 30 };
/** x op hoogte y van een lijn die op de horizon bij xh begint en naar het verdwijnpunt loopt. */
const xOp = (xh: number, y: number): number => VP.x + ((xh - VP.x) * (y - VP.y)) / (HORIZON - VP.y);
const r = (n: number): string => n.toFixed(1);
/** Een perceel tussen twee lijnen naar het verdwijnpunt, van y1 tot y2. */
function strook(xa: number, xb: number, y1: number, y2: number, kleur: string, klasse = ''): string {
  const p = [
    [xOp(xa, y1), y1],
    [xOp(xb, y1), y1],
    [xOp(xb, y2), y2],
    [xOp(xa, y2), y2],
  ];
  const k = klasse ? ` class="${klasse}"` : '';
  return `<polygon${k} points="${p.map(([x, y]) => `${r(x)},${r(y)}`).join(' ')}" fill="${kleur}"/>`;
}

// Hoogtes (y) van de banden, van achter naar voor.
const SLOOT_A = [127, 130]; // dwarssloot achter
const VELD2 = [130, 175]; // middenakkers: tarwe, wei, geploegd
const WEG = [175, 186]; // zandweg (tractor)
const SLOOT_B = [190, 197]; // dwarssloot voor
const LENGTESLOOT = [486, 495]; // sloot naar de horizon (x op de horizon)

function maakPolder(): string {
  const d: string[] = [];
  // Achterste akkers, tot de dwarssloot.
  const [y1, y2] = [HORIZON, SLOOT_A[0]];
  d.push(strook(-300, 160, y1, y2, '#a3d377'));
  d.push(strook(160, 330, y1, y2, '#b4dd86'));
  d.push(strook(330, LENGTESLOOT[0], y1, y2, '#9ccd6f'));
  d.push(strook(LENGTESLOOT[1], 640, y1, y2, '#b7de8a'));
  // Bollenveld: rijen tulpen, vooraan breder.
  const tulpen = ['#f07a6a', '#f6d35b', '#f39ab9', '#f07a6a', '#f6d35b', '#f39ab9', '#f07a6a'];
  const rijen = [96, 99, 102, 106, 110, 115, 121, 127];
  tulpen.forEach((kleur, i) => d.push(strook(640, 820, rijen[i], rijen[i + 1], kleur)));
  d.push(strook(820, 1300, y1, y2, '#a6d57a'));

  // Middenakkers: tarwe (de halmen staan er als losse laag overheen), wei, geploegde akker.
  const [m1, m2] = VELD2;
  d.push(strook(-900, 420, m1, m2, '#e2b950'));
  d.push(strook(420, LENGTESLOOT[0], m1, m2, '#a8d47a'));
  d.push(strook(LENGTESLOOT[1], 560, m1, m2, '#b2da84'));
  d.push(strook(560, 640, m1, m2, '#b98a5a'));
  for (let xh = 566; xh < 640; xh += 9) {
    d.push(
      `<line x1="${r(xOp(xh, m1))}" y1="${m1}" x2="${r(xOp(xh, m2))}" y2="${m2}" stroke="#9c6f43" stroke-width="1.6" vector-effect="non-scaling-stroke"/>`,
    );
  }
  d.push(strook(640, 1600, m1, m2, '#9fcf6f'));

  // Zandweg met een grasrandje en de voorste dwarssloot.
  d.push(`<rect x="0" y="${WEG[0]}" width="1000" height="${WEG[1] - WEG[0]}" fill="#ead6a0"/>`);
  d.push(`<rect x="0" y="${WEG[1] - 2}" width="1000" height="2" fill="#d6bd82"/>`);
  d.push(`<rect x="0" y="${WEG[1]}" width="1000" height="${SLOOT_B[0] - WEG[1]}" fill="#86c55e"/>`);

  // Voorste wei met maaibanen naar het verdwijnpunt.
  for (let xh = -400, i = 0; xh < 1400; xh += 34, i++) {
    d.push(strook(xh, xh + 34, SLOOT_B[1], 300, i % 2 ? '#73be4f' : '#7cc657'));
  }

  // Water: de dwarssloten en de lengtesloot (die smal begint bij de horizon).
  const water = '#6cc2ee';
  d.push(`<rect x="0" y="${SLOOT_A[0]}" width="1000" height="${SLOOT_A[1] - SLOOT_A[0]}" fill="${water}"/>`);
  d.push(strook(LENGTESLOOT[0], LENGTESLOOT[1], HORIZON, SLOOT_B[0], water));
  d.push(`<rect x="0" y="${SLOOT_B[0]}" width="1000" height="${SLOOT_B[1] - SLOOT_B[0]}" fill="#58b3e6"/>`);
  d.push(`<rect x="0" y="${SLOOT_B[0]}" width="1000" height="1.6" fill="#3f93c6"/>`);
  d.push(`<rect x="0" y="${SLOOT_A[0]}" width="1000" height="0.9" fill="#4aa2d4"/>`);

  // Glinsteringen op het water (gaan met CSS aan en uit).
  const glans = (x: number, y: number, b: number, h: number, vertraging: number) =>
    `<rect class="polder-glans" x="${r(x)}" y="${y}" width="${b}" height="${h}" rx="${h / 2}" fill="#fff" style="animation-delay:${vertraging}s"/>`;
  d.push(glans(90, 128.2, 26, 1, 0), glans(380, 128.2, 18, 1, -2.6), glans(760, 128.2, 30, 1, -1.3));
  d.push(glans(150, 193, 46, 1.8, -0.7), glans(600, 192.8, 34, 1.8, -3.1), glans(880, 193.2, 40, 1.8, -1.9));
  d.push(glans(xOp(490, 160) - 1.5, 158, 3, 5, -2.2));

  d.push(maakWegbrug());

  return `<svg viewBox="0 0 1000 300" preserveAspectRatio="none" aria-hidden="true">${d.join('')}</svg>`;
}

// Waar de lengtesloot onder de zandweg door gaat ligt een laag bakstenen bruggetje met een
// witte houten leuning aan beide kanten; de sloot loopt eronderdoor naar de voorste sloot.
// Lijnen houden hun dikte (non-scaling-stroke), want de polder rekt mee met het scherm.
function maakWegbrug(): string {
  const [xa, xb] = [LENGTESLOOT[0] - 8, LENGTESLOOT[1] + 8];
  const d: string[] = [];
  // Brugdek: de weg loopt door over het water, met een bakstenen voorkant en een boogje.
  d.push(strook(xa, xb, WEG[0], WEG[1], '#e3cd93'));
  d.push(strook(xa + 1, xb - 1, WEG[1], SLOOT_B[0] + 0.5, '#b65a43'));
  const [ba, bb] = [xOp(LENGTESLOOT[0], SLOOT_B[0]), xOp(LENGTESLOOT[1], SLOOT_B[0])];
  d.push(`<path d="M${r(ba)} ${SLOOT_B[0] + 0.5} Q${r((ba + bb) / 2)} ${WEG[1] + 0.6} ${r(bb)} ${SLOOT_B[0] + 0.5} Z" fill="#3f93c6"/>`);
  // Leuningen: achter langs de achterrand van de weg, voor langs de voorrand.
  const lijn = 'fill="none" vector-effect="non-scaling-stroke" stroke-linecap="round"';
  for (const [y, hoog] of [
    [WEG[0], 3.5],
    [WEG[1], 4.5],
  ]) {
    const [x1, x2] = [xOp(xa + 1, y), xOp(xb - 1, y)];
    // Een licht bolle leuning, zoals bij een echt Hollands bruggetje.
    const bol = (f: number) => y - hoog - 4 * f * (1 - f) * 1.6;
    const palen = [0, 0.25, 0.5, 0.75, 1].map((f) => [x1 + (x2 - x1) * f, bol(f)]);
    const leuning = `M${r(x1)} ${r(bol(0))} Q${r((x1 + x2) / 2)} ${r(y - hoog - 3.2)} ${r(x2)} ${r(bol(1))}`;
    const pad = `${leuning} ${palen.map(([x, top]) => `M${r(x)} ${r(top)} V${y}`).join(' ')}`;
    d.push(`<path d="${pad}" stroke="#6f5c47" stroke-width="3.6" ${lijn}/>`);
    d.push(`<path d="${pad}" stroke="#fbf6ea" stroke-width="2" ${lijn}/>`);
  }
  return d.join('');
}

// Klassieke Hollandse stellingmolen: bakstenen onderbouw met deurtje, een houten stelling
// (omloop) met leuning, een achtkantige rieten romp met venster, een rieten kap en vier
// wieken. Elke wiek is een houten roede met aan één kant een hekwerk waarop een wit zeil
// half is voorgezet. De wieken zijn een eigen groep die rond de as draait (100, 78 in de
// tekening, 120, 100 in de viewBox: de tekening is 20/22 opgeschoven voor de lange wieken).
const WIEK = `
  <rect x="98" y="-14" width="4" height="86" rx="1.5" fill="#5a3d28"/>
  <rect x="102" y="-12" width="22" height="72" fill="none" stroke="#7a4e30" stroke-width="1.8"/>
  <path d="M102 -4 H124 M102 4 H124 M102 12 H124 M102 20 H124 M102 28 H124 M102 36 H124 M102 44 H124 M102 52 H124 M113 -12 V60" stroke="#7a4e30" stroke-width="1.2"/>
  <path d="M103 -11 H123 L123 30 C117 33 109 33 103 30 Z" fill="#fbf6ea" stroke="#d7c9ad" stroke-width="1"/>
  <path d="M113 -11 V32" stroke="#e4d9c2" stroke-width="1"/>`;

const MOLEN = `
<svg viewBox="0 0 240 324" aria-hidden="true">
  <g transform="translate(20 22)">
  <path d="M60 300 L66 204 L134 204 L140 300 Z" fill="#b65a43" stroke="#6e3022" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M65 222 H135 M64 240 H136 M63 258 H137 M62 276 H138 M61 294 H139" stroke="#9c4a36" stroke-width="1.5"/>
  <path d="M88 300 V272 C88 262 112 262 112 272 V300 Z" fill="#2f6b4a" stroke="#1d4630" stroke-width="2"/>
  <circle cx="107" cy="286" r="1.6" fill="#f3e3a8"/>
  <rect x="117" y="232" width="11" height="14" rx="1.5" fill="#fff4cf" stroke="#6e3022" stroke-width="1.8"/>
  <path d="M68 204 L84 204 L90 94 L82 94 Z" fill="#6a5743"/>
  <path d="M84 204 L116 204 L110 94 L90 94 Z" fill="#857058"/>
  <path d="M116 204 L132 204 L118 94 L110 94 Z" fill="#9a846a"/>
  <path d="M75 190 L84 104 M80 196 L87 100 M91 196 L94 100 M100 198 V100 M109 196 L106 100 M120 196 L113 100 M126 192 L116 104" stroke="#6f5c47" stroke-width="1" opacity="0.7"/>
  <path d="M68 204 L82 94 L118 94 L132 204 Z" fill="none" stroke="#4a3a2a" stroke-width="2.5" stroke-linejoin="round"/>
  <rect x="94" y="140" width="12" height="16" rx="1.5" fill="#fff4cf" stroke="#2f6b4a" stroke-width="2"/>
  <path d="M100 140 V156 M94 148 H106" stroke="#2f6b4a" stroke-width="1.4"/>
  <path d="M72 96 C74 70 126 70 128 96 Z" fill="#6a5743" stroke="#4a3a2a" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M84 80 C90 72 110 72 116 80" stroke="#8a7458" stroke-width="1.4" fill="none"/>
  <rect x="70" y="94" width="60" height="5" rx="2" fill="#f4ecd8" stroke="#4a3a2a" stroke-width="1.5"/>
  <path d="M88 82 L100 70 L112 82 L100 92 Z" fill="#f4ecd8" stroke="#4a3a2a" stroke-width="1.5" stroke-linejoin="round"/>
  <rect x="26" y="200" width="148" height="7" rx="2" fill="#7a4e30" stroke="#4f3220" stroke-width="1.5"/>
  <path d="M34 207 L64 238 M166 207 L136 238" stroke="#7a4e30" stroke-width="4" stroke-linecap="round"/>
  <path d="M28 186 H172 M30 200 V186 M46 200 V186 M62 200 V186 M78 200 V186 M94 200 V186 M106 200 V186 M122 200 V186 M138 200 V186 M154 200 V186 M170 200 V186" stroke="#f4ecd8" stroke-width="2.4" stroke-linecap="round"/>
  </g>
  <g class="molen__wieken"><g transform="translate(20 22)">
    ${[0, 90, 180, 270].map((hoek) => `<g transform="rotate(${hoek} 100 78)">${WIEK}</g>`).join('')}
    <circle cx="100" cy="78" r="7" fill="#4a3a2a"/>
    <circle cx="100" cy="78" r="2.5" fill="#c9b48e"/>
  </g></g>
</svg>`;

const SCHUUR = `
<svg viewBox="0 0 220 170" aria-hidden="true">
  <path d="M10 70 L110 8 L210 70 L210 170 L10 170 Z" fill="#d9483b" stroke="#7d2219" stroke-width="4" stroke-linejoin="round"/>
  <path d="M2 74 L110 4 L218 74" fill="none" stroke="#f6f1e7" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M30 90 H190 M30 110 H190 M30 130 H190 M30 150 H190" stroke="#c03d31" stroke-width="3"/>
  <rect x="88" y="44" width="44" height="30" rx="3" fill="#f6f1e7" stroke="#7d2219" stroke-width="3"/>
  <path d="M110 44 V74 M88 59 H132" stroke="#7d2219" stroke-width="3"/>
  <rect x="70" y="96" width="80" height="74" fill="#f6f1e7" stroke="#7d2219" stroke-width="4"/>
  <path d="M76 102 L144 164 M144 102 L76 164 M110 96 V170" stroke="#d9483b" stroke-width="7"/>
</svg>`;

// Houten voetbruggetje over de voorste sloot.
const BRUG = `
<svg viewBox="0 0 120 50" aria-hidden="true">
  <path d="M6 44 C30 26 90 26 114 44" fill="none" stroke="#7a4e30" stroke-width="7" stroke-linecap="round"/>
  <path d="M14 39 V22 M38 30 V14 M60 28 V12 M82 30 V14 M106 39 V22" stroke="#8f6140" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M12 23 C32 10 88 10 108 23" fill="none" stroke="#a87650" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M10 46 C32 31 88 31 110 46" fill="none" stroke="#4f3220" stroke-width="1.5" opacity="0.5"/>
</svg>`;

// Riet met lisdodden langs de slootkant.
const RIET = `
<svg viewBox="0 0 80 60" aria-hidden="true">
  <g fill="none" stroke-linecap="round">
    <path d="M10 60 C12 44 8 30 4 20 M20 60 C20 42 22 28 26 14 M34 60 C33 40 30 26 30 10 M46 60 C48 44 54 32 60 22 M58 60 C58 48 62 38 70 30 M70 60 C70 50 74 44 78 40" stroke="#5c9a3e" stroke-width="2.4"/>
    <path d="M16 60 C14 46 14 36 16 26 M40 60 C40 46 42 34 44 22 M64 60 C64 50 66 42 68 36" stroke="#7bb553" stroke-width="2"/>
  </g>
  <rect x="27.5" y="12" width="5" height="14" rx="2.5" fill="#7a4a2c"/>
  <rect x="41.5" y="22" width="5" height="13" rx="2.5" fill="#7a4a2c"/>
  <rect x="14" y="27" width="4.5" height="12" rx="2.2" fill="#7a4a2c"/>
</svg>`;

// Dorpje in de verte: een kerk met spits en een paar huisjes met trapgevels.
const DORP = `
<svg viewBox="0 0 120 50" aria-hidden="true">
  <path d="M0 50 V36 L6 30 L12 36 V50 Z M14 50 V32 H18 V28 H22 V24 H26 V28 H30 V32 H34 V50 Z M36 50 V22 H44 V8 L48 0 L52 8 V22 H74 V34 L80 30 L86 34 V50 Z M88 50 V38 L96 30 L104 38 V50 Z M106 50 V36 H110 V32 H116 V36 H120 V50 Z" fill="#8fb9a1"/>
  <circle cx="48" cy="15" r="2" fill="#c9e3d3"/>
</svg>`;

// Tarwe: één aar (met een tweede iets lager) als herhalend achtergrondplaatje per rij.
const AAR = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 22">
    <path d="M3 22 V9 M9 22 V12" stroke="#c4912c" stroke-width="0.9"/>
    <path d="M3 1 C5.4 3.5 5.4 8 3 10.5 C0.6 8 0.6 3.5 3 1 Z" fill="#f4cd5e" stroke="#c4912c" stroke-width="0.7"/>
    <path d="M9 4 C11.4 6.5 11.4 11 9 13.5 C6.6 11 6.6 6.5 9 4 Z" fill="#eec04c" stroke="#c4912c" stroke-width="0.7"/>
    <path d="M3 1 L2 -1 M3 1 L4 -1 M9 4 L8 2 M9 4 L10 2 M1.6 5 H4.4 M1.6 7.5 H4.4 M7.6 8 H10.4 M7.6 10.5 H10.4" stroke="#c4912c" stroke-width="0.5"/>
  </svg>`,
)}`;
// Rijen tarwe van achter naar voor: [onderkant in % van het veld, hoogte van een aar in
// polder-eenheden (300 = de hele polder), zodat het veld op elk scherm even vol staat].
const TARWE_RIJEN: [number, number][] = [
  [86, 9],
  [70, 11],
  [54, 13],
  [38, 15],
  [22, 17],
  [6, 20],
];

const TRACTOR_MS = 18000;

export function maakBoerderijDecor(): Decor {
  const root = el('div', 'decor decor-boerderij');
  plaatje('assets/achtergrond/zon.svg', 'boerderij-zon', root);
  plaatje('assets/achtergrond/wolk.svg', 'drijf-wolk drijf-wolk--1', root);
  plaatje('assets/achtergrond/wolk.svg', 'drijf-wolk drijf-wolk--2', root);

  // De polder: alles hierin staat in % van de polderhoogte, net als de getekende akkers.
  const polder = el('div', 'boerderij-polder', root);
  el('div', 'boerderij-bomen boerderij-bomen--links', polder);
  el('div', 'boerderij-bomen boerderij-bomen--rechts', polder);
  svgUitTekst(DORP, 'boerderij-dorp', polder);
  svgUitTekst(maakPolder(), 'boerderij-akkers', polder);
  const molen = el('div', 'boerderij-molen', polder);
  svgUitTekst(MOLEN, 'boerderij-molen__svg', molen);
  const tarwe = el('div', 'boerderij-tarwe', polder);
  TARWE_RIJEN.forEach(([onder, hoogte], i) => {
    const rij = el('div', 'boerderij-tarwe__rij', tarwe);
    rij.style.bottom = `${onder}%`;
    rij.style.setProperty('--h', String(hoogte));
    rij.style.backgroundImage = `url("${AAR}")`;
    rij.style.backgroundPositionX = `${i * 3}px`;
    rij.style.animationDelay = `${-i * 0.35}s`;
  });
  const schuur = el('div', 'boerderij-schuur', polder);
  svgUitTekst(SCHUUR, 'boerderij-schuur__svg', schuur);
  const tractorBaan = el('div', 'boerderij-tractorbaan', polder);
  svgUitTekst(RIET, 'boerderij-riet boerderij-riet--1', polder);
  svgUitTekst(RIET, 'boerderij-riet boerderij-riet--2', polder);
  svgUitTekst(BRUG, 'boerderij-brug', polder);

  const schaap = el('div', 'boer-dier boer-dier--schaap', root);
  plaatje('assets/achtergrond/schaap.svg', 'boer-dier__lijf', schaap);
  const koe = el('div', 'boer-dier boer-dier--koe', root);
  plaatje('assets/achtergrond/koe.svg', 'boer-dier__lijf', koe);
  const varken = el('div', 'boer-dier boer-dier--varken', root);
  plaatje('assets/achtergrond/varken.svg', 'boer-dier__lijf gespiegeld', varken);
  el('div', 'boerderij-hek', root);
  const haan = el('div', 'boer-dier boer-dier--haan', root);
  plaatje('assets/achtergrond/haan.svg', 'boer-dier__lijf', haan);
  const kuikens = [1, 2].map((n) => {
    const k = el('div', `boer-dier boer-dier--kuiken boer-dier--kuiken-${n}`, root);
    plaatje('assets/achtergrond/kuiken.svg', 'boer-dier__lijf', k);
    return k;
  });

  const stil = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let levend = true;
  let timer: number | undefined;
  const losseTimers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      losseTimers.delete(id);
      fn();
    }, ms);
    losseTimers.add(id);
  };
  // De tractor rijdt over de zandweg tussen de akkers en de voorste sloot.
  function plan(): void {
    window.clearTimeout(timer);
    if (!levend || stil) return;
    timer = window.setTimeout(() => {
      const t = el('div', 'boer-tractor', tractorBaan);
      const schok = el('div', 'boer-tractor__schok', t);
      plaatje('assets/achtergrond/tractor.svg', 'boer-tractor__lijf', schok);
      later(() => t.remove(), TRACTOR_MS + 200);
      later(plan, TRACTOR_MS);
    }, 8000 + Math.random() * 14000);
  }
  plan();

  const roep = (dier: HTMLElement, tekst: string) => {
    const wolkje = el('div', 'boer-roep', dier);
    wolkje.textContent = tekst;
    later(() => wolkje.remove(), 1400);
  };

  const juich = () => {
    kortAan(koe, 'juicht', 1200);
    roep(koe, 'boe!');
  };

  // Einde van een sessie: alle dieren springen na elkaar, met sterretjes.
  const feest = () => {
    const rij = [koe, haan, ...kuikens, schaap, varken];
    rij.forEach((dier, i) => {
      later(() => {
        kortAan(dier, 'juicht', 1200);
        const ster = el('div', 'boer-ster', dier);
        ster.textContent = ['★', '♥', '✦'][i % 3];
        later(() => ster.remove(), 1200);
      }, i * 280);
    });
    roep(koe, 'boe!');
  };

  const vernietig = () => {
    levend = false;
    window.clearTimeout(timer);
    losseTimers.forEach((id) => window.clearTimeout(id));
    losseTimers.clear();
  };
  return { element: root, juich, feest, vernietig };
}
