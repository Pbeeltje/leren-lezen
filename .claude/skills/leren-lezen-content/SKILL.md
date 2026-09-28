---
name: leren-lezen-content
description: Reference for the leren-lezen codebase's architecture, content model, and conventions — how the reading (lezen) and math (tellen) subjects are structured, how to add new content, where to source icons/images, and known gotchas. Use before adding a kern/word/exercise type, wiring a new subject/topic, or touching profile/progress storage.
---

# leren-lezen: architecture & conventions

Dutch-language browser app teaching reading (age 6, Veilig Leren Lezen
1991 maan-versie curriculum) and beginning math (getalbeeld/subitiseren),
built as Vite + TypeScript + three.js, no backend, no framework (vanilla DOM).

## Screen navigation

`engine/screenManager.ts`: a `Screen` is `{ mount(root), unmount() }`. Every
screen is a factory function `(manager: ScreenManager) => Screen`.

- `push(factory)` — unmounts current, keeps it on the stack, mounts new on top.
- `pop()` — unmounts current, remounts the previous stack entry (same instance
  — so e.g. `KernOverviewScreen`'s `tekenLijst()` closure is still alive and
  gets called again in its own `mount()` to refresh stars/unlock state).
- `replace(factory)` — **clears the whole stack**, mounts fresh. Used whenever
  a screen shouldn't be "back"-able to (e.g. profile/age switches from the
  mini-menu, or after a toets finishes into `TestResultScreen`).

`AgeSelectScreen` is reached both via `push` (from profile pick) and via
`replace` (from the profile mini-menu's "Andere leeftijd" — stack may be
empty at that point), so its terug button explicitly `replace`s to
`ProfileSelectScreen` rather than calling `pop()`.

**Gotcha already hit twice**: any component with its own event subscription
(`MuntenTeller`, `ProfielMenu`) must be *created fresh inside `mount()`* and
torn down in `unmount()` — never created once in the screen factory body and
reused across a pop→push→mount cycle, or the subscription silently dies after
the first unmount and the UI stops updating live (exact bug: coin counter froze
after leaving and returning to a screen once).

## Two parallel subject systems

Reading and math are **not** unified under one generic engine — they're
structurally identical but independently implemented, on purpose (kept the
already-working reading flow safe while building math fast). If you add a
third subject, decide explicitly whether to generalize `OefeningScreen` at
that point rather than copying a third time.

| | Reading (`lezen`) | Math (`tellen`) |
|---|---|---|
| Content types | `content/types.ts` | `content/tellen/types.ts` |
| Content data | `content/lezen/kernen/*.ts` | `content/tellen/kernen/*.ts` |
| Session generator | `engine/oefeningGenerator.ts` | `engine/rekenenGenerator.ts` |
| Exercise runner screen | `ui/screens/OefeningScreen.ts` | `ui/screens/RekenOefeningScreen.ts` |
| Overview screen | `ui/screens/KernOverviewScreen.ts` | `ui/screens/RekenKernOverviewScreen.ts` |
| Game renderers | `games/plaatjeWoordKeuze.ts` etc. | `games/hoeveelheidNaarCijfer.ts` etc. |

Both share: `ui/screens/TestResultScreen.ts` (generic — takes an
`onVerder(manager)` callback so each subject wires its own "back to overview"
navigation), `engine/rewards.ts` constants, `engine/progressStore.ts`
(`markeerKernGestart`/`markeerKernVoltooid`/`haalKernVoortgang` are keyed by
a plain string kern id — reading uses `kern-01` etc., math uses
`reken-kern-01` etc., so there's no collision risk as long as you keep that
prefix convention), and the shared UI bits (`TopRechtsBalk`, `TerugKnop`,
`FeedbackOverlay`, `ProgressStars`).

## Session generation pattern (both subjects)

`oefenen` mode: samples a handful of items (5) from the kern's pool, assigns
each a random exercise type, allows retry on wrong answer
(`herkansingToegestaan: true`).

`toets` mode: reading uses the kern's **entire** `woordenbank` once each (so
question count = word count, currently 8-10 per kern); math uses a fixed
`TOETS_AANTAL = 10` regardless of the kern's own pool size. No retry.
Computes 0–3 `sterren` from the fraction correct, ends in `TestResultScreen`.

