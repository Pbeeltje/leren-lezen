// Zijwaarts bladeren door een lange rij knoppen (figuren, achtergronden): de knoppen gaan
// per bladzijde in een raster, je veegt of tikt op de pijltjes, en stipjes eronder laten
// zien op welke bladzijde je bent. Past alles op één bladzijde, dan geen pijltjes/stipjes.

export function maakBladeraar(
  items: HTMLElement[],
  opties: { kolommen: number; rijen: number; klasse?: string },
): { element: HTMLElement; naarItem: (index: number) => void } {
  const perBlad = opties.kolommen * opties.rijen;
  const aantalBladen = Math.max(1, Math.ceil(items.length / perBlad));

  const element = document.createElement('div');
  element.className = `bladeraar ${opties.klasse ?? ''}`.trim();
  element.style.setProperty('--kolommen', String(opties.kolommen));

  const rij = document.createElement('div');
  rij.className = 'bladeraar__rij';
  element.appendChild(rij);
  for (let b = 0; b < aantalBladen; b++) {
    const blad = document.createElement('div');
    blad.className = 'bladeraar__blad';
    blad.append(...items.slice(b * perBlad, (b + 1) * perBlad));
    rij.appendChild(blad);
  }

  const huidigBlad = () => Math.round(rij.scrollLeft / Math.max(1, rij.clientWidth));
  const gaNaar = (b: number, zacht = true) =>
    rij.scrollTo({ left: Math.max(0, Math.min(aantalBladen - 1, b)) * rij.clientWidth, behavior: zacht ? 'smooth' : 'auto' });

  if (aantalBladen > 1) {
    element.classList.add('bladeraar--meer');
    const pijl = (richting: -1 | 1) => {
      const k = document.createElement('button');
      k.type = 'button';
      k.className = `bladeraar__pijl bladeraar__pijl--${richting < 0 ? 'links' : 'rechts'}`;
      k.setAttribute('aria-label', richting < 0 ? 'Vorige bladzijde' : 'Volgende bladzijde');
      k.textContent = richting < 0 ? '‹' : '›';
      k.addEventListener('click', () => gaNaar(huidigBlad() + richting));
      element.appendChild(k);
      return k;
    };
    const links = pijl(-1);
    const rechts = pijl(1);

    const stippen = document.createElement('div');
    stippen.className = 'bladeraar__stippen';
    const stipEls = Array.from({ length: aantalBladen }, (_, b) => {
      const s = document.createElement('button');
      s.type = 'button';
      s.className = 'bladeraar__stip';
      s.setAttribute('aria-label', `Bladzijde ${b + 1}`);
      s.addEventListener('click', () => gaNaar(b));
      stippen.appendChild(s);
      return s;
    });
    element.appendChild(stippen);

    const werkBij = () => {
      const b = huidigBlad();
      stipEls.forEach((s, i) => s.classList.toggle('bladeraar__stip--aan', i === b));
      links.disabled = b === 0;
      rechts.disabled = b === aantalBladen - 1;
    };
    rij.addEventListener('scroll', () => requestAnimationFrame(werkBij), { passive: true });
    requestAnimationFrame(werkBij);
  }

  return {
    element,
    // Bv. de bladzijde met het gekozen figuur meteen laten zien.
    naarItem: (index) => requestAnimationFrame(() => gaNaar(Math.floor(index / perBlad), false)),
  };
}
