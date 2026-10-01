import type { RondeVraag } from '../../ui/screens/RondeScreen.ts';
import { instructieAudioPad } from '../../engine/audioManager.ts';
import { toonGoedFeedback, toonFoutFeedback } from '../../ui/components/FeedbackOverlay.ts';
import { kies, schud } from './hulp.ts';

// Welke vorm? Het kind hoort "Waar is de ruit?" en tikt de juiste vorm uit drie. Een stap
// verder dan kleuren & vormen: meer vormen, en vaak een lijkt-erop-vorm ernaast
// (vierkant/rechthoek, rondje/ovaal). Kleuren zijn willekeurig, dus geven geen hint.

type Vorm = 'rondje' | 'vierkant' | 'driehoek' | 'ster' | 'hartje' | 'rechthoek' | 'ovaal' | 'ruit' | 'maan' | 'kruis';

const VRAAG: Record<Vorm, string> = {
  rondje: 'Waar is het rondje?',
  vierkant: 'Waar is het vierkant?',
  driehoek: 'Waar is de driehoek?',
  ster: 'Waar is de ster?',
  hartje: 'Waar is het hartje?',
  rechthoek: 'Waar is de rechthoek?',
  ovaal: 'Waar is het ovaal?',
  ruit: 'Waar is de ruit?',
  maan: 'Waar is de maan?',
  kruis: 'Waar is het kruis?',
};

const LIJKT_OP: Partial<Record<Vorm, Vorm[]>> = {
  rondje: ['ovaal', 'maan'],
  ovaal: ['rondje', 'rechthoek'],
  vierkant: ['rechthoek', 'ruit'],
  rechthoek: ['vierkant', 'ovaal'],
  ruit: ['vierkant', 'driehoek'],
  ster: ['kruis', 'driehoek'],
  kruis: ['ster', 'vierkant'],
  maan: ['rondje', 'hartje'],
  hartje: ['maan', 'driehoek'],
  driehoek: ['ruit', 'ster'],
};

const KLEUREN = ['#e53935', '#1e88e5', '#fdd835', '#43a047', '#fb8c00', '#8e24aa', '#f48fb1', '#8d5524'];
const NS = 'http://www.w3.org/2000/svg';

const VORMEN: Record<Vorm, [string, Record<string, string>]> = {
  rondje: ['circle', { cx: '50', cy: '50', r: '40' }],
  vierkant: ['rect', { x: '14', y: '14', width: '72', height: '72', rx: '4' }],
  driehoek: ['polygon', { points: '50,8 94,88 6,88' }],
  ster: ['polygon', { points: '50,5 61,37 95,37 67,57 78,91 50,71 22,91 33,57 5,37 39,37' }],
  hartje: ['path', { d: 'M50 88 C20 66 6 48 10 30 C14 12 38 8 50 26 C62 8 86 12 90 30 C94 48 80 66 50 88 Z' }],
  rechthoek: ['rect', { x: '4', y: '28', width: '92', height: '44', rx: '4' }],
  ovaal: ['ellipse', { cx: '50', cy: '50', rx: '46', ry: '26' }],
  ruit: ['polygon', { points: '50,4 86,50 50,96 14,50' }],
  maan: ['path', { d: 'M79 14 A40 40 0 1 0 79 86 A42 42 0 0 1 79 14 Z' }],
  kruis: ['polygon', { points: '37,8 63,8 63,37 92,37 92,63 63,63 63,92 37,92 37,63 8,63 8,37 37,37' }],
};

function vormSvg(vorm: Vorm, kleur: string): SVGSVGElement {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  const [tag, attrs] = VORMEN[vorm];
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  el.setAttribute('fill', kleur);
  el.setAttribute('stroke', '#263238');
  el.setAttribute('stroke-width', '4');
  el.setAttribute('stroke-linejoin', 'round');
  svg.appendChild(el);
  return svg;
}

export function maakWelkeVormVraag(): RondeVraag {
  const alle = Object.keys(VRAAG) as Vorm[];
  const doel = kies(alle);
  const lijkend = Math.random() < 0.6 ? kies(LIJKT_OP[doel] ?? []) : undefined;
  const rest = schud(alle.filter((v) => v !== doel && v !== lijkend));
  const opties = schud([doel, ...(lijkend ? [lijkend] : []), ...rest].slice(0, 3));
  const kleuren = schud(KLEUREN);

  return {
    instructie: VRAAG[doel],
    audioPad: instructieAudioPad(`vorm-${doel}`),
    render(container, afgerond) {
      container.innerHTML = '';
      const kaart = document.createElement('div');
      kaart.className = 'oefen-kaart';
      const rij = document.createElement('div');
      rij.className = 'vergelijk-rij';
      kaart.appendChild(rij);
      let klaar = false;
      opties.forEach((vorm, i) => {
        const knop = document.createElement('button');
        knop.className = 'vergelijk-optie vorm-optie';
        knop.appendChild(vormSvg(vorm, kleuren[i]));
        knop.addEventListener('click', () => {
          if (klaar) return;
          if (vorm === doel) {
            klaar = true;
            knop.classList.add('gevonden');
            toonGoedFeedback();
            afgerond();
            return;
          }
          knop.classList.add('fout-gekozen');
          toonFoutFeedback();
          setTimeout(() => knop.classList.remove('fout-gekozen'), 500);
        });
        rij.appendChild(knop);
      });
      container.appendChild(kaart);
      return () => container.replaceChildren();
    },
  };
}
