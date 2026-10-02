import { chromium } from 'playwright';
import fs from 'node:fs';
// Liggende telefoon: elk scherm, elke vraagsoort, elk spel en elke achtergrond één keer op
// de foto. Gebruik: node tests/liggend.mjs <uitmap> [breedtexhoogte ...]
const OUT = process.argv[2] + '/';
fs.mkdirSync(OUT, { recursive: true });
const MATEN = process.argv.slice(3).length ? process.argv.slice(3).map((m) => m.split('x').map(Number)) : [[844, 390], [667, 375]];
const THEMAS = ['ruimte', 'dino', 'kasteel', 'zee', 'onderwater', 'boerderij', 'herfst', 'winter', 'kermis', 'bouw', 'trein', 'savanne'];
const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const fouten = [];
// ALLEEN=lezen,tellen,thema node tests/liggend.mjs ... : alleen die onderdelen.
const ALLEEN = process.env.ALLEEN?.split(',');

for (const [w, h] of MATEN) {
  const tag = `${w}x${h}`;
  const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.setDefaultTimeout(4000);
  page.setDefaultNavigationTimeout(30000);
  page.on('pageerror', (e) => fouten.push(`${tag}: ${e.message}`));
  const wacht = (ms) => page.waitForTimeout(ms);
  let n = 0;
  const foto = async (label) => { await wacht(450); await page.screenshot({ path: `${OUT}${tag}__${String(n++).padStart(3, '0')}-${label.replace(/[^a-z0-9]+/gi, '-').slice(0, 50)}.png` }); };
  const tik = async (sel, tekst) => { const l = (tekst ? page.locator(sel, { hasText: tekst }) : page.locator(sel)).first(); await l.evaluate((e) => e.scrollIntoView({ block: 'center' }), null, { timeout: 3000 }); await wacht(150); await l.click({ timeout: 3000 }); await wacht(500); };
  const terug = async () => { await page.locator('.terug-knop').first().click({ timeout: 3000 }); await wacht(500); };
  const naarOnderwerpen = async () => { for (let i = 0; i < 5 && !(await page.locator('.icoon-tegel', { hasText: 'Muziek' }).count()) && (await page.locator('.terug-knop').count()); i++) await terug(); };
  const terugTot = async (sel) => { for (let i = 0; i < 4 && !(await page.locator(sel).count()); i++) { if (await page.locator('.typen-knop', { hasText: 'Verder' }).count()) { await tik('.typen-knop', 'Verder'); continue; } await terug(); } };
  const stap = async (label, fn, vers = 0) => { if (ALLEEN && !ALLEEN.some((a) => label.startsWith(a))) return; try { if (vers) { await start(vers); await tik('.icoon-tegel', 'Anna'); } await fn(); } catch (e) { fouten.push(`${tag} ${label}: ${e.message.split('\n')[0]}`); console.log('FOUT', label, e.message.split('\n')[0]); await page.screenshot({ path: `${OUT}${tag}__FOUT-${label}.png` }).catch(() => {}); } };
  const start = async (leeftijd, thema = 'ruimte') => {
    await page.goto('http://localhost:5173', { timeout: 30000 });
    await page.evaluate(([leeftijd, thema]) => {
      localStorage.clear(); sessionStorage.clear();
      localStorage.setItem('leren-lezen:profielen', JSON.stringify([{ id: 'a', naam: 'Anna', icoonId: 'vos', kleur: 0, aangemaakt: 1 }, { id: 'b', naam: 'Bram', icoonId: 'kat', kleur: 0, aangemaakt: 2 }]));
      localStorage.setItem('leren-lezen:voortgang:a', JSON.stringify({ versie: 1, laatstGekozenLeeftijd: leeftijd, kernen: {}, munten: 500 }));
      localStorage.setItem('leren-lezen:achtergrond:a', thema);
    }, [leeftijd, thema]);
    await page.reload(); await wacht(700);
  };
  const gezien = new Set();
  // Sla vragen over; foto bij elke nieuwe instructie.
  const loop = async (prefix, max = 40) => {
    for (let i = 0; i < max; i++) {
      const instr = ((await page.locator('.instructie-tekst').first().textContent().catch(() => '')) || '').trim().replace(/\b(van|de|het)\s+\S+$/i, '').slice(0, 30) || `vraag-${i}`;
      if (!gezien.has(instr)) { gezien.add(instr); await foto(`${prefix}-${instr}`); }
      const k = page.locator('.overslaan-knop');
      if (!(await k.count())) break;
      await k.first().click({ timeout: 3000 }); await wacht(300);
    }
  };

  await start(6);
  if (!ALLEEN) await foto('profielen');
  await stap('onderwerpen', async () => { await tik('.icoon-tegel', 'Anna'); await foto('onderwerpen-groep3'); });
  await stap('menu', async () => { await tik('.profiel-knop'); await foto('profielmenu'); await page.mouse.click(5, h - 5); await wacht(300); });
  await stap('lezen', async () => {
    await tik('.icoon-tegel', 'Leren lezen'); await foto('lezen-hoofdstukken');
    const aantal = await page.locator('.kern-rij--klikbaar').count();
    for (const k of [...new Set([0, 3, 8, aantal - 1].filter((i) => i < aantal))]) {
      await page.locator('.kern-rij--klikbaar').nth(k).click(); await wacht(500);
      if (k === 0) await foto('lezen-kern1');
      for (const o of ['Oefening 1', 'Oefening 2', 'Oefening 3']) { await tik('.hoofdstuk-tegel', o); await loop('lezen'); await wacht(1500); await terugTot('.hoofdstuk-tegel'); }
      if (k === 0) { await tik('.hoofdstuk-tegel--toets'); await loop('toets'); await wacht(1500); await foto('toets-klaar'); await terugTot('.hoofdstuk-tegel'); }
      await terugTot('.kern-rij--klikbaar');
    }
    await naarOnderwerpen();
  }, 6);
  await stap('tellen', async () => {
    await tik('.icoon-tegel', 'Tellen'); await foto('tellen-hoofdstukken');
    const aantal = await page.locator('.kern-rij--klikbaar').count();
    for (const k of [...new Set([0, 3, 8, aantal - 1].filter((i) => i < aantal))]) {
      await page.locator('.kern-rij--klikbaar').nth(k).click(); await wacht(500);
      for (const o of ['Oefening 1', 'Oefening 2', 'Oefening 3']) { await tik('.hoofdstuk-tegel', o); await loop('tellen'); await wacht(1500); await terugTot('.hoofdstuk-tegel'); }
      await terugTot('.kern-rij--klikbaar');
    }
    await naarOnderwerpen();
  }, 6);
  await stap('boekjes', async () => { await tik('.icoon-tegel', 'Leesboekjes'); await foto('boekenkast'); await tik('.boekje-kaft'); await foto('boekje-pagina'); await naarOnderwerpen(); });
  await stap('schrijven', async () => {
    await tik('.icoon-tegel', 'Schrijven'); await foto('schrijven-kies');
    for (const s of ['Letters', 'Woordjes']) { await tik('.icoon-tegel', s); await foto(`schrijven-${s}`); await terug(); }
    await tik('.icoon-tegel', 'Tekenen'); await foto('tekenen');
    await naarOnderwerpen();
  }, 6);
  await stap('geheugen', async () => {
    await tik('.icoon-tegel', 'Geheugenspel'); await foto('geheugen-1');
    if (await page.locator('.icoon-tegel, .niveau-tegel').count()) { await tik('.icoon-tegel, .niveau-tegel'); await foto('geheugen-2'); }
    await naarOnderwerpen();
  }, 6);
  await stap('muziek', async () => {
    await tik('.icoon-tegel', 'Muziek'); await foto('muziek-kies');
    await tik('.icoon-tegel', 'Vrij spelen'); await foto('xylofoon');
    await tik('.muziek-wissel__knop', 'Drumstel'); await foto('drumstel');
    for (const k of ['Blokken', 'Houtblok']) if (await page.locator('.muziek-wissel__knop', { hasText: k }).count()) { await tik('.muziek-wissel__knop', k); await foto(k); }
    await terug();
    await tik('.icoon-tegel', 'Speel na'); await foto('niveau-kies'); await tik('.niveau-tegel:last-child'); await wacht(1500); await foto('speel-na-6'); await terug(); await terug();
    await tik('.icoon-tegel', 'Ritme'); await tik('.niveau-tegel:last-child'); await wacht(1500); await foto('ritme-6');
    await naarOnderwerpen();
  }, 6);
  await stap('vangspel', async () => {
    await tik('.icoon-tegel', 'Vangspel'); await foto('vang-start');
    await tik('.vang-venster__start'); await wacht(3000); await foto('vang-spel');
    await naarOnderwerpen();
  }, 6);
  await stap('winkel', async () => {
    await tik('.munten-teller'); await foto('winkel');
    await tik('.winkel-kaart--slot'); await foto('winkel-koop'); await tik('.winkel-venster__knop--nee');
    await tik('.winkel__tab', 'Achtergronden'); await foto('winkel-achtergronden');
  }, 6);
  // Kleuter: luisteren, ontdekken, lijnen, kleuter-lezen/tellen.
  await stap('kleuter-luisteren', async () => {
    await foto('onderwerpen-kleuter');
    await tik('.icoon-tegel', 'Luisteren'); await foto('luisteren-kies');
    await tik('.icoon-tegel', 'Luister'); await wacht(400);
    if (await page.locator('.kern-rij--klikbaar').count()) { await foto('luister-hoofdstukken'); await tik('.kern-rij--klikbaar'); }
    if (await page.locator('.hoofdstuk-tegel').count()) await tik('.hoofdstuk-tegel');
    await loop('luisteren', 14);
  }, 4);
  await stap('kleuter-geheugen', async () => { await tik('.icoon-tegel', 'Geheugenspel'); await foto('geheugen-kleuter'); }, 4);
  for (const s of ['Groot of klein', 'Meer of minder', 'Kleuren', 'Welke vorm']) await stap('ontdekken-' + s, async () => { await tik('.icoon-tegel', 'Ontdekken'); if (s === 'Groot of klein') await foto('ontdekken-kies'); await tik('.icoon-tegel', s); await loop('ontdekken', 6); }, 4);
  await stap('lijnen', async () => { await tik('.icoon-tegel', 'Schrijven'); await foto('schrijven-kleuter'); await tik('.icoon-tegel', 'Lijnen'); await foto('lijnen'); }, 4);
  for (const t of ['Leren lezen', 'Tellen']) await stap('kleuter-' + t, async () => { await tik('.icoon-tegel', t); await foto('kleuter-hoofdstukken-' + t); await tik('.kern-rij--klikbaar'); await tik('.hoofdstuk-tegel', 'Oefening 1'); await loop(`kleuter-${t}`, 12); }, 4);
  // Achtergronden: een vraag erop, juichen en feest.
  for (const thema of THEMAS) {
    if (ALLEEN && !ALLEEN.some((a) => `thema-${thema}`.startsWith(a))) continue;
    await start(6, thema);
    await stap(`thema-${thema}`, async () => {
      await tik('.icoon-tegel', 'Anna'); await foto(`thema-${thema}-onderwerpen`);
      await tik('.icoon-tegel', 'Leren lezen'); await tik('.kern-rij--klikbaar'); await tik('.hoofdstuk-tegel', 'Oefening 1'); await foto(`thema-${thema}-vraag`);
      const stuur = (naam) => page.evaluate(async (naam) => (await import('/src/engine/events.ts')).events.emit(naam, undefined), naam);
      await stuur('sessie-klaar'); await wacht(3000); await foto(`thema-${thema}-feest`);
    });
  }
  await ctx.close();
  console.log('klaar', tag);
}
console.log('fouten', fouten.join(' | '));
await b.close();
