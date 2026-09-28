import type { RekenKern } from '../types.ts';
import { rekenKern01Getallen1Tot6 } from './kern-01-getallen-1-6.ts';
import { rekenKern02Getallen1Tot10 } from './kern-02-getallen-1-10.ts';
import { rekenKern03Getallen11Tot20 } from './kern-03-getallen-11-20.ts';
import { rekenKern04Optellen } from './kern-04-optellen.ts';

export const REKEN_KERNEN: RekenKern[] = [
  rekenKern01Getallen1Tot6,
  rekenKern02Getallen1Tot10,
  rekenKern03Getallen11Tot20,
  rekenKern04Optellen,
];

export function vindRekenKern(kernId: string): RekenKern | undefined {
  return REKEN_KERNEN.find((kern) => kern.id === kernId);
}
