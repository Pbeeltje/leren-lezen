import { chromium } from 'playwright';
// Vangspel: tegel met eigen figuur, Leesboekjes weg, spelen (eerst lekkers vangen, dan
// expres onder meteoren) tot het eindscherm. Gebruik: node tests/vangspel.mjs <map>
const OUT = process.argv[2] + '/';
const b = await chromium.launch(); const fouten = [];
for (const [bw, bh, tag] of [[390, 844, 'tel'], [844, 390, 'liggend']]) {
  const page = await (await b.newContext({ viewport: { width: bw, height: bh }, hasTouch: true })).newPage();
  page.on('pageerror', (e) => fouten.push(e.message));
  const w = (ms) => page.waitForTimeout(ms);
  await page.goto('http://localhost:5173');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('leren-lezen:profielen', JSON.stringify([{ id: 'a', naam: 'Tim', icoonId: 'trex', kleur: 0, aangemaakt: 1 }]));
    localStorage.setItem('leren-lezen:voortgang:a', JSON.stringify({ versie: 1, laatstGekozenLeeftijd: 6, kernen: {}, munten: 0 }));
  });
  await page.reload(); await w(700);
  await page.locator('.icoon-tegel', { hasText: 'Tim' }).click(); await w(700);
  console.log(tag, '| onderwerpen:', (await page.locator('.icoon-tegel__label').allTextContents()).join(', '));
  await page.screenshot({ path: OUT + tag + '-onderwerpen.png' });
  await page.locator('.icoon-tegel', { hasText: 'Vangspel' }).click(); await w(700);
  await page.screenshot({ path: OUT + tag + '-start.png' });
  await page.locator('.vang-venster__start').click();
  const veld = await page.locator('.vang-veld').boundingBox();
  const stuur = async (soort) => {
    const doel = await page.evaluate((soort) => {
      const s = document.querySelector('.vang-speler').getBoundingClientRect();
      let best = null;
      for (const d of document.querySelectorAll('.vang-ding--' + soort)) { const r = d.getBoundingClientRect(); if (r.bottom < s.top + 40 && (!best || r.bottom > best.bottom)) best = r; }
      return best && best.left + best.width / 2;
    }, soort);
    if (doel) await page.mouse.move(doel, veld.y + veld.height - 60);
  };
  await page.mouse.move(veld.x + veld.width / 2, veld.y + veld.height - 60); await page.mouse.down();
  for (let i = 0; i < 50; i++) { await stuur('lekker'); await w(100); }
  await page.screenshot({ path: OUT + tag + '-spel.png' });
  const tussen = await page.locator('.vang-score span').textContent();
  for (let i = 0; i < 400 && !(await page.locator('.vang-venster').count()); i++) { await stuur('meteoor'); await w(100); }
  await page.mouse.up(); await w(1000);
  await page.screenshot({ path: OUT + tag + '-eind.png' });
  console.log(tag, '| score na 5 s lekkers vangen:', tussen, '| eind:', await page.locator('.vang-venster__score span').textContent().catch(() => '-'), '|', await page.locator('.vang-venster__record').textContent().catch(() => '-'));
  await page.close();
}
console.log('fouten', fouten); await b.close();
