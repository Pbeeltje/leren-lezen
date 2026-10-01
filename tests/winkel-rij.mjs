import { chromium } from 'playwright';
// Winkel: eigen spullen vooraan en hoeveel achtergronden er zonder bladeren passen.
// Gebruik: node tests/winkel-rij.mjs <map>
const OUT = process.argv[2] + '/';
const b = await chromium.launch(); const fouten = [];
for (const [w, h, tag] of [[390, 760, 'tel'], [360, 640, 'kleintel'], [1100, 800, 'pc'], [1024, 1366, 'tablet'], [844, 390, 'liggend']]) {
  const page = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
  page.on('pageerror', (e) => fouten.push(e.message));
  await page.goto('http://localhost:5173');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('leren-lezen:profielen', JSON.stringify([{ id: 'a', naam: 'Anna', icoonId: 'draak', kleur: 0, aangemaakt: 1 }]));
    localStorage.setItem('leren-lezen:voortgang:a', JSON.stringify({ versie: 1, laatstGekozenLeeftijd: 6, kernen: {}, munten: 120, gekocht: ['figuur:draak', 'figuur:vos', 'achtergrond:boerderij'] }));
    localStorage.setItem('leren-lezen:achtergrond:a', 'boerderij');
  });
  await page.reload(); await page.waitForTimeout(700);
  await page.locator('.icoon-tegel', { hasText: 'Anna' }).click(); await page.waitForTimeout(700);
  await page.locator('.munten-teller').click(); await page.waitForTimeout(700);
  await page.screenshot({ path: OUT + tag + '-figuren.png' });
  const eerste = await page.locator('.winkel-kaart').evaluateAll((k) => k.slice(0, 8).map((x) => x.getAttribute('aria-label')));
  await page.locator('.winkel__tab', { hasText: 'Achtergronden' }).click(); await page.waitForTimeout(500);
  await page.screenshot({ path: OUT + tag + '-achtergronden.png' });
  const bladen = await page.locator('.winkel__blader--achtergrond .bladeraar__blad').count();
  const past = await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1 && document.querySelector('.scherm').scrollHeight <= document.querySelector('.scherm').clientHeight + 1);
  const volgorde = await page.locator('.winkel__blader--achtergrond .winkel-kaart').evaluateAll((k) => k.map((x) => x.getAttribute('aria-label').split(/[: ]/)[0]).join(','));
  console.log(tag, '| figuren:', eerste.slice(0, 4).join(' / '), '| achtergrond-bladen:', bladen, '| past zonder scrollen:', past, '|', volgorde);
  await page.close();
}
console.log('fouten', fouten); await b.close();
