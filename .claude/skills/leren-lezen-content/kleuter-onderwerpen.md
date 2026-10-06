# Luisteren, Ontdekken, Schrijven and Tekenen

## Luisteren (non-readers' entry point)

Topic `luisteren`, no text on screen. Picking it opens
`LuisterHoofdstukkenScreen` (Luister & wijs) directly; the old chooser
(`LuisterenKiesScreen`) is gone because Geheugenspel lives under Spelletjes.
Not built on the kern/chapter machinery (no letters, no progression, no stars).
Pool: `engine/luisterenGenerator.ts` `woordenpool()` walks every reading
`woordenbank` minus `vereistTekst` words, keeping only words with a recording in
`bronbestanden/audio-manifest*.json`. Geheugenspel uses the whole pool, so a new
reading word joins it automatically. **Luister & wijs does not**: its chapters
(`content/luisteren/hoofdstukken.ts`) are hand-written word lists, so add a new
word there too. A word in a list that isn't in a reading bank (or is
`vereistTekst`, e.g. `hagel`) silently never appears, unless it is in
`ALLEEN_LUISTEREN` (same file): listen-only words that are too irregular to read
(parachute, skateboard, shampoo, diplodocus, tyrannosaurus, octopus, politieauto,
scooter, ufo, frisbee, pinguin, saxofoon, accordeon, banjo, xylofoon, microfoon). Those join the pool with picture
`woorden/<woord>.svg` once recorded. Chapters: Boerderij, Dierentuin, Nog meer
dieren, Eten, Mijn lijf, Kleren & spullen, Buiten, Speelgoed, Vervoer, Gereedschap,
Muziek, Dino's & draken (`dinos`).

**Luister & wijs** (`LuisterenScreen.ts`, `games/luisterKiezen.ts`): hear a word,
tap the matching picture from 3. Rounds of 5 (`RONDE_LENGTE`) with a
`Voortgangsbalk` and small fireworks; wrong answers always retry.

**Geheugenspel** (`GeheugenScreen.ts`, `games/geheugenSpel.ts`, opened from
Spelletjes): `genereerGeheugenbord()` picks words, 2 cards each. Flipping plays
the word; a mismatch flips back after ~900 ms with no penalty. Kleuters 4 pairs,
groep 3 `GeheugenScreen(m, 8)` (16 cards); boards >4 pairs get
`.geheugen-bord--groot` (4×4 portrait, 8×2 landscape, never scrolls).
Check: `node tests/geheugen-groep3.mjs <map>`.

Touch targets for this age are bigger (`.luister-plaatje` 160px,
`.geheugen-kaart` 100px vs. 96px `.keuze-knop--plaatje`) — match that for anything
aimed at kleuters.

## Ontdekken (kleuter concepts)

Topic `ontdekken`, `OntdekkenKiesScreen` (inspired by Squla, `onderzoek/squla.md`):
- **Groot of klein?** (`games/kleuter/vergelijken.ts`): groot/klein (same picture at
  100% and 42%), zwaar/licht (curated pairs, same size so size gives nothing away),
  lang/kort (same object at 360 and 150 px from `LANGE_DINGEN`: pencil, rope,
  snake, ladder).
- **Meer of minder?** (`games/kleuter/meerMinder.ts`): two groups ≤ 6, difference
  ≥ 2; "=" is correct ~15% of the time.
- **Kleuren & vormen** (`games/kleuter/kleurenVormen.ts`): 3×3 grid; the sample
  is a paint splat (colour, incl. paars/roze/zwart/bruin) or a white outline
  (shape, incl. a real crescent moon). Tap every match.

Each game is one `maakVraag(): RondeVraag`; `ui/screens/RondeScreen.ts` is the
shell (rounds of 5, progress bar, fireworks, coins, replay button). A new game =
one `maakVraag` plus a tile in `SPELLEN`. Instruction audio:
`instructies/vergelijk-*`, `meer-minder-*`, `zoek-kleur-*`, `zoek-vorm-*`.

## Schrijven (tracing)

`SchrijvenKiesScreen` uses the generic `SpelKiesScreen`. Games: Lijnen (kleuter),
Letters, Woordjes.

Letter shapes, `content/schrijven/letters.ts`: each letter is strokes in writing
order from `lijn()`/`boog()`, sampled every ~2 units, in school direction (o
starts at the top anticlockwise; b stem first). A one-point stroke is a dot to
tap. Coordinates: ascenders y=10, x-height y=40, baseline y=80, descenders ~105.
`woordFiguur()` lays out a word. `LIJNEN` are toddler paths in 200×120 with a
picture travelling along (bee to flower).

Tracing, `games/schrijven/overtrekken.ts`: progress only moves forward, to points
at most `VOORUIT_KIJKEN` ahead and within `tolerantie`; lifting keeps progress;
straying pauses; the ink follows the guide path so it always looks neat.

**Aan elkaar** (profile Schrift setting): Letters and Woordjes use
`content/schrijven/aanElkaar.ts` instead. Each letter is one kern stroke (Catmull-Rom
pieces through control points, corners between pieces where the pen reverses);
`woordFiguurAanElkaar()` generates the joins (Bézier; low exit from the baseline,
high exit after o b r v w), an aanhaal for a first non-round letter, and puts dots,
the t-bar and the x-cross after the whole word. Result is resampled every 2 units.
Cursive is harder, so its tracing area is bigger (screens.css, after the
overtrek rules): the card's wrapper takes the remaining height (`flex: 1`, max
760px) and the area fills it; landscape tablets put the hint beside it. Landscape
phones (≤500px high) keep the normal layout. Check across sizes: nothing may run
off the bottom.
Preview all shapes: `npx tsx tests/aan-elkaar-voorbeeld.mts <out.html>`.

Letters game: VLL letter order with a key word per letter ("de m van maan"),
own clip `schrijf-letter-<letter>`, the voice says the sound, not the name.

## Tekenen (under Spelletjes)

`TekenScreen.ts`: canvas with 9 colours, 2 thicknesses, eraser
(`destination-out`), undo and "nieuw blad"; lines are normalised points so undo
and resize redraw everything. No profile menu or coin counter (kids tapped them
by accident): the back button is the first tool (`.teken-terug`), the sheet fills
the screen; on low landscape screens the tools sit in 3 columns on the right.

Saved drawings: heart button (bewaar) and framed-picture button (mijn
tekeningen). `engine/tekeningenStore.ts`: 10 slots per profile, key
`leren-lezen:tekeningen:<profielId>`, stored as lines (coordinates 0..4095 as two
base64 chars), a few KB total. Saving a drawing opened from a slot overwrites it;
when full the list opens in "welke mag weg?" mode. Delete needs two taps (first
wiggles). "Nieuw blad" asks first (big ✕ / ✓) when there are unsaved lines. The
list window is appended to `document.body`. Check: `node tests/tekeningen.mjs <map>`.
