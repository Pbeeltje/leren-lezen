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
`OefeningScreen` and `RekenOefeningScreen`. The repeat flag `herhaling` is captured
once at screen-entry (`haalKernVoortgang` before anything is written) and held for
the whole attempt. Oefening: `herhaling` = this Oefening 1/2/3 is in
`KernVoortgang.oefeningenAf` (added by `verhoogOefenSessies(kernId, nummer)` when a
session is played to the end; skips count). Toets: `herhaling` = `sterren === 3`
(perfected before). Starting without finishing never reduces anything. Old saves
without `oefeningenAf` get `[]` in `leesRuw()` (not derived from `oefenSessies`, which
counts sessions, not which oefening).
- Oefening: `MUNTEN_OEFENING_GOED` 2 per correct, `MUNTEN_OEFENING_SET` 5 at the end
  (paid right after `manager.pop()` so the chapter screen's counter pulses; there is
  no result screen).
- Toets: `MUNTEN_TOETS_GOED` 2 per correct; end amount from `toetsEindMunten()`:
  `MUNTEN_TOETS_VOLDOENDE` 10 if ≥ half correct, `MUNTEN_TOETS_PERFECT` 20 instead if
  perfect, plus `MUNTEN_TOETS_EERSTE_PERFECT` 50 the first time that toets is perfect.
  `TestResultScreen` shows the total (`muntenDitKeer`).
- Repeat (groep 3, `lesMunten`): half of everything, rounded up (5 becomes 3).
- Kleuter: every amount x1.5 rounded up (`kleuterFactor`), never halved, but the
  perfect bonus (30) and first-perfect extra (75) are once per toets: a perfect kleuter
  retake pays 3 per correct + 15.
- An `isAfgerond` guard in `afronden()` keeps a shop visit from paying an end bonus twice.

Other activities, no repeat discount, all through `kleuterFactor`:
- Luisteren, Ontdekken, Schrijven (Lijnen, Letters, Woordjes): 2 per correct plus
  `MUNTEN_RONDE_SET` 5 when all rounds are done, shown on the klaar card.
- Geheugenspel: `MUNTEN_GEHEUGEN_PAAR` 2 per pair, the moment it is matched (the
  `paarGevonden` callback of `renderGeheugenSpel`), plus `MUNTEN_GEHEUGEN_BORD` 10 per
  finished board. Groep 3 (8 pairs) 26 per board, kleuter (4 pairs) 27.
- Speel na and Ritme: `muziekMunten(max)` from the level's max length
  (`MUNTEN_MUZIEK_GOED` 2 and `MUNTEN_MUZIEK_SET` 10, times `muziekMuntFactor`: x1 up
  to 6, x2 above 6, x4 above 8, no higher), then `kleuterFactor`. A set is the 10
  questions in `RondeScreen` (2 rounds of 5): full set = 30 x factor (groep 3) or
  45 x factor (kleuter). Levels 1–5 for groep 3: 30, 30, 60, 120, 120.
- Leesboekjes: flat `MUNTEN_OEFENING_GOED * 3` at the end, no kleuter factor.

Wrong answers pay nothing. The coin counter pulses live.

A **skip button** (`.overslaan-knop`, bottom-center) is present on every
exercise screen: counts as wrong (no reward) but always advances, so a stuck
child is never blocked. Both `OefeningScreen` and `RekenOefeningScreen`
implement this the same way — a `klaarMetDeze` guard flag prevents double-
advancing if skip races the exercise's own `afgerond` callback.

## Reading-specific: the word bank + mixed exercises

A reading `Kern` (`content/types.ts`) has a `woordenbank` of **12** words
(ids `lezen-01` … `lezen-23` in `lezen-hoofdstukken.ts`) plus optional
`zinnen`. Difficulty order: CVC → long vowels → clusters → diphthongs →
sch/eeuw → themed review → plurals. Each word sits in exactly one chapter.
The toets is the whole bank (12). Old `vll-kern-*` / `kern-0*` ids are gone.

`zelf-typen` (type the word from scratch, no choices) is **never** picked as a
regular question. It is only added at the end of a series, for a word that already
came up earlier in that same series (the owner's rule: "only for words that have
come up in that series of questions before, otherwise it's too hard"). See
`voegTypenToe()` in `oefeningGenerator.ts`. zin-invullen is always multiple choice.
(`woordBlootstelling` in progressStore is still tracked but no longer gates typing.)

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
instead of one file at a time (it picks up both `.jpg` and `.png`). These are
real photos, not vectors — the `pad()`/`woord()` helper in each kern file
takes an `ext` param (`woord('maan', 'jpg')` or similar per-file signature)
specifically so a word can point at a `.jpg`/`.png` instead of the default
`.svg` without changing every other call site.

**Calibrating a new source image**: don't try to eyeball pixel coordinates
from a normal Read of the image — render a ruler overlay first. Draw
gridlines with `System.Drawing.Graphics.DrawLine` every 20-50px and label
each one with `DrawString` using the *original, unscaled* coordinate value
(not the scaled/displayed pixel position) — then Read the overlay and read
the boundaries off the labels directly. Two concrete mistakes already made
doing this: (1) extrapolating a row pitch from just the first two rows and
projecting it across the whole sheet compounds a few px of drift into ~75px
by row 5, enough to crop solid black past the image's bottom edge — anchor
from both the first *and* last row/column independently instead of
projecting one pitch across the whole sheet; (2) after scaling an image up
for a clearer render, writing the *original* value into a text label but
then, when transcribing that label back into the crop script, accidentally
using a *displayed/scaled* pixel value instead — this silently shifts a
whole column into blank space or the next column's text with no error.
Simplest guard: always draw the axis labels directly on the ruler image
itself (not just gridlines) so the number you copy into the crop script is
right there next to the line you're reading, rather than trying to infer it
from position or a separately-remembered scale factor.

**A third mistake, found later, in production**: `roos.jpg`'s crop left a
thin sliver of the neighboring cell (`sok`, a blue-striped sock) bleeding in
along one edge — invisible in `contact.ps1`'s 200×200 preview grid (too
small a render to notice a few stray pixels) but obvious once actually
rendered at real size in the app (the user spotted it directly in a
screenshot). The general lesson: a contact-sheet check at low resolution is
a good first pass but isn't sufficient proof a crop is clean — for a crop
you're not fully confident in (tight margins, a cell near the sheet's edge,
anything cropped from a busy/cluttered source), Read the individual file at
its native size too before calling it done. Fixed by trimming that one
crop's right edge further in `crop.ps1` (search for `roos` — it has a
special-cased narrower width, not the shared per-column inset every other
`plaatjes3.jpg` word uses).

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

Reading chapters live in `lezen-hoofdstukken.ts` (23 × 12 words). The list
and picture/audio notes are in `C:\\Claude\\leren-lezen-hoofdstukken-plan.md`.
New pictures: `bronbestanden/teken-lezen-nieuw.py` (daisy for bloem, tulp
from the old bloem file, plurals as 2–3 copies). Older notes below about
the first ten kernen are history. Kernen 1-6
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
kern-09 ("kerst") and kern-10 ("klanken, deel 2") are two more examples of
the same pattern, each built from a full worksheet the user dropped into
`bronbestanden/` (`woordennogeen.png`, `nogmeerwoordentwee.jpg`) and cropped
with one-off `crop-kerst.ps1`/`crop-wb2.ps1` scripts (same technique as
`crop.ps1`, see below) — both needed placing after kern-07 since their
vocabulary leans on "oo"/"oe"/"ui"/"ou" (`koek` is what introduced the "oe"
klank to `KLANKEN` in `oefeningGenerator.ts`). When one of these source
worksheets has a target word alongside 1-2 *wrong* choice words in the same
grid cell (e.g. "kast / kat / kaas" next to a cat picture, correct = "kat"),
only crop and use the correct word — the wrong choices were decoys on the
original worksheet, not vocabulary to add.

**Exercise types** (10 total): `plaatje-woord-keuze`, `woord-plaatje-keuze`,
`hakken-en-plakken`, `woord-bouwen` (3D), `zin-invullen`, `zelf-typen`,
`woordwolk`, `letter-herkennen`, `klank-herkennen`, `drie-koppelen`.

**Exercise type per word: weighted by age, not by kern.** `kiesType()` in
`oefeningGenerator.ts`: for 6-year-olds (`GEWICHT_ZES`) building words, zin-invullen
and drie-koppelen come up more, and the simple multiple-choice types come up less.
Age 5 gets a uniform pick. **Session shape:**
- Oefenen: one question per pool word (3-5 words), then extra repeat
  plaatje/woord-keuze questions for words already asked (at least 1, filled up to 6),
  then, for age 6, one zelf-typen question for a repeated word. That is always 7
  questions for age 6 and 6 for age 5.
- Toets: every bank word once, then, for age 6, 2 zelf-typen questions for words from
  that toets.
- In math, `hoeveelheid-typen`/`reeks-aanvullen` count double.

