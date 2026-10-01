import { chromium } from 'playwright';
// Kleuter-lezen (eigen letterhoofdstukken), groep 3 ongewijzigd, gekleurd schermtoetsenbord
// en de muziekspellen op niveau 6 (liedjes en beat). Gebruik: node tests/kleuter-lezen.mjs <map>
const OUT = process.argv[2] + '/';
const b = await chromium.launch(); const fouten = [];
const page = await (await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })).newPage();
page.on('pageerror', (e) => fouten.push(e.message));
const w = (ms) => page.waitForTimeout(ms);
await page.goto('http://localhost:5173');
await page.evaluate(() => {
  localStorage.clear(); sessionStorage.clear();
  localStorage.setItem('leren-lezen:profielen', JSON.stringify([
    { id: 'a', naam: 'Anna', icoonId: 'vos', kleur: 0, aangemaakt: 1 },
    { id: 'b', naam: 'Bram', icoonId: 'kat', kleur: 0, aangemaakt: 2 }]));
  localStorage.setItem('leren-lezen:voortgang:a', JSON.stringify({ versie: 1, laatstGekozenLeeftijd: 4, kernen: {}, munten: 0 }));
  localStorage.setItem('leren-lezen:voortgang:b', JSON.stringify({ versie: 1, laatstGekozenLeeftijd: 6, kernen: {}, munten: 0 }));
});
await page.reload(); await w(700);
const naarProfielen = async () => { await page.locator('.profiel-knop').click(); await w(300); await page.locator('.profiel-menu__kop').click(); await w(700); };

// Kleuter
await page.locator('.icoon-tegel', { hasText: 'Anna' }).click(); await w(700);
await page.locator('.icoon-tegel', { hasText: 'Leren lezen' }).click(); await w(600);
console.log('kleuter hoofdstukken:', await page.locator('.kern-rij__titel').allTextContents());
await page.screenshot({ path: OUT + 'kleuter-hoofdstukken.png' });
await page.locator('.kern-rij--klikbaar').first().click(); await w(500);
await page.locator('.hoofdstuk-tegel', { hasText: 'Oefening 1' }).click(); await w(1200);
const vragen = [];
for (let i = 0; i < 6; i++) {
  const letter = (await page.locator('.oefen-kaart__groot-teken').textContent()).trim();
  const opties = await page.locator('.keuze-knop').allTextContents();
  vragen.push(letter + ': ' + opties.join('/'));
  if (i === 0) await page.screenshot({ path: OUT + 'kleuter-vraag.png' });
  const goed = opties.findIndex((o) => o.startsWith(letter));
  await page.locator('.keuze-knop').nth(goed).click(); await w(1800);
}
console.log('kleuter vragen:', vragen.join(' | '));
await page.screenshot({ path: OUT + 'kleuter-na-oefening.png' });
await page.goto('http://localhost:5173'); await w(700);

// Groep 3
await page.locator('.icoon-tegel', { hasText: 'Bram' }).click(); await w(700);
await page.locator('.icoon-tegel', { hasText: 'Leren lezen' }).click(); await w(600);
console.log('groep 3 hoofdstukken:', await page.locator('.kern-rij--klikbaar').count());
await page.locator('.terug-knop').click(); await w(600);

// Toetsenbord met kleuren
await page.evaluate(async () => {
  const { koppelSchermToetsenbord } = await import('/src/ui/components/SchermToetsenbord.ts');
  const s = document.createElement('div'); s.style.cssText = 'position:fixed;inset:0;z-index:999;background:#1d2b4a;display:flex;flex-direction:column;align-items:center;padding:200px 16px';
  s.innerHTML = '<div class="oefen-kaart"><input class="typen-invoer"></div>'; document.body.appendChild(s);
  koppelSchermToetsenbord(s.querySelector('input'), 'letters');
  s.id = 'tb';
});
await page.locator('#tb .scherm-toets', { hasText: 'v' }).first().click();
await page.locator('#tb .scherm-toets', { hasText: 'i' }).first().click();
await page.locator('#tb .scherm-toets', { hasText: 's' }).first().click();
console.log('getypt:', await page.locator('#tb input').inputValue(), '| klinkers:', await page.locator('#tb .scherm-toets--klinker').allTextContents());
await page.screenshot({ path: OUT + 'toetsenbord-kleuren.png' });
await page.evaluate(() => document.getElementById('tb').remove());

// Muziek niveau 6
await page.locator('.icoon-tegel', { hasText: 'Muziek' }).click(); await w(600);
for (const spel of ['Speel na', 'Ritme']) {
  await page.locator('.icoon-tegel', { hasText: spel }).click(); await w(600);
  await page.locator('.niveau-tegel').last().click(); await w(9000);
  console.log(spel, 'stippen:', await page.locator('.muziek-stippen span').count());
  await page.screenshot({ path: OUT + 'muziek-' + spel.replace(' ', '-') + '.png' });
  await page.locator('.terug-knop').first().click(); await w(500);
  await page.locator('.terug-knop').first().click(); await w(500);
}
console.log('fouten', fouten); await b.close();
