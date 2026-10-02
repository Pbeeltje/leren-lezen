// Controleert dat het "Goed gedaan!"-clipje helemaal uitspeelt voordat er een volgend
// geluid start (Luister & wijs, Geheugenspel, Leren lezen, Tellen, Ontdekken bij kleuters)
// en meet de feedback-clipjes zelf (duur, stilte aan het eind).
// node tests/feedback-audio.mjs <map>
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = (process.argv[2] || 'tests/_feedback-audio') + '/';
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
const page = await ctx.newPage();
page.setDefaultTimeout(4000);
const fouten = [];
page.on('pageerror', (e) => fouten.push(e.message));
const wacht = (ms) => page.waitForTimeout(ms);

await page.addInitScript(() => {
  window.__log = [];
  const t0 = performance.now();
  const naam = (el) => decodeURIComponent(el.src.split('/assets/audio/')[1] || el.src);
  const log = (soort, el) => window.__log.push({ t: Math.round(performance.now() - t0), soort, clip: naam(el), pos: +el.currentTime.toFixed(2), duur: +(el.duration || 0).toFixed(2) });
  const gezien = new WeakSet();
  const play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () {
    if (!gezien.has(this)) {
      gezien.add(this);
      this.addEventListener('ended', () => log('ended', this));
    }
    log('play', this);
    return play.call(this);
  };
  const pause = HTMLMediaElement.prototype.pause;
  HTMLMediaElement.prototype.pause = function () {
    if (!this.paused) log('pause', this);
    return pause.call(this);
  };
});

const start = async (leeftijd) => {
  await page.goto('http://localhost:5173', { timeout: 30000 });
  await page.evaluate((leeftijd) => {
    localStorage.clear(); sessionStorage.clear();
    localStorage.setItem('leren-lezen:profielen', JSON.stringify([{ id: 'a', naam: 'Anna', icoonId: 'vos', kleur: 0, aangemaakt: 1 }]));
    localStorage.setItem('leren-lezen:voortgang:a', JSON.stringify({ versie: 1, laatstGekozenLeeftijd: leeftijd, kernen: {}, munten: 500 }));
  }, leeftijd);
  await page.reload(); await wacht(700);
  await page.locator('.icoon-tegel', { hasText: 'Anna' }).first().click(); await wacht(600);
};
const tik = async (sel, tekst) => { await (tekst ? page.locator(sel, { hasText: tekst }) : page.locator(sel)).first().click(); await wacht(500); };

// 1. De clipjes zelf: duur en hoe lang het stil is aan het eind (afgekapt = geen stilte).
await page.goto('http://localhost:5173');
const clips = await page.evaluate(async () => {
  const namen = ['goed-1', 'goed-2', 'goed-3', 'goed-4', 'goed-5', 'goed-6', 'goed-7', 'goed-8', 'goed-9', 'goed-10', 'goed-12', 'goed-13', 'goed-14', 'fout-1', 'fout-2'];
  const ac = new AudioContext();
  const uit = [];
  for (const n of namen) {
    const buf = await ac.decodeAudioData(await (await fetch(`assets/audio/instructies/feedback-${n}.mp3`)).arrayBuffer());
    const d = buf.getChannelData(0);
    const sr = buf.sampleRate;
    let piek = 0;
    for (const x of d) piek = Math.max(piek, Math.abs(x));
    const drempel = piek * 0.05; // ~ -26 dB onder de piek
    let laatste = 0, eerste = d.length;
    for (let i = 0; i < d.length; i++) if (Math.abs(d[i]) > drempel) { laatste = i; if (eerste === d.length) eerste = i; }
    // RMS van de laatste 30 ms t.o.v. de piek: hoog = midden in een klank afgesneden.
    const n30 = Math.floor(sr * 0.03);
    let som = 0;
    for (let i = d.length - n30; i < d.length; i++) som += d[i] * d[i];
    const staartDb = 20 * Math.log10(Math.sqrt(som / n30) / piek);
    uit.push({ clip: n, duur: +buf.duration.toFixed(2), stilVoor: +(eerste / sr).toFixed(2), stilNa: +((d.length - laatste) / sr).toFixed(2), staartDb: +staartDb.toFixed(1) });
  }
  return uit;
});
console.table(clips);

