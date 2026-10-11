import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

// Klokkijken (reken-kern-13): oefening 1 meerkeuze, 2 wijzers slepen, 3 tijd typen, toets.
// Speelt alles goed (plus één fout per oefening voor de herkansing) en maakt screenshots.
// Gebruik: node tests/klokkijken.mjs <map>
const OUT = process.argv[2].replace(/\\/g, '/').replace(/\/?$/, '/');
mkdirSync(OUT, { recursive: true });

const WOORDEN = ['twaalf', 'één', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen', 'tien', 'elf'];
const uurVan = (w) => {
  const i = WOORDEN.indexOf(w);
  if (i < 0) throw new Error(`onbekend uurwoord: ${w}`);
  return i === 0 ? 12 : i;
};
const vorig = (h) => (h === 1 ? 12 : h - 1);

// 'kwart over één' / 'half twee' / '13:15' → { uur 1-12, minuut }
function leesTijd(tekst) {
  const t = tekst.trim();
  let m;
  if ((m = t.match(/^(\d{1,2}):(\d{2})$/))) return { uur: ((Number(m[1]) + 11) % 12) + 1, minuut: Number(m[2]) };
  if ((m = t.match(/^(\S+) uur$/))) return { uur: uurVan(m[1]), minuut: 0 };
  if ((m = t.match(/^kwart over (\S+)$/))) return { uur: uurVan(m[1]), minuut: 15 };
  if ((m = t.match(/^half (\S+)$/))) return { uur: vorig(uurVan(m[1])), minuut: 30 };
  if ((m = t.match(/^kwart voor (\S+)$/))) return { uur: vorig(uurVan(m[1])), minuut: 45 };
  throw new Error(`geen tijd: ${tekst}`);
}
const zelfde = (a, b) => a.uur % 12 === b.uur % 12 && a.minuut === b.minuut;
const klokLabel = (label) => leesTijd(label.replace(/^Klok: /, ''));

const browser = await chromium.launch();
const fouten = [];

async function openApp(width, height) {
  const ctx = await browser.newContext({ viewport: { width, height }, hasTouch: true, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => {
    localStorage.setItem('leren-lezen:gedempt', '1');
    localStorage.setItem('leren-lezen:profielen', JSON.stringify([{ id: 'a', naam: 'Anna', icoonId: 'vos', kleur: 0, aangemaakt: 1 }]));
    localStorage.setItem('leren-lezen:voortgang:a', JSON.stringify({ versie: 1, laatstGekozenGroep: 'groep3', kernen: {}, munten: 0 }));
  });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => fouten.push(e.message));
  page.on('console', (msg) => msg.type() === 'error' && fouten.push(msg.text()));
  await page.goto(process.env.KLOK_URL || 'http://localhost:5173');
  await page.locator('.icoon-tegel', { hasText: 'Anna' }).click();
  await page.locator('.icoon-tegel', { hasText: 'Tellen' }).click();
  await page.locator('.kern-rij__titel').first().waitFor();
  const titel = page.locator('.kern-rij__titel', { hasText: 'Klokkijken' });
  for (let i = 0; i < 10; i++) {
    const zichtbaar = await titel.evaluate((el) => {
      const venster = el.closest('.kern-paginas__venster');
      if (!venster) return true;
      const r = el.getBoundingClientRect();
      const v = venster.getBoundingClientRect();
      return r.width > 0 && r.left < v.right - 8 && r.right > v.left + 8;
    });
    if (zichtbaar) break;
    await page.locator('.kern-paginas__pijl--rechts').click();
    await page.waitForTimeout(350);
  }
  await titel.click();
  await page.locator('.hoofdstuk-tegel', { hasText: 'Oefening 1' }).waitFor();
  return page;
}

async function start(page, label) {
  await page.locator('.hoofdstuk-tegel', { hasText: label }).click();
  await page.locator('.klok-kaart').waitFor();
  await page.waitForTimeout(300);
}

const opgave = async (page) => {
  const el = page.locator('.klok-kaart > .klok-digitaal, .klok-kaart > .klok-woorden');
  return (await el.count()) ? leesTijd(await el.first().innerText()) : null;
};

async function klikKey(page, teken) {
  await page.locator('.scherm-toetsenbord:not([hidden]) .scherm-toets', { hasText: new RegExp(`^${teken}$`) }).click();
}

// Sleep een wijzer van zijn huidige hoek naar een doelhoek.
async function sleep(page, vanHoek, naarHoek, straal) {
  const box = await page.locator('.klok--zetten').boundingBox();
  const s = box.width / 200;
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const punt = (hoek) => [cx + Math.sin((hoek * Math.PI) / 180) * straal * s, cy - Math.cos((hoek * Math.PI) / 180) * straal * s];
  await page.mouse.move(...punt(vanHoek));
  await page.mouse.down();
  for (let i = 1; i <= 6; i++) await page.mouse.move(...punt(vanHoek + ((naarHoek - vanHoek) * i) / 6));
  await page.mouse.up();
}

async function beantwoord(page, { fout = false } = {}) {
  const instr = await page.locator('.instructie-tekst').innerText();
  if (instr.startsWith('Welke klok')) {
    const doel = await opgave(page);
    const knoppen = page.locator('.keuze-knop--klok');
    const labels = await knoppen.evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')));
    const tijden = labels.map(klokLabel);
    if (tijden.filter((t) => zelfde(t, doel)).length !== 1) throw new Error(`klok-kies-klok: niet precies één goede klok (${labels})`);
    if (fout) await knoppen.nth(tijden.findIndex((t) => !zelfde(t, doel))).click();
    await knoppen.nth(tijden.findIndex((t) => zelfde(t, doel))).click();
    return 'kies-klok';
  }
  if (instr.startsWith('Hoe laat is het? Kies')) {
    const doel = klokLabel(await page.locator('.klok-kaart > .klok, .klok-typ-rij > .klok').getAttribute('aria-label'));
    const knoppen = page.locator('.klok-tijd-knop');
    const tijden = (await knoppen.allInnerTexts()).map(leesTijd);
    if (tijden.filter((t) => zelfde(t, doel)).length !== 1) throw new Error('klok-kies-tijd: niet precies één goede tijd');
    if (fout) await knoppen.nth(tijden.findIndex((t) => !zelfde(t, doel))).click();
    await knoppen.nth(tijden.findIndex((t) => zelfde(t, doel))).click();
    return 'kies-tijd';
  }
  if (instr.startsWith('Zet de wijzers')) {
    const doel = await opgave(page);
    if (fout) {
      await page.locator('.klok-kaart .typen-knop').click(); // 12:00 laten staan: fout
      await page.waitForTimeout(700);
      if (!(await page.locator('.klok--zetten').count())) throw new Error('herkansing: klok weg na fout');
    }
    // Lees de huidige stand uit de transform, dan eerst de grote, dan de kleine wijzer.
    const hoek = (sel) => page.locator(sel).evaluate((e) => Number((e.getAttribute('transform') || 'rotate(0)').match(/-?[\d.]+/)[0]));
    await sleep(page, await hoek('.klok--zetten .klok__wijzer--groot'), doel.minuut * 6, 66);
    // Bewust "op het uurcijfer" neerleggen: de klok moet zelf naar de goede tussenstand schuiven.
    await sleep(page, await hoek('.klok--zetten .klok__wijzer--klein'), (doel.uur % 12) * 30 + (doel.minuut >= 30 ? 25 : 0), 30);
    const stand = [await hoek('.klok--zetten .klok__wijzer--klein'), await hoek('.klok--zetten .klok__wijzer--groot')];
    const verwacht = [((doel.uur % 12) + doel.minuut / 60) * 30, doel.minuut * 6];
    if (Math.abs(stand[0] - verwacht[0]) > 0.01 || Math.abs(stand[1] - verwacht[1]) > 0.01) {
      throw new Error(`wijzers ${stand} i.p.v. ${verwacht} voor ${doel.uur}:${doel.minuut}`);
    }
    await page.locator('.klok-kaart .typen-knop').click();
    return 'zetten';
  }
  if (instr.startsWith('Hoe laat is het? Typ')) {
    const doel = klokLabel(await page.locator('.klok-kaart > .klok, .klok-typ-rij > .klok').getAttribute('aria-label'));
    const typ = async (uur, minuut) => {
      for (const c of String(uur)) await klikKey(page, c);
      if (await page.locator('.klok-invoer[aria-label="uur"].klok-invoer--actief').count()) {
        await page.locator('.klok-invoer[aria-label="minuten"]').click();
      }
      for (const c of String(minuut).padStart(2, '0')) await klikKey(page, c);
      await page.locator('.klok-kaart .typen-knop').click();
    };
    if (fout) {
      await typ(doel.uur, (doel.minuut + 30) % 60);
      await page.waitForTimeout(700);
    }
    // Middaguur typen moet ook goed zijn (1:15 = 13:15); afwisselen.
    await typ(doel.uur < 12 && Math.random() < 0.5 ? doel.uur + 12 : doel.uur, doel.minuut);
    return 'typen';
  }
  throw new Error(`onbekende instructie: ${instr}`);
}

async function wachtVolgende(page, vorigeLabel) {
  await page.waitForFunction(
    (oud) => {
      if (document.querySelector('.hoofdstuk-tegel') || document.querySelector('.resultaat-cijfer')) return true;
      const k = document.querySelector('.klok-kaart');
      return k && k.dataset.test !== oud;
    },
    vorigeLabel,
    { timeout: 8000 },
  );
}

async function speel(page, label, { foutBijEerste = false, fotos = [] } = {}) {
  await start(page, label);
  const typen = [];
  for (let i = 0; i < 12; i++) {
    if ((await page.locator('.hoofdstuk-tegel').count()) || (await page.locator('.resultaat-cijfer').count())) break;
    await page.locator('.klok-kaart').evaluate((el, n) => (el.dataset.test = `v${n}`), i);
    const foto = fotos.find((f) => f.i === i);
    if (foto) await page.screenshot({ path: `${OUT}${foto.naam}.png` });
    typen.push(await beantwoord(page, { fout: foutBijEerste && i === 0 }));
    await wachtVolgende(page, `v${i}`);
    await page.waitForTimeout(150);
  }
  return typen;
}

// Staand op een telefoon: alle oefeningen + toets.
{
  const page = await openApp(390, 844);
  const o1 = await speel(page, 'Oefening 1', { foutBijEerste: true, fotos: [{ i: 0, naam: 'tel-oef1-a' }, { i: 1, naam: 'tel-oef1-b' }] });
  if (o1.length !== 6 || !o1.includes('kies-klok') || !o1.includes('kies-tijd')) throw new Error(`oefening 1: ${o1}`);
  const o2 = await speel(page, 'Oefening 2', { foutBijEerste: true, fotos: [{ i: 0, naam: 'tel-oef2' }] });
  if (o2.length !== 6 || o2.some((t) => t !== 'zetten')) throw new Error(`oefening 2: ${o2}`);
  const o3 = await speel(page, 'Oefening 3', { foutBijEerste: true, fotos: [{ i: 0, naam: 'tel-oef3' }] });
  if (o3.length !== 6 || o3.some((t) => t !== 'typen')) throw new Error(`oefening 3: ${o3}`);
  const toets = await speel(page, 'Toets');
  await page.locator('.resultaat-cijfer').waitFor();
  const uitslag = await page.locator('.resultaat-cijfer').innerText();
  console.log('toets', toets.join(','), '→', uitslag);
  if (toets.length !== 10 || !/10.*10/.test(uitslag)) throw new Error(`toets: ${toets.length} vragen, uitslag ${uitslag}`);
  await page.close();
}

// Liggende telefoon, kleine telefoon en tablet: van elk type een screenshot.
for (const [w, h, naam] of [
  [844, 390, 'liggend'],
  [360, 640, 'klein'],
  [1024, 768, 'tablet'],
]) {
  const page = await openApp(w, h);
  for (const [label, foto] of [
    ['Oefening 1', 'oef1'],
    ['Oefening 2', 'oef2'],
    ['Oefening 3', 'oef3'],
  ]) {
    await speel(page, label, { fotos: [{ i: 0, naam: `${naam}-${foto}-a` }, { i: 1, naam: `${naam}-${foto}-b` }] });
  }
  await page.close();
}

await browser.close();
if (fouten.length) {
  console.log('FOUTEN', fouten);
  process.exit(1);
}
console.log('klokkijken OK');
