import { AVATAR_ICONEN, haalActiefProfiel } from './profielStore.ts';
import { haalVoortgang, koopMetMunten, zetGekocht, zetInstrument } from './progressStore.ts';
import { THEMAS, huidigThema, type ThemaId } from '../achtergrond/achtergrond.ts';
import { INSTRUMENTEN, type Instrument } from './muziek.ts';

// Muntenwinkel: figuren, achtergronden en instrumenten kopen met verdiende munten. Een paar
// dingen zijn gratis; de rest kost een vaste prijs (wens van de eigenaar). Wat gekocht is,
// hoort bij het profiel (in de voortgang), zodat broertjes en zusjes elk hun eigen spullen hebben.

export const GRATIS_FIGUREN = ['jongen', 'meisje', 'robot', 'kat', 'hond'];
export const FIGUUR_PRIJS = 30;
export const GRATIS_ACHTERGROND: ThemaId = 'ruimte';
export const ACHTERGROND_PRIJS = 200;
export const GRATIS_INSTRUMENT: Instrument = 'xylofoon';
export const INSTRUMENT_PRIJS = 200;

export type WinkelSoort = 'figuur' | 'achtergrond' | 'instrument';

const sleutel = (soort: WinkelSoort, id: string) => `${soort}:${id}`;

// Oude profielen (van vóór de winkel) houden wat ze al gebruikten: de eerste keer dat de
// winkel kijkt, wordt dat als gekocht genoteerd.
function bezit(): string[] {
  const gekocht = haalVoortgang().gekocht;
  if (gekocht) return gekocht;
  const start: string[] = [];
  const icoon = haalActiefProfiel()?.icoonId;
  if (icoon && !GRATIS_FIGUREN.includes(icoon)) start.push(sleutel('figuur', icoon));
  const thema = huidigThema();
  if (thema !== GRATIS_ACHTERGROND) start.push(sleutel('achtergrond', thema));
  zetGekocht(start);
  return start;
}

export function prijsVan(soort: WinkelSoort, id: string): number {
  if (soort === 'figuur') return GRATIS_FIGUREN.includes(id) ? 0 : FIGUUR_PRIJS;
  if (soort === 'instrument') return id === GRATIS_INSTRUMENT ? 0 : INSTRUMENT_PRIJS;
  return id === GRATIS_ACHTERGROND ? 0 : ACHTERGROND_PRIJS;
}

export function heeft(soort: WinkelSoort, id: string): boolean {
  if (prijsVan(soort, id) === 0) return true;
  const lijst = bezit();
  if (lijst.includes(sleutel(soort, id))) return true;
  if (soort === 'instrument' && id === 'fluit' && lijst.includes('instrument:steelgitaar')) return true;
  return false;
}

export function koop(soort: WinkelSoort, id: string): boolean {
  bezit();
  return koopMetMunten(sleutel(soort, id), prijsVan(soort, id));
}

export const eigenFiguren = (): string[] => AVATAR_ICONEN.filter((id) => heeft('figuur', id));
export const eigenAchtergronden = () => THEMAS.filter((t) => heeft('achtergrond', t.id));

// Het gekozen instrument, zolang het kind het (nog) heeft; anders de gratis xylofoon.
const OUD_INSTRUMENT: Record<string, Instrument> = { steelgitaar: 'fluit' };

export function huidigInstrument(): Instrument {
  const ruw = haalVoortgang().instrument;
  const gekozen = ruw ? (OUD_INSTRUMENT[ruw] ?? ruw) : undefined;
  return gekozen && INSTRUMENTEN.some((i) => i.id === gekozen) && heeft('instrument', gekozen) ? gekozen : GRATIS_INSTRUMENT;
}

export const kiesInstrument = (instrument: Instrument): void => zetInstrument(instrument);
