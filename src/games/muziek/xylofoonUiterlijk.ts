import type { Uiterlijk } from './uiterlijk.ts';

// Xylofoon: de gekleurde staven liggen op een houten frame (twee latten die naar de hoge
// kant toe naar elkaar toe lopen, met een schroefje per staaf) op een lila speelkleed met
// zwevende muzieknootjes. Bij een tik slaat een stokje met een rood bolletje op de staaf en
// zweeft er een nootje in de kleur van de staaf omhoog.
// Vlakke kleuren in de SVG's, geen verlopen (een url(#id) tekent niet op display:none).

// Stokje: bolletje links (midden op x 12), steel naar rechts. 100 breed, 26 hoog.
const HAMER = `<svg viewBox="0 0 100 26" preserveAspectRatio="none">
  <path d="M20 11.2 L100 10 V16 L20 14.8 Z" fill="#e9c48c" stroke="#7b5426" stroke-width="1"/>
  <path d="M22 12 L100 11.2" stroke="#fbe3b8" stroke-width="1.2"/>
  <ellipse cx="12" cy="13" rx="11" ry="11.5" fill="#e53935" stroke="#8e1b1b" stroke-width="1.6"/>
  <ellipse cx="8.5" cy="9" rx="3.6" ry="3.2" fill="#ff8a80"/>
</svg>`;

// Een nootje dat omhoog zweeft; de kop en de vlag krijgen de kleur van de staaf.
const NOOT = `<svg viewBox="0 0 40 50">
  <path d="M27 6 V36 M27 6 C33 9 38 13 37 22" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round"/>
  <ellipse cx="18" cy="38" rx="11" ry="8.5" transform="rotate(-22 18 38)" fill="#fff"/>
  <path class="xylo-noot__kleur" d="M27 6 V36 M27 6 C33 9 38 13 37 22" fill="none" stroke-width="4" stroke-linecap="round"/>
  <ellipse class="xylo-noot__kop" cx="18" cy="38" rx="8" ry="6" transform="rotate(-22 18 38)"/>
</svg>`;

// Zachte nootjes op het kleed (alleen versiering): plek in %, maat, kleur en draaiing.
const KLEED_NOTEN: [number, number, number, string, number][] = [
  [4, 8, 7, '#c9b8f0', -14],
  [91, 10, 6, '#f6c1d6', 12],
  [7, 70, 6, '#b8e0f0', 10],
  [88, 72, 8, '#c9b8f0', -8],
  [48, 86, 5, '#f8d9a8', 16],
  [30, 4, 5, '#b8e0f0', -6],
  [70, 3, 5, '#f6c1d6', 8],
];
const KLEED_NOOT = (kleur: string): string => `<svg viewBox="0 0 40 50">
  <path d="M27 6 V36 M27 6 C33 9 38 13 37 22" fill="none" stroke="${kleur}" stroke-width="5" stroke-linecap="round"/>
  <ellipse cx="18" cy="38" rx="9" ry="7" transform="rotate(-22 18 38)" fill="${kleur}"/>
</svg>`;

export const XYLOFOON: Uiterlijk = {
  achter() {
    const kleed = document.createElement('div');
    kleed.className = 'xylo-kleed';
    kleed.innerHTML =
      KLEED_NOTEN.map(
        ([x, y, maat, kleur, draai], i) =>
          `<span class="xylo-kleed__noot" style="left: ${x}%; top: ${y}%; --maat: ${maat}; --draai: ${draai}deg; animation-delay: ${-i * 0.9}s">${KLEED_NOOT(kleur)}</span>`,
      ).join('') + '<svg class="xylo-rek"></svg>';
    return kleed;
  },
  knop(staaf) {
    staaf.insertAdjacentHTML('beforeend', `<span class="xylo-hamer">${HAMER}</span><span class="xylo-noot">${NOOT}</span>`);
  },
  leg: legRek,
};

