import { chromium } from 'playwright';
// "Vandaag" (dagplan): kiest de juiste volgende oefening, vinkt af na afmaken, onthoudt een
// half gespeelde oefening, bonus als alles af is, en kleuterkaarten.
// Gebruik: node tests/vandaag.mjs <map>
const OUT = process.argv[2] + '/';
const b = await chromium.launch(); const fouten = [];
const ctx = await b.newContext({ viewport: { width: 1100, height: 800 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
page.on('pageerror', (e) => fouten.push(e.message));
const wacht = (ms) => page.waitForTimeout(ms);

async function start(groep, kernen = {}) {
  await page.goto('http://localhost:5173');
  await page.evaluate(([groep, kernen]) => {
    localStorage.clear();
    localStorage.setItem('leren-lezen:profielen', JSON.stringify([{ id: 'a', naam: 'Anna', icoonId: 'vos', kleur: 0, aangemaakt: 1 }]));
    localStorage.setItem('leren-lezen:voortgang:a', JSON.stringify({ versie: 1, laatstGekozenGroep: groep, kernen, munten: 100, woordBlootstelling: {} }));
  }, [groep, kernen]);
  await page.reload(); await wacht(700);
  await page.locator('.icoon-tegel', { hasText: 'Anna' }).click(); await wacht(700);
}
const kaarten = () => page.$$eval('.vandaag-kaart', (ks) => ks.map((k) => k.innerText.replace(/[\s ]+/g, ' ').trim()));
const munten = () => page.evaluate(() => JSON.parse(localStorage.getItem('leren-lezen:voortgang:a')).munten);
const dagplan = () => page.evaluate(() => JSON.parse(localStorage.getItem('leren-lezen:dagplan:a')));

// Groep 3: hoofdstuk 1 gehaald, in hoofdstuk 2 alleen Oefening 1 af.
const af = { gestart: true, voltooid: true, sterren: 3, oefenSessies: 3, oefeningenAf: [1, 2, 3] };
await start('groep3', { 'lezen-01': af, 'lezen-02': { gestart: true, voltooid: false, sterren: 0, oefenSessies: 1, oefeningenAf: [1] } });
await page.screenshot({ path: OUT + '1-onderwerpen.png', clip: { x: 0, y: 0, width: 1100, height: 520 } });
console.log('tegel', await page.locator('.icoon-tegel--vandaag').innerText());
await page.locator('.icoon-tegel--vandaag').click(); await wacht(700);
console.log('kaarten', await kaarten());
await page.screenshot({ path: OUT + '2-vandaag.png' });

// Lezen tot het eind (overslaan) -> terug op Vandaag met een vinkje.
await page.locator('.vandaag-kaart').nth(0).click(); await wacht(900);
for (let i = 0; i < 30 && (await page.locator('.overslaan-knop').count()); i++) {
  await page.locator('.overslaan-knop').click(); await wacht(600);
}
await wacht(800);
console.log('na lezen', await kaarten(), 'klaar', (await dagplan()).plan.klaar);

// Tellen beginnen en meteen terug: half gespeeld.
await page.locator('.vandaag-kaart').nth(1).click(); await wacht(900);
await page.locator('.terug-knop').click(); await wacht(700);
console.log('onaf', JSON.stringify((await dagplan()).onaf));
// Volgende dag: nieuw plan, tellen moet dezelfde oefening zijn met "verder".
await page.evaluate(() => {
  const d = JSON.parse(localStorage.getItem('leren-lezen:dagplan:a'));
  d.plan.datum = '2000-01-01';
  localStorage.setItem('leren-lezen:dagplan:a', JSON.stringify(d));
});
await page.locator('.terug-knop').click(); await wacht(700);
await page.locator('.icoon-tegel--vandaag').click(); await wacht(700);
console.log('volgende dag', await kaarten());
await page.screenshot({ path: OUT + '3-volgende-dag.png' });
// Schudden: elke tik een ander passend stapje, rondlopend.
for (const k of [0, 1, 2]) {
  const reeks = [];
  for (let i = 0; i < 6; i++) {
    await page.locator('.vandaag-rij').nth(k).locator('.vandaag-schud').click(); await wacht(250);
    reeks.push((await kaarten())[k].replace(/^\d /, ''));
  }
  console.log('schud kaart', k, reeks);
}
await page.screenshot({ path: OUT + '3b-geschud.png' });

// Alles af -> bonus één keer.
const voor = await munten();
await page.evaluate(() => {
  const d = JSON.parse(localStorage.getItem('leren-lezen:dagplan:a'));
  d.plan.klaar = [true, true, true];
  localStorage.setItem('leren-lezen:dagplan:a', JSON.stringify(d));
});
await page.locator('.terug-knop').click(); await wacht(700);
await page.locator('.icoon-tegel--vandaag').click(); await wacht(1200);
console.log('bonus', (await munten()) - voor, 'klaar-rij zichtbaar', await page.locator('.vandaag-klaar').isVisible());
await page.screenshot({ path: OUT + '4-alles-af.png' });
await page.locator('.terug-knop').click(); await wacht(700);
await page.locator('.icoon-tegel--vandaag').click(); await wacht(900);
console.log('geen tweede bonus', (await munten()) - voor);

// Kleuter, telefoon rechtop en liggend.
await page.setViewportSize({ width: 390, height: 844 });
await start('kleuter');
await page.locator('.icoon-tegel--vandaag').click(); await wacht(700);
console.log('kleuter', await kaarten());
const derde = [];
for (let i = 0; i < 8; i++) {
  await page.locator('.vandaag-rij').nth(2).locator('.vandaag-schud').click(); await wacht(250);
  derde.push((await kaarten())[2].replace(/^\d /, ''));
}
console.log('kleuter schud derde', derde);
await page.screenshot({ path: OUT + '5-kleuter-rechtop.png' });
await page.setViewportSize({ width: 844, height: 390 }); await wacht(500);
await page.screenshot({ path: OUT + '6-kleuter-liggend.png' });
// Derde kaart openen werkt.
await page.locator('.vandaag-kaart').nth(2).click(); await wacht(900);
console.log('derde kaart opent', await page.locator('.scherm-titel, .instructie-tekst').first().innerText().catch(() => '?'));
// Na schudden staat er nooit twee keer hetzelfde op de kaarten.
console.log('geen dubbele', new Set(await kaarten()).size === 3 || '(scherm gewisseld)');

console.log('fouten', fouten); await b.close();
