import type { Kern } from '../../types.ts';
import { kern01MaanRoosVis } from './kern-01-maan-roos-vis.ts';

// Enkel invoerpunt, op volgorde. Volgende groep (sok/aan/pen/en) volgt dezelfde vorm.
export const KERNEN: Kern[] = [kern01MaanRoosVis];

export function vindKern(kernId: string): Kern | undefined {
  return KERNEN.find((kern) => kern.id === kernId);
}

export function volgendeKern(kernId: string): Kern | undefined {
  const huidige = vindKern(kernId);
  if (!huidige) return KERNEN[0];
  return KERNEN.find((kern) => kern.volgnummer === huidige.volgnummer + 1);
}
