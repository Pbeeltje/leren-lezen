import { _android } from 'playwright';
import { execSync } from 'node:child_process';
const OUT = process.argv[2] + '/';
const ADB = 'C:/claude/tools/android-sdk/platform-tools/adb.exe';
const adb = (c) => execSync(`"${ADB}" ${c}`, { encoding: 'buffer' });
const foto = (n) => require_fs().writeFileSync(OUT + n + '.png', adb('exec-out screencap -p'));
import fs from 'node:fs'; const require_fs = () => fs;
const wacht = (ms) => new Promise((r) => setTimeout(r, ms));
const [toestel] = await _android.devices();
const verbind = async () => {
  const wv = await toestel.webView({ pkg: 'nl.pbeeltje.lerenlezen' });
  const page = await wv.page();
  return { b: { close: async () => {} }, page };
};
const herstart = async () => { adb('shell am force-stop nl.pbeeltje.lerenlezen'); await wacht(1500); adb('shell am start -n nl.pbeeltje.lerenlezen/.MainActivity'); await wacht(9000); return verbind(); };

adb('shell pm clear nl.pbeeltje.lerenlezen'); adb('shell am start -n nl.pbeeltje.lerenlezen/.MainActivity'); await wacht(10000);
let { b, page } = await verbind();
const fouten = []; page.on('pageerror', (e) => fouten.push(e.message));
console.log('webview', await page.evaluate(() => [innerWidth, innerHeight, navigator.userAgent.match(/Chrome\/[\d.]+/)?.[0]]));
console.log('veilige rand boven:', await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-top') || '(geen var)'), 'terug-knop top:', await page.evaluate(() => getComputedStyle(document.querySelector('.scherm')).paddingTop));
foto('1-start');
// Profiel maken met het schermtoetsenbord
await page.locator('.icoon-tegel', { hasText: 'Nieuw profiel' }).click(); await wacht(800);
await page.locator('.typen-invoer').click(); await wacht(1200); adb('shell input text mila'); await wacht(800); foto('2a-toetsenbord'); adb('shell input keyevent 111'); await wacht(600);
if (!(await page.locator('.typen-invoer').inputValue())) await page.locator('.typen-invoer').fill('mila');
console.log('naam ingevuld:', await page.locator('.typen-invoer').inputValue());
await page.locator('.avatar-keuze').nth(1).click(); await wacht(300);
foto('2-nieuw-profiel');
const verder = page.locator('button', { hasText: 'Aan de slag' }).last();
console.log('knop:', await verder.textContent()); await verder.click(); await wacht(1200);
// Leeftijd 6 als dat gevraagd wordt
if (await page.locator('.icoon-tegel', { hasText: '6' }).count()) { await page.locator('.icoon-tegel', { hasText: '6' }).last().click(); await wacht(1000); }
foto('3-onderwerpen');
await page.locator('.icoon-tegel', { hasText: 'Leren lezen' }).click(); await wacht(900);
await page.locator('.kern-rij--klikbaar').first().click(); await wacht(900);
await page.locator('.hoofdstuk-tegel', { hasText: 'Oefening 1' }).click(); await wacht(1500);
foto('4-oefening');
// Android-terugknop: oefening -> hoofdstuk -> lijst -> onderwerpen
const scherm = () => page.evaluate(() => document.querySelector('.scherm-titel')?.textContent?.trim());
for (let i = 0; i < 3; i++) { adb('shell input keyevent 4'); await wacht(1200); console.log('na terugknop', i + 1, ':', await scherm()); }
// Menu open + terugknop sluit menu
await page.locator('.profiel-knop').click(); await wacht(500);
adb('shell input keyevent 4'); await wacht(800);
console.log('menu dicht na terugknop:', await page.locator('.profiel-menu__paneel').isHidden(), '| scherm:', await scherm());
await page.locator('.munten-teller').click(); await wacht(1000);
foto('5-winkel');
adb('shell input keyevent 4'); await wacht(1000);
console.log('na terug uit winkel:', await scherm());
// Opslag: herstarten
await b.close(); ({ b, page } = await herstart());
console.log('na herstart, profielen:', await page.locator('.icoon-tegel').allTextContents());
// localStorage leeg (zoals iOS/Android dat kan opruimen) -> terug uit Preferences?
await page.evaluate(() => localStorage.clear()); await b.close(); ({ b, page } = await herstart());
console.log('na wissen localStorage + herstart, profielen:', await page.locator('.icoon-tegel').allTextContents());
foto('6-na-herstel');
// Terugknop op profielscherm -> app naar achtergrond
adb('shell input keyevent 4'); await wacht(1500);
console.log('voorgrond na terugknop op profielscherm:', adb('shell dumpsys activity activities').toString().match(/topResumedActivity=.*?\{[^}]*\}/)?.[0]?.slice(0, 120));
console.log('fouten', fouten); await b.close();
