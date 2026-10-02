import { chromium } from 'playwright';
// Geheugenspel voor groep 3 (16 kaarten): past het bord zonder scrollen, op alle formaten?
// Gebruik: node tests/geheugen-groep3.mjs <map>
const OUT = process.argv[2] + '/';
const b = await chromium.launch(); const fouten = [];
for (const [w, h, tag] of [[390, 760, 'tel'], [360, 640, 'kleintel'], [1100, 800, 'pc'], [1024, 1366, 'tablet'], [1366, 1024, 'tablet-liggend'], [844, 390, 'liggend']]) {
  const page = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
  page.on('pageerror', (e) => fouten.push(e.message));
  await page.goto('http://localhost:5173');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('leren-lezen:profielen', JSON.stringify([{ id: 'a', naam: 'Anna', icoonId: 'draak', kleur: 0, aangemaakt: 1 }]));
    localStorage.setItem('leren-lezen:voortgang:a', JSON.stringify({ versie: 1, laatstGekozenLeeftijd: 6, kernen: {}, munten: 0 }));
  });
  await page.reload(); await page.waitForTimeout(700);
  await page.locator('.icoon-tegel', { hasText: 'Anna' }).click(); await page.waitForTimeout(700);
  await page.locator('.icoon-tegel', { hasText: 'Spelletjes' }).click(); await page.waitForTimeout(400);
  await page.locator('.icoon-tegel', { hasText: 'Geheugenspel' }).click(); await page.waitForTimeout(900);
  const kaarten = await page.locator('.geheugen-kaart').count();
  // Twee kaarten omdraaien voor de foto.
  await page.locator('.geheugen-kaart').nth(0).click(); await page.locator('.geheugen-kaart').nth(1).click();
  await page.waitForTimeout(200);
  await page.screenshot({ path: OUT + tag + '.png' });
  const info = await page.evaluate(() => {
    const k = [...document.querySelectorAll('.geheugen-kaart')].map((x) => x.getBoundingClientRect());
    const onder = Math.max(...k.map((r) => r.bottom)); const rechts = Math.max(...k.map((r) => r.right)); const links = Math.min(...k.map((r) => r.left));
    return { maat: Math.round(k[0].width), onder: Math.round(onder), rechts: Math.round(rechts), links: Math.round(links), inBeeld: onder <= innerHeight && rechts <= innerWidth && links >= 0 };
  });
  console.log(tag, w + 'x' + h, '| kaarten:', kaarten, '|', JSON.stringify(info));
  await page.close();
}
console.log('fouten', fouten); await b.close();
