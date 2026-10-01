import { chromium } from 'playwright';
// Winter: ijsvijver, vogeltjes en de weerwisseling (helder 20 s, licht 15 s, helder 20 s, storm 15 s).
// Gebruik: node tests/winterweer.mjs <map>
const OUT = process.argv[2] + '/';
const b = await chromium.launch(); const fouten = [];
const page = await (await b.newContext({ viewport: { width: 1100, height: 800 } })).newPage();
page.on('pageerror', (e) => fouten.push(e.message));
await page.goto('http://localhost:5173');
await page.evaluate(() => {
  localStorage.clear();
  localStorage.setItem('leren-lezen:profielen', JSON.stringify([{ id: 'a', naam: 'Anna', icoonId: 'vos', kleur: 0, aangemaakt: 1 }]));
  localStorage.setItem('leren-lezen:voortgang:a', JSON.stringify({ versie: 1, laatstGekozenLeeftijd: 6, kernen: {}, munten: 0, gekocht: ['achtergrond:winter'] }));
  localStorage.setItem('leren-lezen:achtergrond:a', 'winter');
});
await page.reload(); await page.waitForTimeout(700);
await page.locator('.icoon-tegel', { hasText: 'Anna' }).click(); await page.waitForTimeout(300);
await page.evaluate(() => document.querySelectorAll('.scherm, .terug-knop, .top-rechts-balk').forEach((e) => (e.style.visibility = 'hidden')));
const start = Date.now();
const toestand = () => page.evaluate(() => { const d = document.querySelector('.decor-winter'); return `${d.classList.contains('weer-storm') ? 'storm' : d.classList.contains('weer-licht') ? 'licht' : 'helder'}, vogels: ${document.querySelectorAll('.winter-vogel').length}`; });
for (const [s, naam] of [[7, 'helder'], [30, 'licht'], [56.5, 'storm-schuilen'], [62, 'storm']]) {
  const wacht = s * 1000 - (Date.now() - start);
  if (wacht > 0) await page.waitForTimeout(wacht);
  await page.screenshot({ path: `${OUT}winter-${naam}.png` });
  console.log(naam, '|', await toestand());
}
console.log('fouten', fouten); await b.close();
