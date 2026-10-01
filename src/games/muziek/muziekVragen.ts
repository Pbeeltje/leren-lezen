import type { RondeVraag } from '../../ui/screens/RondeScreen.ts';
import { instructieAudioPad } from '../../engine/audioManager.ts';
import { haalVoortgang } from '../../engine/progressStore.ts';
import { TONEN, VIJFTONIG, speelDrum, speelNoot, type DrumSoort } from '../../engine/muziek.ts';
import { DRUM_KLEUR, maakDrumstel } from './drumstel.ts';
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

// Ritme op een drumstel. Een ritme is een rij figuren: "ta" (één tik) of "ti-ti" (twee
// snelle tikken, een dubbele tik). Tussen figuren zit een duidelijke pauze, binnen ti-ti
// niet; zo hoor je bv. dubbel-enkel-dubbel. Eerst alleen de grote trom; na 3 oefeningen
// komt de snaredrum erbij, na nog 3 het bekken (verzoek van de eigenaar).
type Figuur = 'ta' | 'titi';
type Ritme = ('K' | 'L')[]; // tussenpozen tussen de slagen: kort of lang
interface Slag {
  drum: DrumSoort;
  figuur: number;
}

const KORT = 0.24;
const LANG = 0.72;

const FIGUREN: Figuur[][][] = [
  [['ta', 'ta']], // 1: simpel
  [['titi', 'ta'], ['ta', 'titi']], // 2-3
  [['ta', 'ta', 'titi'], ['titi', 'ta', 'ta'], ['ta', 'titi', 'ta'], ['titi', 'titi']], // 4-6
  [['titi', 'ta', 'titi'], ['ta', 'ta', 'titi', 'ta'], ['titi', 'titi', 'ta'], ['ta', 'titi', 'ta', 'ta'], ['ta', 'titi', 'titi']], // 7+
];

function drumsVoor(nummer: number): DrumSoort[] {
  if (nummer < 3) return ['bas'];
  if (nummer < 6) return ['bas', 'snare'];
  return ['bas', 'snare', 'bekken'];
}

const slagenIn = (f: Figuur[]): number => f.reduce((n, x) => n + (x === 'titi' ? 2 : 1), 0);

function kiesFiguren(nummer: number, maxSlagen: number, vorige?: string): Figuur[] {
  const groep = FIGUREN[nummer === 0 ? 0 : nummer < 3 ? 1 : nummer < 6 ? 2 : 3];
  let keuzes = groep.filter((f) => slagenIn(f) <= maxSlagen && f.join() !== vorige);
  if (!keuzes.length) keuzes = groep.filter((f) => slagenIn(f) <= maxSlagen);
  if (!keuzes.length) keuzes = FIGUREN[2].filter((f) => slagenIn(f) <= maxSlagen && f.join() !== vorige);
  return keuzes[geheelTussen(0, keuzes.length - 1)];
}

// Elke figuur krijgt één drum. De nieuwste drum komt er altijd in voor, en als er genoeg
// figuren zijn doen alle drums mee.
function verdeelDrums(figuren: Figuur[], drums: DrumSoort[]): DrumSoort[] {
  for (let poging = 0; poging < 50; poging++) {
    const toegewezen = figuren.map(() => drums[geheelTussen(0, drums.length - 1)]);
    const nodig = drums.length <= figuren.length ? drums : [drums[drums.length - 1]];
    if (nodig.every((d) => toegewezen.includes(d))) return toegewezen;
  }
  return figuren.map((_, i) => drums[(drums.length - 1 + i) % drums.length]);
}

function maakSlagen(figuren: Figuur[], drums: DrumSoort[]): Slag[] {
  const toegewezen = verdeelDrums(figuren, drums);
  const slagen: Slag[] = [];
  figuren.forEach((f, i) => {
    for (let k = 0; k < (f === 'titi' ? 2 : 1); k++) slagen.push({ drum: toegewezen[i], figuur: i });
  });
  return slagen;
}

const tussenpozen = (slagen: Slag[]): Ritme =>
  slagen.slice(1).map((s, i) => (s.figuur === slagen[i].figuur ? 'K' : 'L'));

// Klopt het nagetrommelde ritme? Altijd het aantal slagen; bij een ritme met lange en
// korte pauzes ook de volgorde, ruim beoordeeld: per tussenpoos kijken of hij dichter
// bij de korte of de lange tussenpozen van het kind zelf ligt (tempo maakt niet uit).
export function ritmeKlopt(ritme: Ritme, tijden: number[]): boolean {
  if (tijden.length !== ritme.length + 1) return false;
  if (!ritme.includes('L') || !ritme.includes('K')) return true;
  const tussen = tijden.slice(1).map((t, i) => t - tijden[i]);
  const min = Math.min(...tussen);
  const max = Math.max(...tussen);
  if (max < min * 1.4) return false; // alles even snel, terwijl er een pauze in zat
  const grens = Math.sqrt(min * max);
  return tussen.every((d, i) => (d > grens ? 'L' : 'K') === ritme[i]);
}

