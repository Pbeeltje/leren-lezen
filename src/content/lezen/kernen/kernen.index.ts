import type { Kern } from '../../types.ts';
import { LEZEN_HOOFDSTUKKEN } from './lezen-hoofdstukken.ts';

export const KERNEN: Kern[] = LEZEN_HOOFDSTUKKEN;

export function vindKern(kernId: string): Kern | undefined {
  return KERNEN.find((kern) => kern.id === kernId);
}

export function volgendeKern(kernId: string): Kern | undefined {
  const huidige = vindKern(kernId);
  if (!huidige) return KERNEN[0];
  return KERNEN.find((kern) => kern.volgnummer === huidige.volgnummer + 1);
}
