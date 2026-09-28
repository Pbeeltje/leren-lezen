import type { Kern } from '../../types.ts';
import { kern01Maan } from './kern-01-maan.ts';
import { kern02Roos } from './kern-02-roos.ts';
import { kern03Vis } from './kern-03-vis.ts';

// Enkel invoerpunt, op volgorde. Kernen 4-7 (sok/aan/pen/en) volgen dezelfde vorm.
export const KERNEN: Kern[] = [kern01Maan, kern02Roos, kern03Vis];

export function vindKern(kernId: string): Kern | undefined {
  return KERNEN.find((kern) => kern.id === kernId);
}

export function volgendeKern(kernId: string): Kern | undefined {
  const huidige = vindKern(kernId);
  if (!huidige) return KERNEN[0];
  return KERNEN.find((kern) => kern.volgnummer === huidige.volgnummer + 1);
}
