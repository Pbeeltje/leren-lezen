import { events } from '../../engine/events.ts';
import { haalVoortgang } from '../../engine/progressStore.ts';

// Blijvende muntenteller rechtsboven, zichtbaar op alle schermen na het leeftijdscherm.
export function maakMuntenTeller(): { element: HTMLElement; vernietig: () => void } {
  const element = document.createElement('div');
  element.className = 'munten-teller';

  const icoon = document.createElement('img');
  icoon.className = 'munten-teller__icoon';
  icoon.src = '/assets/icons/munt.svg';
  icoon.alt = '';
  element.appendChild(icoon);

  const aantal = document.createElement('span');
  aantal.textContent = String(haalVoortgang().munten);
  element.appendChild(aantal);

  const afmelden = events.on('munten-veranderd', ({ totaal }) => {
    aantal.textContent = String(totaal);
    element.classList.remove('pulseer');
    // force reflow zodat de animatie opnieuw kan starten bij snel achter elkaar verdienen
    void element.offsetWidth;
    element.classList.add('pulseer');
  });

  return { element, vernietig: afmelden };
}
