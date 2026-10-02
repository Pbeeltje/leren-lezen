import { chromium } from 'playwright';
import fs from 'node:fs';
// Tafeltennis: start, een automatische speler volgt de bal; telt per tegenstander de stand
// en maakt foto's van elk venster. Gebruik: node tests/tafeltennis.mjs <map> [mis-kans 0..1]
const OUT = process.argv[2] + '/';
fs.mkdirSync(OUT, { recursive: true });
const MIS = Number(process.argv[3] ?? 0.15);
const b = await chromium.launch(); const fouten = [];
for (const [bw, bh, tag] of [[390, 844, 'tel'], [1100, 800, 'pc']]) {
  const page = await (await b.newContext({ viewport: { width: bw, height: bh }, hasTouch: true })).newPage();
  page.on('pageerror', (e) => fouten.push(e.message));
  const w = (ms) => page.waitForTimeout(ms);
  await page.goto('http://localhost:5173');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('leren-lezen:profielen', JSON.stringify([{ id: 'a', naam: 'Tim', icoonId: 'kat', kleur: 0, aangemaakt: 1 }]));
    localStorage.setItem('leren-lezen:voortgang:a', JSON.stringify({ versie: 1, laatstGekozenGroep: 'groep3', kernen: {}, munten: 0 }));
  });
  await page.reload(); await w(600);
  await page.locator('.icoon-tegel', { hasText: 'Tim' }).click(); await w(400);
  await page.locator('.icoon-tegel', { hasText: 'Spelletjes' }).click(); await w(400);
  await page.screenshot({ path: OUT + tag + '-kies.png' });
  await page.locator('.icoon-tegel', { hasText: 'Tafeltennis' }).click(); await w(600);
  await page.screenshot({ path: OUT + tag + '-start.png' });
  const veld = await page.locator('.pong-veld').boundingBox();
  let venster = 0; let gespeeld = false; let mikNaast = 0; const t0 = Date.now();
  while (Date.now() - t0 < 150000) {
    if (await page.locator('.vang-venster').count()) {
      const ladder = await page.locator('.vang-venster .pong-ladder__vak--klaar').count();
      const trofee = await page.locator('.pong-venster__trofee').count();
      const verloren = await page.locator('.pong-vs--verloren').count();
      if (venster > 0) console.log(tag, `venster ${venster}: verslagen ${ladder}${trofee ? ' TROFEE' : ''}${verloren ? ' verloren' : ''} na ${Math.round((Date.now() - t0) / 1000)} s`);
      await page.screenshot({ path: `${OUT}${tag}-venster-${venster}.png` });
      if (trofee) break;
      venster++;
      await page.locator('.vang-venster__start').click(); await w(200);
      gespeeld = false;
      continue;
    }
    const info = await page.evaluate(() => {
      const bal = document.querySelector('.pong-bal');
      const r = bal.hidden ? null : bal.getBoundingClientRect();
      return { bal: r && { x: r.left + r.width / 2, y: r.top }, stand: [...document.querySelectorAll('.pong-balk .pong-pil')].map((p) => p.querySelectorAll('img:not(.pong-pil--leeg)').length) };
    });
    if (info.bal) {
      if (!gespeeld) { gespeeld = true; await page.screenshot({ path: `${OUT}${tag}-spel-${venster}.png` }); }
      if (Math.random() < 0.02) mikNaast = Math.random() < MIS ? (Math.random() < 0.5 ? -1 : 1) * 160 : 0;
      await page.mouse.move(info.bal.x + mikNaast, veld.y + veld.height - 40);
    }
    await w(30);
  }
  await page.close();
}
console.log('fouten', fouten); await b.close();
