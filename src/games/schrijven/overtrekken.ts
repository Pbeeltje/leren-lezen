import type { Haal, Punt } from '../../content/schrijven/letters.ts';
import { LIJN_BOVEN, LIJN_ONDER, LIJN_X } from '../../content/schrijven/letters.ts';

// Overtrekken met de vinger (of muis). Het kind volgt de grijze baan vanaf de groene stip;
// de gekleurde inkt groeit mee langs de baan, met een sterretje op de punt. Een haal telt
// pas als hij in de goede richting en volgorde is gemaakt: de voortgang schuift alleen
// vooruit naar baanpunten vlak voor het huidige punt. Vinger optillen is niet erg: je gaat
// verder waar je was. Van de baan af raken ook niet: je pakt hem gewoon weer op.

const NS = 'http://www.w3.org/2000/svg';
const VOORUIT_KIJKEN = 10; // baanpunten (~2 eenheden per punt)

export interface OvertrekOpties {
  halen: Haal[];
  viewBox: [number, number, number, number];
  tolerantie: number; // in figuur-eenheden
  baanDikte: number;
  schrijflijnen?: boolean; // de drie lijnen van een schrijfschrift (letters en woorden)
  startPlaatje?: string;
  doelPlaatje?: string;
  doelPunt?: Punt;
  plaatjeGrootte?: number;
}

function svgEl<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>): SVGElementTagNameMap[K] {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
}

const pad = (punten: Punt[]): string => punten.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
const afstand = (a: Punt, b: Punt): number => Math.hypot(a[0] - b[0], a[1] - b[1]);

