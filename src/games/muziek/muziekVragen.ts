import type { RondeVraag } from '../../ui/screens/RondeScreen.ts';
import { instructieAudioPad } from '../../engine/audioManager.ts';
import { haalVoortgang } from '../../engine/progressStore.ts';
import { TONEN, VIJFTONIG, speelNoot, speelTrom } from '../../engine/muziek.ts';
import { toonFoutFeedback, toonGoedFeedback } from '../../ui/components/FeedbackOverlay.ts';
import { maakXylofoon } from './xylofoon.ts';
import { geheelTussen } from '../kleuter/hulp.ts';

// Speel na en Ritme. Beide: de app speelt iets voor, het kind doet het na. Fout is niet
// erg: de app speelt het gewoon nog eens voor. Elke vraag een beetje langer, met een
// maximum dat bij de leeftijd past.

const jong = (): boolean => (haalVoortgang().laatstGekozenLeeftijd ?? 6) <= 4;

function knopNogEens(opnieuw: () => void): HTMLButtonElement {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'muziek-nog-eens';
  b.setAttribute('aria-label', 'Nog een keer luisteren');
  const img = document.createElement('img');
  img.src = 'assets/icons/luisteren.svg';
  img.alt = '';
  b.appendChild(img);
  b.addEventListener('click', opnieuw);
  return b;
}

// Nieuwe teller per keer dat het spel opent, zodat het weer kort begint.
export function maakSpeelNaVragen(): () => RondeVraag {
  let nummer = 0;
  return () => {
    const max = jong() ? 3 : 5;
    const lengte = Math.min(max, 2 + Math.floor(nummer++ / 3));
    const melodie: number[] = [];
    while (melodie.length < lengte) {
      const p = geheelTussen(0, VIJFTONIG.length - 1);
      if (p !== melodie[melodie.length - 1]) melodie.push(p);
    }
    return {
      instructie: 'Luister goed en speel het na',
      audioPad: instructieAudioPad('muziek-speel-na'),
      instructieElkeVraag: false,
      render(container, afgerond) {
        const kaart = document.createElement('div');
        kaart.className = 'oefen-kaart muziek-kaart';
        const stippen = document.createElement('div');
        stippen.className = 'muziek-stippen';
        for (let i = 0; i < lengte; i++) stippen.appendChild(document.createElement('span'));
        let gespeeld = 0;
        let timers: number[] = [];
        let klaar = false;

        const xylo = maakXylofoon(VIJFTONIG, (positie) => {
          if (klaar) return;
          if (positie === melodie[gespeeld]) {
            stippen.children[gespeeld].classList.add('muziek-stip--goed');
            gespeeld++;
            if (gespeeld === lengte) {
              klaar = true;
              xylo.zetActief(false);
              timers.push(window.setTimeout(() => { toonGoedFeedback(); afgerond(); }, 500));
            }
          } else {
            xylo.zetActief(false);
            toonFoutFeedback();
            timers.push(window.setTimeout(voorspelen, 1300));
          }
        });

        function voorspelen(): void {
          for (const t of timers) window.clearTimeout(t);
          timers = [];
          gespeeld = 0;
          for (const s of stippen.children) s.classList.remove('muziek-stip--goed');
          xylo.zetActief(false);
          const tussen = jong() ? 0.75 : 0.6;
          melodie.forEach((p, i) => {
            speelNoot(TONEN[VIJFTONIG[p]], 0.5 + i * tussen);
            timers.push(window.setTimeout(() => xylo.licht(p), (0.5 + i * tussen) * 1000));
          });
          timers.push(window.setTimeout(() => xylo.zetActief(true), (0.5 + lengte * tussen) * 1000));
        }

        kaart.append(knopNogEens(voorspelen), stippen, xylo.element);
        container.appendChild(kaart);
        // Eerst de instructie laten horen, dan pas voorspelen.
        timers.push(window.setTimeout(voorspelen, nummer === 1 ? 1800 : 600));
        return () => {
          for (const t of timers) window.clearTimeout(t);
          xylo.opruimen();
          kaart.remove();
        };
      },
    };
  };
}

// Een ritme is een rij tussenpozen tussen de slagen: kort (K, "ti") of lang (L, "ta").
// Het verschil is ruim (bijna 3x), zodat het goed te horen is.
type Ritme = ('K' | 'L')[];
const KORT = 0.28;
const LANG = 0.78;

// Bekende kinderritmes uit de muziekles (ta = lange tel, ti-ti = twee snelle), als
// tussenpozen. Elk ritme mengt snel en langzaam: de eigenaar merkte dat Ritme anders
// "geen ritme" had, alleen 3 of 4 gelijke slagen.
const RITMES: Record<number, Ritme[]> = {
  3: [['K', 'L'], ['L', 'K']], // ti-ti ta / ta ti-ti
  4: [['L', 'K', 'K'], ['K', 'K', 'L'], ['K', 'L', 'K'], ['L', 'L', 'K']], // ta ti-ti ta / ti-ti ta ta ...
  5: [['L', 'L', 'K', 'K'], ['K', 'K', 'L', 'K'], ['L', 'K', 'K', 'L'], ['K', 'L', 'K', 'K'], ['K', 'K', 'K', 'L']],
};

