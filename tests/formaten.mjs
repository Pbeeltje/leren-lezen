// Layout-sweep over gangbare telefoon- en tabletformaten (CSS-pixels).
// node formaten.mjs <groep 0-3> <uitmap>
import { chromium } from 'playwright';
import fs from 'node:fs';

const APPARATEN = [
  // telefoons staand (statcounter NL juni 2026 + kleine/oude toestellen)
  ['tel-360x640-klein-android', 360, 640, 'tel'],
  ['tel-375x667-iphone-se', 375, 667, 'tel'],
  ['tel-360x780', 360, 780, 'tel'],
  ['tel-375x812-iphone-x-13mini', 375, 812, 'tel'],
  ['tel-384x832', 384, 832, 'tel'],
  ['tel-390x844-iphone-12-14', 390, 844, 'tel'],
  ['tel-393x873-pixel', 393, 873, 'tel'],
  ['tel-414x896-iphone-11-xr', 414, 896, 'tel'],
  ['tel-430x932-iphone-pro-max', 430, 932, 'tel'],
  ['tel-344x882-fold-buiten', 344, 882, 'tel'],
  ['tel-390x664-iphone-in-safari', 390, 664, 'tel'],
  // telefoons liggend
  ['tel-667x375-se-liggend', 667, 375, 'tel'],
  ['tel-844x390-liggend', 844, 390, 'tel'],
  ['tel-896x414-liggend', 896, 414, 'tel'],
  // tablets
  ['tab-768x1024-ipad-oud', 768, 1024, 'tab'],
  ['tab-1024x768-ipad-oud-liggend', 1024, 768, 'tab'],
  ['tab-810x1080-ipad-10.2', 810, 1080, 'tab'],
  ['tab-1080x810-ipad-10.2-liggend', 1080, 810, 'tab'],
  ['tab-800x1280-android', 800, 1280, 'tab'],
  ['tab-1280x800-android-liggend', 1280, 800, 'tab'],
  ['tab-820x1180-ipad-air', 820, 1180, 'tab'],
  ['tab-1180x820-ipad-air-liggend', 1180, 820, 'tab'],
  ['tab-1180x651-ipad-liggend-browser', 1180, 651, 'tab'],
  ['tab-1024x1366-ipad-pro', 1024, 1366, 'tab'],
];

const groep = Number(process.argv[2] ?? 0);
const OUT = process.argv[3] + '/';
fs.mkdirSync(OUT, { recursive: true });
const mijn = process.argv[4] ? APPARATEN.filter((a) => process.argv[4].split(',').some((k) => a[0].startsWith(k))) : APPARATEN.filter((_, i) => i % 4 === groep);
const URL = 'http://localhost:5173';
const resultaat = {};

const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });

// Controles op het huidige scherm. Geeft een lijst met problemen terug.
async function controleer(page) {
  return page.evaluate(() => {
    const W = innerWidth, H = innerHeight;
    const problemen = [];
    const zichtbaar = (e) => {
      const r = e.getBoundingClientRect();
      if (e.tagName === 'CANVAS' && r.width >= W * 0.9 && r.height >= H * 0.9) return false; // three.js-achtergrond
      const s = getComputedStyle(e);
      return r.width > 2 && r.height > 2 && s.visibility !== 'hidden' && s.display !== 'none' && Number(s.opacity) > 0.05 && !e.closest('[hidden]');
    };
    const naam = (e) => (e.getAttribute('aria-label') || e.textContent || e.className || e.tagName).toString().trim().replace(/\s+/g, ' ').slice(0, 30);
    const doc = document.scrollingElement;
    if (doc.scrollWidth > W + 1) problemen.push(`zijwaarts scrollen (${doc.scrollWidth}px > ${W}px)`);
    const scrolltVerticaal = doc.scrollHeight > H + 1;
    const klikbaar = [...document.querySelectorAll('button, input, textarea, canvas, .icoon-tegel, .kern-rij--klikbaar, .hoofdstuk-tegel, [role=button]')]
      .filter(zichtbaar)
      .filter((e) => {
        // Alleen de bladzijde die je ziet (de rest staat expres naast het beeld).
        const rij = e.closest('.bladeraar__rij');
        if (!rij) return true;
        const a = rij.getBoundingClientRect(), b = e.getBoundingClientRect();
        return b.left >= a.left - 2 && b.right <= a.right + 2;
      })
      .filter((e) => !e.closest('#decor-laag'));
    for (const e of klikbaar) {
      const r = e.getBoundingClientRect();
      if (e.closest('.bladeraar__rij')) {
        const blad = e.closest('.bladeraar__blad').getBoundingClientRect();
        if (blad.left > W - 2) continue;
      }
      // In een eigen scrollvak (lange lijst) is onderaan buiten beeld gewoon wegscrollen.
      let ouder = e.parentElement, inScrollvak = false;
      while (ouder && ouder !== document.body) {
        const st = getComputedStyle(ouder);
        if (/(auto|scroll)/.test(st.overflowY) && ouder.scrollHeight > ouder.clientHeight + 1) { inScrollvak = true; break; }
        ouder = ouder.parentElement;
      }
      if (r.left < -1 || r.right > W + 1) problemen.push(`buiten beeld (zijkant): ${naam(e)} [${Math.round(r.left)}..${Math.round(r.right)}]`);
      else if (r.bottom > H + 1 && !scrolltVerticaal && !inScrollvak) problemen.push(`onderaan afgesneden: ${naam(e)}`);
      else if (r.top < -1) problemen.push(`bovenaan afgesneden: ${naam(e)}`);
      const klein = e.matches('.bladeraar__stip') ? false : Math.min(r.width, r.height) < 40;
      if (klein && e.tagName !== 'CANVAS' && !e.matches('input, textarea')) problemen.push(`klein tikvlak ${Math.round(r.width)}x${Math.round(r.height)}: ${naam(e)}`);
    }
    // Overlap: vaste knoppen (terug, rechtsboven, overslaan) over andere knoppen/inhoud.
    const vast = [...document.querySelectorAll('.terug-knop, .top-rechts-balk, .overslaan-knop')].filter(zichtbaar);
    const inhoud = [...document.querySelectorAll('button, .icoon-tegel, .kern-rij--klikbaar, .hoofdstuk-tegel, canvas, .scherm-titel, .instructie-tekst, .oefen-kaart img, input')]
      .filter(zichtbaar)
      .filter((e) => !vast.some((v) => v.contains(e) || e.contains(v)) && !e.closest('.profiel-menu__paneel, .winkel-venster, #decor-laag'));
    for (const v of vast) {
      const a = v.getBoundingClientRect();
      for (const e of inhoud) {
        const b = e.getBoundingClientRect();
        const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (ox > 6 && oy > 6) problemen.push(`overlap: ${naam(v)} over ${naam(e)} (${Math.round(ox)}x${Math.round(oy)})`);
      }
    }
    if (scrolltVerticaal) problemen.push(`scrollt verticaal (${doc.scrollHeight}px > ${H}px)`);
    return [...new Set(problemen)];
  });
}

