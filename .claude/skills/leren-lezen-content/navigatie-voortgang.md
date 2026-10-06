# Navigation, chapters, sessions, coins, profiles, groups

## Screen navigation

`engine/screenManager.ts`: a `Screen` is `{ mount(root), unmount() }`. Every
screen is a factory function `(manager: ScreenManager) => Screen`.

- `push(factory)` — unmounts current, keeps it on the stack, mounts new on top.
- `pop()` — unmounts current, remounts the previous stack entry (same instance
  — so e.g. `ChapterScreen`'s `tekenTegels()` closure is still alive and gets
  called again in its own `mount()` to refresh progress/star state).
- `replace(factory)` — **clears the whole stack**, mounts fresh. Used whenever
  a screen shouldn't be "back"-able to (profile/group switches from the menu,
  or after a toets finishes into `TestResultScreen`).

**A terug button must never call bare `pop()` on a screen that can also be
reached via `replace()`** — `pop()` silently no-ops once the stack is only 1
deep, so the button does nothing (real bug: "back button doesn't work" on
`KernOverviewScreen`). Use `manager.terugOfAnders(fallbackFactory)` on any
screen whose entry points aren't 100% push-only: it pops when there is
something below and otherwise `replace`s to the fallback. Already done for
`TopicSelectScreen` (→ `ProfileSelectScreen`) and
`KernOverviewScreen`/`RekenKernOverviewScreen` (→ `TopicSelectScreen` with the
saved group, or `GroepKiesScreen`). Before adding a new `replace()`, check
whether it lands on a screen whose terug button assumes it was pushed.

**Gotcha hit twice**: any component with its own event subscription
(`MuntenTeller`, `ProfielMenu`) must be *created fresh inside `mount()`* and
torn down in `unmount()` — never created once in the factory body and reused
across pop→push→mount, or the subscription dies after the first unmount (the
coin counter froze after leaving and returning to a screen).

**Shop during an activity:** the coin counter `push`es the shop, which
`unmount`s the activity screen; `pop` mounts the same instance again. Activity
screens (Oefening, RekenOefening, Ronde, Luisteren) clean up the question on
unmount, so on a re-mount they rebuild it (`onderbroken`: same question again,
or the next one if it was already answered; the skip button is re-attached).
Geheugen keeps its board (no 3D) and only re-plans a pending step (`wacht`).
Begrijpend lezen picks its question in the factory, not in `mount`, for the same
reason. **Any new activity screen with the top-right bar must do the same.**
Check: `node tests/winkel-tussendoor.mjs <map>`.

## Chapter structure: kern overview → chapter → oefening/toets

Each kern is a **chapter** with its own page (`ChapterScreen.ts` for reading,
`RekenChapterScreen.ts` for math), reached by tapping a row in
`KernOverviewScreen`/`RekenKernOverviewScreen`. Chapter lists are split into
pages and reopen at the last chosen chapter. A chapter page has a title row with
‹/› arrows that `manager.replace` to the adjacent chapter, then a 2×2 tile grid:
3 "Oefening N" tiles (`OEFENSESSIES_VOOR_TOETS` = 3) plus 1 "Toets" tile with a
star balk. Tiles get `.gedaan` once `voortgang.oefenSessies >= i` — purely
cosmetic.

**Nothing is ever locked.** Every oefening/toets tile is always clickable
(explicit correction after an earlier version gated the toets). Don't add a
`disabled` check tied to progress without an explicit new ask.

`RekenOefeningScreen`/`OefeningScreen` navigate back to the chapter via
`manager.replace((m) => ChapterScreen(m, kernIndex))` — in the terug button and
in `TestResultScreen`'s `onVerder` — so the chapter shows updated `.gedaan`
state immediately.

