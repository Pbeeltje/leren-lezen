import type { RondeVraag } from '../../ui/screens/RondeScreen.ts';
import { instructieAudioPad } from '../../engine/audioManager.ts';
import { toonGoedFeedback, toonFoutFeedback } from '../../ui/components/FeedbackOverlay.ts';
import { GETEKENDE_REEKSEN } from './volgordeTekeningen.ts';
import { plaatjesPool } from './vergelijken.ts';
import { kies, schud } from '../../engine/toeval.ts';

// Op volgorde: drie of vier plaatjes in de goede volgorde zetten. Het kind tikt ze één
// voor één aan; het goede plaatje vliegt naar het volgende genummerde vak, een fout
// plaatje wiebelt en blijft liggen (oefenen: gewoon opnieuw proberen).
// Drie soorten: een verhaaltje (ei → kip, zaadje → bloem), hetzelfde plaatje in vier
// maten (van groot naar klein of andersom), en dieren die even groot getekend zijn maar
// in het echt verschillen (dan moet het kind nadenken in plaats van kijken).

const W = (naam: string) => `assets/images/woorden/${naam}.svg`;
const V = (naam: string) => `assets/volgorde/${naam}.svg`;

// Reeksen met Fluent-plaatjes, in de goede volgorde. Alleen waar elke stap op zich
// duidelijk is; wat met losse emoji te vaag werd, is zelf getekend (volgordeTekeningen).
const PLAATJES_REEKSEN: string[][] = [
  [W('ei'), V('kuiken-uit-ei'), V('kuiken'), W('kip')],
  [W('koe'), W('melk'), W('kaas')],
  [V('graan'), W('brood'), V('boterham')],
  [W('bloem'), W('bij'), W('honing')],
  [W('schaap'), W('wol'), W('trui')],
  [W('boom'), W('hout'), W('stoel')],
  [V('batterij-leeg'), V('stekker'), W('batterij')],
  [V('koffer'), W('vliegtuig'), V('eiland')],
  [W('ei'), W('kom'), W('taart'), V('taartpunt')],
  [V('bloesem'), V('groene-appel'), W('appel')],
  [V('baby'), V('kind'), V('oudere')],
];

// Van klein naar groot in het echt; elke vier hieruit (in deze volgorde) zijn duidelijk.
const ECHTE_GROOTTE = ['mier', 'muis', 'konijn', 'schaap', 'paard', 'olifant', 'walvis'];

const MATEN = [32, 52, 74, 100];

type Soort = 'verhaal' | 'groot-klein' | 'klein-groot';

const INSTRUCTIE: Record<Soort, string> = {
  verhaal: 'Wat komt eerst? Zet ze op volgorde.',
  'groot-klein': 'Zet ze van groot naar klein.',
  'klein-groot': 'Zet ze van klein naar groot.',
};

// Een plaatje: een getekende SVG (als tekst) of een afbeelding, eventueel kleiner.
interface Stap {
  maak: () => string;
  schaal?: number;
}

// De laatste paar reeksen, zodat dezelfde niet vlak na elkaar terugkomt.
const recent: string[] = [];
function nietRecent<T>(opties: T[], sleutel: (t: T) => string): T {
  const vers = opties.filter((o) => !recent.includes(sleutel(o)));
  const keuze = kies(vers.length > 0 ? vers : opties);
  recent.push(sleutel(keuze));
  if (recent.length > 8) recent.shift();
  return keuze;
}

function verhaal(): Stap[] {
  const reeksen: Stap[][] = [
    ...GETEKENDE_REEKSEN.map((r) => r.map((maak) => ({ maak }))),
    ...PLAATJES_REEKSEN.map((r) => r.map((pad) => ({ maak: () => pad }))),
  ];
  const i = nietRecent(reeksen.map((_, i) => i), (i) => `verhaal-${i}`);
  return reeksen[i];
}

function maten(oplopend: boolean): { stappen: Stap[]; zelfdePlaatje: boolean } {
  if (Math.random() < 0.5) {
    const woord = nietRecent(plaatjesPool(), (w) => w.woord);
    const stappen = MATEN.map((schaal) => ({ maak: () => woord.afbeeldingPad, schaal }));
    return { stappen: oplopend ? stappen : stappen.reverse(), zelfdePlaatje: true };
  }
  // Vier dieren uit de rij, in volgorde van echte grootte.
  const gekozen = schud(ECHTE_GROOTTE.map((_, i) => i)).slice(0, 4).sort((a, b) => a - b);
  const stappen = gekozen.map((i) => ({ maak: () => W(ECHTE_GROOTTE[i]) }));
  return { stappen: oplopend ? stappen : stappen.reverse(), zelfdePlaatje: false };
}

