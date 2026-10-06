---
name: leren-lezen-content
description: Reference for the leren-lezen codebase's architecture, content model, and conventions — how the reading (lezen) and math (tellen) subjects are structured, how to add new content, where to source icons/images, and known gotchas. Use before adding a kern/word/exercise type, wiring a new subject/topic, or touching profile/progress storage.
---

# leren-lezen: architecture & conventions (index)

Dutch learning app (Vite + TypeScript + three.js, vanilla DOM, no backend) for
kleuterschool and groep 3. **This file is only an index: open just the topic file
you need.** When you change behaviour, update the matching topic file in the same
commit (describe the current state; don't append dated "latest round" notes).

## Rules that apply everywhere

- **Nothing is locked.** Practice allows retries; a toets fails on the first wrong
  answer. No difficulty ramp by chapter position.
- **Reading text never plays its audio automatically** — only via a speaker button.
- **Pictures:** Fluent Emoji (MIT) or our own drawings only.
- **Back buttons:** use `manager.terugOfAnders(fallback)` instead of bare `pop()`
  on any screen that can also be reached via `replace()`.
- **Components with subscriptions** (`MuntenTeller`, `ProfielMenu`) are created in
  `mount()` and torn down in `unmount()`, never in the factory body.
- **A new activity screen with the top-right bar** must rebuild its question after
  a shop visit (`onderbroken`), see navigatie-voortgang.md.
- **`el.hidden` toggles** need a `.class[hidden] { display: none; }` rule.
- **Per-profile state:** key localStorage as `leren-lezen:<thing>:<profielId>`.
- **Group lists:** reading screens use `leesKernen()`, math screens `rekenKernen()`
  (`engine/leeftijdGrens.ts`), never `KERNEN` / `REKEN_KERNEN` directly.

## Topic files

| File | Read before touching |
|---|---|
| [navigatie-voortgang.md](navigatie-voortgang.md) | screen manager, chapters/tiles, session generation, coins (`rewards.ts`), profiles storage, groups, shop-during-activity |
| [lezen.md](lezen.md) | reading word bank, adding words, exercise types, kleuter letters, Andika font, on-screen keyboard, begrijpend lezen, leesboekjes |
| [tellen.md](tellen.md) | math chapters and exercise types, sums, money, kleuter counting |
| [audio.md](audio.md) | playing clips, replay buttons, feedback timing (`naHuidigeAudio`), mute |
| [kleuter-onderwerpen.md](kleuter-onderwerpen.md) | Luisteren, Geheugenspel, Ontdekken, Schrijven (tracing), Tekenen |
| [muziek.md](muziek.md) | xylophone, Speel na, Ritme, levels, drum kit, shop instruments (harp, fluit, keyboard, kikkerkoor) |
| [spelletjes.md](spelletjes.md) | Vangspel, Tafeltennis, Dieren voeren |
| [achtergronden.md](achtergronden.md) | background themes, adding a theme |
| [winkel-profiel.md](winkel-profiel.md) | shop, profile menu, avatars and tints |
| [layout.md](layout.md) | CSS gotchas, landscape phone/tablet layout, three.js sizing |
| [app.md](app.md) | Capacitor Android/iPhone wrapper |
| [plaatjes.md](plaatjes.md) | where pictures come from, Fluent Emoji fetching |

Other skills: `leren-lezen-audio` (recordings), `leren-lezen-run` (dev server,
Playwright, hosting), `leren-lezen-bronbestanden` (source images).
