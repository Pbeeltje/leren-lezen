import { chromium } from 'playwright';
// Trompetten: Vrij spelen en Speel na op vier schermen. Elke trompet staat in het vak,
// tikken op de beker raakt die trompet, en glijden speelt ze een voor een.
// Gebruik: node tests/trompetten.mjs <map>
const OUT = process.argv[2] + '/';
const b = await chromium.launch(); const fouten = [];
for (const [bw, bh, tag] of [[390, 844, 'tel'], [844, 390, 'liggend'], [1024, 1366, 'tablet'], [1366, 768, 'pc']]) {
  const page = await (await b.newContext({ viewport: { width: bw, height: bh }, hasTouch: true, deviceScaleFactor: 1 })).newPage();
  page.on('pageerror', (e) => fouten.push(`${tag}: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') fouten.push(`${tag}: ${m.text()}`); });
  const w = (ms) => page.waitForTimeout(ms);
  await page.goto('http://localhost:5173');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('leren-lezen:profielen', JSON.stringify([{ id: 'a', naam: 'Tim', icoonId: 'trex', kleur: 0, aangemaakt: 1 }]));
    localStorage.setItem('leren-lezen:voortgang:a', JSON.stringify({ versie: 1, laatstGekozenGroep: 'groep3', kernen: {}, munten: 50, woordBlootstelling: {}, gekocht: ['instrument:trompet'], instrument: 'trompet' }));
  });
  await page.reload(); await w(700);
  await page.locator('.icoon-tegel', { hasText: 'Tim' }).click(); await w(700);
  await page.locator('.icoon-tegel', { hasText: 'Muziek' }).click(); await w(500);
  await page.locator('.icoon-tegel', { hasText: 'Vrij spelen' }).click(); await w(600);
  // Elke beker binnen het vak, en een tik op het midden van de beker raakt die trompet.
  const meet = () => page.evaluate(() => {
    const vak = document.querySelector('.xylofoon--trompet').getBoundingClientRect();
    return [...document.querySelectorAll('.xylofoon--trompet .trompet__beker')].map((k, i) => {
      const r = k.getBoundingClientRect();
      const x = r.left + r.width / 2, y = r.top + r.height / 2;
      const raak = document.elementFromPoint(x, y)?.closest('.xylofoon__staaf')?.dataset.positie;
      return { i, binnen: r.left >= vak.left - 1 && r.right <= vak.right + 1 && r.top >= vak.top - 1 && r.bottom <= vak.bottom + 1, raak: Number(raak) === i, x, y };
    });
  });
  const vrij = await meet();
  console.log(tag, 'vrij | binnen:', vrij.every((m) => m.binnen), '| raak:', vrij.every((m) => m.raak), JSON.stringify(vrij.filter((m) => !m.binnen || !m.raak).map((m) => m.i)));
  await page.mouse.click(vrij[3].x, vrij[3].y); await w(120);
  await page.screenshot({ path: `${OUT}${tag}-vrij.png` });
  // Glijden over alle trompetten (langs de bekers).
  await page.evaluate(() => { window.__tikken = 0; document.querySelector('.xylofoon').addEventListener('animationstart', (e) => { if (e.animationName === 'trompet-aan') window.__tikken++; }); });
  await page.mouse.move(vrij[0].x, vrij[0].y); await page.mouse.down();
  for (const m of vrij) await page.mouse.move(m.x, m.y, { steps: 6 });
  await page.mouse.up(); await w(200);
  console.log(tag, 'glijden speelde', await page.evaluate(() => window.__tikken));
  await page.locator('.terug-knop').first().click(); await w(500);
  await page.locator('.icoon-tegel', { hasText: 'Speel na' }).click(); await w(500);
  await page.locator('.niveau-tegel').nth(2).click(); await w(1500);
  const na = await meet();
  const past = await page.evaluate(() => [...document.querySelectorAll('.muziek-instrumenten > *')].every((e) => { const r = e.getBoundingClientRect(); return r.bottom <= innerHeight && r.right <= innerWidth && r.left >= 0 && r.top >= 0; }));
  console.log(tag, 'speel na | binnen:', na.every((m) => m.binnen), '| raak:', na.every((m) => m.raak), '| knoppen passen:', past);
  await page.screenshot({ path: `${OUT}${tag}-speelna.png` });
  await page.close();
}
console.log('fouten', fouten); await b.close();
