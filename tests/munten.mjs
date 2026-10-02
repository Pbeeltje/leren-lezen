import { chromium } from 'playwright';
// Muntenregels van Lezen/Tellen/Geheugen (zie src/engine/rewards.ts). Gebruik: node tests/munten.mjs
// De oefenschermen worden onderweg herschreven zodat de test vragen goed kan "beantwoorden"
// zonder elk spel te kennen: window.__antwoord(true) roept afhandelenResultaat aan.
const URL = 'http://localhost:5173';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1024, height: 768 } });
const page = await ctx.newPage();
page.setDefaultTimeout(15000);
const fouten = [];
page.on('pageerror', (e) => fouten.push(`pageerror: ${e.message}`));
// Stille HMR-verbinding: een bewerking elders (andere sessie) mag de pagina niet midden in de test herladen.
await page.routeWebSocket(/./, () => {});
const haak = (aanroep) => `function toonHuidige() { window.__vraagNr = huidigeIndex; window.__aantal = oefeningen.length; window.__antwoord = (j) => ${aanroep};`;
// Rondes (Ontdekken, Schrijven, Muziek) en Luisteren: window.__goed() = de goed-callback van de huidige vraag.
for (const [patroon, van, naar] of [
  [/\/screens\/OefeningScreen\.ts(\?|$)/, 'function toonHuidige() {', haak('afhandelenResultaat(oefeningen[huidigeIndex], j)')],
  [/\/screens\/RekenOefeningScreen\.ts(\?|$)/, 'function toonHuidige() {', haak('afhandelenResultaat(j)')],
  [/\/screens\/RondeScreen\.ts(\?|$)/, 'opruimen = vraag.render(container, () => {', 'opruimen = vraag.render(container, window.__goed = () => {'],
  [/\/screens\/LuisterenScreen\.ts(\?|$)/, 'huidigeVraag, () => {', 'huidigeVraag, window.__goed = () => {'],
]) {
  await page.route(patroon, async (route) => {
    const res = await route.fetch();
    const body = (await res.text()).replace(van, naar);
    if (!body.includes('window.__')) throw new Error('haak niet geplaatst: ' + route.request().url());
    await route.fulfill({ response: res, body });
  });
}

const wacht = (ms) => page.waitForTimeout(ms);
const tik = async (sel, tekst) => { await (tekst ? page.locator(sel, { hasText: tekst }) : page.locator(sel)).first().click(); await wacht(450); };
const munten = () => page.evaluate(() => JSON.parse(localStorage.getItem('leren-lezen:voortgang:a')).munten);
const kern = (id) => page.evaluate((id) => JSON.parse(localStorage.getItem('leren-lezen:voortgang:a')).kernen[id], id);

async function start(leeftijd, kernen = {}) {
  await page.goto(URL);
  await page.evaluate(([leeftijd, kernen]) => {
    localStorage.clear();
    localStorage.setItem('leren-lezen:profielen', JSON.stringify([{ id: 'a', naam: 'Anna', icoonId: 'vos', kleur: 0, aangemaakt: 1 }]));
    localStorage.setItem('leren-lezen:voortgang:a', JSON.stringify({ versie: 1, laatstGekozenLeeftijd: leeftijd, kernen, munten: 0 }));
  }, [leeftijd, kernen]);
  await page.reload();
  await wacht(700);
  await tik('.icoon-tegel', 'Anna');
}

// Speelt de geopende sessie: de eerste `goed` vragen goed, de rest overgeslagen.
async function speel(goed) {
  await page.waitForFunction(() => window.__vraagNr === 0);
  const n = await page.evaluate(() => window.__aantal);
  await wacht(400); // tegen-dubbelklik van het oefenscherm
  for (let i = 0; i < n; i++) {
    await page.waitForFunction((i) => window.__vraagNr === i, i).catch(async (e) => {
      await page.screenshot({ path: 'tests/_tmp/munten-vast.png' });
      throw new Error(`vast bij vraag ${i}/${n}, __vraagNr=${await page.evaluate(() => window.__vraagNr)}: ${e.message.split('\n')[0]}`);
    });
    if (i < goed) await page.evaluate(() => window.__antwoord(true));
    else await page.locator('.overslaan-knop').first().click();
  }
  return n;
}

const resultaten = [];
function check(label, kreeg, verwacht) {
  const ok = kreeg === verwacht;
  resultaten.push(`${ok ? 'OK  ' : 'FOUT'} ${label}: ${kreeg} (verwacht ${verwacht})`);
  console.log(resultaten.at(-1));
  if (!ok) fouten.push(label);
}

