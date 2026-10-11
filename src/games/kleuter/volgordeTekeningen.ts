import { kikkerSvg } from '../muziek/kikker.ts';

// Eigen tekeningen voor "Op volgorde": reeksjes van hetzelfde ding dat stap voor stap
// verandert (zaadje → bloem, appel → klokhuis). Losse emoji waren daarvoor te vaag.
// Zelfde stijl als de kikker van het kikkerkoor: vlakke kleuren, één donkere buitenrand
// per vorm (eerst alles dik in de randkleur, dan de vulling erover), lichte glansjes.
// Alles in viewBox 0 0 100 100; de dingen staan op dezelfde plek in elke stap, zodat
// alleen de verandering opvalt. Maskers krijgen een uniek id per tekening.

let teller = 0;
const uid = (naam: string) => `vt-${naam}-${++teller}`;

const svg = (inhoud: string) => `<svg viewBox="0 0 100 100" aria-hidden="true">${inhoud}</svg>`;

function rand(vormen: string, vul: string, randKleur: string, dikte = 5): string {
  return `<g fill="${randKleur}" stroke="${randKleur}" stroke-width="${dikte}" stroke-linejoin="round" stroke-linecap="round">${vormen}</g><g fill="${vul}">${vormen}</g>`;
}

// Een lijn (steel, touwtje, tak) met rand: dik in de randkleur, dun erover.
function lijn(d: string, kleur: string, randKleur: string, dik = 4): string {
  return `<path d="${d}" fill="none" stroke="${randKleur}" stroke-width="${dik + 3}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${kleur}" stroke-width="${dik}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

const glans = (cx: number, cy: number, rx: number, ry: number, draai = 0, sterkte = 0.45) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff" opacity="${sterkte}" transform="rotate(${draai} ${cx} ${cy})"/>`;

const wangen = (x1: number, x2: number, y: number, r = 3) =>
  `<ellipse cx="${x1}" cy="${y}" rx="${r}" ry="${r * 0.6}" fill="#ff8fa8" opacity="0.65"/><ellipse cx="${x2}" cy="${y}" rx="${r}" ry="${r * 0.6}" fill="#ff8fa8" opacity="0.65"/>`;

const oogje = (x: number, y: number, r = 2.6) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="#1d1d1d"/><circle cx="${x + r * 0.35}" cy="${y - r * 0.4}" r="${r * 0.38}" fill="#fff"/>`;

// --- Gedeelde ondergronden ---------------------------------------------------------

// Bergje aarde; de bovenkant ligt in het midden op y = 81.5.
const BERG = 'M6 92 C14 78 86 78 94 92 C95 96 92 98 88 98 L12 98 C8 98 5 96 6 92 Z';
function aarde(): string {
  return `${rand(`<path d="${BERG}"/>`, '#a8743f', '#5c3a1c')}
    <g fill="#8a5a2e"><ellipse cx="24" cy="91" rx="3" ry="1.6"/><ellipse cx="70" cy="89" rx="2.6" ry="1.4"/><ellipse cx="44" cy="94" rx="2.2" ry="1.2"/><ellipse cx="82" cy="94" rx="2" ry="1.1"/></g>
    <g stroke="#4f9a36" stroke-width="2.2" stroke-linecap="round" fill="none">
      <path d="M14 86 l-2 -6 M16 86 l1 -7 M18 86 l3 -5"/><path d="M84 86 l-2 -5 M86 86 l1 -7 M88 87 l3 -5"/>
    </g>`;
}

// Groene steel van de grond (50, 82) omhoog tot y = top, met een klein slingertje.
const steelPad = (top: number) => `M50 82 C47 ${82 - (82 - top) * 0.4} 53 ${82 - (82 - top) * 0.7} 50 ${top}`;

// Blad aan de steel: punt naar buiten, kant -1 = links, 1 = rechts.
function steelBlad(y: number, kant: -1 | 1, lengte = 20): string {
  const x = 50 + kant * lengte;
  const d = `M50 ${y} C${50 + kant * lengte * 0.3} ${y - 9} ${x - kant * 4} ${y - 10} ${x} ${y - 6} C${x - kant * 5} ${y + 3} ${50 + kant * lengte * 0.35} ${y + 4} 50 ${y} Z`;
  return rand(`<path d="${d}"/>`, '#7cc85a', '#2f6b25', 3.4) +
    `<path d="M50 ${y} Q${50 + kant * lengte * 0.5} ${y - 4} ${x - kant * 2} ${y - 5.5}" fill="none" stroke="#4f9a36" stroke-width="1.4" stroke-linecap="round"/>`;
}

// --- Zaadje → bloem ---------------------------------------------------------------

function bloemZaadje(): string {
  return svg(`${aarde()}
    <ellipse cx="50" cy="84" rx="17" ry="5" fill="#5c3a1c"/>
    ${rand('<path d="M50 56 C63 62 64 78 50 87 C36 78 37 62 50 56 Z"/>', '#f0c75e', '#8a6a1e', 4.5)}
    <path d="M50 61 C55 67 55 77 50 83" fill="none" stroke="#c99a2e" stroke-width="2" stroke-linecap="round"/>
    ${glans(44, 68, 2.6, 6, 15)}`);
}

function bloemKiempje(): string {
  const blaadje = (kant: -1 | 1) =>
    `<path d="M50 62 C${50 + kant * 4} 54 ${50 + kant * 16} 52 ${50 + kant * 20} 56 C${50 + kant * 16} 64 ${50 + kant * 6} 65 50 62 Z"/>`;
  return svg(`${aarde()}
    ${lijn(steelPad(62), '#6cbf4a', '#2f6b25', 3.4)}
    ${rand(blaadje(-1) + blaadje(1), '#8fd45e', '#2f6b25', 3.4)}
    ${glans(40, 57, 4, 1.6, -10, 0.4)}${glans(60, 57, 4, 1.6, 10, 0.4)}`);
}

function bloemKnop(): string {
  return svg(`${aarde()}
    ${lijn(steelPad(34), '#6cbf4a', '#2f6b25', 3.6)}
    ${steelBlad(66, -1, 22)}${steelBlad(54, 1, 20)}
    ${rand('<path d="M50 14 C59 21 60 32 50 38 C40 32 41 21 50 14 Z"/>', '#f48fb1', '#9c2a5a', 3.6)}
    ${rand('<path d="M50 40 C42 38 40 30 42 24 C46 30 48 32 50 32 C52 32 54 30 58 24 C60 30 58 38 50 40 Z"/>', '#7cc85a', '#2f6b25', 3)}
    ${glans(46.5, 21, 1.6, 3.4, 20)}`);
}

function bloemOpen(): string {
  let blaadjes = '';
  for (let i = 0; i < 7; i++) {
    const hoek = (360 / 7) * i;
    blaadjes += `<ellipse cx="50" cy="16" rx="8.5" ry="12" transform="rotate(${hoek} 50 30)"/>`;
  }
  return svg(`${aarde()}
    ${lijn(steelPad(36), '#6cbf4a', '#2f6b25', 3.6)}
    ${steelBlad(66, -1, 22)}${steelBlad(54, 1, 20)}
    ${rand(blaadjes, '#f06292', '#9c2a5a', 4)}
    ${rand('<circle cx="50" cy="30" r="10.5"/>', '#ffd54f', '#b8860b', 3)}
    ${oogje(46, 28.5, 1.8)}${oogje(54, 28.5, 1.8)}
    <path d="M46 33 Q50 36.5 54 33" fill="none" stroke="#7a4a00" stroke-width="1.6" stroke-linecap="round"/>
    ${wangen(43, 57, 32.5, 2.2)}`);
}

// --- Eikel → grote boom -----------------------------------------------------------

const STAM = '#a4673c';
const STAM_DONKER = '#87522c';
const STAM_RAND = '#4e2f18';
const KRUIN = '#6cbf4a';
const KRUIN_LICHT = '#8fd45e';
const KRUIN_RAND = '#2f6b25';

function eikel(cx: number, cy: number, schaal: number, draai: number): string {
  return `<g transform="translate(${cx} ${cy}) rotate(${draai}) scale(${schaal})">
    ${rand('<path d="M-11 -2 C-12 10 -6 16 0 17 C6 16 12 10 11 -2 Z"/>', '#d7a94e', '#6b4a1a', 4)}
    ${rand('<path d="M-13 0 C-14 -10 -6 -14 0 -14 C6 -14 14 -10 13 0 C6 2 -6 2 -13 0 Z"/>', '#8a5a2e', STAM_RAND, 4)}
    <g fill="#6b4421"><circle cx="-6" cy="-6" r="1.3"/><circle cx="0" cy="-8" r="1.3"/><circle cx="6" cy="-6" r="1.3"/><circle cx="-3" cy="-2.5" r="1.3"/><circle cx="3" cy="-2.5" r="1.3"/><circle cx="-9" cy="-1.5" r="1.1"/><circle cx="9" cy="-1.5" r="1.1"/></g>
    ${lijn('M0 -14 L1 -19', '#8a5a2e', STAM_RAND, 2.4)}
    ${glans(-5, 7, 2, 4.5, 10)}
  </g>`;
}

// Bladerkruin: een tros cirkels met samen één buitenrand en lichte toppen.
function kruin(trossen: [number, number, number][]): string {
  const cirkels = trossen.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('');
  const licht = trossen
    .map(([x, y, r]) => `<circle cx="${x - r * 0.25}" cy="${y - r * 0.3}" r="${r * 0.55}" fill="${KRUIN_LICHT}"/>`)
    .join('');
  return rand(cirkels, KRUIN, KRUIN_RAND, 5) + licht;
}

function boomEikel(): string {
  return svg(`${aarde()}${eikel(50, 66, 1.15, -8)}`);
}

function boomKiem(): string {
  return svg(`${aarde()}
    ${lijn('M44 80 C48 70 51 64 50 52', '#6cbf4a', '#2f6b25', 3.2)}
    ${rand('<path d="M50 54 C42 48 34 50 32 44 C38 40 46 42 50 54 Z"/><path d="M50 52 C54 42 64 40 70 44 C66 50 58 52 50 52 Z"/>', '#8fd45e', '#2f6b25', 3.2)}
    ${eikel(40, 80, 0.85, -70)}`);
}

function boomJong(): string {
  return svg(`${aarde()}
    ${rand('<path d="M47 83 L48 50 L52 50 L53 83 Z"/>', STAM, STAM_RAND, 4)}
    ${lijn('M50 62 L40 54', STAM, STAM_RAND, 2.4)}${lijn('M50 58 L60 50', STAM, STAM_RAND, 2.4)}
    ${kruin([[40, 46, 10], [50, 38, 12], [61, 45, 10], [50, 50, 9]])}`);
}

function boomGroot(): string {
  const stam = 'M38 86 C42 80 43 70 43 52 L57 52 C57 70 58 80 62 86 C56 88 44 88 38 86 Z';
  return svg(`${aarde()}
    ${rand(`<path d="${stam}"/>`, STAM, STAM_RAND, 4.5)}
    <path d="M43 56 C43 70 42 80 39 85 L46 86 C47 78 48 68 48 56 Z" fill="${STAM_DONKER}"/>
    ${lijn('M50 58 C42 50 34 46 28 40', STAM, STAM_RAND, 4)}${lijn('M51 56 C58 48 66 44 72 38', STAM, STAM_RAND, 4)}
    ${kruin([[24, 40, 15], [38, 26, 17], [58, 22, 18], [76, 36, 15], [70, 52, 13], [50, 44, 16], [30, 54, 12], [50, 12, 13]])}
    <g fill="#e4572e"><circle cx="34" cy="44" r="2.8"/><circle cx="64" cy="34" r="2.8"/><circle cx="56" cy="50" r="2.8"/><circle cx="74" cy="46" r="2.6"/></g>`);
}

// --- Kikkerdril → kikker ----------------------------------------------------------

const WATER = 'M8 54 C6 26 28 12 50 14 C74 12 94 28 92 54 C94 80 74 92 50 90 C26 92 6 80 8 54 Z';
function water(): string {
  return `${rand(`<path d="${WATER}"/>`, '#a6def0', '#3a8fb0', 4)}
    <g fill="none" stroke="#e3f5fb" stroke-width="2.2" stroke-linecap="round" opacity="0.9">
      <path d="M20 34 q6 -3 12 0"/><path d="M68 76 q6 -3 12 0"/><path d="M22 74 q5 -2.5 10 0"/>
    </g>`;
}

function kikkerDril(): string {
  const plekken: [number, number][] = [[38, 40], [50, 36], [62, 40], [32, 52], [44, 50], [56, 49], [68, 52], [38, 62], [50, 61], [62, 62], [50, 72]];
  const eitjes = plekken
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7.2" fill="#eefaf6" stroke="#5f9d94" stroke-width="1.6" opacity="0.95"/>`)
    .join('');
  const stipjes = plekken.map(([x, y]) => `<circle cx="${x + 0.6}" cy="${y + 0.6}" r="2.6" fill="#263238"/><circle cx="${x - 2.6}" cy="${y - 2.8}" r="1.3" fill="#fff"/>`).join('');
  return svg(`${water()}${eitjes}${stipjes}`);
}

