// Bouwt opnamelijst-master.txt/.json uit alle opnamelijst-N-deel-M.json.
// Gebruik: node bronbestanden/maak-opnamelijst-master.mjs
// Draai dit opnieuw zodra er een nieuwe deel-lijst bij komt.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const deelRe = /^opnamelijst-(\d+)-deel-(\d+)\.json$/;
const delen = readdirSync(dir)
  .map((naam) => {
    const m = naam.match(deelRe);
    return m ? { naam, lijst: Number(m[1]), deel: Number(m[2]) } : null;
  })
  .filter(Boolean)
  .sort((a, b) => a.lijst - b.lijst || a.deel - b.deel);

const master = [];
let txt = 'Master-opnamelijst (gegenereerd, niet met de hand wijzigen).\n';
txt += 'Herbouw: node bronbestanden/maak-opnamelijst-master.mjs\n';
txt += `Delen: ${delen.map((d) => d.naam.replace('.json', '')).join(', ')}.\n`;

for (const d of delen) {
  const regels = JSON.parse(readFileSync(join(dir, d.naam), 'utf8'));
  txt += `\n--- lijst ${d.lijst} deel ${d.deel} (${regels.length} regels) ---\n`;
  for (const r of regels) {
    const n = master.length + 1;
    master.push({ n, lijst: d.lijst, deel: d.deel, slug: r.slug, text: r.text, path: r.path });
    txt += `${n}. ${r.text}\n`;
  }
}

writeFileSync(join(dir, 'opnamelijst-master.json'), JSON.stringify(master, null, 2) + '\n');
writeFileSync(join(dir, 'opnamelijst-master.txt'), txt);
console.log(`${delen.length} delen, ${master.length} regels → opnamelijst-master.txt`);
