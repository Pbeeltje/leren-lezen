import { chromium } from 'playwright';
// Schrijfhoofdstukken (groep 3): overzicht, hoofdstuk, de drie oefeningen en het dictee
// als toets (schrijven, zelf nakijken, overzicht, sterren terug op het hoofdstuk).
// Gebruik: node tests/dictee.mjs <map>   (foto's per formaat)
const OUT = process.argv[2] + '/';
const b = await chromium.launch(); const fouten = [];

// Een "woord" met de muis: een paar boogjes en een stip, verschillend per woord.
async function krabbel(page, n) {
  const r = await page.locator('.dictee-blok').boundingBox();
  const x = (u) => r.x + (u / 280) * r.width; const y = (v) => r.y + (v / 116) * r.height;
  for (let l = 0; l < 3 + (n % 3); l++) {
    const x0 = 20 + l * 45;
    await page.mouse.move(x(x0), y(42)); await page.mouse.down();
    for (let t = 0; t <= 12; t++) await page.mouse.move(x(x0 + t * 2.6), y(60 + 18 * Math.sin((t / 12) * Math.PI * 2)));
    await page.mouse.up();
  }
  await page.mouse.click(x(250), y(30)); // stip
}

let eerste = true;
for (const [w, h, tag] of [[390, 760, 'tel'], [1024, 1366, 'tablet'], [844, 390, 'liggend']]) {
  const page = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })).newPage();
  page.on('pageerror', (e) => fouten.push(tag + ': ' + e.message));
  await page.goto('http://localhost:5173');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('leren-lezen:profielen', JSON.stringify([{ id: 'a', naam: 'Anna', icoonId: 'draak', kleur: 0, aangemaakt: 1 }]));
    localStorage.setItem('leren-lezen:voortgang:a', JSON.stringify({ versie: 1, laatstGekozenLeeftijd: 6, kernen: {}, munten: 0 }));
  });
  await page.reload(); await page.waitForTimeout(700);
  if (eerste) {
    eerste = false;
    const telling = await page.evaluate(async () => {
      const { SCHRIJF_HOOFDSTUKKEN } = await import('/src/content/schrijven/hoofdstukken.ts');
      return SCHRIJF_HOOFDSTUKKEN.map((h) => `${h.volgnummer} ${h.titel}: ${h.woorden.length} woorden, ${h.dicteeWoorden.length} dictee`);
    });
    console.log(telling.join('\n'));
  }
  await page.locator('.icoon-tegel', { hasText: 'Anna' }).click(); await page.waitForTimeout(700);
  await page.locator('.icoon-tegel', { hasText: 'Schrijven' }).click(); await page.waitForTimeout(400);
  const tegels = await page.locator('.icoon-tegel').allTextContents();
  await page.locator('.icoon-tegel', { hasText: 'Woorden schrijven' }).click(); await page.waitForTimeout(500);
  await page.screenshot({ path: OUT + tag + '-overzicht-hoofdstukken.png' });
  await page.locator('.kern-rij').first().click(); await page.waitForTimeout(500);
  await page.screenshot({ path: OUT + tag + '-hoofdstuk.png' });

  // Oefening 2 en 3: één woord schrijven, eerst "Nog een keer", dan Goed.
  for (const naam of ['Overschrijven', 'Luister en schrijf']) {
    await page.locator('.hoofdstuk-tegel', { hasText: naam }).click(); await page.waitForTimeout(500);
    await krabbel(page, 1);
    await page.screenshot({ path: OUT + tag + '-' + naam.split(' ')[0].toLowerCase() + '.png' });
    await page.locator('.dictee-klaar').click(); await page.waitForTimeout(100);
    await page.locator('.dictee-oordeel__knop--fout').click(); await page.waitForTimeout(100);
    const weerSchrijven = await page.locator('.dictee-blok').count();
    await krabbel(page, 2);
    await page.locator('.dictee-klaar').click(); await page.waitForTimeout(100);
    await page.locator('.dictee-oordeel__knop--goed').click(); await page.waitForTimeout(300);
    console.log(tag, naam, '| nog een keer -> weer schrijven:', weerSchrijven === 1);
    await page.locator('.terug-knop').click(); await page.waitForTimeout(400);
  }
  await page.locator('.hoofdstuk-tegel', { hasText: 'Overtrekken' }).click(); await page.waitForTimeout(500);
  const overtrek = await page.locator('.overtrek__vlak').count();
  await page.locator('.terug-knop').click(); await page.waitForTimeout(400);

  // Toets: het dictee.
  await page.locator('.hoofdstuk-tegel', { hasText: 'Dictee' }).click(); await page.waitForTimeout(500);
  const klaar = page.locator('.dictee-klaar');
  const leegUit = await klaar.isDisabled();
  await krabbel(page, 0);
  await page.locator('.dictee-gum').click();
  const naGum = await page.locator('.dictee-blok .dictee-inkt').count();
  const woorden = [];
  for (let i = 0; await page.locator('.dictee-blok').count(); i++) {
    woorden.push(await page.locator('.dictee-plaatje').getAttribute('src'));
    await krabbel(page, i);
    if (i === 0) await page.screenshot({ path: OUT + tag + '-dictee-schrijven.png' });
    await klaar.click(); await page.waitForTimeout(80);
  }
  await page.waitForTimeout(200);
  await page.screenshot({ path: OUT + tag + '-dictee-nakijken.png' });
  for (let i = 0; await page.locator('.dictee-oordeel').count(); i++) {
    await page.locator(i === 3 ? '.dictee-oordeel__knop--fout' : '.dictee-oordeel__knop--goed').click(); await page.waitForTimeout(60);
  }
  await page.waitForTimeout(300);
  await page.screenshot({ path: OUT + tag + '-dictee-overzicht.png' });
  const info = await page.evaluate(() => ({
    score: document.querySelector('.dictee-score')?.textContent,
    rijen: document.querySelectorAll('.dictee-rij').length,
    munten: document.querySelector('.dictee-overzicht .resultaat-munten-rij')?.textContent,
    horizontaalScroll: document.documentElement.scrollWidth > innerWidth,
  }));
  console.log(tag, w + 'x' + h, '| menu:', tegels.join(','), '| overtrekken:', overtrek === 1, '| klaar leeg uit:', leegUit, '| na gum:', naGum, '| woorden:', woorden.length, 'plaatjes:', new Set(woorden).size, '|', JSON.stringify(info));
  await page.locator('.dictee-eind-knoppen .klaar-kaart__knop').click(); await page.waitForTimeout(500);
  const gedaan = await page.locator('.hoofdstuk-tegel.gedaan').allTextContents();
  await page.screenshot({ path: OUT + tag + '-hoofdstuk-na.png' });
  // Terug: hoofdstuk -> overzicht -> schrijfmenu -> onderwerpen.
  await page.locator('.terug-knop').click(); await page.waitForTimeout(400);
  const detail = await page.locator('.kern-rij__oefentekst').first().textContent();
  await page.locator('.terug-knop').click(); await page.waitForTimeout(400);
  const naTerug1 = await page.locator('.icoon-tegel').allTextContents();
  await page.locator('.terug-knop').click(); await page.waitForTimeout(400);
  const naTerug2 = await page.locator('.icoon-tegel').allTextContents();
  console.log('  gedaan:', gedaan.join(','), '| overzicht:', detail, '| terug naar:', naTerug1.join(','), '| daarna:', naTerug2.join(','));
  await page.close();
}
console.log('fouten', fouten); await b.close();