function kikkerVisje(): string {
  return svg(`${water()}
    ${rand('<path d="M54 52 C66 44 78 54 90 44 C84 58 70 62 54 60 Z"/><ellipse cx="40" cy="54" rx="17" ry="14"/>', '#5b6b3a', '#262d16', 4)}
    <ellipse cx="38" cy="59" rx="10" ry="6" fill="#7d8c55"/>
    <circle cx="33" cy="49" r="5.2" fill="#fff"/>${oogje(32.4, 49.6, 3)}
    <path d="M28 59 Q32 62 36 59" fill="none" stroke="#1b2010" stroke-width="1.8" stroke-linecap="round"/>
    ${glans(44, 46, 6, 2.4, -15, 0.3)}
    <g fill="none" stroke="#e3f5fb" stroke-width="2" stroke-linecap="round"><path d="M18 46 l-5 -1"/><path d="M18 54 l-6 0"/></g>`);
}

function kikkerPootjes(): string {
  return svg(`${water()}
    ${rand(`<path d="M56 52 C66 48 74 54 84 50 C80 60 68 62 56 60 Z"/>
      <path d="M50 64 C54 72 50 78 58 80 C62 80 64 78 60 76 C56 74 58 70 56 62 Z"/>
      <path d="M38 64 C36 70 30 72 32 76 C36 76 40 72 42 66 Z"/>
      <ellipse cx="42" cy="53" rx="18" ry="14"/><circle cx="34" cy="41" r="6"/><circle cx="46" cy="40" r="6"/>`, '#7bbf4e', '#2a5d1d', 4)}
    <ellipse cx="42" cy="58" rx="11" ry="6" fill="#d7ecb0"/>
    <circle cx="34" cy="41" r="4.4" fill="#fff"/>${oogje(34, 41.6, 2.6)}
    <circle cx="46" cy="40" r="4.4" fill="#fff"/>${oogje(46, 40.6, 2.6)}
    <path d="M34 52 Q40 56 46 52" fill="none" stroke="#1f4a15" stroke-width="1.8" stroke-linecap="round"/>
    ${wangen(30, 50, 50, 2.4)}`);
}

