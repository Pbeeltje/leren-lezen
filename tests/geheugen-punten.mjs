import { chromium } from 'playwright';
// Geheugenspel met één speler: 100 punten, -2 per misser, record op het Records-scherm, geen munten.
// Groep 3 (8 paren) en kleuter (4 paren), één bord. Elke run 3 missers -> 94.
// Gebruik: node tests/geheugen-punten.mjs <map>
const OUT = process.argv[2] + '/';
const b = await chromium.launch(); const fouten = [];
for (const [groep, [w, h], tag] of [['groep3', [390, 760], 'g3-tel'], ['groep3', [844, 390], 'g3-liggend'], ['kleuter', [390, 760], 'kl-tel'], ['groep3', [360, 640], 'g3-kleintel']]) {
  const page = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })).newPage();
  page.on('pageerror', (e) => fouten.push(e.message));
  await page.goto('http://localhost:5173');
  await page.evaluate((groep) => {
    localStorage.clear(); localStorage.setItem('leren-lezen:gedempt', '1');
    localStorage.setItem('leren-lezen:profielen', JSON.stringify([{ id: 'a', naam: 'Anna', icoonId: 'draak', kleur: 0, aangemaakt: 1 }]));
    localStorage.setItem('leren-lezen:voortgang:a', JSON.stringify({ versie: 1, laatstGekozenGroep: groep, kernen: {}, munten: 0 }));
  }, groep);
  await page.reload(); await page.waitForTimeout(700);
  await page.locator('.icoon-tegel', { hasText: 'Anna' }).click(); await page.waitForTimeout(700);
  await page.locator('.icoon-tegel', { hasText: 'Spelletjes' }).click(); await page.waitForTimeout(400);
  await page.locator('.icoon-tegel', { hasText: 'Geheugenspel' }).click(); await page.waitForTimeout(600);
  if (groep === 'groep3') { await page.locator('.geheugen-keuze__knop', { hasText: '1 speler' }).click(); await page.waitForTimeout(400); }
  let missers = 3;
  {
    const bord = 0;
    await page.waitForSelector('.geheugen-kaart');
    const plaatjes = await page.$$eval('.geheugen-kaart__voorkant', (xs) => xs.map((x) => x.getAttribute('src')));
    const paren = new Map(); plaatjes.forEach((s, i) => paren.set(s, [...(paren.get(s) ?? []), i]));
    const lijst = [...paren.values()];
    const kaart = (i) => page.locator('.geheugen-kaart').nth(i);
    for (let p = 0; p < lijst.length; p++) {
      if (missers > 0 && p + 1 < lijst.length) {
        missers--;
        await kaart(lijst[p][0]).click(); await kaart(lijst[p + 1][0]).click();
        if (bord === 0 && missers === 2) { await page.waitForTimeout(1000); await page.screenshot({ path: OUT + tag + '-1-misser.png', clip: { x: 0, y: 0, width: w, height: Math.min(h, 420) } }); }
        await page.waitForTimeout(1300);
      }
      await kaart(lijst[p][0]).click(); await kaart(lijst[p][1]).click(); await page.waitForTimeout(1300);
    }
  }
  await page.waitForTimeout(1500);
  await page.screenshot({ path: OUT + tag + '-2-klaar.png' });
  const eind = await page.evaluate(() => ({
    tekst: document.querySelector('.geheugen-eindpunten')?.textContent,
    inBeeld: document.querySelector('.klaar-kaart__knop')?.getBoundingClientRect().bottom <= innerHeight,
    munten: JSON.parse(localStorage.getItem('leren-lezen:voortgang:a')).munten, // geheugen geeft geen munten
  }));
  await page.locator('.klaar-kaart__knop').click(); await page.waitForTimeout(500);
  await page.locator('.icoon-tegel', { hasText: 'Records' }).click(); await page.waitForTimeout(500);
  const record = await page.locator('.record-kaart', { hasText: 'Geheugenspel' }).textContent();
  console.log(tag, '|', JSON.stringify(eind), '| records:', record.replace(/\s+/g, ' ').trim());
  await page.close();
}
console.log('fouten', fouten); await b.close();
