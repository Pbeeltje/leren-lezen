import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

// Tijd lezen (Leren lezen > Tijd lezen, groep 3): dagen en maanden. Speelt elke oefening en
// de toets goed (oefeningen met één fout erin), controleert de navigatie (Begrijpend lezen en
// Klokkijken staan niet meer los / onder Tellen) en maakt screenshots op een telefoon en tablet.
// Gebruik: node tests/tijd-lezen.mjs <map>

const map = process.argv[2] || 'tests/_tmp/tijd-lezen';
mkdirSync(map, { recursive: true });
const DAGEN = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'];
const MAANDEN = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];

const browser = await chromium.launch();
const fouten = [];

async function openApp(width, height) {
  const ctx = await browser.newContext({ viewport: { width, height }, hasTouch: true, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => {
    localStorage.setItem('leren-lezen:gedempt', '1');
    localStorage.setItem('leren-lezen:profielen', JSON.stringify([{ id: 'a', naam: 'Anna', icoonId: 'vos', kleur: 0, aangemaakt: 1 }]));
    if (!localStorage.getItem('leren-lezen:voortgang:a')) {
      localStorage.setItem('leren-lezen:voortgang:a', JSON.stringify({ versie: 1, laatstGekozenGroep: 'groep3', kernen: {}, munten: 0 }));
    }
  });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => fouten.push(e.message));
  page.on('console', (msg) => msg.type() === 'error' && fouten.push(msg.text()));
  await page.goto(process.env.TIJD_URL || 'http://localhost:5173');
  await page.locator('.icoon-tegel', { hasText: 'Anna' }).click();
  await page.locator('.icoon-tegel', { hasText: 'Leren lezen' }).waitFor();
  return page;
}

const foto = (page, naam) => page.screenshot({ path: `${map}/${naam}.png` });

async function naarHoofdstuk(page, titel) {
  await page.locator('.icoon-tegel', { hasText: 'Leren lezen' }).click();
  await page.locator('.icoon-tegel', { hasText: 'Tijd lezen' }).click();
  await page.locator('.icoon-tegel', { hasText: titel }).click();
  await page.locator('.hoofdstuk-tegel', { hasText: 'Oefening 1' }).waitFor();
}

async function teksten(loc) {
  return (await loc.allTextContents()).map((t) => t.trim());
}

// Eén vraag goed beantwoorden; met `fout` eerst een verkeerde knop.
async function beantwoord(page, lijst, fout) {
  // Een verse kaart: de vorige blijft even staan terwijl "Goed zo" uitpraat.
  // Gemarkeerd vóór het antwoorden, zodat de volgende vraag op een nieuwe kaart wacht.
  await page.locator('.kalender-kaart:not([data-klaar])').waitFor();
  await page.evaluate(() => document.querySelector('.kalender-kaart')?.setAttribute('data-klaar', '1'));
  const n = lijst.length;
  const naam = (i) => lijst[((i % n) + n) % n];
  const knoppen = page.locator('.kalender-knop:not(.kalender-knop--weg)');
  const vraag = page.locator('.kalender-vraag');
  if (await page.locator('.kalender-rij--volgorde').count()) {
    const opties = await teksten(knoppen);
    const volgorde = [...opties].sort((a, b) => lijst.indexOf(a) - lijst.indexOf(b));
    if (fout) {
      await knoppen.filter({ hasText: new RegExp(`^${volgorde[volgorde.length - 1]}$`) }).click();
      await page.waitForTimeout(600);
    }
    for (const w of volgorde) await page.locator('.kalender-knop', { hasText: new RegExp(`^${w}$`) }).click();
    return;
  }
  let antwoord;
  if (await vraag.count()) {
    const m = (await vraag.textContent()).match(/komt (voor|na) (\S+)\?/);
    antwoord = naam(lijst.indexOf(m[2]) + (m[1] === 'na' ? 1 : -1));
  } else {
    const vakjes = await teksten(page.locator('.kalender-vakje'));
    const gat = vakjes.indexOf('?');
    const ander = gat === 0 ? 1 : 0;
    antwoord = naam(lijst.indexOf(vakjes[ander]) + (gat - ander));
  }
  const opties = await teksten(knoppen);
  if (!opties.includes(antwoord)) throw new Error(`antwoord ${antwoord} niet tussen ${opties}`);
  if (fout) {
    await knoppen.filter({ hasText: new RegExp(`^${opties.find((o) => o !== antwoord)}$`) }).click();
    await page.waitForTimeout(600);
  }
  await knoppen.filter({ hasText: new RegExp(`^${antwoord}$`) }).click();
}

