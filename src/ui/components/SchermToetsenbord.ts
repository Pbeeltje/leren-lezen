// Eigen toetsenbord op aanraakschermen. Een telefoon opent zijn toetsenbord alleen als het
// invoerveld vanuit een tik de focus krijgt; onze typ-vragen verschijnen pas na de
// feedback van de vorige vraag, dus daar bleef het toetsenbord vaak dicht (gemeld). Met
// grote eigen toetsen werkt het altijd, bedekt het telefoon-toetsenbord de vraag niet en
// is er geen autocorrectie. Letters op alfabet: dat vindt een kind van 6 sneller dan qwerty.
// Klinkers (a e i o u) rood, medeklinkers blauw, zoals op school. In de app en op elk
// apparaat met een aanraakscherm altijd dit bord; alleen een computer zonder aanraakscherm
// houdt het gewone invoerveld. Een echt toetsenbord werkt er gewoon bij.

import { isApp } from '../../engine/native.ts';

const LETTER_RIJEN = ['abcdefg', 'hijklmn', 'opqrstu', 'vwxyz'];
const CIJFER_RIJEN = ['123', '456', '789', '0'];
const KLINKERS = 'aeiou';

export function isAanraakscherm(): boolean {
  return isApp || navigator.maxTouchPoints > 0 || window.matchMedia('(any-pointer: coarse)').matches;
}

// na: het element waar het toetsenbord achter komt (standaard het invoerveld zelf; bij
// reeks-aanvullen staat het veld in een rij getallen en komt het bord onder de rij).
export function koppelSchermToetsenbord(
  invoer: HTMLInputElement,
  soort: 'letters' | 'cijfers',
  na: HTMLElement = invoer,
): HTMLElement | null {
  if (!isAanraakscherm()) return null;
  // Geen telefoon-toetsenbord meer laten opspringen.
  invoer.readOnly = true;
  invoer.inputMode = 'none';
  invoer.classList.add('typen-invoer--scherm');

  const bord = document.createElement('div');
  bord.className = `scherm-toetsenbord scherm-toetsenbord--${soort}`;

  const typ = (tekst: string | null): void => {
    if (invoer.classList.contains('goed-gekozen')) return;
    invoer.value = tekst === null ? invoer.value.slice(0, -1) : invoer.value + tekst;
    invoer.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const rijen = soort === 'letters' ? LETTER_RIJEN : CIJFER_RIJEN;
  rijen.forEach((rij, i) => {
    const r = document.createElement('div');
    r.className = 'scherm-toetsenbord__rij';
    for (const teken of rij) {
      const toets = document.createElement('button');
      toets.type = 'button';
      toets.className = soort === 'cijfers' ? 'scherm-toets' : `scherm-toets scherm-toets--${KLINKERS.includes(teken) ? 'klinker' : 'medeklinker'}`;
      toets.textContent = teken;
      toets.addEventListener('click', () => typ(teken));
      r.appendChild(toets);
    }
    if (i === rijen.length - 1) {
      const wis = document.createElement('button');
      wis.type = 'button';
      wis.className = 'scherm-toets scherm-toets--wis';
      wis.textContent = '⌫';
      wis.setAttribute('aria-label', 'Wissen');
      wis.addEventListener('click', () => typ(null));
      r.appendChild(wis);
    }
    bord.appendChild(r);
  });

  // Laptop met aanraakscherm: het veld is readOnly, dus echte toetsen hier zelf afhandelen.
  const toegestaan = soort === 'letters' ? /^[a-z]$/i : /^[0-9]$/;
  invoer.addEventListener('keydown', (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === 'Backspace') typ(null);
    else if (toegestaan.test(event.key)) typ(event.key.toLowerCase());
    else return;
    event.preventDefault();
  });

  na.after(bord);
  return bord;
}