function kikkerKlaar(): string {
  const kikker = kikkerSvg(0, 0).replace('<svg viewBox="0 0 100 100"', '<svg x="20" y="13" width="60" height="60" viewBox="0 0 100 100"');
  return svg(`${water()}
    ${rand('<path d="M50 78 C24 78 14 70 16 62 C20 54 38 52 50 52 C62 52 80 54 84 62 C86 70 76 78 50 78 Z M50 64 L60 54 L66 58 Z"/>', '#4caf50', '#1f5a1e', 4)}
    <path d="M50 65 L24 66 M50 65 L36 74 M50 65 L66 72 M50 65 L78 66" stroke="#3d8f40" stroke-width="1.4" fill="none"/>
    ${kikker}`);
}

// --- Eitje → vlinder ---------------------------------------------------------------

const BLAD = 'M10 82 C14 44 46 18 90 14 C88 54 60 84 10 82 Z';
function blad(hap = false): string {
  const nerven = `<g fill="none" stroke="#3f8a2c" stroke-width="1.8" stroke-linecap="round">
    <path d="M12 81 C36 62 60 40 88 16"/>
    <path d="M30 66 L24 54 M30 66 L42 70 M46 52 L40 38 M46 52 L60 56 M62 38 L58 26 M62 38 L76 40"/>
  </g>`;
  if (!hap) return rand(`<path d="${BLAD}"/>`, '#6db34a', '#2a5d1d', 4) + nerven;
  const id = uid('hap');
  return `<mask id="${id}"><rect width="100" height="100" fill="#fff"/><circle cx="76" cy="56" r="7"/><circle cx="68" cy="66" r="6"/><circle cx="18" cy="56" r="6"/></mask>
    <g mask="url(#${id})">${rand(`<path d="${BLAD}"/>`, '#6db34a', '#2a5d1d', 4)}${nerven}</g>`;
}

function vlinderEitjes(): string {
  const eitje = (x: number, y: number) =>
    `<ellipse cx="${x}" cy="${y}" rx="4.2" ry="5.4" fill="#fff3b0" stroke="#a88b22" stroke-width="1.8"/><ellipse cx="${x - 1.2}" cy="${y - 1.8}" rx="1.2" ry="1.8" fill="#fff"/>`;
  return svg(`${blad()}${eitje(46, 46)}${eitje(54, 44)}${eitje(50, 54)}${eitje(58, 52)}${eitje(42, 55)}`);
}