// Kijkt in het log of een feedback-goed-clip werd onderbroken door een ander clipje.
const controleer = (label, log) => {
  let afgekapt = 0, heel = 0;
  for (let i = 0; i < log.length; i++) {
    const e = log[i];
    if (e.soort !== 'play' || !e.clip.includes('feedback-goed')) continue;
    const vervolg = log.slice(i + 1).find((x) => x.clip === e.clip && (x.soort === 'ended' || x.soort === 'pause'));
    if (vervolg?.soort === 'ended') heel++;
    else { afgekapt++; console.log(`  AFGEKAPT ${label}: ${e.clip} @${e.t}ms`, vervolg ? `pauze na ${vervolg.pos}s van ${vervolg.duur}s` : 'geen einde gezien'); }
    // Wat startte er na de cheer, en hoeveel later dan zijn einde?
    const einde = vervolg?.t ?? Infinity;
    const volgende = log.slice(i + 1).find((x) => x.soort === 'play' && x.clip !== e.clip);
    if (volgende && volgende.t < einde) console.log(`  ${label}: ${volgende.clip} startte ${einde - volgende.t}ms vóór het einde van ${e.clip}`);
  }
  console.log(`${label}: ${heel} cheers heel, ${afgekapt} afgekapt`);
  if (afgekapt) fouten.push(`${label}: ${afgekapt} cheers afgekapt`);
};

const leegLog = () => page.evaluate(() => (window.__log = []));
const haalLog = () => page.evaluate(() => window.__log);

// 2. Luister & wijs (kleuter): tik opties tot de goede, 5 vragen.
await stap('luister', async () => {
  await start(4);
  await tik('.icoon-tegel', 'Luisteren');
  await page.locator('.icoon-tegel:not([disabled])').first().click(); await wacht(800);
  await leegLog();
  for (let v = 0; v < 5; v++) {
    const doel = await page.evaluate(() => [...window.__log].reverse().find((x) => x.soort === 'play' && x.clip.startsWith('woorden/'))?.clip);
    const knoppen = page.locator('.luister-plaatje');
    const n = await knoppen.count();
    for (let k = 0; k < n; k++) {
      if (await page.locator('.luister-plaatje.gevonden').count()) break;
      await knoppen.nth(k).click(); await wacht(150);
    }
    if (v === 0) { await wacht(150); await page.screenshot({ path: `${OUT}luister-goed.png` }); }
    // wachten tot er een nieuw woord klinkt (of de ronde voorbij is)
    await page.waitForFunction((d) => window.__log.filter((x) => x.soort === 'play' && x.clip.startsWith('woorden/')).length > 0 && [...window.__log].reverse().find((x) => x.soort === 'play' && x.clip.startsWith('woorden/'))?.t > ([...window.__log].reverse().find((x) => x.clip.includes('feedback-goed'))?.t ?? 0), doel, { timeout: 8000 }).catch(() => {});
  }
  controleer('luister', await haalLog());
});

// 3. Geheugenspel (kleuter): snel doorklikken zoals een kind doet.
await stap('geheugen', async () => {
  await start(4);
  await tik('.icoon-tegel', 'Spelletjes'); await tik('.icoon-tegel', 'Geheugenspel'); await wacht(300);
  await leegLog();
  // Paren vinden via het woordgeluid van elke kaart.
  const kaarten = page.locator('.geheugen-kaart');
  const n = await kaarten.count();
  const woordVan = [];
  for (let i = 0; i < n; i++) {
    // eerst alles een keer omdraaien om de woorden te leren (per twee)
    if (await kaarten.nth(i).evaluate((e) => e.classList.contains('gevonden'))) continue;
    await page.waitForFunction(() => !document.querySelector('.geheugen-kaart.omgedraaid:not(.gevonden)') || document.querySelectorAll('.geheugen-kaart.omgedraaid:not(.gevonden)').length === 1, null, { timeout: 5000 });
    await kaarten.nth(i).click({ force: true }); await wacht(120);
    woordVan[i] = (await haalLog()).filter((x) => x.soort === 'play' && x.clip.startsWith('woorden/')).at(-1)?.clip;
  }
  await wacht(1500);
  const paren = {};
  woordVan.forEach((w, i) => (paren[w] ??= []).push(i));
  for (const [, [a, c]] of Object.entries(paren)) {
    if (c === undefined) continue;
    if (await kaarten.nth(a).evaluate((e) => e.classList.contains('gevonden'))) continue;
    // Kind tikt meteen door: wacht alleen tot het bord weer tikbaar is.
    for (const i of [a, c]) {
      for (let p = 0; p < 40; p++) {
        await kaarten.nth(i).click({ force: true }); await wacht(60);
        if (await kaarten.nth(i).evaluate((e) => e.classList.contains('omgedraaid'))) break;
      }
    }
  }
  await wacht(3000);
  controleer('geheugen', await haalLog());
});

