// Alle eigen tekeningen van "Op volgorde" op één HTML-blad. Gebruik: npx tsx tests/volgorde-tekeningen.mts <uit.html>
import { writeFileSync } from 'node:fs';
import { GETEKENDE_REEKSEN } from '../src/games/kleuter/volgordeTekeningen.ts';
const rijen = GETEKENDE_REEKSEN.map((r) => `<div class="rij">${r.map((f) => `<div class="kaart">${f()}</div>`).join('')}</div>`).join('');
writeFileSync(process.argv[2], `<!doctype html><style>body{background:#e8f0f8;margin:8px;font-family:sans-serif}.rij{display:flex;gap:10px;margin-bottom:10px}.kaart{width:150px;height:150px;background:#fff;border:5px solid #3dbdff;border-radius:24px;padding:10px;box-sizing:border-box}.kaart svg{width:100%;height:100%;display:block}</style>${rijen}`);
