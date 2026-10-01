import type { Decor } from './achtergrond.ts';
import { el, kortAan, plaatje, svgUitTekst, zetOpPad } from './hulp.ts';

// Winter: zachte sneeuwval boven besneeuwde heuvels met sneeuwdennen, en een zelf getekende
// sneeuwpop met een sjaal die af en toe met zijn ogen knippert en rustig zwaait. Af en toe
// glijdt er een pinguïn op een slee de heuvel af. Bij een goed antwoord springt
// de hoge hoed van de sneeuwpop op, met een wolkje sneeuw; aan het eind van een sessie komt
// er noorderlicht in de lucht en dwarrelen er sneeuwvlokjes en sterretjes naar beneden.
// Rechts vooraan ligt een ijsvijvertje (loopt buiten beeld), af en toe vliegt er een vogeltje
// over (meestal één, soms twee; een roodborstje of een pimpelmees), en het weer wisselt: helder, lichte sneeuw (iets donkerder), weer helder
// en dan een flinke sneeuwstorm (donker, veel schuine sneeuw; de vogeltjes schieten snel de
// dennen in om te schuilen).
// Slee, pinguïn en sneeuwvlok zijn Fluent Emoji, de rest is zelf getekend.

const HEUVELS = `
<svg viewBox="0 0 1000 300" preserveAspectRatio="none">
  <path d="M0 110 C120 60 230 70 330 120 C420 160 520 150 620 110 C740 60 880 50 1000 90 L1000 300 L0 300 Z" fill="#d2e3f6"/>
  <path d="M0 150 C160 110 300 120 440 160 C560 192 700 170 820 128 C900 100 960 92 1000 96 L1000 300 L0 300 Z" fill="#e9f3fd"/>
  <path d="M0 236 C160 226 330 220 480 204 C640 186 780 150 1000 118 L1000 300 L0 300 Z" fill="#f8fcff"/>
  <path d="M0 236 C160 226 330 220 480 204 C640 186 780 150 1000 118" fill="none" stroke="#d6e7f6" stroke-width="3" vector-effect="non-scaling-stroke"/>
</svg>`;

// De voorste strook sneeuw ligt over de sleebaan heen, zodat de slee er net achter glijdt.
const VOORHEUVEL = `
<svg viewBox="0 0 1000 300" preserveAspectRatio="none">
  <path d="M0 262 C220 248 460 256 700 266 C840 271 940 264 1000 258 L1000 300 L0 300 Z" fill="#ffffff"/>
  <path d="M0 262 C220 248 460 256 700 266 C840 271 940 264 1000 258" fill="none" stroke="#cfe2f4" stroke-width="3" vector-effect="non-scaling-stroke"/>
</svg>`;

// Een sneeuwden: drie lagen groen met elk een sneeuwkapje.
const DEN = `
<svg viewBox="0 0 120 170" aria-hidden="true">
  <rect x="52" y="140" width="16" height="30" rx="3" fill="#7a5236"/>
  <path d="M60 52 L108 142 C80 150 40 150 12 142 Z" fill="#2f8f5b"/>
  <path d="M12 142 C40 150 80 150 108 142 L98 124 C76 132 44 132 22 124 Z" fill="#fff"/>
  <path d="M60 28 L98 104 C76 110 44 110 22 104 Z" fill="#3aa36a"/>
  <path d="M22 104 C44 110 76 110 98 104 L90 90 C72 96 48 96 30 90 Z" fill="#fff"/>
  <path d="M60 4 L86 66 C70 71 50 71 34 66 Z" fill="#46b677"/>
  <path d="M60 4 L74 36 C66 40 54 40 46 36 Z M34 66 C50 71 70 71 86 66 L80 54 C68 59 52 59 40 54 Z" fill="#fff"/>
</svg>`;

