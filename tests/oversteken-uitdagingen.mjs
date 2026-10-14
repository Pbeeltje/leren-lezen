import { chromium } from 'playwright';
// Oversteken, uitdagingen (level 10+): per achtergrond meteen op een hoog level beginnen
// met gekozen uitdagingen, en een paar schermafdrukken van het veld terwijl de speler wat
// rondhopt. Gebruik:
//   node tests/oversteken-uitdagingen.mjs <map> <thema:uitdaging+uitdaging,...> [level] [BxH] [ms] [onsterfelijk]
//   bv. trein:baan-aan zee:kolos+overstekers winter:lawine
// Via de dev-hooks window.__oversteekLevel en window.__oversteekUitdagingen.
const OUT = process.argv[2] + '/';
const keuzes = (process.argv[3] || 'trein:baan-aan').split(',');
const level = Number(process.argv[4] || 15);
const [bw, bh] = (process.argv[5] || '390x844').split('x').map(Number);
const tussen = Number(process.argv[6] || 900); // ms tussen de schermafdrukken
const onsterfelijk = process.argv[7] === 'onsterfelijk'; // dev-hook: de speler gaat niet dood
const b = await chromium.launch(); const fouten = [];
for (const keuze of keuzes) {
  const [thema, wat] = keuze.split(':');
  const naam = keuze.replace(/[:+]/g, '-');
  const page = await (await b.newContext({ viewport: { width: bw, height: bh }, deviceScaleFactor: 1, hasTouch: true })).newPage();
  page.on('pageerror', (e) => fouten.push(naam + ': ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') fouten.push(naam + ': ' + m.text()); });
  const w = (ms) => page.waitForTimeout(ms);
  await page.goto('http://localhost:5173');
  await page.evaluate((thema) => {
    localStorage.clear();
    localStorage.setItem('leren-lezen:profielen', JSON.stringify([{ id: 'a', naam: 'Tim', icoonId: 'trex', kleur: 0, aangemaakt: 1 }]));
    localStorage.setItem('leren-lezen:voortgang:a', JSON.stringify({ versie: 1, laatstGekozenLeeftijd: 6, kernen: {}, munten: 0 }));
    localStorage.setItem('leren-lezen:achtergrond:a', thema);
  }, thema);
  await page.reload(); await w(700);
  await page.locator('.icoon-tegel', { hasText: 'Tim' }).click(); await w(600);
  await page.locator('.icoon-tegel', { hasText: 'Spelletjes' }).click(); await w(400);
  await page.locator('.icoon-tegel', { hasText: 'Oversteken' }).click(); await w(900);
  await page.evaluate(([l, u, o]) => { window.__oversteekLevel = l; window.__oversteekUitdagingen = u; window.__oversteekOnsterfelijk = o; }, [level, wat.split('+'), onsterfelijk]);
  await page.locator('.vang-venster__start').click(); await w(900);
  const veld = await page.locator('.ov-veld').boundingBox();
  const clip = { x: Math.max(0, veld.x), y: Math.max(0, veld.y - 4), width: Math.min(bw, veld.width), height: Math.min(bh - veld.y, veld.height + 8) };
  const stappen = ['ArrowUp', 'ArrowUp', null, 'ArrowLeft', 'ArrowUp', null, 'ArrowRight', 'ArrowUp', null, null];
  for (const [k, toets] of stappen.entries()) {
    if (toets) await page.keyboard.press(toets);
    await w(tussen);
    await page.screenshot({ path: OUT + `${naam}-${k}.png`, clip });
  }
  console.log(naam, '| level', await page.locator('.ov-level span').textContent(),
    '| hartjes', await page.locator('.vang-hartjes img:not(.vang-hart--weg)').count(),
    '| aan', await page.locator('.ov-aan').count(), '| keer', await page.locator('.ov-keer').count(),
    '| inslag', await page.locator('.ov-inslag').count(), '| npc', await page.locator('.ov-npc').count(),
    '| lawine', await page.locator('.ov-lawine').count(), '| storm', await page.locator('.ov-storm').count(),
    '| donker', await page.locator('.ov-donker').count(), '| water', await page.locator('.ov-baan--water').count(),
    '| kapot', await page.evaluate(() => [...document.querySelectorAll('.ov-scherm img')].filter((i) => i.complete && !i.naturalWidth).map((i) => i.src.split('/').pop()).join(',') || 0));
  await page.close();
}
console.log('fouten', fouten); await b.close();
