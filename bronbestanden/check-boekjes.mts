// Controleert dat elk leesboekje alleen klanken gebruikt die het kind tot en met die kern
// kent, en dat alle plaatjes bestaan. Gebruik: npx tsx bronbestanden/check-boekjes.mts
import { existsSync } from 'node:fs';
import { BOEKJES, woordenVan } from '../src/content/boekjes/boekjes.ts';

const PER_KERN: string[][] = [
  ['m', 'aa', 'n', 'r', 'oo', 's', 'v', 'i', 'k', 'o', 'p', 'e'],
  ['t', 'ee', 'eu', 'b', 'ui', 'g'],
  ['d', 'oe', 'ij', 'z'],
  ['h', 'w', 'a', 'u'],
  ['j', 'ie', 'l', 'ou', 'uu'],
  ['ei', 'au', 'f'],
];

// Klankgroepen die altijd samen één klank zijn: "een" is e-e-n niet, maar ee-n.
const GROEPEN = ['eeuw', 'ieuw', 'aai', 'ooi', 'oei', 'sch', 'aa', 'ee', 'oo', 'uu', 'oe', 'eu', 'ui', 'ie', 'ij', 'ei', 'au', 'ou', 'ch', 'ng', 'nk'];

function splits(woord: string, bekend: Set<string>): string[] | null {
  const uit: string[] = [];
  for (let i = 0; i < woord.length; ) {
    const klank = GROEPEN.find((g) => woord.startsWith(g, i)) ?? woord[i];
    if (!bekend.has(klank)) return null;
    uit.push(klank);
    i += klank.length;
  }
  return uit;
}

let fouten = 0;
for (const b of BOEKJES) {
  const bekend = new Set(PER_KERN.slice(0, b.kern).flat());
  for (const [i, p] of b.paginas.entries()) {
    for (const w of woordenVan(p.tekst)) {
      if (!splits(w, bekend)) {
        console.log(`${b.id} p${i + 1}: "${w}" gebruikt een klank die na kern ${b.kern} komt`);
        fouten++;
      }
    }
    for (const pad of p.plaatjes) if (!existsSync(`public/${pad}`)) { console.log(`${b.id}: plaatje ontbreekt ${pad}`); fouten++; }
  }
  if (woordenVan(b.titel).some((w) => !splits(w, bekend))) { console.log(`${b.id}: titel "${b.titel}" te moeilijk`); fouten++; }
}
console.log(fouten ? `${fouten} problemen` : 'alle boekjes in orde');
