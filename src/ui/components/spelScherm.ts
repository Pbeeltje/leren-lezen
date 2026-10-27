import { haalRecord, zetRecord, type RecordSpel } from '../../engine/records.ts';

// Wat de spelletjes (vangspel, oversteken, tafeltennis, dieren voeren) delen: de balk met
// tellers en hartjes, de draai-melding, de plopjes en de begin- en eindvensters. CSS: de
// .vang-* regels in screens.css (het vangspel was het eerste).

const HART = 'assets/icons/bewaar.svg';

// Liggende telefoon: te weinig hoogte voor het spel. Dan vraagt een draaiend telefoontje om
// de telefoon rechtop te houden, en staat het spel stil (het spel kijkt naar `nodig`). Moet
// gelijk blijven aan de media query van .vang-draai in screens.css.
export function maakDraaiMelding(): { el: HTMLDivElement; nodig: MediaQueryList } {
  const el = document.createElement('div');
  el.className = 'vang-draai';
  el.innerHTML = '<div class="vang-draai__telefoon"></div><p>Draai je telefoon</p>';
  return { el, nodig: window.matchMedia('(orientation: landscape) and (max-height: 500px) and (pointer: coarse)') };
}

// Een getal met een plaatje ervoor in de balk (score, level).
export function maakTeller(icoon: string, klasse = 'vang-score'): { el: HTMLDivElement; zet(n: number): void } {
  const el = document.createElement('div');
  el.className = klasse;
  el.innerHTML = `<img src="${icoon}" alt=""><span>0</span>`;
  const getal = el.querySelector('span')!;
  return { el, zet: (n) => (getal.textContent = String(n)) };
}

// Een rij hartjes; wat kwijt is wordt grijs.
export function maakHartjes(aantal: number): { el: HTMLDivElement; teken(over: number): void } {
  const el = document.createElement('div');
  el.className = 'vang-hartjes';
  const teken = (over: number): void => {
    el.replaceChildren(
      ...Array.from({ length: aantal }, (_, k) => {
        const h = document.createElement('img');
        h.src = HART;
        h.alt = '';
        if (k >= over) h.className = 'vang-hart--weg';
        return h;
      }),
    );
  };
  return { el, teken };
}

// Een getal of plaatje dat even opspringt en vervaagt (+5, 💙), in px binnen `ouder`.
export function toonPlop(ouder: HTMLElement, x: number, y: number, tekst: string): void {
  const plop = document.createElement('div');
  plop.className = 'vang-plop';
  plop.textContent = tekst;
  plop.style.left = `${x}px`;
  plop.style.top = `${y}px`;
  ouder.appendChild(plop);
  window.setTimeout(() => plop.remove(), 700);
}

// Begin- en eindvenster: een doos in het midden; het spel vult die en hangt het venster op.
export function maakVenster(): { venster: HTMLDivElement; doos: HTMLDivElement } {
  const venster = document.createElement('div');
  venster.className = 'vang-venster';
  const doos = document.createElement('div');
  doos.className = 'vang-venster__doos';
  venster.appendChild(doos);
  return { venster, doos };
}

// De grote speelknop onderin een venster (spatie of Enter klikt hem ook).
export function startKnop(label: string, actie: () => void): HTMLButtonElement {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'vang-venster__start';
  b.innerHTML = '<img src="assets/icons/vangspel-start.svg" alt="">';
  b.setAttribute('aria-label', label);
  b.addEventListener('click', actie);
  return b;
}

// Welke toetsen je kunt gebruiken, alleen met een muis (laptop); anders null.
export function toetsenHint(toetsen: string[], label: string): HTMLParagraphElement | null {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return null;
  const hint = document.createElement('p');
  hint.className = 'vang-venster__toetsen';
  hint.innerHTML = toetsen.map((t) => `<kbd>${t}</kbd>`).join('');
  hint.setAttribute('aria-label', label);
  return hint;
}

// Eindscore tegen het record: bewaart een nieuw record en geeft de regel voor het venster.
// `vorige`: het record om tegen te vergelijken, als dat tussentijds al bijgewerkt kan zijn.
export function recordRegel(spel: RecordSpel, score: number, vorige = haalRecord(spel)): { html: string; nieuw: boolean } {
  const nieuw = score > vorige;
  if (score > haalRecord(spel)) zetRecord(spel, score);
  return { html: `<p class="vang-venster__record">${nieuw ? 'Nieuw record!' : `Record: ${haalRecord(spel)}`}</p>`, nieuw };
}
