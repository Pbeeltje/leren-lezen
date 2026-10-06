import type { Decor } from './achtergrond.ts';
import { el, kortAan, plaatje, svgUitTekst } from './hulp.ts';

// Boerderij: een vlakke Hollandse polder met een lange horizon. Achteraan een rij bomen en
// een dorpje met een kerktoren, daarvoor smalle akkers (weiland, een bollenveld met tulpen)
// met een klassieke stellingmolen waarvan de wieken (wit zeil op een houten hekwerk) rustig
// tegen de klok in draaien. Daarvoor slootjes die in perspectief naar de horizon lopen (met
// glinsteringen, een houten bruggetje en riet), een wuivend tarweveld, een geploegde akker
// en een rode schuur, een zandweg waarover af en toe een tractor rijdt, en vooraan een hek
// met een koe, een varken, een schaap, een kip en kuikentjes. De tractor rijdt meestal
// vooruit (gespiegeld als hij naar rechts rijdt) en één op de vijf keer voor de grap
// achteruit. Bij een goed antwoord springt de koe op met "boe!"; aan het eind van een sessie
// springen alle dieren na elkaar.
// Heel langzaam wordt het avond en nacht (DAGCYCLUS zet data-tijd: dag 50 s, schemer 25 s
// met een zakkende zon en een oranje-roze lucht, nacht 35 s met fonkelende sterren, een
// opkomende maan en verlichte ramen in schuur, molen en dorp, ochtend 25 s). Het schaap, het
// varken, de koe en de kip doen overdag af en toe een dutje (zakken wat in, ogen dicht,
// ademen traag, zzz); 's nachts slaapt iedereen, meestal de hele nacht. De kuikens trippelen
// 's avonds naar de kip, slapen tegen haar aan en lopen 's ochtends terug. Bij juichen of
// feest wordt iedereen wakker. Dieren en tractor zijn Fluent Emoji; polder, molen, schuur,
// brug, riet, tarwe, hek, maan en sterren zijn zelf getekend.

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

// 's Nachts branden er lampjes. Elke tekening heeft een eigen laagje met alleen de ramen
// (zelfde viewBox als de tekening), zodat het donker-filter van de polder ze niet dooft.
const RAAM = 'fill="#ffd77a" stroke="#7a4e30" stroke-width="1.6"';
const LICHT_MOLEN = `
<svg viewBox="0 0 240 324" aria-hidden="true"><g transform="translate(20 22)">
  <rect x="94" y="140" width="12" height="16" rx="1.5" ${RAAM}/>
  <path d="M100 140 V156 M94 148 H106" stroke="#7a4e30" stroke-width="1.4"/>
  <rect x="117" y="232" width="11" height="14" rx="1.5" ${RAAM}/>
</g></svg>`;
const LICHT_SCHUUR = `
<svg viewBox="0 0 220 170" aria-hidden="true">
  <rect x="88" y="44" width="44" height="30" rx="3" ${RAAM}/>
  <path d="M110 44 V74 M88 59 H132" stroke="#7a4e30" stroke-width="3"/>
</svg>`;
const LICHT_DORP = `
<svg viewBox="0 0 120 50" aria-hidden="true"><g fill="#ffd77a">
  <rect x="4.5" y="41" width="3" height="3.5"/><rect x="18" y="37" width="3" height="3.5"/>
  <rect x="27" y="42" width="3" height="3.5"/><rect x="58" y="29" width="3" height="4"/>
  <rect x="66" y="36" width="3" height="4"/><rect x="94.5" y="41" width="3" height="3.5"/>
  <rect x="111.5" y="40" width="3" height="3.5"/>
</g></svg>`;