// De sneeuwpop. Hoed, ogen en zwaaiarm zijn eigen groepen, zodat ze los kunnen bewegen.
const SNEEUWPOP = `
<svg viewBox="0 -14 160 254" aria-hidden="true">
  <g fill="none" stroke="#6b4a32" stroke-width="5" stroke-linecap="round">
    <path d="M46 112 L10 92 M22 99 L14 80 M22 99 L4 104"/>
  </g>
  <g class="winter-sneeuwpop__arm" fill="none" stroke="#6b4a32" stroke-width="5" stroke-linecap="round">
    <path d="M114 112 L150 86 M138 95 L146 76 M138 95 L156 98"/>
  </g>
  <ellipse cx="80" cy="234" rx="58" ry="7" fill="#c6dcf0"/>
  <circle cx="80" cy="186" r="50" fill="#fff" stroke="#c9ddef" stroke-width="3"/>
  <path d="M42 200 C52 226 108 226 118 200" fill="none" stroke="#e1edf8" stroke-width="8" stroke-linecap="round"/>
  <circle cx="80" cy="116" r="37" fill="#fff" stroke="#c9ddef" stroke-width="3"/>
  <g fill="#34405a"><circle cx="80" cy="108" r="4.5"/><circle cx="80" cy="124" r="4.5"/><circle cx="80" cy="140" r="4.5"/></g>
  <circle cx="80" cy="62" r="29" fill="#fff" stroke="#c9ddef" stroke-width="3"/>
  <circle cx="61" cy="70" r="6" fill="#ffc2cf" opacity="0.8"/><circle cx="99" cy="70" r="6" fill="#ffc2cf" opacity="0.8"/>
  <g class="winter-sneeuwpop__ogen" fill="#2a3346">
    <circle cx="70" cy="56" r="4"/><circle cx="90" cy="56" r="4"/>
    <circle cx="71.5" cy="54.5" r="1.3" fill="#fff"/><circle cx="91.5" cy="54.5" r="1.3" fill="#fff"/>
  </g>
  <path d="M79 63 L106 68 L79 71 Z" fill="#ff8a1f" stroke="#d9650a" stroke-width="1.5" stroke-linejoin="round"/>
  <g fill="#2a3346"><circle cx="69" cy="78" r="2"/><circle cx="75" cy="81.5" r="2"/><circle cx="82" cy="82.5" r="2"/><circle cx="89" cy="80" r="2"/></g>
  <path d="M50 86 C64 96 96 96 110 86 L112 98 C96 108 64 108 48 98 Z" fill="#e8434f" stroke="#b52532" stroke-width="2" stroke-linejoin="round"/>
  <path d="M94 100 L104 136 L90 138 L84 102 Z" fill="#e8434f" stroke="#b52532" stroke-width="2" stroke-linejoin="round"/>
  <path d="M60 92 V102 M72 95 V105 M88 95 V105 M100 92 V102 M92 116 H101 M94 126 H103" stroke="#ff8f97" stroke-width="2.5"/>
  <g class="winter-sneeuwpop__hoed">
    <rect x="48" y="30" width="64" height="9" rx="4.5" fill="#2d3550"/>
    <rect x="58" y="-10" width="44" height="42" rx="4" fill="#2d3550"/>
    <rect x="58" y="20" width="44" height="8" fill="#e8434f"/>
    <path d="M64 -6 V16" stroke="#4a5577" stroke-width="4" stroke-linecap="round"/>
  </g>
</svg>`;

// IJsvijver: een plat ovaal met glansstrepen en een besneeuwde rand.
const IJS = `
<svg viewBox="0 0 400 120" aria-hidden="true">
  <ellipse cx="210" cy="64" rx="206" ry="52" fill="#ffffff"/>
  <ellipse cx="212" cy="66" rx="190" ry="42" fill="#bfe3f7"/>
  <ellipse cx="216" cy="70" rx="168" ry="32" fill="#a6d6f2"/>
  <path d="M90 60 C130 50 170 50 200 56 M130 76 C170 70 220 70 260 76 M250 52 C280 48 310 50 330 56" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.75" fill="none"/>
  <path d="M150 88 L172 74 M300 84 L318 72" stroke="#e7f6ff" stroke-width="3" stroke-linecap="round"/>
  <path d="M8 66 C20 40 60 22 110 18 C90 26 50 40 26 70 Z M380 30 C396 40 404 52 404 64 C396 54 380 46 360 40 Z" fill="#ffffff"/>
  <g fill="#ffffff"><ellipse cx="60" cy="108" rx="40" ry="10"/><ellipse cx="200" cy="114" rx="70" ry="9"/><ellipse cx="340" cy="108" rx="50" ry="10"/></g>
</svg>`;