function maakRitme(slagen: number, vorige?: Ritme): Ritme {
  if (slagen <= 2) return ['K'];
  const keuzes = RITMES[slagen].filter((r) => r.join('') !== vorige?.join(''));
  return keuzes[geheelTussen(0, keuzes.length - 1)];
}

// Klopt het nagetrommelde ritme? Altijd het aantal slagen; bij een ritme met lange en
// korte pauzes ook de volgorde, ruim beoordeeld: per tussenpoos kijken of hij dichter
// bij de korte of de lange tussenpozen van het kind zelf ligt.
export function ritmeKlopt(ritme: Ritme, tijden: number[]): boolean {
  if (tijden.length !== ritme.length + 1) return false;
  if (!ritme.includes('L') || !ritme.includes('K')) return true;
  const tussen = tijden.slice(1).map((t, i) => t - tijden[i]);
  const min = Math.min(...tussen);
  const max = Math.max(...tussen);
  if (max < min * 1.4) return false; // alles even snel, terwijl er een lange pauze in zat
  const grens = Math.sqrt(min * max);
  return tussen.every((d, i) => (d > grens ? 'L' : 'K') === ritme[i]);
}

export function maakRitmeVragen(): () => RondeVraag {
  let nummer = 0;
  let vorige: Ritme | undefined;
  return () => {
    // Eerst twee keer simpel twee slagen, daarna altijd een echt ritme met snel en
    // langzaam: 3 slagen, dan 4, en vanaf 5 jaar ook 5.
    const slagen = Math.min(jong() ? 4 : 5, nummer < 2 ? 2 : 3 + Math.floor((nummer - 2) / 3));
    nummer++;
    const ritme = maakRitme(slagen, vorige);
    vorige = ritme;
    return {
      instructie: 'Luister en trommel het na',
      audioPad: instructieAudioPad('muziek-ritme'),
      instructieElkeVraag: false,
      render(container, afgerond) {
        const kaart = document.createElement('div');
        kaart.className = 'oefen-kaart muziek-kaart';
        const stippen = document.createElement('div');
        stippen.className = 'muziek-stippen';
        for (let i = 0; i < slagen; i++) stippen.appendChild(document.createElement('span'));
        const trom = document.createElement('button');
        trom.type = 'button';
        trom.className = 'muziek-trom';
        trom.setAttribute('aria-label', 'trommel');
        const img = document.createElement('img');
        img.src = 'assets/icons/trommel.svg';
        img.alt = '';
        img.draggable = false;
        trom.appendChild(img);
        trom.addEventListener('animationend', () => trom.classList.remove('muziek-trom--bonk'));

        let timers: number[] = [];
        let luisteren = false;
        let tijden: number[] = [];
        let wachtTimer: number | undefined;
        let klaar = false;

        const bonk = (): void => {
          trom.classList.remove('muziek-trom--bonk');
          void trom.offsetWidth;
          trom.classList.add('muziek-trom--bonk');
        };

        function beoordeel(): void {
          window.clearTimeout(wachtTimer);
          luisteren = false;
          if (ritmeKlopt(ritme, tijden)) {
            klaar = true;
            timers.push(window.setTimeout(() => { toonGoedFeedback(); afgerond(); }, 400));
          } else {
            toonFoutFeedback();
            timers.push(window.setTimeout(voorspelen, 1400));
          }
        }

        trom.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          if (klaar) return;
          speelTrom();
          bonk();
          if (!luisteren) return;
          tijden.push(performance.now() / 1000);
          stippen.children[tijden.length - 1]?.classList.add('muziek-stip--goed');
          window.clearTimeout(wachtTimer);
          if (tijden.length >= slagen) timers.push(window.setTimeout(beoordeel, 250));
          else wachtTimer = window.setTimeout(beoordeel, 2200); // gestopt met trommelen
        });

        function voorspelen(): void {
          for (const t of timers) window.clearTimeout(t);
          window.clearTimeout(wachtTimer);
          timers = [];
          tijden = [];
          luisteren = false;
          for (const s of stippen.children) s.classList.remove('muziek-stip--goed');
          trom.classList.add('muziek-trom--voor');
          let t = 0.5;
          const momenten = [t];
          for (const r of ritme) momenten.push((t += r === 'L' ? LANG : KORT));
          for (const m of momenten) {
            speelTrom(m);
            timers.push(window.setTimeout(bonk, m * 1000));
          }
          timers.push(
            window.setTimeout(() => {
              trom.classList.remove('muziek-trom--voor');
              luisteren = true;
            }, (t + 0.35) * 1000),
          );
        }

        kaart.append(knopNogEens(voorspelen), stippen, trom);
        container.appendChild(kaart);
        timers.push(window.setTimeout(voorspelen, nummer === 1 ? 1800 : 600));
        return () => {
          for (const t of timers) window.clearTimeout(t);
          window.clearTimeout(wachtTimer);
          kaart.remove();
        };
      },
    };
  };
}
