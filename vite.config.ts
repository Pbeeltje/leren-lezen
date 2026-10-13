import { defineConfig, type Plugin } from 'vite';

// Beveiligingsregels voor de gebouwde app (web en Capacitor): alleen eigen bestanden
// laden, geen scripts of verbindingen naar buiten. Plaatjes mogen ook data:-SVG zijn
// (achtergronden, cursor). Stijl-attributen zijn nodig voor de vele inline stijlen.
// Alleen bij `vite build`: de dev-server heeft een websocket en eigen scripts nodig.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "media-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join('; ');

function beveiligingsRegels(): Plugin {
  return {
    name: 'beveiligingsregels',
    apply: 'build',
    transformIndexHtml(html) {
      return html.replace(
        '<meta charset="UTF-8" />',
        `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />\n    <meta name="referrer" content="no-referrer" />`,
      );
    },
  };
}

// Relatieve paden: de app draait op GitHub Pages in een submap (/leren-lezen/) en lokaal
// op /. Alle plaatjes/geluiden worden daarom als 'assets/...' (zonder / vooraan) geladen.
export default defineConfig({
  base: './',
  plugins: [beveiligingsRegels()],
});
