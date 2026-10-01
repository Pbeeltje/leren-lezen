import type { Decor } from './achtergrond.ts';
import { el, plaatje, svgUitTekst } from './hulp.ts';

// Kermis in de schemering: een paarse avondlucht met sterretjes, een reuzenrad aan de
// linkerrand dat langzaam draait (de bakjes blijven rechtop hangen), een draaimolen met
// paardjes die rondgaan, een suikerspinkraam met een ijsje op het dak en slingers met
// lampjes die zacht om de beurt aangaan. Af en toe ontsnapt er een ballon. Bij een goed
// antwoord stijgen er een paar gekleurde ballonnen op uit het kraam; aan het eind van een
// sessie is er vuurwerk boven de kermis. Paardjes, ijsje en popcorn zijn Fluent
// Emoji, de rest is zelf getekend.

const GROND = `
<svg viewBox="0 0 1000 200" preserveAspectRatio="none">
  <path d="M0 62 C250 56 750 56 1000 62 L1000 200 L0 200 Z" fill="#3c6f55"/>
  <path d="M0 118 C300 106 700 106 1000 118 L1000 200 L0 200 Z" fill="#8a5a6c"/>
  <path d="M0 160 C300 152 700 152 1000 160 L1000 200 L0 200 Z" fill="#7a4d60"/>
</svg>`;

const LAMP_KLEUREN = ['#ffe27a', '#ff9db0', '#8fd6ff', '#b8f08c', '#ffbf73'];
const BAKJE_KLEUREN = ['#ff6b8b', '#ffb03a', '#4fc3f7', '#8bd66b', '#b48cff', '#ff8a4c', '#4dd0c4', '#ffd23f'];

// Reuzenrad: de poten staan stil, de groep .kermis-rad__draai draait rond het midden en
// elk bakje draait even snel de andere kant op (rond zijn ophangpunt), zodat het rechtop blijft.
function reuzenrad(): string {
  const mx = 150;
  const my = 150;
  const r = 130;
  const punt = (graden: number, straal: number) => {
    const h = (graden * Math.PI) / 180;
    return [mx + Math.cos(h) * straal, my + Math.sin(h) * straal].map((n) => n.toFixed(1));
  };
  let spaken = '';
  let lampen = '';
  for (let i = 0; i < 16; i++) {
    const [x, y] = punt(i * 22.5, r);
    spaken += `<path d="M${mx} ${my} L${x} ${y}"/>`;
    const [lx, ly] = punt(i * 22.5 + 11.25, r);
    lampen += `<circle class="kermis-lamp" cx="${lx}" cy="${ly}" r="4.5" fill="${LAMP_KLEUREN[i % LAMP_KLEUREN.length]}" style="animation-delay:${(-i * 0.22).toFixed(2)}s"/>`;
  }
  let bakjes = '';
  for (let i = 0; i < 8; i++) {
    const [x, y] = punt(i * 45, r);
    const k = BAKJE_KLEUREN[i];
    bakjes += `<g transform="translate(${x} ${y})"><g class="kermis-bakje">
      <path d="M0 0 V12" stroke="#5a3d82" stroke-width="3"/>
      <path d="M-17 13 Q0 3 17 13 Z" fill="${k}" stroke="#5a3d82" stroke-width="2" stroke-linejoin="round"/>
      <rect x="-15" y="13" width="30" height="21" rx="6" fill="${k}" stroke="#5a3d82" stroke-width="2"/>
      <rect x="-11" y="16" width="22" height="9" rx="3" fill="#fff4d6"/>
    </g></g>`;
  }
  return `
<svg viewBox="0 0 300 392" aria-hidden="true">
  <g stroke="#e9def7" stroke-width="9" stroke-linecap="round">
    <path d="M150 150 L56 376 M150 150 L244 376"/>
  </g>
  <path d="M86 304 H214 M110 246 H190" stroke="#cbbbe3" stroke-width="5" stroke-linecap="round"/>
  <rect x="34" y="370" width="232" height="22" rx="6" fill="#6b3f8f" stroke="#43275e" stroke-width="3"/>
  <g class="kermis-rad__draai">
    <g fill="none" stroke="#fff7e8" stroke-linecap="round">
      <circle cx="${mx}" cy="${my}" r="${r}" stroke-width="7"/>
      <circle cx="${mx}" cy="${my}" r="${r - 14}" stroke-width="3"/>
      <circle cx="${mx}" cy="${my}" r="40" stroke-width="3"/>
      <g stroke-width="2.5">${spaken}</g>
    </g>
    ${lampen}
    ${bakjes}
  </g>
  <circle cx="${mx}" cy="${my}" r="15" fill="#ffcc4d" stroke="#c77d00" stroke-width="3"/>
  <circle cx="${mx}" cy="${my}" r="5" fill="#c77d00"/>
</svg>`;
}

