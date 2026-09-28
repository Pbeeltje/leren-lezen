import type { Kern } from '../../types.ts';
import { kern01MaanRoosVis } from './kern-01-maan-roos-vis.ts';
import { kern02Weer } from './kern-02-weer.ts';
import { kern03Boerderijdieren } from './kern-03-boerderijdieren.ts';
import { kern04Dierentuindieren } from './kern-04-dierentuindieren.ts';
import { kern05SpullenEnLijf } from './kern-05-spullen-en-lijf.ts';

// Enkel invoerpunt, op volgorde.
export const KERNEN: Kern[] = [
  kern01MaanRoosVis,
  kern02Weer,
  kern03Boerderijdieren,
  kern04Dierentuindieren,
  kern05SpullenEnLijf,
];

export function vindKern(kernId: string): Kern | undefined {
  return KERNEN.find((kern) => kern.id === kernId);
}

export function volgendeKern(kernId: string): Kern | undefined {
  const huidige = vindKern(kernId);
  if (!huidige) return KERNEN[0];
  return KERNEN.find((kern) => kern.volgnummer === huidige.volgnummer + 1);
}