**Repeat-scoring tiers** (`engine/rewards.ts`), applied identically in both
`OefeningScreen` and `RekenOefeningScreen`: at screen-entry time, capture
`haalKernVoortgang(kern.id)` *before* `markeerKernGestart` runs, and hold
`wasAlGeoefend`/`wasAlGehaald` for the whole attempt (don't re-check mid-
session). First-ever oefenen on a kern pays `MUNTEN_OEFENING_GOED` (2) per
correct; any oefenen after that pays `MUNTEN_OEFENING_HERHAALD` (1). First-
ever toets pass pays `MUNTEN_TOETS_GOED` (5) per correct plus
`MUNTEN_TOETS_PERFECT_BONUS` (10) if perfect; a hertoets of an
already-`voltooid` kern skips per-question rewards entirely and pays one flat
`MUNTEN_TOETS_HERHAALD` (10) at the end regardless of score. This exists
specifically to stop coin-farming on content a child has already mastered.

A **skip button** (`.overslaan-knop`, bottom-center) is present on every
exercise screen: counts as wrong (no reward) but always advances, so a stuck
child is never blocked. Both `OefeningScreen` and `RekenOefeningScreen`
implement this the same way — a `klaarMetDeze` guard flag prevents double-
advancing if skip races the exercise's own `afgerond` callback.

## Reading-specific: the word bank + mixed exercises

A reading `Kern` (`content/types.ts`) bundles **multiple** structure words
(e.g. `kern-01` = maan+roos+vis together) plus a `woordenbank` of ~10
klankzuiver (phonetically regular) words built only from letters introduced
so far, plus optional `zinnen` (fill-in-the-blank sentences, picture-
supported; sentence *filler* words can exceed the known-letters set, but the
blank target word itself must come from the woordenbank).

`zelf-typen` (type the word from scratch, no choices) only becomes an
eligible exercise type for a given word once `haalBlootstelling(woord) >=
MIN_BLOOTSTELLING_VOOR_TYPEN` (currently 2) — i.e. after it's shown up in at
least 2 *other* exercise types. This is tracked per-word, per-profile, in
`progressStore`'s `woordBlootstelling` map, incremented in
`OefeningScreen.afhandelenResultaat` for every exercise type except
`zelf-typen` itself.