// Draaimolen: een gestreept puntdak met een vlaggetje en lampjes langs de rand.
function draaimolenDak(): string {
  let banen = '';
  const kleuren = ['#ff5a7a', '#fff3e6'];
  for (let i = 0; i < 8; i++) {
    const x1 = 10 + i * 22.5;
    banen += `<path d="M100 14 L${x1} 62 L${x1 + 22.5} 62 Z" fill="${kleuren[i % 2]}"/>`;
  }
  let schulpen = '';
  let lampen = '';
  for (let i = 0; i < 9; i++) {
    const x = 10 + i * 20;
    schulpen += `<path d="M${x} 62 A10 10 0 0 0 ${x + 20} 62 Z" fill="${['#ffcc4d', '#ff5a7a'][i % 2]}"/>`;
  }
  for (let i = 0; i < 10; i++) {
    lampen += `<circle class="kermis-lamp" cx="${10 + i * 20}" cy="62" r="3.6" fill="${LAMP_KLEUREN[i % LAMP_KLEUREN.length]}" style="animation-delay:${(-i * 0.25).toFixed(2)}s"/>`;
  }
  return `
<svg viewBox="0 0 200 76" aria-hidden="true">
  <path d="M100 14 V2" stroke="#5a3d82" stroke-width="2.5"/>
  <path d="M100 2 L118 6 L100 11 Z" fill="#ffcc4d"/>
  ${banen}
  <path d="M100 14 L10 62 H190 Z" fill="none" stroke="#7d2a4a" stroke-width="2.5" stroke-linejoin="round"/>
  ${schulpen}
  ${lampen}
</svg>`;
}

function draaimolenVloer(): string {
  let lampen = '';
  for (let i = 0; i < 9; i++) {
    lampen += `<circle class="kermis-lamp" cx="${20 + i * 20}" cy="24" r="3" fill="${LAMP_KLEUREN[(i + 2) % LAMP_KLEUREN.length]}" style="animation-delay:${(-i * 0.25).toFixed(2)}s"/>`;
  }
  return `
<svg viewBox="0 0 200 40" aria-hidden="true">
  <path d="M8 14 V30 A92 9 0 0 0 192 30 V14 Z" fill="#7a3f9a" stroke="#43275e" stroke-width="2.5"/>
  <ellipse cx="100" cy="14" rx="92" ry="9" fill="#d7b8f0" stroke="#43275e" stroke-width="2.5"/>
  ${lampen}
</svg>`;
}

