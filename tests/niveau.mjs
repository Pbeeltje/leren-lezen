import { chromium } from 'playwright';
const OUT = process.argv[2] + '/';
const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }); const fouten = [];
const page = await (await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true })).newPage();
page.on('pageerror', (e) => fouten.push(e.message));
await page.goto('http://localhost:5173');
await page.evaluate(() => {
  localStorage.clear(); sessionStorage.clear();
  localStorage.setItem('leren-lezen:profielen', JSON.stringify([{ id: 'p', naam: 'Test', icoonId: 'vos', kleur: 0, aangemaakt: 1 }]));
  localStorage.setItem('leren-lezen:voortgang:p', JSON.stringify({ versie: 1, laatstGekozenLeeftijd: 6, kernen: {}, munten: 0 }));
});
await page.reload(); await page.waitForTimeout(600);
await page.locator('.icoon-tegel', { hasText: 'Test' }).click(); await page.waitForTimeout(500);
await page.locator('.icoon-tegel', { hasText: 'Muziek' }).click(); await page.waitForTimeout(500);
// ---- Speel na, niveau 6: speel de voorgespeelde melodie twee vragen lang goed na ----
await page.locator('.icoon-tegel', { hasText: 'Speel na' }).click(); await page.waitForTimeout(500);
await page.screenshot({ path: OUT + 'niveau-kies.png' });
await page.locator('.niveau-tegel').nth(5).click(); await page.waitForTimeout(300);
await page.evaluate(() => { window.__noten = []; new MutationObserver((ms) => { for (const m of ms) if (m.target.classList?.contains('xylofoon__staaf--aan') && m.oldValue && !m.oldValue.includes('--aan')) { const i = [...m.target.parentElement.children].indexOf(m.target), t = performance.now(); const l = window.__noten[window.__noten.length - 1]; if (!(l && l[0] === i && t - l[1] < 80)) window.__noten.push([i, t]); } }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'], attributeOldValue: true }); });
for (let v = 0; v < 2; v++) {
  if (v === 0) await page.evaluate(() => { window.__noten = []; });
  const n = await page.locator('.muziek-stippen span').count();
  await page.waitForFunction((n) => window.__noten.length >= n && !document.querySelector('.xylofoon--wacht'), n, { timeout: 30000 });
  const melodie = (await page.evaluate(() => window.__noten)).slice(0, n).map((x) => x[0]);
  console.log(`speel na vraag ${v + 1}: ${n} noten, ${await page.locator('.xylofoon__staaf').count()} staven, melodie ${melodie}`);
  if (v === 0) await page.screenshot({ path: OUT + 'speelna-6.png' });
  for (const i of melodie) { await page.locator('.xylofoon__staaf').nth(i).click({ force: true }); await page.waitForTimeout(150); }
  console.log('  goed-stippen', await page.locator('.muziek-stip--goed').count());
  await page.evaluate(() => { window.__noten = []; });
  await page.waitForTimeout(400);
}
console.log('voortgang na 2 goed:', await page.locator('.voortgangsbalk__stap--klaar, .voortgangsbalk .klaar').count());
await page.locator('.terug-knop').first().click(); await page.waitForTimeout(500);
console.log('laatst gemarkeerd:', await page.locator('.niveau-tegel--laatst').getAttribute('aria-label'));
await page.locator('.terug-knop').first().click(); await page.waitForTimeout(500);
// ---- Ritme, niveau 6 ----
await page.locator('.icoon-tegel', { hasText: 'Ritme' }).click(); await page.waitForTimeout(500);
await page.screenshot({ path: OUT + 'niveau-kies-ritme.png' });
await page.locator('.niveau-tegel').nth(5).click(); await page.waitForTimeout(300);
await page.evaluate(() => { window.__log = []; const laatst = {}; new MutationObserver(ms => { for (const m of ms) { const t = m.target; if (!t.classList?.contains('drum-pad--bonk')) continue; const soort = [...t.classList].find(c => /drum-pad--(bas|snare|bekken)$/.test(c)).split('--')[1]; const nu = performance.now(); if (laatst[soort] && nu - laatst[soort] < 60) continue; laatst[soort] = nu; window.__log.push([soort, nu]); } }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] }); });
for (let v = 0; v < 2; v++) {
  await page.waitForFunction(() => { const k = document.querySelector('.muziek-kaart'); return k && !k.dataset.gezien; }, null, { timeout: 20000 });
  const groepen = await page.locator('.muziek-figuur').evaluateAll(els => els.map(e => e.children.length));
  await page.evaluate(() => { document.querySelector('.muziek-kaart').dataset.gezien = '1'; window.__log = []; });
  const n = groepen.reduce((a, c) => a + c, 0);
  await page.waitForFunction((n) => window.__log.length >= n && !document.querySelector('.drumstel--voor'), n, { timeout: 30000 });
  const log = (await page.evaluate(() => window.__log)).slice(-n);
  const tussen = log.slice(1).map((x, i) => Math.round(x[1] - log[i][1]));
  if (v === 0) await page.screenshot({ path: OUT + 'ritme-6.png' });
  await page.locator(`.drum-pad--${log[0][0]}`).dispatchEvent('pointerdown');
  for (let i = 1; i < log.length; i++) { await page.waitForTimeout(tussen[i - 1]); await page.locator(`.drum-pad--${log[i][0]}`).dispatchEvent('pointerdown'); }
  await page.waitForTimeout(900);
  console.log(`ritme vraag ${v + 1}: figuren [${groepen}] = ${n} slagen; goed: ${await page.locator('.feedback-overlay__bericht.goed').count() > 0 || await page.locator('.muziek-kaart').evaluate(k => !k.dataset.gezien).catch(() => true)}`);
}
console.log('fouten', fouten); await b.close();
