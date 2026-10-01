import { events } from '../engine/events.ts';
import { haalActiefProfielId } from '../engine/profielStore.ts';
import { maakRuimte, zetRuimteZichtbaar } from '../three/ruimte.ts';
import { maakRuimteDecor } from './ruimte.ts';
import { maakDinoDecor } from './dino.ts';
import { maakKasteelDecor } from './kasteel.ts';
import { maakZeeDecor } from './zee.ts';
import { maakOnderwaterDecor } from './onderwater.ts';
import { maakBoerderijDecor } from './boerderij.ts';
import { maakHerfstDecor } from './herfst.ts';
import { maakWinterDecor } from './winter.ts';
import { maakKermisDecor } from './kermis.ts';
import { maakBouwDecor } from './bouw.ts';
import { maakTreinDecor } from './trein.ts';

// Kiesbare achtergronden (per profiel onthouden). Elk decor staat in een eigen laag
// achter de three.js-laag en de schermen, blijft aan de randen (de vragen staan in het
// midden op witte kaarten) en reageert even op een goed antwoord.

export type ThemaId = 'ruimte' | 'dino' | 'kasteel' | 'zee' | 'onderwater'
  | 'boerderij'
  | 'herfst'
  | 'winter'
  | 'kermis'
  | 'bouw'
  | 'trein';

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
  { id: 'ruimte', naam: 'Ruimte', voorbeeld: 'assets/icons/ster.svg' },
  { id: 'dino', naam: 'Dino-wei', voorbeeld: 'assets/achtergrond/trex-eigen.svg' },
  { id: 'kasteel', naam: 'Kasteel', voorbeeld: 'assets/achtergrond/kasteel-eigen.svg' },
  { id: 'zee', naam: 'Zee', voorbeeld: 'assets/achtergrond/vuurtoren.svg' },
  { id: 'onderwater', naam: 'Onder water', voorbeeld: 'assets/achtergrond/vis-tropisch.svg' },
  { id: 'boerderij', naam: 'Boerderij', voorbeeld: 'assets/achtergrond/koe.svg' },
  { id: 'herfst', naam: 'Herfstbos', voorbeeld: 'assets/achtergrond/esdoornblad.svg' },
  { id: 'winter', naam: 'Winter', voorbeeld: 'assets/achtergrond/sneeuwpop.svg' },
  { id: 'kermis', naam: 'Kermis', voorbeeld: 'assets/achtergrond/reuzenrad.svg' },
  { id: 'bouw', naam: 'Bouwplaats', voorbeeld: 'assets/achtergrond/bouw.svg' },
  { id: 'trein', naam: 'Treinreis', voorbeeld: 'assets/achtergrond/locomotief.svg' },
];

// De ruimte zelf tekent three.js; het decor erbij is alleen de laag met vallende sterren
// en de raket.
const MAKERS: Record<ThemaId, () => Decor> = {
  ruimte: maakRuimteDecor,
  dino: maakDinoDecor,
  kasteel: maakKasteelDecor,
  zee: maakZeeDecor,
  onderwater: maakOnderwaterDecor,
  boerderij: maakBoerderijDecor,
  herfst: maakHerfstDecor,
  winter: maakWinterDecor,
  kermis: maakKermisDecor,
  bouw: maakBouwDecor,
  trein: maakTreinDecor,
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
    if (!decor) return;
    if (decor.feest) decor.feest();
    else {
      decor.juich();
      window.setTimeout(decor.juich, 1300);
    }
  });
  events.on('antwoord-goed', () => {
    huidig?.decor?.juich();
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
  const decor = MAKERS[id]();
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