// Suikerspinkraam met een gestreepte luifel; het ijsje en de popcorn komen er als plaatje bij.
function kraam(): string {
  let luifel = '';
  for (let i = 0; i < 8; i++) {
    const x = 8 + i * 23;
    const kleur = i % 2 ? '#fff1f8' : '#ff7eb6';
    luifel += `<rect x="${x}" y="40" width="23" height="24" fill="${kleur}"/>`;
    luifel += `<path d="M${x} 63 A11.5 11.5 0 0 0 ${x + 23} 63 Z" fill="${kleur}"/>`;
  }
  let lampen = '';
  for (let i = 0; i < 9; i++) {
    lampen += `<circle class="kermis-lamp" cx="${8 + i * 23}" cy="40" r="3.4" fill="${LAMP_KLEUREN[i % LAMP_KLEUREN.length]}" style="animation-delay:${(-i * 0.3).toFixed(2)}s"/>`;
  }
  const suikerspin = (x: number, kleur: string, licht: string) => `
    <path d="M${x} 150 V126" stroke="#f3e2c0" stroke-width="3" stroke-linecap="round"/>
    <circle cx="${x}" cy="114" r="13" fill="${kleur}"/><circle cx="${x - 8}" cy="108" r="9" fill="${licht}"/>
    <circle cx="${x + 7}" cy="104" r="10" fill="${licht}"/><circle cx="${x + 2}" cy="118" r="8" fill="${licht}" opacity="0.7"/>`;
  return `
<svg viewBox="0 0 200 206" aria-hidden="true">
  <rect x="16" y="56" width="10" height="148" fill="#e8d2b0" stroke="#7a4d3a" stroke-width="2"/>
  <rect x="174" y="56" width="10" height="148" fill="#e8d2b0" stroke="#7a4d3a" stroke-width="2"/>
  <rect x="26" y="66" width="148" height="86" fill="#5a2f6e"/>
  <path d="M8 40 L32 14 H168 L192 40 Z" fill="#ff5a9a" stroke="#9c2a5e" stroke-width="3" stroke-linejoin="round"/>
  ${luifel}
  <path d="M8 40 H192" stroke="#9c2a5e" stroke-width="3"/>
  ${lampen}
  ${suikerspin(62, '#ff9ccc', '#ffc4e2')}
  ${suikerspin(98, '#a9c8ff', '#cfe0ff')}
  <rect x="10" y="148" width="180" height="56" rx="4" fill="#ff9fc8" stroke="#9c2a5e" stroke-width="3"/>
  <path d="M40 150 V204 M70 150 V204 M100 150 V204 M130 150 V204 M160 150 V204" stroke="#ffc4de" stroke-width="10"/>
  <rect x="6" y="144" width="188" height="10" rx="4" fill="#fff1f8" stroke="#9c2a5e" stroke-width="3"/>
</svg>`;
}

// Een slinger met drie bochten over de hele breedte. Draad en lampjes rekenen allebei in
// procenten van hetzelfde vak, zodat ze op elk scherm precies op elkaar vallen.
function maakSlinger(ouder: HTMLElement): void {
  const slinger = el('div', 'kermis-slinger', ouder);
  const bochten = 3;
  let pad = 'M0 0';
  for (let b = 0; b < bochten; b++) {
    const a = (100 / bochten) * b;
    const e = (100 / bochten) * (b + 1);
    pad += ` Q${((a + e) / 2).toFixed(2)} 200 ${e.toFixed(2)} 0`;
  }
  svgUitTekst(
    `<svg viewBox="0 0 100 100" preserveAspectRatio="none"><path d="${pad}" fill="none" stroke="#2b1b40" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>`,
    'kermis-slinger__draad',
    slinger,
  );
  let n = 0;
  for (let b = 0; b < bochten; b++) {
    for (let s = 1; s < 8; s++) {
      const t = s / 8;
      const lamp = el('div', 'kermis-slinger__lamp', slinger);
      lamp.style.left = `${((100 / bochten) * (b + t)).toFixed(2)}%`;
      lamp.style.top = `${(2 * t * (1 - t) * 200).toFixed(1)}%`;
      lamp.style.setProperty('--kleur', LAMP_KLEUREN[n % LAMP_KLEUREN.length]);
      lamp.style.animationDelay = `${(-n * 0.2).toFixed(2)}s`;
      n++;
    }
  }
}