**Progress bar**: `ui/components/Voortgangsbalk.ts` — a cat walking toward a
bowl as `huidigeIndex` advances (a bare fraction isn't legible to a pre-reader).
The skip button sits in this row (`.voortgangsbalk .overslaan-knop`).
**Fireworks**: `three/particles.ts` `confetti.vuurwerk('klein' | 'groot')` from
`TestResultScreen` at ≥80% / 100% — brief, must not block the result screen.

## Two parallel subject systems

Reading and math are **not** one generic engine — structurally identical but
independently implemented, on purpose. If you add a third subject, decide
explicitly whether to generalize `OefeningScreen` rather than copying again.

| | Reading (`lezen`) | Math (`tellen`) |
|---|---|---|
| Content types | `content/types.ts` | `content/tellen/types.ts` |
| Content data | `content/lezen/kernen/*.ts` | `content/tellen/kernen/*.ts` |
| Session generator | `engine/oefeningGenerator.ts` | `engine/rekenenGenerator.ts` |
| Exercise runner screen | `ui/screens/OefeningScreen.ts` | `ui/screens/RekenOefeningScreen.ts` |
| Overview screen | `ui/screens/KernOverviewScreen.ts` | `ui/screens/RekenKernOverviewScreen.ts` |
| Chapter screen | `ui/screens/ChapterScreen.ts` | `ui/screens/RekenChapterScreen.ts` |
| Game renderers | `games/plaatjeWoordKeuze.ts` etc. | `games/hoeveelheidNaarCijfer.ts` etc. |

Shared: `TestResultScreen.ts` (takes an `onVerder(manager)` callback),
`engine/rewards.ts`, `engine/progressStore.ts` (`markeerKernGestart`/
`markeerKernVoltooid`/`haalKernVoortgang`, keyed by kern id — keep the prefix
convention, math ids start with `reken-`), and the UI bits (`TopRechtsBalk`,
`TerugKnop`, `FeedbackOverlay`, `ProgressStars`).

## Session generation (both subjects)

`oefenen`: a handful of items from the kern's pool, random exercise type each,
retry allowed (`herkansingToegestaan: true`). `toets`: reading uses the whole
`woordenbank` once each; math a fixed `TOETS_AANTAL = 10`. No retry; 0–3
`sterren` from the fraction correct, ends in `TestResultScreen`.

A **skip button** (`.overslaan-knop`) is on every exercise screen: counts as
wrong but always advances. A `klaarMetDeze` guard prevents double-advancing if
skip races the exercise's own `afgerond` callback.

## Coins (`engine/rewards.ts`)

Repeat tiers, identical in `OefeningScreen` and `RekenOefeningScreen`. The flag
`herhaling` is captured once at screen entry (before anything is written).
Oefening: `herhaling` = this Oefening 1/2/3 is in `KernVoortgang.oefeningenAf`
(added by `verhoogOefenSessies(kernId, nummer)` when a session is played to the
end). Toets: `herhaling` = `sterren === 3` before. Old saves without
`oefeningenAf` get `[]` in `leesRuw()`.
- Oefening: `MUNTEN_OEFENING_GOED` 2 per correct, `MUNTEN_OEFENING_SET` 5 at the
  end (paid right after `manager.pop()` so the chapter's counter pulses).
- Toets: `MUNTEN_TOETS_GOED` 2 per correct; end amount `toetsEindMunten()`:
  `MUNTEN_TOETS_VOLDOENDE` 10 if ≥ half correct, `MUNTEN_TOETS_PERFECT` 20 if
  perfect, plus `MUNTEN_TOETS_EERSTE_PERFECT` 50 the first time. Shown as
  `muntenDitKeer`.
- Repeat (groep 3, `lesMunten`): half of everything, rounded up.
- Kleuter: every amount ×1.5 rounded up (`kleuterFactor`), never halved, but the
  perfect bonus and first-perfect extra are once per toets.
- An `isAfgerond` guard in `afronden()` keeps a shop visit from paying twice.

Other activities, no repeat discount, all through `kleuterFactor`:
- Luisteren, Ontdekken, Schrijven: 2 per correct plus `MUNTEN_RONDE_SET` 5.
- Geheugenspel: `MUNTEN_GEHEUGEN_PAAR` 2 per pair (in `paarGevonden`), plus
  `MUNTEN_GEHEUGEN_BORD` 10 per board.
- Speel na / Ritme: see [muziek.md](muziek.md).
- Begrijpend lezen: `MUNTEN_BEGRIJPEND` 50 once per correct question.
- Leesboekjes: flat `MUNTEN_OEFENING_GOED * 3` at the end.
- Games (Vangspel, Tafeltennis, Dieren voeren): no coins.

Wrong answers pay nothing. The coin counter pulses live.

## Profiles ("wie speelt er?")

`engine/profielStore.ts`. Every localStorage-backed state is keyed per profile
(`leren-lezen:voortgang:<profielId>`, also `leren-lezen:tekeningen:<id>`,
`leren-lezen:vangspel:<id>`, `leren-lezen:voeren:<id>`).
`haalActiefProfielId()` reads `sessionStorage` (survives a reload, not a fresh
launch). New persisted state: key it per profile the same way; all
`leren-lezen:` keys are mirrored to Preferences in the app (see [app.md](app.md)).
Without any profile the app opens straight on "Maak je profiel" (no back button).
Avatar/colour picker rules: [winkel-profiel.md](winkel-profiel.md).

## Groups instead of ages

Children pick a group, not an age (`Groep = 'kleuter' | 'groep3'` in
content/types.ts, `GroepKiesScreen`, "In welke groep zit jij?"). Kleuterschool =
everything for ages 3–5 (luisteren, ontdekken, Lijnen, own kleuter reading and
counting sets, calmer music); groep 3 = what age 6 had. Filters: `Topic.groepen`,
`SpelKeuze.groepen`; `engine/leeftijdGrens.ts` (`isZes()`, `leesKernen()`,
`rekenKernen()`). Storage: `laatstGekozenGroep`; old `laatstGekozenLeeftijd` is
migrated on read (≥6 → groep3), so test fixtures with `laatstGekozenLeeftijd: 6`
still work. Icons `groep-kleuter.svg`, `groep-groep3.svg`.
Kleuter topic order (`topicsVoorGroep('kleuter')`): Luisteren, Ontdekken, then the rest.
