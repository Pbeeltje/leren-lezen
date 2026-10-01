import { chromium } from 'playwright';
// Savanne bekijken: zonsondergang, nacht en dag (echte tijd, ~65 s), plus juichen en feest.
// Gebruik: node tests/savanne.mjs <map>
const OUT = process.argv[2] + '/';
const b = await chromium.launch(); const fouten = [];
const momenten = [[1, 'avond-begin'], [12, 'avond-midden'], [21, 'avond-eind'], [30, 'nacht'], [40, 'dageraad'], [52, 'dag'], [63, 'avond-weer']];
await Promise.all([[390, 760, 'tel'], [1100, 800, 'pc'], [844, 390, 'liggend']].map(async ([w, h, tag]) => {
  const page = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
  page.on('pageerror', (e) => fouten.push(e.message));
  page.on('response', (r) => r.status() >= 400 && fouten.push(r.status() + ' ' + r.url()));
  await page.goto('http://localhost:5173');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('leren-lezen:profielen', JSON.stringify([{ id: 'a', naam: 'Anna', icoonId: 'vos', kleur: 0, aangemaakt: 1 }]));
    localStorage.setItem('leren-lezen:voortgang:a', JSON.stringify({ versie: 1, laatstGekozenLeeftijd: 6, kernen: {}, munten: 0 }));
    localStorage.setItem('leren-lezen:achtergrond:a', 'savanne');
  });
  await page.reload(); await page.waitForTimeout(700);
  await page.locator('.icoon-tegel', { hasText: 'Anna' }).click();
  const t0 = Date.now();
  const stuur = (naam) => page.evaluate(async (naam) => (await import('/src/engine/events.ts')).events.emit(naam, undefined), naam);
  for (const [s, naam] of momenten) {
    await page.waitForTimeout(Math.max(0, s * 1000 - (Date.now() - t0)));
    await page.screenshot({ path: `${OUT}${tag}-${naam}.png` });
    if (naam === 'avond-midden') {
      await stuur('antwoord-goed'); await page.waitForTimeout(500);
      await page.screenshot({ path: `${OUT}${tag}-juich.png` });
    }
    if (naam === 'dag') {
      await stuur('sessie-klaar'); await page.waitForTimeout(1600);
      await page.screenshot({ path: `${OUT}${tag}-feest.png` });
    }
  }
  await page.close();
}));
console.log('fouten', fouten); await b.close();
