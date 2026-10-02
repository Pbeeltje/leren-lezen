// Bladzijden voor een te lange lijst (hoofdstukken, luisterthema's). Wat niet past
// staat op een volgende bladzijde; pijltjes, stipjes en vegen wisselen. Past alles,
// dan geen navigatie. `startIndex` is het item dat in beeld moet (laatst geopende kern).

export function maakBladzijden(
  items: HTMLElement[],
  opties: { startIndex: number; soort: 'lijst' | 'tegels' },
): { element: HTMLElement; vernietig: () => void } {
  const soort = opties.soort;
  let focus = items.length === 0 ? 0 : Math.min(Math.max(opties.startIndex, 0), items.length - 1);
  let negeerScroll = 0;
  let bezig = false;
  let handtekening = '';
  let cache: { breedte: number; hoogtes: number[]; tegel?: { w: number; h: number; gap: number } } | null = null;

  const element = document.createElement('div');
  element.className = `kern-paginas kern-paginas--${soort}`;

  const meet = document.createElement('div');
  meet.className = soort === 'tegels' ? 'kern-paginas__meet tegel-grid' : 'kern-paginas__meet';
  meet.setAttribute('aria-hidden', 'true');
  element.appendChild(meet);

  const venster = document.createElement('div');
  venster.className = 'kern-paginas__venster';
  element.appendChild(venster);

  const nav = document.createElement('div');
  nav.className = 'kern-paginas__nav';
  nav.hidden = true;

  const maakPijl = (richting: -1 | 1): HTMLButtonElement => {
    const knop = document.createElement('button');
    knop.type = 'button';
    knop.className = `kern-paginas__pijl kern-paginas__pijl--${richting < 0 ? 'links' : 'rechts'}`;
    knop.setAttribute('aria-label', richting < 0 ? 'Vorige bladzijde' : 'Volgende bladzijde');
    knop.textContent = richting < 0 ? '‹' : '›';
    knop.addEventListener('click', () => gaNaar(huidigBlad() + richting, true, true));
    return knop;
  };
  const links = maakPijl(-1);
  const rechts = maakPijl(1);
  const stippen = document.createElement('div');
  stippen.className = 'kern-paginas__stippen';
  nav.append(links, stippen, rechts);
  element.appendChild(nav);

  let stipEls: HTMLButtonElement[] = [];
  let groepen: number[][] = [];

  const huidigBlad = (): number => Math.round(venster.scrollLeft / Math.max(1, venster.clientWidth));

  const paginaVan = (index: number, indeling: number[][]): number => {
    let n = 0;
    for (let p = 0; p < indeling.length; p++) {
      if (index < n + indeling[p].length) return p;
      n += indeling[p].length;
    }
    return Math.max(0, indeling.length - 1);
  };

  const werkBij = (blad = groepen.length <= 1 ? 0 : huidigBlad()): void => {
    stipEls.forEach((stip, i) => stip.classList.toggle('kern-paginas__stip--aan', i === blad));
    links.disabled = blad <= 0;
    rechts.disabled = blad >= groepen.length - 1;
  };

  const gaNaar = (blad: number, doorGebruiker: boolean, zacht = false): void => {
    const doel = Math.max(0, Math.min(groepen.length - 1, blad));
    const doelEl = venster.children[doel];
    if (!(doelEl instanceof HTMLElement)) return;
    if (doorGebruiker && groepen[doel]?.length) focus = groepen[doel][0];
    const links = venster.scrollLeft + doelEl.getBoundingClientRect().left - venster.getBoundingClientRect().left;
    negeerScroll++;
    venster.scrollTo({ left: links, behavior: zacht ? 'smooth' : 'auto' });
    werkBij();
    requestAnimationFrame(() => {
      negeerScroll = Math.max(0, negeerScroll - 1);
    });
  };

  const zetStippen = (aantal: number): void => {
    if (stipEls.length === aantal) return;
    stippen.replaceChildren();
    stipEls = Array.from({ length: aantal }, (_, blad) => {
      const stip = document.createElement('button');
      stip.type = 'button';
      stip.className = 'kern-paginas__stip';
      stip.setAttribute('aria-label', `Bladzijde ${blad + 1}`);
      stip.addEventListener('click', () => gaNaar(blad, true, false));
      stippen.appendChild(stip);
      return stip;
    });
  };

  const vrijeHoogte = (navHoogte: number): number => {
    const scherm = element.closest('.scherm');
    if (!(scherm instanceof HTMLElement)) return 320;
    const stijl = getComputedStyle(scherm);
    const titel = scherm.querySelector(':scope > .scherm-titel');
    const titelHoogte = titel instanceof HTMLElement ? titel.offsetHeight : 0;
    const gat = parseFloat(stijl.rowGap || stijl.gap) || 0;
    const pagerGat = navHoogte > 0 ? parseFloat(getComputedStyle(element).rowGap) || 0 : 0;
    const ruimte =
      scherm.clientHeight -
      (parseFloat(stijl.paddingTop) || 0) -
      (parseFloat(stijl.paddingBottom) || 0) -
      titelHoogte -
      (titelHoogte > 0 ? gat : 0) -
      navHoogte -
      pagerGat;
    return Math.max(1, ruimte);
  };

  // Ruimte in het blad voor de schaduw en de ring om de laatst geopende kern.
  // --blad-pad volgt de padding van .kern-paginas__blad (ook op een kort scherm).
  const bladPad = (): number => {
    const uitCss = parseFloat(getComputedStyle(element).getPropertyValue('--blad-pad'));
    if (Number.isFinite(uitCss) && uitCss > 0) return uitCss;
    return soort === 'lijst' ? 14 : 16;
  };

  const gapVan = (): number => {
    const stijl = getComputedStyle(meet);
    return parseFloat(stijl.columnGap || stijl.gap) || (soort === 'tegels' ? 20 : 14);
  };

  const pakLijst = (hoogtes: number[], hoogte: number, gat: number): number[][] => {
    const pagina: number[][] = [];
    let huidig: number[] = [];
    let gebruikt = 0;
    hoogtes.forEach((rijHoogte, index) => {
      const nodig = huidig.length > 0 ? rijHoogte + gat : rijHoogte;
      if (huidig.length > 0 && gebruikt + nodig > hoogte + 0.5) {
        pagina.push(huidig);
        huidig = [index];
        gebruikt = rijHoogte;
      } else {
        huidig.push(index);
        gebruikt += nodig;
      }
    });
    if (huidig.length > 0) pagina.push(huidig);
    return pagina.length > 0 ? pagina : [[]];
  };

  const pakTegels = (hoogte: number): number[][] => {
    const tegel = cache?.tegel;
    if (!tegel || tegel.w < 1 || tegel.h < 1) return [items.map((_, index) => index)];
    const gat = tegel.gap;
    const kolommen = Math.max(1, Math.floor((meet.clientWidth + gat) / (tegel.w + gat)));
    const rijen = Math.max(1, Math.floor((hoogte + gat) / (tegel.h + gat)));
    const perBlad = kolommen * rijen;
    const pagina: number[][] = [];
    for (let index = 0; index < items.length; index += perBlad) {
      pagina.push(items.map((_, item) => item).slice(index, index + perBlad));
    }
    return pagina.length > 0 ? pagina : [[]];
  };

  const meetIndienNodig = (): number[] => {
    const breedte = element.clientWidth;
    if (cache && cache.breedte === breedte && cache.hoogtes.length === items.length && cache.hoogtes.every((hoogte) => hoogte > 0)) {
      return cache.hoogtes;
    }
    meet.append(...items);
    const hoogtes = items.map((item) => item.getBoundingClientRect().height);
    const tegel = soort === 'tegels' && items[0]
      ? { w: items[0].getBoundingClientRect().width, h: items[0].getBoundingClientRect().height, gap: gapVan() }
      : undefined;
    cache = { breedte, hoogtes, tegel };
    return hoogtes;
  };

  const bereken = (hoogtes: number[]): { groepen: number[][]; vensterHoogte: number } => {
    const gat = gapVan();
    const zonder = (navHoogte: number): number => Math.max(1, vrijeHoogte(navHoogte) - bladPad());
    const zonderNav = soort === 'lijst' ? pakLijst(hoogtes, zonder(0), gat) : pakTegels(zonder(0));
    if (zonderNav.length <= 1) return { groepen: zonderNav, vensterHoogte: 0 };
    zetStippen(zonderNav.length);
    nav.hidden = false;
    let navHoogte = nav.offsetHeight;
    let metNav = soort === 'lijst' ? pakLijst(hoogtes, zonder(navHoogte), gat) : pakTegels(zonder(navHoogte));
    if (metNav.length !== zonderNav.length) {
      zetStippen(metNav.length);
      const opnieuw = nav.offsetHeight;
      if (opnieuw !== navHoogte) {
        navHoogte = opnieuw;
        metNav = soort === 'lijst' ? pakLijst(hoogtes, zonder(navHoogte), gat) : pakTegels(zonder(navHoogte));
        zetStippen(metNav.length);
      }
    }
    if (metNav.length <= 1) return { groepen: metNav, vensterHoogte: 0 };
    return { groepen: metNav, vensterHoogte: vrijeHoogte(nav.offsetHeight) };
  };

  const plaats = (volgende: number[][], vensterHoogte: number): void => {
    groepen = volgende;
    venster.replaceChildren();
    const bladert = volgende.length > 1 && volgende.some((blad) => blad.length > 0);
    element.classList.toggle('kern-paginas--bladert', bladert);
    nav.hidden = !bladert;
    venster.style.height = bladert ? `${vensterHoogte}px` : '';
    for (const indices of volgende) {
      const blad = document.createElement('div');
      blad.className = soort === 'tegels' ? 'kern-paginas__blad tegel-grid' : 'kern-paginas__blad';
      blad.append(...indices.map((index) => items[index]));
      venster.appendChild(blad);
    }
    if (bladert) zetStippen(volgende.length);
  };

  const layout = (): void => {
    if (bezig || !element.isConnected || element.clientWidth < 2 || items.length === 0) return;
    bezig = true;
    try {
      const hoogtes = meetIndienNodig();
      if (hoogtes.some((hoogte) => hoogte <= 0)) return;
      const plan = bereken(hoogtes);
      const sig = `${element.clientWidth}x${Math.round(plan.vensterHoogte)}:${plan.groepen.map((blad) => blad.length).join(',')}`;
      const inMeetbak = items[0]?.parentElement === meet;
      if (sig === handtekening && !inMeetbak) {
        // bereken() kan de stippen opnieuw bouwen; de actieve stip moet blijven kloppen.
        werkBij(paginaVan(focus, groepen));
        return;
      }
      handtekening = sig;
      const doel = paginaVan(focus, plan.groepen);
      plaats(plan.groepen, plan.vensterHoogte);
      // Na de layout, anders is de bladbreedte nog 0 en blijft scrollLeft op 0 hangen.
      requestAnimationFrame(() => {
        if (element.isConnected) gaNaar(doel, false);
      });
    } finally {
      bezig = false;
    }
  };

  venster.addEventListener('scroll', () => {
    if (negeerScroll > 0 || groepen.length <= 1) return;
    const blad = huidigBlad();
    if (groepen[blad]?.length) focus = groepen[blad][0];
    werkBij();
  }, { passive: true });

  const waarnemer = new ResizeObserver(() => layout());
  waarnemer.observe(element);
  const bijLettertypen = (): void => {
    cache = null;
    handtekening = '';
    layout();
  };
  document.fonts?.ready.then(bijLettertypen).catch(() => {});

  return {
    element,
    vernietig() {
      waarnemer.disconnect();
      element.remove();
    },
  };
}
