import type { Decor } from './achtergrond.ts';
import { el, kortAan, plaatje, svgUitTekst } from './hulp.ts';
import {
  ANKER, BREINKORAAL, BUISSPONS, KAUSTIEK, KWAL, MANTA, OCTOPUS, OPPERVLAK, RIF_MIDDEN, RIF_VER, ROTS,
  SCHATKIST, SCHILDPAD, SCHOOLVIS, WAAIERKORAAL, WALVIS, ZEESTER, kelp, takkoraal, verKoraal, verWaaier, verWier,
} from './onderwater-tekening.ts';

// Onder water, met diepte: bovenin glinstert het wateroppervlak en wuiven lichtstralen
// langzaam heen en weer; in de verte liggen twee wazige rifranden; er zweven stipjes plankton
// en opstijgende belletjes. Op de bodem: rotsen met hersen-, waaier- en takkoraal, buissponzen,
// lange kelp en zeewier, een zeester, een anker en een schatkist, met lichtnetjes die over
// het zand kruipen. Er leven een clownvisje dat af en toe uit zijn anemoon gluurt, een octopus
// die met zijn armen krult en knippert, een krab die heen en weer loopt en twee kwallen die
// kloppend naar boven drijven. Af en toe (nooit twee tegelijk, met rust ertussen) zwemt er een
// vis, een school visjes in formatie of een zeeschildpad met roeiende vinnen voorbij; heel
// af en toe glijdt ver weg een manta of walvis langs. De schatkist gaat soms op een kiertje
// open (glinstering en belletjes). Bij een goed antwoord springt het clownvisje uit de anemoon,
// juicht de krab en zwaait de octopus; aan het eind van een sessie komen de schildpad en een
// school visjes samen voorbij en gaat de kist open. Vissen zijn Fluent Emoji (ook gebruikt in
// het vangspel), al het andere is zelf getekend (onderwater-tekening.ts). Bij
// prefers-reduced-motion staat alles stil en draaien er geen timers.

const ZAND = `
<svg viewBox="0 0 1000 200" preserveAspectRatio="none">
  <path d="M0 90 C150 60 300 70 450 95 C620 122 800 70 1000 85 L1000 200 L0 200 Z" fill="#e2bd7c"/>
  <path d="M0 140 C200 115 400 125 600 140 C780 152 900 128 1000 132 L1000 200 L0 200 Z" fill="#f0d39b"/>
</svg>`;

const zeewier = (kleur: string, licht: string) => `
<svg viewBox="0 0 80 220" aria-hidden="true">
  <path d="M28 220 C14 180 40 150 24 110 C10 74 36 44 26 6 C44 40 30 74 42 108 C56 148 32 182 44 220 Z" fill="${kleur}"/>
  <path d="M46 220 C60 186 44 160 58 128 C70 100 56 78 66 54 C78 84 70 104 74 130 C78 166 62 190 62 220 Z" fill="${licht}"/>
</svg>`;

// Anemoon: tentakels in een eigen groep, zodat ze los kunnen wuiven.
const ANEMOON = `
<svg viewBox="0 0 160 120" aria-hidden="true">
  <g class="anemoon__tentakels" fill="none" stroke-linecap="round" stroke-width="10">
    <path d="M30 96 C20 70 26 50 16 30" stroke="#c77dff"/>
    <path d="M48 92 C44 62 52 42 44 18" stroke="#d99bff"/>
    <path d="M66 90 C66 60 74 40 68 10" stroke="#c77dff"/>
    <path d="M84 90 C88 60 84 38 92 12" stroke="#d99bff"/>
    <path d="M102 90 C110 64 106 44 118 22" stroke="#c77dff"/>
    <path d="M120 94 C134 72 130 54 144 36" stroke="#d99bff"/>
  </g>
  <g fill="#f2d7ff">
    <circle cx="16" cy="30" r="6"/><circle cx="44" cy="18" r="6"/><circle cx="68" cy="10" r="6"/>
    <circle cx="92" cy="12" r="6"/><circle cx="118" cy="22" r="6"/><circle cx="144" cy="36" r="6"/>
  </g>
  <path d="M18 120 C18 96 40 86 80 86 C120 86 142 96 142 120 Z" fill="#9b4dca"/>
</svg>`;