async function speel(page, label, lijst, prefix, aantal) {
  await page.locator('.hoofdstuk-tegel', { hasText: label }).click();
  await page.locator('.kalender-kaart').waitFor();
  await page.waitForTimeout(300);
  await foto(page, `${prefix}-${label.replace(' ', '')}`);
  for (let i = 0; i < aantal; i++) {
    await beantwoord(page, lijst, label !== 'Toets' && i === 1);
  }
}

// Navigatie: Leren lezen heeft drie onderdelen, Begrijpend lezen staat niet meer los,
// Klokkijken niet meer onder Tellen.
{
  const page = await openApp(1024, 768);
  const onderwerpen = await teksten(page.locator('.icoon-tegel__label'));
  if (onderwerpen.includes('Begrijpend lezen')) fouten.push('Begrijpend lezen staat nog los op het startscherm');
  await page.locator('.icoon-tegel', { hasText: 'Leren lezen' }).click();
  await page.locator('.icoon-tegel', { hasText: 'Tijd lezen' }).waitFor();
  const onderdelen = await teksten(page.locator('.icoon-tegel__label'));
  if (onderdelen.join('|') !== 'Woorden lezen|Begrijpend lezen|Tijd lezen') fouten.push(`onderdelen: ${onderdelen}`);
  await foto(page, 'leren-lezen');
  await page.locator('.icoon-tegel', { hasText: 'Tijd lezen' }).click();
  await page.locator('.icoon-tegel', { hasText: 'Maanden' }).waitFor();
  await foto(page, 'tijd-lezen');
  await page.locator('.terug-knop').click();
  await page.locator('.terug-knop').click();
  await page.locator('.icoon-tegel', { hasText: 'Tellen' }).click();
  await page.locator('.kern-rij__titel').first().waitFor();
  const rijen = await page.evaluate(() => [...document.querySelectorAll('.kern-rij__titel')].map((e) => e.textContent));
  if (rijen.some((t) => t.includes('Klokkijken'))) fouten.push('Klokkijken staat nog onder Tellen');
  await page.context().close();
}

for (const [width, height, naam] of [[360, 740, 'telefoon'], [1024, 768, 'tablet']]) {
  for (const [titel, lijst, kort] of [['Dagen', DAGEN, 'dagen'], ['Maanden', MAANDEN, 'maanden']]) {
    const page = await openApp(width, height);
    await naarHoofdstuk(page, titel);
    const prefix = `${naam}-${kort}`;
    await speel(page, 'Oefening 1', lijst, prefix, 6);
    await page.locator('.hoofdstuk-tegel', { hasText: 'Oefening 2' }).waitFor();
    await speel(page, 'Oefening 2', lijst, prefix, 5);
    await page.locator('.hoofdstuk-tegel', { hasText: 'Oefening 3' }).waitFor();
    await speel(page, 'Oefening 3', lijst, prefix, 6);
    await page.locator('.hoofdstuk-tegel', { hasText: 'Toets' }).waitFor();
    await speel(page, 'Toets', lijst, prefix, 10);
    await page.locator('.kalender-kaart').waitFor({ state: 'detached', timeout: 10000 });
    await page.waitForTimeout(800);
    const resultaat = await page.locator('body').textContent();
    if (!/10\s*(van|\/)\s*10/.test(resultaat)) fouten.push(`${prefix}: toets niet 10/10`);
    await foto(page, `${prefix}-resultaat`);
    const gedaan = await page.evaluate(() => JSON.parse(localStorage.getItem('leren-lezen:voortgang:a')).kernen);
    if (!gedaan[`tijd-${kort}`]?.sterren) fouten.push(`${prefix}: geen sterren opgeslagen`);
    await page.context().close();
  }
}

await browser.close();
if (fouten.length) {
  console.error(fouten.join('\n'));
  process.exit(1);
}
console.log('tijd-lezen OK');
