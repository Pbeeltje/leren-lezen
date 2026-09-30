import { defineConfig } from 'vite';

// Relatieve paden: de app draait op GitHub Pages in een submap (/leren-lezen/) en lokaal
// op /. Alle plaatjes/geluiden worden daarom als 'assets/...' (zonder / vooraan) geladen.
export default defineConfig({
  base: './',
});
