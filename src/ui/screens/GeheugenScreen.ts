import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { maakTopRechtsBalk } from '../components/TopRechtsBalk.ts';
import { voegMuntenToe } from '../../engine/progressStore.ts';
import { MUNTEN_GEHEUGEN_BORD, MUNTEN_GEHEUGEN_PAAR, kleuterFactor } from '../../engine/rewards.ts';
import { genereerGeheugenbord } from '../../engine/geheugenGenerator.ts';
import { renderGeheugenSpel } from '../../games/geheugenSpel.ts';
import { events } from '../../engine/events.ts';
import { confetti } from '../../three/particles.ts';
import { toonKlaarKaart } from '../components/KlaarKaart.ts';

const AANTAL_BORDEN = 3;

// Klassiek geheugenspel met dezelfde plaatjes/geluiden als "Luisteren". Elk voltooid
// bord eindigt met een vuurwerkje; na 3 borden volgt de klaar-kaart met groot feest.
// Kleuters spelen met 4 paren, groep 3 met 8 (een groter bord, zie .geheugen-bord--groot).
// Groep 3 (`spelersKeuze`) kiest eerst 1 of 2 spelers. Met twee speel je één bord om de
// beurt: wie een paar vindt mag nog eens, bij een misser is de ander. Speler 1 is blauw,
// speler 2 rood; het scorebord laat zien wie er aan de beurt is.
export function GeheugenScreen(manager: ScreenManager, aantalParen = 4, spelersKeuze = false): Screen {
  const el = document.createElement('div');
  el.className = 'scherm';

  const titel = document.createElement('h1');
  titel.className = 'scherm-titel';
  titel.textContent = 'Geheugenspel';
  el.appendChild(titel);

  const instructie = document.createElement('p');
  instructie.className = 'instructie-tekst';
  instructie.textContent = 'Zoek de twee plaatjes die bij elkaar horen';
  el.appendChild(instructie);

  const scorebord = document.createElement('div');
  scorebord.className = 'geheugen-scorebord';
  const spelerVakken = [1, 2].map((nr) => {
    const vak = document.createElement('div');
    vak.className = `geheugen-speler geheugen-speler--${nr}`;
    vak.innerHTML = `<span class="geheugen-speler__naam">Speler ${nr}</span><span class="geheugen-speler__score">0</span>`;
    scorebord.appendChild(vak);
    return { vak, score: vak.querySelector<HTMLSpanElement>('.geheugen-speler__score')! };
  });

  const oefenContainer = document.createElement('div');
  el.appendChild(oefenContainer);

  let opruimen: (() => void) | null = null;
  let actief = true;
  let timer: number | undefined;
  let bordenKlaar = 0;
  let verdiend = 0;
  // Wat er nog moest gebeuren toen het scherm (bv. voor de winkel) werd weggehaald.
  let wacht: (() => void) | null = null;
  let onderbroken = false;

  // Twee spelers: wie is er aan de beurt (0 of 1) en hoeveel paren heeft ieder.
  let beurt = 0;
  const paren = [0, 0];

  function toonScore(): void {
    spelerVakken.forEach(({ vak, score }, i) => {
      score.textContent = String(paren[i]);
      vak.classList.toggle('geheugen-speler--beurt', i === beurt);
    });
    // De dichte kaarten krijgen de kleur van wie er aan de beurt is.
    el.classList.toggle('geheugen--beurt1', beurt === 0);
    el.classList.toggle('geheugen--beurt2', beurt === 1);
  }

  const betaal = (basis: number): void => {
    const munten = kleuterFactor(basis);
    voegMuntenToe(munten);
    verdiend += munten;
  };

  function nieuwBord(): void {
    if (!actief) return;
    opruimen?.();
    const kaarten = genereerGeheugenbord(aantalParen);
    // Geen actief-check hier: een bord dat net klaar is terwijl het kind in de winkel zit,
    // telt gewoon mee; de volgende stap wacht dan tot het terug is (zie `wacht`).
    opruimen = renderGeheugenSpel(oefenContainer, kaarten, () => betaal(MUNTEN_GEHEUGEN_PAAR), () => {
      betaal(MUNTEN_GEHEUGEN_BORD);
      bordenKlaar++;
      if (bordenKlaar >= AANTAL_BORDEN) {
        wacht = () => {
          if (!actief) return;
          wacht = null;
          opruimen?.();
          opruimen = null;
          instructie.style.display = 'none';
          toonKlaarKaart(oefenContainer, () => manager.pop(), verdiend);
        };
        timer = window.setTimeout(wacht, 1000);
        return;
      }
      confetti.vuurwerk('klein');
      wacht = () => {
        if (!actief) return;
        wacht = null;
        nieuwBord();
      };
      timer = window.setTimeout(wacht, 1400);
    }).vernietig;
    if (aantalParen > 4) oefenContainer.querySelector('.geheugen-bord')?.classList.add('geheugen-bord--groot');
  }

  function tweeSpelersBord(): void {
    if (!actief) return;
    opruimen?.();
    beurt = 0;
    paren[0] = paren[1] = 0;
    verdiend = 0;
    toonScore();
    instructie.replaceWith(scorebord);
    scorebord.hidden = false;
    const kaarten = genereerGeheugenbord(aantalParen);
    opruimen = renderGeheugenSpel(
      oefenContainer,
      kaarten,
      (knoppen) => {
        paren[beurt]++;
        for (const k of knoppen) k.classList.add(`geheugen-kaart--speler${beurt + 1}`);
        toonScore();
        betaal(MUNTEN_GEHEUGEN_PAAR);
      },
      () => {
        betaal(MUNTEN_GEHEUGEN_BORD);
        wacht = () => {
          if (!actief) return;
          wacht = null;
          toonUitslag();
        };
        timer = window.setTimeout(wacht, 600);
      },
      () => {
        beurt = 1 - beurt;
        toonScore();
      },
    ).vernietig;
    oefenContainer.querySelector('.geheugen-bord')?.classList.add('geheugen-bord--groot');
  }

  // Eindkaart bij twee spelers: de beker in de kleur van de winnaar (of twee bij gelijkspel),
  // de stand, en knoppen voor nog een keer of terug naar huis.
  function toonUitslag(): void {
    opruimen?.();
    opruimen = null;
    // De stand staat op de kaart zelf; zo past hij ook op een kleine telefoon.
    scorebord.hidden = true;
    const winnaar = paren[0] === paren[1] ? null : paren[0] > paren[1] ? 1 : 2;
    const kaart = document.createElement('div');
    kaart.className = `oefen-kaart klaar-kaart geheugen-uitslag${winnaar ? ` geheugen-uitslag--${winnaar}` : ''}`;
    kaart.innerHTML = `
      <img class="klaar-kaart__beker" src="assets/icons/trofee.svg" alt="">
      <p class="geheugen-uitslag__tekst">${winnaar ? `Speler ${winnaar} wint!` : 'Gelijkspel!'}</p>
      <div class="geheugen-uitslag__stand">
        <span class="geheugen-uitslag__punt geheugen-uitslag__punt--1">${paren[0]}</span>
        <span>-</span>
        <span class="geheugen-uitslag__punt geheugen-uitslag__punt--2">${paren[1]}</span>
      </div>
      <div class="resultaat-munten-rij"><img src="assets/icons/munt.svg" alt=""><span>+${verdiend} munten</span></div>
      <div class="geheugen-uitslag__knoppen">
        <button class="klaar-kaart__knop geheugen-uitslag__opnieuw" aria-label="Nog een keer"><img src="assets/icons/vangspel-start.svg" alt=""></button>
        <button class="klaar-kaart__knop" aria-label="Klaar, terug"><img src="assets/icons/huis.svg" alt=""></button>
      </div>`;
    const [opnieuw, naarHuis] = kaart.querySelectorAll('button');
    opnieuw.addEventListener('click', tweeSpelersBord);
    naarHuis.addEventListener('click', () => manager.pop());
    oefenContainer.replaceChildren(kaart);
    confetti.vuurwerk('groot');
    events.emit('sessie-klaar', undefined);
  }

  // Groep 3: eerst kiezen met hoeveel je speelt.
  function toonSpelersKeuze(): void {
    instructie.textContent = 'Met hoeveel spelers?';
    const keuze = document.createElement('div');
    keuze.className = 'geheugen-keuze';
    keuze.innerHTML = `
      <button class="geheugen-keuze__knop">
        <span class="geheugen-keuze__poppetjes"><span class="geheugen-poppetje"></span></span>
        <span>1 speler</span>
      </button>
      <button class="geheugen-keuze__knop">
        <span class="geheugen-keuze__poppetjes"><span class="geheugen-poppetje geheugen-poppetje--1"></span><span class="geheugen-poppetje geheugen-poppetje--2"></span></span>
        <span>2 spelers</span>
      </button>`;
    const [een, twee] = keuze.querySelectorAll('button');
    een.addEventListener('click', () => {
      instructie.textContent = 'Zoek de twee plaatjes die bij elkaar horen';
      nieuwBord();
    });
    twee.addEventListener('click', tweeSpelersBord);
    oefenContainer.replaceChildren(keuze);
  }

  if (spelersKeuze) toonSpelersKeuze();
  else nieuwBord();

  const terug = maakTerugKnop(() => {
    opruimen?.();
    manager.pop();
  });
  let topRechts: ReturnType<typeof maakTopRechtsBalk> | null = null;

  return {
    kindslot: true,
    mount(root) {
      root.appendChild(el);
      root.appendChild(terug);
      topRechts = maakTopRechtsBalk(manager);
      root.appendChild(topRechts.element);
      // Terug van een ander scherm (bv. de winkel): het bord is blijven staan, alleen een
      // stap die nog moest komen (nieuw bord, klaar-kaart, uitslag) alsnog doen.
      if (onderbroken) {
        onderbroken = false;
        actief = true;
        if (wacht) timer = window.setTimeout(wacht, 400);
      }
    },
    unmount() {
      // Het bord niet opruimen: het blijft in `el` bewaard tot het kind terugkomt. De
      // terug-knop ruimt het zelf op.
      actief = false;
      onderbroken = true;
      window.clearTimeout(timer);
      el.remove();
      terug.remove();
      topRechts?.element.remove();
      topRechts?.vernietig();
      topRechts = null;
    },
  };
}