// Ballon, zelf getekend zodat elke kleur echt helder is (met glimlichtje en krul-touwtje).
const ballonTekening = (kleur: string, donker: string) => `
<svg viewBox="0 0 60 120" aria-hidden="true">
  <path d="M30 76 C26 86 36 92 30 102 C25 110 34 114 31 120" fill="none" stroke="#f3eefc" stroke-width="2" stroke-linecap="round"/>
  <path d="M30 70 L25 78 H35 Z" fill="${donker}"/>
  <path d="M30 72 C12 72 3 52 3 34 C3 15 15 3 30 3 C45 3 57 15 57 34 C57 52 48 72 30 72 Z" fill="${kleur}" stroke="${donker}" stroke-width="2"/>
  <ellipse cx="19" cy="22" rx="6" ry="10" fill="#fff" opacity="0.55" transform="rotate(25 19 22)"/>
</svg>`;
const BALLON_KLEUREN: [string, string][] = [
  ['#ff5a6e', '#b8283c'], ['#ffc93c', '#c98a00'], ['#4fc3f7', '#1f7fb0'],
  ['#7bd66b', '#3e9a33'], ['#b48cff', '#6f4cc4'], ['#ff8ad0', '#c24a90'],
];

const VUURWERK_KLEUREN = ['#ffd23f', '#ff7eb6', '#7fd4ff', '#a8f07a', '#ffffff', '#c9a4ff'];
const FEEST_MS = 6500;

