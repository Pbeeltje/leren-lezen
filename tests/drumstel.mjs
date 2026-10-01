import { chromium } from 'playwright';
// Vijfdelig drumstel (vrij spelen), Ritme met de nieuwe snare, en Luisteren voorop bij kleuters.
// Gebruik: node tests/drumstel.mjs <map>
const OUT = process.argv[2] + '/';
const b = await chromium.launch(); const fouten = [];
for (const [bw, bh, tag] of [[390, 844, 'tel'], [844, 390, 'liggend'], [1024, 1366, 'tablet']]) {
  const page = await (await b.newContext({ viewport: { width: bw, height: bh }, hasTouch: true })).newPage();
  page.on('pageerror', (e) => fouten.push(e.message));
  const w = (ms) => page.waitForTimeout(ms);
  await page.goto('http://localhost:5173');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('leren-lezen:profielen', JSON.stringify([{ id: 'a', naam: 'Tim', icoonId: 'trex', kleur: 0, aangemaakt: 1 }]));
    localStorage.setItem('leren-lezen:voortgang:a', JSON.stringify({ versie: 1, laatstGekozenLeeftijd: 4, kernen: {}, munten: 0 }));
  });
  await page.reload(); await w(700);
  await page.locator('.icoon-tegel', { hasText: 'Tim' }).click(); await w(700);
  if (tag === 'tel') console.log('kleuter onderwerpen:', (await page.locator('.icoon-tegel__label').allTextContents()).join(', '));
  await page.locator('.icoon-tegel', { hasText: 'Muziek' }).click(); await w(500);
  await page.locator('.icoon-tegel', { hasText: 'Vrij spelen' }).click(); await w(500);
  await page.locator('.muziek-wissel__knop', { hasText: 'Drumstel' }).click(); await w(400);
  const pads = await page.locator('.drum-pad').evaluateAll((p) => p.map((x) => { const r = x.getBoundingClientRect(); return `${x.getAttribute('aria-label')} ${Math.round(r.width)}x${Math.round(r.height)}@${Math.round(r.left)},${Math.round(r.top)}`; }));
  for (const p of await page.locator('.drum-pad').all()) { await p.dispatchEvent('pointerdown'); await w(80); }
  const pastOpScherm = await page.evaluate(() => [...document.querySelectorAll('.drum-pad')].every((p) => { const r = p.getBoundingClientRect(); return r.bottom <= innerHeight && r.right <= innerWidth && r.left >= 0; }));
  console.log(tag, '| op scherm:', pastOpScherm, '|', pads.join(' | '));
  await page.screenshot({ path: OUT + tag + '-drumstel.png' });
  if (tag === 'tel') {
    await page.locator('.terug-knop').first().click(); await w(500);
    await page.locator('.icoon-tegel', { hasText: 'Ritme' }).click(); await w(500);
    await page.locator('.niveau-tegel').nth(2).click(); await w(4000);
    await page.screenshot({ path: OUT + tag + '-ritme.png' });
  }
  await page.close();
}
console.log('fouten', fouten); await b.close();
