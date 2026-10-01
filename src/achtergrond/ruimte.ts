import type { Decor } from './achtergrond.ts';
import { el, svgUitTekst } from './hulp.ts';

// Losse laag bij de ruimte-achtergrond (de sterren, nevels en planeet tekent three.js):
// vallende sterretjes op willekeurige plekken en af en toe een raket die langzaam schuin
// voorbijvliegt. Eén klok voor allebei: er is altijd maar één tegelijk, met minstens
// 5 seconden rust ertussen (wens van de eigenaar), ook als een goed antwoord er een vraagt.

const RAKET = `
<svg viewBox="0 0 60 120" aria-hidden="true">
  <g class="raket__vlam">
    <path d="M22 92 C22 106 30 118 30 118 C30 118 38 106 38 92 Z" fill="#ffb347"/>
    <path d="M26 92 C26 102 30 110 30 110 C30 110 34 102 34 92 Z" fill="#fff3a0"/>
  </g>
  <path d="M14 70 L4 92 L18 88 Z M46 70 L56 92 L42 88 Z" fill="#e53935"/>
  <path d="M30 4 C44 18 48 40 46 64 L44 90 L16 90 L14 64 C12 40 16 18 30 4 Z" fill="#f4f6fb"/>
  <path d="M30 4 C38 12 42 20 44 28 L16 28 C18 20 22 12 30 4 Z" fill="#e53935"/>
  <circle cx="30" cy="48" r="9" fill="#5fb3ff" stroke="#9aa6bd" stroke-width="3"/>
  <circle cx="27" cy="45" r="3" fill="#d8efff"/>
  <path d="M26 90 L26 98 L34 98 L34 90 Z" fill="#9aa6bd"/>
  <path d="M30 70 V90" stroke="#d5dbe8" stroke-width="2"/>
</svg>`;

const RUST_MS = 5000;
const STER_MS = 1400;
const RAKET_MS = 16000;

export function maakRuimteDecor(): Decor {
  const root = el('div', 'decor decor-ruimte');
  let bezig = false;
  let vrijVanaf = performance.now() + 4000; // even rust na het openen
  let timer: number | undefined;
  let levend = true;

  const klaar = (ms: number) => {
    window.setTimeout(() => {
      bezig = false;
      vrijVanaf = performance.now() + RUST_MS;
      plan();
    }, ms);
  };

  function vallendeSter(): void {
    bezig = true;
    const v = el('div', 'valster', root);
    v.style.left = `${8 + Math.random() * 80}%`;
    v.style.top = `${6 + Math.random() * 62}%`;
    window.setTimeout(() => v.remove(), STER_MS);
    klaar(STER_MS);
  }

  function raket(): void {
    bezig = true;
    // Van linksonder naar rechtsboven of andersom, schuin en langzaam.
    const naarRechts = Math.random() < 0.5;
    const r = svgUitTekst(RAKET, 'raket', root);
    const vanY = 70 + Math.random() * 20;
    const naarY = 5 + Math.random() * 20;
    r.style.setProperty('--van-x', naarRechts ? '-12vw' : '108vw');
    r.style.setProperty('--naar-x', naarRechts ? '108vw' : '-12vw');
    r.style.setProperty('--van-y', `${vanY}vh`);
    r.style.setProperty('--naar-y', `${naarY}vh`);
    const hoek = (Math.atan2(((naarY - vanY) * window.innerHeight) / 100, (naarRechts ? 1.2 : -1.2) * window.innerWidth) * 180) / Math.PI + 90;
    r.style.setProperty('--hoek', `${hoek}deg`);
    window.setTimeout(() => r.remove(), RAKET_MS);
    klaar(RAKET_MS);
  }

  // Volgende gebeurtenis: meestal een vallende ster, soms de raket.
  function plan(): void {
    window.clearTimeout(timer);
    if (!levend) return;
    const wacht = Math.max(0, vrijVanaf - performance.now()) + 3000 + Math.random() * 7000;
    timer = window.setTimeout(() => {
      if (bezig) return;
      if (Math.random() < 0.22) raket();
      else vallendeSter();
    }, wacht);
  }
  plan();

  // Een goed antwoord vraagt om een vallende ster, maar alleen als de lucht vrij is.
  const juich = () => {
    if (bezig || performance.now() < vrijVanaf) return;
    window.clearTimeout(timer);
    vallendeSter();
  };
  // Einde van een sessie: drie sterretjes na elkaar (nooit tegelijk).
  const feest = () => {
    window.clearTimeout(timer);
    let n = 0;
    const volgende = () => {
      if (n++ >= 3) return;
      const v = el('div', 'valster', root);
      v.style.left = `${15 + Math.random() * 70}%`;
      v.style.top = `${6 + Math.random() * 50}%`;
      window.setTimeout(() => v.remove(), STER_MS);
      window.setTimeout(volgende, STER_MS + 100);
    };
    if (!bezig) {
      bezig = true;
      volgende();
      klaar(3 * (STER_MS + 100));
    }
  };
  const vernietig = () => {
    levend = false;
    window.clearTimeout(timer);
  };
  return { element: root, juich, feest, vernietig };
}
