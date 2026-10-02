import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

// Plus/min (los), munten, briefjes en de herhaling.
// Gebruik: node tests/sommen-geld.mjs <map>
const OUT = process.argv[2].replace(/\\/g, '/').replace(/\/?$/, '/');
mkdirSync(OUT, { recursive: true });

const MIN = '\u2212';
const rx = (tekst) => new RegExp(`^${tekst.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);

function parseSom(tekst) {
  const schoon = tekst.replace(/\s*=\s*\??\s*$/, '').trim();
  const m = schoon.match(/^(\d+)\s*([+\u2212])\s*(\d+)$/);
  if (!m) throw new Error(`geen som: ${tekst}`);
  const a = Number(m[1]);
  const b = Number(m[3]);
  const plus = m[2] === '+';
  return { a, b, plus, antwoord: plus ? a + b : a - b };
}

function bedrag(cent) {
  const euro = Math.floor(cent / 100);
  const rest = cent % 100;
  return rest === 0 ? String(euro) : `${euro},${String(rest).padStart(2, '0')}`;
}

function checkSom(som, regel) {
  if (regel === 'plus10') {
    if (!som.plus || som.a < 1 || som.b < 1 || som.antwoord < 2 || som.antwoord > 10) throw new Error(`plus10 ${som.a}+${som.b}`);
  } else if (regel === 'min10') {
    if (som.plus || som.a < 1 || som.a > 10 || som.b < 1 || som.antwoord < 0) throw new Error(`min10 ${som.a}-${som.b}`);
  } else if (regel === 'plus20') {
    if (!som.plus || som.a < 1 || som.b < 1 || som.antwoord < 11 || som.antwoord > 20) throw new Error(`plus20 ${som.a}+${som.b}`);
  } else if (regel === 'min20') {
    if (som.plus || som.a < 11 || som.a > 20 || som.b < 1 || som.antwoord < 0) throw new Error(`min20 ${som.a}-${som.b}`);
  }
}

const browser = await chromium.launch();
const fouten = [];
const log = [];

function profiel(leeftijd) {
  return (jaren) => {
    localStorage.setItem('leren-lezen:gedempt', '1');
    localStorage.setItem('leren-lezen:profielen', JSON.stringify([{ id: 'a', naam: 'Anna', icoonId: 'vos', kleur: 0, aangemaakt: 1 }]));
    localStorage.setItem('leren-lezen:voortgang:a', JSON.stringify({ versie: 1, laatstGekozenLeeftijd: jaren, kernen: {}, munten: 0 }));
  };
}

async function openApp(width, height, leeftijd = 6) {
  const page = await (await browser.newContext({ viewport: { width, height }, hasTouch: true })).newPage();
  page.on('pageerror', (e) => fouten.push(e.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') fouten.push(msg.text());
  });
  await page.context().addInitScript(profiel(leeftijd), leeftijd);
  await page.goto('http://localhost:5173');
  await page.locator('.icoon-tegel', { hasText: 'Anna' }).click();
  try {
    await page.locator('.icoon-tegel', { hasText: 'Tellen' }).waitFor({ timeout: 8000 });
  } catch (e) {
    console.log('SCHERM', await page.locator('body').innerText());
    console.log('FOUTEN-TOT-NU', fouten);
    throw e;
  }
  await page.locator('.icoon-tegel', { hasText: 'Tellen' }).click();
  await page.locator('.kern-rij__titel').first().waitFor();
  return page;
}

async function openKern(page, stuk) {
  const titel = page.locator('.kern-rij__titel', { hasText: stuk });
  for (let i = 0; i < 8; i++) {
    const inBeeld = await titel.evaluate((el) => {
      const venster = el.closest('.kern-paginas__venster');
      if (!venster) return true;
      const r = el.getBoundingClientRect();
      const v = venster.getBoundingClientRect();
      return r.width > 0 && r.left < v.right - 8 && r.right > v.left + 8;
    });
    if (inBeeld) break;
    const pijl = page.locator('.kern-paginas__pijl--rechts');
    if (await pijl.isDisabled()) break;
    await pijl.click();
    await page.waitForTimeout(350);
  }
  await titel.click();
  await page.locator('.hoofdstuk-tegel', { hasText: 'Oefening 1' }).waitFor();
}

async function start(page, label) {
  await page.locator('.hoofdstuk-tegel', { hasText: label }).click();
  await page.locator('.instructie-tekst').waitFor();
  await page.waitForTimeout(250);
}

async function handtekening(page) {
  return page.evaluate(() => {
    const som = document.querySelector('.oefen-kaart__som')?.textContent || '';
    const koppel = [...document.querySelectorAll('.koppel-som')].map((e) => e.textContent).join('|');
    const geld = [...document.querySelectorAll('.geld-bak img')].map((e) => e.getAttribute('src')).join('|');
    const instr = document.querySelector('.instructie-tekst')?.textContent || '';
    return `${instr}#${som}#${koppel}#${geld}`;
  });
}

