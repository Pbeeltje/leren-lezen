import type { CapacitorConfig } from '@capacitor/cli';

// Android- en iPhone-app rond de webversie (dist/). De app-ID ligt vast zodra de app in
// een winkel staat; voor de preview kan hij nog veranderen.
const config: CapacitorConfig = {
  appId: 'nl.pbeeltje.lerenlezen',
  appName: 'Leren Lezen',
  webDir: 'dist',
  backgroundColor: '#0f1b3d',
  android: {
    // Geen verbinding nodig; alles zit in de app.
    allowMixedContent: false,
  },
  ios: {
    contentInset: 'never',
  },
  plugins: {
    // Statusbalk zichtbaar maar donker met lichte iconen; de app loopt eronder door
    // (edge-to-edge) en houdt via --safe-area-inset-* afstand. Verbergen gaf op Android met
    // een oudere webview (< Chrome 140) een niet-hertekende strook bovenaan, plus een
    // "volledig scherm"-melding.
    SystemBars: {
      hidden: false,
      style: 'DARK',
      insetsHandling: 'css',
      initialViewportFitValueHint: 'cover',
    },
  },
};

export default config;