// Roodborstje van opzij (kijkt naar rechts), met een vleugel die kan flapperen.
const VOGEL = `
<svg viewBox="0 0 60 44" aria-hidden="true">
  <path d="M8 22 L0 16 L2 26 Z" fill="#6b4a32"/>
  <ellipse cx="26" cy="24" rx="17" ry="13" fill="#8a6244"/>
  <path d="M30 22 C40 22 44 30 38 35 C32 39 24 37 22 32 C26 30 28 26 30 22 Z" fill="#ff7a3d"/>
  <circle cx="40" cy="16" r="9" fill="#8a6244"/>
  <path d="M40 18 C46 18 48 24 44 26 C40 27 37 24 38 20 Z" fill="#ff7a3d"/>
  <path d="M48 15 L55 17 L48 19 Z" fill="#f2b632"/>
  <circle cx="43" cy="14" r="2" fill="#1b1b2f"/>
  <circle cx="43.6" cy="13.4" r="0.6" fill="#fff"/>
  <g class="winter-vogel__vleugel">
    <path d="M14 20 C20 4 34 2 36 18 C30 22 20 24 14 20 Z" fill="#6b4a32"/>
  </g>
</svg>`;

// Pimpelmees van opzij (kijkt naar rechts): blauw petje, witte wangen met een zwart
// oogstreepje, gele buik en blauwgroene vleugel.
const MEES = `
<svg viewBox="0 0 60 44" aria-hidden="true">
  <path d="M8 22 L0 15 L2 27 Z" fill="#3a78c9"/>
  <ellipse cx="26" cy="24" rx="17" ry="13" fill="#7fa86a"/>
  <path d="M28 20 C40 20 45 30 38 36 C31 40 22 37 21 31 C25 29 27 25 28 20 Z" fill="#ffd93b"/>
  <path d="M33 27 V35" stroke="#3b3b4f" stroke-width="1.8" stroke-linecap="round" opacity="0.6"/>
  <circle cx="40" cy="16" r="9" fill="#ffffff"/>
  <path d="M31 13 C33 5 47 4 49 13 C44 10 36 10 31 13 Z" fill="#3a8ee0"/>
  <path d="M33 16 L48 15" stroke="#1b2a4a" stroke-width="2" stroke-linecap="round"/>
  <path d="M33 22 C38 25 44 24 48 20" stroke="#1b2a4a" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  <path d="M48 15 L54 17 L48 19 Z" fill="#3b3b4f"/>
  <circle cx="43" cy="15.5" r="1.8" fill="#1b1b2f"/>
  <g class="winter-vogel__vleugel">
    <path d="M14 20 C20 4 34 2 36 18 C30 22 20 24 14 20 Z" fill="#4f9bd6"/>
    <path d="M18 17 C24 10 30 9 33 15" stroke="#ffffff" stroke-width="1.5" fill="none" opacity="0.8"/>
  </g>
</svg>`;
const VOGELSOORTEN = [VOGEL, MEES];

// Het weer: [stand, duur in ms]. Helder, lichte sneeuw, helder, sneeuwstorm, en opnieuw.
type Weer = 'helder' | 'licht' | 'storm';
const WEERCYCLUS: [Weer, number][] = [
  ['helder', 20000],
  ['licht', 15000],
  ['helder', 20000],
  ['storm', 15000],
];

const RIT_MS = 9000;