async function wachtAndere(page, voor) {
  await page.waitForFunction((oud) => {
    if (document.querySelector('.hoofdstuk-tegel')) return true;
    const som = document.querySelector('.oefen-kaart__som')?.textContent || '';
    const koppel = [...document.querySelectorAll('.koppel-som')].map((e) => e.textContent).join('|');
    const geld = [...document.querySelectorAll('.geld-bak img')].map((e) => e.getAttribute('src')).join('|');
    const instr = document.querySelector('.instructie-tekst')?.textContent || '';
    return `${instr}#${som}#${koppel}#${geld}` !== oud;
  }, voor, { timeout: 6000 });
}

async function skip(page) {
  const voor = await handtekening(page);
  await page.locator('.overslaan-knop').click();
  await wachtAndere(page, voor);
}

async function naarLijst(page) {
  const verder = page.locator('.typen-knop', { hasText: 'Verder' });
  if (await verder.count()) {
    await verder.click();
    await page.locator('.hoofdstuk-tegel').first().waitFor();
  }
  if (await page.locator('.hoofdstuk-tegel').count()) await page.locator('.terug-knop').click();
  await page.locator('.kern-rij__titel').first().waitFor();
}

async function leesGeld(page) {
  const imgs = await page.locator('.geld-bak img').evaluateAll((els) => els.map((img) => img.getAttribute('src') || ''));
  const munten = [];
  const briefjes = [];
  let totaal = 0;
  for (const src of imgs) {
    const munt = src.match(/munt-(\d+)\.svg/);
    const brief = src.match(/brief-(\d+)\.svg/);
    if (munt) {
      munten.push(Number(munt[1]));
      totaal += Number(munt[1]);
    }
    if (brief) {
      briefjes.push(Number(brief[1]));
      totaal += Number(brief[1]) * 100;
    }
  }
  const keuzes = (await page.locator('.keuze-knop').allTextContents()).map((t) => t.trim());
  const euro = (await page.locator('.geld-euro').count()) ? await page.locator('.geld-euro').inputValue() : null;
  const cent = (await page.locator('.geld-cent').count()) ? await page.locator('.geld-cent').inputValue() : null;
  return { munten, briefjes, totaal, keuzes, euro, cent };
}

function checkBedragVorm(keuzes) {
  if (new Set(keuzes).size !== keuzes.length) throw new Error(`dubbele bedragen ${keuzes}`);
  for (const keuze of keuzes) {
    if (!/^\d+$/.test(keuze) && !/^\d+,\d{2}$/.test(keuze)) throw new Error(`geen komma-bedrag ${keuze}`);
  }
}

async function klikJuisteSom(page) {
  const tekst = await page.locator('.oefen-kaart__som').innerText();
  const som = parseSom(tekst);
  const voor = await handtekening(page);
  await page.locator('.keuze-knop').filter({ hasText: rx(String(som.antwoord)) }).click();
  await wachtAndere(page, voor);
}

