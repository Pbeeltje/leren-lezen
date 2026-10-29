import { chromium } from 'playwright';
// Geheugenspel groep 3 met twee spelers: keuze, beurtwissel bij een misser, scorebord en uitslag.
// Gebruik: node tests/geheugen-tweespelers.mjs <map>
const OUT = process.argv[2] + '/';
const b = await chromium.launch(); const fouten = [];
for (const [w, h, tag] of [[390, 760, 'tel'], [360, 640, 'kleintel'], [1024, 1366, 'tablet'], [844, 390, 'liggend']]) {
  const page = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })).newPage();
  page.on('pageerror', (e) => fouten.push(e.message));
  await page.goto('http://localhost:5173');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('leren-lezen:gedempt', '1');
    localStorage.setItem('leren-lezen:profielen', JSON.stringify([{ id: 'a', naam: 'Anna', icoonId: 'draak', kleur: 0, aangemaakt: 1 }]));
    localStorage.setItem('leren-lezen:voortgang:a', JSON.stringify({ versie: 1, laatstGekozenLeeftijd: 6, kernen: {}, munten: 0 }));
  });
  await page.reload(); await page.waitForTimeout(700);
  await page.locator('.icoon-tegel', { hasText: 'Anna' }).click(); await page.waitForTimeout(700);
  await page.locator('.icoon-tegel', { hasText: 'Spelletjes' }).click(); await page.waitForTimeout(400);
  await page.locator('.icoon-tegel', { hasText: 'Geheugenspel' }).click(); await page.waitForTimeout(600);
  await page.screenshot({ path: OUT + tag + '-1-keuze.png' });
  await page.locator('.geheugen-keuze__knop', { hasText: '2 spelers' }).click(); await page.waitForTimeout(400);

  const plaatjes = await page.$$eval('.geheugen-kaart__voorkant', (xs) => xs.map((x) => x.getAttribute('src')));
  const paren = new Map();
  plaatjes.forEach((s, i) => paren.set(s, [...(paren.get(s) ?? []), i]));
  const lijst = [...paren.values()];
  const kaart = (i) => page.locator('.geheugen-kaart').nth(i);
  const stand = () => page.evaluate(() => ({
    beurt: document.querySelector('.geheugen-speler--beurt .geheugen-speler__naam')?.textContent,
    score: [...document.querySelectorAll('.geheugen-speler__score')].map((x) => x.textContent).join('-'),
  }));
  const wachtOpVrij = () => page.waitForTimeout(1300);

  // Speler 1 mist (kaart van paar 0 met kaart van paar 1) -> speler 2.
  await kaart(lijst[0][0]).click(); await kaart(lijst[1][0]).click(); await wachtOpVrij();
  const naMisser = await stand();
  // Speler 2 vindt paar 0 en 1, dan mist hij -> speler 1.
  await kaart(lijst[0][0]).click(); await kaart(lijst[0][1]).click(); await wachtOpVrij();
  await kaart(lijst[1][0]).click(); await kaart(lijst[1][1]).click(); await wachtOpVrij();
  await kaart(lijst[2][0]).click(); await kaart(lijst[3][0]).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: OUT + tag + '-2-spel.png' });
  await wachtOpVrij();
  const naTweede = await stand();
  // Speler 1 vindt de rest (6 paren) en wint 6-2.
  for (let p = 2; p < lijst.length; p++) { await kaart(lijst[p][0]).click(); await kaart(lijst[p][1]).click(); await wachtOpVrij(); }
  await page.waitForTimeout(1200);
  await page.screenshot({ path: OUT + tag + '-3-uitslag.png' });
  const uitslag = await page.locator('.geheugen-uitslag__tekst').textContent().catch(() => null);
  const bord = await page.evaluate(() => document.querySelector('.geheugen-uitslag')?.getBoundingClientRect().bottom <= innerHeight);
  console.log(tag, '| na misser:', JSON.stringify(naMisser), '| na speler 2:', JSON.stringify(naTweede), '| uitslag:', uitslag, '| in beeld:', bord);
  // Nog een keer: nieuw bord, 0-0, speler 1 begint.
  await page.locator('.geheugen-uitslag__opnieuw').click(); await page.waitForTimeout(400);
  console.log(tag, '| opnieuw:', JSON.stringify(await stand()), '| kaarten:', await page.locator('.geheugen-kaart').count());
  await page.close();
}
console.log('fouten', fouten); await b.close();
