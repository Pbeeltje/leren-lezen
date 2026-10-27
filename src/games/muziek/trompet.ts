// Trompetten: acht lange, dunne herauttrompetten naast elkaar, schuin van linksonder naar
// rechtsboven, elk met een donkerrood vaantje. De knop zelf is een gedraaide strook (zo
// breed als de ruimte tussen twee trompetten), dus tikken en glijden raken precies één
// trompet. Hoek en maat rekent legTrompetten uit de grootte van het vak.
// Vlakke kleuren in de SVG's, geen verlopen: een url(#id) naar een SVG die op display:none
// staat (een ander instrument) tekent in Chrome niets.

// Beker (de klok aan het eind), liggend met de opening rechts. 140 breed, 100 hoog.
const BEKER = `<svg viewBox="0 0 140 100" preserveAspectRatio="none">
  <path d="M0 43 C55 42 100 34 126 3 L134 3 L134 97 L126 97 C100 66 55 58 0 57 Z" fill="#f2b632" stroke="#7a4f0a" stroke-width="3" stroke-linejoin="round"/>
  <path d="M0 46 C52 45 92 39 116 15 L122 17 C98 42 56 49 0 50 Z" fill="#ffe08a"/>
  <path d="M0 57 C55 58 100 66 126 97 L118 97 C96 72 54 62 0 60 Z" fill="#c48612"/>
  <ellipse cx="131" cy="50" rx="8" ry="48" fill="#f7c84a" stroke="#7a4f0a" stroke-width="3"/>
  <ellipse cx="132" cy="50" rx="4" ry="38" fill="#8a5a0e"/>
</svg>`;

// Vaantje dat onder de buis hangt, met drie punten, een gouden rand en een rondje in de
// kleur van de toon (zo kloppen de stippen van Speel na ook hier).
const VAAN = `<svg viewBox="0 0 120 60" preserveAspectRatio="none">
  <path d="M3 2 H117 V42 L89 58 L60 45 L31 58 L3 42 Z" fill="#7d1424" stroke="#3a0710" stroke-width="3" stroke-linejoin="round"/>
  <path d="M3 34 L31 50 L60 37 L89 50 L117 34 V42 L89 58 L60 45 L31 58 L3 42 Z" fill="#5a0d18"/>
  <path d="M9 36 L31 49 L60 36 L89 49 L111 36" fill="none" stroke="#f2c14e" stroke-width="3" stroke-linejoin="round"/>
  <rect x="3" y="2" width="114" height="7" fill="#f2c14e"/>
  <circle class="trompet__teken" cx="60" cy="24" r="11" stroke="#f2c14e" stroke-width="3"/>
</svg>`;

// Klankgolfjes die bij het blazen uit de beker komen.
const KLANK = `<svg viewBox="0 0 60 100">
  <g fill="none" stroke-linecap="round">
    <path d="M10 30 Q22 50 10 70" stroke="#fff" stroke-width="12"/>
    <path d="M28 18 Q46 50 28 82" stroke="#fff" stroke-width="12"/>
    <path d="M46 6 Q68 50 46 94" stroke="#fff" stroke-width="12"/>
    <path class="trompet__golf" d="M10 30 Q22 50 10 70" stroke-width="6"/>
    <path class="trompet__golf" d="M28 18 Q46 50 28 82" stroke-width="6"/>
    <path class="trompet__golf" d="M46 6 Q68 50 46 94" stroke-width="6"/>
  </g>
</svg>`;

export function trompetHtml(): string {
  return `<span class="trompet">
    <span class="trompet__buis"></span>
    <span class="trompet__knop trompet__knop--1"></span>
    <span class="trompet__vaan">${VAAN}</span>
    <span class="trompet__knop trompet__knop--2"></span>
    <span class="trompet__beker">${BEKER}</span>
    <span class="trompet__klank">${KLANK}</span>
  </span>`;
}

// Elke trompet ligt op een eigen schuine lijn; samen vullen de lijnen het vak. De lijnen in
// de hoeken (linksboven, rechtsonder) zouden heel kort zijn, dus daar blijft ruimte over.
// De beker zit aan de bovenkant (of rechterkant) van het vak, de buis loopt linksonder het
// vak uit. Op een liggend vak liggen ze platter, op een staand vak staan ze steiler.
export function legTrompetten(vak: HTMLElement, staven: HTMLElement[]): void {
  const w = vak.clientWidth;
  const h = vak.clientHeight;
  if (!w || !h) return;
  const hoek = ((26 + 0.55 * (Math.atan2(h, w) * 180) / Math.PI) * Math.PI) / 180;
  const sin = Math.sin(hoek);
  const cos = Math.cos(hoek);
  // Lijn: x·sin + y·cos = c; richting (cos, -sin) is omhoog naar rechts.
  const totaal = w * sin + h * cos;
  const band = totaal / (staven.length + 6 * sin * cos);
  const begin = 3 * band * sin * cos;
  const rand = 6 + 0.3 * band; // ruimte voor de klankgolfjes
  vak.style.setProperty('--s', `${band}px`);
  vak.style.setProperty('--hoek', `${hoek}rad`);
  staven.forEach((staaf, i) => {
    // Straal van de beker (--beker: groot bij lage tonen, smal bij hoge).
    const beker = 0.35 * band * (Number(staaf.style.getPropertyValue('--beker')) || 1);
    const c = begin + (i + 0.35) * band;
    const naarRechts = (w - c * sin) / cos;
    const naarBoven = (c * cos) / sin;
    const boven = Math.min(naarRechts, naarBoven);
    const onder = Math.max((-c * sin) / cos, (c * cos - h) / sin);
    const terug = naarBoven <= naarRechts ? (beker * cos + rand) / sin : (beker * sin + rand) / cos;
    const u = boven - terug;
    staaf.style.setProperty('--bx', `${c * sin + u * cos}px`);
    staaf.style.setProperty('--by', `${c * cos - u * sin}px`);
    staaf.style.setProperty('--tl', `${u - onder + band}px`);
  });
}