async function klikFoutDanGoed(page) {
  const tekst = await page.locator('.oefen-kaart__som').innerText();
  const som = parseSom(tekst);
  const teksten = (await page.locator('.keuze-knop').allTextContents()).map((t) => t.trim());
  if (!teksten.includes(String(som.antwoord))) throw new Error(`antwoord ontbreekt ${teksten} bij ${tekst}`);
  const fout = teksten.find((t) => t !== String(som.antwoord));
  await page.locator('.keuze-knop').filter({ hasText: rx(fout) }).click();
  await page.waitForTimeout(400);
  if ((await page.locator('.oefen-kaart__som').innerText()) !== tekst) throw new Error('fout antwoord ging door');
  const voor = await handtekening(page);
  await page.locator('.keuze-knop').filter({ hasText: rx(String(som.antwoord)) }).click();
  await wachtAndere(page, voor);
}

async function matchDrie(page) {
  const eerste = (await page.locator('.koppel-som').allTextContents()).join('|');
  for (let i = 0; i < 3; i++) {
    const open = (await page.locator('.koppel-som:not(.gevonden)').allTextContents()).map((t) => t.trim());
    const som = parseSom(open[0]);
    await page.locator('.koppel-som').filter({ hasText: rx(open[0]) }).click();
    await page.locator('.koppel-uitkomst').filter({ hasText: rx(String(som.antwoord)) }).click();
    await page.waitForTimeout(200);
    const gevonden = await page.locator('.koppel-som.gevonden').count();
    if (i < 2) {
      if (gevonden !== i + 1) throw new Error(`na paar ${i + 1} gevonden=${gevonden}`);
      if ((await page.locator('.koppel-som').count()) !== 3) throw new Error('te vroeg naar de volgende vraag');
    }
  }
  await wachtAndere(page, await handtekening(page).catch(() => eerste));
}

async function checkKoppel(page, regel) {
  const sommen = (await page.locator('.koppel-som').allTextContents()).map((t) => t.trim());
  const uit = (await page.locator('.koppel-uitkomst').allTextContents()).map((t) => t.trim());
  if (sommen.length !== 3 || uit.length !== 3) throw new Error(`koppel ${sommen.length}/${uit.length}`);
  const geparsed = sommen.map(parseSom);
  for (const som of geparsed) if (regel) checkSom(som, regel);
  const antwoorden = geparsed.map((s) => String(s.antwoord));
  if (new Set(antwoorden).size !== 3) throw new Error(`antwoorden niet uniek ${antwoorden}`);
  if ([...antwoorden].sort().join() !== [...uit].sort().join()) throw new Error(`uitkomsten ${uit} vs ${antwoorden}`);
  if (antwoorden.join('|') === uit.join('|')) throw new Error('sommen en uitkomsten in dezelfde volgorde');
  if (await page.locator('.geld-bak').count()) throw new Error('geld op een koppelvraag');
  return geparsed;
}

async function typeSom(page) {
  const tekst = await page.locator('.oefen-kaart__som').innerText();
  const som = parseSom(tekst);
  if ((await page.locator('.scherm-toetsenbord:not([hidden])').count()) < 1) throw new Error('geen cijfertoetsenbord');
  await page.locator('.som-invoer').click();
  await page.keyboard.type(String(som.antwoord));
  const waarde = await page.locator('.som-invoer').inputValue();
  if (waarde !== String(som.antwoord)) throw new Error(`invoer ${waarde} verwacht ${som.antwoord}`);
  const voor = await handtekening(page);
  await page.locator('.typen-knop').click();
  await wachtAndere(page, voor);
}