export function maakRitmeVragen(): () => RondeVraag {
  let nummer = 0;
  let vorige: string | undefined;
  return () => {
    const dit = nummer++;
    const figuren = kiesFiguren(dit, jong() ? 4 : 5, vorige);
    vorige = figuren.join();
    const drums = drumsVoor(dit);
    const slagen = maakSlagen(figuren, drums);
    const ritme = tussenpozen(slagen);
    const nieuweDrum: DrumSoort | undefined = dit === 3 ? 'snare' : dit === 6 ? 'bekken' : undefined;
    return {
      instructie: 'Luister en trommel het na',
      audioPad: instructieAudioPad('muziek-ritme'),
      instructieElkeVraag: false,
      render(container, afgerond) {
        const kaart = document.createElement('div');
        kaart.className = 'oefen-kaart muziek-kaart';
        // Stippen per figuur gegroepeerd: ti-ti staan dicht bij elkaar, net als bij het
        // klappen. De rand heeft de kleur van de drum, zodat je ziet welke er komt.
        const stippen = document.createElement('div');
        stippen.className = 'muziek-stippen muziek-stippen--ritme';
        const stipEls: HTMLElement[] = [];
        let groep: HTMLElement = document.createElement('div');
        slagen.forEach((s, i) => {
          if (i === 0 || s.figuur !== slagen[i - 1].figuur) {
            groep = document.createElement('div');
            groep.className = 'muziek-figuur';
            stippen.appendChild(groep);
          }
          const stip = document.createElement('span');
          stip.style.setProperty('--drum', DRUM_KLEUR[s.drum]);
          groep.appendChild(stip);
          stipEls.push(stip);
        });

        let timers: number[] = [];
        let luisteren = false;
        let tijden: number[] = [];
        let wachtTimer: number | undefined;
        let klaar = false;

        const kit = maakDrumstel(
          drums,
          (drum) => {
            if (!luisteren || klaar) return;
            const i = tijden.length;
            tijden.push(performance.now() / 1000);
            if (drum !== slagen[i].drum) {
              fout(); // verkeerde trom
              return;
            }
            stipEls[i].classList.add('muziek-stip--goed');
            window.clearTimeout(wachtTimer);
            if (tijden.length >= slagen.length) timers.push(window.setTimeout(beoordeel, 250));
            else wachtTimer = window.setTimeout(beoordeel, 2200); // gestopt met trommelen
          },
          nieuweDrum,
        );

        function fout(): void {
          window.clearTimeout(wachtTimer);
          luisteren = false;
          kit.zetActief(false);
          toonFoutFeedback();
          timers.push(window.setTimeout(voorspelen, 1400));
        }

        function beoordeel(): void {
          window.clearTimeout(wachtTimer);
          if (!ritmeKlopt(ritme, tijden)) {
            fout();
            return;
          }
          luisteren = false;
          klaar = true;
          timers.push(
            window.setTimeout(() => {
              toonGoedFeedback();
              afgerond();
            }, 400),
          );
        }

        function voorspelen(): void {
          for (const t of timers) window.clearTimeout(t);
          window.clearTimeout(wachtTimer);
          timers = [];
          tijden = [];
          luisteren = false;
          kit.zetActief(false);
          for (const s of stipEls) s.classList.remove('muziek-stip--goed', 'muziek-stip--voor');
          let t = 0.5;
          slagen.forEach((s, i) => {
            if (i > 0) t += ritme[i - 1] === 'L' ? LANG : KORT;
            speelDrum(s.drum, t);
            timers.push(
              window.setTimeout(() => {
                kit.licht(s.drum);
                stipEls[i].classList.add('muziek-stip--voor');
              }, t * 1000),
            );
          });
          timers.push(
            window.setTimeout(() => {
              for (const s of stipEls) s.classList.remove('muziek-stip--voor');
              kit.zetActief(true);
              luisteren = true;
            }, (t + 0.45) * 1000),
          );
        }

        kaart.append(knopNogEens(voorspelen), stippen, kit.element);
        container.appendChild(kaart);
        // Een nieuwe drum eerst even alleen laten horen, dan pas het ritme.
        const start = dit === 0 ? 1800 : 600;
        if (nieuweDrum) {
          timers.push(
            window.setTimeout(() => {
              speelDrum(nieuweDrum);
              kit.licht(nieuweDrum);
            }, start),
          );
        }
        timers.push(window.setTimeout(voorspelen, start + (nieuweDrum ? 1100 : 0)));
        return () => {
          for (const t of timers) window.clearTimeout(t);
          window.clearTimeout(wachtTimer);
          kaart.remove();
        };
      },
    };
  };
}
