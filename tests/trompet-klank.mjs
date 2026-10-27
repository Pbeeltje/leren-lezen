import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
// Rendert één noot per instrument offline en schrijft de samples weg voor analyse.
const b = await chromium.launch(); const page = await b.newPage();
await page.addInitScript(() => {
  window.AudioContext = function () { const o = new OfflineAudioContext(1, 44100 * 1.3, 44100); window.__off = o; return o; };
});
await page.goto('http://localhost:5173'); await page.waitForTimeout(500);
const uit = {};
for (const inst of ['trompet', 'keyboard', 'harp']) {
  for (const toon of [523.25, 880, 1046.5]) {
    const d = await page.evaluate(async ([inst, toon]) => {
      const m = await import('/src/engine/muziek.ts');
      m.speelInstrument(inst, toon);
      const buf = await window.__off.startRendering();
      return Array.from(buf.getChannelData(0));
    }, [inst, toon]);
    uit[`${inst}:${toon}`] = d;
    await page.reload(); await page.waitForTimeout(300);
  }
}
writeFileSync(process.argv[2], JSON.stringify(uit));
await b.close();
