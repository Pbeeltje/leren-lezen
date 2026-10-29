import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { haalDagplan, isOnaf, neemDagBonus, MUNTEN_DAGPLAN, type Taak } from '../../engine/dagplan.ts';
import { haalGroep, voegMuntenToe, zetLaatsteKern } from '../../engine/progressStore.ts';
import { leesKernen, rekenKernen } from '../../engine/leeftijdGrens.ts';
import { kleuterFactor } from '../../engine/rewards.ts';
import { plaatjeVan } from '../../engine/luisterenGenerator.ts';
import { LUISTER_HOOFDSTUKKEN } from '../../content/luisteren/hoofdstukken.ts';
import { RONDE_ACTIVITEITEN } from '../../games/rondeActiviteiten.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { maakTopRechtsBalk } from '../components/TopRechtsBalk.ts';
import { speelSchermOvergang } from '../../three/transitions.ts';
import { confetti } from '../../three/particles.ts';
import { OefeningScreen } from './OefeningScreen.ts';
import { RekenOefeningScreen } from './RekenOefeningScreen.ts';
import { RondeScreen } from './RondeScreen.ts';
import { LuisterenScreen } from './LuisterenScreen.ts';
import { TopicSelectScreen } from './TopicSelectScreen.ts';
import { GroepKiesScreen } from './GroepKiesScreen.ts';
import '../../styles/vandaag.css';

interface Kaart {
  icoon: string;
  vak: string;
  detail: string;
  open: ((m: ScreenManager) => Screen) | null; // null: hoort niet meer bij de inhoud
}

// Wat er op een kaart staat en welk scherm hij opent.
function kaartVan(taak: Taak): Kaart {
  const naVandaag = (m: ScreenManager): Screen => VandaagScreen(m);
  const oefenTekst = (modus: 'oefenen' | 'toets', nummer: number): string =>
    modus === 'toets' ? 'Toets' : `Oefening ${nummer}`;
  if (taak.soort === 'lezen') {
    const kern = leesKernen().find((k) => k.id === taak.kernId);
    return {
      icoon: 'assets/icons/boek.svg',
      vak: haalGroep() === 'kleuter' ? 'Letters' : 'Lezen',
      detail: kern ? `Hoofdstuk ${kern.volgnummer} · ${oefenTekst(taak.modus, taak.nummer)}` : '',
      open: kern
        ? (m) => {
            zetLaatsteKern('lezen', kern.id);
            return OefeningScreen(m, kern, taak.modus, () => {}, taak.nummer, naVandaag);
          }
        : null,
    };
  }
  if (taak.soort === 'tellen') {
    const kern = rekenKernen().find((k) => k.id === taak.kernId);
    return {
      icoon: 'assets/icons/tellen.svg',
      vak: 'Tellen',
      detail: kern ? `Hoofdstuk ${kern.volgnummer} · ${oefenTekst(taak.modus, taak.nummer)}` : '',
      open: kern
        ? (m) => {
            zetLaatsteKern('tellen', kern.id);
            return RekenOefeningScreen(m, kern, taak.modus, () => {}, taak.nummer, naVandaag);
          }
        : null,
    };
  }
  if (taak.soort === 'ronde') {
    const spel = RONDE_ACTIVITEITEN[taak.id];
    return {
      icoon: `assets/icons/${spel.icoon}.svg`,
      vak: taak.id.startsWith('schrijven-') ? 'Schrijven' : 'Ontdekken',
      detail: spel.titel,
      open: (m) => RondeScreen(m, spel.titel, spel.maakVraag, undefined, taak.id),
    };
  }
  const hoofdstukId = taak.soort === 'luisteren' ? taak.hoofdstukId : '';
  const hoofdstuk = LUISTER_HOOFDSTUKKEN.find((h) => h.id === hoofdstukId);
  return {
    icoon: (hoofdstuk && (hoofdstuk.plaatjes?.[hoofdstuk.icoonWoord] ?? plaatjeVan(hoofdstuk.icoonWoord))) || 'assets/icons/luisteren.svg',
    vak: 'Luisteren',
    detail: hoofdstuk?.titel ?? '',
    open: hoofdstuk ? (m) => LuisterenScreen(m, hoofdstuk) : null,
  };
}

