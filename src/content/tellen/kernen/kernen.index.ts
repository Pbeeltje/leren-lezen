import type { RekenKern } from '../types.ts';
import { rekenKern01Getallen1Tot6 } from './kern-01-getallen-1-6.ts';
import { rekenKern02Getallen1Tot10 } from './kern-02-getallen-1-10.ts';
import { rekenKern03Getallen11Tot20 } from './kern-03-getallen-11-20.ts';
import { rekenKern04Optellen } from './kern-04-optellen.ts';
import { rekenKern05Bussommen } from './kern-05-bussommen.ts';
import { rekenKern06PlusTot10 } from './kern-06-plus-tot-10.ts';
import { rekenKern07MinTot10 } from './kern-07-min-tot-10.ts';
import { rekenKern08PlusTot20 } from './kern-08-plus-tot-20.ts';
import { rekenKern09MinTot20 } from './kern-09-min-tot-20.ts';
import { rekenKern10Munten } from './kern-10-munten.ts';
import { rekenKern11Briefjes } from './kern-11-briefjes.ts';
import { rekenKern12Herhaling } from './kern-12-herhaling.ts';

export const REKEN_KERNEN: RekenKern[] = [
  rekenKern01Getallen1Tot6,
  rekenKern02Getallen1Tot10,
  rekenKern03Getallen11Tot20,
  rekenKern04Optellen,
  rekenKern05Bussommen,
  rekenKern06PlusTot10,
  rekenKern07MinTot10,
  rekenKern08PlusTot20,
  rekenKern09MinTot20,
  rekenKern10Munten,
  rekenKern11Briefjes,
  rekenKern12Herhaling,
];

export function vindRekenKern(kernId: string): RekenKern | undefined {
  return REKEN_KERNEN.find((kern) => kern.id === kernId);
}