**Adding a word**: source/crop an image into `public/assets/images/woorden/`,
add `{ woord, afbeeldingPad }` to the kern's `woordenbank` array, optionally
add a `zinnen` entry. Verify the word is **klankzuiver** using only letters
already in `kern.nieuweLetters` (cumulative from earlier kernen too — track
the running letter set across all kernen when planning a new one; as of
kern-05 it's up to 22 letters). **Verify the picture is unambiguous** — a
generic Fluent Emoji chosen for its filename doesn't always read as the
intended word to a child (real bug: "mars" + a plain chocolate-bar icon read
as "chocolade"; fixed by swapping the *word* to something with an
unambiguous icon, not by fighting the icon).

**Reusing an existing icon for a different word is fine** — e.g. an avatar
SVG doubles as a word image (`kat.svg`/`hond.svg` copied from
`avatar-kat.svg`/`avatar-hond.svg`) when the same picture genuinely
represents both. Just `cp` it into `images/woorden/<woord>.svg`, no need for
a fresh fetch.

Five reading kernen exist now, each themed (kern-01 maan/roos/vis, kern-02
weer, kern-03 boerderijdieren, kern-04 dierentuindieren, kern-05 "spullen &
lijf"). Kernen 2-4 deliberately avoided Dutch vowel digraphs (ie/oe/ou/ei) to
keep "difficulty" flat while expanding vocabulary; kern-05's words came
directly from a real "Circuitspelletjes kern 4" worksheet the user provided
and *do* include a few digraphs (wiel, voet, zout) — trust an authentic
sourced worksheet's difficulty judgment over your own stricter default.

**Exercise types** (7 total): `plaatje-woord-keuze`, `woord-plaatje-keuze`,
`hakken-en-plakken`, `woord-bouwen` (3D), `zin-invullen`, `zelf-typen`, and
`woordwolk` — a picture with the correct word scattered 2-3× among ~7 cloud
tiles (mix of the target word repeated + other woordenbank words as decoys),
tap every correct instance to finish. Modeled directly on a classic "kleur
de juiste woorden bij het plaatje" worksheet the user shared. Decoys are
just other real words from the same kern (not letter-scrambled near-misses
like the original worksheet) — simpler and always produces real words.

## Math-specific

`RekenKern.bereik: [min, max]` is the number range; `objecten` is the pool of
countable icons. Five exercise types: `hoeveelheid-naar-cijfer` (see N
pictures, pick the numeral), `cijfer-naar-hoeveelheid` (see a numeral, pick
the group with that many pictures), `dobbelsteen-naar-cijfer` (classic 1-6
dice-pip pattern via `ui/components/Dobbelsteen.ts` — pure CSS grid, no
image asset — pick the numeral), `reeks-aanvullen` (typed-only, no choices:
fill the gap in a 3-number sequence like `11-[ ]-13`), `optellen` (simple
addition, sum always kept under 10, multiple choice — uses the everyday
"erbij" framing groep-3 curricula favor over formal "plus").

`RekenKern.oefeningTypen?: RekenOefeningType[]` restricts which types a kern
uses — **set this explicitly whenever a kern's range makes some types
meaningless**: counting-by-picture stops being useful once you're past ~10
items to visually count, and a die literally can't show 11-20. Current
kernen: 01 (1-6) and 02 (1-10) restrict to the three picture/dice types;
03 (11-20) restricts to `['reeks-aanvullen']` only; 04 (optellen tot 10)
restricts to `['optellen']` only. Without `oefeningTypen`,
`rekenenGenerator.ts`'s `toepasbareTypen()` falls back to "all types that
are structurally possible for this bereik" — that default previously let
kern-01 silently pick up reeks-aanvullen/optellen when those types were
added; explicit restriction is what keeps "addition is its own chapter" (a
direct user request) actually true. The dice type is additionally
hard-clamped to `[min, min(max,6)]` inside `maakOefening` regardless of the
kern's own range.

## Profiles ("wie speelt er?")

`engine/profielStore.ts`. Every localStorage-backed piece of state
(`progressStore`, i.e. munten/kernen/woordBlootstelling) is keyed per-profile
via `leren-lezen:voortgang:<profielId>` — `haalActiefProfielId()` (read from
`sessionStorage`, not `localStorage` — deliberate: survives a reload but not
a fresh app launch) determines which blob every read/write hits. If you add
a new piece of persisted state, key it per-profile the same way rather than
adding a new global key.

Avatars: 13 Fluent Emoji icons (`AVATAR_ICONEN`) × 7 hue-rotate tints
(`AVATAR_KLEUREN`, applied via `avatarFilter(kleur)` → CSS `filter:
hue-rotate(Ndeg) saturate(1.15)` on the `<img>`). A rotation shifts each
icon's *own* base hue, so the same degree value looks different per icon
(fox orange→green, unicorn pink→orange, etc.) — that's correct, not a bug,
if a color picker "looks wrong" at a glance, check the DOM's actual computed
`filter` before assuming it's broken.

## Sourcing icons/images (Fluent Emoji)

All icons/illustrations are MIT-licensed SVGs vendored from
`github.com/microsoft/fluentui-emoji` (no attribution needed, no design work).
Pattern:

```bash
curl -s -o public/assets/icons/<name>.svg \
  "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/<Emoji%20Name>/Color/<snake_case>_color.svg"
```

To find the exact folder/file name, fetch
`.../assets/<Emoji Name>/metadata.json` first (gives the canonical `cldr`
name) — URL-encode spaces as `%20`.

**Gotcha**: emoji with skin-tone variants (people, body parts — "Old woman",
"Ear", "Flexed biceps") are **not** directly under `<name>/Color/`; they're
under `<name>/Default/Color/<snake>_color_default.svg` (note: `_default`
suffix comes *after* `_color`, not before). If a direct `Color/` fetch 404s,
`curl -s "<name>/Default/Color/"` via the GitHub API
(`api.github.com/repos/microsoft/fluentui-emoji/contents/...`) to list the
real filename rather than guessing.

## three.js gotchas

`three/letterBlocks.ts`'s `LetterBlokkenScene` had a real bug: letter block
spacing was a fixed `1.6` world units regardless of the camera's actual
field-of-view/aspect ratio, so on a narrower browser window the outer blocks
fell outside the visible frustum and were silently invisible (not actually
missing from the data — a rendering bug, not a content bug). Fixed by
computing spacing (and letter size) from the live `camera.aspect`/`fov` each
time `toonLetters()` runs. **General lesson for any future three.js UI
here**: never hardcode world-space spacing/size against an assumed
container size — always derive it from the camera's actual current
aspect, and test at a narrow viewport (e.g. 420px) in addition to desktop.

## CSS gotcha: `hidden` attribute vs. `display`

`.profiel-menu__paneel { display: flex; }` silently **overrode** the
`hidden` attribute (equal CSS specificity, stylesheet loads after the UA
default, so it wins) — the dropdown rendered permanently open. Fix pattern
used throughout: whenever a component sets `el.hidden = true/false` for
show/hide, also add an explicit `.the-class[hidden] { display: none; }` rule
rather than relying on the bare attribute.
