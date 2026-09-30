import { events } from '../engine/events.ts';
import { haalActiefProfielId } from '../engine/profielStore.ts';
import { maakRuimte, schietVallendeSter, zetRuimteZichtbaar } from '../three/ruimte.ts';
import { maakDinoDecor } from './dino.ts';
import { maakKasteelDecor } from './kasteel.ts';
import { maakZeeDecor } from './zee.ts';

// Kiesbare achtergronden (per profiel onthouden). Elk decor staat in een eigen laag
// achter de three.js-laag en de schermen, blijft aan de randen (de vragen staan in het
// midden op witte kaarten) en reageert even op een goed antwoord.

export type ThemaId = 'ruimte' | 'dino' | 'kasteel' | 'zee';

export interface Decor {
  element: HTMLElement;
  juich: () => void;
  // Legt losse plaatjes na het tonen (en bij elke schermwijziging) op de heuvels.
  plaats?: () => void;
  // Groot feest aan het eind van een hele sessie; zonder eigen feest juicht het decor.
  feest?: () => void;
  // Stopt eigen timers (bv. het wisselende weer) als er een andere achtergrond komt.
  vernietig?: () => void;
}

export const THEMAS: { id: ThemaId; naam: string; voorbeeld: string }[] = [
  { id: 'ruimte', naam: 'Ruimte', voorbeeld: '/assets/icons/ster.svg' },
  { id: 'dino', naam: 'Dino-wei', voorbeeld: '/assets/achtergrond/trex-eigen.svg' },
  { id: 'kasteel', naam: 'Kasteel', voorbeeld: '/assets/achtergrond/kasteel-eigen.svg' },
  { id: 'zee', naam: 'Zee', voorbeeld: '/assets/achtergrond/vuurtoren.svg' },
];

const MAKERS: Record<Exclude<ThemaId, 'ruimte'>, () => Decor> = {
  dino: maakDinoDecor,
  kasteel: maakKasteelDecor,
  zee: maakZeeDecor,
};

let laag: HTMLElement | null = null;
let huidig: { id: ThemaId; decor: Decor | null } | null = null;

const sleutel = (profielId: string) => `leren-lezen:achtergrond:${profielId}`;

function leesKeuze(): ThemaId {
  const id = haalActiefProfielId();
  if (!id) return 'ruimte';
  try {
    const waarde = localStorage.getItem(sleutel(id));
    return THEMAS.some((t) => t.id === waarde) ? (waarde as ThemaId) : 'ruimte';
  } catch {
    return 'ruimte';
  }
}

export function initAchtergrond(app: HTMLElement): void {
  laag = document.createElement('div');
  laag.id = 'decor-laag';
  app.prepend(laag);
  maakRuimte();
  window.addEventListener('resize', () => huidig?.decor?.plaats?.());
  events.on('sessie-klaar', () => {
    const decor = huidig?.decor;
    if (!decor) {
      [0, 500, 1000].forEach((ms) => window.setTimeout(schietVallendeSter, ms));
    } else if (decor.feest) decor.feest();
    else {
      decor.juich();
      window.setTimeout(decor.juich, 1300);
    }
  });
  events.on('antwoord-goed', () => {
    if (huidig?.decor) huidig.decor.juich();
    else schietVallendeSter();
  });
  pasAchtergrondVanProfielToe();
}

export function huidigThema(): ThemaId {
  return huidig?.id ?? 'ruimte';
}

function toon(id: ThemaId): void {
  if (!laag || huidig?.id === id) return;
  huidig?.decor?.vernietig?.();
  laag.replaceChildren();
  const decor = id === 'ruimte' ? null : MAKERS[id]();
  if (decor) {
    laag.appendChild(decor.element);
    requestAnimationFrame(() => decor.plaats?.());
  }
  zetRuimteZichtbaar(id === 'ruimte');
  for (const t of THEMAS) document.body.classList.toggle(`thema-${t.id}`, t.id === id);
  huidig = { id, decor };
}

/** Na het kiezen van een profiel (of bij het opstarten): diens laatste achtergrond. */
export function pasAchtergrondVanProfielToe(): void {
  toon(leesKeuze());
}

export function kiesAchtergrond(id: ThemaId): void {
  const profielId = haalActiefProfielId();
  if (profielId) {
    try {
      localStorage.setItem(sleutel(profielId), id);
    } catch {
      // geen opslag: alleen voor deze sessie
    }
  }
  toon(id);
}
