import type { RondeVraag } from '../../ui/screens/RondeScreen.ts';
import { instructieAudioPad } from '../../engine/audioManager.ts';
import { toonGoedFeedback, toonFoutFeedback } from '../../ui/components/FeedbackOverlay.ts';
import { geheelTussen, kies, schud } from './hulp.ts';

// Zoek alle ... (groep 1-2: kleuren en vormen). Een voorbeeld bovenaan laat zien waar het
// om gaat, zodat het ook zonder voorlezen werkt: bij kleuren een verfvlek (geen vorm),
// bij vormen een witte omtrek (geen kleur). Tik alle passende dingen in het rooster aan.

type Kleur = 'rood' | 'blauw' | 'geel' | 'groen';
type Vorm = 'rondje' | 'vierkant' | 'driehoek' | 'ster';

const KLEUREN: Record<Kleur, string> = { rood: '#e53935', blauw: '#1e88e5', geel: '#fdd835', groen: '#43a047' };
const VORM_TEKST: Record<Vorm, string> = { rondje: 'rondjes', vierkant: 'vierkanten', driehoek: 'driehoeken', ster: 'sterren' };
const KLEUR_TEKST: Record<Kleur, string> = { rood: 'rode', blauw: 'blauwe', geel: 'gele', groen: 'groene' };

const NS = 'http://www.w3.org/2000/svg';

function vormSvg(vorm: Vorm | 'vlek', vulling: string): SVGSVGElement {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  let el: SVGElement;
  if (vorm === 'rondje') {
    el = document.createElementNS(NS, 'circle');
    el.setAttribute('cx', '50');
    el.setAttribute('cy', '50');
    el.setAttribute('r', '40');
  } else if (vorm === 'vierkant') {
    el = document.createElementNS(NS, 'rect');
    el.setAttribute('x', '12');
    el.setAttribute('y', '12');
    el.setAttribute('width', '76');
    el.setAttribute('height', '76');
    el.setAttribute('rx', '4');
  } else if (vorm === 'driehoek') {
    el = document.createElementNS(NS, 'polygon');
    el.setAttribute('points', '50,8 94,88 6,88');
  } else if (vorm === 'ster') {
    el = document.createElementNS(NS, 'polygon');
    el.setAttribute('points', '50,5 61,37 95,37 67,57 78,91 50,71 22,91 33,57 5,37 39,37');
  } else {
    return verfvlek(vulling);
  }
  el.setAttribute('fill', vulling);
  el.setAttribute('stroke', '#263238');
  el.setAttribute('stroke-width', '4');
  el.setAttribute('stroke-linejoin', 'round');
  svg.appendChild(el);
  return svg;
}

// Verfspetter: een rond hart met lobben en losse druppels, zodat hij op geen enkele vorm
// uit het spel lijkt. Eerst alles dik donker (de omtrek), daarna dezelfde cirkels gevuld
// eroverheen: zo krijgt alleen de buitenrand een lijn.
function verfvlek(kleur: string): SVGSVGElement {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  const cirkels: [number, number, number][] = [[50, 50, 26]];
  for (let i = 0; i < 7; i++) {
    const hoek = (i / 7) * Math.PI * 2 + 0.3;
    const afstand = i % 2 === 0 ? 26 : 22;
    cirkels.push([50 + Math.cos(hoek) * afstand, 50 + Math.sin(hoek) * afstand, i % 2 === 0 ? 13 : 10]);
  }
  for (const hoek of [0.9, 2.6, 4.4, 5.6]) cirkels.push([50 + Math.cos(hoek) * 42, 50 + Math.sin(hoek) * 42, 5]);
  for (const laag of ['rand', 'vulling']) {
    for (const [cx, cy, r] of cirkels) {
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', cx.toFixed(1));
      c.setAttribute('cy', cy.toFixed(1));
      c.setAttribute('r', String(r));
      c.setAttribute('fill', laag === 'rand' ? '#263238' : kleur);
      if (laag === 'rand') {
        c.setAttribute('stroke', '#263238');
        c.setAttribute('stroke-width', '6');
      }
      svg.appendChild(c);
    }
  }
  return svg;
}

interface Ding {
  kleur: Kleur;
  vorm: Vorm;
}

export function maakKleurVormVraag(): RondeVraag {
  const opKleur = Math.random() < 0.5;
  const alleKleuren = Object.keys(KLEUREN) as Kleur[];
  const alleVormen = Object.keys(VORM_TEKST) as Vorm[];
  const doelKleur = kies(alleKleuren);
  const doelVorm = kies(alleVormen);
  const aantalDoel = geheelTussen(2, 3);

  const dingen: Ding[] = [];
  for (let i = 0; i < aantalDoel; i++) {
    dingen.push(opKleur ? { kleur: doelKleur, vorm: kies(alleVormen) } : { kleur: kies(alleKleuren), vorm: doelVorm });
  }
  while (dingen.length < 9) {
    dingen.push(
      opKleur
        ? { kleur: kies(alleKleuren.filter((k) => k !== doelKleur)), vorm: kies(alleVormen) }
        : { kleur: kies(alleKleuren), vorm: kies(alleVormen.filter((v) => v !== doelVorm)) },
    );
  }
  const isDoel = (d: Ding) => (opKleur ? d.kleur === doelKleur : d.vorm === doelVorm);

  return {
    instructie: opKleur ? `Tik alle ${KLEUR_TEKST[doelKleur]} dingen.` : `Tik alle ${VORM_TEKST[doelVorm]}.`,
    audioPad: instructieAudioPad(opKleur ? `zoek-kleur-${doelKleur}` : `zoek-vorm-${doelVorm}`),
    render(container, afgerond) {
      container.innerHTML = '';
      const kaart = document.createElement('div');
      kaart.className = 'oefen-kaart';

      const voorbeeld = document.createElement('div');
      voorbeeld.className = 'zoek-voorbeeld';
      voorbeeld.appendChild(opKleur ? vormSvg('vlek', KLEUREN[doelKleur]) : vormSvg(doelVorm, '#ffffff'));
      kaart.appendChild(voorbeeld);

      const rooster = document.createElement('div');
      rooster.className = 'zoek-rooster';
      kaart.appendChild(rooster);

      let nogTeVinden = aantalDoel;
      for (const ding of schud(dingen)) {
        const knop = document.createElement('button');
        knop.className = 'zoek-ding';
        knop.appendChild(vormSvg(ding.vorm, KLEUREN[ding.kleur]));
        knop.addEventListener('click', () => {
          if (nogTeVinden === 0 || knop.classList.contains('gevonden')) return;
          if (isDoel(ding)) {
            knop.classList.add('gevonden');
            nogTeVinden--;
            if (nogTeVinden === 0) {
              toonGoedFeedback();
              afgerond();
            }
            return;
          }
          knop.classList.add('fout-gekozen');
          toonFoutFeedback();
          setTimeout(() => knop.classList.remove('fout-gekozen'), 500);
        });
        rooster.appendChild(knop);
      }

      container.appendChild(kaart);
      return () => container.replaceChildren();
    },
  };
}
