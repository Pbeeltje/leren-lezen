import { chromium } from 'playwright';
// Vangspel per achtergrond: juiste plaatjes, gevaar rood. Gebruik: node tests/vangspel-thema.mjs <map>
const OUT = process.argv[2] + '/';
const b = await chromium.launch(); const fouten = [];
for (const thema of ['onderwater', 'herfst', 'boerderij']) {
  const page = await (await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true })).newPage();
  page.on('pageerror', (e) => fouten.push(e.message));
  const w = (ms) => page.waitForTimeout(ms);
  await page.goto('http://localhost:5173');
  await page.evaluate((thema) => {
    localStorage.clear();
    localStorage.setItem('leren-lezen:profielen', JSON.stringify([{ id: 'a', naam: 'Tim', icoonId: 'stegosaurus', kleur: 0, aangemaakt: 1 }]));
    localStorage.setItem('leren-lezen:voortgang:a', JSON.stringify({ versie: 1, laatstGekozenLeeftijd: 6, kernen: {}, munten: 0, gekocht: ['achtergrond:' + thema, 'figuur:stegosaurus'] }));
    localStorage.setItem('leren-lezen:achtergrond:a', thema);
  }, thema);
  await page.reload(); await w(700);
  await page.locator('.icoon-tegel', { hasText: 'Tim' }).click(); await w(700);
  await page.locator('.icoon-tegel', { hasText: 'Vangspel' }).click(); await w(800);
  await page.screenshot({ path: OUT + thema + '-start.png' });
  await page.locator('.vang-venster__start').click(); await w(7000);
  const srcs = await page.locator('.vang-ding').evaluateAll((d) => d.map((x) => x.getAttribute('src').split('/').pop() + (x.classList.contains('vang-ding--rood') ? '(rood)' : '')));
  console.log(thema, '|', [...new Set(srcs)].join(' '));
  await page.screenshot({ path: OUT + thema + '-spel.png' });
  await page.close();
}
console.log('fouten', fouten); await b.close();
