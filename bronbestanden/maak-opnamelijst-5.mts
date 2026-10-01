// Maakt opnamelijst 5: instructies voor Schrijven en Muziek, de bladzijden van de
// leesboekjes en de woorden uit de boekjes die nog geen opname hebben.
// Gebruik: npx tsx bronbestanden/maak-opnamelijst-5.mts
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { BOEKJES, woordenVan } from '../src/content/boekjes/boekjes.ts';
import { LETTER_VOLGORDE } from '../src/games/schrijven/schrijfVragen.ts';

type Regel = { n: number; slug: string; text: string; path: string };
const opgenomen = new Set(
  readdirSync('bronbestanden')
    .filter((f) => f.startsWith('audio-manifest') && f.endsWith('.json'))
    .flatMap((f) => (JSON.parse(readFileSync(`bronbestanden/${f}`, 'utf-8')) as Regel[]).map((r) => r.path)),
);

const instr = (slug: string, text: string) => ({ slug, text, path: `public/assets/audio/instructies/${slug}.mp3` });
const deel1 = [
  instr('schrijf-lijn', 'Trek de lijn over met je vinger'),
  instr('schrijf-woord', 'Schrijf het woord na'),
  instr('muziek-speel-na', 'Luister goed en speel het na'),
  instr('muziek-ritme', 'Luister en trommel het na'),
  ...LETTER_VOLGORDE.map(({ letter, woord }) => instr(`schrijf-letter-${letter}`, `Schrijf de ${letter} van ${woord}`)),
];
const woorden = [...new Set(BOEKJES.flatMap((b) => b.paginas.flatMap((p) => woordenVan(p.tekst))))]
  .map((w) => ({ slug: w, text: w, path: `public/assets/audio/woorden/${w}.mp3` }))
  .filter((r) => !opgenomen.has(r.path));
const deel2 = BOEKJES.flatMap((b) =>
  b.paginas.map((p, i) => ({ slug: `${b.id}-${i + 1}`, text: p.tekst, path: `public/assets/audio/boekjes/${b.id}-${i + 1}.mp3` })),
);

function schrijf(deel: number, kopjes: [string, { slug: string; text: string; path: string }[]][], bestand: string, seconden: number): void {
  const regels: Regel[] = [];
  let txt = `Opnamelijst 5 deel ${deel} (ongeveer ${Math.round(seconden / 60 * 2) / 2} minuten).\n` +
    'Lees alles in een keer voor, met 2 seconden stilte tussen elke regel. Zeg alleen de tekst.\n' +
    `Sla op als ${bestand}.\n` +
    (deel === 1 ? 'Bij "Schrijf de m van maan": zeg de klank van de letter (mmm), niet de naam (em), zoals in Veilig Leren Lezen.\n' : '');
  for (const [kop, lijst] of kopjes) {
    txt += `\n--- ${kop} (niet voorlezen) ---\n`;
    for (const r of lijst) {
      regels.push({ n: regels.length + 1, ...r });
      txt += `${regels.length}. ${r.text}\n`;
    }
  }
  writeFileSync(`bronbestanden/opnamelijst-5-deel-${deel}.json`, JSON.stringify(regels, null, 2) + '\n');
  writeFileSync(`bronbestanden/opnamelijst-5-deel-${deel}.txt`, txt);
  console.log(`deel ${deel}: ${regels.length} regels, ~${Math.round(seconden)} s`);
}

const tijd = (l: { text: string }[]) => l.reduce((t, r) => t + (r.text.includes(' ') ? 4.5 : 2.8), 0);
schrijf(1, [['instructies', deel1], ['woorden uit de leesboekjes', woorden]], 'opname5-deel1.m4a', tijd(deel1) + tijd(woorden));
schrijf(2, [['leesboekjes: lees elke bladzijde rustig en vrolijk voor', deel2]], 'opname5-deel2.m4a', tijd(deel2));
