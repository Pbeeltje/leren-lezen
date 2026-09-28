import type { RekenKern } from '../types.ts';
import { rekenKern01Getallen1Tot6 } from './kern-01-getallen-1-6.ts';

export const REKEN_KERNEN: RekenKern[] = [rekenKern01Getallen1Tot6];

export function vindRekenKern(kernId: string): RekenKern | undefined {
  return REKEN_KERNEN.find((kern) => kern.id === kernId);
}
