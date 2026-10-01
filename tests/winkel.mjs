import { chromium } from 'playwright';
const OUT = process.argv[2] + '/';
const b = await chromium.launch(); const fouten = [];
for (const [w, h, tag] of [[390, 760, 'tel'], [1100, 850, 'pc']]) {
const page = await (await b.newContext({ viewport: { width: w, height: h }, hasTouch: tag === 'tel' })).newPage();
page.on('pageerror', (e) => fouten.push(e.message));
page.on('response', (r) => r.status() >= 400 && fouten.push(r.status() + ' ' + r.url()));
await page.goto('http://localhost:5173');
await page.evaluate(() => {
  localStorage.clear(); sessionStorage.clear();
  localStorage.setItem('leren-lezen:profielen', JSON.stringify([{ id: 'a', naam: 'Anna', icoonId: 'vos', kleur: 0, aangemaakt: 1 }]));
  localStorage.setItem('leren-lezen:voortgang:a', JSON.stringify({ versie: 1, laatstGekozenLeeftijd: 6, kernen: {}, munten: 250 }));
  localStorage.setItem('leren-lezen:achtergrond:a', 'zee');
});
await page.reload(); await page.waitForTimeout(700);
await page.locator('.icoon-tegel', { hasText: 'Anna' }).click(); await page.waitForTimeout(700);
const munten = () => page.locator('.winkel__beurs span').textContent();
await page.locator('.munten-teller').click(); await page.waitForTimeout(700);
await page.screenshot({ path: OUT + tag + '-winkel-figuren.png' });
console.log(tag, 'kaarten', await page.locator('.winkel-kaart').count(), 'slot', await page.locator('.winkel-kaart--slot').count(), 'stippen', await page.locator('.bladeraar__stip').count());
// naar laatste bladzijde vegen en draak kopen
await page.locator('.bladeraar__rij').evaluate((r) => r.scrollTo({ left: r.scrollWidth }));
await page.waitForTimeout(500);
await page.locator('.winkel-kaart[aria-label^="draak"]').click(); await page.waitForTimeout(300);
await page.screenshot({ path: OUT + tag + '-winkel-koop.png' });
await page.locator('.winkel-venster__knop--ja').click(); await page.waitForTimeout(500);
console.log(tag, 'na draak:', await munten(), 'gekozen', await page.locator('.winkel-kaart--gekozen').getAttribute('aria-label'));
await page.locator('.winkel__tab', { hasText: 'Achtergronden' }).click(); await page.waitForTimeout(400);
await page.screenshot({ path: OUT + tag + '-winkel-achtergrond.png' });
await page.locator('.winkel-kaart[aria-label^="Kasteel"]').click(); await page.waitForTimeout(300);
await page.locator('.winkel-venster__knop--ja').click(); await page.waitForTimeout(500);
console.log(tag, 'na kasteel:', await munten(), await page.evaluate(() => [...document.body.classList].find((c) => c.startsWith('thema-'))));
await page.locator('.winkel-kaart[aria-label^="Dino"]').click(); await page.waitForTimeout(300);
console.log(tag, 'te duur:', await page.locator('.winkel-venster__sparen').textContent(), 'koopknop', await page.locator('.winkel-venster__knop--ja').count());
await page.screenshot({ path: OUT + tag + '-winkel-teduur.png' });
await page.locator('.winkel-venster__knop--nee').click();
await page.locator('.terug-knop').click(); await page.waitForTimeout(700);
await page.locator('.profiel-knop').click(); await page.waitForTimeout(300);
await page.locator('.profiel-tegel', { hasText: 'Mijn figuur' }).click(); await page.waitForTimeout(400);
console.log(tag, 'menu figuren:', await page.locator('.avatar-keuze').evaluateAll((a) => a.map((x) => x.dataset.icoon).join(',')));
await page.screenshot({ path: OUT + tag + '-menu-figuur.png' });
await page.locator('.profiel-menu__weergave:not([hidden]) .profiel-menu__terug').click();
await page.locator('.profiel-tegel', { hasText: 'Achtergrond' }).click(); await page.waitForTimeout(300);
console.log(tag, 'menu achtergronden:', await page.locator('.achtergrond-keuze').allTextContents());
await page.locator('.profiel-menu__weergave:not([hidden]) .profiel-menu__winkel').click(); await page.waitForTimeout(600);
console.log(tag, 'winkel via menu:', await page.locator('.winkel').count());
}
console.log('fouten', fouten); await b.close();
