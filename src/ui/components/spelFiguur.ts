import { TONEN, speelNoot } from '../../engine/muziek.ts';

// Effecten voor het eigen figuurtje in de spelletjes (vangspel, oversteken, tafeltennis,
// dieren voeren). CSS in components.css (.figuur-flits, .figuur-ring, .figuur-beker,
// .figuur-winnaar).

const TROFEE = 'assets/icons/trofee.svg';

// Begin (start, na een klap weer verder, nieuw level): het figuurtje flitst twee keer wit
// op en popt van klein naar groot, met een witte ring eromheen en een kort 'pling'. De
// eigen filter (kleur, schaduw) staat in --figuur-filter, zodat het na de witte flitsen
// weer gewoon gekleurd is. `ouder` krijgt de ring; die moet position: relative/absolute zijn.
export function flitsIn(figuur: HTMLElement, ouder?: HTMLElement): void {
  figuur.style.setProperty('--figuur-filter', figuur.style.filter || 'none');
  figuur.classList.remove('figuur-flits');
  // Meten vóór de flits: daarna begint het figuurtje klein en wordt de ring te klein.
  const r = figuur.getBoundingClientRect();
  figuur.classList.add('figuur-flits');
  figuur.addEventListener('animationend', function klaar(e) {
    if (e.animationName !== 'figuur-flits') return;
    figuur.classList.remove('figuur-flits');
    figuur.removeEventListener('animationend', klaar);
  });
  if (ouder) {
    const o = ouder.getBoundingClientRect();
    const ring = document.createElement('div');
    ring.className = 'figuur-ring';
    ring.style.left = `${r.left - o.left + r.width / 2}px`;
    ring.style.top = `${r.top - o.top + r.height / 2}px`;
    ring.style.width = ring.style.height = `${Math.max(r.width, r.height) * 1.3}px`;
    ouder.appendChild(ring);
    window.setTimeout(() => ring.remove(), 800);
  }
  speelNoot(TONEN[4]);
  speelNoot(TONEN[7], 0.09);
}

// Gewonnen, in het spel zelf: een bekertje gaat omhoog naast het figuurtje (rechtsboven,
// alsof het hem optilt). Het figuurtje staat dan stil; geeft het bekertje terug om op te
// ruimen bij een nieuwe start.
export function houdBekerOmhoog(figuur: HTMLElement, ouder: HTMLElement): HTMLImageElement {
  const r = figuur.getBoundingClientRect();
  const o = ouder.getBoundingClientRect();
  const maat = Math.max(36, r.width * 0.6);
  const beker = document.createElement('img');
  beker.className = 'figuur-beker';
  beker.src = TROFEE;
  beker.alt = '';
  beker.style.width = beker.style.height = `${maat}px`;
  beker.style.left = `${r.right - o.left - maat * 0.55}px`;
  beker.style.top = `${r.top - o.top - maat * 0.45}px`;
  ouder.appendChild(beker);
  [0, 2, 4, 7].forEach((k, i) => speelNoot(TONEN[k], i * 0.1));
  return beker;
}

// Gewonnen, in een venster: het figuur (als HTML) met een bekertje omhoog erbij.
export function figuurMetBeker(figuurHtml: string, klein = false): string {
  return `<span class="figuur-winnaar${klein ? ' figuur-winnaar--klein' : ''}">${figuurHtml}<img class="figuur-winnaar__beker" src="${TROFEE}" alt=""></span>`;
}
