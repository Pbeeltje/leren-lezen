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
  — so e.g. `ChapterScreen`'s `tekenTegels()` closure is still alive and gets
  called again in its own `mount()` to refresh progress/star state).
- `replace(factory)` — **clears the whole stack**, mounts fresh. Used whenever
  a screen shouldn't be "back"-able to (e.g. profile/age switches from the
  mini-menu, or after a toets finishes into `TestResultScreen`).

`AgeSelectScreen` is reached both via `push` (from profile pick) and via
`replace` (from the profile mini-menu's "Andere leeftijd" — stack may be
empty at that point), so its terug button explicitly `replace`s to
`ProfileSelectScreen` rather than calling `pop()`.

**A terug button must never call bare `pop()` on a screen that can also be
reached via `replace()`** — `pop()` silently no-ops once the stack is only 1
deep, so the button visually does nothing (a real, reported bug: "back
button doesn't work" on `KernOverviewScreen`, root-caused to `ChapterScreen`'s
terug button doing `manager.replace((m) => KernOverviewScreen(m))`, which
collapses the stack to length 1 right under it). Since it's easy to lose
track of every place a given screen can be entered from (`TopicSelectScreen`
alone is reached via `push`, from `AgeSelectScreen`, *and* via `replace`,
from `ProfileSelectScreen` when a leeftijd is already saved — the common
path for a returning profile), use `manager.terugOfAnders(fallbackFactory)`
instead of raw `pop()` on any screen whose entry points aren't 100% single
and push-only: it pops when the stack actually has something below, and
falls back to `fallbackFactory` (a `replace`) when it doesn't. Screens fixed
this way so far: `TopicSelectScreen` (falls back to `ProfileSelectScreen`),
`KernOverviewScreen`/`RekenKernOverviewScreen` (fall back to
`TopicSelectScreen` with the saved `laatstGekozenLeeftijd`, or
`AgeSelectScreen` if that's somehow missing). Before adding a new
`replace()` call anywhere, check whether it lands on a screen whose terug
button assumes it was pushed — if so, that screen now needs
`terugOfAnders` too.

**Gotcha already hit twice**: any component with its own event subscription
(`MuntenTeller`, `ProfielMenu`) must be *created fresh inside `mount()`* and
torn down in `unmount()` — never created once in the screen factory body and
reused across a pop→push→mount cycle, or the subscription silently dies after
the first unmount and the UI stops updating live (exact bug: coin counter froze
after leaving and returning to a screen once).

## Chapter structure: kern overview → chapter → oefening/toets

Each kern is a **chapter** with its own page (`ChapterScreen.ts` for reading,
`RekenChapterScreen.ts` for math), reached by tapping a row in
`KernOverviewScreen`/`RekenKernOverviewScreen` (now plain clickable rows, no
nested per-row buttons). A chapter page shows: a title row with ‹/› arrows
that `manager.replace` to the adjacent chapter (disabled via `index === 0` /
`index === LIST.length - 1` at the ends), then a 2×2 tile grid — 3 "Oefening
N" tiles (`OEFENSESSIES_VOOR_TOETS`, currently 3) plus 1 "Toets" tile with a
star balk. Tiles get a `.gedaan` class once `voortgang.oefenSessies >= i`,
purely cosmetic (a checkmark-style tile), not a lock.

**Nothing is ever locked.** Every oefening/toets tile is always clickable
regardless of progress — this was an explicit correction after an earlier
version gated the toets behind `oefenSessies >= 3`. `OEFENSESSIES_VOOR_TOETS`
today means only "how many Oefening tiles to draw and what the `X/3
geoefend` counter targets," nothing else. Don't reintroduce a `disabled`
check tied to progress on these tiles without an explicit new ask.

`RekenOefeningScreen`/`OefeningScreen` navigate back to the chapter (not the
kern-overview list) via `manager.replace((m) => ChapterScreen(m, kernIndex))`
— both in the terug button and in `TestResultScreen`'s `onVerder` callback —
and pass their own `tekenTegels`/list-refresh closure in as the "started
from" screen's re-render hook so returning to the chapter page shows updated
`.gedaan` state immediately, mirroring the closure-reuse pattern already
noted above for `pop()`.

**Progress bar**: `ui/components/Voortgangsbalk.ts` replaces a plain "5/10"
counter with a small cat icon that walks along a track toward a bowl icon as
`huidigeIndex` advances through the session — built specifically because a
bare fraction isn't legible to a pre-reader. **Fireworks**: `three/particles.ts`'s
`confetti.vuurwerk('klein' | 'groot')` fires a short burst from
`TestResultScreen` when a toets scores ≥80% (klein) or 100% (groot) —
intentionally brief, must not block the result screen.

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
| Chapter screen | `ui/screens/ChapterScreen.ts` | `ui/screens/RekenChapterScreen.ts` |
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
the running letter set across all kernen when planning a new one). **Verify
the picture is unambiguous** — a generic Fluent Emoji chosen for its filename
doesn't always read as the intended word to a child (real bug: "mars" + a
plain chocolate-bar icon read as "chocolade"; fixed by swapping the *word* to
something with an unambiguous icon, not by fighting the icon).

**Adjectives (`koud`, `droog`, `heet`, `nat`, ...) need `vereistTekst: true`.**
A bare picture can't disambiguate a quality word the way it can a noun — a
snowflake icon reads as "koud" just as easily as "sneeuw" or "winter". `Woord`
(content/types.ts) has an optional `vereistTekst?: boolean` for exactly this;
when set, `oefeningGenerator.ts`'s `beschikbareTypen()` drops
`hakken-en-plakken`/`woord-bouwen`/`zelf-typen` (picture-only, no text
anywhere on screen) and keeps only the types where the correct word also
appears as text (`plaatje-woord-keuze`, `woord-plaatje-keuze`, `woordwolk`,
`letter-herkennen`, `klank-herkennen`, and especially `zin-invullen` — always
give a `vereistTekst` word a `zinnen` entry, since the sentence is what
actually disambiguates it, e.g. "Buiten ligt sneeuw, het is heel ___." →
`koud`). Forgetting the flag reproduces the exact "rood"/"warm"/"leuk" problem
that got those words dropped entirely in earlier kernen — this flag is what
lets an adjective be *kept* instead of dropped.

**Reusing an existing icon for a different word is fine** — e.g. an avatar
SVG doubles as a word image (`kat.svg`/`hond.svg` copied from
`avatar-kat.svg`/`avatar-hond.svg`), or a thematically-fitting existing word
image is reused verbatim (`droog.svg`/`heet.svg` are literal copies of
`zon.svg`/`vuur.svg` — sunny weather *is* dry, and "hot" already had a fire
icon). Just `cp` it into `images/woorden/<woord>.svg`, no need for a fresh
fetch, as long as the picture genuinely fits (combined with sentence context
for a `vereistTekst` word, it doesn't need to be perfectly unique).

**Prefer the user's own source material over any icon set, generic or
not.** `bronbestanden/` (project root) holds worksheets/photos the user
provided — `plaatjes3.jpg` (a Larsen "woordpuzzel", 40 word+picture pairs),
`memory.jpg` ("Circuitspelletjes kern 4" memory cards, 10 pairs), plus
`aapnootmies.jpg`/`tegels/` (the classic 1910 leesplank, 17 tiles, not yet
wired into any kern — a leesplank bonus-mode screen was scoped in the
original plan but never built) and `woordwolk.jpg` (the worksheet the
`woordwolk` exercise mechanic itself was modeled on). A whole session went by
using only generic Fluent Emoji icons despite ~30 of the woordenbank words
already having a real photo sitting in `plaatjes3.jpg`/`memory.jpg` — a real
user complaint ("you didn't use a single one of the images I provided...
dissect them yourself"). Before reaching for Fluent Emoji or Iconify for a
new word, check `bronbestanden/` first (open each source image with Read and
look). To extract a picture: `bronbestanden/crop.ps1` is a working,
calibrated PowerShell/System.Drawing cropper for `plaatjes3.jpg` and
`memory.jpg` (no npm install needed — `System.Drawing.Bitmap` ships with
Windows) — it has the exact column/row pixel grids for both sources already
solved (getting that grid right took several calibration passes: naive
extrapolation from just the first two rows compounds a few px of error per
row into a ~75px drift by row 5, enough to crop pure black past the image's
bottom edge — anchor the grid from *both* the first and last row/column
independently instead of extrapolating one pitch across the whole sheet).
Add new `<word>: (row, col)` entries to its `$grid`/`$memGrid` hashtables and
rerun; `bronbestanden/contact.ps1` renders every image in `_staged/` as one
labeled contact sheet so you can verify a whole batch in a single Read
instead of one file at a time. These are real photos, not vectors — the
`pad()`/`woord()` helper in each kern file takes an `ext` param
(`woord('maan', 'jpg')` or similar per-file signature) specifically so a
word can point at a `.jpg` instead of the default `.svg` without changing
every other call site.

**If Fluent Emoji has no good match either, search other open icon sets via
Iconify** (`https://api.iconify.design/search?query=<term>`) rather than
forcing a bad Fluent Emoji fit — it aggregates hundreds of open-source sets
(Material Symbols, Game Icons, Tabler, etc.) and returns each match's
`prefix:name` plus per-set license info. Fetch the actual SVG from
`https://api.iconify.design/<prefix>/<name>.svg`. Most sets are MIT/Apache
(no attribution needed, same as Fluent Emoji), but check the license in the
search response — `was.svg` (clothesline, for "was" = laundry hanging to
dry) came from `game-icons:clothesline`, which is **CC BY 3.0** and does
require attribution; see `ATTRIBUTIONS.md` at the project root, which must be
kept up to date if more non-MIT icons are added this way.

Eight reading kernen exist now (kern-01 maan/roos/vis, kern-02 weer, kern-03
boerderijdieren, kern-04 dierentuindieren, kern-05 "spullen & lijf", kern-06
"meer woorden", kern-07 "klanken", kern-08 "weer, deel 2"). Kernen 1-6
deliberately avoided Dutch long-vowel-digraph spelling (oo/aa/ee) and true
diphthongs (ei/ij/ui/ou/eu/au) to keep "difficulty" flat while expanding
vocabulary — except the words that were already spent as kern-01
structuurwoorden (`maan`, `roos` both contain "aa"/"oo" but were unavoidable,
being the canonical VLL structure words). kern-07 ("klanken") is where all of
those combinations get introduced at once, via the `klank-herkennen`
exercise type; kern-05's words came directly from a real "Circuitspelletjes
kern 4" worksheet the user provided and do include a couple of digraphs
(wiel, voet) as an intentional exception — trust an authentic sourced
worksheet's difficulty judgment over your own stricter default, but don't
extend that exception to freely-invented words elsewhere.

**A theme can span two kernen when its vocabulary's difficulty does.**
kern-08 exists because the user wanted `onweer`/`sneeuw`/`bliksem`/`hagel`
added to the weather theme, but they need letters/klanken that don't land
until kern-03 (h), kern-04 (b), kern-05 (u) and kern-07 (the "ee" klank) —
too late to just add to kern-02. Rather than either breaking the
letter-progression invariant or scattering the four words across whichever
kern happens to unlock their letter, they're kept together as one coherent
"part 2" chapter placed after every letter/klank they need is available
(here, right after kern-07). This is the general pattern for "I want these
specific words in kern X" when some of them aren't valid yet: check every
word's letters against `nieuweLetters` cumulative through kern X, and if any
fail, propose a same-theme sequel kern positioned after the last dependency
instead of silently dropping the request or silently violating the ordering.

**Exercise types** (10 total): `plaatje-woord-keuze`, `woord-plaatje-keuze`,
`hakken-en-plakken`, `woord-bouwen` (3D), `zin-invullen`, `zelf-typen`,
`woordwolk`, `letter-herkennen`, `klank-herkennen`, `drie-koppelen`.

**Difficulty ramps up from kern 2 onward.** `oefeningGenerator.ts` ranks
every type 1 (easiest) to 5 (hardest) in `MOEILIJKHEID` and picks a word's
type with `kiesGewogenType()`, weighted by `moeilijkheidsfactor(kern)` — 0 at
kern 1 (types roughly equally likely) rising to 1 at the last kern (hard
types much more likely). No type is ever fully excluded at any factor (every
weight has a `+1` floor) — a direct requirement ("preserving each type of
exercise until the end"), so don't change the weighting formula to let a
weight hit zero. The factor is computed from `kern.volgnummer` against
`KERNEN.length`, so adding an 8th kern automatically stretches the ramp
rather than needing a manual update. Current ranking: tier 1
`plaatje-woord-keuze`/`woord-plaatje-keuze`; tier 2 `woordwolk`/
`letter-herkennen`; tier 3 `klank-herkennen`/`hakken-en-plakken`; tier 4
`woord-bouwen`/`zin-invullen`; tier 5 `drie-koppelen`/`zelf-typen`.

`drie-koppelen` — three pictures and three words, shuffled independently in
two columns; tap a picture then a word (either order) to attempt a pair,
correct pairs lock green, a wrong pair flashes red and both deselect (or
fails the exercise outright in toets mode, same `herkansingToegestaan`
convention as everything else). Harder than the other multiple-choice types
because three answers have to be tracked in parallel instead of one target
among decoys — a direct response to "maybe you can do something where you
have to match three images to the right word at once?". Its three words are
`doel` plus two others sampled fresh from the kern's `woordenbank` in
`maakOefening()`'s `'drie-koppelen'` case (needs `woordenbank.length >= 3`,
true for every kern) — unlike every other type, it isn't really "about" one
`doel` word, so `woordVanOefening()` (used for blootstelling tracking) just
reports `paren[0]` as a reasonable approximation.

`woordwolk` — a picture with **exactly one** correct word among ~7 cloud
tiles (the rest are other woordenbank words as decoys), tap the one correct
tile to finish. Modeled on a classic "kleur de juiste woorden bij het
plaatje" worksheet the user shared, which had the target word repeated 2-3×
among the tiles — deliberately simplified to a single correct instance after
the user found the repeated-target version confusing ("waarom staat het
antwoord er meerdere keren?"). Don't reintroduce a `herhaling`/repeat-count
field on this type without an explicit new ask.

`letter-herkennen`/`klank-herkennen` — a big letter (or klank digraph, e.g.
"oo") is shown, the child picks which of several **text** word buttons
contains it. Text-based (not picture-based), so these are always safe for
`vereistTekst` adjectives too. `klank-herkennen` only becomes eligible for a
word that contains one of `oefeningGenerator.ts`'s `KLANKEN` array
(`oo`, `aa`, `au`, `ou`, `ui`, `eu`, `ee`) *and* the kern's woordenbank has at
least one other word lacking that klank (needed as a valid distractor).

## Math-specific

`RekenKern.bereik: [min, max]` is the number range; `objecten` is the pool of
countable icons. Seven exercise types: `hoeveelheid-naar-cijfer` (see N
pictures, pick the numeral from choices), `hoeveelheid-typen` (same picture,
but type the numeral — no choices; direct response to "I want more math
questions where you see pictures, say 10 trees, and have to type 10
yourself"), `cijfer-naar-hoeveelheid` (see a numeral, pick the group with
that many pictures), `dobbelsteen-naar-cijfer` (classic 1-6 dice-pip pattern
via `ui/components/Dobbelsteen.ts` — pure CSS grid, no image asset — pick the
numeral), `dubbele-dobbelsteen-naar-cijfer` (a fixed "volle tien" die plus an
ordinary 1-6 die, covers 11-16 since a single die can't show past 6),
`reeks-aanvullen` (typed-only: fill the gap in a 3-number sequence like
`11-[ ]-13`), `optellen` (simple addition, sum always kept under 10, multiple
choice — uses the everyday "erbij" framing groep-3 curricula favor over
formal "plus").

`RekenKern.oefeningTypen?: RekenOefeningType[]` restricts which types a kern
uses — **set this explicitly whenever a kern's range makes some types
meaningless**: counting-by-picture stops being useful once you're past ~10
items to visually count, and a single die literally can't show past 6.
Current kernen: 01 (1-6) and 02 (1-10) restrict to
`['hoeveelheid-naar-cijfer', 'hoeveelheid-typen', 'cijfer-naar-hoeveelheid',
'dobbelsteen-naar-cijfer']`; 03 (11-20) restricts to
`['reeks-aanvullen', 'dubbele-dobbelsteen-naar-cijfer']`; 04 (optellen tot 10)
restricts to `['optellen']` only. Without `oefeningTypen`,
`rekenenGenerator.ts`'s `toepasbareTypen()` falls back to "all types that
are structurally possible for this bereik" — that default previously let
kern-01 silently pick up reeks-aanvullen/optellen when those types were
added; explicit restriction is what keeps "addition is its own chapter" (a
direct user request) actually true.

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

**Avatar-picker and color-picker must stay fully separate — two independent
places implement this (`ui/screens/NewProfileScreen.ts` at profile creation,
`ui/components/ProfielMenu.ts` for an existing profile) and both need the
same two rules:** the animal-picker grid (choosing *which* animal) must never
apply `avatarFilter()` — it always shows every icon's true, undistorted
colors, or the shapes become genuinely hard to tell apart (real user report:
"it often only shows different color unicorns"). The color-picker swatches
(choosing *which tint*) show only the **currently selected animal**, tinted
once per palette colour, and must be kept reactively in sync — if a
component lets you change animal and colour from the same panel, changing
the animal must re-point the colour swatches' `<img src>` at the new animal
(see `werkKleurVoorbeeldenBij()` in `NewProfileScreen.ts` for the pattern),
otherwise the swatches keep showing the *old* animal after a switch.
`ProfielMenu.ts` had both of these wrong as recently as this session (the
avatar grid was tinted by the current colour, and swatches never followed an
avatar change) — if you touch either file, re-verify both rules, in a real
browser, not just by reading the code.

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

**This bites you again every time a *new* element gets `.hidden`-toggled** —
it's not a one-time fix. `ProfielMenu.ts`'s `avatarWeergave`/`kleurWeergave`
panes (`.avatar-grid`/`.kleur-rij`) hit the exact same bug later in this same
project: both classes had their own `display: flex` rule with no matching
`[hidden]` override, so toggling one visible while "hiding" the other left
both rendered on top of each other (looked like a garbled, way-too-long
avatar grid — was actually the colour swatches bleeding through underneath).
Whenever you add a new component that shows/hides children via `el.hidden`,
grep the class for an existing `display` rule and add the `[hidden]`
override in the same edit — don't wait for it to visibly break.

## CSS gotcha: vertical centering can hide content behind the fixed corner buttons

`.scherm` (`styles/global.css`) centers its content vertically
(`justify-content: center`) and every screen has `.terug-knop`/`TopRechtsBalk`
fixed-positioned in the top corners (`top: 16px`, ~88px tall, `z-index: 5`,
*siblings* of `.scherm`, not children — so `.scherm`'s own overflow/scroll
handling doesn't know about them at all). Two related failure modes, both
real bugs found by testing at a short/narrow viewport (~390×780, not just
desktop): (1) content taller than the viewport (e.g. the `woord-bouwen`
exercise card) centers by overflowing equally above *and* below — the top
portion becomes permanently unreachable, not just scrolled-past, because
centered flex overflow can't be recovered by scrolling in the "before"
direction; (2) even *short* content can center itself into a vertical
position that lands directly under those fixed buttons, rendering behind them
(not clipped by overflow — just occluded by a higher z-index sibling). This
was very likely the cause of a user bug report ("an image was missing, it
was off the moon") — reproduced with the `maan` word-bouwen exercise
specifically. Fixed with three changes together, all necessary: `.scherm`
gets `overflow-y: auto` (so genuine overflow is at least scrollable rather
than hard-clipped), `justify-content: safe center` layered after the plain
`center` fallback (so content taller than the viewport start-aligns instead
of centering into inaccessible overflow — needs the `center` line first for
browsers that don't understand `safe center`), and `padding-top: max(24px,
112px)` (a hard floor that keeps even short, fully-fitting content clear of
the ~104px-tall fixed-button zone, which "safe center" alone doesn't help
with since that content was never actually overflowing). If you touch
`.scherm`'s layout, re-test at a narrow *and* short viewport, not just
desktop width — this class of bug doesn't show up at 1100×850.
