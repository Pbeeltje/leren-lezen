# Android/iPhone app (Capacitor 8)

(Build steps and APK testing: the `leren-lezen-run` skill and
`C:\claude\leren-lezen-preview\README.md`. Only build/test the apps when the owner asks.)

- `capacitor.config.ts`: appId `nl.pbeeltje.lerenlezen`, webDir `dist`, SystemBars
  visible + DARK, `insetsHandling: 'css'` (Capacitor injects `--safe-area-inset-*`;
  CSS uses `--veilig-boven/onder/links/rechts` from global.css).
- `src/engine/native.ts` (no-op in the browser): mirrors every `leren-lezen:*`
  localStorage key to `@capacitor/preferences` and restores it on start when
  localStorage is empty; Android back button = close shop window/menu, else click
  `.terug-knop`, else minimize. `main.ts` awaits the restore before mounting.
- Android navigation bar hidden (MainActivity `verbergNavigatieknoppen()`, immersive
  with BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE, re-applied on focus): kids kept
  tapping back/home. A swipe up shows it briefly.
- Fonts are bundled (`src/assets/fonts`, `styles/fonts.css`), no Google Fonts.
  `navigator.audioSession.type = 'playback'` so the iOS silent switch doesn't mute
  Web Audio.
- Tools (portable, not in the repo): `C:\claude\tools\` (JDK 21, android-sdk,
  emulator AVD `leren`; start with `-gpu host` — SwiftShader segfaults). Upload key:
  `C:\claude\leren-lezen-sleutels\` (outside git).
- Build: `npm run build && npx cap sync`, then in `android/` with JAVA_HOME/
  ANDROID_HOME set: `gradlew assembleRelease bundleRelease`. Output to
  `C:\claude\leren-lezen-preview\`. Raise `versionCode` for every Play upload.
- Android e2e: Playwright `_android.devices()` → `device.webView({ pkg })`
  (connectOverCDP doesn't work); typing via `adb shell input text`. A stale strip
  under the status bar on the emulator (Chrome 133 WebView) is a display glitch.
- iOS: `.github/workflows/ios-prototype.yml` (macos-26, Xcode 26) builds for the
  simulator, injects `.github/ios-demo.js` to click through, uploads screenshots.
  Signing/TestFlight not set up; see `C:\claude\leren-lezen-iphone-plan.md`.
- Release notes: `C:\claude\leren-lezen-android-plan.md`. Privacy policy:
  `public/privacy.html` (Dutch and English).