function vlinderRups(): string {
  const leden: [number, number][] = [[26, 66], [33, 61], [40, 57], [47, 55], [54, 52]];
  const lijf = leden.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7"/>`).join('') + '<circle cx="63" cy="46" r="9"/>';
  const stippen = leden.map(([x, y]) => `<circle cx="${x}" cy="${y - 2.5}" r="1.7" fill="#ffe066"/>`).join('');
  const pootjes = leden.map(([x, y]) => `<path d="M${x} ${y + 6} l0 3.5" stroke="#2f5d10" stroke-width="2.4" stroke-linecap="round"/>`).join('');
  return svg(`${blad(true)}${pootjes}
    ${rand(lijf, '#9ad94a', '#2f5d10', 4)}
    ${stippen}
    <circle cx="63" cy="46" r="8.6" fill="#e5533d"/>
    ${lijn('M60 38 C58 33 56 31 53 31', '#3a2a1a', '#3a2a1a', 1)}${lijn('M66 38 C68 33 70 31 73 31', '#3a2a1a', '#3a2a1a', 1)}
    <circle cx="53" cy="31" r="2" fill="#3a2a1a"/><circle cx="73" cy="31" r="2" fill="#3a2a1a"/>
    ${oogje(60, 45, 1.9)}${oogje(67, 45, 1.9)}
    <path d="M60 50 Q63.5 52.5 67 50" fill="none" stroke="#5a1a10" stroke-width="1.5" stroke-linecap="round"/>`);
}

function vlinderCocon(): string {
  return svg(`
    ${lijn('M6 18 C30 14 70 20 94 14', '#8a5a2e', STAM_RAND, 5)}
    ${rand('<path d="M80 16 C82 6 92 4 96 6 C94 14 86 18 80 16 Z"/>', '#6db34a', '#2a5d1d', 3)}
    ${lijn('M50 18 L50 24', '#d8c8a8', '#7a6040', 1.6)}
    ${rand('<path d="M50 24 C62 32 66 50 62 66 C59 78 54 86 50 90 C46 86 41 78 38 66 C34 50 38 32 50 24 Z"/>', '#c9a46a', '#6b4a1a', 4.5)}
    <g fill="none" stroke="#a37e46" stroke-width="2" stroke-linecap="round">
      <path d="M41 40 C47 44 55 42 60 38"/><path d="M39 52 C46 57 56 55 62 50"/><path d="M40 64 C46 69 55 67 61 62"/><path d="M44 76 C48 80 53 79 57 75"/>
    </g>
    ${glans(45, 46, 2.6, 9, 8, 0.4)}`);
}

function vlinderKlaar(): string {
  const vleugels = `
    <path d="M48 46 C40 24 20 14 12 22 C4 32 14 48 46 52 Z"/>
    <path d="M52 46 C60 24 80 14 88 22 C96 32 86 48 54 52 Z"/>
    <path d="M47 52 C30 54 18 64 22 76 C28 86 42 76 48 58 Z"/>
    <path d="M53 52 C70 54 82 64 78 76 C72 86 58 76 52 58 Z"/>`;
  return svg(`
    ${rand(vleugels, '#ffb74d', '#7a3b12', 4.5)}
    <g fill="#f06292"><circle cx="24" cy="30" r="6"/><circle cx="76" cy="30" r="6"/><circle cx="32" cy="68" r="4.6"/><circle cx="68" cy="68" r="4.6"/></g>
    <g fill="#fff6d8"><circle cx="38" cy="40" r="3"/><circle cx="62" cy="40" r="3"/></g>
    ${lijn('M47 30 C44 22 42 18 38 16', '#3e2723', '#3e2723', 1.2)}${lijn('M53 30 C56 22 58 18 62 16', '#3e2723', '#3e2723', 1.2)}
    <circle cx="38" cy="16" r="2.4" fill="#3e2723"/><circle cx="62" cy="16" r="2.4" fill="#3e2723"/>
    ${rand('<ellipse cx="50" cy="56" rx="5" ry="20"/><circle cx="50" cy="34" r="7"/>', '#5d4037', '#2b1a12', 3)}
    ${oogje(47.4, 33.4, 1.7)}${oogje(52.6, 33.4, 1.7)}
    <path d="M47.5 37.5 Q50 39.5 52.5 37.5" fill="none" stroke="#fff" stroke-width="1.3" stroke-linecap="round"/>
    ${glans(20, 24, 4, 2, -30, 0.5)}${glans(80, 24, 4, 2, 30, 0.5)}`);
}

// --- Appel opeten ------------------------------------------------------------------

const APPEL = 'M50 32 C38 22 14 26 14 54 C14 78 32 94 44 92 C47 91.4 53 91.4 56 92 C68 94 86 78 86 54 C86 26 62 22 50 32 Z';
const APPEL_ROOD = '#e53935';
const APPEL_RAND = '#7f1414';

function appelSteel(): string {
  return `${lijn('M50 32 C50 24 52 18 56 14', '#7a4a24', '#3e2410', 3)}
    ${rand('<path d="M54 22 C60 12 72 12 76 16 C70 24 60 26 54 22 Z"/>', '#7cc85a', '#2f6b25', 3)}`;
}

// Appel met happen eruit: het silhouet wordt door de happen uitgesneden (masker), langs
// de hap komt een rand van lichtgeel vruchtvlees, met de donkere lijn erlangs.
function appelMetHappen(happen: [number, number, number][]): string {
  if (happen.length === 0) {
    return svg(`${rand(`<path d="${APPEL}"/>`, APPEL_ROOD, APPEL_RAND)}${glans(30, 46, 6, 10, 20)}${appelSteel()}`);
  }
  const masker = uid('appel');
  const knip = uid('appelknip');
  const gaten = happen.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('');
  const vlees = happen.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r + 6}"/>`).join('');
  const randjes = happen
    .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${APPEL_RAND}" stroke-width="2.6"/>`)
    .join('');
  return svg(`
    <mask id="${masker}"><rect width="100" height="100" fill="#fff"/><g fill="#000">${gaten}</g></mask>
    <clipPath id="${knip}"><path d="${APPEL}"/></clipPath>
    <g mask="url(#${masker})">
      ${rand(`<path d="${APPEL}"/>`, APPEL_ROOD, APPEL_RAND)}
      <g clip-path="url(#${knip})" fill="#fdf1c4">${vlees}</g>
    </g>
    <g clip-path="url(#${knip})">${randjes}</g>
    ${glans(30, 46, 6, 10, 20)}${appelSteel()}`);
}

