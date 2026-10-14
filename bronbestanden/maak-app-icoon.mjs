// App-icoon, zelf getekend: een open boek met doorschijnende bladzijden, een gloed die
// eruit opstijgt en letters (Andika, de schoolletter van de app) die omhoog zweven, op
// donkerblauw. Tekent alle formaten: Android (adaptieve lagen + oude en ronde iconen),
// web (180/192/512) en iPhone (1024).
// Gebruik (vanuit de repo, playwright moet resolven): node bronbestanden/maak-app-icoon.mjs [voorbeeld.png]
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), '..');
const font = fs.readFileSync(path.join(ROOT, 'src/assets/fonts/andika-latin-700.woff2')).toString('base64');

// Tekenvlak 108×108 = een adaptief Android-icoon. Alles wat telt blijft binnen de veilige
// cirkel (straal 33 rond het midden), want launchers knippen er een cirkel of druppel uit.
const ACHTERGROND = `
  <defs>
    <radialGradient id="lucht" cx="50%" cy="36%" r="75%">
      <stop offset="0" stop-color="#5a4cc7"/>
      <stop offset="0.5" stop-color="#2a2f7e"/>
      <stop offset="1" stop-color="#0f1b3d"/>
    </radialGradient>
  </defs>
  <rect width="108" height="108" fill="url(#lucht)"/>
  <g fill="#fff">
    <circle cx="22" cy="26" r="0.9" opacity="0.7"/>
    <circle cx="86" cy="20" r="1.1" opacity="0.8"/>
    <circle cx="90" cy="52" r="0.7" opacity="0.5"/>
    <circle cx="16" cy="58" r="0.7" opacity="0.5"/>
    <circle cx="30" cy="14" r="0.6" opacity="0.5"/>
    <circle cx="76" cy="92" r="0.7" opacity="0.4"/>
    <circle cx="24" cy="90" r="0.8" opacity="0.4"/>
  </g>`;

// Bladzijde links (rechts is gespiegeld rond x = 54): bolt omhoog vanaf de rug.
const blad = (dy) => `M54 ${66 + dy} C47 ${60 + dy} 37 ${58 + dy} 27 ${61 + dy} L27 ${82 + dy} C37 ${79 + dy} 47 ${81 + dy} 54 ${86 + dy} Z`;
const paar = (dy, attr) => `<path d="${blad(dy)}" ${attr}/><path d="${blad(dy)}" ${attr} transform="translate(108 0) scale(-1 1)"/>`;
// Regeltjes tekst op een bladzijde, meegebogen met de bovenrand.
const regels = [0, 1, 2, 3].map((i) => {
  const y = 66 + i * 4;
  return `<path d="M50 ${y + 1.5} C45 ${y - 2.5} 38 ${y - 3.5} 31 ${y - 1.5}"/>`;
}).join('');

// schaal: 0.66 voor de adaptieve laag (launchers tonen alleen de middelste 72 dp), groter
// voor de vaste iconen (oud Android, web, iPhone) waar het hele vlak zichtbaar is.
const voorgrond = (schaal) => `
  <defs>
    <style>@font-face { font-family: Andika; font-weight: 700; src: url(data:font/woff2;base64,${font}) format('woff2'); }</style>
    <radialGradient id="gloed" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#fff3b0" stop-opacity="0.85"/>
      <stop offset="0.45" stop-color="#ffd54f" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#ffd54f" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="straal" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#fff6c4" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#fff6c4" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="kaft" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ff8a4c"/>
      <stop offset="1" stop-color="#e2502e"/>
    </linearGradient>
    <linearGradient id="papier" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.8"/>
      <stop offset="1" stop-color="#eef1ff" stop-opacity="0.95"/>
    </linearGradient>
    <filter id="zacht" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.4"/></filter>
  </defs>
  <g transform="translate(54 54) scale(${schaal}) translate(-54 -56.5)">
  <!-- licht uit het boek -->
  <ellipse cx="54" cy="60" rx="34" ry="30" fill="url(#gloed)"/>
  <path d="M42 66 L30 20 L78 20 L66 66 Z" fill="url(#straal)"/>
  <!-- zwevende letters, met een zachte gloed eronder -->
  <g font-family="Andika" font-weight="700" text-anchor="middle">
    <g fill="#fff6c4" filter="url(#zacht)" opacity="0.9">
      <text x="42" y="47" font-size="17" transform="rotate(-14 42 47)">a</text>
      <text x="63" y="38" font-size="15" transform="rotate(10 63 38)">b</text>
    </g>
    <text x="42" y="47" font-size="17" fill="#ffffff" fill-opacity="0.97" transform="rotate(-14 42 47)">a</text>
    <text x="63" y="38" font-size="15" fill="#ffffff" fill-opacity="0.9" transform="rotate(10 63 38)">b</text>
  </g>
  <path d="M75 45 l1.3 3 3.2 .3 -2.4 2.1 .7 3.2 -2.8 -1.7 -2.8 1.7 .7 -3.2 -2.4 -2.1 3.2 -.3 Z" fill="#ffd54f"/>
  <circle cx="34" cy="31" r="1.2" fill="#fff" opacity="0.85"/>
  <circle cx="76" cy="28" r="0.9" fill="#fff" opacity="0.7"/>
  <!-- kaft -->
  <path d="M54 72 C46 66 35 65 23 67 L23 89 C35 87 46 88 54 93 C62 88 73 87 85 89 L85 67 C73 65 62 66 54 72 Z" fill="url(#kaft)"/>
  <path d="M54 72 L54 93" stroke="#b83a1f" stroke-width="1.2"/>
  <!-- bladzijden: achterste lagen doorschijnend, zodat je de stapel ziet -->
  ${paar(4, 'fill="#c9d2ff" fill-opacity="0.55"')}
  ${paar(2, 'fill="#dfe5ff" fill-opacity="0.7"')}
  ${paar(0, 'fill="url(#papier)"')}
  <g fill="none" stroke="#7b8fd6" stroke-opacity="0.45" stroke-width="1" stroke-linecap="round">
    ${regels}
    <g transform="translate(108 0) scale(-1 1)">${regels}</g>
  </g>
  <path d="M54 66 L54 86" stroke="#9aa6d8" stroke-opacity="0.7" stroke-width="0.8"/>
  </g>`;
