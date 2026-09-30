export function maakSterBalk(sterren: 0 | 1 | 2 | 3): HTMLElement {
  const balk = document.createElement('div');
  balk.className = 'ster-balk';

  for (let i = 0; i < 3; i++) {
    const ster = document.createElement('img');
    ster.src = 'assets/icons/ster.svg';
    ster.alt = '';
    if (i < sterren) ster.classList.add('actief');
    balk.appendChild(ster);
  }

  return balk;
}
