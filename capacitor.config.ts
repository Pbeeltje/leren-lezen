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
    // Status- en navigatiebalk verborgen, zodat kinderen niet per ongeluk de snelle
    // instellingen openen of naar het beginscherm gaan: een veeg vanaf de rand laat de
    // balken eerst even zien, pas een tweede veeg doet iets (Android: MainActivity, iPhone:
    // MainViewController in SceneDelegate.swift). Donker met lichte iconen als ze even
    // verschijnen; de app houdt via --safe-area-inset-* afstand van een camera-uitsparing.
    SystemBars: {
      hidden: true,
      style: 'DARK',
      insetsHandling: 'css',
      initialViewportFitValueHint: 'cover',
    },
  },
};

export default config;
