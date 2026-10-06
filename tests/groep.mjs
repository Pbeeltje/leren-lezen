import { chromium } from 'playwright';
const OUT = process.argv[2] + '/';
const b = await chromium.launch(); const fouten = [];
const page = await (await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true })).newPage();
page.on('pageerror', (e) => fouten.push(e.message));
const w = (ms) => page.waitForTimeout(ms);
const labels = () => page.locator('.icoon-tegel__label').allTextContents();
await page.goto('http://localhost:5173');
// Oude opslag: Anna was 4 jaar (-> kleuter), Bram 6 (-> groep 3), Cas nog niets.
await page.evaluate(() => {
  localStorage.clear(); sessionStorage.clear();
  localStorage.setItem('leren-lezen:profielen', JSON.stringify([
    { id: 'a', naam: 'Anna', icoonId: 'vos', kleur: 0, aangemaakt: 1 },
    { id: 'b', naam: 'Bram', icoonId: 'kat', kleur: 0, aangemaakt: 2 },
    { id: 'c', naam: 'Cas', icoonId: 'hond', kleur: 0, aangemaakt: 3 }]));
  localStorage.setItem('leren-lezen:voortgang:a', JSON.stringify({ versie: 1, laatstGekozenLeeftijd: 4, kernen: {}, munten: 0 }));
  localStorage.setItem('leren-lezen:voortgang:b', JSON.stringify({ versie: 1, laatstGekozenLeeftijd: 6, kernen: {}, munten: 0 }));
  localStorage.setItem('leren-lezen:voortgang:c', JSON.stringify({ versie: 1, kernen: {}, munten: 0 }));
});
await page.reload(); await w(700);
const naarProfielen = async () => { await page.locator('.profiel-knop').click(); await w(300); await page.locator('.profiel-menu__kop').click(); await w(700); };
await page.locator('.icoon-tegel', { hasText: 'Anna' }).click(); await w(700);
console.log('Anna (was 4) onderwerpen:', await labels());
await page.locator('.icoon-tegel', { hasText: 'Schrijven' }).click(); await w(600);
console.log('  kleuter schrijven:', await labels());
await page.locator('.terug-knop').click(); await w(600);
await page.locator('.icoon-tegel', { hasText: 'Leren lezen' }).click(); await w(600);
console.log('  kleuter lezen hoofdstukken:', await page.locator('.kern-rij--klikbaar').count());
await page.locator('.terug-knop').click(); await w(600);
await naarProfielen();
await page.locator('.icoon-tegel', { hasText: 'Bram' }).click(); await w(700);
console.log('Bram (was 6) onderwerpen:', await labels());
await page.locator('.icoon-tegel', { hasText: 'Schrijven' }).click(); await w(600);
console.log('  groep 3 schrijven:', await labels());
await page.locator('.terug-knop').click(); await w(600);
await page.locator('.icoon-tegel', { hasText: 'Leren lezen' }).click(); await w(600);
console.log('  groep 3 lezen hoofdstukken:', await page.locator('.kern-rij--klikbaar').count());
await page.locator('.terug-knop').click(); await w(600);
// Wisselen -> meteen de groepen in het submenu
await page.locator('.profiel-knop').click(); await w(800);
await page.locator('.profiel-tegel', { hasText: 'Wisselen' }).click(); await w(300);
const paneel = await page.locator('.profiel-menu__paneel').boundingBox();
await page.screenshot({ path: OUT + 'groep-menu.png', clip: paneel });
console.log('gemarkeerde groep:', await page.locator('.profiel-keuze.geselecteerd').textContent());
await page.locator('.profiel-keuze', { hasText: 'Kleuterschool' }).click(); await w(700);
console.log('Bram nu kleuter:', await labels());
await naarProfielen();
await page.locator('.icoon-tegel', { hasText: 'Cas' }).click(); await w(700);
console.log('Cas (niets) ziet:', await page.locator('.scherm-titel').textContent());
console.log('opgeslagen Bram:', await page.evaluate(() => JSON.parse(localStorage.getItem('leren-lezen:voortgang:b')).laatstGekozenGroep));
console.log('fouten', fouten); await b.close();
