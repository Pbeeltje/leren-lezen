# Handover: open items (status 1 October 2026)

## Waiting on the owner

- [ ] **Recording list 6** (`bronbestanden/opnamelijst-6-deel-1.txt`).
  - Re-record "Tik het woord aan dat bij het plaatje hoort", "Knap gedaan!" and "Wat knap!".
  - Once `opname6-deel1.m4a` is in `bronbestanden/`, process it with the `leren-lezen-audio` skill (`verwerk-opname.py`).
- [ ] **Test the Android preview APK on a real phone** (`C:\claude\leren-lezen-preview\`).
  - Especially check whether a frozen strip appears under the status bar. On the emulator (old WebView, Chrome 133) it appears, but the WebView's own screenshot is clean.
  - If it appears on a real phone: switch SystemBars `insetsHandling` or the system-bars approach (see `capacitor.config.ts` and `MainActivity.java`).
- [ ] **Back up the upload key folder** `C:\claude\leren-lezen-sleutels\`.
- [ ] **Google Play:**
  - developer account ($25) and payments profile;
  - closed test with 12 testers for 14 days (needed before Production).
- [ ] **Decide about the free GitHub Pages version.** It competes with the paid app: make the repo private, take Pages down, or keep only a demo.
- [ ] **Apple Developer Program** (€99/year), if the iPhone version should actually go out.

## To do once those are settled

- [ ] **TestFlight job in the iOS workflow:**
  - App Store Connect API key in GitHub Secrets;
  - `xcodebuild archive` with automatic signing, then upload;
  - add `PrivacyInfo.xcprivacy` (UserDefaults, reason CA92.1).
- [ ] **Store listings for Play and the App Store:**
  - privacy policy page ("we collect nothing");
  - screenshots;
  - Kids/Families category questionnaires.
- [ ] **Raise `versionCode`** (`android/app/build.gradle`) for every new Play upload.

## Possible improvements (not requested)

- **A parent setting for "Kleuterschool".** Since the change to groups, 3- and 4-year-olds also see Lezen, Tellen and Leesboekjes (limited to 2 chapters).
- **Tap-target sizes on very small phones (≤360 px wide).** The on-screen keyboard keys and xylophone bars are about 36–38 px wide but tall.

## Recently finished (details in SKILL.md and the git log)

- **Pictures:** all of them are now free to use (Fluent and our own drawings).
- **Coin shop:**
  - 55 avatars; 5 free, the rest 30 coins;
  - 4 backgrounds; space free, the rest 200 coins;
  - pages you swipe sideways.
- **Music levels:** a level picker with 6 levels, up to 10–12 notes or beats.
- **Profile menu:** redesigned; tapping the name switches profile; names are limited to 16 characters. The backup feature was removed.
- **Groups instead of ages:** Kleuterschool and Groep 3, with automatic conversion of old profiles.
- **First start:** without profiles the app opens straight on "Maak je profiel".
- **Layout fixes:** found by the size sweep (skip button, menu, landscape phones).
- **Android preview 0.9.0:**
  - signed APK and AAB;
  - back button and storage mirror;
  - dark system bars;
  - bundled font.
- **iPhone prototype:** builds and runs on the iOS 26 iPhone and iPad simulators via GitHub Actions.
