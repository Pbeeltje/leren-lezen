import { chromium } from 'playwright';
// Oversteken: een botje speelt (alleen via de DOM en de pijltjestoetsen) tot level <tot>
// of game over, met een schermafdruk bij de eerste keer water, een klap, de levelbanner en
// het eindvenster. Gebruik: node tests/oversteken-bot.mjs <map> [thema] [tot] [BxH] [startlevel]
const OUT = process.argv[2] + '/';
const thema = process.argv[3] || 'savanne';
const tot = Number(process.argv[4] || 4);
const [bw, bh] = (process.argv[5] || '390x844').split('x').map(Number);
const startLevel = Number(process.argv[6] || 1);
const b = await chromium.launch(); const fouten = [];
const page = await (await b.newContext({ viewport: { width: bw, height: bh }, deviceScaleFactor: 1 })).newPage();
page.on('pageerror', (e) => fouten.push(e.message));
const w = (ms) => page.waitForTimeout(ms);
await page.goto('http://localhost:5173');
await page.evaluate((thema) => {
  localStorage.clear();
  localStorage.setItem('leren-lezen:profielen', JSON.stringify([{ id: 'a', naam: 'Tim', icoonId: 'kat', kleur: 2, aangemaakt: 1 }]));
  localStorage.setItem('leren-lezen:voortgang:a', JSON.stringify({ versie: 1, laatstGekozenLeeftijd: 6, kernen: {}, munten: 0 }));
  localStorage.setItem('leren-lezen:achtergrond:a', thema);
}, thema);
await page.reload(); await w(700);
await page.locator('.icoon-tegel', { hasText: 'Tim' }).click(); await w(600);
await page.locator('.icoon-tegel', { hasText: 'Spelletjes' }).click(); await w(400);
await page.locator('.icoon-tegel', { hasText: 'Oversteken' }).click(); await w(800);
await page.evaluate((l) => { window.__oversteekLevel = l; }, startLevel);
await page.locator('.vang-venster__start').click(); await w(600);

const gezien = new Set();
const start = Date.now();
for (let ronde = 0; ronde < 400 && Date.now() - start < 240000; ronde++) {
  const gebeurd = await page.evaluate(async ({ tot, gezien }) => {
    const slaap = (ms) => new Promise((r) => setTimeout(r, ms));
    const toets = (key) => window.dispatchEvent(new KeyboardEvent('keydown', { key }));
    const meet = () => {
      const banen = [...document.querySelectorAll('.ov-baan')].map((el) => ({
        el,
        r: el.getBoundingClientRect(),
        dingen: new Map([...el.querySelectorAll('.ov-ding')].map((d) => [d, d.getBoundingClientRect()])),
      }));
      return { banen, s: document.querySelector('.ov-speler').getBoundingClientRect() };
    };
    for (let i = 0; i < 600; i++) {
      if (document.querySelector('.vang-venster')) return 'eind';
      const sp = document.querySelector('.ov-speler');
      if (sp.matches('.ov-speler--au, .ov-speler--plons') && !gezien.includes('klap')) return 'klap';
      const banner = document.querySelector('.ov-banner');
      if (!banner.hidden) {
        if (!gezien.includes('banner')) return 'banner';
        if (Number(banner.textContent) > tot) return 'klaar';
        await slaap(200);
        continue;
      }
      const a = meet();
      await slaap(50);
      const m = meet();
      const c = m.s.height;
      const cx = m.s.left + m.s.width / 2;
      const cy = m.s.top + m.s.height / 2;
      const r = m.banen.findIndex((b) => cy >= b.r.top && cy < b.r.bottom);
      if (r < 0) continue;
      // Banen met snelheid (px/s) per ding.
      const banen = m.banen.map((b, k) => {
        const vs = [...b.dingen].map(([d, rc]) => (a.banen[k].dingen.has(d) ? (rc.left - a.banen[k].dingen.get(d).left) / 0.05 : 0));
        const v = vs.find((x) => x !== 0) ?? 0;
        return { ...b, v, water: b.el.classList.contains('ov-baan--water'), weg: b.el.classList.contains('ov-baan--weg'), lamp: !!b.el.querySelector('.ov-lamp--aan') };
      });
      const vrij = (b, x, t0, t1) => {
        if (b.lamp) return false;
        for (const rc of b.dingen.values()) {
          for (let t = t0; t <= t1; t += 0.05) {
            const l = rc.left + b.v * t + c * 0.1;
            const rr = rc.right + b.v * t - c * 0.1;
            if (x + c * 0.4 > l && x - c * 0.4 < rr) return false;
          }
        }
        return true;
      };
      const draagt = (b, x, t0, t1) => [...b.dingen.values()].some((rc) => {
        for (let t = t0; t <= t1; t += 0.05) {
          const l = rc.left + b.v * t + c * 0.35;
          const rr = rc.right + b.v * t - c * 0.35;
          if (!(x > l && x < rr)) return false;
        }
        return true;
      });
      const veilig = (b, x) => (b.weg ? vrij(b, x, 0, 0.75) : b.water ? draagt(b, x, 0.15, 0.7) : true);
      const hier = banen[r];
      if (hier.water && !gezien.includes('water')) return 'water';
      const boven = banen[r + 1];
      if (boven && veilig(boven, cx)) { toets('ArrowUp'); await slaap(160); continue; }
      // Staat er hier iets aan te komen? Dan opzij of terug.
      if (hier.weg && !vrij(hier, cx, 0, 0.45)) {
        const onder = banen[r - 1];
        if (onder && veilig(onder, cx)) toets('ArrowDown');
        else toets(vrij(hier, cx - c, 0, 0.45) ? 'ArrowLeft' : 'ArrowRight');
        await slaap(160);
        continue;
      }
      // Op het water naar het midden schuiven als je dreigt mee te drijven van het veld.
      const veld = document.querySelector('.ov-veld').getBoundingClientRect();
      if (hier.water && (cx < veld.left + c * 1.5 || cx > veld.right - c * 1.5)) {
        const naar = cx < veld.left + c * 1.5 ? c : -c;
        if (draagt(hier, cx + naar, 0.1, 0.4)) { toets(naar > 0 ? 'ArrowRight' : 'ArrowLeft'); await slaap(160); continue; }
      }
    }
    return 'niets';
  }, { tot, gezien: [...gezien] });
  if (gebeurd === 'eind' || gebeurd === 'klaar') {
    await w(900);
    await page.screenshot({ path: OUT + `bot-${thema}-${gebeurd}.png` });
    console.log(gebeurd, '| level', await page.locator('.ov-level span').textContent(), '| score', await page.locator('.vang-score span').nth(1).textContent(), '| hartjes', await page.locator('.vang-hartjes img:not(.vang-hart--weg)').count());
    break;
  }
  if (gebeurd !== 'niets' && !gezien.has(gebeurd)) {
    gezien.add(gebeurd);
    await page.screenshot({ path: OUT + `bot-${thema}-${gebeurd}.png` });
    console.log(gebeurd, '| level', await page.locator('.ov-level span').textContent(), '| na', Math.round((Date.now() - start) / 1000), 's');
  }
}
console.log('fouten', fouten); await b.close();
