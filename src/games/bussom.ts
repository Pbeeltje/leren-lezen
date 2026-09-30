import type { RekenOefeningDefinitie } from '../content/tellen/types.ts';
import { toonGoedFeedback, toonFoutFeedback } from '../ui/components/FeedbackOverlay.ts';

type Oefening = Extract<RekenOefeningDefinitie, { type: 'bussom' }>;

const KLEUREN = ['#e53935', '#1e88e5', '#43a047', '#fb8c00', '#8e24aa', '#00897b'];
const NS = 'http://www.w3.org/2000/svg';

function poppetje(index: number): SVGSVGElement {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 30 40');
  svg.classList.add('bus-poppetje');
  const hoofd = document.createElementNS(NS, 'circle');
  hoofd.setAttribute('cx', '15');
  hoofd.setAttribute('cy', '10');
  hoofd.setAttribute('r', '8');
  hoofd.setAttribute('fill', '#ffcc80');
  const lijf = document.createElementNS(NS, 'path');
  lijf.setAttribute('d', 'M3 40 C3 24 8 20 15 20 C22 20 27 24 27 40 Z');
  lijf.setAttribute('fill', KLEUREN[index % KLEUREN.length]);
  for (const el of [lijf, hoofd]) {
    el.setAttribute('stroke', '#263238');
    el.setAttribute('stroke-width', '2');
    svg.appendChild(el);
  }
  return svg;
}

function schudArray<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

export function renderBussom(
  container: HTMLElement,
  oefening: Oefening,
  opties: { herkansingToegestaan: boolean },
  afgerond: (juist: boolean) => void,
): { vernietig: () => void } {
  container.innerHTML = '';
  const erin = oefening.verandering > 0;
  const stap = Math.abs(oefening.verandering);

  const kaart = document.createElement('div');
  kaart.className = 'oefen-kaart';

  const scene = document.createElement('div');
  scene.className = 'bus-scene';
  kaart.appendChild(scene);

  const bus = document.createElement('div');
  bus.className = 'bus';
  const ramen = document.createElement('div');
  ramen.className = 'bus__ramen';
  for (let i = 0; i < oefening.start; i++) ramen.appendChild(poppetje(i));
  bus.appendChild(ramen);
  scene.appendChild(bus);

  // Wie instapt staat bij de halte met een pijl naar de bus; wie uitstapt loopt weg
  // van de bus. De uitstappers zijn nieuwe poppetjes buiten de bus: in de bus staat nog
  // de beginsituatie (net als op een bussom-werkblad).
  const halte = document.createElement('div');
  halte.className = `bus-halte ${erin ? 'bus-halte--in' : 'bus-halte--uit'}`;
  const pijl = document.createElement('div');
  pijl.className = 'bus-halte__pijl';
  pijl.textContent = erin ? '⬅' : '➡';
  const groep = document.createElement('div');
  groep.className = 'bus-halte__groep';
  for (let i = 0; i < stap; i++) groep.appendChild(poppetje(oefening.start + i));
  const label = document.createElement('div');
  label.className = 'bus-halte__label';
  label.textContent = erin ? `${stap} stapt in` : `${stap} stapt uit`;
  if (stap > 1) label.textContent = erin ? `${stap} stappen in` : `${stap} stappen uit`;
  halte.append(pijl, groep, label);
  scene.appendChild(halte);

  const som = document.createElement('div');
  som.className = 'oefen-kaart__som';
  som.textContent = `${oefening.start} ${erin ? '+' : '−'} ${stap} = ?`;
  kaart.appendChild(som);

  const keuzeRij = document.createElement('div');
  keuzeRij.className = 'keuze-rij';
  kaart.appendChild(keuzeRij);

  let afgehandeld = false;
  for (const getal of schudArray([oefening.antwoord, ...oefening.afleiders])) {
    const knop = document.createElement('button');
    knop.className = 'keuze-knop';
    knop.textContent = String(getal);
    knop.addEventListener('click', () => {
      if (afgehandeld) return;
      if (getal === oefening.antwoord) {
        afgehandeld = true;
        knop.classList.add('goed-gekozen');
        toonGoedFeedback();
        afgerond(true);
        return;
      }
      knop.classList.add('fout-gekozen');
      toonFoutFeedback();
      if (opties.herkansingToegestaan) {
        setTimeout(() => knop.classList.remove('fout-gekozen'), 500);
      } else {
        afgehandeld = true;
        afgerond(false);
      }
    });
    keuzeRij.appendChild(knop);
  }

  container.appendChild(kaart);
  return { vernietig: () => container.replaceChildren() };
}
