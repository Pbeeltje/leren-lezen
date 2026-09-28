---
name: leren-lezen-run
description: Launch, build, and drive the "leren-lezen" Dutch children's education app (Vite + TS + three.js) for manual or automated verification. Use when starting the dev server, running a production build, or testing a change in a real browser for this project.
---

# Running and testing leren-lezen

This is a static Vite + TypeScript + three.js browser app — no backend. Project
root: `C:\claude\leren-lezen`.

## Commands

- `npm run dev` — dev server, default port 5173. Check with
  `curl -sf http://localhost:5173` before assuming it's up; poll, don't sleep-guess.
- `npm run build` — runs `tsc` then `vite build`. Treat any tsc error as blocking.
- `npm run preview` — serves the production build, useful to sanity-check the
  "just static files" deploy story.
- Always run `npx tsc --noEmit` after any edit before considering it done — this
  codebase has caught real bugs (missing letters, broken nav) via typecheck alone.

Stop a dev server with `lsof -ti:5173 -sTCP:LISTEN | xargs -r kill` before
relaunching, or you'll hit `EADDRINUSE`.

## Driving it in a browser (no chromium-cli here)

This environment does not have `chromium-cli` installed. Instead:

```bash
mkdir -p <scratchpad>/playwright-test && cd <scratchpad>/playwright-test
npm init -y && npm install playwright
npx playwright install chromium --with-deps   # one-time, ~120MB download
```

Then write a `.mjs` driver script and run it with plain `node`, e.g.:

```js
import { chromium } from 'playwright';
const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await (await browser.newContext({ viewport: { width: 1000, height: 800 } })).newPage();
page.on('pageerror', (err) => console.log('pageerror:', err.message));
await page.goto('http://localhost:5173');
// ... interact, screenshot with await page.screenshot({ path: '...' }), then Read the PNG
await browser.close();
```

Always check `pageerror`/`console` type `error` events and print them — several
real bugs this session were only caught this way (they didn't throw visibly,
just silently produced wrong-but-plausible-looking screenshots).

**Always view screenshots with the Read tool after capturing them.** A script
that runs cleanly with no console errors can still be rendering something
subtly wrong (see the letter-spacing bug below) — reading the actual pixels
is what catches these, not just "no exceptions thrown".

## Skipping to a specific screen/state

The app **always** starts at the profile picker (`ProfileSelectScreen`) on a
fresh page load — there is no URL routing to jump straight to a deeper screen.
To reach a specific state quickly in a test script:

1. Clear storage and reload: `localStorage.clear(); sessionStorage.clear();`
2. Click through "Nieuw profiel" → fill name → pick an avatar tile → submit.
3. To fast-forward progress (skip re-playing oefenen sessions), read the active
   profile id from `sessionStorage.getItem('leren-lezen:actief-profiel')`, then
   directly write `localStorage.setItem('leren-lezen:voortgang:' + id, JSON.stringify({...}))`
   with whatever `kernen`/`munten`/`woordBlootstelling`/`laatstGekozenLeeftijd`
   state you need, then reload and click the profile tile again (it routes to
   `TopicSelectScreen` directly once `laatstGekozenLeeftijd` is set, skipping
   `AgeSelectScreen`).
4. **Nothing is ever locked** — every kern's Oefening/Toets tiles on its
   `ChapterScreen`/`RekenChapterScreen` are always clickable regardless of
   progress (an earlier version gated Toets behind 3 oefenen sessions; that
   was an explicit correction, don't reintroduce it). A kern row in the
   overview list is reached via `.kern-rij--klikbaar`, and its chapter page's
   tiles via `.hoofdstuk-tegel:has-text("Oefening 1")` /
   `.hoofdstuk-tegel--toets`.

## Interacting with the three.js `woord-bouwen` exercise

The 3D letter blocks live in a `<canvas>`, not DOM nodes — you can't
`page.click()` a specific letter by selector. To click a letter block from a
test script, sample click positions across the canvas's bounding box (e.g. 24
x-positions × a few y-offsets) and check whether `.doel-sleuf.gevuld` count
increased after each click; retry until it does. See any `drive*.mjs` in git
history (search old session scratchpads) for the working pattern — the gist:

```js
const canvas = await page.$('.blokken-canvas canvas');
const box = await canvas.boundingBox();
// try points across box.x .. box.x+box.width, check .doel-sleuf.gevuld count each time
```

Give it ~600ms after the exercise mounts before clicking — the font loads
asynchronously (`FontLoader`) before blocks are created.
