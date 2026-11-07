import type { Uiterlijk } from './uiterlijk.ts';
import { NOOT } from './xylofoonUiterlijk.ts';

// Mondharmonica, schuin van voren gezien (van rechtsboven, zoals op een foto): de voorkant
// met de gaatjes recht naar je toe, de dekplaat erbovenop als schuin vlak met in het midden
// het verhoogde deel waarop de notennamen gegraveerd staan (zoals de nummers op een echte),
// schroefjes op de platte uiteinden, en rechts het zijvlak. Een rode kam tussen glimmende
// platen. De tekening is versiering in een vaste maat (viewBox 1000x360, het vak heeft
// dezelfde verhouding); de knoppen zijn kolommen over de gaatjes, het gaatje zelf is ::before
// en de notennaam ligt schuin op de plaat (muziek.css, .xylofoon--mondharmonica).
// Vlakke kleuren, geen verlopen (een url(#id) tekent niet op display:none).
//
// Een punt op de bovenplaat: u langs de lengte (0-860), v naar achteren (0-1).
const P = (u: number, v: number): string => `${30 + u + 70 * v},${175 - 95 * v}`;
const vlak = (...p: string[]): string => p.join(' ');

const LIJF = `<svg viewBox="0 0 1000 360" preserveAspectRatio="none">
  <ellipse class="mh-schaduw" cx="500" cy="334" rx="470" ry="17" fill="rgba(0,0,0,0.16)"/>
  <polygon points="${vlak(P(0, 0), P(860, 0), P(860, 1), P(0, 1))}" fill="#c9d2d9" stroke="#56626c" stroke-width="3" stroke-linejoin="round"/>
  <polygon points="${vlak(P(10, 0.86), P(850, 0.86), P(855, 0.93), P(15, 0.93))}" fill="#eef2f5"/>
  <polygon points="${vlak(P(55, 0.12), P(805, 0.12), P(775, 0.88), P(85, 0.88))}" fill="#aeb8c1"/>
  <polygon points="843.4,163.6 866.6,91.4 866.6,79.4 843.4,151.6" fill="#8e99a3" stroke="#56626c" stroke-width="2"/>
  <polygon points="93.4,163.6 843.4,163.6 843.4,151.6 93.4,151.6" fill="#7f8b95" stroke="#56626c" stroke-width="2"/>
  <polygon points="93.4,151.6 843.4,151.6 866.6,79.4 176.6,79.4" fill="#e3e9ee" stroke="#56626c" stroke-width="2.5" stroke-linejoin="round"/>
  <polygon points="190,84 860,84 855,98 186,98" fill="#ffffff" opacity="0.7"/>
  <ellipse cx="${30 + 28 + 35}" cy="127.5" rx="10" ry="7" fill="#f4f7f9" stroke="#56626c" stroke-width="2.5"/>
  <path d="M86 127.5 h14" stroke="#56626c" stroke-width="2.5"/>
  <ellipse cx="${30 + 832 + 35}" cy="127.5" rx="10" ry="7" fill="#f4f7f9" stroke="#56626c" stroke-width="2.5"/>
  <path d="M890 127.5 h14" stroke="#56626c" stroke-width="2.5"/>
  <polygon points="890,175 960,80 960,220 890,315" fill="#8e99a3" stroke="#56626c" stroke-width="3" stroke-linejoin="round"/>
  <polygon points="890,198 960,103 960,197 890,292" fill="#9f1d1d"/>
  <rect x="30" y="175" width="860" height="140" rx="6" fill="#d32f2f" stroke="#56626c" stroke-width="3"/>
  <rect x="30" y="198" width="860" height="10" fill="#9f1d1d"/>
  <rect x="30" y="175" width="860" height="24" rx="5" fill="#d5dde3" stroke="#56626c" stroke-width="3"/>
  <rect x="36" y="179" width="848" height="6" rx="3" fill="#ffffff" opacity="0.8"/>
  <rect x="30" y="291" width="860" height="24" rx="5" fill="#9aa5ae" stroke="#56626c" stroke-width="3"/>
  <rect x="36" y="295" width="848" height="5" rx="2.5" fill="#c9d2d9"/>
</svg>`;

export const MONDHARMONICA: Uiterlijk = {
  achter() {
    const lijf = document.createElement('div');
    lijf.className = 'mh-lijf';
    lijf.innerHTML = LIJF;
    return lijf;
  },
  knop(staaf) {
    staaf.insertAdjacentHTML('beforeend', `<span class="xylo-noot">${NOOT}</span>`);
  },
};
