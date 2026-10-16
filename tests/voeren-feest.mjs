import { chromium } from 'playwright';
// Dieren voeren: tot 15 sterren spelen (feest + eindvenster), en tussentijds weg = record bewaard.
// Gebruik: node tests/voeren-feest.mjs <map>
const OUT = process.argv[2] + '/';
const b = await chromium.launch(); const fouten = [];
for (const [bw, bh, tag] of [[390, 844, 'tel'], [844, 390, 'liggend'], [1280, 800, 'pc']]) {
  const page = await (await b.newContext({ viewport: { width: bw, height: bh }, hasTouch: true, deviceScaleFactor: 1 })).newPage();
  page.on('pageerror', (e) => fouten.push(tag + ': ' + e.message));
  const w = (ms) => page.waitForTimeout(ms);
  await page.goto('http://localhost:5173');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('leren-lezen:profielen', JSON.stringify([{ id: 'a', naam: 'Tim', icoonId: 'kat', kleur: 0, aangemaakt: 1 }]));
    localStorage.setItem('leren-lezen:voortgang:a', JSON.stringify({ versie: 1, laatstGekozenLeeftijd: 6, kernen: {}, munten: 0 }));
  });
  await page.reload(); await w(700);
  await page.locator('.icoon-tegel', { hasText: 'Tim' }).click(); await w(700);
  await page.locator('.icoon-tegel', { hasText: 'Spelletjes' }).click(); await w(400);
  const open = async () => { await page.locator('.icoon-tegel', { hasText: 'Dieren voeren' }).click(); await w(600); await page.locator('.vang-venster__start').click(); };
  const voerGoed = async () => {
    for (let i = 0; i < 100; i++) {
      const zet = await page.evaluate(() => {
        const bak = document.querySelector('.voer-bak');
        if (!bak || bak.classList.contains('voer-bak--weg')) return null;
        const d = [...document.querySelectorAll('.voer-dier')].find((d) => d.dataset.staat === 'wacht');
        if (!d) return null;
        const knop = [...document.querySelectorAll('button.voer-eten:not(.voer-eten--weg)')].find((k) => k.dataset.eten === d.dataset.wil);
        if (!knop) return null;
        const k = knop.getBoundingClientRect(); const r = d.querySelector('.voer-dier__lijf').getBoundingClientRect();
        return { van: [k.left + k.width / 2, k.top + k.height / 2], naar: [r.left + r.width / 2, r.top + r.height / 2] };
      });
      if (!zet) { if (Number(await page.locator('.vang-score span').textContent()) >= 15) return false; await w(100); continue; }
      await page.mouse.move(...zet.van); await page.mouse.down();
      for (let s = 1; s <= 8; s++) { await page.mouse.move(zet.van[0] + ((zet.naar[0] - zet.van[0]) * s) / 8, zet.van[1] + ((zet.naar[1] - zet.van[1]) * s) / 8); await w(16); }
      await page.mouse.up(); await w(900);
      return true;
    }
    return false;
  };
  const score = () => page.evaluate(() => Number(document.querySelector('.vang-score span')?.textContent));
  const record = () => page.evaluate(() => localStorage.getItem('leren-lezen:voeren:a'));

  if (tag === 'tel') {
    // Tussentijds weg: 3 sterren, terugknop, record moet 3 zijn.
    await open();
    for (let i = 0; i < 3; i++) await voerGoed();
    const s = await score();
    await page.locator('.terug-knop, [aria-label="terug"]').first().click(); await w(500);
    console.log('weg na', s, 'sterren, record =', await record());
  }
  await open();
  for (let i = 0; i < 40 && (await score()) < 15; i++) await voerGoed();
  console.log(tag, 'score', await score());
  await page.waitForSelector('.voer-feest__beker', { state: 'attached', timeout: 5000 }); await w(2400); console.log(tag, 'venster al tijdens feest?', await page.locator('.vang-venster').count());
  const vel = await page.locator('.voer-veld').boundingBox();
  await page.screenshot({ path: OUT + tag + '-feest.png', clip: vel });
  const dieren = await page.locator('.voer-feest__dier').count();
  await page.waitForSelector('.vang-venster', { timeout: 10000 });
  await w(800);
  await page.screenshot({ path: OUT + tag + '-eind.png', clip: vel });
  console.log(tag, 'feestdieren', dieren, 'record', await record(), 'venster', (await page.locator('.vang-venster__record').textContent()));
  await page.close();
}
console.log('fouten:', fouten.length ? fouten : 'geen');
await b.close();
