# Muziek: xylophone, Speel na, Ritme, drum kit, instruments

## Sound

Synthesised in `engine/muziek.ts` with Web Audio (nothing recorded): xylophone =
three decaying sine partials; drums = falling sine thump plus noise. Respects
mute. The AudioContext starts lazily on the first tap
(`navigator.audioSession.type = 'playback'` on iOS, see [app.md](app.md)).

`games/muziek/xylofoon.ts`: tap plays a bar, a gliding finger plays each bar
once. Highlight/bounce classes are removed on `animationend` so a later class
change can't look like a new hit; a played bar flashes clearly (white rim, glow,
hop) so Speel na is easy to follow.

## Games

- **Vrij spelen** (`XylofoonScreen`): switches between the instrument and all five
  drums; drums sound only when tapped. No profile menu or coin counter: back button
  plus two instrument buttons, the instrument fills the rest (`.muziek-vrij-scherm`).
  It builds its instruments in `mount` so it survives a shop trip. Pays nothing.
- **Speel na:** level 1 uses only the five-note scale (`VIJFTONIG`); from level 2
  all 8 bars, and from 5 notes the start of a real song (`LIEDJES` in
  `muziekVragen.ts`: Kortjakje, Vader Jacob, In de maneschijn, Ode an die Freude,
  Mary had a little lamb, Jingle bells) with its note lengths. Each note is a dot
  in that bar's colour (`muziek-stippen--ritme`, `--drum` = `STAAF_KLEUREN`).
- **Ritme** (`games/muziek/muziekVragen.ts`): figures `ta`/`titi`; gaps KORT 0.24 /
  LANG 0.72. Shorter questions use `maakFiguren`; from 5 hits the beat rotates
  through `GROOVES` (a different real beat per question, only unlocked drums).
  There is no one-drum-at-a-time preview: the question plays only the pattern
  (instruction audio plays by itself on the first question; hits count after the
  playback). `ritmeKlopt()` checks the number of hits and classifies each of the
  child's gaps against their own shortest/longest gap, so tempo doesn't matter.
  Hitting the wrong drum is a mistake.
- A wrong answer replays the tune/beat. The maker functions (`maakSpeelNaVragen()`)
  hold their own counter, so each opening starts short again. Instruction audio
  only on the first question.

## Levels

`AANTAL_NIVEAUS` = 5: 2-4, 4-6, 6-8, 8-10, 10-12. Level 1 uses a fixed `reeks`
(2,2,2,3,3,3,3,3,4,4). Drums per level: 1 bas+snare, 2 +bekken, 3 +tom, 4–5 +crash.
`niveausVoorGroep()` gives kleuters only levels 1–2 (no tom or crash).

Coins: `muziekMunten(max)` — `MUNTEN_MUZIEK_GOED` 2 per correct copy and
`MUNTEN_MUZIEK_SET` 10 for the set of 10 (`RondeScreen`, 2 rounds of 5), times
`muziekMuntFactor` (×1 up to max 6, ×2 above 6, ×4 above 8), then `kleuterFactor`.
Replaying a set pays again.

## Drum kit

`DrumSoort`: bas, snare (flat with wires underneath), bekken, `tom` (green,
pitched), `crash` (orange, tilted, long). Free play uses all five (`.drumstel--5`:
cymbals and tom on top, snare and bass below; one row on low landscape screens).
Level 3 uses the same `--5` sizing as a 2×2 grid without an empty crash slot.
Check: `node tests/drumstel.mjs <map>`.

## Instruments (shop items): harp, fluit, keyboard, kikkerkoor

- `Instrument` / `INSTRUMENTEN` in `engine/muziek.ts`;
  `speelInstrument(instrument, toon, wanneer)`. Xylofoon is free; the others cost
  `INSTRUMENT_PRIJS` (200), `WinkelSoort` `instrument` (keys `instrument:<id>` in
  `gekocht`). Choice remembered per profile (`VoortgangData.instrument`, read via
  `huidigInstrument()` in `engine/winkel.ts`, falls back to xylofoon).
- Harp: Karplus-Strong (`snaarBuffer`, 3-tap, dark, 20% reverb), matched to
  `bronbestanden/harp.m4a`. Fluit: `speelSteel` (one voice, sine+triangle, short
  swell); old key `instrument:steelgitaar` counts as fluit. Keyboard: 2-operator FM
  (`speelKeyboard`). Banjo/gitaar were dropped.
- Kikkerkoor (`speelKikker`): one tap = one frog = one croak. A sawtooth an octave
  down is chopped by a pulse LFO (rattle, 21–47 Hz) through a "mouth" bandpass that
  opens and closes (k-wa-ak), plus a noise tick. `KWAKEN` gives each of the eight
  notes its own rattle, length and mouth (low do = big bullfrog). Look:
  `.xylofoon--kikkerkoor`; frog = `kikkerSvg()` in `games/muziek/kikker.ts` (flat
  colours, no gradients: a `url(#id)` into a display:none SVG draws nothing in
  Chrome), pond in `vijver.ts`. A croak inflates the throat sac (`.kk-keel`) and
  floats a note (`.kikker-noot`). The pond is a size container (`vijver`): under
  560px the frogs sit in two staggered rows and the frog is the tap target (columns
  get `pointer-events: none`). `kikker.svg` (shop icon) is `kikkerSvg(0, 0)`
  without eyelids and throat sac.
- Keyboard look: white keys with a coloured patch, decorative black keys via
  `[data-zwart]::after`; tapping a black key plays its white key.
- `maakXylofoon(tonen, opTik, instrument)` is the component for all: same buttons
  (`.xylofoon__staaf`), `zetInstrument()` switches the look (`.xylofoon--<id>`,
  CSS in screens.css), `speel(positie, wanneer)` plays. Strings keep
  `STAAF_KLEUREN`. Harp keys ~120px wide; frame `harp-kast.svg` (CSS
  `url("/assets/icons/harp-kast.svg")` — absolute, see CLAUDE.md). The fluit
  stands upright in Vrij spelen on a portrait screen.
- Picker: `ui/components/InstrumentKnoppen.ts` (`data-instrument`; not owned =
  grey + lock, tap opens `WinkelScreen(m, { soort: 'instrument', koop: id })`) plus
  the coin button `.muziek-winkel-knop`. Vrij spelen: top row next to Drumstel
  (labels from 1100px wide). Speel na: `.muziek-instrumenten` in the card (top
  right; a right column when ≤820px high); `maakSpeelNaVragen(niveau, naarWinkel)`.
- Icons `harp.svg`, `harp-kast.svg`, `fluit.svg`, `keyboard.svg`, `xylofoon.svg`,
  `kikker.svg` are our own drawings.
- Check: `node tests/instrumenten.mjs <map>`.
