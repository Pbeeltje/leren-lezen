import type { RondeVraag } from '../../ui/screens/RondeScreen.ts';
import { instructieAudioPad } from '../../engine/audioManager.ts';
import { haalGroep } from '../../engine/progressStore.ts';
import { STAAF_KLEUREN, VIJFTONIG, speelDrum, type DrumSoort, type Instrument } from '../../engine/muziek.ts';
import { DRUM_KLEUR, maakDrumstel } from './drumstel.ts';
import { toonFoutFeedback, toonGoedFeedback } from '../../ui/components/FeedbackOverlay.ts';
import { maakInstrumentKnoppen } from '../../ui/components/InstrumentKnoppen.ts';
import { huidigInstrument } from '../../engine/winkel.ts';
import { maakXylofoon } from './xylofoon.ts';
import { geheelTussen } from '../kleuter/hulp.ts';

// Speel na en Ritme. Beide: de app speelt iets voor, het kind doet het na. Fout is niet
// erg: de app speelt het gewoon nog eens voor. Elke vraag een beetje langer, met een
// maximum dat bij de leeftijd past.

const jong = (): boolean => haalGroep() === 'kleuter'; // iets rustiger tempo

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

// Niveaus (kies je vóór het spel, zie MuziekKiesScreen): hoeveel noten of slagen, en op
// hoeveel staven / met welke drums. Binnen een niveau groeit de lengte per vraag van min
// naar max. De eigenaar wil tot 10-12 kunnen gaan ("misschien kan het kind het wel!").
// Het eerste niveau (2-4) heeft een vaste opbouw over de 10 vragen: eerst een paar keer 2,
// het vaakst 3 en aan het eind 4 (verhouding ongeveer 1 : 2 : 1). Kleuters zien alleen de
// eerste twee niveaus (zie niveausVoorGroep).
export const AANTAL_NIVEAUS = 5;
type Niveau = { min: number; max: number; reeks?: number[] };
const BEGIN_REEKS = [2, 2, 2, 3, 3, 3, 3, 3, 4, 4];
const SPEEL_NA_NIVEAUS: (Niveau & { staven: number[]; tussen: number })[] = [
  { min: 2, max: 4, reeks: BEGIN_REEKS, staven: VIJFTONIG, tussen: 0.72 },
  { min: 4, max: 6, staven: [0, 1, 2, 3, 4, 5, 6, 7], tussen: 0.62 },
  { min: 6, max: 8, staven: [0, 1, 2, 3, 4, 5, 6, 7], tussen: 0.58 },
  { min: 8, max: 10, staven: [0, 1, 2, 3, 4, 5, 6, 7], tussen: 0.54 },
  { min: 10, max: 12, staven: [0, 1, 2, 3, 4, 5, 6, 7], tussen: 0.5 },
];
const RITME_NIVEAUS: (Niveau & { drums: DrumSoort[] })[] = [
  { min: 2, max: 4, reeks: BEGIN_REEKS, drums: ['bas', 'snare'] },
  { min: 4, max: 6, drums: ['bas', 'snare', 'bekken'] },
  { min: 6, max: 8, drums: ['bas', 'snare', 'bekken', 'tom'] },
  { min: 8, max: 10, drums: ['bas', 'snare', 'bekken', 'tom', 'crash'] },
  { min: 10, max: 12, drums: ['bas', 'snare', 'bekken', 'tom', 'crash'] },
];
// Wat er op de niveautegel staat: aantal noten/slagen en (bij ritme) de drums.
export const niveauOmschrijving = (spel: 'speel-na' | 'ritme', niveau: number): { min: number; max: number; drums?: DrumSoort[] } =>
  spel === 'speel-na' ? SPEEL_NA_NIVEAUS[niveau - 1] : RITME_NIVEAUS[niveau - 1];