async function oefening(label, nr, perGoed, eind, goed = 99) {
  const voor = await munten();
  await page.evaluate(() => (window.__vraagNr = -1));
  await tik('.hoofdstuk-tegel', `Oefening ${nr}`);
  const n = await speel(goed);
  await page.locator('.hoofdstuk-tegel', { hasText: 'Oefening 1' }).waitFor();
  await wacht(300);
  const g = Math.min(goed, n);
  check(`${label} (${g}/${n} goed)`, (await munten()) - voor, g * perGoed + eind);
}

async function toets(label, goed, perGoed, eindVoor) {
  const voor = await munten();
  await page.evaluate(() => (window.__vraagNr = -1));
  await tik('.hoofdstuk-tegel--toets');
  await page.waitForFunction(() => window.__vraagNr === 0);
  const n = await page.evaluate(() => window.__aantal);
  const g = goed === 'helft' ? Math.ceil(n / 2) : goed === 'alles' ? n : goed;
  await speel(g);
  const tekst = await page.locator('.resultaat-munten-rij').textContent();
  const verschil = (await munten()) - voor;
  const verwacht = g * perGoed + eindVoor(g, n);
  check(`${label} (${g}/${n} goed)`, verschil, verwacht);
  check(`${label} resultaatscherm`, Number(tekst.match(/\+(\d+)/)[1]), verwacht);
  await tik('.typen-knop', 'Verder');
}

// Een hele ronde-set (2 x 5 vragen) goed; controleert munten en de klaar-kaart.
async function rondeSet(label, tegels, verwacht) {
  const voor = await munten();
  for (const t of tegels) {
    if (t.startsWith('.')) await tik(t);
    else await tik('.icoon-tegel', t);
  }
  for (let i = 0; i < 10; i++) {
    await page.waitForFunction(() => typeof window.__goed === 'function').catch(async (e) => {
      await page.screenshot({ path: 'tests/_tmp/munten-ronde.png' });
      throw e;
    });
    await page.evaluate(() => { const f = window.__goed; window.__goed = undefined; f(); });
  }
  const tekst = await page.locator('.klaar-kaart .resultaat-munten-rij').textContent();
  check(label, (await munten()) - voor, verwacht);
  check(`${label} klaar-kaart`, Number(tekst.match(/\+(\d+)/)[1]), verwacht);
}

async function geheugen(label, perPaar, perBord) {
  const voor = await munten();
  await tik('.icoon-tegel', 'Spelletjes');
  await tik('.icoon-tegel', 'Geheugenspel');
  if (await page.locator('.niveau-tegel').count()) await tik('.niveau-tegel');
  await page.locator('.geheugen-kaart').first().waitFor();
  const bronnen = await page.locator('.geheugen-kaart__voorkant').evaluateAll((els) => els.map((e) => e.getAttribute('src')));
  const paren = new Map();
  bronnen.forEach((s, i) => paren.set(s, [...(paren.get(s) ?? []), i]));
  let eerste = true;
  for (const [a, c] of paren.values()) {
    // Het bord is dicht zolang woord en "Goed zo!" klinken (wisselende duur): opnieuw tikken tot het paar ligt.
    const gevonden = () => page.evaluate((c) => document.querySelectorAll('.geheugen-kaart')[c].classList.contains('gevonden'), c);
    for (let poging = 0; poging < 30 && !(await gevonden()); poging++) {
      await page.locator('.geheugen-kaart').nth(a).click();
      await page.locator('.geheugen-kaart').nth(c).click();
      await wacht(500);
    }
    if (!(await gevonden())) throw new Error(`${label}: paar niet gevonden`);
    if (eerste) check(`${label}, eerste paar meteen`, (await munten()) - voor, perPaar);
    eerste = false;
  }
  // De bordbonus komt pas na de laatste "Goed zo!"; daarna wordt er niets meer betaald (volgend bord is leeg).
  await page.waitForFunction((n) => JSON.parse(localStorage.getItem('leren-lezen:voortgang:a')).munten > n, voor + paren.size * perPaar, { timeout: 10000 }).catch(() => {});
  await wacht(500);
  check(`${label} (${paren.size} paren, hele bord)`, (await munten()) - voor, paren.size * perPaar + perBord);
}

// ALLEEN=tellen,geheugen node tests/munten.mjs : alleen die onderdelen.
const ALLEEN = process.env.ALLEEN?.split(',');
const doe = (naam) => !ALLEEN || ALLEEN.includes(naam);

