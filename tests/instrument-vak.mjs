import { chromium } from 'playwright';
// Instrumenten met een eigen indeling (trompetten schuin, klokken in het rek): Vrij spelen
// en Speel na op vier schermen. Elk deel staat in het vak, een tik op dat deel raakt die
// knop, glijden speelt ze allemaal, en de instrumentknoppen passen. Daarna voor alle
// instrumenten: na een tik gaat het oplichten (--aan) weer uit, en er is maar één
// instrument gebouwd.
// Gebruik: node tests/instrument-vak.mjs <map> [harp trompet klokken]
const OUT = process.argv[2] + '/';
const DEEL = { harp: '.harp__snaar', trompet: '.trompet__beker', klokken: '.luiklok__lijf' };
const KIES = process.argv.length > 3 ? process.argv.slice(3) : Object.keys(DEEL);
const ALLE = ['xylofoon', 'harp', 'fluit', 'keyboard', 'kikkerkoor', 'trompet', 'klokken'];
const b = await chromium.launch(); const fouten = [];

async function openVrij(bw, bh, tag, instrument) {
  const page = await (await b.newContext({ viewport: { width: bw, height: bh }, hasTouch: true, deviceScaleFactor: 1 })).newPage();
  page.on('pageerror', (e) => fouten.push(`${tag}: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') fouten.push(`${tag}: ${m.text()}`); });
  await page.goto('http://localhost:5173');
  await page.evaluate((instrument) => {
    localStorage.clear();
    localStorage.setItem('leren-lezen:profielen', JSON.stringify([{ id: 'a', naam: 'Tim', icoonId: 'trex', kleur: 0, aangemaakt: 1 }]));
    localStorage.setItem('leren-lezen:voortgang:a', JSON.stringify({ versie: 1, laatstGekozenGroep: 'groep3', kernen: {}, munten: 50, woordBlootstelling: {}, gekocht: ['harp', 'fluit', 'keyboard', 'kikkerkoor', 'trompet', 'klokken'].map((i) => 'instrument:' + i), instrument }));
  }, instrument);
  await page.reload(); await page.waitForTimeout(700);
  await page.locator('.icoon-tegel', { hasText: 'Tim' }).click(); await page.waitForTimeout(700);
  await page.locator('.icoon-tegel', { hasText: 'Muziek' }).click(); await page.waitForTimeout(500);
  await page.locator('.icoon-tegel', { hasText: 'Vrij spelen' }).click(); await page.waitForTimeout(600);
  return page;
}

for (const inst of KIES) {
  for (const [bw, bh, tag] of [[390, 844, 'tel'], [844, 390, 'liggend'], [1024, 1366, 'tablet'], [1366, 768, 'pc']]) {
    const page = await openVrij(bw, bh, `${inst} ${tag}`, inst);
    const w = (ms) => page.waitForTimeout(ms);
    const meet = () => page.evaluate(([inst, deel]) => {
      const vak = document.querySelector(`.xylofoon--${inst}`).getBoundingClientRect();
      return [...document.querySelectorAll(`.xylofoon--${inst} ${deel}`)].map((k, i) => {
        const r = k.getBoundingClientRect();
        const x = r.left + r.width / 2, y = r.top + r.height / 2;
        const raak = document.elementFromPoint(x, y)?.closest('.xylofoon__staaf')?.dataset.positie;
        return { i, binnen: r.left >= vak.left - 1 && r.right <= vak.right + 1 && r.top >= vak.top - 1 && r.bottom <= vak.bottom + 1, raak: Number(raak) === i, x, y };
      });
    }, [inst, DEEL[inst]]);
    const vrij = await meet();
    console.log(inst, tag, 'vrij | binnen:', vrij.every((m) => m.binnen), '| raak:', vrij.every((m) => m.raak), JSON.stringify(vrij.filter((m) => !m.binnen || !m.raak).map((m) => m.i)));
    await page.mouse.click(vrij[3].x, vrij[3].y); await w(120);
    await page.screenshot({ path: `${OUT}${inst}-${tag}-vrij.png` });
    // Glijden langs alle delen: elke knop speelt (van een rij naar de volgende kruist de
    // vinger soms een extra knop, dus minstens zoveel als er zijn).
    await page.evaluate(() => {
      window.__tikken = new Set();
      document.querySelector('.xylofoon').addEventListener('animationstart', (e) => { if (e.target.matches('.xylofoon__staaf')) window.__tikken.add(e.target.dataset.positie); });
    });
    await page.mouse.move(vrij[0].x, vrij[0].y); await page.mouse.down();
    for (const m of vrij) await page.mouse.move(m.x, m.y, { steps: 6 });
    await page.mouse.up(); await w(200);
    console.log(inst, tag, 'glijden raakte', await page.evaluate(() => window.__tikken.size), 'van', vrij.length);
    await page.locator('.terug-knop').first().click(); await w(500);
    await page.locator('.icoon-tegel', { hasText: 'Speel na' }).click(); await w(500);
    await page.locator('.niveau-tegel').nth(2).click(); await w(1500);
    const na = await meet();
    const past = await page.evaluate(() => [...document.querySelectorAll('.muziek-instrumenten > *')].every((e) => { const r = e.getBoundingClientRect(); return r.bottom <= innerHeight && r.right <= innerWidth && r.left >= 0 && r.top >= 0; }));
    console.log(inst, tag, 'speel na | binnen:', na.every((m) => m.binnen), '| raak:', na.every((m) => m.raak), '| knoppen passen:', past);
    await page.screenshot({ path: `${OUT}${inst}-${tag}-speelna.png` });
    await page.close();
  }
}

// Alle instrumenten: oplichten gaat weer uit, en alleen het gekozen instrument is gebouwd.
const page = await openVrij(1366, 768, 'aan', 'xylofoon');
for (const inst of ALLE) {
  await page.locator(`.muziek-wissel__knop[data-instrument="${inst}"]`).click(); await page.waitForTimeout(300);
  // Een plek die echt op knop 2 valt (het midden van zijn kikker, beker of klok, anders van de knop).
  const p = await page.evaluate(() => {
    const staaf = document.querySelectorAll('.xylofoon__staaf')[2];
    for (const el of [staaf.querySelector('.kikker-pop, .trompet__beker, .luiklok__lijf'), staaf]) {
      if (!el) continue;
      const r = el.getBoundingClientRect();
      const x = r.left + r.width / 2, y = r.top + r.height / 2;
      if (document.elementFromPoint(x, y)?.closest('.xylofoon__staaf') === staaf) return { x, y };
    }
    return null;
  });
  if (p) await page.mouse.click(p.x, p.y);
  await page.waitForTimeout(100);
  const aan = await page.locator('.xylofoon__staaf--aan').count();
  await page.waitForTimeout(2200);
  const nog = await page.locator('.xylofoon__staaf--aan').count();
  const vreemd = await page.evaluate((inst) => ({
    kikker: document.querySelectorAll('.kikker-zitting, .kikker-vijver').length > 0 && inst !== 'kikkerkoor',
    trompet: document.querySelectorAll('.trompet').length > 0 && inst !== 'trompet',
    klok: document.querySelectorAll('.luiklok, .klokken-rek').length > 0 && inst !== 'klokken',
  }), inst);
  const ok = aan === 1 && nog === 0 && !Object.values(vreemd).some(Boolean);
  console.log('aan', inst, '| licht op:', aan === 1, '| weer uit:', nog === 0, '| alleen dit instrument:', !Object.values(vreemd).some(Boolean), ok ? '' : 'FOUT');
}
console.log('fouten', fouten); await b.close();