// Een volle maan met een paar kratertjes.
const MAAN = `
<svg viewBox="0 0 100 100" aria-hidden="true">
  <circle cx="50" cy="50" r="44" fill="#f7f1d2"/>
  <circle cx="36" cy="38" r="9" fill="#e8dfb6"/><circle cx="62" cy="62" r="12" fill="#ebe3bd"/>
  <circle cx="64" cy="30" r="5" fill="#e8dfb6"/><circle cx="34" cy="68" r="4" fill="#e8dfb6"/>
</svg>`;

// Dichte oogjes voor een slapend dier: een vlekje in de kleur van de kop over het open oog,
// met een gebogen streepje erop. Zelfde viewBox als de Fluent-tekening (32 x 32), zodat de
// plek precies klopt. De ogen in de tekeningen: schaap 5.43, 8.83 (ovaal); varken 7.55, 16.5
// (ovaal); koe 7.11, 9.27 (staand staafje van 1 x 2, op de grijze vlek); haan 6.54, 7.53
// (rondje r 0.5, in de rode wang); kuiken 9.47, 10.5 (rondje r 0.5).
const dichtOog = (x: number, y: number, kleur: string, rx = 0.85, ry = 1.4, streep = '#40333a'): string => `
<svg viewBox="0 0 32 32" aria-hidden="true">
  <ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${kleur}"/>
  <path d="M${x - rx * 0.88} ${y - 0.15} Q${x} ${y + rx * 0.88} ${x + rx * 0.88} ${y - 0.15}" fill="none" stroke="${streep}" stroke-width="${Math.min(0.42, rx * 0.5).toFixed(2)}" stroke-linecap="round"/>
</svg>`;
const OOG_SCHAAP = dichtOog(5.43, 8.83, '#cd8b49');
const OOG_VARKEN = dichtOog(7.55, 16.5, '#fd839c');
const OOG_KOE = dichtOog(7.11, 9.27, '#757378', 0.66, 1.16, '#2b2228');
const OOG_HAAN = dichtOog(6.54, 7.53, '#ed1840', 0.66, 0.66);
const OOG_KUIKEN = dichtOog(9.47, 10.5, '#ffcd3d', 0.66, 0.66);

