import type { RondeVraag } from '../ui/screens/RondeScreen.ts';
import { maakLetterVraag, maakLijnVraag, maakWoordVraag } from './schrijven/schrijfVragen.ts';
import { maakVergelijkVraag } from './kleuter/vergelijken.ts';
import { maakMeerMinderVraag } from './kleuter/meerMinder.ts';
import { maakKleurVormVraag } from './kleuter/kleurenVormen.ts';
import { maakWelkeVormVraag } from './kleuter/welkeVorm.ts';
import { maakVolgordeVraag } from './kleuter/volgorde.ts';

export interface RondeActiviteit {
  icoon: string; // naam in assets/icons/
  titel: string;
  maakVraag: () => RondeVraag;
}

// Alle spellen die in een RondeScreen draaien (Schrijven en Ontdekken), met een vaste id.
// Met die id onthoudt engine/dagplan.ts wat er af is en wat half gespeeld bleef.
export const RONDE_ACTIVITEITEN = {
  'schrijven-lijnen': { icoon: 'lijnen', titel: 'Lijnen', maakVraag: maakLijnVraag },
  'schrijven-letters': { icoon: 'letters', titel: 'Letters', maakVraag: maakLetterVraag },
  'schrijven-woordjes': { icoon: 'woordjes', titel: 'Woordjes', maakVraag: maakWoordVraag },
  'ontdekken-vergelijken': { icoon: 'vergelijken', titel: 'Groot of klein?', maakVraag: maakVergelijkVraag },
  'ontdekken-meer-minder': { icoon: 'meer-minder', titel: 'Meer of minder?', maakVraag: maakMeerMinderVraag },
  'ontdekken-kleuren-vormen': { icoon: 'vormen', titel: 'Kleuren & vormen', maakVraag: maakKleurVormVraag },
  'ontdekken-welke-vorm': { icoon: 'welke-vorm', titel: 'Welke vorm?', maakVraag: maakWelkeVormVraag },
  'ontdekken-volgorde': { icoon: 'volgorde', titel: 'Op volgorde', maakVraag: maakVolgordeVraag },
} satisfies Record<string, RondeActiviteit>;

export type RondeId = keyof typeof RONDE_ACTIVITEITEN;

export const ONTDEKKEN_IDS: RondeId[] = [
  'ontdekken-vergelijken',
  'ontdekken-meer-minder',
  'ontdekken-kleuren-vormen',
  'ontdekken-welke-vorm',
  'ontdekken-volgorde',
];

export function isRondeId(id: unknown): id is RondeId {
  return typeof id === 'string' && Object.prototype.hasOwnProperty.call(RONDE_ACTIVITEITEN, id);
}