async function draai([id, w, h, soort]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const fouten = [];
  page.on('pageerror', (e) => fouten.push(e.message));
  const schermen = {};
  let teller = 0;
  const bekijk = async (label) => {
    await page.waitForTimeout(450);
    const p = await controleer(page);
    if (p.length) {
      const bestand = `${id}__${String(teller++).padStart(2, '0')}-${label.replace(/[^a-z0-9]+/gi, '-')}.png`;
      await page.screenshot({ path: OUT + bestand });
      schermen[label] = { problemen: p, foto: bestand };
    } else schermen[label] = { problemen: [] };
  };
  const stap = async (label, fn) => {
    try { await fn(); } catch (e) { schermen[label] = { problemen: ['NAVIGATIE MISLUKT: ' + e.message.split('\n')[0]] }; }
  };
  const start = async (leeftijd) => {
    await page.goto(URL);
    await page.evaluate((leeftijd) => {
      localStorage.clear(); sessionStorage.clear();
      localStorage.setItem('leren-lezen:profielen', JSON.stringify([
        { id: 'p', naam: 'Maximiliaan', icoonId: 'vos', kleur: 0, aangemaakt: 1 },
        { id: 'q', naam: 'Anna', icoonId: 'kat', kleur: 0, aangemaakt: 2 },
        { id: 'r', naam: 'Bram', icoonId: 'hond', kleur: 0, aangemaakt: 3 }]));
      for (const id of ['p', 'q', 'r']) localStorage.setItem('leren-lezen:voortgang:' + id, JSON.stringify({ versie: 1, laatstGekozenLeeftijd: leeftijd, kernen: {}, munten: 120 }));
    }, leeftijd);
    await page.reload(); await page.waitForTimeout(700);
  };
  const tik = async (sel, tekst) => { await (tekst ? page.locator(sel, { hasText: tekst }) : page.locator(sel)).first().click({ timeout: 8000 }); await page.waitForTimeout(500); };
  const terugNaarOnderwerpen = async () => { for (let i = 0; i < 4 && !(await page.locator('.icoon-tegel', { hasText: 'Muziek' }).count()); i++) { await page.locator('.terug-knop').first().click({ timeout: 8000 }); await page.waitForTimeout(500); } };
  const loopVragen = async (prefix, max) => {
    const gezien = new Set();
    for (let i = 0; i < max; i++) {
      const instr = ((await page.locator('.instructie-tekst').first().textContent().catch(() => '')) || '').trim().slice(0, 28) || `vraag-${i}`;
      if (!gezien.has(instr)) { gezien.add(instr); await bekijk(`${prefix}: ${instr}`); }
      const k = page.locator('.overslaan-knop');
      if (!(await k.count())) break;
      await k.first().click({ timeout: 8000 }); await page.waitForTimeout(350);
    }
  };

  await start(6);
  await bekijk('profielen');
  await stap('onderwerpen', async () => { await tik('.icoon-tegel', 'Maximiliaan'); await bekijk('onderwerpen'); });
  await stap('menu', async () => { await tik('.profiel-knop'); await bekijk('profielmenu'); await tik('.profiel-tegel', 'Mijn figuur'); await bekijk('profielmenu-figuur'); await page.mouse.click(5, h - 5); await page.waitForTimeout(300); });
  await stap('lezen', async () => {
    await tik('.icoon-tegel', 'Leren lezen'); await bekijk('lezen-hoofdstukken');
    await tik('.kern-rij--klikbaar'); await bekijk('lezen-kern1');
    await tik('.hoofdstuk-tegel', 'Oefening 1'); await loopVragen('lezen-oef', 9);
    await terugNaarOnderwerpen();
  });
  await stap('lezen-later', async () => {
    // Een later hoofdstuk voor woord bouwen, zinnen en typen.
    await tik('.icoon-tegel', 'Leren lezen');
    const rijen = page.locator('.kern-rij--klikbaar'); await rijen.nth(Math.min(5, (await rijen.count()) - 1)).click(); await page.waitForTimeout(500);
    await tik('.hoofdstuk-tegel', 'Oefening 3'); await loopVragen('lezen-later', 9);
    await terugNaarOnderwerpen();
  });
  await stap('tellen', async () => {
    await tik('.icoon-tegel', 'Tellen'); await bekijk('tellen-hoofdstukken');
    await tik('.kern-rij--klikbaar'); await tik('.hoofdstuk-tegel', 'Oefening 1'); await loopVragen('tellen', 9);
    await terugNaarOnderwerpen();
  });
  await stap('boekjes', async () => {
    await tik('.icoon-tegel', 'Leesboekjes'); await bekijk('boekenkast');
    await tik('.boekje-kaft'); await bekijk('boekje-pagina');
    await terugNaarOnderwerpen();
  });
  await stap('schrijven', async () => {
    await tik('.icoon-tegel', 'Schrijven'); await bekijk('schrijven-kies');
    await tik('.icoon-tegel', 'Letters'); await bekijk('schrijven-letter');
    await page.locator('.terug-knop').first().click(); await page.waitForTimeout(500);
    await tik('.icoon-tegel', 'Tekenen'); await bekijk('tekenen');
    await terugNaarOnderwerpen();
  });
  await stap('muziek', async () => {
    await tik('.icoon-tegel', 'Muziek');
    await tik('.icoon-tegel', 'Vrij spelen'); await bekijk('xylofoon');
    await tik('.muziek-wissel__knop', 'Drumstel'); await bekijk('drumstel');
    await page.locator('.terug-knop').first().click(); await page.waitForTimeout(500);
    await tik('.icoon-tegel', 'Speel na'); await bekijk('niveau-kies'); await tik('.niveau-tegel:last-child'); await page.waitForTimeout(1500); await bekijk('speel-na-niveau6');
    await page.locator('.terug-knop').first().click(); await page.waitForTimeout(500);
    await page.locator('.terug-knop').first().click(); await page.waitForTimeout(500);
    await tik('.icoon-tegel', 'Ritme'); await tik('.niveau-tegel:last-child'); await page.waitForTimeout(1500); await bekijk('ritme-niveau6');
    await page.locator('.terug-knop').first().click(); await page.waitForTimeout(500);
    await terugNaarOnderwerpen();
  });
  await stap('winkel', async () => {
    await tik('.munten-teller'); await bekijk('winkel');
    await tik('.winkel-kaart--slot'); await bekijk('winkel-koop');
    await tik('.winkel-venster__knop--nee');
    await tik('.winkel__tab', 'Achtergronden'); await bekijk('winkel-achtergronden');
  });
  // Leeftijd 3: luisteren en ontdekken
  await start(3);
  await stap('jong', async () => {
    await tik('.icoon-tegel', 'Maximiliaan'); await bekijk('onderwerpen-3jr');
    await tik('.icoon-tegel', 'Luisteren'); await bekijk('luisteren-kies');
    await tik('.icoon-tegel, .kern-rij--klikbaar'); await page.waitForTimeout(400);
    if (await page.locator('.hoofdstuk-tegel').count()) await tik('.hoofdstuk-tegel');
    await loopVragen('luisteren', 5);
    await terugNaarOnderwerpen();
    await tik('.icoon-tegel', 'Ontdekken'); await bekijk('ontdekken-kies');
    await tik('.icoon-tegel'); await page.waitForTimeout(400);
    if (await page.locator('.hoofdstuk-tegel').count()) await tik('.hoofdstuk-tegel');
    await loopVragen('ontdekken', 5);
    await terugNaarOnderwerpen();
    await tik('.icoon-tegel', 'Schrijven'); await tik('.icoon-tegel', 'Lijnen'); await bekijk('lijnen');
  });
  // Nieuw profiel (invoer + toetsenbord)
  await start(6);
  await stap('nieuw-profiel', async () => { await tik('.icoon-tegel', 'Nieuw profiel'); await bekijk('nieuw-profiel'); });
  resultaat[id] = { schermen, fouten };
  await ctx.close();
}

for (const a of mijn) {
  await draai(a);
  console.log('klaar', a[0]);
}
fs.writeFileSync(OUT + `resultaat-${groep}.json`, JSON.stringify(resultaat, null, 1));
await browser.close();
