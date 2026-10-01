import { chromium } from 'playwright';
// Winkel tijdens een opdracht: blokjes-oefening openen, in de winkel een achtergrond kopen,
// terug en kijken of de vraag (en de overslaan-knop) er nog is.
// Gebruik: node tests/winkel-tussendoor.mjs <map>
const OUT = process.argv[2] + '/';
const b = await chromium.launch(); const fouten = [];
const page = await (await b.newContext({ viewport: { width: 1100, height: 800 } })).newPage();
page.on('pageerror', (e) => fouten.push(e.message));
await page.goto('http://localhost:5173');
await page.evaluate(() => {
  localStorage.clear();
  localStorage.setItem('leren-lezen:profielen', JSON.stringify([{ id: 'a', naam: 'Anna', icoonId: 'vos', kleur: 0, aangemaakt: 1 }]));
  localStorage.setItem('leren-lezen:voortgang:a', JSON.stringify({ versie: 1, laatstGekozenGroep: 'groep3', kernen: {}, munten: 900 }));
});
await page.reload(); await page.waitForTimeout(700);
await page.locator('.icoon-tegel', { hasText: 'Anna' }).click(); await page.waitForTimeout(600);
await page.getByText('Leren lezen', { exact: true }).click(); await page.waitForTimeout(600);
await page.locator('.kern-rij--klikbaar').first().click(); await page.waitForTimeout(600);
await page.getByText('Oefening 1', { exact: true }).click(); await page.waitForTimeout(900);
for (let i = 0; i < 40; i++) {
  const t = await page.locator('.instructie-tekst').first().textContent();
  if (t.includes('blokjes')) break;
  await page.locator('.overslaan-knop').click(); await page.waitForTimeout(700);
}
const staat = () => page.evaluate(() => ({
  instructie: document.querySelector('.instructie-tekst')?.textContent,
  inhoud: document.querySelector('.scherm .voortgangsbalk')?.parentElement?.lastElementChild?.childElementCount ?? 0,
  overslaan: !!document.querySelector('.overslaan-knop'),
  thema: [...document.body.classList].find((c) => c.startsWith('thema-')),
}));
console.log('voor', await staat());
await page.screenshot({ path: OUT + 'voor.png' });
for (const naam of ['Savanne', 'Winter']) {
  await page.locator('.munten-teller').click(); await page.waitForTimeout(700);
  await page.locator('.winkel__tab', { hasText: 'Achtergronden' }).click(); await page.waitForTimeout(400);
  await page.locator('.winkel-kaart', { hasText: naam }).click(); await page.waitForTimeout(400);
  await page.locator('.winkel-venster__knop--ja').click(); await page.waitForTimeout(800);
  await page.locator('.terug-knop').click(); await page.waitForTimeout(1500);
  console.log('na', naam, await staat());
  await page.screenshot({ path: OUT + `na-${naam}.png` });
}
// Geheugenspel: twee kaarten omdraaien, naar de winkel en terug: bord moet blijven.
await page.locator('.terug-knop').click(); await page.waitForTimeout(600);
console.log('fouten', fouten); await b.close();