An
earlier kern-position "difficulty ramp" (harder types in later kernen) was
explicitly rejected; don't reintroduce weighting by chapter position.

**Each Oefening 1/2/3 covers a distinct, fixed third of the kern's
woordenbank; the toets is the one place that reviews all of it.**
`woordenVoorOefening(kern, nummer)` in `oefeningGenerator.ts` partitions
`kern.woordenbank` round-robin by index (`i % 3`), and `genereerSessie(kern,
'oefenen', oefeningNummer)` draws only from that slice — so replaying
"Oefening 1" always reuses the same ~third of the words (reshuffled, not
identical every time) rather than a fresh random sample of the *whole* bank
that could overlap heavily with what Oefening 2/3 already covered. This was
a direct request ("expand each topic so each exercise is mostly new words
and the test is the review"). `ChapterScreen`'s tegel loop passes its loop
index `i` (1/2/3) through as `oefeningNummer` when pushing `OefeningScreen`;
`RekenOefeningScreen`/`rekenenGenerator.ts` were **not** changed the same
way — math's "pool" is a number range, not discrete named words, so the same
partitioning scheme doesn't map cleanly; flag it if the user asks for the
same behavior on the math side, it'll need its own design. Note: multi-choice
decoys (`kiesAfleiders`) still draw from the *whole* woordenbank regardless
of partition, so a word from another oefening's slice can still appear as a
wrong-answer option — that's intentional (keeps decoy pools varied) and
doesn't defeat the "mostly new target words" goal, since only the `doel`
word actually being taught is partition-restricted.

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
numeral), `dubbele-dobbelsteen-naar-cijfer` (two ordinary dice, the answer
is all pips added together, sum ≤ 10, in the "Optellen tot 10" chapter. An
earlier version made one pip on the left die mean "ten" to cover 11-16; the
user rejected it because a young child won't understand that one die means
ten. Don't bring back conventions that need explaining),
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
hue-rotate(Ndeg) saturate(1.9) contrast(1.12)` on the `<img>`). A rotation shifts each
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

## Audio

Instruction audio is wired in and working for every reading/math exercise
type plus the goed/fout feedback phrases. `engine/audioManager.ts`'s
`speelAf(pad)` plays a clip if it exists at that path and no-ops silently
otherwise; `instructieAudioPad(type)`/`woordAudioPad(woord)` build the
`/assets/audio/instructies/<slug>.mp3` / `/assets/audio/woorden/<woord>.mp3`
paths. `OefeningScreen.ts`/`RekenOefeningScreen.ts` both call
`speelAf(instructieAudioPad(oefening.type))` the moment a new exercise's
instruction text is set (in `toonHuidige()`), and `FeedbackOverlay.ts`'s
`toonOverlay()` picks its message index once and plays
`feedback-{goed|fout}-{index+1}.mp3` for that *same* index — text and audio
must stay in sync there, don't let them pick independently.

**Every place audio plays has a large, obvious replay button next to it**
(`ui/components/AudioKnop.ts`'s `maakAudioKnop()`, `.audio-knop` in
screens.css — 72px circle, direct user request) so a child can re-trigger it
on demand rather than only hearing it once automatically. Both oefening
screens hold the *current* exercise's audio path in a closure variable
(`huidigeAudioPad`) that the button replays and `toonHuidige()` updates each
time it advances — don't wire a new "plays audio automatically" spot without
giving it the same button.

**Word-level pronunciation clips** (`woordAudioPad()`,
`public/assets/audio/woorden/*.mp3`) are used by the "Luisteren" topic (see
below) — not by the reading kernen's exercises, which are still purely
visual/instruction-audio only. `zin-invullen` sentence audio doesn't exist
at all yet — playing the target word out loud before the child answers
would spoil a fill-in-the-blank question, so it needs its own design (e.g.
read the sentence with a pause where the blank is) before it can be
recorded and added.

**Mute**: `audioManager.ts`'s `isGedempt()`/`zetGedempt()` (backed by a
single global `localStorage` key, not per-profile — it's a device/speaker
setting, not something that should reset when a different kid picks their
profile) gate `speelAf()` at the top; muting also stops anything already
playing (iterates the internal clip cache and pauses each element). The
toggle lives in `ProfielMenu.ts`'s main view as a `.profiel-menu__optie`
row that swaps its icon/label and, unlike every other option in that menu,
deliberately does *not* close the panel on click — it's a flip switch, not
a navigation action.

The clips themselves are the user's own voice, recorded in one continuous
take from `bronbestanden/audio-script.txt` (the numbered read-aloud script)
and split by silence detection against `bronbestanden/audio-manifest.json`
(the matching `{n, slug, text, path}` list) — not AI TTS. The splitting
approach, if this ever needs redoing for a re-recording or an extension:
portable `ffmpeg` via `npm install ffmpeg-static` in scratch (no system
install needed), `silencedetect=noise=-30dB:d=0.5` found silence gaps
cleanly with the ~1.5-2s pauses the script asked for, and speech segment `i`
is `[silence_end[i], silence_start[i+1]]` (N silences bookend N-1 speech
segments — sanity-check that count against the manifest length *before*
cutting anything).

**A matching segment count and plausible durations do NOT prove the clips are
labeled correctly — always verify by transcription.** The first split passed
both checks and was still wrong for 46 of 106 clips: "Goed zo!" and "Knap
gedaan!" were read with too short a pause and merged into one segment, and a
stray extra take near `muis` added a segment back, so the total stayed at 106
while every clip in between (slots 19-64) held the *next* item's audio. The
user heard "Bijna!" on correct answers, "mais" for maan, "boom" for bliksem.
Verify with local speech-to-text: `pip install faster-whisper` (if PyAV
complains about `metadata_errors`, `pip install "av==13.1.0"`), model `small`,
`language="nl"`, transcribe every clip and diff against the manifest text.
Whisper mishears isolated one-syllable Dutch words ("bij"→"Dag", "hond"→"en")
but a *shift* is unmistakable: the transcript of slot N matches the expected
text of slot N+1 for a long run. When recording, ask for a clear 2-second pause
between items, and split any merged clip with a finer `silencedetect`
(`noise=-35dB:d=0.08`) on just that clip.

**After replacing clips, make git re-read their contents.** Clips of equal length have
exactly the same file size, and git's quick check can then miss a changed file: the
corrected `kat.mp3` was never committed, so the live site kept playing "kip" for the cat.
After writing audio, run `git rm -r -q --cached public/assets && git add public/assets`
and look at `git status` before committing.

**Feedback clips are never cut off: advance with `naHuidigeAudio`, not a fixed timer.**
`speelAf()` stops whatever plays, so anything that starts audio after a goed/fout answer
(next instruction, next word, a memory card's word, `pop`/`replace` at the end of a session,
which call `stopAudio()`) must wait for the feedback clip. `naHuidigeAudio(fn, stilteMs,
maxMs, minMs)` calls `fn` after the current clip ends (or is paused/errors) plus `stilteMs`,
at most `maxMs`, at least `minMs` after the call (so muted play keeps the old pause), and
returns a cancel function: store it and call it in `vernietig`/`unmount` and when advancing
some other way, so terug/winkel mid-feedback stays silent. Used by `OefeningScreen` and
`RekenOefeningScreen` (300 ms gap, 900 ms minimum; the old fixed 900 ms timer always cut
"Helemaal goed!" at 1.3 s and others on slow loads), `RondeScreen`, `luisterKiezen` and
`geheugenSpel` (the board locks until the word and then "Goed zo!" are finished; the next
card would cut them). Check: `node tests/feedback-audio.mjs <map>` (logs every play/pause/
ended and reports cheers cut short, plus duration/tail of each feedback clip).

## "Luisteren" topic — the non-readers' entry point

A third, structurally separate topic (`content/topics.ts`, id `luisteren`,
ages 3-6) exists specifically for kids too young to read at all — no text
anywhere on screen in either of its two games. Built once real audio
existed — this is what "audio narration" was ultimately *for*, from the
original ask for something a 3-year-old could actually use. Picking the
topic lands on `ui/screens/LuisterenKiesScreen.ts`, a small 2-tile chooser
between the two games below (added after the first version shipped with
only one game and the user pointed out ~80 recorded words support a lot
more than that).

Both games are deliberately **not** built on the kernen/chapter/oefening-
toets machinery reading and math use — no letters to learn, no progression,
so none of that structure applies, and neither has a kern id, so no
star/voortgang tracking applies to either. Both pull from the same shared
pool, `engine/luisterenGenerator.ts`'s `woordenpool()`, which walks every
reading kern's `woordenbank` and filters out `vereistTekst` words (a
3-year-old can't read the disambiguating sentence an adjective like `koud`
needs) — meaning **any word added to any reading kern automatically becomes
available in both games**, no separate content to maintain.

**Luister & wijs** (`ui/screens/LuisterenScreen.ts`, `games/luisterKiezen.ts`):
hear a word, tap the matching picture from 3 options. Runs in **rounds of 5**
(`RONDE_LENGTE`) with a `Voortgangsbalk` and a `confetti.vuurwerk('klein')`
burst at the end of each round, then a fresh round starts automatically —
added after the first version ran as one endless undifferentiated stream
with no sense of progress or payoff. Wrong answers always allow retry (no
toets-style "fail immediately" mode here at all), a correct answer pays a
small oefening-tier coin and the finished set pays `MUNTEN_RONDE_SET`.

**Geheugenspel** (`ui/screens/GeheugenScreen.ts`, `games/geheugenSpel.ts`):
classic memory/matching-pairs — `genereerGeheugenbord()` picks 4 words from
the pool, makes 2 cards per word, shuffles. Tapping a face-down card flips it
and plays that word's audio (bonus repetition, not just a matching game); a
correct pair locks green, a mismatch flips both back after ~900ms with no
penalty or fout-feedback at all (deliberately gentler than a wrong guess
elsewhere in the app — this is unstructured toddler play, not a quiz). A
cleared board also fires `vuurwerk('klein')` and starts a fresh board.
Both groups also open it from the Spelletjes topic (`id: 'spellen'`): kleuters
4 pairs, groep 3 via `GeheugenScreen(m, 8)` (8 pairs = 16 cards). Kleuters
still have the same tile under Luisteren.
Boards with more than 4 pairs get `.geheugen-bord--groot` (4x4 portrait, 8x2
landscape, cards shrink with the viewport so the board never scrolls). Check:
`node tests/geheugen-groep3.mjs <map>`.

Picture-ish touch targets in both games (`.luister-plaatje` 160px,
`.geheugen-kaart` 100px) are sized differently from every picture-choice
type built for 6-year-olds (`.keuze-knop--plaatje` is 96px) — bigger,
easier-to-hit targets for younger hands. Match that sizing, not the
6-year-old one, for anything else aimed at this age group.

**Gotcha this topic exposed in `audioManager.ts`**: `speelAf()` used to
start a new clip without stopping whatever was already playing. Any two
clips fired close together (e.g. the "Goed zo!" feedback clip, which can run
past 1.5s, followed ~900ms later by the next round's word) would overlap,
and a kid can end up hearing the *tail* of the previous clip layered under
or after the new one. (The "I hear mais but it's not an option" report that
prompted this was actually the mislabeled-clip bug described under Audio;
the overlap fix is still correct, but it wasn't the cause.) Fixed by tracking the currently-playing element and
pausing it before starting a new one, regardless of path. This matters most
here because both Luisteren games fire audio in quick succession (flip a
card, guess again, advance rounds) — anywhere else audio is more spaced out
by user interaction, but don't assume that holds for a future feature.

## "Ontdekken" topic — kleuter concepts (ages 3-6)

Topic id `ontdekken` (it replaced the old "Vormen & kleuren" placeholder) opens
`ui/screens/OntdekkenKiesScreen.ts`, a chooser for three games inspired by Squla's
kleuter topics (see `onderzoek/squla.md`):
- **Groot of klein?** (`games/kleuter/vergelijken.ts`): groot/klein (same picture at
  100% and 42%), zwaar/licht (curated pairs from the reading pictures, both shown the
  same size so the child can't just pick the bigger picture), lang/kort (SVG pencils).
- **Meer of minder?** (`games/kleuter/meerMinder.ts`): two groups of the same counting
  icon, up to 6, with a difference of at least 2 so it's visible without counting. The
  "=" button is correct when both groups are equal (~15% of questions).
- **Kleuren & vormen** (`games/kleuter/kleurenVormen.ts`): a 3×3 grid of coloured shapes
  and a sample that tells the child what to find without reading: a paint splat for a
  colour (drawn from circles, so it never looks like one of the game's shapes) or a
  white outline for a shape. Tap every match.

Each game is only a `maakVraag(): RondeVraag` function. `ui/screens/RondeScreen.ts` is
the shared shell (rounds of 5, progress bar, fireworks, coins, replay-audio button).
A new kleuter game is one new `maakVraag` function plus a tile in `SPELLEN`.
Instruction audio lives at `instructies/vergelijk-*`, `meer-minder-*`,
`zoek-kleur-*` and `zoek-vorm-*`; these clips are on `opnamelijst-2`.

Math also has **bussommen** (`games/bussom.ts`, type `bussom`, chapter `reken-kern-05`):
the bus shows the starting passengers, the stop shows who gets on or off, and the sum
is written below. `start` is always one of the distractors, because forgetting who got
on or off is the classic mistake.

## Reading chapters (Lezen 1–23)

See `lezen-hoofdstukken.ts` and `C:\\Claude\\leren-lezen-hoofdstukken-plan.md`.
`KLANKEN` in oefeningGenerator lists the longer groups first ('aai' before 'aa',
'sch' before 'ch'). Words longer than 8 letters skip woord-bouwen, longer than
10 skip hakken-en-plakken. Kleuters use `kleuter-letters.ts` (letter-herkennen
from the groep-3 word bank), not chapters 1–2.

## On-screen keyboard for typing questions (touch screens)

A phone only opens its own keyboard when an input gets focus directly from a tap. Our
typing questions appear after the previous question's feedback, so `focus()` runs with no
tap behind it and the keyboard often stayed closed. The owner got reports about this.
`ui/components/SchermToetsenbord.ts` `koppelSchermToetsenbord(invoer, 'letters' | 'cijfers', na?)`
fixes it:
- On `(pointer: coarse)` devices it makes the input `readOnly` with `inputMode='none'` and
  adds big alphabetical letter keys, or a number pad, plus a backspace key.
- With a mouse (computer) nothing changes.

All four typing games (zelf-typen, zin-invullen typed, hoeveelheid-typen, reeks-aanvullen)
use it. Any new typing input must call it as well. A CSS block shrinks the picture and the
input when the keyboard is present, so everything fits on one phone screen.

## "Schrijven" topic: tracing and drawing (ages 3-6)

`SchrijvenKiesScreen` uses the generic `SpelKiesScreen` (tiles with an optional
`leeftijden` filter). The games:
- Lijnen (all ages)
- Letters (5-6)
- Woordjes (6)

Free drawing (Tekenen) lives under Spelletjes, not here.

**Letter shapes** live in `content/schrijven/letters.ts`:
- Each letter is a list of strokes in writing order, built from `lijn()`/`boog()` and
  sampled roughly every 2 units.
- Strokes have the usual school direction: o starts at the top and goes anticlockwise; b
  is the stem first, then the belly.
- A stroke with a single point is a dot to tap (i, j).
- Coordinates: ascenders start at y=10, x-height is y=40, the baseline is y=80, and
  descenders reach about y=105.
- `woordFiguur()` places letters side by side to make a word.
- `LIJNEN` are toddler paths in a 200x120 box. A picture travels along each path, e.g. a
  bee to a flower.

**Tracing** is in `games/schrijven/overtrekken.ts`:
- Progress only moves forward, to path points at most `VOORUIT_KIJKEN` points ahead and
  within `tolerantie`. That enforces direction and order without being strict.
- Lifting the finger keeps the progress made so far.
- Going too far off the path just pauses; the child picks it up again at the star.
- The ink is drawn along the guide path, not along the raw finger trail, so it always
  looks neat.

**Letters game:**
- It uses VLL letter order with a key word for each letter ("de m van maan"), showing that
  word's picture with the letter highlighted.
- Each letter has its own instruction clip `schrijf-letter-<letter>`.
- The voice says the letter's sound, not its name, as VLL does.

**Tekenen** (`TekenScreen.ts`) is a canvas for free drawing:
- 9 colours, 2 thicknesses, an eraser (`destination-out`), undo and "nieuw blad".
- Lines are stored as normalised points, so undo and resizing simply redraw everything.
- Nothing is saved, by the owner's choice.

## "Leesboekjes" topic: VLL reading booklets (ages 5-6)

`content/boekjes/boekjes.ts` holds one booklet per VLL kern 1-6:
- Each has 6-7 pages of `{ plaatjes, tekst }`, all in lowercase, like the first VLL
  booklets.
- **A page may only use sounds known up to its kern.**
- `npx tsx bronbestanden/check-boekjes.mts` checks this. It always reads vowel pairs and
  other sound groups as one sound ("een" is ee-n, so it is not allowed in kern 1). It also
  checks that every picture exists.
- Run it after any change to a booklet.

Screens:
- `BoekenkastScreen` is the shelf; age 5 sees only the first chapters, like reading.
- `BoekjeScreen` shows one page at a time. Each word can be tapped and plays its word clip
  if one is recorded.
- A recorded page clip (`assets/audio/boekjes/boekje-K-P.mp3`) **only plays when the child
  presses the speaker button**, never automatically on a page turn. The owner's reasoning:
  the child is supposed to read the page themselves, and the voice is help on request.
- `engine/opnames.ts` `isOpgenomen(pad)` reads the audio manifests, so unrecorded audio
  never causes a 404.
- The last page goes to `toonKlaarKaart`.

## "Muziek" topic: xylophone, speel na, ritme (ages 3-6)

The sounds are synthesised in `engine/muziek.ts` with Web Audio, so nothing is recorded:
- The xylophone tone is three decaying sine partials; the drum is a falling sine thump
  plus a short burst of noise.
- It respects mute (`isGedempt`).
- The AudioContext starts lazily on the first tap.

`games/muziek/xylofoon.ts` has the coloured bars:
- Tapping plays a bar, and gliding a finger across plays each bar once.
- Highlight and bounce classes are removed on `animationend`, so a later class change
  can't look like a new hit.

The games:
- **Xylofoon** (`XylofoonScreen`): free play on 8 bars.
- **Speel na:** level 1 uses only the five-note scale (`VIJFTONIG`) so any random tune sounds
  pleasant; from level 2 all 8 bars, and from 5 notes the start of a real song. Each note is a
  dot with that bar's colour (same rim and fill as the rhythm dots, via `muziek-stippen--ritme`
  and `--drum` set to `STAAF_KLEUREN`).
- **Ritme:** length and drums grow per level (kleuters only 2–4 and 4–6; see Music levels).
  From 5 hits the beat rotates through `GROOVES`. There is no one-drum-at-a-time preview;
  the question plays only the pattern (instruction audio still plays by itself on the first
  question, and hits count only after that playback). Free play never had that preview.
  `ritmeKlopt()` always checks the number of hits and, for mixed beats, classifies each of
  the child's gaps against their own shortest and longest gaps, so overall tempo doesn't matter.
- A wrong answer just replays the tune or beat (no coins). A correct copy pays
  `muziekMunten` for that level; the trophy after 10 questions pays the set bonus too.
  Free play pays nothing.
- The maker functions (`maakSpeelNaVragen()`) hold their own counter, so every time the
  game opens it starts short again.

### Instruments: harp, fluit, keyboard (shop items)

- `Instrument` / `INSTRUMENTEN` in `engine/muziek.ts`; `speelInstrument(instrument, toon, wanneer)`.
  Xylofoon is free; the other three cost `INSTRUMENT_PRIJS` (200) as `WinkelSoort` `instrument`
  (keys `instrument:<id>` in `gekocht`). The choice is remembered per profile
  (`VoortgangData.instrument`, read via `huidigInstrument()` in `engine/winkel.ts`, which falls
  back to xylofoon when unset or not owned).
- Sound: harp is Karplus-Strong (`snaarBuffer`, 3-tap, dark, 20% reverb) matched to
  `bronbestanden/harp.m4a`. Fluit keeps the last steel-synth (`speelSteel`: one voice,
  sine+triangle, short swell). Keyboard = 2-operator FM (`speelKeyboard`). Old shop key
  `instrument:steelgitaar` still counts as fluit. Banjo/gitaar were dropped.
- Keyboard look: white keys with a coloured patch, decorative black keys via
  `[data-zwart]::after` (set in `maakXylofoon` for do/re/fa/sol/la when the next key exists);
  tapping a black key plays the white key it belongs to. `xylofoon.svg` is now our own
  xylophone drawing (it used to be the Fluent piano emoji, which clashed with the keyboard).
- `maakXylofoon(tonen, opTik, instrument)` is the component for all four: same buttons
  (`.xylofoon__staaf`), `zetInstrument()` switches the look (`.xylofoon--<id>`, CSS in
  screens.css) and `speel(positie, wanneer)` plays with the current sound. Strings keep
  `STAAF_KLEUREN`, so the Speel na dots still match. Harp keys are ~120px wide (same as
  the vrij-spelen xylophone bars); the frame is `harp-kast.svg`.
- Picker: `ui/components/InstrumentKnoppen.ts` (buttons with `data-instrument`; not owned =
  grey + lock, tap opens `WinkelScreen(m, { soort: 'instrument', koop: id })` with the purchase
  window open) plus the coin button `.muziek-winkel-knop` (store on the Instrumenten tab).
  Vrij spelen: in the top row next to Drumstel (labels only from 1100px wide); it builds its
  instruments in `mount` so it survives a trip to the store. Speel na: `.muziek-instrumenten`
  in the card (top right; a column on the right when the screen is ≤820px high);
  `maakSpeelNaVragen(niveau, naarWinkel)`.
- Shop: third tab Instrumenten; on phones (≤600px) the tabs show only their icons.
- Icons `harp.svg`, `harp-kast.svg`, `fluit.svg`, `keyboard.svg`, `xylofoon.svg` are our own drawings.
- Check: `node tests/instrumenten.mjs <map>`.

## Recording list 5

`bronbestanden/maak-opnamelijst-5.mts` generates `opnamelijst-5-deel-1/2`:
- Part 1: the Schrijven and Muziek instructions, the per-letter sentences, and the booklet
  words that have no recording yet.
- Part 2: the 37 booklet pages.

Process the recordings with the leren-lezen-audio skill as usual. `verwerk-opname.py`
creates `audio/boekjes/` by itself.

## Drum kit, wooden blocks, backgrounds and profile menu (latest round)

- **Ritme** (`games/muziek/muziekVragen.ts`): figures `ta`/`titi`. Drums per level, not per question: 1 bas+snare, 2 +bekken, 3 +tom, 4–5 +crash (kleuters only 1–2). From 5 hits `GROOVES` rotates one real beat per question (see the Music bullet). No solo-drum preview before the pattern. Gaps KORT 0.24 / LANG 0.72; `ritmeKlopt` judges relative to the child's own tempo. Hitting the wrong drum is a mistake. Free play (`XylofoonScreen`) switches between the xylophone and all five drums; drums sound only when tapped.
- **Woord bouwen blocks** (`three/letterBlocks.ts`): wooden canvas texture (`houtVlak`), black frame, lowercase Andika, lens PerspectiveCamera(28). Double letters: every letter gets its own block and the tapped block disappears (kaas: tap one a, then the other a).
- **Backgrounds** (`src/achtergrond/`): every theme is a DOM `Decor` (`{element, juich, feest?, vernietig?}`), CSS in `styles/achtergrond.css`.
  - **zee:** the boat rides the higher of the two waves (`drijf` rAF loop). Rainbow (`maakRegenboog` in hulp.ts) 2.2 s after the storm. The whale (`kortAan(walvis,'duikt-op')`) appears 3.5 s after the boat is fully off screen.
  - **kasteel:** day 25 s / night 20 s (`data-tijd`), sometimes a rainbow by day, `.valster` shooting stars by night.
  - **ruimte** (`achtergrond/ruimte.ts`): one scheduler for shooting stars (`.valster`, random position) and the slow diagonal `.raket` (22%). Never two at once, ≥ 5 s rest between them; `juich` only fires when the sky is free. The old three.js shooting star is gone.
  - **onderwater:** see the Onder water bullet at the end of this file (own CSS file `styles/achtergrond-onderwater.css`, drawings in `achtergrond/onderwater-tekening.ts`).
  - **boerderij:** flat polder (`.boerderij-polder`, see the last bullet of this file), own windmill (`.molen__wieken` rotates) and barn, CSS fence, Fluent cow/pig/sheep/rooster/chicks. Tractor every 8–22 s, random direction; the Fluent tractor faces left, so it gets `.gespiegeld` when driving right, except 20% of the time when it deliberately drives backwards (class `achteruit`, mirror flipped). `juich`: the cow jumps with a "boe!" bubble; `feest`: all animals jump in turn.
  - **herfst, winter, kermis, bouw, trein:** each has its own CSS file `styles/achtergrond-<id>.css` (imported in main.ts) and pictures with the prefix `<id>-` in `public/assets/achtergrond/`.
  - **Adding a theme:** add the id to `ThemaId`, plus an entry in `THEMAS` and `MAKERS`. The shop and profile menu pick it up automatically (200 coins). Fluent animals face left: mirror them with `.gespiegeld`. If `prefers-reduced-motion` is set, don't start JS schedulers. View a theme with `node tests/achtergronden.mjs <map> <id>` (rest/juich/feest on phone, pc and landscape).
- **Shop** (`ui/screens/WinkelScreen.ts`): owned items come first (in the fixed order), then the rest. Backgrounds use compact cards: 6 columns (3 on phones) and up to 4 rows, so everything fits on one page. Check with `tests/winkel-rij.mjs`.
- **Profile menu** (`ui/components/ProfielMenu.ts`): a header (figure + name), 4 tiles (Mijn figuur = animal + colour combined, Achtergrond, Geluid toggle, Wisselen = other profile / age). The main card stays narrow; Mijn figuur widens to the shop card (`min(760px, viewport)`) with the same 3×3 / 5-column grid as the figure shop, so the animals are readable. Submenus have a back arrow; picking an option keeps the menu open and marks the selection. Test driver: drive it by `.profiel-tegel` / `.profiel-keuze` / `.profiel-menu__terug`.
- **Android/release:** see `C:\claude\leren-lezen-android-plan.md` (all raster images in `images/` are from third-party material and must be replaced before selling).

## Android/iPhone app (Capacitor 8)

- `capacitor.config.ts`: appId `nl.pbeeltje.lerenlezen`, webDir `dist`, SystemBars visible + DARK, `insetsHandling: 'css'` (Capacitor injects `--safe-area-inset-*`; CSS uses `--veilig-boven/onder/links/rechts` from global.css).
- `src/engine/native.ts` (no-op in the browser): mirrors every `leren-lezen:*` localStorage key to `@capacitor/preferences` and restores it on start when localStorage is empty (OSes may clear WebView storage); Android back button = close shop window/menu, else click `.terug-knop`, else minimize. `main.ts` awaits the restore before mounting.
- Font Baloo 2 is bundled (`src/assets/fonts`, `styles/fonts.css`), no Google Fonts. `navigator.audioSession.type = 'playback'` so the iOS silent switch doesn't mute Web Audio.
- Tools (portable, not in the repo): `C:\claude\tools\jdk-21...`, `C:\claude\tools\android-sdk` (+ emulator, AVD `leren` in `C:\claude\tools\avd`; start with `-gpu host` — SwiftShader segfaults). Upload key + password: `C:\claude\leren-lezen-sleutels\` (outside git; gradle reads it for release signing).
- Build: `npm run build && npx cap sync`, then in `android/` with JAVA_HOME/ANDROID_HOME set: `gradlew assembleRelease bundleRelease`. Preview output goes to `C:\claude\leren-lezen-preview\`. Raise `versionCode` for every Play upload.
- Android end-to-end testing: Playwright `_android.devices()` → `device.webView({ pkg })` (plain connectOverCDP doesn't work). Typing via `adb shell input text`. The emulator's WebView is Chrome 133, where Capacitor pads the WebView; a stale strip under the status bar there is an emulator display glitch (the WebView's own screenshot is clean).
- iOS: no Mac needed for building — `.github/workflows/ios-prototype.yml` (macos-26, Xcode 26) builds for the simulator, injects `.github/ios-demo.js` (CI only) to click through screens, and uploads screenshots as an artifact. Signing/TestFlight is not set up yet (needs Apple Developer Program + App Store Connect API key in GitHub Secrets); see `C:\claude\leren-lezen-iphone-plan.md`.
- Layout sweep over 24 phone/tablet sizes: the skip button now sits in the progress-bar row (`.voortgangsbalk .overslaan-knop`), the profile menu is `position: fixed` against the screen edge, and landscape phones (max-height 500px) get smaller corner controls.
- Landscape phones (phone held sideways): everything lives in one block at the end of `screens.css`, `@media (orientation: landscape) and (max-height: 500px)`. Question cards with 2+ children become a two-column grid (first child = the question, left, `grid-row: 1 / span 6`; the rest right). Gotcha: that `> :first-child` rule is more specific than `> *`, so the typing layout (`.oefen-kaart:has(> .scherm-toetsenbord)`: picture/input/button left, keyboard right) must reset `grid-row` on `:first-child` too. Woord bouwen, typing and the test result get extra-compact padding there to fit 667×375. Vangspel shows a "Draai je telefoon" overlay (`.vang-draai`) that pauses the game; the `matchMedia` in `VangScreen.ts` must stay identical to the `.vang-draai` media query (it adds `pointer: coarse`). Tablets/laptops held sideways get a separate, milder block right after it, `(orientation: landscape) and (min-height: 501px) and (max-height: 820px)` (1024×768, 1180×820, 1366×768): single-column cards stay, only gaps/pictures shrink (word building, typing, number typing incl. 10 pictures in two rows) and `.scherm-titel` is hidden on screens with a `.voortgangsbalk` (schrijven, muziek). Screenshot walk: `node tests/liggend.mjs <folder> [844x390 667x375 1024x768]`, `ALLEEN=lezen,tellen,...` limits sections. Findings and open items: `C:\claude\leren-lezen-liggend.md`.

## Groups instead of ages

Children no longer pick an age but a group (`Groep = 'kleuter' | 'groep3'` in content/types.ts, screen `GroepKiesScreen`, "In welke groep zit jij?"). Kleuterschool = everything that was for ages 3–5 (luisteren, ontdekken, Lijnen, plus lezen/tellen limited to 2 chapters at the easier level via leeftijdGrens.ts / `isZes()`, and a calmer music tempo); groep 3 = what age 6 had. Filters: `Topic.groepen`, `SpelKeuze.groepen`. Storage: `laatstGekozenGroep`; old `laatstGekozenLeeftijd` is migrated on read (≥6 → groep3, else kleuter). Icons `groep-kleuter.svg` (Fluent teddy bear) and `groep-groep3.svg` (keycap 3). Test fixtures that still set `laatstGekozenLeeftijd: 6` keep working through that migration.

## Kleuter reading, Andika, keyboard colours and songs (1 October 2026)

- **Kleuter reading has its own set.** `content/lezen/kernen/kleuter-letters.ts` builds 6
  chapters (m s v / r k p / n t b / h d z / l w g f / all letters) with `Kern.letters` set.
  For such a kern `genereerSessie` only makes letter-herkennen questions: the target word
  starts with the letter, the 2 other words don't contain it. Words come from the normal
  word banks (5 letters max). Screens get the list from `leesKernen()` in
  `engine/leeftijdGrens.ts` (kleuter: `KLEUTER_KERNEN`, else `KERNEN`); never use `KERNEN`
  directly in reading screens. Check: `node tests/kleuter-lezen.mjs <map>`.
- **Reading font:** Andika (OFL, `src/assets/fonts/andika-latin-{400,700}.woff2`) via
  `--leeslettertype` for everything the child reads or types (big letter, word buttons,
  letter tiles, sentences, booklets, keys, the 3D letter blocks). Baloo 2 stays for the UI.
  Reason: in heavy Baloo 2 the n and r looked alike.
- **Screen keyboard:** vowels red (`.scherm-toets--klinker`), consonants blue. Shown in the
  app (`isApp`), and on any device with touch (`maxTouchPoints` / `any-pointer: coarse`); a
  physical keyboard still types into the readOnly field via a keydown handler.
- **Music:** Speel na from 5 notes plays the start of a real song (`LIEDJES` in
  `muziekVragen.ts`: Kortjakje, Vader Jacob, In de maneschijn, Ode an die Freude, Mary had a
  little lamb, Jingle bells) with its note lengths. The dots show which bar is coming
  (rim and fill in `STAAF_KLEUREN`, same classes as the rhythm dots). Ritme from 5 hits
  rotates `GROOVES` (a different beat each question, only drums that level unlocked).
  Level 2: boem-titi-bekken, stomp-stomp-clap, rock (bas snare bas bekken), waltz,
  bekken on the off-beat, stomp-bekken-snare. Level 3 adds the tom (march, tom doubles,
  tom fill, bekken-tom, stomp-stomp with tom, tom on 2 and 4). Levels 4–5 add the crash
  (downbeat, rock ending on crash, stomp-stomp into crash, tom-fill into crash, crash
  on the off-beat, tom-march into crash). Shorter questions stay `maakFiguren`.
  Ritme does not introduce the kit by playing each drum once; only the pattern is played.
  That preview is not in `maakDrumstel` or free play (a drum sounds when the child taps it).
  Speel na and Ritme pay coins (free play does not): 2 per correct copy and 10 for the
  finished set, times 1 / 2 / 4 when the level max is ≤6 / >6 / >8, then the kleuter
  x1.5 (`kleuterFactor`). Replaying a set pays again.

- **Saved drawings:** Tekenen has a heart button (bewaar) and a framed-picture button (mijn
  tekeningen). `engine/tekeningenStore.ts` keeps 10 slots per profile in localStorage key
  `leren-lezen:tekeningen:<profielId>` (mirrored to Preferences in the app like all
  `leren-lezen:` keys). Drawings are stored as lines (coordinates 0..4095 as two base64
  characters, nearby points dropped), not as images; 10 drawings are a few KB. Saving a
  drawing that came from a slot overwrites that slot; when all 10 are full the list opens
  in "welke mag weg?" mode. Deleting needs two taps on the wastebasket (first tap wiggles).
  "Nieuw blad" asks first (big ✕ / ✓, no reading needed) when the page has unsaved lines.
  The list window is appended to `document.body` so it covers the top buttons.
  Check: `node tests/tekeningen.mjs <map>`.
- **Leesboekjes hidden:** the topic has `groepen: []` (the owner isn't happy with the
  booklets yet). Code and audio stay; give it groups again to bring it back.
- **Kleuter topic order:** `topicsVoorGroep('kleuter')` puts Luisteren first.
- **Tafeltennis** (`ui/screens/TafeltennisScreen.ts`, under Spelletjes, Fluent ping pong
  icon): pong in portrait. Your figure + red bat at the bottom (finger/mouse x, arrows/A/D),
  three random other avatars (random tint) at the top, one after another, getting better.
  The opponent plays fair: it only sees the ball, looks every `kijkElke` s and guesses the
  landing spot with an error that shrinks as the ball nears (`ruis`), grows per wall bounce
  still to come (`stuiterFout`; level 1 doesn't see bounces, just follows the ball) and
  with ball speed (`snelheidsFout`); a per-ball `neiging` keeps the error on one side. Its
  bat has weight (`topsnelheid`, `versnelling`) and can overshoot. Tuned on random-angle
  shots to return ~54% / 70% / 84% (the old bot did 54 / 98 / 100); a node simulation of
  the same logic is in `tests/_tmp/pong-sim.mjs`. First to 3 wins: stars = your goals, hearts = their
  goals left. Lose a match = retry that same opponent; beat all three = trophy + big
  fireworks, then three new opponents. Ball speeds up 4.5% per hit (max 1.8x), the bounce
  angle depends on where it hits the bat (max 55°). Kleuter: ball 0.8x, opponents 0.85x.
  Windows are pictures only (you VS them, the ladder of 3, play button) and reuse the
  `.vang-venster` styles; the "Draai je telefoon" overlay reuses `.vang-draai`. The table
  colour follows the background (`.thema-* .pong-tafel` sets `--pong-tafel`/`--pong-rand`).
  No coins. Check: `node tests/tafeltennis.mjs <map> [mis-kans]` (auto-player follows the
  ball and logs how far it gets).
- **Dieren voeren** (`ui/screens/VoerScreen.ts`, under Spelletjes, carrot icon
  `icons/voeren.svg`): animals walk in from the right in the foreground (any background),
  each with a speech bubble in Dutch ("Boe!", "Mèèèh!"). Drag food from the tray at the top
  onto an animal; your own figure (bottom left) then throws it in an arc. Right = happy hop,
  +1, heart, walks on to the left; wrong = "Bah!", shakes, turns and walks off right, −1 heart.
  Three wrong = end; record per profile (`leren-lezen:voeren:<id>`), no coins, no timer.
  - `DIEREN` has per animal `goed` (what it eats) and an explicit `fout` list (things it
    certainly doesn't eat; only those are used as wrong options). `kijkt` (left/right/front)
    mirrors the picture to the walking direction. `schaal` 0.8–1.2 is stretched by
    `spreid()` (×1.75 around 1, min 0.4) so a mouse is really small and an elephant big;
    a group that doesn't fit beside the figure shrinks evenly (`maten`). `mond` overrides
    where thrown food lands (fraction of the displayed, left-facing picture).
    `THEMA_DIEREN` favours animals that fit the background (75%).
  - Entrances (`komt`): loopt, hupt, springt (cat, tiger, fox), valt (monkeys drop from the
    sky, then hop in place `--wipt`), glijdt (penguin, seal), stampt (dinos shake the
    screen), rent (dog runs back and forth once), zakt (sloth on a vine), vliegt (bee,
    butterfly; hover `--zweeft`), kruipt (snail, turtle: a third of a body per second, in
    and out; nobody waits for them: the tray comes once the rest has arrived, and a leaving
    crawler moves to `kruipers` so the next group already walks in past it), kronkelt
    (snake). Extras: `slaapt` (lion, sloth fall asleep "Zzz…"), `spuit` (elephant
    water fountain).
  - Groups: 1 animal, from score 6 sometimes 2, groep 3 from 14 up to 3 (max 2 when width
    < 560). Animals in a group never share a good food, and never stand next to their own
    food (`PROOI`/`lust`: cat/snake–mouse, wolf–sheep, fox–chicken). `SAMEN`: monkeys, bees
    and butterflies often come in 2–3 (only the first one talks). From score 4, 12% chance
    of a family: mouse + 4 baby mice (`alleenFamilie`), a monkey troupe or a bee/butterfly
    swarm.
  - Hunters (`jager`: tiger, lion, T-rex, polar bear, wolf, fox): if a plant eater waits
    next to one for 4 s unfed, the hunter chases it off ("GRRR!"/"Help!"), no heart lost.
  - Tray: the unique wanted foods topped up to 3 with things none of them eat. Food stays
    in the tray after a throw (drag it again for the next animal). Throws don't block:
    you can drag the next food while one is still flying; the target animal leaves the
    `wacht` state (`data-staat`) immediately so it can't be hit twice.
  - Drop target: each waiting animal's box plus a margin; when margins overlap the nearest
    animal centre wins. One chord (do-mi, + sol for three) when the tray appears.
  - Extra pictures in `public/assets/voeren/`: Fluent dog, bone, meat, meat on bone, peanut,
    worm, sauropod, butterfly; own drawing `zeewier.svg`. Drag shows a big white hand cursor
    (open/closed, `.voer-sleept`) and a fading trail.
  - Check: `node tests/voeren.mjs <map> [kleuter]`; special animals with forced groups
    (dev hook `window.__voerGroepjes`): `node tests/voeren-dieren.mjs <map> [w] [h]`
    (env `ALLEEN=n` runs only the first n groups).
- **Spelletjes** (`id: 'spellen'`, both groups, `SpellenKiesScreen`): one topic tile
  (Fluent joystick) that opens Vangspel, Tafeltennis, Dieren voeren, Geheugenspel and Tekenen. The Vangspel tile shows the
  profile's own figure, with `avatarFilter` for the picked tint — same on the in-game
  player and the start/end portrait. The figure stands at the bottom and follows the finger (or arrow
  keys). A tap (or space / arrow up / W) hops about half the figure's height (~0.4 s, no double
  jump); the catch zone rises with it. Catch falling food (+1) and the odd glowing star (+5); meteors cost one of 3
  hearts (1.2 s blinking afterwards). Speed and meteor share rise with time; kleuters
  slower and fewer meteors. Missed food costs nothing. At 40 s normal drops stop: one huge
  hazard falls (width leaves a lane wider than the figure, slower than the late-game
  drops, overlap hitbox), then a huge star. Catching the star or letting it leave ends
  the round; finishing with all 3 hearts adds +10 (on top of the star's +5 if caught).
  Dying at 0 hearts still ends immediately, with no star and no bonus. No coins (coins come from
  learning); record per profile in `leren-lezen:vangspel:<profielId>`. Start and end
  screens are pictures only (food ✓, meteor ✕, play button). Check:
  `node tests/vangspel.mjs <map>`.
- **Drum kit:** `DrumSoort` also has `tom` (green, pitched) and `crash` (orange, tilted,
  long). The snare is now drawn flat with wires underneath. Free play uses all five
  (`.drumstel--5`: cymbals and tom on top, snare and bass below; one row on low
  landscape screens). Ritme adds them by level: 1 bas+snare, 2 +bekken, 3 +tom
  (same `--5` sizing, 2×2 grid without an empty crash slot), 4–5 +crash. Kleuters
  only get levels 1–2. Check: `node tests/drumstel.mjs <map>`.
- **Kleuter counting has its own set:** `content/tellen/kernen/kleuter-tellen.ts`, 4 chapters
  "Tellen tot 4/6/8/10" with only hoeveelheid-naar-cijfer and cijfer-naar-hoeveelheid.
  Math screens get the list from `rekenKernen()` in `engine/leeftijdGrens.ts`; never use
  `REKEN_KERNEN` directly there. `aantalHoofdstukken` is now only used by the (hidden)
  booklets. Check: `node tests/kleuter-tellen.mjs <map>`.
- **Kleuter topic order:** Luisteren, then Ontdekken, then the rest.
- **Tekenen and Vrij spelen have no profile menu or coin counter** (kids tapped them by
  accident). Tekenen: the back button is the first button in the tool bar
  (`.teken-terug`), the sheet fills the screen; on low landscape screens the tools sit in
  3 columns to the right. Vrij spelen: back button plus the two instrument buttons
  (right-aligned on narrow screens), the instrument fills the rest
  (`.muziek-vrij-scherm`).
- **Vangspel difficulty:** besides speed, frequency and meteor share, meteors grow
  (up to 1.8x after about 90 s); each falling thing keeps its own size for collisions.
- **voet.svg** is now a skin-coloured footprint (Fluent "Footprints", one foot, recoloured);
  the old side-view Fluent foot looked like a blob. teen.svg embeds this new voet.svg
  (`inbed(..., bron=WOORDEN)` in teken-woorden.py) with a red circle round the big toe.
- **Vangspel themes:** what falls depends on `huidigThema()`: `THEMA_DINGEN` in
  VangScreen.ts lists per background the good things and one hazard (onder water:
  pufferfish, herfst: wolf, boerderij: fox, zee: jellyfish, kasteel: dragon, winter: polar
  bear, kermis: ghost, trein: lightning bolt (`bliksem.svg`, not the thundercloud, and not
  red-tinted — the bolt is already the hazard), bouw: fire; ruimte and dino keep the meteor).
  Hazards with `rood: true` get `.vang-ding--rood` (grayscale, then sepia + hue-rotate to
  one strong red, plus a red glow). Don't use red things as good items (that's why herfst
  has no maple leaf). Difficulty ramps quickly: speed doubles in ~20 s (max 2.6x), the
  interval drops by 0.025 s per second, hazard share rises 0.008/s (cap 0.42, kleuter 0.28),
  hazards grow to 1.8x in 45 s. Check: `node tests/vangspel-thema.mjs <map>`.
- **Android navigation bar is hidden** (MainActivity `verbergNavigatieknoppen()`,
  immersive with BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE, re-applied on focus): kids kept
  tapping back/home/recents. A swipe up from the bottom edge shows it briefly.
- **Stegosaurus avatar:** `avatar-stegosaurus.svg` is our own drawing (Fluent has none),
  listed after 'dino' in AVATAR_ICONEN (so it costs coins like the others).
- **Bouwplaats extras:** `skyline('ver' | 'dichtbij')` in bouw.ts draws two rows of city
  buildings (fixed seed, windows, a few antennas/water towers) behind the site; the far
  row is paler and slightly blurred. A Fluent helicopter (`woorden/helikopter.svg`, faces
  left, mirrored when flying right) crosses the sky in 34 s, first after 3-8 s, then every
  ~55-75 s, with a gentle bob. Its timer is cleared in `vernietig`.
- **Treinreis trains:** wagon kinds personen, post (orange, envelope), stenen (rock
  hopper), tank (gas tank) and container (coloured, with a Fluent picture of the cargo via
  `<image href>`). `vulReizigers`: post behind the loc, 2-3 passenger cars, sometimes a
  container; `vulGoederen`: 5-8 of stenen/tank/container. `rijd(vul, klaar, stop)` moves the
  train with rAF (no Web Animation any more): with `stop = 'station'` it brakes so the
  passenger cars stand in front of the visible part of the (wider, partly off-screen)
  station and toots; with `'sein'` it waits before the red signal, which then turns green.
  While stopped `.trein-trein--staat` pauses wheels and rocking. Check: `node tests/treinen.mjs <map>`.
- **Winter extras:** an ice pool (`.winter-ijs`, own SVG) front right, partly off-screen;
  robins (own SVG `VOGEL`, flapping wing via `--flap`) cross the sky in small groups; a
  weather cycle `WEERCYCLUS` (clear 20 s, light snow 15 s with a slightly darker sky, clear
  20 s, storm 15 s) sets `weer-licht` / `weer-storm` on the decor. Storm: only the
  diagonal storm layer (320 elongated flakes + a white haze), sky 78% dark; flying birds
  dart into the nearest pine and a few more come racing in to shelter. Check:
  `node tests/winterweer.mjs <map>` (takes ~65 s, real time).
- **Dino-wei T-rex and stegosaurus:** the T-rex is a new own drawing (blue, friendly, big
  head) kept twice: `TREX` in `achtergrond/dino-tekening.ts` (inline, so `.tr-kop`, `.tr-oog`,
  `.tr-arm`, `.tr-lach`/`.tr-brul` can animate) and `trex-eigen.svg` (shop preview); change
  both together. It blinks, and opens its mouth on `juich`. `STEGO` (from the stegosaurus
  avatar, leg pairs `st-poot--a/--b`) walks slowly back and forth in a rAF loop over the front
  hill (height sampled from the path, behind the big dinos in the DOM), sniffs now and then,
  turns at the ends (left end always past the T-rex, right end before the triceratops).
  When it passes under the T-rex's head the T-rex hops, looks down, says "!" then "RAWR!"
  (class `verrast`, 2.8 s, once per pass and at most every 8 s); the stegosaurus wags its
  tail. Reduced motion: it stands still. Timers and rAF are cleared in `vernietig`.
- **Boerderij polder:** the rolling hills are replaced by a flat Dutch polder
  (`.boerderij-polder`, height `--land: 38vh`). Fields, ditches, sand road and the road
  bridge are one stretched SVG built in `maakPolder()` (viewBox 1000×300): every field edge
  and the long ditch run to one vanishing point (`xOp`), so they widen towards the front.
  Everything on top (tree row, village, windmill, barn, wheat, reeds, footbridge, tractor
  road) is positioned in % of the polder height, matching the SVG's y/300; no `zetOpPad`
  any more. The windmill is a classic stellingmolen (brick base, gallery, thatched octagonal
  body, lattice sails with white cloth turning anticlockwise). Wheat = rows of a repeating
  ear image (`AAR`) that sway with `skewX`; ditches glint (`.polder-glans`). Where the long
  ditch passes under the road there is a small brick bridge with white railings.

- **Savanne** (`achtergrond/savanne.ts`, `styles/achtergrond-savanne.css`, all own
  drawings; Fluent only has a lion head): acacia right, three lions under it (king with
  mane, lioness, cub; tail flick, blinking, yawning `gaapt`), a waterhole left. `bezoek`
  picks a random group (elephant family 45%, 3-5 gnoes 30%, 2-4 Thomson's gazelles 25%;
  wrapper `.savanne-dier.savanne-<soort>`, legs `.dier__poot--a/b` with per-species
  `--stap`): they walk in from the left, drink on the far bank (`drinkt`; gnoes and gazelles
  bend `.dier__nek` and counter-tilt `.dier__kop`, looking up now and then) and walk back;
  only one group at a time (`bezoekBezig`). Separately a crocodile (`krokodil()`, every
  ~20-45 s) rises to its eyes in the water (clipped by `overflow: hidden`, ripple ring),
  blinks and sinks again. Day cycle `DAGCYCLUS`
  sets `data-tijd`: avond 20 s (big orange sun sinks behind the table mountains, the tree
  turns into a silhouette, a bird flock passes), nacht 15 s (stars, moon, fireflies, lions
  sleep with zzz), dag 25 s. Ground parts carry `.savanne-f` (colour filter per time of
  day); zzz, roar waves and water drops stay outside it. `savanne--begin` skips the first
  transitions so it starts mid-sunset. `juich`: the king roars, the cub jumps; `feest`: the
  elephants spray water (or a visit starts) plus a flock. Check: `node tests/savanne.mjs <map>`
  (~65 s, real time).
- **Lang/kort** (`games/kleuter/vergelijken.ts`): the same object drawn at 360 and 150 px,
  chosen from `LANGE_DINGEN` (pencil, rope, snake, ladder).
- **Shop during an activity:** the coin counter `push`es the shop, which `unmount`s the
  activity screen; `pop` mounts the same instance again. Activity screens (Oefening,
  RekenOefening, Ronde, Luisteren) clean up the question on unmount, so on a re-mount they
  rebuild it (`onderbroken`: same question again, or the next one if it was already
  answered; the skip button is re-attached). Geheugen keeps its board (no 3D) and only
  re-plans a pending step (`wacht`). Any new activity screen with the top-right bar must
  do the same. Check: `node tests/winkel-tussendoor.mjs <map>`.
- **Kasteel redesign:** the castle is `kasteel-eigen.svg`, generated by
  `bronbestanden/teken-kasteel.py` (pastel pink towers, cone roofs in pink/purple/blue/yellow
  with flags, light-blue arched door); it is also the shop picture. New parts live in
  `styles/achtergrond-kasteel.css` (the older kasteel CSS is still in `achtergrond.css`):
  a full-width rainbow (`kasteel-boog`, 7 arcs with `pathLength=1`) that every day flows in
  from one side via `stroke-dashoffset` 1 -> 0, stays, and flows out at the other side (-> -1),
  sometimes mirrored (`kasteel-boog--andersom`); three white doves (`kasteel-duif`) that peck
  (`pikt`, random dove from JS) and flutter up on `juich`; a flower patch in the middle
  (`kasteel-perk`: roses, hydrangeas, yellow flowers) with three butterflies flying loops
  (hidden at night). The day filter on `.kasteel-heuvel` is toned down so the pink castle
  does not turn white.
- **Treinreis Alps and eagle:** behind the hills sits an own-drawn Alpine range (`ALPEN` in
  `trein.ts`, built by `bergketen()` from two ridge point lists `VERRE_KAM`/`NABIJE_KAM`:
  a few broad massifs with shoulders and notches, slightly rounded corners, snow above a
  jagged snow line clipped to the mountain, a shaded right face per summit, and a haze over
  the far range's foot). `.trein-alpen` uses `xMidYMax slice` with `height: max(26vh, 18vw)`,
  so phones show the middle and wide screens the whole range; its foot (16vh) hides behind
  the back hill. Rarely a Fluent eagle (`arend.svg`) glides high across (`.trein-arend`,
  `zwem-over` at ~45 px/s, 16-36 s, slow soar/tilt and an occasional wing beat): first after
  20-40 s, then 60-120 s after the previous one is gone, alternating direction; not with
  `prefers-reduced-motion`.
- **Boerderij day/night and sleeping animals:** `DAGCYCLUS` in `boerderij.ts` sets
  `data-tijd` (dag 50 s, schemer 25 s, nacht 35 s, ochtend 25 s; starts at dag). Everything
  is CSS transitions of ~20-34 s: sky layers `.boerderij-lucht--schemer/--ochtend/--nacht`,
  the sun sinks behind the polder (`.boerderij-zonbaan`), stars twinkle, a moon (own SVG)
  rises on the left, and land parts with `.boerderij-f` (polder, fence, animal bodies) get a
  filter per time of day. Lit windows live in a second, unfiltered `.boerderij-lichten`
  polder layer with the same positions (mill, barn, village). Every animal is a
  `.boer-dier--slaper` (`maakDier`/`maakSlaper`): by day the sheep and pig nap every 25-60 s
  and the cow and rooster every 45-95 s, for 10-18 s (`.slaapt`: body sinks, head tilts
  towards the side it faces via `--kantel`, slow breathing, `.boer-zzz` (smaller for chicks),
  closed eyes = `.boer-oog`, made by `dichtOog(x, y, faceColour, rx, ry)`: an SVG in the
  Fluent 32×32 viewBox inside the same `.boer-dier__lijf` wrapper so mirroring follows; eye
  centres: sheep 5.43,8.83, pig 7.55,16.5, cow 7.11,9.27, rooster 6.54,7.53, chick
  9.47,10.5). At night everyone falls asleep within seconds and usually sleeps till dawn.
  Chicks only sleep at night: at `nacht` they hop over to the rooster (`.loopt` hop
  animation + `.bij-kip`, a 4.6 s `left` transition to spots computed from `--haan-x`/
  `--haan-b`), sleep there all night, and in the morning wake and walk back mirrored (own
  `loopTimer`, so `juich` can't cancel the walk). Animals wake with a stretch-hop (`.rekt`);
  `juich`/`feest` wake them at once (chicks hop and stay by the rooster until morning).
  Reduced motion: always day, no naps. Check with Playwright `page.clock` (pause, `runFor`
  into the night) but wait real seconds, since CSS transitions run in real time.
- **Music levels:** Speel na and Ritme have 5 levels (`AANTAL_NIVEAUS`): 2-4, 4-6, 6-8, 8-10,
  10-12. Level 1 uses a fixed `reeks` over the 10 questions (2,2,2,3,3,3,3,3,4,4; ritme with
  bass + snare). Ritme level 2 adds bekken, level 3 tom, levels 4–5 crash.
  `niveausVoorGroep()` gives kleuters only levels 1 and 2 (2-4 and 4-6), so no tom or crash.
- **Dino-wei scenery:** all own drawings. `achtergrond/dino-landschap.ts` holds `VERTE`
  (`.dino-verte`, viewBox 2000x300 `xMidYMax slice`, bottom 13vh: hazy far mountains with an
  extinct flat-topped volcano, two seeded jungle rows with tree-fern and araucaria
  silhouettes, warm haze layers), `HEUVELS` (gradient hills with grass tufts and a pond with
  a slow `dn-glinster` shimmer; the paths the volcano, trees and stegosaurus stand on are
  found by class `.dn-heuvel--achter/--midden/--voor`, not by order), `varenPol(seed)`,
  `paardenstaarten(seed)` and `STEEN`. `dino-tekening.ts` adds `PTERO`, `BRACHIO` and `NEST`.
  Sky is a warm gradient with a soft golden glow round the sun (`.dino-zonlicht`). A pale
  brachiosaurus stands far left behind the tree ferns; its `.br-nek` looks around and dips
  to graze (CSS, 26 s loop). Volcano smoke is 4 soft puffs (7.6 s). Ferns sit in the bottom
  corners and in front of the stegosaurus, horsetails at the pond banks, a nest with eggs
  left of the triceratops (in front of the stegosaurus): eggs wobble now and then, all
  wobble on `juich` (`wiebelt`), and on `feest` a baby dino peeks out of the middle egg
  (`komt-uit`, 5.2 s). A pteranodon (`.dino-ptero` in `.dino-lucht`, `zwem-over`, ~50 px/s,
  16-34 s, gentle bob, two slow wing beats every 10 s) glides high across: first after
  10-25 s, then 45-90 s after the previous one has gone, alternating direction; not with
  `prefers-reduced-motion`. The T-rex's roar bubble says "RAWR!".
- **Kermis scenery:** own drawings in `achtergrond/kermis-tekening.ts`. `VERTE`
  (`.kermis-verte`, viewBox 2000x300 `xMidYMax slice`, bottom 11vh, height
  `max(26vh, 15vw)`): a hazy far fair with a circus tent and a drop tower left (`.kv-valbak`
  rises slowly and drops, 18 s CSS loop) and a wooden rollercoaster right (`BAAN` points ->
  Catmull-Rom path `#kv-baan`). The coaster train is SMIL `animateMotion` (9 s,
  `begin="indefinite"`); `rijTrein()` calls `beginElement()` and sets `.rijdt` for
  `TREIN_MS` (8.8 s, so it is already off the right edge when it disappears; without `.rijdt`
  it is hidden, since it would otherwise sit at the drawing's origin). It rides every
  14-30 s and on `feest`. Sky: crescent moon (`MAAN`), three clouds lit pink from below
  (`WOLK`), two faint searchlights (`.kermis-zoeklicht`, `mix-blend-mode: screen`, 26 s
  sweep) and rarely a hot-air balloon (`LUCHTBALLON`, `zwem-over` ~30 px/s, first after
  15-30 s, then 50-100 s after the previous one, alternating direction). Ground (`grond()`):
  grass edge, a lit square with light pools under the attractions and seeded confetti.
  A Kop van Jut stands at the right edge (`.kermis-kop`, width `--kop-b`; the carousel's
  `right` is computed from it; hidden on phones <= 560 px): `slaKop('probeert')` every
  18-40 s (the puck gets halfway), on `juich` `slaKop('slaat')`: the mallet hits, the puck
  reaches the bell, the bell rings and a "DING!" bubble shows (`KOP_MS` 2.4 s = the CSS
  animations). Not with `prefers-reduced-motion`.
- **Onder water** (`achtergrond/onderwater.ts`, drawings in `achtergrond/onderwater-tekening.ts`,
  CSS in `styles/achtergrond-onderwater.css`; the shared `zwem-over` and `straal-glans`
  keyframes stay in `achtergrond.css`). Back to front: a shimmering surface band
  (`.ow-oppervlak`, repeating SVG lines sliding sideways), two hazy reef ridges (`RIF_VER`,
  `RIF_MIDDEN`, `preserveAspectRatio="none"`) with a haze gradient and distant coral/kelp
  silhouettes (`.ow-sil`, fixed aspect, feet hidden behind the middle ridge), the far-animal
  layer `.ow-verte`, six swaying light rays (`ow-straal`, rotate around the top, 12-18 s),
  26 plankton dots (`.ow-stip`, `--dx/--dy`), rising bubbles, two own jellyfish (`KWAL`,
  pulsing `.ow-hoed`, drifting from the seabed to the top in 52 s / 75 s), the swimmers,
  tall kelp (`kelp()`), sand with two sliding caustic layers (`.ow-kaustiek`), and the seabed:
  two `.ow-rifje` groups (rock `ROTS` + corals positioned in % of the group: brain coral,
  yellow branch coral, fan coral, pink branch coral, tube sponges), the anemone with the own
  clownfish (peeks out every 15 s via `.anemoon__gluur`, jumps on `juich`), sea star, anchor,
  Fluent shell, walking Fluent crab, own octopus (`OCTOPUS`: curling `.ow-arm`s, blinking,
  waves `.ow-arm--4` on `juich` via `.zwaait`) and a treasure chest (`SCHATKIST`: `.kiert`
  lifts the lid with a glint plus a bubble cloud, every 16-34 s and on `feest`). One
  scheduler sends one crossing at a time with 4 s rest: a Fluent fish (45 %), an own school
  of 18 fish in formation (`SCHOOLVIS`, wagging `.ow-staart`, 30 %) or the own sea turtle
  (`SCHILDPAD`, rowing `.ow-vin`s like the pteranodon, 30-38 s, 25 %); no school/turtle twice
  in a row. Separately, every 100-160 s a blurred manta or whale silhouette glides by far
  away (60-80 s). Crossings use `--van-x: -110%` / `calc(100vw + 10%)` (percent of the
  element itself, so big animals start fully off screen) and mirror via `.zwemmer__spiegel`.
  `feest`: turtle + school together, chest opens, bubbles at the octopus. Phones <= 560 px hide
  the shell, anchor, sea star, two kelps, two seaweeds and two silhouettes, and move the chest
  to the far left. `prefers-reduced-motion`: no timers, and `.decor-onderwater--stil` stops all
  CSS animations. The Fluent files `vis`, `vis-tropisch`, `kogelvis`, `schildpad`, `octopus`,
  `schelp`, `kwal` stay in `public/assets/achtergrond/` (the Vangspel uses them).
