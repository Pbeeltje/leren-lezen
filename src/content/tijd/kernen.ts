import type { RekenKern } from '../tellen/types.ts';

// "Tijd lezen" (onder Leren lezen, alleen groep 3): klokkijken, dagen en maanden. Het zijn
// gewone RekenKernen, zodat RekenChapterScreen en RekenOefeningScreen ze draaien. Het id
// van klokkijken bleef 'reken-kern-13' (daar hangt de voortgang aan), ook al staat het
// hoofdstuk niet meer onder Tellen.

// Hele uren, halve uren en kwartieren. Oefening 1 meerkeuze (tijd bij klok en klok bij
// tijd), 2 zelf de wijzers zetten, 3 zelf de tijd typen; de toets mengt alle vier.
export const tijdKernKlokkijken: RekenKern = {
  id: 'reken-kern-13',
  volgnummer: 1,
  titel: 'Klokkijken',
  bereik: [1, 12],
  objecten: [],
  klok: true,
};

// Oefening 1 de ontbrekende dag kiezen, 2 op volgorde zetten, 3 welke dag komt ervoor/erna.
export const tijdKernDagen: RekenKern = {
  id: 'tijd-dagen',
  volgnummer: 2,
  titel: 'Dagen van de week',
  bereik: [1, 7],
  objecten: [],
  kalender: 'dagen',
};

export const tijdKernMaanden: RekenKern = {
  id: 'tijd-maanden',
  volgnummer: 3,
  titel: 'Maanden van het jaar',
  bereik: [1, 12],
  objecten: [],
  kalender: 'maanden',
};

export const TIJD_KERNEN: RekenKern[] = [tijdKernKlokkijken, tijdKernDagen, tijdKernMaanden];

// Tegel-icoon per hoofdstuk op het Tijd lezen-scherm.
export const TIJD_ICONEN: Record<string, string> = {
  'reken-kern-13': 'assets/icons/klok.svg',
  'tijd-dagen': 'assets/icons/dagen.svg',
  'tijd-maanden': 'assets/icons/kalender.svg',
};

export function isTijdKern(kern: RekenKern): boolean {
  return TIJD_KERNEN.some((k) => k.id === kern.id);
}