// "Vandaag": de drie oefeningen die engine/dagplan.ts voor dit kind koos. Een afgemaakte
// kaart krijgt een vinkje; zijn alle drie af, dan een beker en één keer extra munten.
export function VandaagScreen(manager: ScreenManager): Screen {
  const el = document.createElement('div');
  el.className = 'scherm';

  const titel = document.createElement('h1');
  titel.className = 'scherm-titel';
  titel.textContent = 'Vandaag';
  el.appendChild(titel);

  const kaarten = document.createElement('div');
  kaarten.className = 'vandaag-kaarten';
  el.appendChild(kaarten);

  const klaarRij = document.createElement('div');
  klaarRij.className = 'vandaag-klaar';
  klaarRij.hidden = true;
  const beker = document.createElement('img');
  beker.src = 'assets/icons/trofee.svg';
  beker.alt = '';
  klaarRij.appendChild(beker);
  const klaarTekst = document.createElement('span');
  klaarTekst.textContent = 'Alles af voor vandaag!';
  klaarRij.appendChild(klaarTekst);
  el.appendChild(klaarRij);

  function bouw(): void {
    kaarten.innerHTML = '';
    const groep = haalGroep() ?? 'groep3';
    const plan = haalDagplan(groep);
    plan.taken.forEach((taak, i) => {
      const kaart = kaartVan(taak);
      const knop = document.createElement('button');
      knop.className = 'vandaag-kaart';
      if (plan.klaar[i]) knop.classList.add('vandaag-kaart--klaar');
      knop.disabled = !kaart.open;

      const nummer = document.createElement('span');
      nummer.className = 'vandaag-kaart__nummer';
      nummer.textContent = plan.klaar[i] ? '✓' : String(i + 1);
      knop.appendChild(nummer);

      const plaatje = document.createElement('img');
      plaatje.className = 'vandaag-kaart__plaatje';
      plaatje.src = kaart.icoon;
      plaatje.alt = '';
      plaatje.draggable = false;
      knop.appendChild(plaatje);

      const tekst = document.createElement('span');
      tekst.className = 'vandaag-kaart__tekst';
      const vak = document.createElement('strong');
      vak.textContent = kaart.vak;
      tekst.appendChild(vak);
      const detail = document.createElement('span');
      detail.textContent = kaart.detail;
      tekst.appendChild(detail);
      knop.appendChild(tekst);

      if (!plan.klaar[i] && isOnaf(taak)) {
        const verder = document.createElement('span');
        verder.className = 'vandaag-kaart__verder';
        verder.textContent = 'verder';
        knop.appendChild(verder);
      }

      knop.addEventListener('click', () => {
        if (!kaart.open) return;
        speelSchermOvergang();
        manager.push(kaart.open);
      });
      kaarten.appendChild(knop);
    });
    klaarRij.hidden = !plan.klaar.every(Boolean);
  }

  const terug = maakTerugKnop(() =>
    manager.terugOfAnders((m) => {
      const groep = haalGroep();
      return groep ? TopicSelectScreen(m, groep) : GroepKiesScreen(m);
    }),
  );
  let topRechts: ReturnType<typeof maakTopRechtsBalk> | null = null;

  return {
    mount(root) {
      bouw(); // vinkjes bijwerken na terugkomen uit een oefening
      root.appendChild(el);
      root.appendChild(terug);
      topRechts = maakTopRechtsBalk(manager);
      root.appendChild(topRechts.element);
      // Na het mounten, zodat de muntenteller de bonus laat oppulsen.
      if (neemDagBonus()) {
        voegMuntenToe(kleuterFactor(MUNTEN_DAGPLAN));
        confetti.vuurwerk('groot');
      }
    },
    unmount() {
      el.remove();
      terug.remove();
      topRechts?.element.remove();
      topRechts?.vernietig();
      topRechts = null;
    },
  };
}