// Vanaf 5 noten speelt Speel na het begin van een echt kinderliedje in plaats van losse
// noten, met het ritme van het liedje erbij. Staven: 0=do (c) 1=re 2=mi 3=fa 4=sol 5=la
// 6=si 7=hoge do. Per noot [staaf, tellen]. Alleen liedjes die binnen die acht staven passen.
type Noot = [staaf: number, tellen: number];
const LIEDJES: Noot[][] = [
  // Altijd is Kortjakje ziek
  [[0, 1], [0, 1], [4, 1], [4, 1], [5, 1], [5, 1], [4, 2], [3, 1], [3, 1], [2, 1], [2, 1], [1, 1], [1, 1], [0, 2]],
  // Vader Jacob
  [[0, 1], [1, 1], [2, 1], [0, 1], [0, 1], [1, 1], [2, 1], [0, 1], [2, 1], [3, 1], [4, 2], [2, 1], [3, 1], [4, 2]],
  // In de maneschijn
  [[0, 1], [0, 1], [0, 1], [1, 1], [2, 2], [1, 2], [0, 1], [2, 1], [1, 1], [1, 1], [0, 2], [0, 1], [0, 1], [0, 1], [1, 1]],
  // Ode an die Freude (Beethoven)
  [[2, 1], [2, 1], [3, 1], [4, 1], [4, 1], [3, 1], [2, 1], [1, 1], [0, 1], [0, 1], [1, 1], [2, 1], [2, 1.5], [1, 0.5], [1, 2]],
  // Mary had a little lamb
  [[2, 1], [1, 1], [0, 1], [1, 1], [2, 1], [2, 1], [2, 2], [1, 1], [1, 1], [1, 2], [2, 1], [4, 1], [4, 2]],
  // Jingle bells (refrein)
  [[2, 1], [2, 1], [2, 2], [2, 1], [2, 1], [2, 2], [2, 1], [4, 1], [0, 1.5], [1, 0.5], [2, 4], [3, 1], [3, 1]],
];
const LIEDJE_VANAF = 5;

// Een melodie van `lengte` noten: het begin van een liedje (een ander dan de vorige keer),
// of bij korte reeksen / weinig staven losse noten die op gelijke afstand klinken.
function maakMelodie(lengte: number, staven: number[], vorigLiedje: number): { noten: Noot[]; liedje: number } {
  if (lengte >= LIEDJE_VANAF && staven.length === 8) {
    const passend = LIEDJES.map((_, i) => i).filter((i) => LIEDJES[i].length >= lengte && i !== vorigLiedje);
    const liedje = passend[geheelTussen(0, passend.length - 1)];
    return { noten: LIEDJES[liedje].slice(0, lengte), liedje };
  }
  const noten: Noot[] = [];
  while (noten.length < lengte) {
    const p = geheelTussen(0, staven.length - 1);
    if (p !== noten[noten.length - 1]?.[0]) noten.push([p, 1]);
  }
  return { noten, liedje: -1 };
}

const lengteVoor = (n: Niveau, vraag: number): number =>
  n.reeks ? n.reeks[Math.min(vraag, n.reeks.length - 1)] : n.min + Math.round(((n.max - n.min) * Math.min(vraag, 9)) / 9);

// Welke niveaus een kind kan kiezen: kleuters alleen 2-4 en 4-6, groep 3 alles.
export const niveausVoorGroep = (): number[] =>
  haalGroep() === 'kleuter' ? [1, 2] : Array.from({ length: AANTAL_NIVEAUS }, (_, i) => i + 1);

