export function maakTerugKnop(onClick: () => void): HTMLButtonElement {
  const knop = document.createElement('button');
  knop.className = 'terug-knop';
  knop.setAttribute('aria-label', 'Terug');

  const icoon = document.createElement('img');
  icoon.src = 'assets/icons/terug.svg';
  icoon.alt = '';
  knop.appendChild(icoon);

  knop.addEventListener('click', onClick);
  return knop;
}