// Clownvisje, zelf getekend (kijkt naar links, net als de Fluent-vissen).
const CLOWNVIS = `
<svg viewBox="0 0 120 80" aria-hidden="true">
  <path d="M96 40 L118 18 C120 32 120 48 118 62 Z" fill="#ff8a1f" stroke="#1d2b3a" stroke-width="3" stroke-linejoin="round"/>
  <path d="M50 14 C60 4 76 6 80 16 Z M54 66 C62 74 74 74 78 64 Z" fill="#ff8a1f" stroke="#1d2b3a" stroke-width="3" stroke-linejoin="round"/>
  <ellipse cx="56" cy="40" rx="46" ry="28" fill="#ff8a1f" stroke="#1d2b3a" stroke-width="3"/>
  <path d="M34 15 C42 28 42 52 34 65 L44 67 C52 52 52 28 44 13 Z" fill="#fff" stroke="#1d2b3a" stroke-width="2.5"/>
  <path d="M70 13 C78 28 78 52 70 67 L80 66 C88 52 88 28 80 14 Z" fill="#fff" stroke="#1d2b3a" stroke-width="2.5"/>
  <circle cx="22" cy="34" r="6" fill="#fff"/><circle cx="21" cy="34" r="3.5" fill="#1d2b3a"/>
  <path d="M12 48 C16 51 20 51 24 49" fill="none" stroke="#1d2b3a" stroke-width="2.5" stroke-linecap="round"/>
</svg>`;

const VISSEN = ['vis.svg', 'vis-tropisch.svg', 'kogelvis.svg'];
const RUST_MS = 4000;

// Plekken van de visjes in een school (x en y in % van de school), de leider vooraan links.
const SCHOOL = [
  [0, 44], [10, 26], [11, 62], [21, 10], [22, 42], [21, 76], [32, 24], [33, 58], [34, 90],
  [44, 6], [45, 40], [44, 72], [56, 22], [57, 56], [58, 88], [68, 38], [69, 70], [80, 52],
];