export function maakOvertrekker(opties: OvertrekOpties, klaar: () => void): { element: HTMLElement; opruimen: () => void } {
  const { halen, tolerantie, baanDikte } = opties;
  const wrap = document.createElement('div');
  wrap.className = 'overtrek';

  const svg = svgEl('svg', { viewBox: opties.viewBox.join(' '), class: 'overtrek__vlak' });
  wrap.appendChild(svg);
  const [vx, , vb] = opties.viewBox;

  if (opties.schrijflijnen) {
    for (const [y, stippel] of [[LIJN_BOVEN, true], [LIJN_X, true], [LIJN_ONDER, false]] as const) {
      svg.appendChild(svgEl('line', { x1: vx, x2: vx + vb, y1: y, y2: y, class: stippel ? 'overtrek__hulplijn' : 'overtrek__schrijflijn' }));
    }
  }

  // Baan: brede lichte strook met een stippellijn in het midden.
  for (const h of halen) {
    if (h.length === 1) {
      svg.appendChild(svgEl('circle', { cx: h[0][0], cy: h[0][1], r: baanDikte * 0.55, class: 'overtrek__baan-stip' }));
      continue;
    }
    svg.appendChild(svgEl('path', { d: pad(h), class: 'overtrek__baan', 'stroke-width': baanDikte }));
    svg.appendChild(svgEl('path', { d: pad(h), class: 'overtrek__middenlijn', 'stroke-width': baanDikte * 0.12 }));
  }

  const plaatje = (src: string, [x, y]: Punt): SVGImageElement => {
    const g = opties.plaatjeGrootte ?? 40;
    return svgEl('image', { href: src, x: x - g / 2, y: y - g / 2, width: g, height: g, class: 'overtrek__plaatje' });
  };
  if (opties.doelPlaatje) {
    const laatste = halen[halen.length - 1];
    svg.appendChild(plaatje(opties.doelPlaatje, opties.doelPunt ?? laatste[laatste.length - 1]));
  }

  const inktLaag = svgEl('g', {});
  svg.appendChild(inktLaag);
  const startStip = svgEl('circle', { r: baanDikte * 0.6, class: 'overtrek__start' });
  const pijl = svgEl('path', { d: '', class: 'overtrek__pijl' });
  // Het startplaatje (de muis) loopt mee met de vinger; de groene stip ligt erbovenop.
  const startPlaatje = opties.startPlaatje ? plaatje(opties.startPlaatje, halen[0][0]) : null;
  if (startPlaatje) svg.appendChild(startPlaatje);
  svg.appendChild(startStip);
  svg.appendChild(pijl);
  const ster = svgEl('image', { href: 'assets/icons/ster.svg', width: baanDikte * 1.6, height: baanDikte * 1.6, class: 'overtrek__ster' });
  svg.appendChild(ster);

  let haalIndex = 0;
  let puntIndex = 0;
  let tekent = false;
  let afgelopen = false;
  let huidigeInkt: SVGPathElement | null = null;

  function zetPunt(el: SVGGraphicsElement, [x, y]: Punt, grootte: number): void {
    el.setAttribute('x', String(x - grootte / 2));
    el.setAttribute('y', String(y - grootte / 2));
  }

  function toonStart(): void {
    const h = halen[haalIndex];
    const p = h[puntIndex];
    startStip.setAttribute('cx', String(p[0]));
    startStip.setAttribute('cy', String(p[1]));
    startStip.classList.toggle('overtrek__start--verder', puntIndex > 0);
    // Pijltje een stukje verderop, in de schrijfrichting.
    const verder = h[Math.min(h.length - 1, puntIndex + 6)];
    const hoek = Math.atan2(verder[1] - p[1], verder[0] - p[0]);
    if (h.length > 1) {
      const d = baanDikte * 1.5;
      const [px, py] = [p[0] + Math.cos(hoek) * d, p[1] + Math.sin(hoek) * d];
      const s = baanDikte * 0.5;
      const punt = (a: number, r: number): string => `${(px + Math.cos(hoek + a) * r).toFixed(1)} ${(py + Math.sin(hoek + a) * r).toFixed(1)}`;
      pijl.setAttribute('d', `M${punt(0, s)} L${punt(2.5, s)} L${punt(-2.5, s)} Z`);
    } else {
      pijl.setAttribute('d', '');
    }
    zetPunt(ster, p, baanDikte * 1.6);
    ster.style.display = puntIndex > 0 ? '' : 'none'; // eerst de groene startstip laten zien
    if (startPlaatje) zetPunt(startPlaatje, p, opties.plaatjeGrootte ?? 40);
  }

  function nieuweInkt(): void {
    huidigeInkt = svgEl('path', { d: '', class: 'overtrek__inkt', 'stroke-width': baanDikte * 0.62 });
    inktLaag.appendChild(huidigeInkt);
  }

  function haalKlaar(): void {
    tekent = false;
    const h = halen[haalIndex];
    if (h.length > 1) huidigeInkt?.setAttribute('d', pad(h));
    haalIndex++;
    puntIndex = 0;
    if (haalIndex >= halen.length) {
      afgelopen = true;
      startStip.style.display = 'none';
      pijl.style.display = 'none';
      ster.style.display = 'none';
      wrap.classList.add('overtrek--klaar');
      timer = window.setTimeout(klaar, 450);
      return;
    }
    nieuweInkt();
    toonStart();
  }

  function naarFiguur(e: PointerEvent): Punt {
    const m = svg.getScreenCTM();
    if (!m) return [0, 0];
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return [p.x, p.y];
  }

  function omlaag(e: PointerEvent): void {
    if (afgelopen) return;
    e.preventDefault();
    const p = naarFiguur(e);
    const h = halen[haalIndex];
    if (h.length === 1) {
      if (afstand(p, h[0]) < tolerantie * 1.6) {
        huidigeInkt?.remove();
        inktLaag.appendChild(svgEl('circle', { cx: h[0][0], cy: h[0][1], r: baanDikte * 0.4, class: 'overtrek__inkt-stip' }));
        haalKlaar();
      }
      return;
    }
    if (afstand(p, h[puntIndex]) < tolerantie * 1.4) {
      tekent = true;
      svg.setPointerCapture(e.pointerId);
      beweeg(e);
    }
  }

  function beweeg(e: PointerEvent): void {
    if (!tekent || afgelopen) return;
    const p = naarFiguur(e);
    const h = halen[haalIndex];
    let beste = -1;
    for (let j = puntIndex + 1; j <= Math.min(h.length - 1, puntIndex + VOORUIT_KIJKEN); j++) {
      if (afstand(p, h[j]) < tolerantie) beste = j;
    }
    if (beste > puntIndex) {
      puntIndex = beste;
      huidigeInkt?.setAttribute('d', pad(h.slice(0, puntIndex + 1)));
      toonStart();
      if (puntIndex >= h.length - 2) haalKlaar();
    } else if (afstand(p, h[puntIndex]) > tolerantie * 3) {
      tekent = false; // van de baan af; bij de ster weer oppakken
    }
  }

  function omhoog(): void {
    tekent = false;
  }

  let timer: number | undefined;
  svg.addEventListener('pointerdown', omlaag);
  svg.addEventListener('pointermove', beweeg);
  svg.addEventListener('pointerup', omhoog);
  svg.addEventListener('pointercancel', omhoog);

  nieuweInkt();
  toonStart();

  return {
    element: wrap,
    opruimen: () => {
      window.clearTimeout(timer);
      wrap.remove();
    },
  };
}
