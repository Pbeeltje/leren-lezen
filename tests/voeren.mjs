import { chromium } from 'playwright';
// Dieren voeren: tegel onder Spelletjes, slepen (screenshot halverwege), goed voeren tot er
// groepjes van meer dieren komen, dan drie keer fout tot het eindscherm.
// Gebruik: node tests/voeren.mjs <map> [groep3|kleuter]
const OUT = process.argv[2] + '/';
const leeftijd = process.argv[3] === 'kleuter' ? 4 : 6;
const b = await chromium.launch(); const fouten = [];
for (const [bw, bh, tag] of [[390, 844, 'tel'], [844, 390, 'liggend'], [1280, 800, 'pc']]) {
  const page = await (await b.newContext({ viewport: { width: bw, height: bh }, hasTouch: true })).newPage();
  page.on('pageerror', (e) => fouten.push(tag + ': ' + e.message));
  const w = (ms) => page.waitForTimeout(ms);
  await page.goto('http://localhost:5173');
  await page.evaluate((leeftijd) => {
    localStorage.clear();
    localStorage.setItem('leren-lezen:profielen', JSON.stringify([{ id: 'a', naam: 'Tim', icoonId: 'kat', kleur: 0, aangemaakt: 1 }]));
    localStorage.setItem('leren-lezen:voortgang:a', JSON.stringify({ versie: 1, laatstGekozenLeeftijd: leeftijd, kernen: {}, munten: 0 }));
  }, leeftijd);
  await page.reload(); await w(700);
  await page.locator('.icoon-tegel', { hasText: 'Tim' }).click(); await w(700);
  await page.locator('.icoon-tegel', { hasText: 'Spelletjes' }).click(); await w(400);
  if (tag === 'tel') await page.screenshot({ path: OUT + 'spellen.png' });
  await page.locator('.icoon-tegel', { hasText: 'Dieren voeren' }).click(); await w(600);
  await page.screenshot({ path: OUT + tag + '-start.png' });
  await page.locator('.vang-venster__start').click();

  const wachtOpBak = async () => {
    for (let i = 0; i < 80; i++) {
      const klaar = await page.evaluate(() => {
        const bak = document.querySelector('.voer-bak');
        return bak && !bak.classList.contains('voer-bak--weg') && bak.querySelectorAll('button.voer-eten:not(.voer-eten--weg)').length > 0;
      });
      if (klaar) return true;
      await w(100);
    }
    return false;
  };
  // Sleep eten (goed of fout) naar een wachtend dier, in stapjes zodat het echt sleept.
  const voer = async (goed, foto) => {
    const zet = await page.evaluate((goed) => {
      const dieren = [...document.querySelectorAll('.voer-dier')].filter((d) => d.dataset.staat === 'wacht');
      if (!dieren.length) return null;
      const d = dieren[Math.floor(Math.random() * dieren.length)];
      const knoppen = [...document.querySelectorAll('button.voer-eten:not(.voer-eten--weg)')];
      const wil = d.dataset.wil;
      const knop = goed ? knoppen.find((k) => k.dataset.eten === wil) : knoppen.find((k) => k.dataset.eten !== wil);
      if (!knop) return null;
      const k = knop.getBoundingClientRect(); const r = d.querySelector('.voer-dier__lijf').getBoundingClientRect();
      return { van: [k.left + k.width / 2, k.top + k.height / 2], naar: [r.left + r.width / 2, r.top + r.height / 2], dier: d.dataset.dier, eten: knop.dataset.eten, aantal: document.querySelectorAll('.voer-dier').length };
    }, goed);
    if (!zet) return null;
    await page.mouse.move(...zet.van); await page.mouse.down();
    const n = 12;
    for (let i = 1; i <= n; i++) {
      await page.mouse.move(zet.van[0] + ((zet.naar[0] - zet.van[0]) * i) / n, zet.van[1] + ((zet.naar[1] - zet.van[1]) * i) / n);
      await w(16);
      if (foto && i === 7) await page.screenshot({ path: OUT + tag + '-sleep.png' });
    }
    await page.mouse.up();
    if (foto) { await w(450); await page.screenshot({ path: OUT + tag + '-gooi.png' }); }
    return zet;
  };

  let gevoerd = 0; let meest = 0; let fotoGroep = false;
  for (let i = 0; i < 40 && gevoerd < 18; i++) {
    if (!(await wachtOpBak())) break;
    await w(150);
    const z = await voer(true, i === 0);
    if (!z) { await w(200); continue; }
    gevoerd++; meest = Math.max(meest, z.aantal);
    if (z.aantal > 1 && !fotoGroep) { fotoGroep = true; }
    await w(300);
    if (z.aantal >= (leeftijd === 4 ? 2 : 3) && fotoGroep === true) { fotoGroep = 'klaar'; }
    // Groepje vastleggen zodra alle dieren er staan.
    if (fotoGroep && fotoGroep !== 'gedaan') {
      const n = await page.evaluate(() => document.querySelectorAll('.voer-ballon--zie').length);
      if (n >= 2) { await page.screenshot({ path: OUT + tag + '-groep.png' }); fotoGroep = 'gedaan'; }
    }
    await w(150);
  }
  const score = await page.locator('.vang-score span').textContent();
  let fout = 0;
  for (let i = 0; i < 30 && !(await page.locator('.vang-venster').count()); i++) {
    if (!(await wachtOpBak())) { await w(300); continue; }
    await w(150);
    const z = await voer(false, fout === 0);
    if (z) { fout++; if (fout === 1) { await w(500); await page.screenshot({ path: OUT + tag + '-bah.png' }); } }
    await w(1200);
  }
  await w(1500);
  await page.screenshot({ path: OUT + tag + '-eind.png' });
  console.log(tag, '| gevoerd', gevoerd, '| meeste dieren tegelijk', meest, '| score', score, '| fout', fout, '| eind', await page.locator('.vang-venster__score span').textContent().catch(() => '-'));
  await page.close();
}
console.log('fouten', fouten); await b.close();