export function maakWinterDecor(): Decor {
  const root = el('div', 'decor decor-winter');
  const nacht = el('div', 'winter-nacht', root);
  const noorderlicht = el('div', 'winter-noorderlicht', root);
  for (let i = 0; i < 4; i++) el('div', 'winter-noorderlicht__band', noorderlicht);
  plaatje('assets/achtergrond/wolk.svg', 'drijf-wolk drijf-wolk--1 winter-wolk', root);
  plaatje('assets/achtergrond/wolk.svg', 'drijf-wolk drijf-wolk--2 winter-wolk', root);

  // Bomen vóór de heuvels in de DOM: de voorste heuvels vallen over hun voet.
  const bomen = [1, 2, 3, 4, 5].map((n) => {
    const b = el('div', `winter-den winter-den--${n}`, root);
    svgUitTekst(DEN, 'winter-den__svg', b);
    return b;
  });
  const heuvels = svgUitTekst(HEUVELS, 'winter-heuvels', root);
  const [, achter, sleeHeuvel] = [...heuvels.querySelectorAll('path')];
  const sleebaan = el('div', 'winter-sleebaan', root);
  svgUitTekst(VOORHEUVEL, 'winter-heuvels', root);

  svgUitTekst(IJS, 'winter-ijs', root);
  const pop = el('div', 'winter-sneeuwpop', root);
  const popSvg = svgUitTekst(SNEEUWPOP, 'winter-sneeuwpop__svg', pop);
  const hoed = popSvg.querySelector('.winter-sneeuwpop__hoed') as SVGGElement;
  const ogen = popSvg.querySelector('.winter-sneeuwpop__ogen') as SVGGElement;

  // Lucht die donkerder wordt bij sneeuw, en de vogeltjes (achter de sneeuw).
  el('div', 'winter-donker', root);
  const vogels = el('div', 'winter-vogels', root);

  // Sneeuwval: losse witte vlokjes, alleen CSS. De lichte sneeuw valt bij 'licht';
  // bij de storm alleen een laag dichte, snelle, schuine sneeuw.
  const sneeuw = el('div', 'winter-sneeuw', root);
  const storm = el('div', 'winter-sneeuw winter-sneeuw--storm', root);
  el('div', 'winter-stormwaas', storm);
  for (let i = 0; i < 320; i++) {
    const v = el('div', 'winter-stormvlok', storm);
    v.style.left = `${Math.random() * 140 - 5}%`;
    const maat = 3 + Math.random() * 6;
    v.style.width = `${maat}px`;
    v.style.height = `${maat * 2.2}px`;
    v.style.opacity = `${0.6 + Math.random() * 0.4}`;
    const duur = 1 + Math.random() * 1.2;
    v.style.animationDuration = `${duur}s`;
    v.style.animationDelay = `${-Math.random() * duur}s`;
  }
  for (let i = 0; i < 46; i++) {
    const v = el('div', 'winter-vlok', sneeuw);
    v.style.left = `${Math.random() * 100}%`;
    const maat = 3 + Math.random() * 6;
    v.style.width = v.style.height = `${maat}px`;
    v.style.opacity = `${0.55 + Math.random() * 0.45}`;
    const duur = 9 + Math.random() * 10;
    v.style.animationDuration = `${duur}s, ${3 + Math.random() * 3}s`;
    v.style.animationDelay = `${-Math.random() * duur}s, ${-Math.random() * 3}s`;
  }

  // De bovenrand van de sleeheuvel, als hoogte (in viewBox-eenheden) per x van 0 tot 1000.
  let rand: number[] = [];
  const meetRand = () => {
    const lengte = sleeHeuvel.getTotalLength();
    const punten: { x: number; y: number }[] = [];
    for (let l = 0; l <= lengte; l += 3) {
      const p = sleeHeuvel.getPointAtLength(l);
      if (punten.length && p.x < punten[punten.length - 1].x) break;
      punten.push({ x: p.x, y: p.y });
      if (p.x >= 1000) break;
    }
    rand = [];
    let j = 0;
    for (let x = 0; x <= 1000; x += 5) {
      while (j < punten.length - 2 && punten[j + 1].x < x) j++;
      const a = punten[j];
      const b = punten[Math.min(j + 1, punten.length - 1)];
      const f = b.x === a.x ? 0 : Math.min(1, Math.max(0, (x - a.x) / (b.x - a.x)));
      rand.push(a.y + (b.y - a.y) * f);
    }
  };
  const hoogteOp = (x: number): number => {
    if (!rand.length) return 200;
    const i = Math.min(rand.length - 1, Math.max(0, x / 5));
    const i0 = Math.floor(i);
    const i1 = Math.min(rand.length - 1, i0 + 1);
    return rand[i0] + (rand[i1] - rand[i0]) * (i - i0);
  };

  // ---- Vogeltjes ----
  // Een vogel vliegt over: van links naar rechts (of gespiegeld), met een golvende baan.
  const vliegOver = (snel: boolean, naarBoom?: HTMLElement) => {
    const r = root.getBoundingClientRect();
    const v = el('div', 'winter-vogel', vogels);
    svgUitTekst(VOGELSOORTEN[Math.floor(Math.random() * VOGELSOORTEN.length)], 'winter-vogel__svg', v);
    const naarRechts = naarBoom ? false : Math.random() < 0.5;
    if (!naarRechts) v.classList.add('gespiegeld');
    // De helft van de keren laag, net boven de heuvels; anders hoog in de lucht.
    const y0 = r.height * (Math.random() < 0.5 ? 0.5 + Math.random() * 0.1 : 0.12 + Math.random() * 0.25);
    const breedte = r.width;
    let eindX = naarRechts ? breedte + 60 : -80;
    let eindY = y0 + (Math.random() - 0.5) * 60;
    if (naarBoom) {
      // Snel de den in om te schuilen.
      const b = naarBoom.getBoundingClientRect();
      eindX = b.left - r.left + b.width * (0.3 + Math.random() * 0.4);
      eindY = b.top - r.top + b.height * (0.35 + Math.random() * 0.3);
    }
    const startX = naarBoom ? breedte + 40 : naarRechts ? -80 : breedte + 60;
    const duur = snel ? 2600 + Math.random() * 900 : 11000 + Math.random() * 5000;
    const golf = (f: number) => Math.sin(f * Math.PI * 4) * (snel ? 6 : 14);
    const frames: Keyframe[] = [];
    for (let i = 0; i <= 10; i++) {
      const f = i / 10;
      const x = startX + (eindX - startX) * f;
      const y = y0 + (eindY - y0) * f + golf(f);
      frames.push({ transform: `translate(${x}px, ${y}px)${naarBoom && f === 1 ? ' scale(0.3)' : ''}`, opacity: naarBoom && f === 1 ? 0 : 1 });
    }
    v.style.setProperty('--flap', snel ? '0.12s' : '0.28s');
    const anim = v.animate(frames, { duration: duur, easing: snel ? 'ease-in' : 'linear', fill: 'forwards' });
    anim.onfinish = () => v.remove();
    return anim;
  };
  // Vliegende vogels schieten bij de storm snel de dichtstbijzijnde den in.
  const vluchtNaarBomen = () => {
    for (const v of [...vogels.querySelectorAll<HTMLElement>('.winter-vogel')]) {
      const r = root.getBoundingClientRect();
      const b = v.getBoundingClientRect();
      const boom = bomen
        .filter((x) => x.offsetParent)
        .sort((p, q) => Math.abs(p.getBoundingClientRect().left - b.left) - Math.abs(q.getBoundingClientRect().left - b.left))[0];
      if (!boom) continue;
      const doel = boom.getBoundingClientRect();
      v.getAnimations().forEach((a) => a.cancel());
      v.style.setProperty('--flap', '0.12s');
      const tx = doel.left - r.left + doel.width * 0.5;
      const ty = doel.top - r.top + doel.height * 0.5;
      const anim = v.animate(
        [{ transform: `translate(${b.left - r.left}px, ${b.top - r.top}px)`, opacity: 1 }, { transform: `translate(${tx}px, ${ty}px) scale(0.3)`, opacity: 0 }],
        { duration: 1600, easing: 'ease-in', fill: 'forwards' },
      );
      anim.onfinish = () => v.remove();
    }
  };

  let weer: Weer = 'helder';
  let weerStap = 0;
  let weerTimer: number | undefined;
  let vogelTimer: number | undefined;
  const zetWeer = (w: Weer) => {
    weer = w;
    root.classList.toggle('weer-licht', w === 'licht');
    root.classList.toggle('weer-storm', w === 'storm');
    if (w === 'storm') {
      vluchtNaarBomen();
      // Nog een vogeltje of twee dat snel komt schuilen.
      const zichtbaar = bomen.filter((x) => x.offsetParent);
      for (let i = 0; i < 2; i++) later(() => zichtbaar.length && vliegOver(true, zichtbaar[Math.floor(Math.random() * zichtbaar.length)]), 600 + i * 700);
    }
  };
  function volgendWeer(): void {
    window.clearTimeout(weerTimer);
    if (!levend || stil) return;
    const [w, duur] = WEERCYCLUS[weerStap % WEERCYCLUS.length];
    zetWeer(w);
    weerStap++;
    weerTimer = window.setTimeout(volgendWeer, duur);
  }
  // Vogeltjes over de lucht (meestal één, soms twee), niet tijdens de storm.
  function planVogels(eerste = false): void {
    window.clearTimeout(vogelTimer);
    if (!levend || stil) return;
    vogelTimer = window.setTimeout(() => {
      if (weer !== 'storm') {
        const n = Math.random() < 0.75 ? 1 : 2;
        for (let i = 0; i < n; i++) later(() => weer !== 'storm' && vliegOver(false), i * (300 + Math.random() * 500));
      }
      planVogels();
    }, eerste ? 2500 + Math.random() * 3000 : 9000 + Math.random() * 12000);
  }

  const plaats = () => {
    zetOpPad(bomen[0], achter, 10);
    zetOpPad(bomen[1], achter, 10);
    zetOpPad(bomen[2], achter, 10);
    zetOpPad(bomen[3], achter, 10);
    zetOpPad(bomen[4], achter, 10);
    meetRand();
  };

  const stil = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let levend = true;
  let bezig = false;
  let timer: number | undefined;
  let knipTimer: number | undefined;
  let raf = 0;
  const losseTimers = new Set<number>();
  const later = (fn: () => void, ms: number) => {
    const t = window.setTimeout(() => {
      losseTimers.delete(t);
      if (levend) fn();
    }, ms);
    losseTimers.add(t);
  };

  // Knipperen, af en toe (soms twee keer snel na elkaar).
  function knipper(): void {
    window.clearTimeout(knipTimer);
    if (!levend || stil) return;
    knipTimer = window.setTimeout(() => {
      kortAan(ogen, 'knipper', 240);
      if (Math.random() < 0.3) later(() => kortAan(ogen, 'knipper', 240), 380);
      knipper();
    }, 2500 + Math.random() * 4500);
  }
  knipper();

  // Een slee glijdt van rechtsboven de heuvel af naar links (de Fluent-slee kijkt naar links).
  function glij(): void {
    if (!rand.length) meetRand();
    const rit = el('div', 'winter-slee', sleebaan);
    const kantel = el('div', 'winter-slee__kantel', rit);
    plaatje('assets/achtergrond/winter-slee.svg', 'winter-slee__slee', kantel);
    plaatje('assets/achtergrond/winter-pinguin.svg', 'winter-slee__rijder', kantel);
    const start = performance.now();
    let hoek = 0;
    let laatsteSpoor = 0;
    const stap = (nu: number) => {
      if (!levend) return;
      const vak = heuvels.getBoundingClientRect();
      const rootVak = root.getBoundingClientRect();
      const breedte = rit.offsetWidth;
      const marge = ((breedte / Math.max(1, vak.width)) * 1000) * 0.7 + 10;
      const u = Math.min(1, (nu - start) / RIT_MS);
      // Rustig vertrekken, dan steeds harder.
      const voortgang = 0.45 * u + 0.55 * u * u;
      const x = 1000 + marge - (1000 + 2 * marge) * voortgang;
      const xb = Math.min(1000, Math.max(0, x));
      const y = hoogteOp(xb);
      const schermX = vak.left - rootVak.left + (x / 1000) * vak.width;
      const schermY = vak.top - rootVak.top + (y / 300) * vak.height;
      const dx = 10;
      const dy = ((hoogteOp(Math.min(1000, xb + dx)) - hoogteOp(Math.max(0, xb - dx))) / 300) * vak.height;
      const doel = (Math.atan2(dy, ((2 * dx) / 1000) * vak.width) * 180) / Math.PI;
      hoek += (doel - hoek) * 0.15;
      rit.style.transform = `translate(${schermX - breedte / 2}px, ${schermY - rit.offsetHeight + breedte * 0.06}px) rotate(${hoek.toFixed(2)}deg)`;
      // Een stuifspoortje achter de slee.
      if (nu - laatsteSpoor > 110 && x < 1000 && x > 0) {
        laatsteSpoor = nu;
        const s = el('div', 'winter-stuif', sleebaan);
        s.style.left = `${schermX + breedte * 0.4}px`;
        s.style.top = `${schermY - 6}px`;
        later(() => s.remove(), 900);
      }
      if (u < 1) raf = requestAnimationFrame(stap);
      else rit.remove();
    };
    raf = requestAnimationFrame(stap);
  }

  function plan(): void {
    window.clearTimeout(timer);
    if (!levend || stil) return;
    timer = window.setTimeout(() => {
      if (bezig) return plan();
      bezig = true;
      glij();
      later(() => {
        bezig = false;
        plan();
      }, RIT_MS + 3000);
    }, 3000 + Math.random() * 9000);
  }
  plan();
  volgendWeer();
  planVogels(true);
  if (stil) root.classList.add('weer-licht');

  // Een wolkje sneeuw bij de hoed.
  const pluf = (aantal: number, hoogte: string) => {
    for (let i = 0; i < aantal; i++) {
      const p = el('div', 'winter-pluf', pop);
      p.style.top = hoogte;
      const hoek = (Math.PI * 2 * i) / aantal + Math.random() * 0.5;
      const afstand = 18 + Math.random() * 22;
      p.style.setProperty('--dx', `${Math.cos(hoek) * afstand}px`);
      p.style.setProperty('--dy', `${Math.sin(hoek) * afstand * 0.7 - 6}px`);
      const maat = 6 + Math.random() * 8;
      p.style.width = p.style.height = `${maat}px`;
      window.setTimeout(() => p.remove(), 900);
    }
  };

  const juich = () => {
    kortAan(hoed, 'springt', 1400);
    kortAan(pop, 'juicht', 1400);
    pluf(9, '10%');
    later(() => pluf(6, '6%'), 1080);
  };

  // Einde van een sessie: noorderlicht in een even donkerder lucht, met een regen van
  // sneeuwvlokjes en sterretjes.
  const feest = () => {
    juich();
    if (stil) return;
    bezig = true;
    window.clearTimeout(timer);
    kortAan(nacht, 'aan', 8000);
    kortAan(noorderlicht, 'aan', 8000);
    for (let i = 0; i < 34; i++) {
      const ster = i % 2 === 0;
      const d = ster ? el('div', 'winter-feestster', root) : plaatje('assets/achtergrond/winter-sneeuwvlok.svg', 'winter-feestvlok', root);
      if (ster) {
        d.textContent = ['✦', '★', '✧'][i % 3];
        d.style.color = ['#fff7c2', '#ffd23f', '#ffffff', '#c9b5ff'][i % 4];
      }
      d.style.left = `${Math.random() * 98}%`;
      d.style.setProperty('--zwaai', `${(Math.random() - 0.5) * 80}px`);
      d.style.animationDuration = `${3.2 + Math.random() * 2.4}s`;
      d.style.animationDelay = `${Math.random() * 2.2}s`;
      later(() => d.remove(), 8000);
    }
    later(() => {
      bezig = false;
      plan();
    }, 10000);
  };

  const vernietig = () => {
    levend = false;
    window.clearTimeout(timer);
    window.clearTimeout(knipTimer);
    window.clearTimeout(weerTimer);
    window.clearTimeout(vogelTimer);
    cancelAnimationFrame(raf);
    for (const t of losseTimers) window.clearTimeout(t);
    losseTimers.clear();
  };
  return { element: root, juich, feest, plaats, vernietig };
}
