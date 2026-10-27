# Muziek: xylophone, Speel na, Ritme, drum kit, instruments

## Sound

Synthesised in `engine/muziek.ts` with Web Audio (nothing recorded): xylophone =
three decaying sine partials; drums = falling sine thump plus noise. Respects
mute. The AudioContext starts lazily on the first tap
(`navigator.audioSession.type = 'playback'` on iOS, see [app.md](app.md)).

Everything goes through `uitgang(c)`, never `c.destination` directly. That is a
limiter (compressor at −3 dB, ratio 20) plus a soft clip above 0.8: single notes
stay as loud as before, and 20 harp notes at once stay under 0.96 instead of
hard-clipping. New sounds must use `uitgang` too. Melody voices also go through
`nieuweStem(c, 'instrument:toon', t)`: re-striking the same note fades out its
previous voice in about 15 ms, so fast repeats don't pile up. Different notes keep ringing, so
chords still work.

`games/muziek/xylofoon.ts`: tap plays a bar, a gliding finger plays each bar
once. The "last bar" is tracked **per `pointerId`**. With one shared variable,
two fingers resting on two bars overwrote each other on every touch jitter: 42 notes
instead of 2, the "ungodly noise" bug (Oct 2026). Highlight/bounce classes are removed on `animationend` so a later class
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

## Instruments (shop items): harp, fluit, keyboard, kikkerkoor, trompetten, klokken

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
- Trompetten (`speelTrompet`, an octave down): the timbre is fitted to a recording of real
  trumpets the owner supplied (Oct 27). `KOPERKLEUR` is the measured spectral envelope (Hz → dB:
  near-flat to 3 kHz with a bump at 1.9 kHz, then ~−20 dB/octave). `koperGolf()` builds a cached
  PeriodicWave per pitch from it. Two voices at ±5 cent run through a lowpass that opens in 40 ms
  (attack). The pitch scoops up from 0.96, the vibrato is ±10 cent at 5.3 Hz from 0.08 s, and
  there is a breath of noise and little reverb (0.12). Earlier versions (lowpass saw, then
  saw+square+tanh) sounded like a keyboard. To re-check, render offline with
  `node tests/trompet-klank.mjs <out.json>` (it swaps in OfflineAudioContext) and compare harmonics.
  Look: `games/muziek/trompet.ts`, `.xylofoon--trompet`.
  Eight long herald trumpets on parallel diagonal lines (bottom-left to top-right), each
  with a dark red flag whose round emblem has the note colour. Bell size per note (`--beker`,
  1.3 for low do down to 0.74 for high do); the layout insets bigger bells further. `legTrompetten()` computes
  the layout from the box size (ResizeObserver in `maakXylofoon`, plus on `zetInstrument`):
  angle `26° + 0.55·atan(h/w)`, lines spread across the box minus the short corner chords,
  bell tip just inside the top/right edge, tube runs out of the box bottom-left. It sets
  `--s` (strip width), `--hoek`, and per trumpet `--bx/--by` (bell tip) and `--tl`
  (length); each button IS the rotated strip, so taps and glides hit one trumpet. A press
  recoils the trumpet, squashes and stretches the bell, flaps the flag and blows waves in
  the note colour; the button's own `trompet-aan` glow is the longest animation, so its
  `animationend` clears `--aan`. Check: `node tests/trompetten.mjs <map>`.
- Klokken (`speelKlok`, at pitch): nine sine partials (hum 0.5, strike 1 plus a 1.0035
  twin for the shimmer, 2, 2.4, 3, 4.2, 5.4, 6.8), each with its own decay (low bells ring
  longer), plus a highpassed noise tick. Own reverb `klokGalm` (2 s convolver, darker, no
  feedback, so it can't build up) and at most `KLOK_MAX` = 5 bells ringing; the oldest fades in
  ~0.1 s. Measured: 16 bells struck fast peak at 0.82. Look: `games/muziek/klokken.ts`,
  `.xylofoon--klokken`. A wooden rack (finials, carved crest with rosette, brass rods, turned
  posts, scroll feet) built by `rekSvg()`; `legKlokken()` (ResizeObserver) picks 4 bells per
  rod (wide box) or 2 per rod (portrait phone), whichever gives bigger bells, and sets px vars
  per bell (`--kl/--kt/--kw/--kh`, bell width `--kb` times `--klok` per note). A strike swings
  the bell on its strap (damped, 1.6 s), the clapper lags behind, rings in the note colour
  radiate out; the button's `klok-aan` (1.7 s) is the longest. **Class names are `luiklok*`**:
  `.klok` already belongs to the clock game (`klok.css`) and its rules made the hidden bells
  show up on every instrument. Check: `node tests/klokken.mjs <map>`.
- Keyboard look: white keys with a coloured patch, decorative black keys via
  `[data-zwart]::after`; tapping a black key plays its white key.
- `maakXylofoon(tonen, opTik, instrument)` is the component for all: same buttons
  (`.xylofoon__staaf`), `zetInstrument()` switches the look (`.xylofoon--<id>`,
  CSS in screens.css), `speel(positie, wanneer)` plays. Strings keep
  `STAAF_KLEUREN`. Harp keys ~120px wide; frame `harp-kast.svg` (CSS
  `url("/assets/icons/harp-kast.svg")` — absolute, see CLAUDE.md). Size via
  `--harp-breedte`; in Vrij spelen `min(100cqw, 133cqh, 1100px)` of the card. That rule
  needs `.xylofoon.xylofoon--harp`: the Speel na rule for low landscape screens comes
  later and otherwise wins (harp was 233px wide on an 844×390 phone, Oct 2026). The fluit
  stands upright in Vrij spelen on a portrait screen.
- Picker: `ui/components/InstrumentKnoppen.ts` (`data-instrument`; not owned =
  grey + lock, tap opens `WinkelScreen(m, { soort: 'instrument', koop: id })`) plus
  the coin button `.muziek-winkel-knop`. Vrij spelen: top row next to Drumstel
  (labels from 1440px wide). Speel na: `.muziek-instrumenten` in the card (top
  right; a right column when ≤820px high, two columns on a landscape phone); `maakSpeelNaVragen(niveau, naarWinkel)`.
- Icons `harp.svg`, `harp-kast.svg`, `fluit.svg`, `keyboard.svg`, `xylofoon.svg`,
  `kikker.svg`, `trompet.svg`, `klokken.svg` are our own drawings.
- Check: `node tests/instrumenten.mjs <map>`.
