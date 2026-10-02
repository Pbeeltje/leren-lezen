import { chromium } from 'playwright';
// Tekenen: bewaren in 10 plekjes, vol -> kiezen welke weg mag, openen, weggooien, blijft na herladen.
// Gebruik: node tests/tekeningen.mjs <map>
const OUT = process.argv[2] + '/';
const b = await chromium.launch(); const fouten = [];
for (const [bw, bh, tag] of [[360, 640, 'kleintel'], [844, 390, 'liggend'], [1024, 768, 'tablet-liggend']]) {
  const page = await (await b.newContext({ viewport: { width: bw, height: bh }, hasTouch: true })).newPage();
  page.on('pageerror', (e) => fouten.push(e.message));
  const w = (ms) => page.waitForTimeout(ms);
  await page.goto('http://localhost:5173');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('leren-lezen:profielen', JSON.stringify([{ id: 'a', naam: 'Anna', icoonId: 'vos', kleur: 0, aangemaakt: 1 }]));
    localStorage.setItem('leren-lezen:voortgang:a', JSON.stringify({ versie: 1, laatstGekozenLeeftijd: 6, kernen: {}, munten: 0 }));
  });
  await page.reload(); await w(700);
  await page.locator('.icoon-tegel', { hasText: 'Anna' }).click(); await w(600);
  await page.locator('.icoon-tegel', { hasText: 'Spelletjes' }).click(); await w(500);
  await page.locator('.icoon-tegel', { hasText: 'Tekenen' }).click(); await w(600);
  const vak = await page.locator('.teken-canvas').boundingBox();
  const teken = async (n) => {
    for (let k = 0; k < 2; k++) {
      await page.locator('.teken-kleur').nth((n + k) % 9).click();
      await page.mouse.move(vak.x + vak.width * 0.2, vak.y + vak.height * (0.2 + 0.05 * n + 0.3 * k));
      await page.mouse.down();
      for (let i = 1; i <= 20; i++) await page.mouse.move(vak.x + vak.width * (0.2 + 0.03 * i), vak.y + vak.height * (0.2 + 0.05 * n + 0.3 * k) + Math.sin(i / 2 + n) * 40);
      await page.mouse.up();
    }
  };
  const knop = (label) => page.locator(`.teken-actie[aria-label="${label}"]`);
  await teken(0); await page.screenshot({ path: OUT + tag + '-tekenen.png' });
  // Nieuw blad vraagt eerst (niet bewaard); kruis = blijven, vinkje = leeg.
  await knop('nieuw blad').click(); await w(300);
  await page.screenshot({ path: OUT + tag + '-nieuw-blad-vraag.png' });
  const vraag = await page.locator('.teken-vraag').count();
  await page.locator('.teken-vraag__knop--nee').click(); await w(200);
  const leeg = () => page.evaluate(() => { const c = document.querySelector('.teken-canvas'); const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; for (let i = 3; i < d.length; i += 4) if (d[i]) return false; return true; });
  const naNee = await leeg();
  await knop('nieuw blad').click(); await w(200); await page.locator('.teken-vraag__knop--ja').click(); await w(200);
  console.log(tag, '| vraag:', vraag, '| na kruis leeg:', naNee, '| na vinkje leeg:', await leeg());
  await teken(0);
  for (let n = 0; n < 10; n++) {
    if (n > 0) { await knop('nieuw blad').click(); await teken(n); }
    await knop('bewaar').click(); await w(150);
  }
  await knop('nieuw blad').click(); await teken(3); await knop('bewaar').click(); await w(300);
  console.log(tag, '| vol-venster:', await page.locator('.teken-lijst__kop span').textContent(), '| plekken:', await page.locator('.teken-plek__open').count());
  await page.screenshot({ path: OUT + tag + '-vol.png' });
  await page.locator('.teken-plek__open').nth(4).click(); await w(300);
  const grootte = await page.evaluate(() => localStorage.getItem('leren-lezen:tekeningen:a').length);
  await page.reload(); await w(800);
  if (await page.locator('.icoon-tegel', { hasText: 'Anna' }).count()) { await page.locator('.icoon-tegel', { hasText: 'Anna' }).click(); await w(600); }
  await page.locator('.icoon-tegel', { hasText: 'Spelletjes' }).click(); await w(500);
  await page.locator('.icoon-tegel', { hasText: 'Tekenen' }).click(); await w(600);
  await knop('mijn tekeningen').click(); await w(400);
  await page.screenshot({ path: OUT + tag + '-lijst.png' });
  const voor = await page.locator('.teken-plek__open').count();
  await page.locator('.teken-plek__weg').first().click(); await w(200);
  await page.screenshot({ path: OUT + tag + '-weg-wiebel.png' });
  await page.locator('.teken-plek__weg').first().click({ force: true }); await w(300);
  const na = await page.locator('.teken-plek__open').count();
  await page.locator('.teken-plek__open').nth(2).click(); await w(400);
  await page.screenshot({ path: OUT + tag + '-geopend.png' });
  console.log(tag, '| opslag tekens:', grootte, '| na herladen:', voor, '-> na weggooien:', na);
  await page.close();
}
console.log('fouten', fouten); await b.close();
