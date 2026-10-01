import type { Decor } from './achtergrond.ts';
import { el, kortAan, plaatje, svgUitTekst, zetOpPad } from './hulp.ts';

// Winter: zachte sneeuwval boven besneeuwde heuvels met sneeuwdennen, en een zelf getekende
// sneeuwpop met een sjaal die af en toe met zijn ogen knippert en rustig zwaait. Af en toe
// glijdt er een pinguïn op een slee de heuvel af. Bij een goed antwoord springt
// de hoge hoed van de sneeuwpop op, met een wolkje sneeuw; aan het eind van een sessie komt
// er noorderlicht in de lucht en dwarrelen er sneeuwvlokjes en sterretjes naar beneden.
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

  const pop = el('div', 'winter-sneeuwpop', root);
  const popSvg = svgUitTekst(SNEEUWPOP, 'winter-sneeuwpop__svg', pop);
  const hoed = popSvg.querySelector('.winter-sneeuwpop__hoed') as SVGGElement;
  const ogen = popSvg.querySelector('.winter-sneeuwpop__ogen') as SVGGElement;

  // Sneeuwval: losse witte vlokjes, alleen CSS.
  const sneeuw = el('div', 'winter-sneeuw', root);
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
    cancelAnimationFrame(raf);
    for (const t of losseTimers) window.clearTimeout(t);
    losseTimers.clear();
  };
  return { element: root, juich, feest, plaats, vernietig };
}
