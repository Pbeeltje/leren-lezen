import { AVATAR_ICONEN, haalActiefProfiel } from './profielStore.ts';
import { haalVoortgang, koopMetMunten, zetGekocht } from './progressStore.ts';
import { THEMAS, huidigThema, type ThemaId } from '../achtergrond/achtergrond.ts';

// Muntenwinkel: figuren en achtergronden kopen met verdiende munten. Een paar dingen zijn
// gratis; de rest kost een vaste prijs (wens van de eigenaar). Wat gekocht is, hoort bij
// het profiel (in de voortgang), zodat broertjes en zusjes elk hun eigen spullen hebben.

export const GRATIS_FIGUREN = ['jongen', 'meisje', 'robot', 'kat', 'hond'];
export const FIGUUR_PRIJS = 30;
export const GRATIS_ACHTERGROND: ThemaId = 'ruimte';
export const ACHTERGROND_PRIJS = 200;

export type WinkelSoort = 'figuur' | 'achtergrond';

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
  return id === GRATIS_ACHTERGROND ? 0 : ACHTERGROND_PRIJS;
}

export function heeft(soort: WinkelSoort, id: string): boolean {
  return prijsVan(soort, id) === 0 || bezit().includes(sleutel(soort, id));
}

export function koop(soort: WinkelSoort, id: string): boolean {
  bezit();
  return koopMetMunten(sleutel(soort, id), prijsVan(soort, id));
}

export const eigenFiguren = (): string[] => AVATAR_ICONEN.filter((id) => heeft('figuur', id));
export const eigenAchtergronden = () => THEMAS.filter((t) => heeft('achtergrond', t.id));
