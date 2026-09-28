export interface IconTileOpties {
  icoonPad: string;
  label: string;
  beschikbaar?: boolean;
  badge?: string;
  onClick?: () => void;
}

export function maakIconTile(opties: IconTileOpties): HTMLButtonElement {
  const knop = document.createElement('button');
  knop.className = 'icoon-tegel';
  knop.disabled = opties.beschikbaar === false;

  const plaatje = document.createElement('img');
  plaatje.className = 'icoon-tegel__plaatje';
  plaatje.src = opties.icoonPad;
  plaatje.alt = '';
  plaatje.draggable = false;
  knop.appendChild(plaatje);

  const label = document.createElement('span');
  label.className = 'icoon-tegel__label';
  label.textContent = opties.label;
  knop.appendChild(label);

  if (opties.badge) {
    const badge = document.createElement('span');
    badge.className = 'icoon-tegel__badge';
    badge.textContent = opties.badge;
    knop.appendChild(badge);
  }

  if (opties.onClick) {
    knop.addEventListener('click', opties.onClick);
  }

  return knop;
}