// 4. Kleuter Leren lezen / Tellen (OefeningScreen / RekenOefeningScreen): knoppen aftikken
//    tot er een goed-clipje klinkt; vragen zonder knoppen worden overgeslagen.
for (const onderwerp of ['Leren lezen', 'Tellen']) {
  await stap(onderwerp, async () => {
    await start(4);
    await tik('.icoon-tegel', onderwerp);
    await tik('.kern-rij--klikbaar');
    await tik('.hoofdstuk-tegel', 'Oefening 1'); await wacht(300);
    await leegLog();
    let goedGezien = 0;
    for (let v = 0; v < 8; v++) {
      if (!(await page.locator('.overslaan-knop').count())) break;
      const voor = (await haalLog()).length;
      const nieuwGoed = async () => (await haalLog()).slice(voor).some((x) => x.soort === 'play' && x.clip.includes('feedback-goed'));
      const knoppen = page.locator('.scherm button:not(.audio-knop):not(.overslaan-knop):not(.terug-knop)');
      const n = await knoppen.count();
      for (let k = 0; k < n && !(await nieuwGoed()); k++) {
        await knoppen.nth(k).click({ timeout: 800, force: true }).catch(() => {}); await wacht(150);
      }
      if (await nieuwGoed()) {
        goedGezien++;
        // wachten tot de volgende instructie klinkt
        await page.waitForFunction((v) => window.__log.slice(v).some((x) => x.soort === 'play' && x.clip.startsWith('instructies/') && !x.clip.includes('feedback')), voor, { timeout: 6000 }).catch(() => {});
      } else if (await page.locator('.overslaan-knop').count()) {
        await page.locator('.overslaan-knop').first().click(); await wacht(300);
      }
    }
    console.log(`${onderwerp}: ${goedGezien} vragen goed beantwoord`);
    await wacht(2500);
    controleer(onderwerp, await haalLog());
  });
}

// 5. Terug midden in de feedback: alles moet stil zijn en er mag geen nieuwe vraag klinken.
await stap('terug', async () => {
  await start(4);
  await tik('.icoon-tegel', 'Leren lezen');
  await tik('.kern-rij--klikbaar');
  await tik('.hoofdstuk-tegel', 'Oefening 1'); await wacht(300);
  for (let v = 0; v < 8; v++) {
    await leegLog();
    const knoppen = page.locator('.scherm button:not(.audio-knop):not(.overslaan-knop):not(.terug-knop)');
    const n = await knoppen.count();
    let goed = false;
    for (let k = 0; k < n && !goed; k++) {
      await knoppen.nth(k).click({ timeout: 800, force: true }).catch(() => {});
      goed = (await haalLog()).some((x) => x.soort === 'play' && x.clip.includes('feedback-goed'));
    }
    if (!goed) { await page.locator('.overslaan-knop').first().click(); await wacht(400); continue; }
    await page.locator('.terug-knop').first().click();
    const t = (await haalLog()).at(-1).t;
    await wacht(2500);
    const na = (await haalLog()).filter((x) => x.t > t && x.soort === 'play');
    const opScherm = await page.locator('.hoofdstuk-tegel').count();
    console.log(`terug: ${na.length} clips na terug (${na.map((x) => x.clip).join(', ') || '-'}), hoofdstukscherm ${opScherm ? 'ja' : 'nee'}`);
    if (na.length || !opScherm) fouten.push('terug: geluid of scherm liep door na terug');
    return;
  }
  fouten.push('terug: geen goed antwoord gevonden');
});

// ALLEEN=luister,geheugen node tests/feedback-audio.mjs ... : alleen die onderdelen.
async function stap(label, fn) {
  if (process.env.ALLEEN && !process.env.ALLEEN.split(',').includes(label)) return;
  try { await fn(); } catch (e) { fouten.push(`${label}: ${e.message.split('\n')[0]}`); await page.screenshot({ path: `${OUT}FOUT-${label}.png` }).catch(() => {}); }
}

console.log(fouten.length ? `FOUTEN:\n${fouten.join('\n')}` : 'OK');
await b.close();
process.exit(fouten.length ? 1 : 0);
