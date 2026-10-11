import { chromium } from 'playwright';
// Op volgorde (Ontdekken): per schermmaat een screenshot van de eerste vraag en een half
// opgeloste vraag, daarna een hele set spelen (proberen tot elk plaatje in een vak zit).
// Gebruik: node tests/volgorde.mjs <map>
const OUT = process.argv[2] + '/';
const MATEN = [
  ['telefoon', 390, 844],
  ['klein', 360, 640],
  ['liggend', 844, 390],
  ['tablet', 1024, 768],
];
const b = await chromium.launch();
const fouten = [];
for (const [naam, breed, hoog] of MATEN) {
  const page = await (await b.newContext({ viewport: { width: breed, height: hoog }, hasTouch: true, deviceScaleFactor: 1 })).newPage();
  page.on('pageerror', (e) => fouten.push(`${naam}: ${e.message}`));
  const w = (ms) => page.waitForTimeout(ms);
  await page.goto(process.env.URL ?? 'http://localhost:5173');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('leren-lezen:profielen', JSON.stringify([{ id: 'a', naam: 'Anna', icoonId: 'vos', kleur: 0, aangemaakt: 1 }]));
    localStorage.setItem('leren-lezen:voortgang:a', JSON.stringify({ versie: 1, laatstGekozenLeeftijd: 4, kernen: {}, munten: 0 }));
  });
  await page.reload(); await w(700);
  await page.locator('.icoon-tegel', { hasText: 'Anna' }).click(); await w(700);
  await page.locator('.icoon-tegel', { hasText: 'Ontdekken' }).click(); await w(600);
  if (naam === 'telefoon') await page.screenshot({ path: `${OUT}tegels.png` });
  await page.locator('.icoon-tegel', { hasText: 'Op volgorde' }).click(); await w(1200);
  await page.screenshot({ path: `${OUT}${naam}-vraag.png` });

  // Los vragen op door elk zichtbaar plaatje te proberen; een goed plaatje verdwijnt.
  async function losOp(stopNa = Infinity) {
    let geplaatst = 0;
    while (geplaatst < stopNa) {
      const kaarten = page.locator('.volgorde-kaart:not(.volgorde-kaart--weg)');
      const aantal = await kaarten.count();
      if (aantal === 0) return true;
      for (let i = 0; i < aantal; i++) {
        const voor = await page.locator('.volgorde-kaart--weg').count();
        await kaarten.nth(i).click(); await w(120);
        if ((await page.locator('.volgorde-kaart--weg').count()) > voor) { geplaatst++; break; }
        await w(450);
      }
    }
    return false;
  }
  await losOp(2); await w(500);
  await page.screenshot({ path: `${OUT}${naam}-half.png` });
  await losOp(); await w(300);
  await page.screenshot({ path: `${OUT}${naam}-klaar.png` });
  if (naam === 'telefoon') {
    const instructies = [];
    for (let v = 0; v < 9; v++) {
      await page.waitForSelector('.volgorde-kaart:not(.volgorde-kaart--weg)', { timeout: 8000 });
      await w(300);
      instructies.push(`${await page.locator('.instructie-tekst').textContent()} (${await page.locator('.volgorde-kaart').count()})`);
      await losOp(); await w(200);
    }
    console.log('vragen:\n  ' + instructies.join('\n  '));
    await w(2500);
    console.log('klaar-kaart:', await page.locator('.klaar-kaart').count());
  }
  // Loopt iets buiten beeld?
  const overloop = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  console.log(naam, 'overloop', overloop);
  await page.context().close();
}
console.log('fouten', fouten);
await b.close();