export function maakKermisDecor(): Decor {
  const root = el('div', 'decor decor-kermis');

  const sterren = el('div', 'kermis-sterren', root);
  for (let i = 0; i < 16; i++) {
    const s = el('div', 'kermis-ster', sterren);
    s.style.left = `${4 + Math.random() * 92}%`;
    s.style.top = `${Math.random() * 100}%`;
    s.style.animationDelay = `${(-Math.random() * 4).toFixed(2)}s`;
  }
  el('div', 'kermis-gloed', root);
  const lucht = el('div', 'kermis-lucht', root);

  svgUitTekst(GROND, 'kermis-grond', root);
  maakSlinger(root);
  el('div', 'kermis-paal kermis-paal--1', root);
  el('div', 'kermis-paal kermis-paal--2', root);

  svgUitTekst(reuzenrad(), 'kermis-rad', root);

  // Draaimolen: achterste paardjes, de middenpaal, voorste paardjes, dan dak en vloer.
  const molen = el('div', 'kermis-molen', root);
  svgUitTekst(draaimolenVloer(), 'kermis-molen__vloer', molen);
  el('div', 'kermis-molen__paal', molen);
  for (let i = 0; i < 3; i++) {
    const p = el('div', `kermis-paard kermis-paard--${i + 1}`, molen);
    el('div', 'kermis-paard__stang', p);
    plaatje('assets/achtergrond/kermis-paard.svg', 'kermis-paard__lijf', p);
  }
  svgUitTekst(draaimolenDak(), 'kermis-molen__dak', molen);

  const kraamVak = el('div', 'kermis-kraam', root);
  plaatje('assets/achtergrond/kermis-ijsje.svg', 'kermis-kraam__ijsje', kraamVak);
  svgUitTekst(kraam(), 'kermis-kraam__svg', kraamVak);
  plaatje('assets/achtergrond/kermis-popcorn.svg', 'kermis-kraam__popcorn', kraamVak);

  const ballonnen = el('div', 'kermis-ballonnen', root);

  const stil = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let levend = true;
  let bezig = false;
  let timer: number | undefined;
  const losseTimers = new Set<number>();
  const later = (f: () => void, ms: number) => {
    const t = window.setTimeout(() => {
      losseTimers.delete(t);
      if (levend) f();
    }, ms);
    losseTimers.add(t);
  };

  // Een ballon stijgt op vanaf het kraam (in procenten van het decor), wiebelend.
  const ballon = (vertraging: number, kleur: number) => {
    const vak = kraamVak.getBoundingClientRect();
    const decorVak = root.getBoundingClientRect();
    if (!decorVak.width) return;
    const b = el('div', 'kermis-ballon', ballonnen);
    const x = vak.left - decorVak.left + vak.width * (0.25 + Math.random() * 0.5);
    b.style.left = `${x}px`;
    b.style.top = `${vak.top - decorVak.top + vak.height * 0.35}px`;
    b.style.animationDelay = `${vertraging}ms`;
    b.style.setProperty('--drift', `${Math.round((Math.random() - 0.5) * 16)}vw`);
    const wiebel = el('div', 'kermis-ballon__wiebel', b);
    wiebel.style.animationDelay = `${(-Math.random() * 3).toFixed(2)}s`;
    const [licht, donker] = BALLON_KLEUREN[kleur % BALLON_KLEUREN.length];
    svgUitTekst(ballonTekening(licht, donker), 'kermis-ballon__lijf', wiebel);
    window.setTimeout(() => b.remove(), 7500 + vertraging);
  };

  // Af en toe laat iemand een ballon los (nooit tijdens het feest).
  function plan(): void {
    window.clearTimeout(timer);
    if (!levend || stil) return;
    timer = window.setTimeout(() => {
      if (!levend) return;
      if (!bezig && ballonnen.childElementCount === 0) ballon(0, Math.floor(Math.random() * BALLON_KLEUREN.length));
      plan();
    }, 14000 + Math.random() * 14000);
  }
  plan();

  const juich = () => {
    // Niet eindeloos opstapelen als er snel achter elkaar goed geantwoord wordt.
    if (ballonnen.childElementCount > 8) return;
    const start = Math.floor(Math.random() * BALLON_KLEUREN.length);
    for (let i = 0; i < 4; i++) ballon(i * 220, start + i);
  };

  // Eén vuurpijl: een lichtje schiet omhoog en spat uiteen in vonken.
  const vuurpijl = (links: number, boven: number, kleur: string) => {
    const pijl = el('div', 'kermis-pijl', lucht);
    pijl.style.left = `${links}%`;
    pijl.style.setProperty('--hoogte', `${100 - boven}vh`);
    pijl.style.top = `${boven}%`;
    window.setTimeout(() => pijl.remove(), 800);
    later(() => {
      const knal = el('div', 'kermis-knal', lucht);
      knal.style.left = `${links}%`;
      knal.style.top = `${boven}%`;
      knal.style.setProperty('--kleur', kleur);
      el('div', 'kermis-knal__gloed', knal);
      // Een buitenring in de kleur van de pijl en een kortere, lichte binnenring.
      for (const [aantal, klasse] of [[16, ''], [10, ' kermis-vonk--binnen']] as const) {
        for (let i = 0; i < aantal; i++) {
          const v = el('div', `kermis-vonk${klasse}`, knal);
          v.style.transform = `rotate(${(360 / aantal) * i + (klasse ? 18 : 0)}deg)`;
          el('div', 'kermis-vonk__staart', v);
        }
      }
      window.setTimeout(() => knal.remove(), 2000);
    }, 700);
  };

  const feest = () => {
    juich();
    if (stil || bezig) return;
    bezig = true;
    window.clearTimeout(timer);
    const plekken = [
      [26, 22], [70, 16], [46, 10], [82, 32], [18, 36], [58, 28], [36, 18],
    ];
    // Op een smalle telefoon staan de kaarten hoog: daar knalt het vuurwerk vlak onder de knoppen.
    const smal = root.clientWidth < 560;
    plekken.forEach(([links, boven], i) => {
      const x = smal ? 25 + (links - 18) * 0.78 : links + (Math.random() - 0.5) * 6;
      const y = smal ? 7 + boven * 0.3 : boven;
      later(() => vuurpijl(x, y, VUURWERK_KLEUREN[i % VUURWERK_KLEUREN.length]), i * 620);
    });
    later(() => {
      bezig = false;
      plan();
    }, FEEST_MS);
  };

  const vernietig = () => {
    levend = false;
    window.clearTimeout(timer);
    for (const t of losseTimers) window.clearTimeout(t);
    losseTimers.clear();
  };
  return { element: root, juich, feest, vernietig };
}