export function maakOnderwaterDecor(): Decor {
  const root = el('div', 'decor decor-onderwater');
  const stil = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (stil) root.classList.add('decor-onderwater--stil');

  // Achterste lagen: oppervlak, verre rifranden met nevel, verre dieren en een verre kwal.
  const oppervlak = el('div', 'ow-oppervlak', root);
  el('div', 'ow-oppervlak__lijnen', oppervlak).style.backgroundImage =
    `url("data:image/svg+xml,${encodeURIComponent(OPPERVLAK)}")`;
  svgUitTekst(RIF_VER, 'ow-rif ow-rif--ver', root);
  el('div', 'ow-nevel', root);
  const verte = el('div', 'ow-verte', root);
  const verreKwal = el('div', 'ow-kwal ow-kwal--ver', root);
  svgUitTekst(KWAL, 'ow-kwal__lijf', el('div', 'ow-kwal__klop', verreKwal));
  // Koraal en wier in de verte staan op de middelste rifrand (hun voet zit erachter).
  const silhouetten = el('div', 'ow-silhouetten', root);
  const verKleur = '#1d73a5';
  svgUitTekst(verWier(verKleur), 'ow-sil ow-sil--1', silhouetten);
  svgUitTekst(verKoraal(verKleur), 'ow-sil ow-sil--2', silhouetten);
  svgUitTekst(verWaaier(verKleur), 'ow-sil ow-sil--3', silhouetten);
  svgUitTekst(verWier(verKleur), 'ow-sil ow-sil--4', silhouetten);
  svgUitTekst(verKoraal(verKleur), 'ow-sil ow-sil--5', silhouetten);
  svgUitTekst(verWaaier(verKleur), 'ow-sil ow-sil--6', silhouetten);
  svgUitTekst(RIF_MIDDEN, 'ow-rif ow-rif--midden', root);

  const stralen = el('div', 'onderwater-stralen', root);
  for (let i = 0; i < 6; i++) el('div', 'onderwater-straal', stralen);

  const plankton = el('div', 'ow-plankton', root);
  for (let i = 0; i < 26; i++) {
    const p = el('div', 'ow-stip', plankton);
    p.style.left = `${Math.random() * 100}%`;
    p.style.top = `${5 + Math.random() * 75}%`;
    const maat = 2 + Math.random() * 3;
    p.style.width = p.style.height = `${maat.toFixed(1)}px`;
    p.style.setProperty('--dx', `${(Math.random() * 60 - 30).toFixed(0)}px`);
    p.style.setProperty('--dy', `${(-10 - Math.random() * 40).toFixed(0)}px`);
    p.style.animationDuration = `${(14 + Math.random() * 16).toFixed(1)}s`;
    p.style.animationDelay = `${(-Math.random() * 30).toFixed(1)}s`;
    p.style.opacity = (0.3 + Math.random() * 0.45).toFixed(2);
  }

  const belletjes = el('div', 'onderwater-belletjes', root);
  for (let i = 0; i < 12; i++) {
    const b = el('div', 'belletje', belletjes);
    b.style.left = `${Math.random() * 100}%`;
    const maat = 6 + Math.random() * 14;
    b.style.width = b.style.height = `${maat}px`;
    b.style.animationDuration = `${7 + Math.random() * 7}s`;
    b.style.animationDelay = `${-Math.random() * 14}s`;
  }

  const kwal = el('div', 'ow-kwal ow-kwal--dichtbij', root);
  svgUitTekst(KWAL, 'ow-kwal__lijf', el('div', 'ow-kwal__klop', kwal));

  const zwemmers = el('div', 'onderwater-zwemmers', root);

  // Lange kelp achter het zand, aan beide kanten.
  svgUitTekst(kelp('#1f7a4d', '#2f9e5b'), 'ow-kelp ow-kelp--1', root);
  svgUitTekst(kelp('#2a8a57', '#45b86f'), 'ow-kelp ow-kelp--2', root);
  svgUitTekst(kelp('#1f7a4d', '#2f9e5b'), 'ow-kelp ow-kelp--3', root);
  svgUitTekst(kelp('#2a8a57', '#45b86f'), 'ow-kelp ow-kelp--4', root);

  svgUitTekst(ZAND, 'onderwater-zand', root);
  // Lichtnetjes op het zand: twee lagen die langzaam langs elkaar schuiven.
  const kaustiek = el('div', 'ow-kaustiek', root);
  const net = `url("data:image/svg+xml,${encodeURIComponent(KAUSTIEK)}")`;
  el('div', 'ow-kaustiek__laag ow-kaustiek__laag--1', kaustiek).style.backgroundImage = net;
  el('div', 'ow-kaustiek__laag ow-kaustiek__laag--2', kaustiek).style.backgroundImage = net;

  // De bodem: rotsen met koraal, en wat er verder ligt en leeft.
  const rifLinks = el('div', 'ow-rifje ow-rifje--links', root);
  svgUitTekst(takkoraal('#ffb347', '#ffe08a'), 'ow-takkoraal ow-takkoraal--geel', rifLinks);
  svgUitTekst(BREINKORAAL, 'ow-breinkoraal', rifLinks);
  svgUitTekst(ROTS, 'ow-rots', rifLinks);
  const rifRechts = el('div', 'ow-rifje ow-rifje--rechts', root);
  svgUitTekst(WAAIERKORAAL, 'ow-waaier', rifRechts);
  svgUitTekst(takkoraal('#ff7f8f', '#ffb3bd'), 'onderwater-koraal', rifRechts);
  svgUitTekst(BUISSPONS, 'ow-spons', rifRechts);
  svgUitTekst(ROTS, 'ow-rots', rifRechts);
  svgUitTekst(ANKER, 'ow-anker', root);
  svgUitTekst(zeewier('#2f9e5b', '#4cc277'), 'onderwater-wier onderwater-wier--1', root);
  svgUitTekst(zeewier('#3aa86a', '#62d08a'), 'onderwater-wier onderwater-wier--2', root);
  svgUitTekst(zeewier('#2f9e5b', '#4cc277'), 'onderwater-wier onderwater-wier--3', root);
  svgUitTekst(zeewier('#3aa86a', '#62d08a'), 'onderwater-wier onderwater-wier--4', root);

  // Het clownvisje zit achter de anemoon, gluurt er af en toe uit en springt eruit bij een
  // goed antwoord.
  const anemoon = el('div', 'anemoon', root);
  const clown = svgUitTekst(CLOWNVIS, 'anemoon__vis', el('div', 'anemoon__gluur', anemoon));
  svgUitTekst(ANEMOON, 'anemoon__plant', anemoon);

  const kist = el('div', 'ow-kist', root);
  const kistSvg = svgUitTekst(SCHATKIST, 'ow-kist__svg', kist);
  svgUitTekst(ZEESTER, 'ow-zeester', root);
  plaatje('assets/achtergrond/schelp.svg', 'onderwater-schelp', root);
  const krabLoop = el('div', 'onderwater-krab', root);
  const krab = plaatje('assets/achtergrond/krab.svg', 'onderwater-krab__lijf', krabLoop);
  const octopus = el('div', 'onderwater-octopus', root);
  const octopusSvg = svgUitTekst(OCTOPUS, 'onderwater-octopus__lijf', octopus);

  let levend = true;
  let bezig = false;
  let timer: number | undefined;
  const timers = new Set<number>();
  const wacht = (fn: () => void, ms: number): number => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      if (levend) fn();
    }, ms);
    timers.add(id);
    return id;
  };

  // Iets steekt het scherm over: de buitenste laag schuift, daarbinnen spiegelt (alles kijkt
  // naar links, dus naar rechts zwemmen = spiegelen) en golft het.
  const oversteek = (
    ouder: HTMLElement, klasse: string, hoogte: number, naarRechts: boolean, ms: number, vertraging = 0,
  ): HTMLElement => {
    const z = el('div', `zwemmer ${klasse}`, ouder);
    z.style.top = `${hoogte}%`;
    z.style.setProperty('--van-x', naarRechts ? '-110%' : 'calc(100vw + 10%)');
    z.style.setProperty('--naar-x', naarRechts ? 'calc(100vw + 10%)' : '-110%');
    z.style.animationDuration = `${ms}ms`;
    z.style.animationDelay = `${vertraging}ms`;
    const spiegel = el('div', 'zwemmer__spiegel', z);
    if (naarRechts) spiegel.classList.add('gespiegeld');
    const golf = el('div', 'zwemmer__golf', spiegel);
    golf.style.animationDelay = `${(-Math.random() * 3).toFixed(2)}s`;
    wacht(() => z.remove(), ms + vertraging + 300);
    return golf;
  };

  const zwemVis = (hoogte: number, naarRechts: boolean, ms: number) => {
    const src = VISSEN[Math.floor(Math.random() * VISSEN.length)];
    plaatje(`assets/achtergrond/${src}`, 'zwemmer__lijf', oversteek(zwemmers, 'zwemmer--vis', hoogte, naarRechts, ms));
  };

  const zwemSchildpad = (hoogte: number, naarRechts: boolean, ms: number) => {
    const golf = oversteek(zwemmers, 'zwemmer--schildpad ow-schildpad', hoogte, naarRechts, ms);
    svgUitTekst(SCHILDPAD, 'zwemmer__lijf ow-schildpad__lijf', golf);
  };

  // Een school visjes in formatie; elk visje dobbert en kwispelt een beetje op zichzelf.
  const zwemSchool = (hoogte: number, naarRechts: boolean, ms: number, vertraging = 0) => {
    const golf = oversteek(zwemmers, 'zwemmer--school ow-school', hoogte, naarRechts, ms, vertraging);
    for (const [x, y] of SCHOOL) {
      const v = el('div', 'ow-school__vis', golf);
      v.style.left = `${x + Math.random() * 3}%`;
      v.style.top = `${y + Math.random() * 4}%`;
      v.style.animationDelay = `${(-Math.random() * 2.4).toFixed(2)}s`;
      const svg = svgUitTekst(SCHOOLVIS, 'ow-school__lijf', v);
      svg.style.setProperty('--kwispel', `${(-Math.random() * 0.6).toFixed(2)}s`);
    }
  };

  // De gewone stroom: om de beurt een vis, een school of de schildpad, nooit twee tegelijk.
  let vorige = '';
  function plan(): void {
    window.clearTimeout(timer);
    if (!levend || stil) return;
    timer = window.setTimeout(() => {
      if (bezig) return plan();
      bezig = true;
      const naarRechts = Math.random() < 0.5;
      let soort = Math.random();
      if (vorige === 'schildpad' && soort >= 0.75) soort = 0.2;
      if (vorige === 'school' && soort >= 0.45 && soort < 0.75) soort = 0.2;
      let ms: number;
      if (soort < 0.45) {
        vorige = 'vis';
        ms = 14000 + Math.random() * 6000;
        zwemVis(18 + Math.random() * 40, naarRechts, ms);
      } else if (soort < 0.75) {
        vorige = 'school';
        ms = 17000 + Math.random() * 5000;
        zwemSchool(16 + Math.random() * 34, naarRechts, ms);
      } else {
        vorige = 'schildpad';
        ms = 30000 + Math.random() * 8000;
        zwemSchildpad(14 + Math.random() * 30, naarRechts, ms);
      }
      wacht(() => {
        bezig = false;
        plan();
      }, ms + RUST_MS);
    }, 2500 + Math.random() * 6000);
  }
  plan();

  // Heel af en toe glijdt er ver weg een manta of een walvis langs (los van de rest: hij
  // zit achter de stralen en is wazig, dus nooit druk).
  const planVerte = (ms: number) => {
    if (stil) return;
    wacht(() => {
      const walvis = Math.random() < 0.5;
      const duur = 60000 + Math.random() * 20000;
      const golf = oversteek(verte, `ow-ver ow-ver--${walvis ? 'walvis' : 'manta'}`, 12 + Math.random() * 18, Math.random() < 0.5, duur);
      svgUitTekst(walvis ? WALVIS : MANTA, 'ow-ver__lijf', golf);
      planVerte(duur + 40000 + Math.random() * 60000);
    }, ms);
  };
  planVerte(25000 + Math.random() * 25000);

  const bubbelWolk = (bij: HTMLElement, aantal: number) => {
    for (let i = 0; i < aantal; i++) {
      const b = el('div', 'belletje belletje--los', bij);
      b.style.left = `${30 + Math.random() * 40}%`;
      const maat = 6 + Math.random() * 10;
      b.style.width = b.style.height = `${maat}px`;
      b.style.animationDelay = `${(Math.random() * 0.5).toFixed(2)}s`;
      window.setTimeout(() => b.remove(), 2200);
    }
  };

  // De schatkist gaat af en toe op een kiertje open: glinstering en een paar belletjes.
  const openKist = () => {
    kortAan(kistSvg, 'kiert', 3600);
    window.setTimeout(() => levend && bubbelWolk(kist, 4), 500);
  };
  const planKist = () => {
    if (stil) return;
    wacht(() => {
      openKist();
      planKist();
    }, 16000 + Math.random() * 18000);
  };
  planKist();

  const juich = () => {
    kortAan(clown, 'springt', 1600);
    kortAan(krab, 'juicht', 1200);
    kortAan(octopusSvg, 'zwaait', 1800);
    bubbelWolk(anemoon, 6);
  };

  // Einde van een sessie: de schildpad met een school visjes erachter, en de kist gaat open.
  const feest = () => {
    juich();
    if (stil) return;
    bezig = true;
    window.clearTimeout(timer);
    const naarRechts = Math.random() < 0.5;
    const ms = 14000;
    zwemSchildpad(18, naarRechts, ms);
    zwemSchool(30, naarRechts, ms, 1400);
    bubbelWolk(octopus, 8);
    openKist();
    wacht(() => {
      bezig = false;
      plan();
    }, ms + 4400);
  };

  const vernietig = () => {
    levend = false;
    window.clearTimeout(timer);
    for (const id of timers) window.clearTimeout(id);
    timers.clear();
  };
  return { element: root, juich, feest, vernietig };
}
