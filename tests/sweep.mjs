import { chromium } from 'playwright';

const URL = 'http://localhost:5173';
const OUT = (process.argv[2] ?? 'C:/claude/leren-lezen-testuitvoer') + '/';
import fs from 'node:fs';
fs.mkdirSync(OUT, { recursive: true });

const fouten = [];
const log = (...a) => console.log(...a);
const browser = await chromium.launch({ args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const page = await (await browser.newContext({ viewport: { width: 1100, height: 900 } })).newPage();
page.on('pageerror', (e) => fouten.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') fouten.push('console: ' + m.text()); });
page.on('response', (r) => { if (r.status() >= 400) fouten.push(`HTTP ${r.status()} ${r.url()}`); });

// Track every audio clip play() so we can check what the child actually hears.
await page.addInitScript(() => {
  window.__gespeeld = [];
  const orig = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () { window.__gespeeld.push(this.src); return orig.call(this).catch(() => {}); };
});

async function start(leeftijd = 6) {
  await page.goto(URL);
  await page.evaluate((leeftijd) => {
    localStorage.clear(); sessionStorage.clear();
    const id = 'ptest';
    localStorage.setItem('leren-lezen:profielen', JSON.stringify([{ id, naam: 'Test', icoonId: 'vos', kleur: 0, aangemaakt: 1 }]));
    localStorage.setItem('leren-lezen:voortgang:' + id, JSON.stringify({ versie: 1, laatstGekozenLeeftijd: leeftijd, kernen: {}, munten: 0 }));
    sessionStorage.setItem('leren-lezen:actief-profiel', id);
  }, leeftijd);
  await page.reload();
  await page.waitForTimeout(600);
  const tegel = page.locator('.icoon-tegel', { hasText: 'Test' });
  if (await tegel.count()) { await tegel.first().click(); await page.waitForTimeout(500); }
}
const klikTopic = async (naam) => { await page.locator('.icoon-tegel', { hasText: naam }).first().click(); await page.waitForTimeout(500); };
const instructie = async () => (await page.locator('.instructie-tekst').first().textContent().catch(() => ''))?.trim();

// Skip through an exercise session; returns list of instructions seen, and whether we ended on the result screen.
async function doorloopSessie(label) {
  const gezien = [];
  for (let i = 0; i < 40; i++) {
    const knop = page.locator('.overslaan-knop');
    if (!(await knop.count())) break;
    gezien.push(await instructie());
    await knop.click();
    await page.waitForTimeout(250);
  }
  const resultaat = await page.locator('.scherm-titel', { hasText: 'Toets klaar!' }).count();
  return { gezien, resultaat: resultaat > 0 };
}

async function sweepVak(topic, aantalKernen) {
  await start();
  await klikTopic(topic);
  const types = new Set();
  for (let k = 0; k < aantalKernen; k++) {
    const rijen = page.locator('.kern-rij--klikbaar');
    if ((await rijen.count()) <= k) { fouten.push(`${topic}: kern-rij ${k + 1} ontbreekt`); break; }
    await rijen.nth(k).click();
    await page.waitForTimeout(400);
    for (const n of [1, 2, 3]) {
      await page.locator('.hoofdstuk-tegel', { hasText: `Oefening ${n}` }).first().click();
      await page.waitForTimeout(400);
      const r = await doorloopSessie(`${topic} kern ${k + 1} oef ${n}`);
      r.gezien.forEach((t) => types.add(t));
      if (!(await page.locator('.hoofdstuk-tegel--toets').count())) fouten.push(`${topic} kern ${k + 1} oef ${n}: niet terug op hoofdstuk`);
    }
    await page.locator('.hoofdstuk-tegel--toets').click();
    await page.waitForTimeout(400);
    const r = await doorloopSessie(`${topic} kern ${k + 1} toets`);
    r.gezien.forEach((t) => types.add(t));
    if (!r.resultaat) {
      fouten.push(`${topic} kern ${k + 1} toets: GEEN resultaatscherm`);
      await page.screenshot({ path: `${OUT}geen-resultaat-${topic}-${k + 1}.png` });
    } else {
      await page.locator('.typen-knop', { hasText: 'Verder' }).click();
      await page.waitForTimeout(500);
      if (!(await page.locator('.hoofdstuk-tegel--toets').count())) fouten.push(`${topic} kern ${k + 1}: na Verder niet op hoofdstuk`);
    }
    // back to overview (tests the back-button fix)
    await page.locator('.terug-knop').first().click();
    await page.waitForTimeout(400);
    if (!(await page.locator('.kern-rij--klikbaar').count())) { fouten.push(`${topic} kern ${k + 1}: terug-knop werkt niet vanaf hoofdstuk`); return types; }
  }
  await page.locator('.terug-knop').first().click();
  await page.waitForTimeout(400);
  if (!(await page.locator('.icoon-tegel', { hasText: topic }).count())) fouten.push(`${topic}: terug-knop werkt niet vanaf overzicht`);
  return types;
}

log('--- Lezen');
const lezenTypes = await sweepVak('Leren lezen', 15);
log('instructies gezien:', [...lezenTypes].join(' | '));

log('--- Tellen');
const tellenTypes = await sweepVak('Tellen', 5);
log('instructies gezien:', [...tellenTypes].join(' | '));

// Vingers exercise: answer correctly and wrongly, screenshot it.
log('--- Vingers');
await start();
await klikTopic('Tellen');
await page.locator('.kern-rij--klikbaar').nth(1).click();
await page.waitForTimeout(400);
let vingerGevonden = false;
for (let poging = 0; poging < 8 && !vingerGevonden; poging++) {
  await page.locator('.hoofdstuk-tegel', { hasText: 'Oefening 1' }).first().click();
  await page.waitForTimeout(400);
  for (let i = 0; i < 6; i++) {
    const t = await instructie();
    if (t?.includes('vingers')) {
      vingerGevonden = true;
      const src = await page.locator('.oefen-kaart__plaatje').getAttribute('src');
      const cijfer = src.match(/vinger-(\d+)/)[1];
      await page.screenshot({ path: `${OUT}vingers.png` });
      const muntVoor = await page.locator('body').textContent();
      await page.locator('.keuze-knop', { hasText: new RegExp(`^${cijfer}$`) }).click();
      await page.waitForTimeout(150);
      const goed = await page.locator('.keuze-knop.goed-gekozen').count();
      log(`vingers: plaatje=${cijfer}, goed-gekozen=${goed}`);
      if (!goed) fouten.push('vingers: juist antwoord niet als goed gemarkeerd');
      break;
    }
    if (!(await page.locator('.overslaan-knop').count())) break;
    await page.locator('.overslaan-knop').click();
    await page.waitForTimeout(250);
  }
  while (await page.locator('.overslaan-knop').count()) { await page.locator('.overslaan-knop').click(); await page.waitForTimeout(200); }
}
if (!vingerGevonden) fouten.push('vingers-naar-cijfer kwam niet voor in 8 sessies');

// Feedback audio: correct answer must play a feedback-goed clip, wrong one feedback-fout.
log('--- Feedback-audio');
await page.evaluate(() => (window.__gespeeld = []));
await page.locator('.hoofdstuk-tegel', { hasText: 'Oefening 1' }).first().click();
await page.waitForTimeout(400);
for (let i = 0; i < 5; i++) {
  const knoppen = page.locator('.keuze-knop');
  if (await knoppen.count()) {
    // try every option until the correct one; first wrong ones produce fout audio
    const n = await knoppen.count();
    for (let j = 0; j < n; j++) {
      const k = knoppen.nth(j);
      await page.evaluate(() => (window.__gespeeld = []));
      await k.click();
      await page.waitForTimeout(120);
      const goed = await k.evaluate((el) => el.classList.contains('goed-gekozen'));
      const clips = (await page.evaluate(() => window.__gespeeld)).filter((s) => s.includes('feedback'));
      const soort = clips.map((s) => s.match(/feedback-(goed|fout)/)?.[1]);
      if (goed && !soort.includes('goed')) fouten.push(`feedback: goed antwoord speelde ${clips}`);
      if (!goed && !soort.includes('fout')) fouten.push(`feedback: fout antwoord speelde ${clips}`);
      if (goed) break;
      await page.waitForTimeout(550);
    }
    await page.waitForTimeout(1000);
  } else if (await page.locator('.overslaan-knop').count()) {
    await page.locator('.overslaan-knop').click();
    await page.waitForTimeout(250);
  }
}

// Luisteren: every played word must be one of the pictures shown.
log('--- Luisteren');
await start(3);
await klikTopic('Luisteren');
await page.locator('.icoon-tegel').first().click();
await page.waitForTimeout(700);
for (let vraag = 0; vraag < 12; vraag++) {
  const woordClips = (await page.evaluate(() => window.__gespeeld)).filter((s) => s.includes('/woorden/'));
  const laatste = woordClips.at(-1)?.match(/woorden\/([^/.]+)\.mp3/)?.[1];
  const opties = await page.locator('.luister-plaatje img').evaluateAll((els) => els.map((e) => e.getAttribute('src')));
  const optieWoorden = opties.map((s) => s.match(/\/([^/.]+)\.(png|jpg|svg)$/)?.[1]);
  if (!laatste || !optieWoorden.includes(laatste)) fouten.push(`luisteren: hoorde "${laatste}" maar opties ${optieWoorden}`);
  if (vraag === 0) await page.screenshot({ path: `${OUT}luisteren.png` });
  const idx = optieWoorden.indexOf(laatste);
  await page.locator('.luister-plaatje').nth(idx >= 0 ? idx : 0).click();
  await page.waitForTimeout(vraag % 5 === 4 ? 2800 : 1200);
}
log('luisteren: 12 vragen gecontroleerd');

log('--- Geheugen');
for (let i = 0; i < 3 && !(await page.locator('.icoon-tegel', { hasText: 'Spelletjes' }).count()); i++) {
  await page.locator('.terug-knop').first().click();
  await page.waitForTimeout(400);
}
await klikTopic('Spelletjes');
await page.locator('.icoon-tegel', { hasText: 'Geheugenspel' }).click();
await page.waitForTimeout(600);
const kaarten = await page.locator('.geheugen-kaart').count();
log('geheugenkaarten:', kaarten);
if (kaarten !== 8) fouten.push(`geheugen: ${kaarten} kaarten i.p.v. 8`);
await page.locator('.geheugen-kaart').nth(0).click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}geheugen.png` });

await browser.close();
log('\n=== FOUTEN (' + fouten.length + ') ===');
for (const f of [...new Set(fouten)]) log(f);
