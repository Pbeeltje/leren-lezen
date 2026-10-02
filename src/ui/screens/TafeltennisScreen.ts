import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { AVATAR_ICONEN, AVATAR_KLEUREN, avatarFilter, avatarPad, haalActiefProfiel } from '../../engine/profielStore.ts';
import { haalGroep } from '../../engine/progressStore.ts';
import { TONEN, speelDrum, speelNoot } from '../../engine/muziek.ts';
import { confetti } from '../../three/particles.ts';

// Tafeltennis (pong): je eigen figuurtje staat onderaan met een batje en schuift mee met je
// vinger (of de pijltjes). Bovenaan staan na elkaar drie willekeurige figuurtjes, elk een
// stukje beter. Scoor je drie keer tegen een tegenstander, dan is die verslagen; scoort hij
// drie keer tegen jou (drie hartjes), dan probeer je hem opnieuw. Geen munten: munten
// verdien je met leren.

const STER = 'assets/images/woorden/ster.svg';
const HART = 'assets/icons/bewaar.svg';
const TROFEE = 'assets/icons/trofee.svg';
const DOELEN = 3;

interface Niveau {
  snelheid: number; // batje, tafelbreedtes per seconde
  reactie: number; // seconden voordat hij op een nieuwe bal reageert
  fout: number; // hoe ver hij naast de bal mikt, in halve batbreedtes
  voorspelt: boolean; // rekent uit waar de bal (na de randen) aankomt
  terugNaarMidden: boolean;
  bal: number; // balsnelheid ten opzichte van de eerste tegenstander
}
// De eerste is echt niet goed, de laatste wel. Een snelle schuine bal krijgt ook de
// laatste niet altijd terug, want de bal wordt bij elke slag iets sneller.
const NIVEAUS: Niveau[] = [
  { snelheid: 0.42, reactie: 0.35, fout: 1.05, voorspelt: false, terugNaarMidden: false, bal: 1 },
  { snelheid: 0.75, reactie: 0.18, fout: 0.65, voorspelt: true, terugNaarMidden: false, bal: 1.12 },
  { snelheid: 1.15, reactie: 0.07, fout: 0.3, voorspelt: true, terugNaarMidden: true, bal: 1.25 },
];

interface Tegenstander {
  icoon: string;
  kleur: number;
}

function kiesTegenstanders(eigen: string | undefined): Tegenstander[] {
  const pot = AVATAR_ICONEN.filter((id) => id !== eigen);
  const gekozen: Tegenstander[] = [];
  while (gekozen.length < NIVEAUS.length) {
    const icoon = pot[Math.floor(Math.random() * pot.length)];
    if (gekozen.some((t) => t.icoon === icoon)) continue;
    gekozen.push({ icoon, kleur: AVATAR_KLEUREN[Math.floor(Math.random() * AVATAR_KLEUREN.length)] });
  }
  return gekozen;
}

