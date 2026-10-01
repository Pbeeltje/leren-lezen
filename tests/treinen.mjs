import { chromium } from 'playwright';
// Treinreis: soorten treinen en stoppen bij station/sein. Kijkt 2 minuten mee en maakt een
// foto als een trein stilstaat of midden in beeld is. Gebruik: node tests/treinen.mjs <map>
const OUT = process.argv[2] + '/';
const b = await chromium.launch(); const fouten = [];
const page = await (await b.newContext({ viewport: { width: 1100, height: 800 } })).newPage();
page.on('pageerror', (e) => fouten.push(e.message));
await page.goto('http://localhost:5173');
await page.evaluate(() => {
  localStorage.clear();
  localStorage.setItem('leren-lezen:profielen', JSON.stringify([{ id: 'a', naam: 'Anna', icoonId: 'vos', kleur: 0, aangemaakt: 1 }]));
  localStorage.setItem('leren-lezen:voortgang:a', JSON.stringify({ versie: 1, laatstGekozenLeeftijd: 6, kernen: {}, munten: 0, gekocht: ['achtergrond:trein'] }));
  localStorage.setItem('leren-lezen:achtergrond:a', 'trein');
});
await page.reload(); await page.waitForTimeout(700);
await page.locator('.icoon-tegel', { hasText: 'Anna' }).click(); await page.waitForTimeout(500);
// Tegels weg, zodat de trein goed te zien is.
await page.evaluate(() => document.querySelectorAll('.scherm, .terug-knop, .top-rechts-balk').forEach((e) => (e.style.visibility = 'hidden')));
const gezien = new Map(); let foto = 0;
for (let s = 0; s < 120 && foto < 8; s += 1) {
  const info = await page.evaluate(() => {
    const t = document.querySelector('.trein-trein');
    if (!t) return null;
    return { soort: [...t.querySelectorAll('.trein-wagon')].map((w) => w.className.replace('trein-wagon trein-wagon--', '')).join(','), staat: t.classList.contains('trein-trein--staat'), sein: document.querySelector('.trein-sein').classList.contains('groen') ? 'groen' : 'rood' };
  });
  if (info) {
    const sleutel = info.soort + (info.staat ? '|staat' : '');
    if (!gezien.has(sleutel)) {
      gezien.set(sleutel, info.sein);
      if (info.staat || !gezien.has(info.soort + '|foto')) { await page.screenshot({ path: `${OUT}trein-${++foto}.png` }); gezien.set(info.soort + '|foto', 1); console.log(foto, info.staat ? 'STAAT STIL' : 'rijdt', '| sein', info.sein, '|', info.soort); }
    }
  }
  await page.waitForTimeout(1000);
}
console.log('fouten', fouten); await b.close();
