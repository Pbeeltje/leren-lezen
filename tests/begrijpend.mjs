import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const OUT = process.argv[2];
if (!OUT) throw new Error('geef een uitvoermap');
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch();
const fouten = [];
const page = await (await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true })).newPage();
page.on('pageerror', (e) => fouten.push(e.message));
const w = (ms) => page.waitForTimeout(ms);
const munten = () => page.locator('.munten-teller').innerText();

await page.goto('http://localhost:5173');
await page.evaluate(() => {
  localStorage.clear();
  sessionStorage.clear();
  localStorage.setItem('leren-lezen:profielen', JSON.stringify([
    { id: 'k', naam: 'Noor', icoonId: 'vos', kleur: 0, aangemaakt: 1 },
    { id: 'g', naam: 'Bram', icoonId: 'kat', kleur: 0, aangemaakt: 2 },
  ]));
  localStorage.setItem('leren-lezen:voortgang:k', JSON.stringify({ versie: 1, laatstGekozenGroep: 'kleuter', kernen: {}, munten: 0, woordBlootstelling: {} }));
  localStorage.setItem('leren-lezen:voortgang:g', JSON.stringify({ versie: 1, laatstGekozenGroep: 'groep3', kernen: {}, munten: 0, woordBlootstelling: {} }));
});
await page.reload();
await w(700);

await page.locator('.icoon-tegel', { hasText: 'Noor' }).click();
await w(700);
const kleuter = await page.locator('.icoon-tegel__label').allTextContents();
console.log('kleuter onderwerpen:', kleuter.join(' | '));
if (kleuter.includes('Begrijpend lezen')) fouten.push('kleuter ziet begrijpend lezen');

await page.locator('.profiel-knop').click();
await w(300);
await page.locator('.profiel-menu__kop').click();
await w(700);
await page.locator('.icoon-tegel', { hasText: 'Bram' }).click();
await w(700);
const groep3 = await page.locator('.icoon-tegel__label').allTextContents();
console.log('groep 3 onderwerpen:', groep3.join(' | '));
if (!groep3.includes('Begrijpend lezen')) fouten.push('groep 3 ziet begrijpend lezen niet');

await page.locator('.icoon-tegel', { hasText: 'Begrijpend lezen' }).click();
await w(600);
await page.screenshot({ path: `${OUT}/kast.png` });
const titels = await page.locator('.boekje-kaft__titel').allTextContents();
console.log('verhalen:', titels.join(' | '));
if (titels.length !== 5) fouten.push(`verwacht 5 verhalen, kreeg ${titels.length}`);

const vragen = [];
for (let beurt = 0; beurt < 4; beurt++) {
  await page.locator('.boekje-kaft', { hasText: 'tom en de fiets' }).click();
  await w(500);
  const vraag = (await page.locator('.begrijpend-vraag').textContent())?.trim();
  const zinnen = await page.locator('.begrijpend-zin').allTextContents();
  console.log(`beurt ${beurt}:`, vraag);
  console.log('  tekst:', zinnen.join(' / '));
  if (!vraag) fouten.push('geen vraag');
  if (vragen.includes(vraag)) fouten.push(`vraag herhaald: ${vraag}`);
  vragen.push(vraag);
  if (beurt === 0) {
    await page.screenshot({ path: `${OUT}/fiets-staand.png` });
    const plek = await page.evaluate(() => {
      const vak = (el) => {
        const r = el.getBoundingClientRect();
        return `${Math.round(r.top)}-${Math.round(r.bottom)}`;
      };
      return {
        vh: innerHeight,
        knoppen: [...document.querySelectorAll('.keuze-knop')].map((el) => `${el.textContent.trim()} ${vak(el)}`),
        skip: vak(document.querySelector('.overslaan-knop')),
      };
    });
    console.log('plek', JSON.stringify(plek));
    const voor = await munten();
    await page.locator('.keuze-knop', { hasText: 'naar de winkel' }).click();
    await w(400);
    if ((await munten()) !== voor) fouten.push('fout antwoord gaf munten');
    if ((await page.locator('.begrijpend-vraag').textContent())?.trim() !== vraag) fouten.push('fout antwoord wisselde de vraag');
    await page.locator('.keuze-knop', { hasText: 'naar school' }).click();
    await w(1200);
    const na = await munten();
    console.log('munten', voor, '->', na);
    if (!na.includes('50')) fouten.push(`verwacht 50 munten, kreeg ${na}`);
    if (await page.locator('.begrijpend-vraag').count()) fouten.push('bleef op de vraag na een goed antwoord');
  } else {
    await page.locator('.overslaan-knop').click();
    await w(400);
  }
}
if (new Set(vragen).size !== 4) fouten.push(`niet 4 verschillende vragen: ${vragen.join(' / ')}`);

console.log('na de rondes, titel:', await page.locator('.scherm-titel').textContent());
try {
  await page.locator('.boekje-kaft', { hasText: 'tom en de fiets' }).click({ timeout: 4000 });
} catch (e) {
  await page.screenshot({ path: `${OUT}/na-rondes.png` });
  console.log('pagina:', (await page.locator('body').innerText()).slice(0, 500));
  throw e;
}
await w(400);
const vijfde = (await page.locator('.begrijpend-vraag').textContent())?.trim();
console.log('beurt 4 (ronde):', vijfde);
if (vijfde !== vragen[0]) fouten.push(`na 4 vragen verwacht ${vragen[0]}, kreeg ${vijfde}`);
await page.locator('.terug-knop').click();
await w(400);
const terugMunten = await munten();
if (!terugMunten.includes('50')) fouten.push('terug zonder antwoord veranderde munten');

await page.setViewportSize({ width: 844, height: 390 });
await page.locator('.boekje-kaft', { hasText: 'de eendjes' }).click();
await w(500);
await page.screenshot({ path: `${OUT}/eendjes-liggend.png` });
const vraagLiggend = await page.locator('.begrijpend-vraag').textContent();
const knoppen = await page.locator('.keuze-knop').allTextContents();
console.log('eendjes:', vraagLiggend, knoppen.join(' | '));
if (knoppen.length !== 4) fouten.push(`verwacht 4 keuzes, kreeg ${knoppen.length}`);
await page.locator('.begrijpend-woord', { hasText: 'eendjes' }).first().click();
await w(200);

await page.locator('.overslaan-knop').click();
await w(300);
await page.locator('.boekje-kaft', { hasText: 'de kat en de hond' }).click();
await w(400);
await page.screenshot({ path: `${OUT}/kat-liggend.png` });

console.log('fouten', fouten);
await b.close();
if (fouten.length) process.exit(1);
