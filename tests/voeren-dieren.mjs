import { chromium } from 'playwright';
// Dieren voeren: zet groepjes vast (dev-hook window.__voerGroepjes) en maakt foto's van de
// bijzondere binnenkomsten: vallende apen, glijdende pinguïn, rennende hond, springende poes,
// luiaard aan een liaan (en slapend), olifant die spuit, dino's. Voert elk groepje goed.
// Gebruik: node tests/voeren-dieren.mjs <map> [breedte] [hoogte]
const OUT = process.argv[2] + '/';
const bw = Number(process.argv[3] ?? 390), bh = Number(process.argv[4] ?? 844);
const ALLES = [['vlinder', 'vlinder', 'vlinder'], ['slang'], ['wolf', 'vos'], ['muis', 'olifant'], ['slak'], ['schildpad', 'slak'], ['bij', 'bij', 'bij'], ['muis', 'muisje', 'muisje', 'muisje', 'muisje'], ['aap', 'aap', 'aap'], ['leeuw', 'zebra'], ['pinguin'], ['hond'], ['poes'], ['luiaard'], ['olifant'], ['brachiosaurus', 'stegosaurus']];
const GROEPJES = process.env.ALLEEN ? ALLES.slice(0, Number(process.env.ALLEEN)) : ALLES;
const FOTO_NA = { vlinder: [1200, 3000], slang: [500, 2500], wolf: [1000, 2500], slak: [1500, 4000], schildpad: [2000, 5000], bij: [1200, 3000], muis: [2500], aap: [400, 2500], leeuw: [3000, 7000], pinguin: [500, 1300], hond: [700, 1600], poes: [600], luiaard: [900, 7500], olifant: [2350, 2700], brachiosaurus: [2000] };
const NIET_VOEREN = ['leeuw']; // die laten we jagen
const b = await chromium.launch(); const fouten = [];
const page = await (await b.newContext({ viewport: { width: bw, height: bh }, hasTouch: true })).newPage();
page.on('pageerror', (e) => fouten.push(e.message));
const w = (ms) => page.waitForTimeout(ms);
await page.goto('http://localhost:5173');
await page.evaluate(() => {
  localStorage.clear();
  localStorage.setItem('leren-lezen:profielen', JSON.stringify([{ id: 'a', naam: 'Tim', icoonId: 'kat', kleur: 0, aangemaakt: 1 }]));
  localStorage.setItem('leren-lezen:voortgang:a', JSON.stringify({ versie: 1, laatstGekozenLeeftijd: 6, kernen: {}, munten: 0 }));
});
await page.reload(); await w(700);
await page.locator('.icoon-tegel', { hasText: 'Tim' }).click(); await w(700);
await page.locator('.icoon-tegel', { hasText: 'Spelletjes' }).click(); await w(400);
await page.locator('.icoon-tegel', { hasText: 'Dieren voeren' }).click(); await w(600);
await page.evaluate((g) => { window.__voerGroepjes = g; }, GROEPJES);
await page.locator('.vang-venster__start').click();
const tag = `${bw}x${bh}`;
for (const groep of GROEPJES) {
  const t0 = Date.now();
  for (const ms of FOTO_NA[groep[0]] ?? []) {
    await w(Math.max(0, ms - (Date.now() - t0)));
    await page.screenshot({ path: `${OUT}${tag}-${groep.join('+')}-${ms}.png` });
  }
  // Voer iedereen goed.
  for (let k = 0; k < (NIET_VOEREN.includes(groep[0]) ? 0 : groep.length); k++) {
    let zet = null;
    for (let i = 0; i < 100 && !zet; i++) {
      zet = await page.evaluate(() => {
        const bak = document.querySelector('.voer-bak');
        if (!bak || bak.classList.contains('voer-bak--weg')) return null;
        for (const d of document.querySelectorAll('.voer-dier')) {
          if (d.dataset.staat !== 'wacht' || d.dataset.klaar) continue;
          const knop = [...document.querySelectorAll('button.voer-eten:not(.voer-eten--weg)')].find((x) => x.dataset.eten === d.dataset.wil);
          if (!knop) continue;
          d.dataset.klaar = '1';
          const a = knop.getBoundingClientRect(), r = d.querySelector('.voer-dier__lijf').getBoundingClientRect();
          return { van: [a.left + a.width / 2, a.top + a.height / 2], naar: [r.left + r.width / 2, r.top + r.height / 2] };
        }
        return null;
      });
      if (!zet) await w(100);
    }
    if (!zet) { console.log('kon niet voeren:', groep.join('+')); break; }
    await page.mouse.move(...zet.van); await page.mouse.down();
    for (let i = 1; i <= 10; i++) { await page.mouse.move(zet.van[0] + ((zet.naar[0] - zet.van[0]) * i) / 10, zet.van[1] + ((zet.naar[1] - zet.van[1]) * i) / 10); await w(16); }
    await page.mouse.up();
    // Meteen het volgende eten pakken terwijl het vorige nog vliegt.
    await w(150);
    if (k === 0 && groep.length > 1) await page.screenshot({ path: `${OUT}${tag}-${groep.join('+')}-gooien.png` });
  }
  // Wachten tot alles weg is.
  for (let i = 0; i < 120 && (await page.locator('.voer-dier').count()); i++) await w(100);
  console.log(groep.join('+'), '| score', await page.locator('.vang-score span').textContent());
}
console.log('fouten', fouten); await b.close();
