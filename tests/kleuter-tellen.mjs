import { chromium } from 'playwright';
// Kleuter-tellen: eigen hoofdstukken (tot 4/6/8/10), alleen hoeveelheid <-> cijfer.
// Gebruik: node tests/kleuter-tellen.mjs <map>
const OUT = process.argv[2] + '/';
const b = await chromium.launch(); const fouten = [];
const page = await (await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true })).newPage();
page.on('pageerror', (e) => fouten.push(e.message));
const w = (ms) => page.waitForTimeout(ms);
await page.goto('http://localhost:5173');
await page.evaluate(() => {
  localStorage.clear();
  localStorage.setItem('leren-lezen:profielen', JSON.stringify([{ id: 'a', naam: 'Anna', icoonId: 'vos', kleur: 0, aangemaakt: 1 }]));
  localStorage.setItem('leren-lezen:voortgang:a', JSON.stringify({ versie: 1, laatstGekozenLeeftijd: 4, kernen: {}, munten: 0 }));
});
await page.reload(); await w(700);
await page.locator('.icoon-tegel', { hasText: 'Anna' }).click(); await w(700);
await page.locator('.icoon-tegel', { hasText: 'Tellen' }).click(); await w(600);
console.log('hoofdstukken:', await page.locator('.kern-rij__titel').allTextContents());
for (const [hst, maxGetal] of [[0, 4], [3, 10]]) {
  await page.locator('.kern-rij--klikbaar').nth(hst).click(); await w(500);
  await page.locator('.hoofdstuk-tegel', { hasText: 'Oefening 1' }).click(); await w(1200);
  const vragen = [];
  for (let i = 0; i < 5; i++) {
    const instructie = await page.locator('.instructie-tekst').textContent();
    const knoppen = await page.locator('.keuze-knop').evaluateAll((k) => k.map((x) => x.textContent.trim() || `[${x.querySelectorAll('img').length}]`));
    const getallen = knoppen.map((k) => Number(k.replace(/[[\]]/g, '')));
    vragen.push(`${instructie} ${knoppen.join('/')}${Math.max(...getallen) > maxGetal ? ' TE GROOT' : ''}`);
    if (i === 0) await page.screenshot({ path: `${OUT}hoofdstuk${hst + 1}-vraag.png` });
    if (i === 1) await page.screenshot({ path: `${OUT}hoofdstuk${hst + 1}-vraag2.png` });
    await page.locator('.overslaan-knop').click(); await w(900);
  }
  console.log(`hoofdstuk ${hst + 1} (max ${maxGetal}):\n  ` + vragen.join('\n  '));
  await page.goto('http://localhost:5173'); await w(700);
  if (await page.locator('.icoon-tegel', { hasText: 'Anna' }).count()) { await page.locator('.icoon-tegel', { hasText: 'Anna' }).click(); await w(600); }
  await page.locator('.icoon-tegel', { hasText: 'Tellen' }).click(); await w(600);
}
console.log('fouten', fouten); await b.close();
