import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { avatarPad, haalActiefProfiel, haalActiefProfielId } from '../../engine/profielStore.ts';
import { haalGroep } from '../../engine/progressStore.ts';
import { TONEN, speelDrum, speelNoot } from '../../engine/muziek.ts';
import { confetti } from '../../three/particles.ts';
import { huidigThema, type ThemaId } from '../../achtergrond/achtergrond.ts';

// Vangspel: je eigen figuurtje staat onderaan en schuift mee met je vinger (of de
// pijltjestoetsen). Vang het lekkers dat naar beneden valt, ontwijk de meteoren. Drie
// hartjes; elke meteoor kost er één. Het wordt langzaam moeilijker: alles valt sneller en
// vaker, er komen meer meteoren en die worden ook steeds groter. Missen van lekkers
// kost niets. Geen munten: munten verdien je met leren. Wel een record per profiel.

// Wat er valt hangt af van de gekozen achtergrond: goede dingen om te vangen en één ding
// om te ontwijken. Dat gevaar is rood gekleurd (behalve de meteoor, die is al gevaarlijk
// genoeg om te zien), zodat ook een kleuter meteen ziet wat je niet moet hebben.
const w = (n: string): string => `assets/images/woorden/${n}.svg`;
const a = (n: string): string => `assets/achtergrond/${n}.svg`;
const i = (n: string): string => `assets/icons/${n}.svg`;
const METEOOR = i('meteoor');
interface VangThema {
  goed: string[];
  gevaar: string;
  rood: boolean;
}
const STANDAARD: VangThema = {
  goed: ['aardbei', 'appel', 'banaan', 'kers', 'peer', 'taart', 'ijs', 'koek', 'sinaasappel'].map(w),
  gevaar: METEOOR,
  rood: false,
};
const THEMA_DINGEN: Partial<Record<ThemaId, VangThema>> = {
  ruimte: { goed: [w('maan'), w('raket'), i('avatar-alien'), w('ster')], gevaar: METEOOR, rood: false },
  dino: { goed: [w('blad'), w('ei'), w('boom'), a('triceratops'), w('banaan')], gevaar: METEOOR, rood: false },
  zee: { goed: [a('schelp'), w('ijs'), w('emmer'), a('krab'), w('vis')], gevaar: a('kwal'), rood: true },
  onderwater: { goed: [a('vis'), a('vis-tropisch'), a('schildpad'), a('octopus'), a('schelp')], gevaar: a('kogelvis'), rood: true },
  boerderij: { goed: [a('kuiken'), w('ei'), w('appel'), w('mais'), w('wortel')], gevaar: w('vos'), rood: true },
  // Geen rode esdoornbladeren: rood betekent hier gevaar.
  herfst: { goed: [w('blad'), a('herfst-kastanje'), a('herfst-paddenstoel'), w('noot'), a('herfst-eekhoorn')], gevaar: w('wolf'), rood: true },
  winter: { goed: [a('winter-sneeuwvlok'), a('sneeuwpop'), w('muts'), w('ster'), w('slee')], gevaar: w('ijsbeer'), rood: true },
  kasteel: { goed: [w('kroon'), w('sleutel'), a('eenhoorn'), w('ster'), w('koningin')], gevaar: i('avatar-draak'), rood: true },
  kermis: { goed: [a('kermis-ijsje'), a('kermis-popcorn'), w('ballon'), w('taart'), w('koek')], gevaar: w('spook'), rood: true },
  bouw: { goed: [w('hamer'), w('touw'), w('emmer'), w('ladder'), w('schaar')], gevaar: w('vuur'), rood: false },
  trein: { goed: [w('tas'), w('pet'), w('appel'), w('boek'), w('fles')], gevaar: w('onweer'), rood: true },
  savanne: { goed: [w('giraf'), w('zebra'), w('olifant'), w('banaan'), w('leeuw')], gevaar: w('krokodil'), rood: true },
};
const STER = w('ster');
const HART = 'assets/icons/bewaar.svg';
const LEVENS = 3;

