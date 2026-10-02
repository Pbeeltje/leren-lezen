import { chromium } from 'playwright';
// Gitaar, harp en steelgitaar: kiezen in Vrij spelen en Speel na, kopen via het slotje en
// via de munt, en of alles op het scherm past.
// Gebruik: node tests/instrumenten.mjs <map>
const OUT = process.argv[2] + '/';
const b = await chromium.launch(); const fouten = [];
for (const [bw, bh, tag] of [[390, 844, 'tel'], [844, 390, 'liggend'], [1024, 1366, 'tablet'], [1366, 768, 'pc']]) {
  const page = await (await b.newContext({ viewport: { width: bw, height: bh }, hasTouch: true })).newPage();
  page.on('pageerror', (e) => fouten.push(`${tag}: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') fouten.push(`${tag}: ${m.text()}`); });
  const w = (ms) => page.waitForTimeout(ms);
  const foto = (naam) => page.screenshot({ path: `${OUT}${tag}-${naam}.png` });
  await page.goto('http://localhost:5173');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('leren-lezen:profielen', JSON.stringify([{ id: 'a', naam: 'Tim', icoonId: 'trex', kleur: 0, aangemaakt: 1 }]));
    localStorage.setItem('leren-lezen:voortgang:a', JSON.stringify({ versie: 1, laatstGekozenGroep: 'groep3', kernen: {}, munten: 450, woordBlootstelling: {}, gekocht: ['instrument:gitaar', 'instrument:keyboard'] }));
  });
  await page.reload(); await w(700);
  await page.locator('.icoon-tegel', { hasText: 'Tim' }).click(); await w(700);
  await page.locator('.icoon-tegel', { hasText: 'Muziek' }).click(); await w(500);
  await page.locator('.icoon-tegel', { hasText: 'Vrij spelen' }).click(); await w(500);
  const sloten = await page.locator('.muziek-wissel__knop--slot').evaluateAll((k) => k.map((x) => x.dataset.instrument));
  const overlap = await page.evaluate(() => {
    const t = document.querySelector('.terug-knop').getBoundingClientRect();
    return [...document.querySelectorAll('.muziek-wissel > *')].some((k) => { const r = k.getBoundingClientRect(); return r.left < t.right && r.right > t.left && r.top < t.bottom && r.bottom > t.top; }) || [...document.querySelectorAll('.muziek-wissel > *')].some((k) => k.getBoundingClientRect().right > innerWidth);
  });
  console.log(tag, '| op slot:', sloten.join(','), '| overlapt terug of rand:', overlap);
  await foto('1-xylofoon');
  await page.locator('.muziek-wissel__knop[data-instrument="gitaar"]').click(); await w(300);
  for (const s of await page.locator('.xylofoon__staaf').all()) { await s.dispatchEvent('pointerdown'); await page.dispatchEvent('body', 'pointerup'); await w(40); }
  await foto('2-gitaar');
  await page.locator('.muziek-wissel__knop[data-instrument="keyboard"]').click(); await w(300);
  await page.locator('.xylofoon__staaf').nth(3).dispatchEvent('pointerdown'); await w(100);
  await foto('2b-keyboard');
  // Harp heeft een slotje: tikken opent de winkel met het koopvenster.
  await page.locator('.muziek-wissel__knop[data-instrument="harp"]').click(); await w(700);
  await foto('3-koop-harp');
  await page.locator('.winkel-venster__knop--ja').click(); await w(500);
  await foto('4-winkel-na-koop');
  await page.locator('.terug-knop').first().click(); await w(600);
  console.log(tag, '| na koop harp:', await page.locator('.xylofoon').getAttribute('class'));
  await page.locator('.xylofoon__staaf').nth(2).dispatchEvent('pointerdown'); await w(100);
  await foto('5-harp');
  // De munt: de instrumenten in de winkel; steelgitaar kopen.
  await page.locator('.muziek-winkel-knop').click(); await w(700);
  await foto('6-winkel-instrumenten');
  await page.locator('.winkel-kaart', { hasText: 'Steelgitaar' }).click(); await w(300);
  await page.locator('.winkel-venster__knop--ja').click(); await w(500);
  await page.locator('.terug-knop').first().click(); await w(600);
  await foto('7-steelgitaar');
  await page.locator('.muziek-wissel__knop', { hasText: 'Drumstel' }).click(); await w(300);
  await foto('8-drumstel');
  // Speel na met het gekozen instrument.
  await page.locator('.terug-knop').first().click(); await w(500);
  await page.locator('.icoon-tegel', { hasText: 'Speel na' }).click(); await w(500);
  await page.locator('.niveau-tegel').nth(2).click(); await w(5500);
  const kaartPast = await page.evaluate(() => [...document.querySelectorAll('.muziek-kaart .xylofoon__staaf, .muziek-instrumenten > *')].every((e) => { const r = e.getBoundingClientRect(); return r.bottom <= innerHeight && r.right <= innerWidth && r.left >= 0 && r.top >= 0; }));
  console.log(tag, '| speel na:', await page.locator('.muziek-kaart .xylofoon').getAttribute('class'), '| past:', kaartPast, '| munten', await page.evaluate(() => JSON.parse(localStorage.getItem('leren-lezen:voortgang:a')).munten));
  await foto('9-speel-na-steel');
  await page.locator('.muziek-instrumenten .muziek-wissel__knop[data-instrument="harp"]').click(); await w(300);
  await foto('10-speel-na-harp');
  await page.close();
}
console.log('fouten', fouten); await b.close();
