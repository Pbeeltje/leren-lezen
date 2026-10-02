import { events } from '../../engine/events.ts';
import { confetti } from '../../three/particles.ts';

// Eindkaart na een heel kleuterhoofdstuk: beker, drie sterren en één grote knop om terug
// te gaan. Geen tekst nodig om hem te snappen; de achtergrond viert feest (vulkaan!).
export function toonKlaarKaart(container: HTMLElement, onVerder: () => void, muntenVerdiend?: number): void {
  container.innerHTML = '';
  const kaart = document.createElement('div');
  kaart.className = 'oefen-kaart klaar-kaart';

  const beker = document.createElement('img');
  beker.src = 'assets/icons/trofee.svg';
  beker.alt = '';
  beker.className = 'klaar-kaart__beker';
  kaart.appendChild(beker);

  const sterren = document.createElement('div');
  sterren.className = 'klaar-kaart__sterren';
  for (let i = 0; i < 3; i++) {
    const ster = document.createElement('img');
    ster.src = 'assets/icons/ster.svg';
    ster.alt = '';
    ster.style.animationDelay = `${0.2 + i * 0.25}s`;
    sterren.appendChild(ster);
  }
  kaart.appendChild(sterren);

  const knop = document.createElement('button');
  knop.className = 'klaar-kaart__knop';
  knop.setAttribute('aria-label', 'Klaar, terug');
  const pijl = document.createElement('img');
  pijl.src = 'assets/icons/huis.svg';
  pijl.alt = '';
  knop.appendChild(pijl);
  knop.addEventListener('click', onVerder);
  kaart.appendChild(knop);

  container.appendChild(kaart);
  confetti.vuurwerk('groot');
  events.emit('sessie-klaar', undefined);

  if (muntenVerdiend === undefined) return;
  const rij = document.createElement('div');
  rij.className = 'resultaat-munten-rij';
  const icoon = document.createElement('img');
  icoon.src = 'assets/icons/munt.svg';
  icoon.alt = '';
  const tekst = document.createElement('span');
  tekst.textContent = `+${muntenVerdiend} munten`;
  rij.append(icoon, tekst);
  knop.before(rij);
}