function appelKlokhuis(): string {
  const vorm = 'M32 36 C32 28 42 28 50 32 C58 28 68 28 68 36 C68 42 60 44 57 48 C54 54 54 66 57 74 C62 78 68 80 66 88 C62 94 52 92 50 92 C48 92 38 94 34 88 C32 80 38 78 43 74 C46 66 46 54 43 48 C40 44 32 42 32 36 Z';
  return svg(`
    ${rand(`<path d="${vorm}"/>`, '#fdf1c4', APPEL_RAND)}
    ${rand('<path d="M32 36 C32 28 42 28 50 32 C58 28 68 28 68 36 C62 39 38 39 32 36 Z"/>', APPEL_ROOD, APPEL_RAND, 2.6)}
    ${rand('<path d="M37 84 C42 82 58 82 63 84 C64 90 56 92 50 92 C44 92 36 90 37 84 Z"/>', APPEL_ROOD, APPEL_RAND, 2.6)}
    <g fill="#4e2a12"><path d="M47 56 C45 60 46 64 48 65 C50 62 49 58 47 56 Z"/><path d="M53 56 C55 60 54 64 52 65 C50 62 51 58 53 56 Z"/></g>
    <path d="M48 46 C46 52 46 68 48 74 M52 46 C54 52 54 68 52 74" fill="none" stroke="#e8d38f" stroke-width="1.4"/>
    ${appelSteel()}`);
}

// --- Sneeuwpop ---------------------------------------------------------------------

const SNEEUW_RAND = '#5b86ad';
function sneeuwGrond(): string {
  return rand('<path d="M4 90 C20 80 80 80 96 90 C97 95 94 98 90 98 L10 98 C6 98 3 95 4 90 Z"/>', '#f2f7fc', SNEEUW_RAND, 4);
}

function sneeuwBallen(aantal: 1 | 2 | 3): string {
  const ballen = ['<circle cx="50" cy="70" r="20"/>', '<circle cx="50" cy="44" r="14.5"/>', '<circle cx="50" cy="24" r="10.5"/>'].slice(0, aantal).join('');
  const schaduw = [[56, 76, 12], [55, 48, 8], [54, 27, 5.5]]
    .slice(0, aantal)
    .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#dbe9f6"/>`)
    .join('');
  const licht = [[43, 63, 5], [45, 39, 3.6], [46, 20, 2.6]]
    .slice(0, aantal)
    .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/>`)
    .join('');
  return rand(ballen, '#ffffff', SNEEUW_RAND, 4) + schaduw + licht;
}

const wortelNeus = (x: number, y: number, draai = 0) =>
  `<g transform="rotate(${draai} ${x} ${y})">${rand(`<path d="M${x} ${y - 2.6} L${x + 14} ${y + 1} L${x} ${y + 2.6} Z"/>`, '#ff8a2a', '#9a4300', 2)}</g>`;

function hoge(x: number, y: number, draai = 0): string {
  return `<g transform="rotate(${draai} ${x} ${y})">${rand(`<rect x="${x - 13}" y="${y - 2}" width="26" height="4.5" rx="2"/><rect x="${x - 8}" y="${y - 12}" width="16" height="11" rx="2"/>`, '#2b2b33', '#0f0f14', 3)}<rect x="${x - 8}" y="${y - 5}" width="16" height="3" fill="#e53935"/></g>`;
}

function sneeuwpopEen(): string {
  return svg(`${sneeuwGrond()}${sneeuwBallen(1)}`);
}

function sneeuwpopTwee(): string {
  return svg(`${sneeuwGrond()}${sneeuwBallen(2)}`);
}

function sneeuwpopKlaar(): string {
  return svg(`${sneeuwGrond()}
    ${lijn('M37 44 L22 34 M26 37 L22 31', '#7a4a24', '#3e2410', 2.2)}${lijn('M63 44 L78 34 M74 37 L78 31', '#7a4a24', '#3e2410', 2.2)}
    ${sneeuwBallen(3)}
    ${rand('<path d="M39 32 C46 35 54 35 61 32 L61 37 C54 40 46 40 39 37 Z"/><path d="M55 36 L58 48 L63 47 L60 35 Z"/>', '#e53935', '#7f1414', 2.6)}
    <circle cx="46" cy="21.5" r="1.7" fill="#1d1d1d"/><circle cx="54" cy="21.5" r="1.7" fill="#1d1d1d"/>
    ${wortelNeus(50, 25.5)}
    <g fill="#1d1d1d"><circle cx="45" cy="29.5" r="0.95"/><circle cx="48" cy="30.6" r="0.95"/><circle cx="52" cy="30.6" r="0.95"/><circle cx="55" cy="29.5" r="0.95"/>
      <circle cx="50" cy="44" r="1.8"/><circle cx="50" cy="51" r="1.8"/><circle cx="50" cy="64" r="2"/></g>
    ${hoge(50, 15)}`);
}

function sneeuwpopGesmolten(): string {
  return svg(`${sneeuwGrond()}
    <g fill="#ffd54f" stroke="#c98f00" stroke-width="2"><circle cx="82" cy="18" r="9"/></g>
    <g stroke="#ffc107" stroke-width="2.4" stroke-linecap="round"><path d="M82 4 v-2 M96 18 h2 M68 18 h-2 M92 8 l1.6 -1.6 M72 8 l-1.6 -1.6 M92 28 l1.6 1.6 M72 28 l-1.6 1.6"/></g>
    ${rand('<path d="M10 84 C14 74 34 72 50 74 C68 72 90 74 90 84 C90 92 70 94 50 94 C28 94 10 92 10 84 Z"/>', '#bfe3f7', '#5a9cc4', 3.4)}
    ${rand('<ellipse cx="46" cy="80" rx="14" ry="6"/>', '#ffffff', SNEEUW_RAND, 3)}
    ${lijn('M18 82 L34 78', '#7a4a24', '#3e2410', 2.2)}${lijn('M64 88 L80 84', '#7a4a24', '#3e2410', 2.2)}
    ${wortelNeus(56, 84, 12)}
    ${rand('<path d="M24 88 C30 86 38 88 42 90 L40 92 C34 90 28 90 22 91 Z"/>', '#e53935', '#7f1414', 2.4)}
    <g fill="#1d1d1d"><circle cx="30" cy="80" r="1.8"/><circle cx="70" cy="80" r="1.8"/><circle cx="62" cy="91" r="1.6"/></g>
    ${hoge(46, 76, -18)}`);
}

// --- Huis bouwen -------------------------------------------------------------------

const MUUR = '#e07b4f';
const MUUR_RAND = '#7a3318';
const GAT = '#4a3b35';
const RAMEN: [number, number, number, number][] = [[25, 56, 14, 14], [61, 56, 14, 14]];
const DEUR: [number, number, number, number] = [43, 64, 14, 24];

function grasStrook(): string {
  return rand('<rect x="4" y="88" width="92" height="7" rx="3.5"/>', '#7cc85a', '#2f6b25', 3.4);
}

// Muur van x 20 tot 80, van de grond (88) tot `top`, met voegen in metselverband.
function muur(top: number): string {
  let voegen = '';
  for (let y = 88 - 6, rij = 0; y > top; y -= 6, rij++) {
    voegen += `<path d="M20 ${y} H80"/>`;
    for (let x = 20 + (rij % 2 ? 5 : 10); x < 80; x += 10) voegen += `<path d="M${x} ${y} V${Math.max(top, y - 6)}"/>`;
  }
  for (let x = 25; x < 80; x += 10) voegen += `<path d="M${x} 88 V82"/>`;
  return rand(`<rect x="20" y="${top}" width="60" height="${88 - top}"/>`, MUUR, MUUR_RAND, 4) +
    `<g stroke="#b85a33" stroke-width="1.2">${voegen}</g>`;
}

function gaten(): string {
  return [...RAMEN, DEUR].map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${GAT}" stroke="${MUUR_RAND}" stroke-width="2"/>`).join('');
}