const VOORGROND = voorgrond(0.66);
const HEEL = ACHTERGROND + voorgrond(0.9);

const svg = (inhoud, maat, extra = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108" width="${maat}" height="${maat}" ${extra}>${inhoud}</svg>`;

const b = await chromium.launch();
const page = await b.newPage({ deviceScaleFactor: 1 });
async function teken(inhoud, maat, uit, { vorm = 'vierkant', transparant = false } = {}) {
  // Vorm: vierkant (vol), rond (cirkel) of afgerond (oud Android-icoon, ronde hoeken).
  const clip = vorm === 'rond' ? 'border-radius:50%;' : vorm === 'afgerond' ? 'border-radius:18%;' : '';
  await page.setViewportSize({ width: maat, height: maat });
  await page.setContent(`<html><body style="margin:0;background:transparent"><div style="width:${maat}px;height:${maat}px;overflow:hidden;${clip}">${svg(inhoud, maat)}</div></body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: uit, omitBackground: transparant || vorm !== 'vierkant' });
}

const RES = path.join(ROOT, 'android/app/src/main/res');
const dichtheden = { ldpi: 0.75, mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
for (const [d, f] of Object.entries(dichtheden)) {
  const map = path.join(RES, `mipmap-${d}`);
  await teken(ACHTERGROND, Math.round(108 * f), path.join(map, 'ic_launcher_background.png'));
  await teken(VOORGROND, Math.round(108 * f), path.join(map, 'ic_launcher_foreground.png'), { transparant: true });
  // Oude Android (< 8) en ronde iconen: 48 dp, het hele plaatje.
  await teken(HEEL, Math.round(48 * f), path.join(map, 'ic_launcher.png'), { vorm: 'afgerond' });
  await teken(HEEL, Math.round(48 * f), path.join(map, 'ic_launcher_round.png'), { vorm: 'rond' });
}
for (const m of [180, 192, 512]) await teken(HEEL, m, path.join(ROOT, `public/app/icoon-${m}.png`));
await teken(HEEL, 1024, path.join(ROOT, 'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png'));

// Voorbeeld: zoals een launcher het adaptieve icoon knipt (middelste 72 dp als cirkel en
// als afgerond vierkant), daarnaast het vaste icoon en een klein formaat.
if (process.argv[2]) {
  await page.setViewportSize({ width: 820, height: 260 });
  const adaptief = (m, r) => `<div style="width:${m}px;height:${m}px;border-radius:${r};overflow:hidden;position:relative">
    <div style="position:absolute;left:${-m / 4}px;top:${-m / 4}px">${svg(ACHTERGROND + VOORGROND, m * 1.5)}</div></div>`;
  await page.setContent(`<html><body style="margin:0;background:#e9e9e9;display:flex;gap:24px;padding:20px;align-items:center">
    ${adaptief(220, '50%')}${adaptief(160, '30%')}
    <div style="width:160px;height:160px;border-radius:18%;overflow:hidden">${svg(HEEL, 160)}</div>
    <div style="display:flex;flex-direction:column;gap:16px">${adaptief(64, '50%')}${adaptief(40, '30%')}</div>
    </body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: process.argv[2] });
}
await b.close();