// --- Groep 3, Lezen. Oude opslag: kern al gestart, 3 sessies, geen oefeningenAf → toch volle munten.
if (doe('lezen')) {
await start(6);
const lezenId = await page.evaluate(async () => (await import('/src/engine/leeftijdGrens.ts')).leesKernen()[0].id);
await start(6, { [lezenId]: { gestart: true, voltooid: true, sterren: 2, oefenSessies: 3 } });
await tik('.icoon-tegel', 'Leren lezen');
await tik('.kern-rij--klikbaar');
await oefening('g3 lezen oefening 1, eerste keer (oude opslag)', 1, 2, 5);
await oefening('g3 lezen oefening 1, herhaling', 1, 1, 3);
await oefening('g3 lezen oefening 2, eerste keer', 2, 2, 5);
await oefening('g3 lezen oefening 3, half gespeeld telt niet als af: 0 goed', 3, 2, 5, 0);
check('g3 lezen oefeningenAf', JSON.stringify((await kern(lezenId)).oefeningenAf), '[1,2,3]');
await toets('g3 lezen toets, helft goed', 'helft', 2, () => 10);
await toets('g3 lezen toets, perfect (eerste keer)', 'alles', 2, () => 20 + 50);
await toets('g3 lezen toets, perfect herhaald', 'alles', 1, () => 10);
}

// --- Groep 3, Tellen.
if (doe('tellen')) {
await start(6);
await tik('.icoon-tegel', 'Tellen');
await tik('.kern-rij--klikbaar');
await oefening('g3 tellen oefening 3, eerste keer', 3, 2, 5);
await oefening('g3 tellen oefening 1, eerste keer (3 al af)', 1, 2, 5);
await oefening('g3 tellen oefening 3, herhaling', 3, 1, 3);
await toets('g3 tellen toets, minder dan de helft', 0, 2, () => 0);
await toets('g3 tellen toets, perfect (eerste keer)', 'alles', 2, () => 20 + 50);
await toets('g3 tellen toets, perfect herhaald', 'alles', 1, () => 10);
}

// --- Geheugen.
if (doe('geheugen')) {
await start(6);
await geheugen('g3 geheugenbord', 2, 10);
await start(4);
await geheugen('kleuter geheugenbord', 3, 15);
}

// --- Rondes en Luisteren: 10 x per goed + setbonus.
if (doe('rondes')) {
await start(6);
await rondeSet('g3 schrijven letters', ['Schrijven', 'Letters'], 10 * 2 + 5);
await start(6);
await rondeSet('g3 speel na niveau 4', ['Muziek', 'Speel na', '.niveau-tegel--4'], 10 * 8 + 40);
await start(4);
await rondeSet('kleuter ontdekken kleuren', ['Ontdekken', 'Kleuren'], 10 * 3 + 8);
await start(4);
await rondeSet('kleuter ritme niveau 2', ['Muziek', 'Ritme', '.niveau-tegel--2'], 10 * 3 + 15);
}
if (doe('luisteren')) {
await start(4);
await tik('.icoon-tegel', 'Luisteren');
await tik('.icoon-tegel', 'Boerderij');
await rondeSet('kleuter luisteren', [], 10 * 3 + 8);
}

// --- Bedragen per muziekniveau (rechtstreeks uit rewards.ts).
if (doe('muziek')) {
for (const [leeftijd, groep, perGoed, perSet] of [[6, 'g3', [2, 2, 4, 8, 8], [10, 10, 20, 40, 40]], [4, 'kleuter', [3, 3, 6, 12, 12], [15, 15, 30, 60, 60]]]) {
  await start(leeftijd);
  const bedragen = await page.evaluate(async () => {
    const r = await import('/src/engine/rewards.ts');
    const m = await import('/src/games/muziek/muziekVragen.ts');
    return [1, 2, 3, 4, 5].map((n) => r.muziekMunten(m.niveauOmschrijving('speel-na', n).max));
  });
  check(`${groep} muziek per goed niveau 1-5`, JSON.stringify(bedragen.map((x) => x.perGoed)), JSON.stringify(perGoed));
  check(`${groep} muziek per set niveau 1-5`, JSON.stringify(bedragen.map((x) => x.perSet)), JSON.stringify(perSet));
}
}

// --- Kleuter, Lezen: nooit minder.
if (doe('kleuter')) {
await start(4);
await tik('.icoon-tegel', 'Leren lezen');
await tik('.kern-rij--klikbaar');
await oefening('kleuter oefening 1, eerste keer', 1, 3, 8);
await oefening('kleuter oefening 1, herhaling', 1, 3, 8);
await toets('kleuter toets, perfect (eerste keer)', 'alles', 3, () => 30 + 75);
await toets('kleuter toets, perfect herhaald (geen perfect-bonus meer)', 'alles', 3, () => 15);
await toets('kleuter toets, helft goed na perfect', 'helft', 3, () => 15);
}

console.log(fouten.length ? `FOUTEN: ${fouten.join(' | ')}` : 'alles goed');
await b.close();
process.exit(fouten.length ? 1 : 0);
