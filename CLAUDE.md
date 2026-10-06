# Leren Lezen

Dutch learning app for the owner's children (kleuterschool and groep 3): reading, counting, listening, writing, reading booklets and music. It uses Vite, TypeScript and three.js with a vanilla DOM and has no backend. Pushing to `main` deploys to GitHub Pages (repo Pbeeltje/leren-lezen, public). The Android and iPhone app is a Capacitor 8 wrapper around the same code.

**Detailed documentation:**
- **`.claude/skills/leren-lezen-content/SKILL.md`** — how everything works. Read the relevant section before changing anything.
- **Other skills:** `leren-lezen-audio` (recordings), `leren-lezen-bronbestanden` and `leren-lezen-run`.
- **Open items:** `OVERDRACHT.md`.

## The owner's standing preferences

- **File locations:**
  - Files you produce go under `C:\claude`, never in Documents and never online as an artifact.
  - Project documents sit next to the repo: `C:\claude\leren-lezen-*.md` and `C:\claude\leren-lezen-preview\`.
- **Reading text never plays its audio automatically.** That covers booklet pages and future reading text. A speaker button is fine. Instructions and tapped single words may play.
- **Regression testing:** only run the full sweep (`tests/sweep.mjs`, 10–15 minutes) for changes that affect several systems (shared engine code, screen manager, generators). For contained changes: `npx tsc --noEmit` plus a targeted Playwright check with a screenshot.
- **Don't edit files while a sweep is running.** The dev server reloads and breaks it.
- **Slightly imperfect picture crops are low priority.**
- **Nothing is locked.** Practice allows retries; a test fails on the first wrong answer. No difficulty ramp by chapter position.
- **Keep the big custom cursor.**
- **Pictures:** only Fluent Emoji (MIT) or drawings of our own (`bronbestanden/teken-woorden.py`, `teken-weer.py`). No VLL, juf-milou or worksheet images: the app will be sold. Avoid the name "Veilig Leren Lezen" anywhere users can see it.
- **Commits:** Dutch commit messages, pushed straight to `main`. Before committing new audio, run `git rm -r -q --cached public/assets && git add public/assets`.

## Working

- **Dev server:** `npm run dev -- --port 5173 --strictPort`, at http://localhost:5173.
- **Checks:**
  - Type check: `npx tsc --noEmit`.
  - Production build: `npm run build`.
- **Test scripts:** in `tests/`, run with `node tests/<name>.mjs <output-folder>`.
  - The scripts load the dev server.
  - Profiles are put in localStorage first.
  - `formaten.mjs` is the layout sweep over 24 phone and tablet sizes.
  - `android.mjs` tests the APK on the emulator.
  - Throwaway scripts go in `tests/_tmp/`, never the scratchpad: `playwright` only resolves inside the repo.
  - For animated scenes use `page.screenshot({ clip })`. `locator.screenshot` waits for stillness and times out.
  - Screenshots at `deviceScaleFactor: 1` and clipped to what you check: every image stays in context.
- **Android build:** see `C:\claude\leren-lezen-preview\README.md`.
  - Tools are portable in `C:\claude\tools`.
  - The upload key is in `C:\claude\leren-lezen-sleutels` (outside git, never commit it).
- **iPhone build:** the GitHub Actions workflow `iOS-prototype`; see `C:\claude\leren-lezen-iphone-plan.md`.

## Known pitfalls

- **Asset paths:** in TS write `assets/...` (no leading slash). In CSS `url()`, a file from `public/` needs `/assets/...`; a relative one points at `dist/assets/assets/` after the build (harp frame, 2 Oct).
- **Multi-line edits:** use Edit/Write. Long `python - <<'EOF'` heredocs in Bash failed on quoting six times.
