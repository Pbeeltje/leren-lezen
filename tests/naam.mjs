import { chromium } from 'playwright';
const OUT = process.argv[2] + '/';
const b = await chromium.launch(); const fouten = [];
const page = await (await b.newContext({ viewport: { width: 390, height: 760 }, hasTouch: true })).newPage();
page.on('pageerror', (e) => fouten.push(e.message));
await page.goto('http://localhost:5173');
await page.evaluate(() => {
  localStorage.clear();
  localStorage.setItem('leren-lezen:profielen', JSON.stringify([
    { id: 'a', naam: 'WWWWWWWWWWWWWWWW', icoonId: 'vos', kleur: 0, aangemaakt: 1 },
    { id: 'b', naam: 'Anne-Sophie', icoonId: 'kat', kleur: 0, aangemaakt: 2 },
    { id: 'c', naam: 'Maximiliaan', icoonId: 'hond', kleur: 0, aangemaakt: 3 }]));
  for (const id of ['a','b','c']) localStorage.setItem('leren-lezen:voortgang:' + id, JSON.stringify({ versie: 1, laatstGekozenLeeftijd: 6, kernen: {}, munten: 0 }));
});
await page.reload(); await page.waitForTimeout(700);
await page.screenshot({ path: OUT + 'naam-profielen.png' });
await page.locator('.icoon-tegel').first().click(); await page.waitForTimeout(600);
await page.locator('.profiel-knop').click(); await page.waitForTimeout(300);
await page.screenshot({ path: OUT + 'naam-menu.png' });
await page.locator('.profiel-menu__kop').click(); await page.waitForTimeout(700);
console.log('na tik op naam profielen:', await page.locator('.icoon-tegel', { hasText: 'Anne-Sophie' }).count());
// nieuw profiel: max lengte
await page.locator('.icoon-tegel').last().click(); await page.waitForTimeout(600);
await page.locator('.typen-invoer').fill('ABCDEFGHIJKLMNOPQRSTUV');
console.log('invoer:', await page.locator('.typen-invoer').inputValue());
console.log('fouten', fouten); await b.close();
