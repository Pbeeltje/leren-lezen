// Eigen tekeningen van wat je over een 'rivier' draagt op achtergronden zonder water:
// rijplaten en stalen balken over de bouwput, platte wagons over het ravijn, zonnepanelen
// in de ruimte, luchtbedden op de diepe zee, belletjes boven de onderwatertrog en
// regenboogbruggen over de leegte bij het kasteel. Net als boomstam/schots/vlot in
// OversteekScreen: van bovenaf, zo lang als gevraagd (viewBox: 100 per vakje, 100 hoog).

const k = (x: number): string => x.toFixed(0);

// Stalen rijplaat met traanplaatmotief en boutjes in de hoeken.
export function rijplaat(lengte: number): string {
  const L = Math.round(lengte * 100);
  let ruit = '';
  for (let x = 22; x < L - 16; x += 18) {
    for (let y = 26; y < 78; y += 16) {
      const dx = (y / 16) % 2 ? 9 : 0;
      ruit += `<path d="M${k(x + dx)} ${y} l6 -4" stroke="#b9c2ca" stroke-width="3" stroke-linecap="round"/>`;
    }
  }
  const bout = (x: number, y: number): string => `<circle cx="${k(x)}" cy="${y}" r="5" fill="#5d666e"/>`;
  return `<svg viewBox="0 0 ${L} 100" aria-hidden="true">
    <rect x="4" y="12" width="${L - 8}" height="76" rx="6" fill="#8d979f" stroke="#59616a" stroke-width="4"/>
    ${ruit}
    ${bout(14, 22)}${bout(L - 14, 22)}${bout(14, 78)}${bout(L - 14, 78)}
  </svg>`;
}

// Oranje stalen balk (I-profiel van opzij gezien) met gaten, zoals aan een bouwkraan.
export function balk(lengte: number): string {
  const L = Math.round(lengte * 100);
  let gaten = '';
  for (let x = 40; x < L - 30; x += 52) gaten += `<circle cx="${k(x)}" cy="50" r="8" fill="#9c4a10"/>`;
  return `<svg viewBox="0 0 ${L} 100" aria-hidden="true">
    <rect x="4" y="18" width="${L - 8}" height="64" rx="3" fill="#e57d2b"/>
    <rect x="4" y="18" width="${L - 8}" height="12" rx="3" fill="#f6a352"/>
    <rect x="4" y="70" width="${L - 8}" height="12" rx="3" fill="#b85d16"/>
    ${gaten}
  </svg>`;
}

// Platte wagon: houten vloer op een donker onderstel, wielen aan beide kanten.
export function wagon(lengte: number): string {
  const L = Math.round(lengte * 100);
  let planken = '';
  for (let x = 12; x < L - 12; x += 22) planken += `<path d="M${k(x)} 24 v52" stroke="#8a5a2b" stroke-width="3"/>`;
  let wielen = '';
  for (const x of [26, L - 26]) wielen += `<circle cx="${x}" cy="12" r="9" fill="#333"/><circle cx="${x}" cy="88" r="9" fill="#333"/>`;
  return `<svg viewBox="0 0 ${L} 100" aria-hidden="true">
    ${wielen}
    <rect x="4" y="14" width="${L - 8}" height="72" rx="5" fill="#3c3f46"/>
    <rect x="10" y="22" width="${L - 20}" height="56" rx="3" fill="#c48a4c"/>
    ${planken}
  </svg>`;
}

// Zonnepaneel van een ruimtestation: blauwe vakjes in een zilveren rand.
export function paneel(lengte: number): string {
  const L = Math.round(lengte * 100);
  const n = Math.max(2, Math.round((L - 16) / 34));
  const b = (L - 16) / n;
  let vakjes = '';
  for (let i = 0; i < n; i++) {
    for (const y of [20, 52]) vakjes += `<rect x="${k(8 + i * b + 2)}" y="${y}" width="${k(b - 4)}" height="28" rx="2" fill="#2f5fb3"/><path d="M${k(8 + i * b + 6)} ${y + 6} h${k(b * 0.35)}" stroke="#8fb4f0" stroke-width="3" stroke-linecap="round"/>`;
  }
  return `<svg viewBox="0 0 ${L} 100" aria-hidden="true">
    <rect x="4" y="14" width="${L - 8}" height="72" rx="4" fill="#cfd6de" stroke="#8a95a1" stroke-width="3"/>
    ${vakjes}
  </svg>`;
}

// Luchtbed met brede strepen in een vrolijke kleur en een kussen aan één kant.
export function luchtbed(lengte: number): string {
  const L = Math.round(lengte * 100);
  const kleuren = [['#ff6b8a', '#ffd0dc'], ['#3fb6ff', '#cdeeff'], ['#ffb534', '#ffecc4'], ['#6bd36b', '#d6f7d0']];
  const [a, b] = kleuren[Math.floor(Math.random() * kleuren.length)];
  let strepen = '';
  for (let x = 40; x < L - 14; x += 26) strepen += `<rect x="${x}" y="16" width="13" height="68" fill="${b}"/>`;
  return `<svg viewBox="0 0 ${L} 100" aria-hidden="true">
    <rect x="4" y="12" width="${L - 8}" height="76" rx="20" fill="${a}"/>
    ${strepen}
    <rect x="10" y="20" width="24" height="60" rx="11" fill="${b}" stroke="${a}" stroke-width="3"/>
    <rect x="4" y="12" width="${L - 8}" height="76" rx="20" fill="none" stroke="rgba(0,0,0,0.18)" stroke-width="4"/>
  </svg>`;
}

// Een wolkje luchtbellen naast elkaar: groot en klein door elkaar, met een glimlichtje.
export function bellen(lengte: number): string {
  const L = Math.round(lengte * 100);
  let bel = '';
  for (let x = 22; x < L - 14; x += 26 + Math.random() * 10) {
    const r = 15 + Math.random() * 9;
    const y = 50 + (Math.random() * 2 - 1) * (36 - r);
    bel += `<circle cx="${k(x)}" cy="${k(y)}" r="${k(r)}" fill="rgba(190,235,255,0.55)" stroke="#e6f8ff" stroke-width="3"/>`;
    bel += `<circle cx="${k(x - r * 0.35)}" cy="${k(y - r * 0.35)}" r="${k(r * 0.25)}" fill="#fff"/>`;
  }
  return `<svg viewBox="0 0 ${L} 100" aria-hidden="true">${bel}</svg>`;
}

// Regenboogbrug: zes gekleurde banen met aan beide kanten een wolkje.
export function regenboog(lengte: number): string {
  const L = Math.round(lengte * 100);
  const kleuren = ['#ff4d4d', '#ff9a2e', '#ffe14a', '#5bd65b', '#4aa8ff', '#9a6bff'];
  const banen = kleuren.map((c, i) => `<rect x="18" y="${20 + i * 10}" width="${L - 36}" height="10" fill="${c}"/>`).join('');
  const wolk = (x: number): string =>
    `<g fill="#fff"><circle cx="${x}" cy="50" r="20"/><circle cx="${x - 10}" cy="34" r="13"/><circle cx="${x + 9}" cy="68" r="13"/></g>`;
  return `<svg viewBox="0 0 ${L} 100" aria-hidden="true">
    ${banen}
    <rect x="18" y="20" width="${L - 36}" height="60" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="2"/>
    ${wolk(20)}${wolk(L - 20)}
  </svg>`;
}

export const VLOT_TEKENINGEN = { rijplaat, balk, wagon, paneel, luchtbed, bellen, regenboog };
