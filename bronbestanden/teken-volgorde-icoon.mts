import { writeFileSync } from 'node:fs';
import { GETEKENDE_REEKSEN } from '../src/games/kleuter/volgordeTekeningen.ts';
// Tegelicoon voor "Op volgorde": drie kaartjes als trapje (zaadje → kiempje → bloem),
// elk met een nummer. Draaien: npx tsx bronbestanden/teken-volgorde-icoon.mts
const [zaad, kiem, , bloem] = GETEKENDE_REEKSEN[0];
const binnen = (s: string, x: number, y: number, w: number) =>
  s.replace('<svg viewBox="0 0 100 100" aria-hidden="true"', `<svg x="${x}" y="${y}" width="${w}" height="${w}" viewBox="0 0 100 100"`);
const kaart = (s: string, x: number, y: number, nr: number) => `
  <rect x="${x}" y="${y}" width="80" height="80" rx="16" fill="#fff" stroke="#3dbdff" stroke-width="6"/>
  ${binnen(s, x + 6, y + 6, 68)}
  <circle cx="${x + 8}" cy="${y + 8}" r="15" fill="#3ecf6e" stroke="#fff" stroke-width="3"/>
  <text x="${x + 8}" y="${y + 15.5}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="800" font-size="21" fill="#fff">${nr}</text>`;
writeFileSync(
  'public/assets/icons/volgorde.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">${kaart(zaad(), 14, 108, 1)}${kaart(kiem(), 62, 60, 2)}${kaart(bloem(), 110, 12, 3)}</svg>`,
);
