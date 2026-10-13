import { chromium } from 'playwright';
const OUT = process.argv[2] + '/';
const b = await chromium.launch(); const fouten = [];
const page = await (await b.newContext({ viewport: { width: 390, height: 760 }, deviceScaleFactor: 1, hasTouch: true })).newPage();
page.on('pageerror', (e) => fouten.push(e.message));
await page.goto('http://localhost:5173');
await page.evaluate(() => {
  localStorage.clear();
  localStorage.setItem('leren-lezen:profielen', JSON.stringify([
    { id: 'pa', naam: 'Emma', icoonId: 'vos', kleur: 0, aangemaakt: 1 },
    { id: 'pb', naam: 'Daan', icoonId: 'kat', kleur: 0, aangemaakt: 2 }]));
  for (const id of ['pa', 'pb']) {
    localStorage.setItem('leren-lezen:voortgang:' + id, JSON.stringify({ versie: 1, kernen: {}, munten: 5 }));
    localStorage.setItem('leren-lezen:muziekniveau:' + id + ':piano', '2');
  }
});
await page.reload(); await page.waitForTimeout(700);
const tegels = () => page.locator('.icoon-tegel').allInnerTexts();
console.log('start:', await tegels());
await page.screenshot({ path: OUT + '1-start.png' });

// stap 1 en terug via Annuleren
await page.locator('.profiel-weghaal-knop').click(); await page.waitForTimeout(200);
console.log('weghaalmodus:', await page.locator('.scherm-titel').innerText(), await tegels(), 'terug:', await page.locator('.terug-knop').count());
await page.screenshot({ path: OUT + '2-modus.png' });
await page.locator('.profiel-weghaal-knop').click(); await page.waitForTimeout(200);
console.log('na annuleren:', await page.locator('.scherm-titel').innerText(), await tegels(), 'terug:', await page.locator('.terug-knop').count());

// stap 1 en terug via terugknop
await page.locator('.profiel-weghaal-knop').click(); await page.locator('.terug-knop').click(); await page.waitForTimeout(200);
console.log('na terugknop:', await page.locator('.scherm-titel').innerText());

// stap 2: venster, sluiten met Nee en met tikken ernaast
await page.locator('.profiel-weghaal-knop').click();
await page.locator('.icoon-tegel', { hasText: 'Emma' }).click(); await page.waitForTimeout(250);
await page.screenshot({ path: OUT + '3-venster.png' });
await page.locator('.winkel-venster__knop--nee').click();
console.log('na Nee venster:', await page.locator('.winkel-venster').count(), await page.locator('.scherm-titel').innerText());
await page.locator('.icoon-tegel', { hasText: 'Emma' }).click();
await page.waitForTimeout(250); await page.mouse.click(10, 740); await page.waitForTimeout(200);
console.log('na tik ernaast venster:', await page.locator('.winkel-venster').count());

// stap 3: verkeerde naam, dan goede naam
await page.locator('.icoon-tegel', { hasText: 'Emma' }).click();
await page.locator('.weghaal-venster__invoer').fill('Emm');
console.log('Emm -> knop disabled:', await page.locator('.weghaal-venster__knop--ja').isDisabled());
await page.locator('.weghaal-venster__invoer').fill('emma');
console.log('emma -> knop disabled:', await page.locator('.weghaal-venster__knop--ja').isDisabled());
await page.screenshot({ path: OUT + '4-getypt.png' });
await page.locator('.weghaal-venster__knop--ja').click(); await page.waitForTimeout(200);
console.log('na weghalen:', await page.locator('.scherm-titel').innerText(), await tegels());
console.log('sleutels:', await page.evaluate(() => Object.keys(localStorage).sort()));
await page.screenshot({ path: OUT + '5-na.png' });

// nieuw profiel: eerste figuur staat al gekozen
await page.locator('.icoon-tegel', { hasText: 'Nieuw profiel' }).click(); await page.waitForTimeout(600);
await page.locator('.profiel-vorm .typen-invoer').fill('Sam');
console.log('figuur gekozen:', await page.locator('.avatar-keuze.geselecteerd').count(), 'knop disabled:', await page.locator('.profiel-vorm .typen-knop').isDisabled());
await page.screenshot({ path: OUT + '6-nieuw.png' });
console.log('fouten', fouten); await b.close();
