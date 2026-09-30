export function el<K extends keyof HTMLElementTagNameMap>(tag: K, klasse: string, ouder?: HTMLElement): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  e.className = klasse;
  ouder?.appendChild(e);
  return e;
}

export function plaatje(src: string, klasse: string, ouder: HTMLElement): HTMLImageElement {
  const img = el('img', klasse, ouder);
  img.src = src;
  img.alt = '';
  img.draggable = false;
  return img;
}

/** Zet een klasse even aan (voor een CSS-animatie) en haalt hem daarna weer weg. */
export function kortAan(e: Element, klasse: string, ms: number): void {
  e.classList.remove(klasse);
  void (e as HTMLElement).offsetWidth; // herstart de animatie als hij al liep
  e.classList.add(klasse);
  window.setTimeout(() => e.classList.remove(klasse), ms);
}

/**
 * Zet een element met zijn onderkant precies op de bovenrand van een (uitgerekt) SVG-pad,
 * op de plek waar het element horizontaal staat. Nodig omdat de heuvels met het scherm
 * meerekken (preserveAspectRatio="none") en losse plaatjes dat niet doen: zonder dit
 * zweefden bomen en kasteel boven de heuvel op brede schermen.
 */
export function zetOpPad(e: HTMLElement, pad: SVGPathElement, zak = 6, overBreedte = false): void {
  const houder = e.offsetParent as HTMLElement | null;
  const matrix = pad.getScreenCTM();
  if (!houder || !matrix) return;
  const vak = e.getBoundingClientRect();
  const lengte = pad.getTotalLength();
  // De bovenrand is het eerste stuk van het pad (van links naar rechts), dus de eerste
  // punt die voorbij x ligt is de goede.
  const yOp = (xScherm: number): number => {
    const xSvg = (xScherm - matrix.e) / matrix.a;
    let y = 0;
    for (let l = 0; l <= lengte; l += 2) {
      const p = pad.getPointAtLength(l);
      y = p.y;
      if (p.x >= xSvg) break;
    }
    return y * matrix.d + matrix.f;
  };
  // Brede dingen (een kasteel op een helling): het laagste punt onder de hele breedte,
  // anders hangt één kant in de lucht.
  const xs = overBreedte ? [0.04, 0.5, 0.96].map((f) => vak.left + vak.width * f) : [vak.left + vak.width / 2];
  const yScherm = Math.max(...xs.map(yOp));
  const houderVak = houder.getBoundingClientRect();
  e.style.bottom = `${houderVak.bottom - yScherm - zak}px`;
}

export function svgUitTekst(markup: string, klasse: string, ouder: HTMLElement): SVGSVGElement {
  const houder = document.createElement('div');
  houder.innerHTML = markup.trim();
  const svg = houder.firstElementChild as SVGSVGElement;
  svg.setAttribute('class', klasse);
  ouder.appendChild(svg);
  return svg;
}
