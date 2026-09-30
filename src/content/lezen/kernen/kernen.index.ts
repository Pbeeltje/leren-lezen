import type { Kern } from '../../types.ts';
import { vllKern1 } from './vll-kern-1.ts';
import { vllKern2 } from './vll-kern-2.ts';
import { vllKern3 } from './vll-kern-3.ts';
import { vllKern4 } from './vll-kern-4.ts';
import { vllKern5 } from './vll-kern-5.ts';
import { vllKern6 } from './vll-kern-6.ts';
import { kern02Weer } from './kern-02-weer.ts';
import { kern03Boerderijdieren } from './kern-03-boerderijdieren.ts';
import { kern04Dierentuindieren } from './kern-04-dierentuindieren.ts';
import { kern05SpullenEnLijf } from './kern-05-spullen-en-lijf.ts';
import { kern06MeerWoorden } from './kern-06-meer-woorden.ts';
import { kern07Klanken } from './kern-07-klanken.ts';
import { kern08Weer2 } from './kern-08-weer-2.ts';
import { kern09Kerst } from './kern-09-kerst.ts';
import { kern10Klanken2 } from './kern-10-klanken-2.ts';

// Enkel invoerpunt, op volgorde. Lezen 1-6 volgen de echte Veilig Leren Lezen
// maan-versie kernen 1-6 (met de originele plaatjes). Daarna de eerdere thema-
// hoofdstukken als extra oefenstof: na VLL kern 6 zijn al hun letters/klanken
// bekend. Hun oude ids (kern-02 t/m kern-10) blijven staan zodat opgeslagen
// voortgang (sterren) behouden blijft; alleen volgnummer is 7-15.
export const KERNEN: Kern[] = [
  vllKern1,
  vllKern2,
  vllKern3,
  vllKern4,
  vllKern5,
  vllKern6,
  kern02Weer,
  kern03Boerderijdieren,
  kern04Dierentuindieren,
  kern05SpullenEnLijf,
  kern06MeerWoorden,
  kern07Klanken,
  kern08Weer2,
  kern09Kerst,
  kern10Klanken2,
];

export function vindKern(kernId: string): Kern | undefined {
  return KERNEN.find((kern) => kern.id === kernId);
}

export function volgendeKern(kernId: string): Kern | undefined {
  const huidige = vindKern(kernId);
  if (!huidige) return KERNEN[0];
  return KERNEN.find((kern) => kern.volgnummer === huidige.volgnummer + 1);
}
