import { chromium } from 'playwright';
// Oversteken: per achtergrond het startvenster en een level in beeld, daarna een paar
// sprongetjes omhoog. Gebruik: node tests/oversteken.mjs <map> [thema,thema] [level] [BxH]
// Level zetten gaat via de dev-hook window.__oversteekLevel.
const OUT = process.argv[2] + '/';
const themas = (process.argv[3] || 'bouw').split(',');
const level = Number(process.argv[4] || 1);
const [bw, bh] = (process.argv[5] || '390x844').split('x').map(Number);
const b = await chromium.launch(); const fouten = [];
for (const thema of themas) {
  const page = await (await b.newContext({ viewport: { width: bw, height: bh }, deviceScaleFactor: 1, hasTouch: true })).newPage();
  page.on('pageerror', (e) => fouten.push(thema + ': ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') fouten.push(thema + ': ' + m.text()); });
  const w = (ms) => page.waitForTimeout(ms);
  await page.goto('http://localhost:5173');
  await page.evaluate((thema) => {
    localStorage.clear();
    localStorage.setItem('leren-lezen:profielen', JSON.stringify([{ id: 'a', naam: 'Tim', icoonId: 'trex', kleur: 0, aangemaakt: 1 }]));
    localStorage.setItem('leren-lezen:voortgang:a', JSON.stringify({ versie: 1, laatstGekozenLeeftijd: 6, kernen: {}, munten: 0 }));
    localStorage.setItem('leren-lezen:achtergrond:a', thema);
  }, thema);
  await page.reload(); await w(700);
  await page.locator('.icoon-tegel', { hasText: 'Tim' }).click(); await w(600);
  await page.locator('.icoon-tegel', { hasText: 'Spelletjes' }).click(); await w(400);
  if (thema === themas[0]) await page.screenshot({ path: OUT + 'spellen.png' });
  await page.locator('.icoon-tegel', { hasText: 'Oversteken' }).click(); await w(900);
  await page.screenshot({ path: OUT + `${thema}-start.png` });
  await page.evaluate((l) => { window.__oversteekLevel = l; }, level);
  await page.locator('.vang-venster__start').click(); await w(1500);
  await page.screenshot({ path: OUT + `${thema}-l${level}.png` });
  for (let i = 0; i < 3; i++) { await page.keyboard.press('ArrowUp'); await w(350); }
  await w(500);
  await page.screenshot({ path: OUT + `${thema}-l${level}-hop.png` });
  console.log(thema, '| level', await page.locator('.ov-level span').textContent(), '| score', await page.locator('.vang-score span').nth(1).textContent(),
    '| hartjes', await page.locator('.vang-hartjes img:not(.vang-hart--weg)').count(), '| banen', await page.locator('.ov-baan').count(), '| dingen', await page.locator('.ov-ding').count(),
    '| kapot', await page.evaluate(() => [...document.querySelectorAll('.ov-scherm img')].filter((i) => i.complete && !i.naturalWidth).map((i) => i.src.split('/').pop()).join(',') || 0));
  await page.close();
}
console.log('fouten', fouten); await b.close();
