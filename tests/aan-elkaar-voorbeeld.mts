// Alle schrijfletters "aan elkaar" en een paar woorden als SVG, om de vormen te bekijken.
// Gebruik: npx tsx tests/aan-elkaar-voorbeeld.mts <uit.html>
import { writeFileSync } from 'node:fs';
import { woordFiguurAanElkaar } from '../src/content/schrijven/aanElkaar.ts';
const regels = [
  'a b c d e f g h i j k l m'.split(' '),
  'n o p q r s t u v w x y z'.split(' '),
  ['maan', 'roos', 'vis', 'sok', 'pen', 'teen'],
  ['neus', 'buik', 'oog', 'doos', 'poes', 'koek'],
  ['ijs', 'zeep', 'huis', 'weg', 'bos', 'tak'],
  ['hut', 'jas', 'riem', 'bijl', 'hout', 'vuur'],
  ['geit', 'uil', 'duif', 'ei', 'wolf', 'aap'],
];
let svg = '';
let y = 0;
for (const r of regels) {
  let x = 20;
  for (const w of r) {
    const f = woordFiguurAanElkaar(w);
    const minX = Math.min(...f.halen.flat().map(([px]) => px));
    const dx = x - minX;
    svg += `<g transform="translate(${dx},${y})">`;
    svg += `<line x1="${minX - 5}" x2="${minX + f.breedte + 5}" y1="40" y2="40" stroke="#ccd" stroke-dasharray="3 3"/><line x1="${minX - 5}" x2="${minX + f.breedte + 5}" y1="80" y2="80" stroke="#99a"/>`;
    for (const h of f.halen) {
      if (h.length === 1) svg += `<circle cx="${h[0][0]}" cy="${h[0][1]}" r="3" fill="#c33"/>`;
      else svg += `<path d="${h.map(([a, b], i) => `${i ? 'L' : 'M'}${a.toFixed(1)} ${b.toFixed(1)}`).join(' ')}" fill="none" stroke="#235" stroke-width="2.5" stroke-linejoin="round"/>`;
      svg += `<circle cx="${h[0][0]}" cy="${h[0][1]}" r="3" fill="#2a2"/>`;
    }
    svg += `</g>`;
    x += f.breedte + 40;
  }
  y += 120;
}
writeFileSync(process.argv[2], `<html><body style="margin:0;background:#fff"><svg xmlns="http://www.w3.org/2000/svg" width="1400" height="${y}" viewBox="0 0 1400 ${y}">${svg}</svg></body></html>`);
