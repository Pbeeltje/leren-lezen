import type { Decor } from './achtergrond.ts';
import { el, kortAan, plaatje, svgUitTekst, zetOpPad } from './hulp.ts';

// Boerderij: glooiende weilanden met een molen waarvan de wieken draaien en een rode schuur,
// een hek vooraan, een koe en een varken achter het hek, een haan met kuikentjes en een
// schaap. Af en toe rijdt er een tractor over de heuvel. Bij een goed antwoord springt de koe
// op met "boe!"; aan het eind van een sessie springen alle dieren na elkaar. Dieren en
// tractor zijn Fluent Emoji, molen, schuur en hek zijn zelf getekend.

const HEUVELS = `
<svg viewBox="0 0 1000 300" preserveAspectRatio="none">
  <path d="M0 140 C180 80 340 90 500 130 C660 170 820 90 1000 110 L1000 300 L0 300 Z" fill="#9bd46a"/>
  <path d="M0 200 C220 160 420 170 600 196 C760 218 880 180 1000 186 L1000 300 L0 300 Z" fill="#79c255"/>
  <path d="M0 250 C250 232 500 244 750 254 C860 258 940 250 1000 246 L1000 300 L0 300 Z" fill="#62b042"/>
</svg>`;

// Hollandse molen; de wieken zijn een eigen groep die rond de as draait.
const MOLEN = `
<svg viewBox="0 0 200 260" aria-hidden="true">
  <path d="M74 260 L84 110 L116 110 L126 260 Z" fill="#8a6a4f" stroke="#4f3a29" stroke-width="3" stroke-linejoin="round"/>
  <path d="M78 200 H122 M80 160 H120" stroke="#6f533c" stroke-width="3"/>
  <path d="M92 260 V230 C92 222 108 222 108 230 V260 Z" fill="#4f3a29"/>
  <rect x="94" y="140" width="12" height="14" rx="2" fill="#ffe9a8" stroke="#4f3a29" stroke-width="2"/>
  <path d="M78 114 C80 92 120 92 122 114 Z" fill="#5d7a8c" stroke="#33495a" stroke-width="3" stroke-linejoin="round"/>
  <g class="molen__wieken">
    <g fill="#f4ecd8" stroke="#6f533c" stroke-width="2.5" stroke-linejoin="round">
      <path d="M100 98 L104 16 L122 18 L106 98 Z"/>
      <path d="M100 98 L182 102 L180 120 L100 104 Z"/>
      <path d="M100 98 L96 180 L78 178 L94 98 Z"/>
      <path d="M100 98 L18 94 L20 76 L100 92 Z"/>
    </g>
    <g stroke="#6f533c" stroke-width="1.5">
      <path d="M106 40 L120 41 M105 62 L117 63"/>
      <path d="M156 106 L155 118 M134 104 L133 114"/>
      <path d="M94 156 L80 155 M95 134 L83 133"/>
      <path d="M44 90 L45 78 M66 92 L67 82"/>
    </g>
    <circle cx="100" cy="98" r="8" fill="#4f3a29"/>
  </g>
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

const TRACTOR_MS = 18000;

export function maakBoerderijDecor(): Decor {
  const root = el('div', 'decor decor-boerderij');
  plaatje('assets/achtergrond/zon.svg', 'boerderij-zon', root);
  plaatje('assets/achtergrond/wolk.svg', 'drijf-wolk drijf-wolk--1', root);
  plaatje('assets/achtergrond/wolk.svg', 'drijf-wolk drijf-wolk--2', root);

  // Vóór de heuvels in de DOM: de achterste heuvel valt over hun voet.
  // In een div, want zetOpPad heeft een offsetParent nodig (een svg heeft die niet).
  const molen = el('div', 'boerderij-molen', root);
  svgUitTekst(MOLEN, 'boerderij-molen__svg', molen);
  const schuur = el('div', 'boerderij-schuur', root);
  svgUitTekst(SCHUUR, 'boerderij-schuur__svg', schuur);
  const heuvels = svgUitTekst(HEUVELS, 'boerderij-heuvels', root);
  const [achter, midden] = [...heuvels.querySelectorAll('path')];
  const tractorBaan = el('div', 'boerderij-tractorbaan', root);

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

  const plaats = () => {
    zetOpPad(molen, achter, 4);
    zetOpPad(schuur, achter, 8);
    zetOpPad(schaap, midden, 8);
  };

  const stil = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let levend = true;
  let timer: number | undefined;
  // De tractor rijdt over de middelste heuvel, achter het hek langs.
  function plan(): void {
    window.clearTimeout(timer);
    if (!levend || stil) return;
    timer = window.setTimeout(() => {
      const t = el('div', 'boer-tractor', tractorBaan);
      const schok = el('div', 'boer-tractor__schok', t);
      plaatje('assets/achtergrond/tractor.svg', 'boer-tractor__lijf', schok);
      window.setTimeout(() => t.remove(), TRACTOR_MS + 200);
      window.setTimeout(plan, TRACTOR_MS);
    }, 8000 + Math.random() * 14000);
  }
  plan();

  const roep = (dier: HTMLElement, tekst: string) => {
    const wolkje = el('div', 'boer-roep', dier);
    wolkje.textContent = tekst;
    window.setTimeout(() => wolkje.remove(), 1400);
  };

  const juich = () => {
    kortAan(koe, 'juicht', 1200);
    roep(koe, 'boe!');
  };

  // Einde van een sessie: alle dieren springen na elkaar, met sterretjes.
  const feest = () => {
    const rij = [koe, haan, ...kuikens, schaap, varken];
    rij.forEach((dier, i) => {
      window.setTimeout(() => {
        kortAan(dier, 'juicht', 1200);
        const ster = el('div', 'boer-ster', dier);
        ster.textContent = ['★', '♥', '✦'][i % 3];
        window.setTimeout(() => ster.remove(), 1200);
      }, i * 280);
    });
    roep(koe, 'boe!');
  };

  const vernietig = () => {
    levend = false;
    window.clearTimeout(timer);
  };
  return { element: root, juich, feest, plaats, vernietig };
}
