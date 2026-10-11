import { chromium } from 'playwright';
// Oversteken: tekent de botsrand (rood) van alles in de rijbanen en die van de speler
// (blauw) over het spel, per thema één stilstaand beeld (de klok staat even stil).
// Gebruik: node tests/oversteken-botsing.mjs <map> [thema,thema] [level]
const OUT = process.argv[2] + '/';
const themas = (process.argv[3] || 'bouw').split(',');
const level = Number(process.argv[4] || 3);
const b = await chromium.launch(); const fouten = [];
for (const thema of themas) {
  const page = await (await b.newContext({ viewport: { width: 600, height: 844 }, deviceScaleFactor: 1 })).newPage();
  page.on('pageerror', (e) => fouten.push(thema + ': ' + e.message));
  const w = (ms) => page.waitForTimeout(ms);
  await page.goto('http://localhost:5173');
  await page.evaluate((thema) => {
    localStorage.clear();
    localStorage.setItem('leren-lezen:profielen', JSON.stringify([{ id: 'a', naam: 'Tim', icoonId: 'kat', kleur: 0, aangemaakt: 1 }]));
    localStorage.setItem('leren-lezen:voortgang:a', JSON.stringify({ versie: 1, laatstGekozenLeeftijd: 6, kernen: {}, munten: 0 }));
    localStorage.setItem('leren-lezen:achtergrond:a', thema);
  }, thema);
  await page.reload(); await w(700);
  await page.locator('.icoon-tegel', { hasText: 'Tim' }).click(); await w(500);
  await page.locator('.icoon-tegel', { hasText: 'Spelletjes' }).click(); await w(400);
  await page.locator('.icoon-tegel', { hasText: 'Oversteken' }).click(); await w(800);
  await page.evaluate((l) => { window.__oversteekLevel = l; }, level);
  await page.locator('.vang-venster__start').click(); await w(1800);
  await page.evaluate(() => {
    const c = parseFloat(document.querySelector('.ov-veld').style.getPropertyValue('--c'));
    // Kaders als kind van wat beweegt, zodat ze precies meeschuiven.
    const kader = (ouder, css, kleur) => {
      const k = document.createElement('div');
      k.style.cssText = `position:absolute;top:10%;bottom:10%;z-index:9;pointer-events:none;outline:2px solid ${kleur};background:${kleur}33;${css}`;
      ouder.appendChild(k);
    };
    for (const d of document.querySelectorAll('.ov-baan--weg .ov-ding')) {
      const m = Number(d.dataset.marge) * c;
      kader(d, `left:${m}px;right:${m}px`, '#ff0000');
    }
    kader(document.querySelector('.ov-speler'), `left:${0.2 * c}px;right:${0.2 * c}px`, '#0050ff');
  });
  const v = await page.locator('.ov-veld').boundingBox();
  await page.screenshot({ path: OUT + `botsing-${thema}.png`, clip: v, animations: 'disabled' });
  await page.close();
}
console.log('fouten', fouten); await b.close();