interface Ding {
  el: HTMLImageElement;
  x: number; // midden, px
  y: number; // midden, px
  snelheid: number; // px per seconde
  maat: number; // px
  draai: number;
  soort: 'lekker' | 'ster' | 'gevaar';
}

const recordSleutel = (): string => `leren-lezen:vangspel:${haalActiefProfielId() ?? 'gast'}`;
function haalRecord(): number {
  try {
    return Number(localStorage.getItem(recordSleutel())) || 0;
  } catch {
    return 0;
  }
}
function zetRecord(n: number): void {
  try {
    localStorage.setItem(recordSleutel(), String(n));
  } catch {
    // geen opslag: dan maar geen record
  }
}

export function VangScreen(manager: ScreenManager): Screen {
  const kleuter = haalGroep() === 'kleuter';
  const thema = THEMA_DINGEN[huidigThema()] ?? STANDAARD;
  const LEKKERS = thema.goed;
  const el = document.createElement('div');
  el.className = 'vang-scherm';

  const veld = document.createElement('div');
  veld.className = 'vang-veld';
  el.appendChild(veld);

  const balk = document.createElement('div');
  balk.className = 'vang-balk';
  const scoreEl = document.createElement('div');
  scoreEl.className = 'vang-score';
  scoreEl.innerHTML = `<img src="${STER}" alt=""><span>0</span>`;
  const hartjes = document.createElement('div');
  hartjes.className = 'vang-hartjes';
  balk.append(scoreEl, hartjes);
  el.appendChild(balk);

  const speler = document.createElement('img');
  speler.className = 'vang-speler';
  speler.src = avatarPad(haalActiefProfiel()?.icoonId ?? 'kat');
  speler.alt = '';
  veld.appendChild(speler);

  let dingen: Ding[] = [];
  let score = 0;
  let levens = LEVENS;
  let spelerX = 0;
  let doelX = 0;
  let kijkRechts = false;
  let bezig = false;
  let tijd = 0; // seconden sinds de start
  let volgende = 0; // wanneer het volgende ding valt
  let frame = 0;
  let vorigeT = 0;
  let geraakt = 0; // tot wanneer de speler knippert (onkwetsbaar)
  let noot = 0;
  let overlay: HTMLElement | null = null;

  const breedte = (): number => veld.clientWidth;
  const hoogte = (): number => veld.clientHeight;
  const spelerMaat = (): number => Math.min(130, Math.max(80, breedte() * 0.16));
  const dingMaat = (): number => Math.min(84, Math.max(52, breedte() * 0.1));

  function tekenHartjes(): void {
    hartjes.replaceChildren(
      ...Array.from({ length: LEVENS }, (_, i) => {
        const h = document.createElement('img');
        h.src = HART;
        h.alt = '';
        if (i >= levens) h.className = 'vang-hart--weg';
        return h;
      }),
    );
  }

  function zetScore(n: number): void {
    score = n;
    scoreEl.querySelector('span')!.textContent = String(score);
  }

  function plaatsSpeler(): void {
    const m = spelerMaat();
    speler.style.width = `${m}px`;
    speler.style.height = `${m}px`;
    speler.style.transform = `translate(${spelerX - m / 2}px, 0) scaleX(${kijkRechts ? -1 : 1})`;
  }

  // Volgen van de vinger: overal op het veld tikken of slepen.
  function naarVinger(e: PointerEvent): void {
    const r = veld.getBoundingClientRect();
    doelX = Math.min(r.width - spelerMaat() / 2, Math.max(spelerMaat() / 2, e.clientX - r.left));
  }
  veld.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    naarVinger(e);
  });
  veld.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'mouse' || e.buttons) naarVinger(e);
  });
  const toetsen = new Set<string>();
  const toetsNeer = (e: KeyboardEvent): void => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      toetsen.add(e.key);
      e.preventDefault();
    }
  };
  const toetsOp = (e: KeyboardEvent): void => {
    toetsen.delete(e.key);
  };

  function laatVallen(): void {
    // Het gevaar groeit mee met de tijd: na drie kwartier is het 1,8 keer zo groot.
    const groei = 1 + Math.min(0.8, tijd / 45);
    const m0 = dingMaat();
    // Meteoren: eerst weinig, later meer (kleuters altijd minder).
    const kansMeteoor = Math.min(kleuter ? 0.28 : 0.42, 0.14 + tijd * 0.008);
    const lot = Math.random();
    const soort: Ding['soort'] = lot < kansMeteoor ? 'gevaar' : lot > 0.95 ? 'ster' : 'lekker';
    const img = document.createElement('img');
    img.className = `vang-ding vang-ding--${soort}${soort === 'gevaar' && thema.rood ? ' vang-ding--rood' : ''}`;
    img.src = soort === 'gevaar' ? thema.gevaar : soort === 'ster' ? STER : LEKKERS[Math.floor(Math.random() * LEKKERS.length)];
    img.alt = '';
    const m = soort === 'gevaar' ? m0 * groei : m0;
    img.style.width = `${m}px`;
    img.style.height = `${m}px`;
    veld.appendChild(img);
    const basis = (kleuter ? 0.2 : 0.26) * hoogte();
    const snelheid = basis * (1 + Math.min(1.6, tijd / 22)) * (0.85 + Math.random() * 0.3);
    dingen.push({
      el: img,
      x: m / 2 + Math.random() * (breedte() - m),
      y: -m,
      snelheid: soort === 'ster' ? snelheid * 1.25 : snelheid,
      maat: m,
      draai: Math.random() * 360,
      soort,
    });
  }

  function vang(d: Ding): void {
    d.el.remove();
    if (d.soort === 'gevaar') {
      if (tijd < geraakt) return;
      levens--;
      geraakt = tijd + 1.2;
      speelDrum('bas');
      speelDrum('bekken', 0.05);
      speler.classList.remove('vang-speler--au');
      void speler.offsetWidth;
      speler.classList.add('vang-speler--au');
      tekenHartjes();
      if (levens <= 0) klaar();
      return;
    }
    zetScore(score + (d.soort === 'ster' ? 5 : 1));
    // Toonladder omhoog bij elke vangst, en weer opnieuw na de hoge do.
    speelNoot(TONEN[noot % TONEN.length]);
    if (d.soort === 'ster') speelNoot(TONEN[7], 0.08);
    noot++;
    const plop = document.createElement('div');
    plop.className = 'vang-plop';
    plop.textContent = d.soort === 'ster' ? '+5' : '+1';
    plop.style.left = `${d.x}px`;
    plop.style.top = `${d.y}px`;
    veld.appendChild(plop);
    window.setTimeout(() => plop.remove(), 700);
  }

  function stap(t: number): void {
    if (!bezig) return;
    const dt = Math.min(0.05, (t - (vorigeT || t)) / 1000);
    vorigeT = t;
    tijd += dt;

    if (toetsen.has('ArrowLeft')) doelX -= breedte() * 1.2 * dt;
    if (toetsen.has('ArrowRight')) doelX += breedte() * 1.2 * dt;
    const m = spelerMaat();
    doelX = Math.min(breedte() - m / 2, Math.max(m / 2, doelX));
    const oud = spelerX;
    spelerX += (doelX - spelerX) * Math.min(1, dt * 14);
    if (Math.abs(spelerX - oud) > 0.6) kijkRechts = spelerX > oud;
    speler.classList.toggle('vang-speler--knipper', tijd < geraakt);
    plaatsSpeler();

    if (tijd >= volgende) {
      laatVallen();
      const tussen = Math.max(kleuter ? 0.6 : 0.38, (kleuter ? 1.2 : 0.95) - tijd * 0.025);
      volgende = tijd + tussen * (0.8 + Math.random() * 0.4);
    }

    // Vangzone: het bovenste deel van het figuurtje.
    const bodem = hoogte() - 16;
    const spelerBoven = bodem - m;
    dingen = dingen.filter((d) => {
      const dm = d.maat;
      d.y += d.snelheid * dt;
      d.draai += dt * (d.soort === 'gevaar' ? 0 : 40);
      d.el.style.transform = `translate(${d.x - dm / 2}px, ${d.y - dm / 2}px) rotate(${d.draai}deg)`;
      const raakt = d.y > spelerBoven + m * 0.1 && d.y < spelerBoven + m * 0.8 && Math.abs(d.x - spelerX) < (m + dm) * 0.38;
      if (raakt) {
        vang(d);
        return false;
      }
      if (d.y > hoogte() + dm) {
        d.el.remove();
        return false;
      }
      return true;
    });
    if (bezig) frame = requestAnimationFrame(stap);
  }

  function start(): void {
    overlay?.remove();
    overlay = null;
    for (const d of dingen) d.el.remove();
    dingen = [];
    zetScore(0);
    levens = LEVENS;
    tekenHartjes();
    tijd = 0;
    volgende = 0.6;
    geraakt = 0;
    noot = 0;
    spelerX = doelX = breedte() / 2;
    plaatsSpeler();
    bezig = true;
    vorigeT = 0;
    frame = requestAnimationFrame(stap);
  }

  function knop(klasse: string, html: string, label: string, actie: () => void): HTMLButtonElement {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = klasse;
    b.innerHTML = html;
    b.setAttribute('aria-label', label);
    b.addEventListener('click', actie);
    return b;
  }

  // Begin- en eindscherm: plaatjes in plaats van uitleg (vangen ✓, meteoor ✕).
  function toonVenster(eind: boolean): void {
    overlay?.remove();
    const v = document.createElement('div');
    v.className = 'vang-venster';
    const doos = document.createElement('div');
    doos.className = 'vang-venster__doos';
    if (eind) {
      const record = haalRecord();
      const nieuw = score > record;
      if (nieuw) zetRecord(score);
      doos.innerHTML = `
        <img class="vang-venster__figuur" src="${speler.src}" alt="">
        <div class="vang-venster__score"><img src="${STER}" alt=""><span>${score}</span></div>
        <p class="vang-venster__record">${nieuw ? 'Nieuw record!' : `Record: ${record}`}</p>`;
      if (nieuw && score > 0) confetti.vuurwerk('klein');
    } else {
      doos.innerHTML = `
        <img class="vang-venster__figuur" src="${speler.src}" alt="">
        <div class="vang-uitleg">
          <span class="vang-uitleg__vak vang-uitleg__vak--goed"><img src="${LEKKERS[0]}" alt=""><img src="${LEKKERS[1]}" alt=""><b>✓</b></span>
          <span class="vang-uitleg__vak vang-uitleg__vak--fout"><img src="${thema.gevaar}" alt=""${thema.rood ? ' class="vang-ding--rood"' : ''}><b>✕</b></span>
        </div>`;
    }
    doos.appendChild(knop('vang-venster__start', '<img src="assets/icons/vangspel-start.svg" alt="">', eind ? 'nog een keer' : 'start', start));
    v.appendChild(doos);
    el.appendChild(v);
    overlay = v;
  }

  function klaar(): void {
    bezig = false;
    cancelAnimationFrame(frame);
    window.setTimeout(() => {
      for (const d of dingen) d.el.remove();
      dingen = [];
      toonVenster(true);
    }, 700);
  }

  const terug = maakTerugKnop(() => manager.pop());
  const opGrootte = new ResizeObserver(() => {
    if (!bezig) {
      spelerX = doelX = breedte() / 2;
    }
    plaatsSpeler();
  });

  return {
    mount(root) {
      root.appendChild(el);
      root.appendChild(terug);
      tekenHartjes();
      spelerX = doelX = breedte() / 2;
      plaatsSpeler();
      opGrootte.observe(veld);
      window.addEventListener('keydown', toetsNeer);
      window.addEventListener('keyup', toetsOp);
      toonVenster(false);
    },
    unmount() {
      bezig = false;
      cancelAnimationFrame(frame);
      opGrootte.disconnect();
      window.removeEventListener('keydown', toetsNeer);
      window.removeEventListener('keyup', toetsOp);
      el.remove();
      terug.remove();
    },
  };
}