async function typeGeld(page, totaal) {
  const euro = Math.floor(totaal / 100);
  const cent = totaal % 100;
  await page.locator('.geld-euro').click();
  if (euro > 0) await page.keyboard.type(String(euro));
  await page.locator('.geld-cent').click();
  if (cent > 0) await page.keyboard.type(String(cent).padStart(2, '0'));
  const euroVal = await page.locator('.geld-euro').inputValue();
  const centVal = await page.locator('.geld-cent').inputValue();
  if (Number(euroVal) !== euro || Number(centVal) !== cent) throw new Error(`velden ${euroVal}/${centVal} vs ${euro}/${cent}`);
  const voor = await handtekening(page);
  await page.locator('.typen-knop').click();
  await wachtAndere(page, voor);
}

const page = await openApp(390, 844);
try {
  const titels = await page.locator('.kern-rij__titel').allTextContents();
  log.push('groep3: ' + titels.join(' | '));
  const staart = titels.slice(-8).map((t) => t.replace(/^Rekenen \d+: /, ''));
  const verwacht = ['De bus: erbij en eraf', 'Plus tot 10', 'Min tot 10', 'Plus tot 20', 'Min tot 20', 'Munten tot 10', 'Munten en briefjes', 'Plus, min en geld'];
  if (staart.join('|') !== verwacht.join('|')) throw new Error(`hoofdstukken ${staart.join(' / ')}`);

  // --- Plus tot 10 ---
  await openKern(page, 'Plus tot 10');
  await start(page, 'Oefening 1');
  await page.screenshot({ path: `${OUT}plus10-keuze.png` });
  for (let i = 0; i < 5; i++) {
    const tekst = await page.locator('.oefen-kaart__som').innerText();
    checkSom(parseSom(tekst), 'plus10');
    const knoppen = (await page.locator('.keuze-knop').allTextContents()).map((t) => t.trim());
    if (knoppen.length !== 3 || !knoppen.includes(String(parseSom(tekst).antwoord))) throw new Error(`keuzes ${knoppen}`);
    if (tekst.includes(MIN) === false && !tekst.includes('+')) throw new Error(tekst);
    if (tekst.includes(MIN)) throw new Error('min in plus-hoofdstuk ' + tekst);
    if (i === 0) await klikJuisteSom(page);
    else if (i === 1) await klikFoutDanGoed(page);
    else await skip(page);
  }
  await page.locator('.hoofdstuk-tegel').first().waitFor();

  await start(page, 'Oefening 2');
  await page.screenshot({ path: `${OUT}plus10-koppelen.png` });
  for (let i = 0; i < 5; i++) {
    const geparsed = await checkKoppel(page, 'plus10');
    if (geparsed.some((s) => !s.plus)) throw new Error('min in plus-koppelen');
    if (i === 0) await matchDrie(page);
    else await skip(page);
  }

  await start(page, 'Oefening 3');
  await page.screenshot({ path: `${OUT}plus10-typen.png` });
  checkSom(parseSom(await page.locator('.oefen-kaart__som').innerText()), 'plus10');
  await typeSom(page);
  for (let i = 0; i < 4; i++) {
    checkSom(parseSom(await page.locator('.oefen-kaart__som').innerText()), 'plus10');
    await skip(page);
  }

  await start(page, 'Toets');
  const instr = new Set();
  for (let i = 0; i < 10; i++) {
    const zin = (await page.locator('.instructie-tekst').innerText()).trim();
    instr.add(zin);
    if (await page.locator('.koppel-som').count()) await checkKoppel(page, 'plus10');
    else checkSom(parseSom(await page.locator('.oefen-kaart__som').innerText()), 'plus10');
    await skip(page);
  }
  for (const zin of ['Hoeveel is de som?', 'Welk getal hoort bij welke som?', 'Typ het antwoord']) {
    if (!instr.has(zin)) throw new Error(`toets mist ${zin} (${[...instr].join(' / ')})`);
  }
  log.push('plus10-toets: ' + [...instr].join(' / '));

  // --- Min tot 10 ---
  await naarLijst(page);
  await openKern(page, 'Min tot 10');
  await start(page, 'Oefening 1');
  await page.screenshot({ path: `${OUT}min10-keuze.png` });
  for (let i = 0; i < 5; i++) {
    const tekst = await page.locator('.oefen-kaart__som').innerText();
    if (!tekst.includes(MIN)) throw new Error('geen minteken ' + tekst);
    checkSom(parseSom(tekst), 'min10');
    await skip(page);
  }
  await start(page, 'Oefening 2');
  await checkKoppel(page, 'min10');
  for (let i = 0; i < 5; i++) await skip(page);

  // --- Plus tot 20 ---
  await naarLijst(page);
  await openKern(page, 'Plus tot 20');
  for (const [label, soort] of [['Oefening 1', 'keuze'], ['Oefening 2', 'koppel'], ['Oefening 3', 'typen']]) {
    await start(page, label);
    if (label === 'Oefening 1') await page.screenshot({ path: `${OUT}plus20-keuze.png` });
    if (soort === 'koppel') await checkKoppel(page, 'plus20');
    else checkSom(parseSom(await page.locator('.oefen-kaart__som').innerText()), 'plus20');
    for (let i = 0; i < 5; i++) await skip(page);
  }

  // --- Min tot 20 ---
  await naarLijst(page);
  await openKern(page, 'Min tot 20');
  for (const label of ['Oefening 1', 'Oefening 2', 'Oefening 3']) {
    await start(page, label);
    if (label === 'Oefening 1') await page.screenshot({ path: `${OUT}min20-keuze.png` });
    if (label === 'Oefening 2') await checkKoppel(page, 'min20');
    else {
      const tekst = await page.locator('.oefen-kaart__som').innerText();
      if (!tekst.includes(MIN)) throw new Error(tekst);
      checkSom(parseSom(tekst), 'min20');
    }
    for (let i = 0; i < 5; i++) await skip(page);
  }

  // --- Munten tot 10 ---
  await naarLijst(page);
  await openKern(page, 'Munten tot 10');
  await start(page, 'Oefening 1');
  await page.screenshot({ path: `${OUT}munten-keuze.png` });
  for (let i = 0; i < 5; i++) {
    const geld = await leesGeld(page);
    if (geld.briefjes.length) throw new Error('briefje in munten-hoofdstuk');
    if (geld.munten.length < 1 || geld.munten.length > 3 || geld.totaal <= 0 || geld.totaal > 200) {
      throw new Error(`makkelijke stapel ${geld.munten} = ${geld.totaal}`);
    }
    checkBedragVorm(geld.keuzes);
    if (!geld.keuzes.includes(bedrag(geld.totaal)) || geld.keuzes.length !== 3) throw new Error(geld.keuzes.join('/'));
    if (i === 0) {
      const voor = await handtekening(page);
      await page.locator('.keuze-knop').filter({ hasText: rx(bedrag(geld.totaal)) }).click();
      await wachtAndere(page, voor);
    } else await skip(page);
  }

  await start(page, 'Oefening 2');
  await page.screenshot({ path: `${OUT}munten-keuze-tot10.png` });
  for (let i = 0; i < 5; i++) {
    const geld = await leesGeld(page);
    if (geld.briefjes.length) throw new Error('briefje in oefening 2');
    if (geld.munten.length < 4 || geld.munten.length > 5 || geld.totaal <= 0 || geld.totaal > 1000) {
      throw new Error(`stapel tot 10 ${geld.munten} = ${geld.totaal}`);
    }
    if (!geld.keuzes.includes(bedrag(geld.totaal))) throw new Error(geld.keuzes.join('/'));
    await skip(page);
  }

  await start(page, 'Oefening 3');
  const startVelden = await leesGeld(page);
  if (startVelden.euro !== '0' || startVelden.cent !== '00') throw new Error(`start ${startVelden.euro}/${startVelden.cent}`);
  if (startVelden.briefjes.length || startVelden.totaal > 1000) throw new Error('typen-stapel');
  await page.screenshot({ path: `${OUT}munten-typen.png` });
  await typeGeld(page, startVelden.totaal);
  for (let i = 0; i < 4; i++) {
    const geld = await leesGeld(page);
    if (geld.euro !== '0' || geld.cent !== '00') throw new Error(`reset ${geld.euro}/${geld.cent}`);
    if (geld.briefjes.length || geld.totaal > 1000 || geld.munten.length < 4) throw new Error(`typen ${geld.munten}`);
    await skip(page);
  }

  await start(page, 'Toets');
  const muntToets = { keuze: 0, typen: 0 };
  for (let i = 0; i < 10; i++) {
    const zin = (await page.locator('.instructie-tekst').innerText()).trim();
    const geld = await leesGeld(page);
    if (geld.briefjes.length || geld.totaal > 1000 || geld.totaal <= 0) throw new Error(`muntentoets ${geld.totaal}`);
    if (zin === 'Hoeveel geld is dit?') muntToets.keuze++;
    else if (zin === 'Typ hoeveel het is') {
      muntToets.typen++;
      if (geld.euro !== '0' || geld.cent !== '00') throw new Error('toetsvelden');
    } else throw new Error('onverwachte instructie ' + zin);
    await skip(page);
  }
  if (!muntToets.keuze || !muntToets.typen) throw new Error(JSON.stringify(muntToets));
  log.push('munten-toets ' + JSON.stringify(muntToets));

  // --- Briefjes ---
  await naarLijst(page);
  await openKern(page, 'Munten en briefjes');
  await start(page, 'Oefening 1');
  await page.screenshot({ path: `${OUT}briefjes-keuze.png` });
  for (let i = 0; i < 5; i++) {
    const geld = await leesGeld(page);
    if (geld.briefjes.join() !== '5' || geld.munten.length < 1 || geld.munten.length > 3) {
      throw new Error(`vijfje ${geld.briefjes} munten ${geld.munten}`);
    }
    if (!geld.keuzes.includes(bedrag(geld.totaal))) throw new Error(geld.keuzes.join('/'));
    checkBedragVorm(geld.keuzes);
    await skip(page);
  }

  await start(page, 'Oefening 2');
  let boven10 = false;
  for (let i = 0; i < 5; i++) {
    const geld = await leesGeld(page);
    if (!geld.briefjes.length || geld.briefjes.some((b) => ![5, 10, 20].includes(b)) || geld.briefjes.length > 2) {
      throw new Error(`briefjes ${geld.briefjes}`);
    }
    if (geld.totaal > 5000 || geld.munten.length < 1) throw new Error(`stapel ${geld.totaal}`);
    if (geld.totaal > 1000) boven10 = true;
    await skip(page);
  }
  if (!boven10) throw new Error('geen bedrag boven 10 euro in oefening 2');

  await start(page, 'Oefening 3');
  const briefStart = await leesGeld(page);
  if (briefStart.euro !== '0' || briefStart.cent !== '00') throw new Error('brief-velden');
  if (!briefStart.briefjes.length) throw new Error('typen zonder briefje');
  await page.screenshot({ path: `${OUT}briefjes-typen.png` });
  let typenBoven10 = briefStart.totaal > 1000;
  await typeGeld(page, briefStart.totaal);
  for (let i = 0; i < 4; i++) {
    const geld = await leesGeld(page);
    if (geld.euro !== '0' || geld.cent !== '00') throw new Error('velden niet 0/00');
    if (!geld.briefjes.length || geld.briefjes.some((b) => ![5, 10, 20].includes(b))) throw new Error(geld.briefjes.join());
    if (geld.totaal > 1000) typenBoven10 = true;
    await skip(page);
  }
  if (!typenBoven10) throw new Error('typen bleef onder 10 euro');

  await start(page, 'Toets');
  const briefToets = { keuze: 0, typen: 0, brief: 0 };
  for (let i = 0; i < 10; i++) {
    const zin = (await page.locator('.instructie-tekst').innerText()).trim();
    const geld = await leesGeld(page);
    if (!geld.briefjes.length) throw new Error('toets zonder briefje');
    if (geld.briefjes.some((b) => ![5, 10, 20].includes(b)) || geld.totaal > 5000) throw new Error('toetsstapel');
    briefToets.brief++;
    if (zin === 'Hoeveel geld is dit?') briefToets.keuze++;
    else if (zin === 'Typ hoeveel het is') briefToets.typen++;
    else throw new Error(zin);
    await skip(page);
  }
  if (!briefToets.keuze || !briefToets.typen) throw new Error(JSON.stringify(briefToets));
  log.push('brief-toets ' + JSON.stringify(briefToets));

  // --- Herhaling ---
  await naarLijst(page);
  await openKern(page, 'Plus, min en geld');
  await start(page, 'Oefening 1');
  const mix1 = { plus10: 0, plus20: 0, min10: 0, min20: 0, munt: 0, brief: 0 };
  for (let i = 0; i < 8; i++) {
    const zin = (await page.locator('.instructie-tekst').innerText()).trim();
    if (zin === 'Hoeveel is de som?') {
      const som = parseSom(await page.locator('.oefen-kaart__som').innerText());
      if (som.plus && som.antwoord <= 10) mix1.plus10++;
      else if (som.plus) mix1.plus20++;
      else if (som.a <= 10) mix1.min10++;
      else mix1.min20++;
    } else if (zin === 'Hoeveel geld is dit?') {
      const geld = await leesGeld(page);
      if (geld.briefjes.length) mix1.brief++;
      else {
        if (geld.totaal > 1000) throw new Error('munt boven 10');
        mix1.munt++;
      }
      if (i === 0 || (mix1.brief === 1 && zin === 'Hoeveel geld is dit?')) await page.screenshot({ path: `${OUT}herhaling-keuze.png` });
    } else throw new Error('oef1 geen meerkeuze: ' + zin);
    await skip(page);
  }
  if (!mix1.plus10 || !mix1.plus20 || !mix1.min10 || !mix1.min20 || !mix1.munt || !mix1.brief) {
    throw new Error('herhaling oef1 ' + JSON.stringify(mix1));
  }
  log.push('herhaling-1 ' + JSON.stringify(mix1));

  await start(page, 'Oefening 2');
  await page.screenshot({ path: `${OUT}herhaling-koppelen.png` });
  for (let i = 0; i < 5; i++) {
    const geparsed = await checkKoppel(page);
    if (!geparsed.some((s) => s.plus) || !geparsed.some((s) => !s.plus)) throw new Error('koppel mist een teken');
    const tot20 = geparsed.some((s) => (s.plus ? s.antwoord >= 11 : s.a >= 11));
    const tot10 = geparsed.some((s) => (s.plus ? s.antwoord <= 10 : s.a <= 10));
    if (!tot20 || !tot10) throw new Error('koppel mist een band');
    await skip(page);
  }

  await start(page, 'Oefening 3');
  const mix3 = { plus: 0, min: 0, munt: 0, brief: 0 };
  let shotTypen = false;
  for (let i = 0; i < 8; i++) {
    const zin = (await page.locator('.instructie-tekst').innerText()).trim();
    if (zin === 'Typ het antwoord') {
      const som = parseSom(await page.locator('.oefen-kaart__som').innerText());
      if (som.plus) mix3.plus++;
      else mix3.min++;
    } else if (zin === 'Typ hoeveel het is') {
      const geld = await leesGeld(page);
      if (geld.euro !== '0' || geld.cent !== '00') throw new Error('herhaling velden');
      if (geld.briefjes.length) mix3.brief++;
      else mix3.munt++;
      if (!shotTypen) {
        await page.screenshot({ path: `${OUT}herhaling-typen.png` });
        shotTypen = true;
      }
    } else throw new Error('oef3 geen typen: ' + zin);
    await skip(page);
  }
  if (!mix3.plus || !mix3.min || !mix3.munt || !mix3.brief) throw new Error('herhaling oef3 ' + JSON.stringify(mix3));
  log.push('herhaling-3 ' + JSON.stringify(mix3));

  await start(page, 'Toets');
  const toets = { plus: 0, min: 0, munt: 0, brief: 0, mc: 0, typen: 0, koppel: 0, n: 0 };
  for (let i = 0; i < 12; i++) {
    toets.n++;
    const zin = (await page.locator('.instructie-tekst').innerText()).trim();
    if (zin === 'Welk getal hoort bij welke som?') {
      toets.koppel++;
      const geparsed = await checkKoppel(page);
      if (geparsed.some((s) => s.plus)) toets.plus++;
      if (geparsed.some((s) => !s.plus)) toets.min++;
    } else if (zin === 'Hoeveel is de som?' || zin === 'Typ het antwoord') {
      const som = parseSom(await page.locator('.oefen-kaart__som').innerText());
      if (som.plus) toets.plus++;
      else toets.min++;
      if (zin.startsWith('Hoeveel')) toets.mc++;
      else toets.typen++;
    } else if (zin === 'Hoeveel geld is dit?' || zin === 'Typ hoeveel het is') {
      const geld = await leesGeld(page);
      if (geld.briefjes.length) toets.brief++;
      else toets.munt++;
      if (zin.startsWith('Hoeveel')) toets.mc++;
      else toets.typen++;
    } else throw new Error(zin);
    await skip(page);
  }
  if (toets.n !== 12 || !toets.plus || !toets.min || !toets.munt || !toets.brief || !toets.mc || !toets.typen) {
    throw new Error('herhaling-toets ' + JSON.stringify(toets));
  }
  log.push('herhaling-toets ' + JSON.stringify(toets));

  // Kleuter ongewijzigd.
  const kleuter = await openApp(390, 844, 4);
  const kleuterTitels = await kleuter.locator('.kern-rij__titel').allTextContents();
  log.push('kleuter: ' + kleuterTitels.join(' | '));
  const kleuterNamen = kleuterTitels.map((t) => t.replace(/^Rekenen \d+: /, ''));
  if (kleuterNamen.join('|') !== ['Tellen tot 4', 'Tellen tot 6', 'Tellen tot 8', 'Tellen tot 10'].join('|')) {
    throw new Error('kleuter veranderd: ' + kleuterNamen.join(' / '));
  }
  await kleuter.close();

  // Liggend.
  const liggend = await openApp(667, 375);
  await openKern(liggend, 'Plus tot 10');
  await start(liggend, 'Oefening 2');
  await liggend.screenshot({ path: `${OUT}liggend-koppelen.png` });
  await liggend.locator('.terug-knop').click();
  await liggend.locator('.hoofdstuk-tegel', { hasText: 'Oefening 3' }).waitFor();
  await start(liggend, 'Oefening 3');
  if ((await liggend.locator('.scherm-toetsenbord:not([hidden])').count()) < 1) throw new Error('liggend geen toetsenbord');
  await liggend.screenshot({ path: `${OUT}liggend-typen.png` });
  await liggend.locator('.terug-knop').click();
  await liggend.locator('.terug-knop').click();
  await openKern(liggend, 'Munten en briefjes');
  await start(liggend, 'Oefening 2');
  await liggend.screenshot({ path: `${OUT}liggend-geld-keuze.png` });
  await liggend.locator('.terug-knop').click();
  await start(liggend, 'Oefening 3');
  const ligGeld = await (async () => leesGeld(liggend))();
  if (ligGeld.euro !== '0' || ligGeld.cent !== '00') throw new Error('liggend velden');
  await liggend.screenshot({ path: `${OUT}liggend-geld-typen.png` });
  await liggend.close();
} catch (e) {
  fouten.push(String(e.stack || e));
  await page.screenshot({ path: `${OUT}FOUT.png` }).catch(() => {});
}

console.log(log.join('\n'));
console.log('fouten', fouten);
await browser.close();
if (fouten.length) process.exit(1);
