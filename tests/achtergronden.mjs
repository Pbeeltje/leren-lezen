import { chromium } from 'playwright';
// Achtergronden bekijken: rust, juichen (goed antwoord) en feest, op telefoon en pc.
// Gebruik: node tests/achtergronden.mjs <map> [thema ...]
const OUT = process.argv[2] + '/';
const themas = process.argv.slice(3).length ? process.argv.slice(3) : ['onderwater', 'boerderij'];
const b = await chromium.launch(); const fouten = [];
for (const [w, h, tag] of [[390, 760, 'tel'], [1100, 800, 'pc'], [844, 390, 'liggend'], [1290, 545, 'breed']]) {
  for (const thema of themas) {
    const page = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
    page.on('pageerror', (e) => fouten.push(e.message));
    page.on('response', (r) => r.status() >= 400 && fouten.push(r.status() + ' ' + r.url()));
    await page.goto('http://localhost:5173');
    await page.evaluate((thema) => {
      localStorage.clear();
      localStorage.setItem('leren-lezen:profielen', JSON.stringify([{ id: 'a', naam: 'Anna', icoonId: 'vos', kleur: 0, aangemaakt: 1 }]));
      localStorage.setItem('leren-lezen:voortgang:a', JSON.stringify({ versie: 1, laatstGekozenLeeftijd: 6, kernen: {}, munten: 0 }));
      localStorage.setItem('leren-lezen:achtergrond:a', thema);
    }, thema);
    await page.reload(); await page.waitForTimeout(700);
    await page.locator('.icoon-tegel', { hasText: 'Anna' }).click(); await page.waitForTimeout(1500);
    await page.screenshot({ path: `${OUT}${tag}-${thema}-rust.png` });
    const stuur = (naam) => page.evaluate(async (naam) => (await import('/src/engine/events.ts')).events.emit(naam, undefined), naam);
    await stuur('antwoord-goed'); await page.waitForTimeout(450);
    await page.screenshot({ path: `${OUT}${tag}-${thema}-juich.png` });
    await page.waitForTimeout(1500);
    await stuur('sessie-klaar'); await page.waitForTimeout(3500);
    await page.screenshot({ path: `${OUT}${tag}-${thema}-feest.png` });
    await page.close();
  }
}
console.log('fouten', fouten); await b.close();