// Nieuwe teller per keer dat het spel opent, zodat het weer kort begint. Rechtsboven in de
// kaart kies je het instrument; naarWinkel opent de instrumenten in de winkel.
export function maakSpeelNaVragen(niveau: number, naarWinkel: (koop?: Instrument) => void): () => RondeVraag {
  const instelling = SPEEL_NA_NIVEAUS[Math.max(0, Math.min(AANTAL_NIVEAUS, niveau) - 1)];
  const staven = instelling.staven;
  let nummer = 0;
  let vorigLiedje = -1;
  return () => {
    const lengte = lengteVoor(instelling, nummer++);
    const { noten, liedje } = maakMelodie(lengte, staven, vorigLiedje);
    if (liedje >= 0) vorigLiedje = liedje;
    const melodie = noten.map(([p]) => p);
    return {
      instructie: 'Luister goed en speel het na',
      audioPad: instructieAudioPad('muziek-speel-na'),
      instructieElkeVraag: false,
      render(container, afgerond) {
        const kaart = document.createElement('div');
        kaart.className = 'oefen-kaart muziek-kaart';
        // Zelfde stippen als bij ritme: witte vulling, rand in de kleur van de staaf,
        // vulling als de noot klinkt of goed is. Zo zie je welke noot er komt.
        const stippen = document.createElement('div');
        stippen.className = 'muziek-stippen muziek-stippen--ritme';
        // Een lange noot krijgt meer ruimte achter zijn stip, een korte minder, zodat je
        // ook het ritme van het liedje ziet (jin-gle bells, jin-gle bells).
        noten.forEach(([p, tellen], i) => {
          const stip = document.createElement('span');
          stip.style.setProperty('--drum', STAAF_KLEUREN[staven[p]]);
          if (i < noten.length - 1 && tellen !== 1) stip.style.marginRight = `${Math.round((tellen - 1) * 18)}px`;
          stippen.appendChild(stip);
        });
        let gespeeld = 0;
        let timers: number[] = [];
        let klaar = false;

        const xylo = maakXylofoon(staven, (positie) => {
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
        }, huidigInstrument());

        const kiezer = maakInstrumentKnoppen((instrument) => {
          xylo.zetInstrument(instrument);
          kiezer.ververs(instrument);
        }, naarWinkel);
        kiezer.ververs(huidigInstrument());
        const kiesRij = document.createElement('div');
        kiesRij.className = 'muziek-instrumenten';
        kiesRij.append(...kiezer.knoppen, kiezer.winkel);

        function voorspelen(): void {
          for (const t of timers) window.clearTimeout(t);
          timers = [];
          gespeeld = 0;
          for (const s of stippen.children) s.classList.remove('muziek-stip--goed', 'muziek-stip--voor');
          xylo.zetActief(false);
          // Een tel duurt `tussen` seconden; liedjes hebben ook langere en kortere noten.
          const tussen = instelling.tussen + (jong() ? 0.1 : 0);
          let t = 0.5;
          noten.forEach(([p, tellen], i) => {
            xylo.speel(p, t);
            const nu = t;
            timers.push(window.setTimeout(() => {
              xylo.licht(p);
              stippen.children[i].classList.add('muziek-stip--voor');
            }, nu * 1000));
            t += tellen * tussen;
          });
          const laatste = noten[noten.length - 1][1];
          timers.push(window.setTimeout(() => {
            for (const s of stippen.children) s.classList.remove('muziek-stip--voor');
            xylo.zetActief(true);
          }, (t - (laatste - 1) * tussen) * 1000));
        }

        kaart.append(knopNogEens(voorspelen), kiesRij, stippen, xylo.element);
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
// niet; zo hoor je bv. dubbel-enkel-dubbel. Het niveau bepaalt hoeveel slagen en welke
// drums: grote trom + snare, vanaf niveau 2 het bekken, vanaf 3 de tom, vanaf 4 de crash.
type Figuur = 'ta' | 'titi';
type Ritme = ('K' | 'L')[]; // tussenpozen tussen de slagen: kort of lang
interface Slag {
  drum: DrumSoort;
  figuur: number;
}

const KORT = 0.24;
const LANG = 0.72;

// Een willekeurige rij ta's en ti-ti's met precies `slagen` tikken. Vanaf 3 tikken zitten
// er altijd allebei in (anders is het geen ritme), en nooit drie keer hetzelfde achter
// elkaar, zodat je de afwisseling goed hoort.
function maakFiguren(slagen: number, vorige?: string): Figuur[] {
  for (let poging = 0; poging < 200; poging++) {
    const figuren: Figuur[] = [];
    let over = slagen;
    while (over > 0) {
      const f: Figuur = over >= 2 && Math.random() < 0.45 ? 'titi' : 'ta';
      figuren.push(f);
      over -= f === 'titi' ? 2 : 1;
    }
    const drieGelijk = figuren.some((f, i) => i >= 2 && f === figuren[i - 1] && f === figuren[i - 2]);
    const gemengd = slagen < 3 || (figuren.includes('ta') && figuren.includes('titi'));
    if (gemengd && !drieGelijk && figuren.join() !== vorige) return figuren;
  }
  return Array.from({ length: slagen }, () => 'ta' as Figuur);
}

// Vanaf 5 slagen een echte beat, net als Speel na vanaf 5 noten een liedje pakt: een
// vaste lijst grooves, om de beurt, nooit twee keer dezelfde achter elkaar. Elke groove
// gebruikt precies de drums van het niveau (kleuters blijven bij bas/snare/bekken).
// Korte vragen blijven losse ta/ti-ti via maakFiguren.
const GROOVE_VANAF = 5;
const tikken = (f: Figuur[]): number => f.reduce((n, x) => n + (x === 'titi' ? 2 : 1), 0);

interface Groove {
  maat: { f: Figuur; drum: DrumSoort }[];
}
// Eén maat, herhaald tot de vraag vol is. Alle drums van die maat zitten in de eerste
// cyclus, en die cyclus is kort genoeg voor de kortste groovenvraag van dat niveau.
const GROOVES: Groove[] = [
  // Niveau 2 (bas, snare, bekken). De eerste is de oude boem-titi met bekken op het eind.
  { maat: [{ f: 'ta', drum: 'bas' }, { f: 'titi', drum: 'snare' }, { f: 'ta', drum: 'bekken' }] },
  { maat: [{ f: 'titi', drum: 'bas' }, { f: 'ta', drum: 'snare' }, { f: 'ta', drum: 'bekken' }] }, // stomp stomp clap
  { maat: [{ f: 'ta', drum: 'bas' }, { f: 'ta', drum: 'snare' }, { f: 'ta', drum: 'bas' }, { f: 'ta', drum: 'bekken' }] },
  { maat: [{ f: 'ta', drum: 'bas' }, { f: 'ta', drum: 'snare' }, { f: 'ta', drum: 'bekken' }] }, // wals
  { maat: [{ f: 'ta', drum: 'bas' }, { f: 'ta', drum: 'bekken' }, { f: 'ta', drum: 'snare' }, { f: 'ta', drum: 'bekken' }] },
  { maat: [{ f: 'titi', drum: 'bas' }, { f: 'ta', drum: 'bekken' }, { f: 'ta', drum: 'snare' }] },
  // Niveau 3: de tom erbij.
  { maat: [{ f: 'ta', drum: 'bas' }, { f: 'ta', drum: 'tom' }, { f: 'ta', drum: 'snare' }, { f: 'ta', drum: 'bekken' }] },
  { maat: [{ f: 'titi', drum: 'tom' }, { f: 'ta', drum: 'snare' }, { f: 'ta', drum: 'bas' }, { f: 'ta', drum: 'bekken' }] },
  { maat: [{ f: 'ta', drum: 'bas' }, { f: 'ta', drum: 'snare' }, { f: 'titi', drum: 'tom' }, { f: 'ta', drum: 'bekken' }] },
  { maat: [{ f: 'ta', drum: 'bas' }, { f: 'ta', drum: 'bekken' }, { f: 'ta', drum: 'tom' }, { f: 'ta', drum: 'snare' }] },
  { maat: [{ f: 'titi', drum: 'bas' }, { f: 'ta', drum: 'snare' }, { f: 'ta', drum: 'tom' }, { f: 'ta', drum: 'bekken' }] },
  { maat: [{ f: 'ta', drum: 'bas' }, { f: 'ta', drum: 'tom' }, { f: 'ta', drum: 'snare' }, { f: 'ta', drum: 'tom' }, { f: 'ta', drum: 'bekken' }] },
  // Niveau 4 en 5: ook de crash.
  { maat: [{ f: 'ta', drum: 'crash' }, { f: 'ta', drum: 'bas' }, { f: 'ta', drum: 'snare' }, { f: 'ta', drum: 'tom' }, { f: 'ta', drum: 'bekken' }] },
  { maat: [{ f: 'ta', drum: 'bas' }, { f: 'ta', drum: 'snare' }, { f: 'ta', drum: 'bas' }, { f: 'ta', drum: 'tom' }, { f: 'ta', drum: 'bekken' }, { f: 'ta', drum: 'crash' }] },
  { maat: [{ f: 'titi', drum: 'bas' }, { f: 'ta', drum: 'snare' }, { f: 'ta', drum: 'tom' }, { f: 'ta', drum: 'bekken' }, { f: 'ta', drum: 'crash' }] },
  { maat: [{ f: 'ta', drum: 'bas' }, { f: 'ta', drum: 'snare' }, { f: 'ta', drum: 'bekken' }, { f: 'titi', drum: 'tom' }, { f: 'ta', drum: 'crash' }] },
  { maat: [{ f: 'ta', drum: 'bas' }, { f: 'ta', drum: 'crash' }, { f: 'ta', drum: 'snare' }, { f: 'ta', drum: 'crash' }, { f: 'ta', drum: 'tom' }, { f: 'ta', drum: 'bekken' }] },
  { maat: [{ f: 'ta', drum: 'bas' }, { f: 'ta', drum: 'tom' }, { f: 'ta', drum: 'snare' }, { f: 'ta', drum: 'tom' }, { f: 'ta', drum: 'bekken' }, { f: 'ta', drum: 'crash' }] },
];

function vulGroove(maat: Groove['maat'], slagen: number): { figuren: Figuur[]; drums: DrumSoort[] } {
  const figuren: Figuur[] = [];
  const toegewezen: DrumSoort[] = [];
  let i = 0;
  while (tikken(figuren) < slagen) {
    const stap = maat[i % maat.length];
    const kost = stap.f === 'titi' ? 2 : 1;
    if (tikken(figuren) + kost > slagen) {
      figuren.push('ta');
      toegewezen.push(stap.drum);
      break;
    }
    figuren.push(stap.f);
    toegewezen.push(stap.drum);
    i++;
  }
  return { figuren, drums: toegewezen };
}

function kiesGroove(slagen: number, drums: DrumSoort[], beurt: number): { figuren: Figuur[]; drums: DrumSoort[] } | null {
  const past = GROOVES.filter((g) => {
    const gebr = new Set(g.maat.map((s) => s.drum));
    return gebr.size === drums.length && drums.every((d) => gebr.has(d));
  });
  if (!past.length) return null;
  return vulGroove(past[beurt % past.length].maat, slagen);
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

function maakSlagen(figuren: Figuur[], drums: DrumSoort[], vast?: DrumSoort[]): Slag[] {
  const toegewezen = vast ?? verdeelDrums(figuren, drums);
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

export function maakRitmeVragen(niveau = 1): () => RondeVraag {
  const instelling = RITME_NIVEAUS[Math.max(0, Math.min(AANTAL_NIVEAUS, niveau) - 1)];
  const drums = instelling.drums;
  let nummer = 0;
  let vorige: string | undefined;
  let grooveBeurt = 0;
  return () => {
    const dit = nummer++;
    const aantal = lengteVoor(instelling, dit);
    const groove = aantal >= GROOVE_VANAF ? kiesGroove(aantal, drums, grooveBeurt) : null;
    if (groove) grooveBeurt++;
    const figuren = groove?.figuren ?? maakFiguren(aantal, vorige);
    vorige = figuren.join();
    const slagen = maakSlagen(figuren, drums, groove?.drums);
    const ritme = tussenpozen(slagen);
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
        // Geen losse voorstelronde: meteen het ritme, na de instructie op vraag 1.
        // Tikken telt pas als `voorspelen` `luisteren` aanzet.
        timers.push(window.setTimeout(voorspelen, dit === 0 ? 1800 : 600));
        return () => {
          for (const t of timers) window.clearTimeout(t);
          window.clearTimeout(wachtTimer);
          kit.opruimen();
          kaart.remove();
        };
      },
    };
  };
}