// De twee latten van het frame lopen door de schroefjes van de staven (10px groot, met
// background-position 12% en 88%, zie de CSS) en steken aan beide kanten een stukje uit. Getekend in px van het vak,
// dus opnieuw bij elke maatverandering.
function legRek(vak: HTMLElement, staven: HTMLElement[]): void {
  const svg = vak.querySelector<SVGSVGElement>('.xylo-rek');
  if (!svg || !staven.length) return;
  const w = vak.clientWidth;
  const h = vak.clientHeight;
  if (!w || !h) return;
  const punten = staven.map((s) => ({
    x: s.offsetLeft + s.offsetWidth / 2,
    boven: s.offsetTop + (s.offsetHeight - 10) * 0.12 + 5,
    onder: s.offsetTop + (s.offsetHeight - 10) * 0.88 + 5,
    breed: s.offsetWidth,
  }));
  const dik = Math.max(10, Math.min(26, punten[0].breed * 0.3));
  const eerste = punten[0];
  const laatste = punten[punten.length - 1];
  // Hoever de lat voorbij de buitenste staaf steekt: een eind, maar binnen het kleed.
  const uit = Math.max(eerste.breed, 24) * 0.75;
  const uitL = Math.max(0, Math.min(uit, eerste.x - dik));
  const uitR = Math.max(0, Math.min(uit, w - laatste.x - dik));
  // Een lat langs de schroefjes, aan de uiteinden doorgetrokken in dezelfde richting.
  const lat = (y: (p: (typeof punten)[number]) => number): string => {
    if (punten.length < 2) return `M${eerste.x - uitL} ${y(eerste)} H${eerste.x + uitR}`;
    const tweede = punten[1];
    const voorlaatste = punten[punten.length - 2];
    const helling0 = (y(tweede) - y(eerste)) / (tweede.x - eerste.x);
    const helling1 = (y(laatste) - y(voorlaatste)) / (laatste.x - voorlaatste.x);
    return [
      `M${eerste.x - uitL} ${y(eerste) - helling0 * uitL}`,
      ...punten.map((p) => `L${p.x} ${y(p)}`),
      `L${laatste.x + uitR} ${y(laatste) + helling1 * uitR}`,
    ].join(' ');
  };
  const tekenLat = (d: string): string => `
    <path d="${d}" fill="none" stroke="rgba(60,30,90,0.18)" stroke-width="${dik}" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 ${dik * 0.35})"/>
    <path d="${d}" fill="none" stroke="#5c3317" stroke-width="${dik}" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${d}" fill="none" stroke="#9a5b2c" stroke-width="${dik - 5}" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${d}" fill="none" stroke="#c4834a" stroke-width="${Math.max(2, dik * 0.18)}" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 ${-dik * 0.18})"/>`;
  // Rubberen voetjes aan de vier hoeken.
  const voetje = (x: number, y: number): string =>
    `<circle cx="${x}" cy="${y}" r="${dik * 0.42}" fill="#3e2723"/><circle cx="${x - dik * 0.1}" cy="${y - dik * 0.1}" r="${dik * 0.16}" fill="#6d4c41"/>`;
  const b = lat((p) => p.boven);
  const o = lat((p) => p.onder);
  const eind = (y: (p: (typeof punten)[number]) => number, p: (typeof punten)[number], kant: number): [number, number] => {
    const d = (kant < 0 ? uitL : uitR) * 0.8;
    if (punten.length < 2) return [p.x + kant * d, y(p)];
    const q = kant < 0 ? punten[1] : punten[punten.length - 2];
    const helling = (y(p) - y(q)) / (p.x - q.x);
    return [p.x + kant * d, y(p) + helling * kant * d];
  };
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.innerHTML =
    tekenLat(b) +
    tekenLat(o) +
    [eind((p) => p.boven, eerste, -1), eind((p) => p.onder, eerste, -1), eind((p) => p.boven, laatste, 1), eind((p) => p.onder, laatste, 1)]
      .map(([x, y]) => voetje(x, y))
      .join('');
}