// Dag en nacht: de tijd staat in data-tijd op de decor; de CSS laat alles heel langzaam
// in elkaar overvloeien (lucht, zon, maan, sterren, kleur van het land, lampjes).
type Tijd = 'dag' | 'schemer' | 'nacht' | 'ochtend';
const DAGCYCLUS: [Tijd, number][] = [
  ['dag', 50000],
  ['schemer', 25000],
  ['nacht', 35000],
  ['ochtend', 25000],
];

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
  root.dataset.tijd = 'dag';
  // Lucht voor schemer, ochtend en nacht (over de daglucht van de decor heen).
  for (const tijd of ['schemer', 'ochtend', 'nacht']) el('div', `boerderij-lucht boerderij-lucht--${tijd}`, root);
  const sterren = el('div', 'boerderij-sterren', root);
  for (let i = 0; i < 46; i++) {
    const ster = el('div', 'boerderij-ster', sterren);
    const maat = 1.5 + Math.random() * (i % 7 === 0 ? 3 : 1.8);
    ster.style.left = `${Math.random() * 100}%`;
    ster.style.top = `${Math.random() * 100}%`;
    ster.style.width = ster.style.height = `${maat.toFixed(1)}px`;
    ster.style.animationDuration = `${(2.4 + Math.random() * 3).toFixed(1)}s`;
    ster.style.animationDelay = `${(-Math.random() * 5).toFixed(1)}s`;
  }
  svgUitTekst(MAAN, 'boerderij-maan', el('div', 'boerderij-maanbaan', root));
  plaatje('assets/achtergrond/zon.svg', 'boerderij-zon', el('div', 'boerderij-zonbaan', root));
  plaatje('assets/achtergrond/wolk.svg', 'drijf-wolk drijf-wolk--1', root);
  plaatje('assets/achtergrond/wolk.svg', 'drijf-wolk drijf-wolk--2', root);

  // De polder: alles hierin staat in % van de polderhoogte, net als de getekende akkers.
  const polder = el('div', 'boerderij-polder', root);
  el('div', 'boerderij-bomen', polder);
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
  polder.classList.add('boerderij-f');

  // De lampjes: een tweede, onzichtbare polder met alleen de ramen op dezelfde plekken.
  const lichten = el('div', 'boerderij-polder boerderij-lichten', root);
  svgUitTekst(LICHT_DORP, 'boerderij-dorp', lichten);
  svgUitTekst(LICHT_MOLEN, 'boerderij-molen__svg', el('div', 'boerderij-molen', lichten));
  svgUitTekst(LICHT_SCHUUR, 'boerderij-schuur__svg', el('div', 'boerderij-schuur', lichten));

  // Alle dieren kunnen slapen: hun plaatje zit samen met de dichte oogjes in één lijf, zodat
  // inzakken, spiegelen en het nachtfilter voor allebei gelden.
  const slaperLijf = (dier: HTMLElement, src: string, oog: string, gespiegeld = false): HTMLElement => {
    const lijf = el('div', `boer-dier__lijf boerderij-f${gespiegeld ? ' gespiegeld' : ''}`, dier);
    plaatje(src, 'boer-dier__beeld', lijf);
    svgUitTekst(oog, 'boer-oog', lijf);
    return lijf;
  };
  const maakDier = (soort: string, src: string, oog: string, gespiegeld = false): [HTMLElement, HTMLElement] => {
    const dier = el('div', `boer-dier boer-dier--slaper boer-dier--${soort}`, root);
    return [dier, slaperLijf(dier, src, oog, gespiegeld)];
  };
  const [schaap, schaapLijf] = maakDier('schaap', 'assets/achtergrond/schaap.svg', OOG_SCHAAP);
  const [koe, koeLijf] = maakDier('koe', 'assets/achtergrond/koe.svg', OOG_KOE);
  const [varken, varkenLijf] = maakDier('varken', 'assets/achtergrond/varken.svg', OOG_VARKEN, true);
  el('div', 'boerderij-hek boerderij-f', root);
  const [haan, haanLijf] = maakDier('haan', 'assets/achtergrond/haan.svg', OOG_HAAN);
  const kuikens = [1, 2].map((n) => maakDier(`kuiken boer-dier--kuiken-${n}`, 'assets/achtergrond/kuiken.svg', OOG_KUIKEN));

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
  // De tractor rijdt over de zandweg tussen de akkers en de voorste sloot, de ene keer naar
  // links en de andere keer naar rechts. Het Fluent-plaatje kijkt naar links, dus naar rechts
  // spiegelen we hem. Eén op de vijf keer rijdt hij voor de grap achteruit (niet gespiegeld
  // naar rechts, of gespiegeld naar links).
  function plan(): void {
    window.clearTimeout(timer);
    if (!levend || stil) return;
    timer = window.setTimeout(() => {
      const naarRechts = Math.random() < 0.5;
      const achteruit = Math.random() < 0.2;
      const t = el('div', `boer-tractor${achteruit ? ' achteruit' : ''}`, tractorBaan);
      t.style.setProperty('--van-x', naarRechts ? '-16vw' : '104vw');
      t.style.setProperty('--naar-x', naarRechts ? '104vw' : '-16vw');
      const schok = el('div', 'boer-tractor__schok', t);
      const lijf = plaatje('assets/achtergrond/tractor.svg', 'boer-tractor__lijf', schok);
      if (naarRechts !== achteruit) lijf.classList.add('gespiegeld');
      later(() => t.remove(), TRACTOR_MS + 200);
      later(plan, TRACTOR_MS);
    }, 8000 + Math.random() * 14000);
  }
  plan();

  // ---- Slapen: alle dieren doen af en toe een dutje, en 's nachts slaapt iedereen ----
  // Ze zakken wat in en laten hun kop hangen (CSS .slaapt), ademen traag, doen hun ogen dicht
  // en er zweven zzz'tjes op. Overdag doen het schaap en het varken na 25-60 s een dutje, de
  // koe en de haan na 45-95 s, voor 10-18 s. 's Nachts vallen ze snel in slaap en slapen ze
  // meestal tot de ochtend. Wakker worden gaat met een rekje en een hupje.
  // De kuikens slapen alleen 's nachts: ze trippelen dan eerst naar de kip toe (CSS .bij-kip,
  // een trage overgang van left met hupjes), kruipen tegen haar aan en slapen daar de hele
  // nacht. 's Ochtends worden ze wakker en lopen ze terug naar hun eigen plekje.
  interface Slaper {
    dier: HTMLElement;
    lijf: HTMLElement;
    slaapt: boolean;
    heleNacht: boolean;
    /** Overdag: [minimaal, plus willekeurig] wachten tot een dutje (null = geen dutjes). */
    dag: [number, number] | null;
    kuiken: boolean;
    bijKip: boolean;
    loopt: boolean;
    timer?: number;
    loopTimer?: number;
  }
  const maakSlaper = ([dier, lijf]: [HTMLElement, HTMLElement], dag: [number, number] | null, kuiken = false): Slaper => {
    const zzz = el('div', 'boer-zzz', dier);
    for (const letter of ['Z', 'z', 'z']) el('span', '', zzz).textContent = letter;
    return { dier, lijf, slaapt: false, heleNacht: false, dag, kuiken, bijKip: false, loopt: false };
  };
  const slapers: Slaper[] = [
    maakSlaper([schaap, schaapLijf], [25000, 35000]),
    maakSlaper([varken, varkenLijf], [25000, 35000]),
    maakSlaper([koe, koeLijf], [45000, 50000]),
    maakSlaper([haan, haanLijf], [45000, 50000]),
    ...kuikens.map((k) => maakSlaper(k, null, true)),
  ];
  const isNacht = (): boolean => root.dataset.tijd === 'nacht';
  const wachtSlaper = (s: Slaper, fn: () => void, ms: number): void => {
    window.clearTimeout(s.timer);
    s.timer = window.setTimeout(fn, ms);
  };
  function planSlaap(s: Slaper, ms?: number): void {
    if (!levend || stil) return;
    // Een kuiken gaat alleen slapen als het 's nachts bij de kip zit.
    if (s.kuiken && (!isNacht() || !s.bijKip || s.loopt)) return;
    let wacht = ms;
    if (wacht === undefined) {
      if (isNacht()) wacht = 3000 + Math.random() * 9000;
      else if (s.dag) wacht = s.dag[0] + Math.random() * s.dag[1];
      else return;
    }
    wachtSlaper(s, () => valInSlaap(s), wacht);
  }
  function valInSlaap(s: Slaper): void {
    if (!levend || s.slaapt) return;
    s.slaapt = true;
    s.dier.classList.add('slaapt');
    s.heleNacht = isNacht() && (s.kuiken || Math.random() < 0.75);
    if (s.heleNacht) window.clearTimeout(s.timer);
    else wachtSlaper(s, () => wordWakker(s, true), 10000 + Math.random() * 8000);
  }
  function wordWakker(s: Slaper, rekken: boolean): void {
    if (s.loopt) return; // een lopend kuiken is al wakker en loopt gewoon door
    window.clearTimeout(s.timer);
    if (s.slaapt) {
      s.slaapt = false;
      s.heleNacht = false;
      s.dier.classList.remove('slaapt');
      if (rekken) kortAan(s.dier, 'rekt', 1100);
    }
    planSlaap(s);
  }
  // Een kuiken loopt (met hupjes) naar de kip of terug naar zijn eigen plekje. Het plaatje
  // kijkt naar links; de kip staat links van de kuikens, dus terug lopen ze gespiegeld.
  const LOOP_MS = 4600;
  function loop(s: Slaper, naarKip: boolean, klaar?: () => void): void {
    if (!levend) return;
    window.clearTimeout(s.loopTimer);
    s.loopt = true;
    s.lijf.classList.toggle('gespiegeld', !naarKip);
    s.dier.classList.add('loopt');
    s.dier.classList.toggle('bij-kip', naarKip);
    s.loopTimer = window.setTimeout(() => {
      s.loopt = false;
      s.bijKip = naarKip;
      s.dier.classList.remove('loopt');
      if (!naarKip) s.lijf.classList.remove('gespiegeld'); // thuis weer omdraaien
      klaar?.();
    }, LOOP_MS);
  }
  function tijdVoorSlaper(s: Slaper, tijd: Tijd): void {
    // Kuikens gebruiken loopTimer voor het lopen, zodat juichen (dat de slaaptimer wist) de
    // tocht naar de kip of terug niet kan afbreken.
    if (s.kuiken) {
      const wachtLoop = (fn: () => void, ms: number): void => {
        window.clearTimeout(s.loopTimer);
        s.loopTimer = window.setTimeout(fn, ms);
      };
      if (tijd === 'nacht') {
        wachtLoop(() => loop(s, true, () => planSlaap(s, 800 + Math.random() * 2500)), 400 + Math.random() * 2200);
      } else if (tijd === 'ochtend') {
        wachtLoop(() => {
          wordWakker(s, true);
          if (s.bijKip) wachtLoop(() => loop(s, false), 1300 + Math.random() * 1500);
        }, 3000 + Math.random() * 14000);
      }
      return;
    }
    if (tijd === 'nacht') {
      // Wie wakker is, wordt nu snel slaperig; wie al een dutje doet, slaapt vaak door.
      if (!s.slaapt) planSlaap(s, 2000 + Math.random() * 10000);
      else if (Math.random() < 0.6) {
        s.heleNacht = true;
        window.clearTimeout(s.timer);
      }
    } else if (tijd === 'ochtend') {
      if (s.heleNacht) wachtSlaper(s, () => wordWakker(s, true), 3000 + Math.random() * 14000);
      else if (!s.slaapt) planSlaap(s);
    }
  }

  // ---- Dag en nacht ----
  let tijdStap = 0;
  let tijdTimer: number | undefined;
  function volgendeTijd(): void {
    if (!levend || stil) return;
    tijdStap = (tijdStap + 1) % DAGCYCLUS.length;
    const [tijd, duur] = DAGCYCLUS[tijdStap];
    root.dataset.tijd = tijd;
    slapers.forEach((s) => tijdVoorSlaper(s, tijd));
    tijdTimer = window.setTimeout(volgendeTijd, duur);
  }
  if (!stil) {
    slapers.forEach((s) => planSlaap(s));
    tijdTimer = window.setTimeout(volgendeTijd, DAGCYCLUS[0][1]);
  }

  const roep = (dier: HTMLElement, tekst: string) => {
    const wolkje = el('div', 'boer-roep', dier);
    wolkje.textContent = tekst;
    later(() => wolkje.remove(), 1400);
  };

  // Wakker schrikken: de kuikens doen een hupje (en blijven 's nachts gewoon bij de kip).
  const iedereenWakker = () => slapers.forEach((s) => wordWakker(s, s.kuiken));

  const juich = () => {
    iedereenWakker();
    kortAan(koe, 'juicht', 1200);
    roep(koe, 'boe!');
  };

  // Einde van een sessie: alle dieren springen na elkaar, met sterretjes.
  const feest = () => {
    iedereenWakker();
    const rij = [koe, haan, ...kuikens.map(([k]) => k), schaap, varken];
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
    window.clearTimeout(tijdTimer);
    slapers.forEach((s) => {
      window.clearTimeout(s.timer);
      window.clearTimeout(s.loopTimer);
    });
    losseTimers.forEach((id) => window.clearTimeout(id));
    losseTimers.clear();
  };
  return { element: root, juich, feest, vernietig };
}