function dak(): string {
  let pannen = '';
  for (let y = 28; y < 50; y += 6) pannen += `<path d="M${50 - (y - 16) * 1.2} ${y} H${50 + (y - 16) * 1.2}"/>`;
  return `${rand('<rect x="62" y="20" width="9" height="16"/>', MUUR, MUUR_RAND, 3.4)}
    ${rand('<path d="M12 50 L50 16 L88 50 Z"/>', '#d84343', '#7a1f1f', 4.5)}
    <g stroke="#a82e2e" stroke-width="1.4">${pannen}</g>`;
}

function huisFundering(): string {
  const steen = (x: number, y: number) => `<rect x="${x}" y="${y}" width="12" height="6" rx="1"/>`;
  return svg(`${grasStrook()}${muur(76)}
    ${rand(steen(64, 62) + steen(70, 68) + steen(58, 68), MUUR, MUUR_RAND, 2.6)}`);
}

function huisMuren(): string {
  return svg(`${grasStrook()}${muur(46)}${gaten()}`);
}

function huisDak(): string {
  return svg(`${grasStrook()}${muur(46)}${gaten()}${dak()}`);
}

function huisKlaar(): string {
  const raam = ([x, y, w, h]: [number, number, number, number]) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#bfe8ff" stroke="#f4f4f4" stroke-width="2.4"/>
     <path d="M${x + w / 2} ${y} V${y + h} M${x} ${y + h / 2} H${x + w}" stroke="#f4f4f4" stroke-width="2"/>
     <path d="M${x} ${y} H${x + w}" stroke="${MUUR_RAND}" stroke-width="1.6"/>
     ${glans(x + 3.4, y + 3.6, 1.4, 2.4, 0, 0.8)}`;
  const [dx, dy, dw, dh] = DEUR;
  return svg(`${grasStrook()}${muur(46)}${RAMEN.map(raam).join('')}
    ${rand(`<rect x="${dx}" y="${dy}" width="${dw}" height="${dh}" rx="1"/>`, '#3d7fd6', '#1c3f73', 2.4)}
    <circle cx="${dx + dw - 3.4}" cy="${dy + 13}" r="1.5" fill="#ffd54f"/>
    ${dak()}
    <g fill="#e6e9ef" stroke="#9aa3b2" stroke-width="1.8"><circle cx="68" cy="13" r="4.5"/><circle cx="74" cy="7" r="5.5"/><circle cx="83" cy="5" r="4.2"/></g>
    ${rand('<circle cx="15" cy="84" r="5"/><circle cx="22" cy="82" r="5.5"/><circle cx="85" cy="84" r="5"/>', '#4caf50', '#1f5a1e', 3)}
    <g fill="#f06292"><circle cx="15" cy="82" r="1.6"/><circle cx="22" cy="80" r="1.6"/><circle cx="86" cy="82" r="1.6"/></g>`);
}

// --- IJsje -------------------------------------------------------------------------

const HOORN = 'M35 50 L50 92 L65 50 Z';
function hoorntje(): string {
  const knip = uid('hoorn');
  let ruitjes = '';
  for (let i = -20; i < 40; i += 7) ruitjes += `<path d="M${30 + i} 46 l40 50"/><path d="M${70 - i} 46 l-40 50"/>`;
  return `<clipPath id="${knip}"><path d="${HOORN}"/></clipPath>
    ${rand(`<path d="${HOORN}"/>`, '#e8b06a', '#8a5a1e', 4)}
    <g clip-path="url(#${knip})" stroke="#c48a42" stroke-width="1.6">${ruitjes}</g>`;
}

const SPIKKELS = '<g stroke-width="2.2" stroke-linecap="round"><path d="M42 34 l3 -1" stroke="#3dbdff"/><path d="M55 30 l2 2" stroke="#ffd54f"/><path d="M48 42 l3 1" stroke="#7cc85a"/><path d="M58 40 l-1 3" stroke="#3dbdff"/><path d="M44 46 l2 -2" stroke="#ffd54f"/></g>';

function ijsjeHeel(): string {
  return svg(`${hoorntje()}
    ${rand('<circle cx="50" cy="38" r="17"/><path d="M33 46 C36 54 40 50 43 54 C46 50 50 56 53 52 C56 56 60 50 63 54 C66 50 67 48 67 44 Z"/>', '#f8a5c2', '#a83a63', 4)}
    ${glans(43, 31, 4, 6, 20)}${SPIKKELS}
    ${rand('<circle cx="52" cy="18" r="5"/>', '#e53935', '#7f1414', 2.6)}${lijn('M52 14 C52 10 55 7 58 6', '#7a4a24', '#3e2410', 1.2)}`);
}

function ijsjeSmelt(): string {
  return svg(`${hoorntje()}
    ${rand('<path d="M28 50 C26 38 38 30 50 30 C62 30 74 38 72 50 C70 54 68 54 66 58 C65 66 61 68 61 62 C61 58 59 56 57 58 C55 70 51 74 51 66 C51 60 47 58 45 60 C44 66 40 66 40 60 C39 56 36 54 34 56 C33 62 29 62 29 56 Z"/><ellipse cx="62" cy="86" rx="10" ry="3"/><path d="M64 70 C66 74 66 77 64 78 C62 77 62 74 64 70 Z"/>', '#f8a5c2', '#a83a63', 3.6)}
    ${glans(41, 38, 5, 3, -10)}${SPIKKELS}
    ${rand('<circle cx="64" cy="31" r="5"/>', '#e53935', '#7f1414', 2.6)}`);
}

function ijsjePlasje(): string {
  const knip = uid('hoornlig');
  let ruitjes = '';
  for (let i = -30; i < 50; i += 7) ruitjes += `<path d="M${10 + i} 60 l40 30"/><path d="M${70 - i} 60 l-40 30"/>`;
  const hoorn = 'M30 66 L72 74 L32 82 Z';
  return svg(`
    ${rand('<path d="M8 80 C10 68 30 64 50 66 C72 62 92 68 92 80 C92 90 72 94 50 92 C28 94 8 90 8 80 Z"/>', '#f8a5c2', '#a83a63', 4)}
    ${glans(30, 72, 8, 2.4, -6, 0.5)}
    <clipPath id="${knip}"><path d="${hoorn}"/></clipPath>
    ${rand(`<path d="${hoorn}"/>`, '#e8b06a', '#8a5a1e', 3.6)}
    <g clip-path="url(#${knip})" stroke="#c48a42" stroke-width="1.6">${ruitjes}</g>
    ${rand('<circle cx="76" cy="84" r="4.6"/>', '#e53935', '#7f1414', 2.6)}
    <g stroke-width="2.2" stroke-linecap="round"><path d="M20 82 l3 -1" stroke="#3dbdff"/><path d="M60 86 l2 2" stroke="#ffd54f"/><path d="M84 76 l3 1" stroke="#7cc85a"/></g>`);
}

// --- Kaars -------------------------------------------------------------------------

function kaars(top: number, aan: boolean, rook = false): string {
  const vlam = aan
    ? `<circle cx="50" cy="${top - 10}" r="14" fill="#ffe082" opacity="0.35"/>
       ${rand(`<path d="M50 ${top - 22} C56 ${top - 14} 57 ${top - 6} 50 ${top - 3} C43 ${top - 6} 44 ${top - 14} 50 ${top - 22} Z"/>`, '#ffb300', '#e65100', 2.4)}
       <path d="M50 ${top - 14} C53 ${top - 10} 53 ${top - 6} 50 ${top - 4.5} C47 ${top - 6} 47 ${top - 10} 50 ${top - 14} Z" fill="#fff59d"/>`
    : '';
  const rookjes = rook
    ? `<path d="M50 ${top - 4} C46 ${top - 10} 54 ${top - 16} 50 ${top - 22} C46 ${top - 28} 54 ${top - 32} 50 ${top - 38}" fill="none" stroke="#b0bec5" stroke-width="3" stroke-linecap="round"/>`
    : '';
  const druppels = top < 70 && top > 40
    ? `<path d="M41 ${top + 2} C41 ${top + 10} 44 ${top + 12} 44 ${top + 6} L44 ${top + 2} Z M55 ${top + 2} C55 ${top + 7} 58 ${top + 8} 58 ${top + 4} L58 ${top + 2} Z" fill="#ef7a78"/>`
    : '';
  return svg(`
    ${rand('<ellipse cx="50" cy="90" rx="30" ry="6.5"/>', '#90caf9', '#2f6c9e', 4)}
    ${rand(`<rect x="40" y="${top}" width="20" height="${88 - top}" rx="2"/>`, '#ef5350', '#8e1f1f', 4)}
    <rect x="43" y="${top + 4}" width="3.4" height="${Math.max(0, 80 - top)}" rx="1.7" fill="#fff" opacity="0.35"/>
    <ellipse cx="50" cy="${top + 1.5}" rx="8.6" ry="2.2" fill="#f48a88"/>
    ${druppels}
    <path d="M50 ${top + 1} V${top - 4.5}" stroke="#2b2b2b" stroke-width="2" stroke-linecap="round"/>
    ${rookjes}${vlam}`);
}

// --- Ballon ------------------------------------------------------------------------

const BALLON = '#ef4f6b';
const BALLON_RAND = '#8a1630';

function ballonSlap(): string {
  return svg(`
    ${lijn('M62 86 C70 80 76 90 82 84 C88 78 92 86 94 82', '#7a7a7a', '#7a7a7a', 0.8)}
    ${rand('<path d="M22 86 C20 76 32 70 44 74 C52 76 56 82 60 84 L62 88 C50 92 26 94 22 86 Z"/>', BALLON, BALLON_RAND, 4)}
    <path d="M30 80 C36 78 40 82 44 80 M34 87 C40 84 46 88 52 85" fill="none" stroke="#b8304a" stroke-width="1.8" stroke-linecap="round"/>
    ${rand('<path d="M60 84 L65 82 L65 89 Z"/>', BALLON, BALLON_RAND, 2.4)}`);
}

function ballonOpgeblazen(cy: number, rx: number, ry: number): string {
  const onder = cy + ry;
  return svg(`
    ${lijn(`M50 ${onder + 4} C46 ${onder + 12} 54 ${onder + 18} 50 ${Math.min(96, onder + 26)}`, '#7a7a7a', '#7a7a7a', 0.8)}
    ${rand(`<ellipse cx="50" cy="${cy}" rx="${rx}" ry="${ry}"/><path d="M46 ${onder + 4} L50 ${onder - 1} L54 ${onder + 4} Z"/>`, BALLON, BALLON_RAND, 4)}
    ${glans(50 - rx * 0.42, cy - ry * 0.4, rx * 0.18, ry * 0.28, 20, 0.55)}`);
}

function ballonKnal(): string {
  let ster = '';
  for (let i = 0; i < 12; i++) {
    const hoek = (Math.PI * 2 * i) / 12 - Math.PI / 2;
    const r = i % 2 ? 16 : 34;
    ster += `${i ? 'L' : 'M'}${(50 + Math.cos(hoek) * r).toFixed(1)} ${(46 + Math.sin(hoek) * r).toFixed(1)} `;
  }
  return svg(`
    ${rand(`<path d="${ster}Z"/>`, '#ffe066', '#e08a00', 4)}
    ${rand('<path d="M14 20 L24 24 L16 30 Z"/><path d="M80 14 L90 22 L82 26 Z"/><path d="M84 66 L94 72 L84 76 Z"/><path d="M12 64 L22 60 L20 72 Z"/><path d="M40 84 L50 82 L46 92 Z"/>', BALLON, BALLON_RAND, 3)}
    ${lijn('M60 86 C66 82 70 92 76 88 C80 85 84 90 88 92', '#7a7a7a', '#7a7a7a', 0.8)}`);
}

// --- Sinterklaas: schoen zetten ----------------------------------------------------

function schoen(inhoud = ''): string {
  return svg(`${inhoud}
    ${rand('<path d="M12 84 L12 50 C12 44 16 42 22 42 L40 42 C44 42 46 48 50 52 C58 60 76 60 84 66 C90 70 92 78 90 84 Z"/>', '#b5643a', '#4e2412', 4.5)}
    ${rand('<rect x="10" y="83" width="83" height="7" rx="3"/>', '#4e342e', '#2b1a12', 3)}
    <ellipse cx="26" cy="43.5" rx="12" ry="3.4" fill="#3e2216"/>
    <path d="M48 56 L56 64 M54 54 L46 62 M56 60 L64 66 M62 58 L54 66" stroke="#fff4e0" stroke-width="2.2" stroke-linecap="round"/>
    ${glans(20, 62, 2.6, 9, 0, 0.3)}${glans(74, 68, 7, 2.2, 20, 0.35)}`);
}

function schoenLeeg(): string {
  return schoen();
}

function schoenWortel(): string {
  return schoen(`
    ${rand('<path d="M30 8 C26 2 20 4 20 8 C24 10 27 11 30 12 Z"/><path d="M32 8 C34 0 40 0 42 4 C38 8 35 10 33 12 Z"/>', '#4caf50', '#1f5a1e', 3)}
    ${rand('<path d="M24 46 L27 14 C29 10 35 10 37 14 L30 46 Z"/>', '#ff8a2a', '#9a4300', 3.4)}
    <path d="M28 22 l4 1 M27 30 l4 1 M27 38 l3 1" stroke="#c75f00" stroke-width="1.6" stroke-linecap="round"/>`);
}

function schoenCadeau(): string {
  return schoen(`
    ${rand('<rect x="13" y="16" width="28" height="28" rx="2"/>', '#3d7fd6', '#1c3f73', 3.6)}
    <rect x="24.5" y="16" width="5" height="28" fill="#ffd54f"/><rect x="13" y="27.5" width="28" height="5" fill="#ffd54f"/>
    ${rand('<path d="M27 16 C20 6 14 10 18 15 Z"/><path d="M27 16 C34 6 40 10 36 15 Z"/>', '#ffd54f', '#b8860b', 2.4)}
    ${glans(17, 22, 1.6, 3.4, 0, 0.45)}
    <g fill="#b07a3c" stroke="#5c3a1c" stroke-width="1.4"><circle cx="66" cy="92" r="2.8"/><circle cx="73" cy="94" r="2.8"/><circle cx="80" cy="91" r="2.8"/><circle cx="6" cy="92" r="2.8"/></g>`);
}

// --- Alle getekende reeksen ----------------------------------------------------------

// Elke reeks in de goede volgorde; per vraag opnieuw getekend (unieke masker-id's).
export const GETEKENDE_REEKSEN: (() => string)[][] = [
  [bloemZaadje, bloemKiempje, bloemKnop, bloemOpen],
  [boomEikel, boomKiem, boomJong, boomGroot],
  [kikkerDril, kikkerVisje, kikkerPootjes, kikkerKlaar],
  [vlinderEitjes, vlinderRups, vlinderCocon, vlinderKlaar],
  [() => appelMetHappen([]), () => appelMetHappen([[90, 52, 13]]), () => appelMetHappen([[88, 46, 17], [86, 72, 14], [12, 58, 16]]), appelKlokhuis],
  [sneeuwpopEen, sneeuwpopTwee, sneeuwpopKlaar, sneeuwpopGesmolten],
  [huisFundering, huisMuren, huisDak, huisKlaar],
  [ijsjeHeel, ijsjeSmelt, ijsjePlasje],
  [() => kaars(30, false), () => kaars(30, true), () => kaars(56, true), () => kaars(78, false, true)],
  [ballonSlap, () => ballonOpgeblazen(60, 13, 15), () => ballonOpgeblazen(40, 28, 32), ballonKnal],
  [schoenLeeg, schoenWortel, schoenCadeau],
];