function inhoud(stap: Stap): HTMLElement {
  const vak = document.createElement('div');
  vak.className = 'volgorde-plaatje';
  const bron = stap.maak();
  if (bron.startsWith('<svg')) {
    vak.innerHTML = bron;
  } else {
    const img = document.createElement('img');
    img.src = bron;
    img.alt = '';
    if (stap.schaal) {
      img.style.width = `${stap.schaal}%`;
      img.style.height = `${stap.schaal}%`;
    }
    vak.appendChild(img);
  }
  return vak;
}

export function maakVolgordeVraag(): RondeVraag {
  const r = Math.random();
  const soort: Soort = r < 0.6 ? 'verhaal' : r < 0.8 ? 'groot-klein' : 'klein-groot';
  let stappen: Stap[];
  let opMaat = false;
  if (soort === 'verhaal') {
    stappen = verhaal();
  } else {
    const m = maten(soort === 'klein-groot');
    stappen = m.stappen;
    opMaat = m.zelfdePlaatje;
  }
  const n = stappen.length;

  return {
    instructie: INSTRUCTIE[soort],
    audioPad: instructieAudioPad(soort === 'verhaal' ? 'volgorde' : `volgorde-${soort}`),
    render(container, afgerond) {
      container.innerHTML = '';
      const kaart = document.createElement('div');
      kaart.className = opMaat ? 'oefen-kaart oefen-kaart--volgorde volgorde--maten' : 'oefen-kaart oefen-kaart--volgorde';
      kaart.style.setProperty('--n', String(n));

      const vakken = document.createElement('div');
      vakken.className = 'volgorde-vakken';
      for (let i = 0; i < n; i++) {
        const vak = document.createElement('div');
        vak.className = 'volgorde-vak';
        vak.style.setProperty('--i', String(i));
        const nummer = document.createElement('span');
        nummer.className = 'volgorde-vak__nummer';
        nummer.textContent = String(i + 1);
        vak.appendChild(nummer);
        vakken.appendChild(vak);
      }

      const stapel = document.createElement('div');
      stapel.className = n === 4 ? 'volgorde-kaarten volgorde-kaarten--vier' : 'volgorde-kaarten';

      // Nooit al in de goede volgorde neerleggen.
      let volgorde = schud(stappen.map((_, i) => i));
      while (volgorde.every((v, i) => v === i)) volgorde = schud(volgorde);

      let volgende = 0;
      let klaar = false;
      const timers: number[] = [];
      for (const index of volgorde) {
        const knop = document.createElement('button');
        knop.className = 'volgorde-kaart';
        knop.appendChild(inhoud(stappen[index]));
        knop.addEventListener('click', () => {
          if (klaar || knop.classList.contains('volgorde-kaart--weg')) return;
          if (index !== volgende) {
            knop.classList.add('fout-gekozen');
            toonFoutFeedback();
            timers.push(window.setTimeout(() => knop.classList.remove('fout-gekozen'), 500));
            return;
          }
          // Het plaatje verhuist naar het vak en vliegt er vanaf de kaart naartoe.
          const van = knop.getBoundingClientRect();
          const vak = vakken.children[volgende] as HTMLElement;
          const plaatje = knop.firstElementChild as HTMLElement;
          vak.appendChild(plaatje);
          vak.classList.add('gevuld');
          knop.classList.add('volgorde-kaart--weg');
          const naar = plaatje.getBoundingClientRect();
          if (naar.width > 0) {
            const s = van.width / naar.width;
            plaatje.animate(
              [
                { transform: `translate(${van.left - naar.left}px, ${van.top - naar.top}px) scale(${s})` },
                { transform: 'none' },
              ],
              { duration: 380, easing: 'cubic-bezier(0.3, 1.25, 0.5, 1)' },
            );
          }
          volgende++;
          if (volgende === n) {
            klaar = true;
            vakken.classList.add('volgorde-vakken--klaar');
            toonGoedFeedback();
            afgerond();
          }
        });
        stapel.appendChild(knop);
      }

      kaart.append(vakken, stapel);
      container.appendChild(kaart);
      return () => {
        timers.forEach((t) => window.clearTimeout(t));
        container.replaceChildren();
      };
    },
  };
}