export function TafeltennisScreen(manager: ScreenManager): Screen {
  const kleuter = haalGroep() === 'kleuter';
  const profiel = haalActiefProfiel();
  const eigenPad = avatarPad(profiel?.icoonId ?? 'kat');
  const eigenTint = avatarFilter(profiel?.kleur);

  const el = document.createElement('div');
  el.className = 'pong-scherm';
  const veld = document.createElement('div');
  veld.className = 'pong-veld';
  el.appendChild(veld);

  const tafel = document.createElement('div');
  tafel.className = 'pong-tafel';
  tafel.innerHTML = '<div class="pong-tafel__net"></div><div class="pong-tafel__lijn"></div>';
  veld.appendChild(tafel);

  function figuur(klasse: string, src: string, tint: string): HTMLImageElement {
    const img = document.createElement('img');
    img.className = klasse;
    img.src = src;
    img.alt = '';
    img.style.filter = [tint, 'drop-shadow(0 5px 3px rgba(0, 0, 0, 0.3))'].filter(Boolean).join(' ');
    return img;
  }
  function batje(klasse: string): HTMLDivElement {
    const b = document.createElement('div');
    b.className = `pong-bat ${klasse}`;
    return b;
  }
  const spelerFiguur = figuur('pong-figuur', eigenPad, eigenTint);
  const spelerBat = batje('pong-bat--speler');
  const tegenFiguur = figuur('pong-figuur', eigenPad, '');
  const tegenBat = batje('pong-bat--tegen');
  const bal = document.createElement('div');
  bal.className = 'pong-bal';
  bal.hidden = true;
  veld.append(tegenFiguur, tegenBat, spelerFiguur, spelerBat, bal);

  // Bovenaan rechts: de drie tegenstanders, en de stand (sterren = jouw doelpunten,
  // hartjes = hoe vaak hij nog mag scoren).
  const balk = document.createElement('div');
  balk.className = 'pong-balk';
  const ladder = document.createElement('div');
  ladder.className = 'pong-ladder';
  const stand = document.createElement('div');
  stand.className = 'pong-stand';
  const sterren = document.createElement('div');
  sterren.className = 'pong-pil';
  const hartjes = document.createElement('div');
  hartjes.className = 'pong-pil';
  stand.append(sterren, hartjes);
  balk.append(ladder, stand);
  el.appendChild(balk);

  // Liggende telefoon: zelfde draai-melding als het vangspel (zelfde media query in screens.css).
  const draaiNodig = window.matchMedia('(orientation: landscape) and (max-height: 500px) and (pointer: coarse)');
  const draai = document.createElement('div');
  draai.className = 'vang-draai';
  draai.innerHTML = '<div class="vang-draai__telefoon"></div><p>Draai je telefoon</p>';
  el.appendChild(draai);

  let tegenstanders = kiesTegenstanders(profiel?.icoonId);
  let ronde = 0; // welke tegenstander
  let gescoord = 0; // jouw doelpunten tegen hem
  let tegen = 0; // zijn doelpunten tegen jou
  let bezig = false; // bal in het spel
  let actief = false; // wedstrijd loopt (ook tijdens de pauze na een doelpunt)
  let frame = 0;
  let vorigeT = 0;
  let wachtTot = 0; // pauze na een doelpunt, in spel-tijd
  let tijd = 0;
  let opslagNaarSpeler = false;
  let overlay: HTMLElement | null = null;
  let pauzeTimer: number | undefined;

  // Afmetingen (in px binnen .pong-veld), opnieuw berekend bij elke grootteverandering.
  let B = 0; // tafelbreedte
  let x0 = 0; // linkerrand tafel
  let figuurMaat = 0;
  let batBreedte = 0;
  const BAT_DIKTE = 14;
  let tegenLijn = 0; // y van het batje van de tegenstander (midden)
  let spelerLijn = 0;
  let straal = 0;

  // Toestand (x relatief aan de tafel, 0..B).
  let spelerX = 0;
  let doelX = 0;
  let tegenX = 0;
  let tegenDoel = 0;
  let reageerVanaf = 0;
  let afwijking = 0;
  let balNaarTegen = false;
  let bx = 0;
  let by = 0;
  let vx = 0;
  let vy = 0;
  let snelheid = 0;
  let slagen = 0;

  const niveau = (): Niveau => NIVEAUS[ronde];
  const basisSnelheid = (): number => (spelerLijn - tegenLijn) * 0.75 * niveau().bal * (kleuter ? 0.8 : 1);

  function meet(): void {
    const w = veld.clientWidth;
    const h = veld.clientHeight;
    figuurMaat = Math.round(Math.min(96, Math.max(56, Math.min(w, h) * 0.14)));
    // Bovenaan blijft ruimte voor de terugknop en de stand.
    const boven = 104;
    tegenLijn = boven + figuurMaat * 0.85;
    spelerLijn = h - 8 - figuurMaat * 0.85;
    B = Math.min(w - 24, Math.max(300, (spelerLijn - tegenLijn) * 0.8), 640);
    x0 = (w - B) / 2;
    batBreedte = Math.round(Math.min(150, Math.max(78, B * 0.24)));
    straal = Math.round(Math.min(18, Math.max(11, B * 0.032)));
    tafel.style.left = `${x0}px`;
    tafel.style.top = `${tegenLijn - 14}px`;
    tafel.style.width = `${B}px`;
    tafel.style.height = `${spelerLijn - tegenLijn + 28}px`;
    for (const f of [spelerFiguur, tegenFiguur]) {
      f.style.width = `${figuurMaat}px`;
      f.style.height = `${figuurMaat}px`;
    }
    for (const b of [spelerBat, tegenBat]) {
      b.style.width = `${batBreedte}px`;
      b.style.height = `${BAT_DIKTE}px`;
    }
    bal.style.width = bal.style.height = `${straal * 2}px`;
    const klem = (x: number) => Math.min(B - batBreedte / 2, Math.max(batBreedte / 2, x));
    spelerX = klem(spelerX || B / 2);
    doelX = klem(doelX || B / 2);
    tegenX = klem(tegenX || B / 2);
  }

  function teken(): void {
    spelerBat.style.transform = `translate(${x0 + spelerX - batBreedte / 2}px, ${spelerLijn - BAT_DIKTE / 2}px)`;
    spelerFiguur.style.transform = `translate(${x0 + spelerX - figuurMaat / 2}px, ${spelerLijn - figuurMaat * 0.15}px)`;
    tegenBat.style.transform = `translate(${x0 + tegenX - batBreedte / 2}px, ${tegenLijn - BAT_DIKTE / 2}px)`;
    tegenFiguur.style.transform = `translate(${x0 + tegenX - figuurMaat / 2}px, ${tegenLijn - figuurMaat * 0.85}px)`;
    bal.style.transform = `translate(${x0 + bx - straal}px, ${by - straal}px)`;
  }

  function tekenStand(): void {
    sterren.replaceChildren(
      ...Array.from({ length: DOELEN }, (_, i) => {
        const s = document.createElement('img');
        s.src = STER;
        s.alt = '';
        if (i >= gescoord) s.className = 'pong-pil--leeg';
        return s;
      }),
    );
    hartjes.replaceChildren(
      ...Array.from({ length: DOELEN }, (_, i) => {
        const h = document.createElement('img');
        h.src = HART;
        h.alt = '';
        if (i >= DOELEN - tegen) h.className = 'pong-pil--leeg';
        return h;
      }),
    );
    ladder.replaceChildren(
      ...tegenstanders.map((t, i) => {
        const vak = document.createElement('span');
        vak.className = `pong-ladder__vak${i === ronde ? ' pong-ladder__vak--nu' : ''}${i < ronde ? ' pong-ladder__vak--klaar' : ''}`;
        const img = document.createElement('img');
        img.src = avatarPad(t.icoon);
        img.alt = '';
        img.style.filter = avatarFilter(t.kleur);
        vak.appendChild(img);
        return vak;
      }),
    );
  }

  function zetTegenstander(): void {
    const t = tegenstanders[ronde];
    tegenFiguur.src = avatarPad(t.icoon);
    tegenFiguur.style.filter = [avatarFilter(t.kleur), 'drop-shadow(0 5px 3px rgba(0, 0, 0, 0.3))'].filter(Boolean).join(' ');
  }

  // Waar de bal de lijn van de tegenstander haalt, met de stuiters tegen de zijkanten.
  function voorspelX(): number {
    const t = (by - tegenLijn) / -vy;
    const breed = B - 2 * straal;
    let x = bx - straal + vx * t;
    x = ((x % (2 * breed)) + 2 * breed) % (2 * breed);
    if (x > breed) x = 2 * breed - x;
    return x + straal;
  }

  function nieuweBalVoorTegen(): void {
    reageerVanaf = tijd + niveau().reactie;
    afwijking = (Math.random() * 2 - 1) * niveau().fout * (batBreedte / 2);
  }

  function serveer(): void {
    bx = B / 2;
    by = (tegenLijn + spelerLijn) / 2;
    snelheid = basisSnelheid() * 0.8;
    slagen = 0;
    const hoek = ((Math.random() * 2 - 1) * 25 * Math.PI) / 180;
    vx = snelheid * Math.sin(hoek);
    vy = (opslagNaarSpeler ? 1 : -1) * snelheid * Math.cos(hoek);
    balNaarTegen = vy < 0;
    if (balNaarTegen) nieuweBalVoorTegen();
    bal.hidden = false;
    bezig = true;
  }

  function terugslag(batX: number, naarBoven: boolean): void {
    const raak = Math.max(-1, Math.min(1, (bx - batX) / (batBreedte / 2)));
    let hoek = raak * 55;
    if (Math.abs(raak) < 0.1) hoek += (Math.random() * 2 - 1) * 6;
    slagen++;
    snelheid = Math.min(basisSnelheid() * 1.8, basisSnelheid() * (1 + slagen * 0.045));
    const rad = (hoek * Math.PI) / 180;
    vx = snelheid * Math.sin(rad);
    vy = (naarBoven ? -1 : 1) * snelheid * Math.cos(rad);
  }

  function plop(tekst: string, y: number): void {
    const p = document.createElement('div');
    p.className = 'vang-plop';
    p.textContent = tekst;
    p.style.left = `${x0 + B / 2}px`;
    p.style.top = `${y}px`;
    veld.appendChild(p);
    window.setTimeout(() => p.remove(), 700);
  }

  function doelpunt(voorSpeler: boolean): void {
    bezig = false;
    bal.hidden = true;
    if (voorSpeler) {
      gescoord++;
      speelNoot(TONEN[0]);
      speelNoot(TONEN[2], 0.08);
      speelNoot(TONEN[4], 0.16);
      plop('⭐', tegenLijn + 40);
    } else {
      tegen++;
      speelDrum('bas');
      spelerFiguur.classList.remove('vang-speler--au');
      void spelerFiguur.offsetWidth;
      spelerFiguur.classList.add('vang-speler--au');
    }
    tekenStand();
    opslagNaarSpeler = !voorSpeler;
    if (gescoord >= DOELEN) {
      actief = false;
      confetti.vuurwerk(ronde === NIVEAUS.length - 1 ? 'groot' : 'klein');
      pauzeTimer = window.setTimeout(() => {
        if (ronde === NIVEAUS.length - 1) toonVenster('gewonnen');
        else {
          ronde++;
          toonVenster('volgende');
        }
      }, 1100);
      return;
    }
    if (tegen >= DOELEN) {
      actief = false;
      pauzeTimer = window.setTimeout(() => toonVenster('verloren'), 900);
      return;
    }
    wachtTot = tijd + 0.9;
  }

  function stap(t: number): void {
    if (!actief) return;
    if (draaiNodig.matches) {
      vorigeT = t;
      frame = requestAnimationFrame(stap);
      return;
    }
    const dt = Math.min(0.05, (t - (vorigeT || t)) / 1000);
    vorigeT = t;
    tijd += dt;

    if (toetsen.size) {
      toetsTijd += dt;
      const v = B * (0.9 + Math.min(0.7, toetsTijd * 1.6)) * dt;
      if (toetsen.has('links')) doelX -= v;
      if (toetsen.has('rechts')) doelX += v;
    }
    doelX = Math.min(B - batBreedte / 2, Math.max(batBreedte / 2, doelX));
    spelerX += (doelX - spelerX) * Math.min(1, dt * 18);

    // Tegenstander.
    const n = niveau();
    if (bezig && balNaarTegen) {
      if (tijd >= reageerVanaf) tegenDoel = (n.voorspelt ? voorspelX() : bx) + afwijking;
    } else if (n.terugNaarMidden) {
      tegenDoel = B / 2;
    }
    const maxStap = n.snelheid * (kleuter ? 0.85 : 1) * B * dt;
    tegenX += Math.max(-maxStap, Math.min(maxStap, tegenDoel - tegenX));
    tegenX = Math.min(B - batBreedte / 2, Math.max(batBreedte / 2, tegenX));

    if (!bezig && wachtTot && tijd >= wachtTot) {
      wachtTot = 0;
      serveer();
    }

    if (bezig) {
      const oudY = by;
      bx += vx * dt;
      by += vy * dt;
      if (bx < straal) {
        bx = 2 * straal - bx;
        vx = Math.abs(vx);
      } else if (bx > B - straal) {
        bx = 2 * (B - straal) - bx;
        vx = -Math.abs(vx);
      }
      const spelerBoven = spelerLijn - BAT_DIKTE / 2;
      const tegenOnder = tegenLijn + BAT_DIKTE / 2;
      const bereik = batBreedte / 2 + straal * 0.6;
      if (vy > 0 && oudY + straal <= spelerBoven && by + straal >= spelerBoven && Math.abs(bx - spelerX) <= bereik) {
        by = spelerBoven - straal;
        terugslag(spelerX, true);
        speelNoot(TONEN[7]);
        balNaarTegen = true;
        nieuweBalVoorTegen();
      } else if (vy < 0 && oudY - straal >= tegenOnder && by - straal <= tegenOnder && Math.abs(bx - tegenX) <= bereik) {
        by = tegenOnder + straal;
        terugslag(tegenX, false);
        speelNoot(TONEN[4]);
        balNaarTegen = false;
      } else if (by - straal > spelerLijn + figuurMaat * 0.4) {
        doelpunt(false);
      } else if (by + straal < tegenLijn - figuurMaat * 0.4) {
        doelpunt(true);
      }
    }

    teken();
    if (actief) frame = requestAnimationFrame(stap);
  }

  // Besturing: overal op het veld tikken of slepen; toetsen op een laptop.
  function naarVinger(e: PointerEvent): void {
    const r = veld.getBoundingClientRect();
    doelX = e.clientX - r.left - x0;
  }
  veld.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    naarVinger(e);
  });
  veld.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'mouse' || e.buttons) naarVinger(e);
  });
  const toetsen = new Set<'links' | 'rechts'>();
  let toetsTijd = 0;
  const richting = (e: KeyboardEvent): 'links' | 'rechts' | null =>
    e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a' ? 'links' : e.key === 'ArrowRight' || e.key.toLowerCase() === 'd' ? 'rechts' : null;
  const toetsNeer = (e: KeyboardEvent): void => {
    const r = richting(e);
    if (r) {
      if (!toetsen.has(r)) toetsTijd = 0;
      toetsen.add(r);
      e.preventDefault();
    } else if ((e.key === ' ' || e.key === 'Enter') && overlay && !e.repeat) {
      e.preventDefault();
      overlay.querySelector<HTMLButtonElement>('.vang-venster__start')?.click();
    }
  };
  const toetsOp = (e: KeyboardEvent): void => {
    const r = richting(e);
    if (r) toetsen.delete(r);
  };
  const losAlles = (): void => toetsen.clear();

  function startWedstrijd(): void {
    overlay?.remove();
    overlay = null;
    gescoord = 0;
    tegen = 0;
    zetTegenstander();
    tekenStand();
    spelerX = doelX = tegenX = tegenDoel = B / 2;
    // De eerste opslag gaat naar de tegenstander, zodat je eerst ziet hoe hij terugslaat.
    opslagNaarSpeler = false;
    bezig = false;
    bal.hidden = true;
    tijd = 0;
    wachtTot = 0.6;
    actief = true;
    vorigeT = 0;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(stap);
  }

  function gezicht(src: string, tint: string, klasse = 'pong-venster__figuur'): string {
    return `<img class="${klasse}" src="${src}" alt="" style="filter: ${tint || 'none'}">`;
  }

  // Vensters zonder tekst: jij tegen hem, de drie tegenstanders, en een grote speelknop.
  function toonVenster(soort: 'start' | 'volgende' | 'verloren' | 'gewonnen'): void {
    overlay?.remove();
    tekenStand();
    const v = document.createElement('div');
    v.className = 'vang-venster';
    const doos = document.createElement('div');
    doos.className = 'vang-venster__doos';
    const t = tegenstanders[ronde];
    if (soort === 'gewonnen') {
      doos.innerHTML = `
        <div class="pong-vs">${gezicht(eigenPad, eigenTint)}<img class="pong-venster__trofee" src="${TROFEE}" alt=""></div>`;
    } else {
      doos.innerHTML = `
        <div class="pong-vs${soort === 'verloren' ? ' pong-vs--verloren' : ''}">
          ${gezicht(eigenPad, eigenTint)}<b>VS</b>${gezicht(avatarPad(t.icoon), avatarFilter(t.kleur))}
        </div>`;
    }
    doos.appendChild(ladder.cloneNode(true));
    if (soort === 'start' && matchMedia('(hover: hover) and (pointer: fine)').matches) {
      const hint = document.createElement('p');
      hint.className = 'vang-venster__toetsen';
      hint.innerHTML = '<kbd>←</kbd><kbd>→</kbd>';
      hint.setAttribute('aria-label', 'pijltjestoetsen');
      doos.appendChild(hint);
    }
    const knop = document.createElement('button');
    knop.type = 'button';
    knop.className = 'vang-venster__start';
    knop.innerHTML = '<img src="assets/icons/vangspel-start.svg" alt="">';
    knop.setAttribute('aria-label', soort === 'verloren' ? 'nog een keer' : 'spelen');
    knop.addEventListener('click', () => {
      if (soort === 'gewonnen') {
        tegenstanders = kiesTegenstanders(profiel?.icoonId);
        ronde = 0;
      }
      startWedstrijd();
    });
    doos.appendChild(knop);
    v.appendChild(doos);
    el.appendChild(v);
    overlay = v;
  }

  const terug = maakTerugKnop(() => manager.pop());
  const opGrootte = new ResizeObserver(() => {
    meet();
    teken();
  });

  return {
    mount(root) {
      root.appendChild(el);
      root.appendChild(terug);
      meet();
      bx = B / 2;
      by = (tegenLijn + spelerLijn) / 2;
      zetTegenstander();
      tekenStand();
      teken();
      opGrootte.observe(veld);
      window.addEventListener('keydown', toetsNeer);
      window.addEventListener('keyup', toetsOp);
      window.addEventListener('blur', losAlles);
      toonVenster('start');
    },
    unmount() {
      actief = false;
      bezig = false;
      cancelAnimationFrame(frame);
      window.clearTimeout(pauzeTimer);
      opGrootte.disconnect();
      window.removeEventListener('keydown', toetsNeer);
      window.removeEventListener('keyup', toetsOp);
      window.removeEventListener('blur', losAlles);
      el.remove();
      terug.remove();
    },
  };
}
