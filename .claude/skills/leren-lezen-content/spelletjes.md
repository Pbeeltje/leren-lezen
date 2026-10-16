# Spelletjes: Vangspel, Oversteken, Tafeltennis, Dieren voeren (+ Geheugenspel, Tekenen)

Topic `spellen` (both groups, `SpellenKiesScreen`, Fluent joystick) opens
Vangspel, Oversteken, Tafeltennis, Dieren voeren, Geheugenspel, Tekenen and Records. Geheugenspel and
Tekenen: see [kleuter-onderwerpen.md](kleuter-onderwerpen.md). None of the games
pay coins (coins come from learning); records are per profile.

## Records (`ui/screens/RecordsScreen.ts`, trophy icon `icons/trofee.svg`)

- All records go through `engine/records.ts` (`haalRecord`/`zetRecord(spel, n)`, key
  `leren-lezen:<spel>:<profielId>`, `RecordSpel` = vangspel, oversteken, tafeltennis, voeren).
- The Records tile opens a grid: one card per game (Vangspel shows the profile figure),
  trophy + number; a 0 record is greyed out (`.record-kaart--leeg`).
- Tapping a card opens `RanglijstScreen`: every profile on the device
  (`haalRecord(spel, profielId)`), highest first, ties share a place, places 1–3 gold/
  silver/bronze, the active profile outlined, profiles without a record greyed at the bottom.
  The list scrolls when there are many profiles.
- Geheugenspel (pays coins, no score) and Tekenen have no record.
- A new game with a score: add it to `RecordSpel` and to `SPELLEN` in `RecordsScreen.ts`.

## Shared: start flash and trophy (`ui/components/spelFiguur.ts`, CSS in components.css)

- `flitsIn(figuur, ouder?)`: the own figure flashes white twice (filter switches, so real
  flashes) while popping from small to full size, with a white ring (`.figuur-ring`) and a
  two-note pling. The figure's own filter (tint, shadow) goes in `--figuur-filter` so it
  comes back. Used at every start (Vangspel, Oversteken, Tafeltennis match, Dieren voeren),
  and in Oversteken also after a hit and at each new level (on the `.ov-speler` wrapper,
  because the image itself blinks while invulnerable).
- During the flash (0.8 s, `flitstNog(figuur)`) the figure stands still: Oversteken ignores
  hops; Vangspel and Tafeltennis keep the finger/key target but only glide there after the
  flash. The pop uses the CSS `scale` property, so these figures are positioned with the
  `translate` property, not `transform: translate()`: with transform, `scale` shrank the
  whole position toward the corner and the figure seemed to fly in from the side.
- Winning: `houdBekerOmhoog(figuur, ouder)` puts a swaying Fluent trophy (`trofee.svg`) up
  next to the figure in the game (with a fanfare); `figuurMetBeker(html, klein?)` wraps a
  window figure so it holds the trophy up. Vangspel: when the round is played out (not on
  losing all hearts), trophy in the game for 1.5 s, then in the end window. Tafeltennis:
  trophy in the game when a match is won, small in the next "VS" window, big after all
  three opponents. Dieren voeren: see its section (the whole crowd holds a big cup).
  Oversteken has no winning end.
- Dev hooks to see the endings: `window.__vangEindeNa` (seconds before the big enemy),
  `window.__pongTegenSlaapt` (opponent stops aiming).

## Vangspel (`ui/screens/VangScreen.ts`)

- The tile and the player show the profile's own figure with `avatarFilter` for
  its tint. The figure stands at the bottom and follows the finger (or arrows/A/D;
  start with space or Enter; keyboard hint on laptops). A tap (or space / up / W)
  hops about half its height (~0.4 s, no double jump); the catch zone rises with it.
- Catching in a row scores 1, 2, 3 … (`reeks`, shown as ×N in the bar); a hit or a
  missed good item resets the streak. A normal star is +5. Hazards cost one of 3
  hearts (1.2 s blinking); missed food costs no heart.
- Difficulty ramps quickly: speed doubles in ~20 s (max 2.6×), the interval drops
  0.025 s per second, hazard share rises 0.008/s from 14% (kleuter 9%; cap 0.42,
  kleuter 0.28), a hazard always falls within the first 2 s, hazards grow to 1.8×
  in ~45 s (each thing keeps its own size for collisions).
- At 40 s (`EINDE_NA`) normal drops stop: one huge enemy falls (leaves a lane wider
  than the figure; hitting it takes **all** hearts at once), then a huge star worth
  10 (`EIND_STER`). Catching it or letting it fall ends the round; all 3 hearts
  left adds +10 (`HEEL_BONUS`). Dying ends immediately.
- **Themes:** `THEMA_DINGEN` per background gives the good things and one hazard
  (onder water: pufferfish, herfst: wolf, boerderij: fox, zee: jellyfish, kasteel:
  dragon, winter: polar bear, kermis: ghost, trein: lightning bolt, bouw: fire;
  ruimte and dino keep the meteor). `rood: true` hazards get `.vang-ding--rood`
  (grayscale → sepia + hue-rotate to one strong red, red glow). Never use red
  things as good items.
- Portrait only: on a sideways phone a "Draai je telefoon" overlay (`.vang-draai`)
  pauses the game; the `matchMedia` in `VangScreen.ts` must stay identical to that
  media query (it adds `pointer: coarse`).
- Record: `haalRecord('vangspel')`. Start/end screens are pictures only.
- Wide screens (laptop, landscape tablet; `min-aspect-ratio: 3/4`): `.vang-veld` is at most
  75dvh wide (always taller than wide), centred, with a rim and a tinted veil over the
  background at the sides in the theme's ping-pong table colours (`--pong-tafel`/`--pong-rand`,
  set on `.thema-* .vang-scherm`). All game logic uses the field's own width.
- Check: `node tests/vangspel.mjs <map>`, `node tests/vangspel-thema.mjs <map>`.

## Oversteken (`ui/screens/OversteekScreen.ts`, themes in `oversteek-themas.ts`)

Frogger: the profile figure hops from the bottom strip to the finish row (checkered
edge, theme decorations) through lanes seen from above. Tile icon: Fluent traffic light
(`icons/oversteken.svg`).
- **Units:** everything is in cells (`c` px, CSS var `--c` on `.ov-veld`): positions,
  speeds (cells/s), gaps. `maatVeld()` sizes cells from the height under the bar and at
  least 7 columns wide (max 15, then the field is centred). Resizing needs no rebuild.
- **Controls:** a tap is read relative to the figure (above = forward, the dominant axis
  wins, a tap on the figure = forward). Only the touch-down point counts; swiping does
  not steer (removed Oct 2026: tap and swipe together confused). Arrows/WASD. One hop is buffered
  during a hop (0.13 s). Three white arrows round the figure until the first hop.
- **Leaving mid-game:** `unmount` during `spel`/`tussen` with hearts left stores level
  (next level if already across), hearts and score in the module-level `lopendeSpellen`
  map per profile (memory only, gone when the app closes). Re-entering shows them in the
  bar behind the start window; start continues at the beginning of that level. Works on
  another background too: the challenge order is kept only for the same theme, else
  reshuffled. Game over or a fresh start clears it.
- **Lanes:** `start`, `weg` (hazards), `veilig` (middle strip), `water` (stand only on
  what floats, else a splash), `finish`. Hazard lanes per level: 3,3,4,4,5,5,6,6,7,7,8
  (kleuter 3,3,3,4,4,5,5,6), capped by screen height; from 5 lanes (or with water) split by
  a middle strip. From level 4 (kleuter 5) the upper half is the theme's `rivier` (every
  theme has one). From level 7 (kleuter 8), half the time the lower half is widened to 4–5
  road lanes (not with lavaland), otherwise those few lanes were trivial; the upper half
  gives up lanes (min 2) so the field doesn't grow and cells stay big on phones. From
  level 20 there is no middle `veilig` strip (a hit sends you back to the start). A `Rivier` is any ground you can only cross on what moves over it: water
  and lava, but also bouw `bouwput` (rijplaten, stalen balken), trein `ravijn` (platte
  wagons over two rails), ruimte `leegte` (planetoïden, zonnepanelen), zee `diepzee`
  (luchtbedden, zwembanden) and onderwater `trog` (luchtbellen, wrakhout). `val` picks the
  fall effect (`.ov-plons--stof` dust ring, `--ster` dotted gold, default splash). The
  drawn rafts are in `oversteek-vlotten.ts` (`VLOT_TEKENINGEN`, merged into
  `RAFT_TEKENING`; type `Vlot`). `Rivier.passagiers` (trein: farm animals) puts an animal
  (`.ov-passagier`, 0.8 cell, `PASSAGIER`) on half the rafts of ≥ 1.8 cells (`DIER_RUIMTE`,
  so two lava stones fit) from level 6 (kleuter 7), leaving ≥ 1 cell free on one side; its measured span is `Ding.gevaar` and
  touching it costs a heart (checked in the visible lane, like road hits). From level 15
  (`DIER_SPRINGT`) every 2–4.5 s per lane an animal may hop to the neighbouring wagon
  (`werkDierSprongen`, `Baan.sprongen`) if it is free and on screen: it wiggles 0.6 s
  (`.ov-passagier--klaar`), then flies 0.45 s in an arc, moved into the lane element; the hazard
  moves to the new wagon halfway through the flight. It lands on the near end. Each lane gets one `Soort` (shuffled, neighbours differ),
  directions alternate.
- **Difficulty (kept gentle on purpose; level 3 used to jump to 5 split lanes + water):**
  speed ×(1 + 0.08/level, max 2; kleuter ×0.72). Gaps are measured between the *visible*
  spans (`vul` uses `links`/`rechts`): 3.8 cells, −0.18/level, min 1.6 (kleuter 4.4,
  −0.15, min 2.4), plus up to 2.6 (2.8) random. Logs/floes shorten and water gaps widen per
  level since the water started. From level 6 (kleuter 7) one lane, from 9 two, become a
  `zeldzaam` lane: one fast thing at a time, announced 1.5 s ahead by a blinking crossing
  light (`.ov-lamp`) and red lane pulse (`.ov-baan--let-op`), with a two-note bell if the
  player is within 2 rows. Trains (`sporadisch: true`) always work that way. From level 4
  (kleuter 5) half the sporadic lanes start with their thing already 35–80% across
  (end of `bouwLevel`), so you can't just rush through before anything arrives.
  From level 8 (kleuter 9, `ingeklemd`) warned lanes sit between two busy road lanes
  (`tussenWegen`), never next to a safe strip or another warned lane; edge lanes then get
  only non-sporadic `vijanden` (on trein: shunting trains). Levels 1–2 get no sporadic
  `vijanden` at all (only trein has them), so the warned ones build up. From level 12 (kleuter 13,
  `laatWaarschuwen`) the lamp starts 1 s ahead instead of 1.5 s and `tussen` is ×0.75
  (min 1.2 / 2.2 s).
- **Uitdagingen (level 10 and 15, also kleuter):** each theme has 2–3 `uitdagingen` in
  `oversteek-themas.ts`. `start()` shuffles them per game; from level 10 the first is
  active, from 15 the first two (`UITDAGING_VANAF`). The banner of the level where one is
  added shows its `icoon` (a path, or a `Tekening` name like `'gnoe'`) and lasts 1 s longer.
  Mechanics (`wat`), each a `werk…` function in the screen:
  - `baan-aan` (trein stroom, kasteel drakenvuur, ruimte ufo-laser): one road lane without
    traffic; off 2.4–4.4 s, then 1.5 s lamp in its own colour (`.ov-lamp--stroom` blue,
    `--vuur` orange) + lane pulse, then the whole lane is deadly for 1.8 s (`.ov-aan--aan`).
    From level 15 two lanes, partnered via `aan.maat`: when one switches off, the other
    warns 0.3–1.2 s later, and the first waits until that one is done (they take turns).
    Stroom draws `stroomSvg()` anew each time: glowing rails plus lightning bolts between
    them in three frames (`.ov-vonk`) that flicker in turn.
  - `inslag` (bouw bakstenen, ruimte meteorieten, dino lavabommen, herfst kastanjes): every
    1.1–2.1 s a growing shadow on a cell (half of them near the player, never on start or
    finish), it lands after `VAL` (1.4 s) and hits if you are on that cell.
  - `overstekers` (onderwater pink jellyfish via a `kleur` filter, boerderij kippen, zee krabben):
    up to 3 hop from the finish row down. They step when the next lane is safe
    (`veiligVoorNpc`), or when their own road lane turns unsafe, and 6% of the time
    without looking. Traffic, water, rafts and `baan-aan` kill them too. Touching one costs a heart.
  - `kolos` (zee cruiseschip 2 lanes, bouw truck 2 lanes, savanne gnoe-trek 3 lanes):
    the `Soort` has `banen`. It is a sporadic thing in the lowest of N adjacent road lanes. The
    lanes above get `deelVan` (collision via `dingenVan`) and the same direction, and
    blink along (`mede`). A herd (`aantal`) is built as one row per lane (`maakKudde`).
  - `lavaland` (dino): all hazard lanes are lava with stones, but only on the level where it
    is added and then one level in three (random). Its `passagiers` (small animals: own drawings `raptor` and
    `pachy` from `oversteek-tekeningen.ts`, inline so legs/tail move, plus Fluent hagedis and
    schildpad; a picture path or a `Tekening` name) stand on half the rocks, walk back and forth to the rock's edges
    (`werkLopers`, `dier.v`, facing where they walk) and hop between rocks from the start
    (`Baan.dierLoopt`).
  - `lawine` (winter): after 5 s snow climbs from the bottom at 0.21 rows/s (kleuter 0.15).
    It kills when it passes the figure's centre, and you cannot hop back into it. After a
    death it pulls back below the respawn strip and waits 2.5 s.
  - `storm` (winter): gusts of 2.5–4 s blow you sideways at 0.5 cell/s (not on start or finish).
  - `donker` (onderwater diepzee, herfst `mist`): overlay over rows 1..N-2 with a light circle
    that follows the player (`--lx/--ly`); lamps sit above it (z 4).
  - `zinken` (savanne, boerderij, herfst, winter, kasteel, kermis): in about a third of the water
    lanes 60% of the rafts cycle wiggle 1.1 s → under 1.6 s (`onder`, doesn't carry) → up.
  - `keren` (kermis botsauto's; trein rangeren was dropped: a reversing train flashed away and back): 1–2 ordinary road lanes brake, stand still
    0.5 s (blinking `keren.svg` signs at both edges), and reverse. `dingen` is reversed,
    spans are mirrored and `.ov-ding--om` mirrors the picture.
  - `leegte` (kasteel: regenboogbruggen over a `sterrennacht` void): the upper half of the
    river lanes uses the challenge's own `Rivier`; the moat stays below. Every bridge there
    vanishes now and then (`duikKans` 1, same cycle as `zinken`, flickering and fading to
    almost nothing).
  Check: `node tests/oversteken-uitdagingen.mjs <map> <thema:wat+wat,...> [level] [BxH] [ms]
  [onsterfelijk]` (dev hooks `__oversteekUitdagingen` pick the order,
  `__oversteekOnsterfelijk` stops `sterf`).
- **Soort:** `maat` (slot width, see hitboxes), `kijkt` (Fluent faces left; `'r'` exceptions are
  mirrored the other way), `aantal` (herd/swarm, overlapping 0.82), `wagon`+`wagons`
  (train: head leads), `draai` (rocket/comet tilted 45°), `spin`, `dobber` (bob),
  `kleuren` (bumper cars, random hue). Own drawings that walk (`TEKENINGEN`, `teken: 'gnoe' | 'stegosaurus' | 'triceratops'`):
  inline SVG with `.dier__poot--a/--b` (legs alternate), `.dier__staart` (sways),
  `.dier__kop` (triceratops nods); the gnoe is `GNOE` exported from
  `achtergrond/savanne.ts`, the dinos are in `oversteek-tekeningen.ts` (copies of
  `woorden/stegosaurus.svg` and `achtergrond/triceratops.svg` with flat colours, because a
  gradient id breaks once its first copy leaves the screen). Dinos stamp slower
  (`ov-stamp`). `boomstam`, `schots` and `vlot` (plank raft) are SVG built at any length
  (`RAFT_TEKENING`); lava rocks are darkened. `teken: 'trein'` (`maakTrein`) is the
  background train from `achtergrond/trein.ts` (`TREIN_LOC` + `treinWagons(goederen, n)`:
  passenger cars + mail wagon, or stones/tanks/containers), one cell tall, mirrored as a
  whole when it runs left, wheels spin and the loc smokes (`.trein-rook`, `--loc`).
  Trein theme: long trains are sporadic with crossing lights, short shunting trains (loc +
  0–1 wagon) run as normal traffic.
- **No animals as rafts.** Kids took ducks/swans/hippos for hazards (every other animal
  hits you). Rafts are logs, plank rafts, lily pads, leaves, floes, lava rocks and (fair)
  swim rings (`zwemband`, random hue). The start window explains water on themes with a
  `rivier`: ✓ box = finish flag + the figure on a raft, ✕ box = one hazard + the figure
  sinking with a splash (`waterPlaatjes`). No popup during play. Hazards without a picture
  file (train, own dinos) are shown inline (`.ov-voorbeeld`).
- **Hits work like arcade Frogger** (after the well-known community fix): one point, the
  centre of the figure, against the real width of each thing. That width is measured
  from the pixels: `meetRand()` draws every picture of the theme (with its `draai`) on a
  64 px canvas once and keeps the first/last column with alpha > 60 (`RANDEN`; the gnoe
  drawings are measured from a data URL with their own aspect ratio, `tekeningSrc`). A picture is at most `HOOG_MAX` (1.15) cells tall, so a
  square Fluent picture is at most that wide; `maat` is only the slot. Long vehicles
  (`lang`: bus, truck, fire engine, ship, trains) are stretched to their full `maat`: drawn square and widened with `scaleX` (an SVG in an `<img>` ignores `object-fit: fill`). Each
  `Ding` keeps `links`/`rechts` (visible span from `x`, mirrored when needed). The lane
  checked is the one where the figure is visible: the old lane for the first half of a hop
  (Frogger has the same two-stage check). Water: the centre must be over a floater's
  visible span ± 0.1 cell. The figure drifts with its lane, also during a hop (from the
  lane it hopped from), so hopping along a raft or to the next row keeps you on it. At the
  field edge the figure is held back (0.5 cell) instead of drowning; it falls in only when
  the raft slides out from under it (a phone field is just 7 cells wide; instant edge
  deaths made raft rows nearly impossible). Water lanes move 0.7–1.25 × the speed factor
  (max 3). Rafts of `aantal` floaters (rings, lily pads, rocks, leaves) get as many
  pieces as fit the level's log length (`rek`), so every theme's water is equally hard;
  `aantal` on a floater only marks it as a group.
  `node tests/oversteken-botsing.mjs <map> [thema,..] [level]` draws the spans (red) and
  the player's point (blue), via dev-only `data-links`/`data-rechts`.
- One heart per hit, 1 s animation, then back to the last safe strip below, 1.3 s
  invulnerable. 0 hearts = end window (score, level reached, record).
- **Points:** +1 per new row in a level, +10 at the finish (fanfare, banner with the next
  level number, 2 s), +5 for the one star per level (on a road lane or the middle strip).
  From level 10, every other level (10, 12, 14, …; `HARTJE_VANAF`) also has a heart
  (`.ov-hartje`, red glow; on another row than the star if possible) that gives back one
  life, or +5 when all three hearts are still there.
  Forward hops play a rising xylophone note toward the finish.
- Traffic keeps running behind the start and end windows. Portrait only on phones (same
  `.vang-draai` as Vangspel). Reuses `.vang-balk` (wraps to two rows on narrow phones,
  the field starts below it), `.vang-venster*`, `.vang-plop`. CSS: `styles/oversteken.css`,
  lane grounds `.ov-grond--<name>` per theme. Record: `haalRecord('oversteken')`.
- New pictures in `public/assets/oversteken/` (Fluent); existing `woorden/`, `achtergrond/`
  pictures are reused where identical.
- Check: `node tests/oversteken.mjs <map> [thema,thema] [level] [BxH]` (screenshots,
  broken images) and `node tests/oversteken-bot.mjs <map> [thema] [tot] [BxH] [start]`
  (a bot plays via the DOM; screenshots of water, hit, banner, end). Dev hook
  `window.__oversteekLevel` starts at a higher level.

## Tafeltennis (`ui/screens/TafeltennisScreen.ts`)

Pong, Fluent ping pong icon. Your figure + red bat at the bottom (finger/mouse x,
arrows/A/D), three random avatars (random tint) at the top, one after another,
getting better. In landscape the table uses the full width.
- The opponent plays fair: it only sees the ball, looks every `kijkElke` s and
  guesses the landing spot with an error that shrinks as the ball nears (`ruis`),
  grows per wall bounce still to come (`stuiterFout`; level 1 ignores bounces) and
  with ball speed (`snelheidsFout`); a per-ball `neiging` keeps the error on one
  side. Its bat has weight (`topsnelheid`, `versnelling`) and can overshoot. Tuned
  to return ~54% / 70% / 84%; a node simulation is in `tests/_tmp/pong-sim.mjs`.
- First to 3 wins. The score (top right, `tekenStand`) shows two rows of 3 hearts:
  the opponent's are blue, yours red; scoring knocks out one of theirs. Lose = retry the
  same opponent; beat all three = trophy + big fireworks, then three new ones.
  Ball +4.5% per hit (max 1.8×), bounce angle from the hit position (max 55°).
  Kleuter: ball 0.8×, opponents 0.85×.
- Windows are pictures only and reuse `.vang-venster`; the rotate overlay reuses
  `.vang-draai`. Table colour follows the background (`.thema-* .pong-tafel` sets
  `--pong-tafel`/`--pong-rand`).
- Record: opponents beaten in a row (`opRij`, carries over a trophy, a loss resets it);
  saved silently, shown only on the Records screen (the windows stay pictures only).
- Check: `node tests/tafeltennis.mjs <map> [mis-kans]`.

## Dieren voeren (`ui/screens/VoerScreen.ts`, carrot icon `icons/voeren.svg`)

Animals walk in from the right in front of any background, each with a Dutch
speech bubble ("Boe!", "Mèèèh!"). Drag food from the tray at the top onto an
animal; your figure (bottom left) throws it in an arc. Right = happy hop, +1,
heart, walks on left. Wrong = "Bah!" and the food reacts (`reactie`: monkey
throws it back and your figure shudders, frog/snake spit, elephant sprays it away,
dinos stamp it flat, hedgehog and shell animals bounce it, everyone else drops
it); the animal stands still 150 ms, then shudders while it turns and walks off a
bit slower (shell animals keep crawl speed). It moves to `kruipers` at once so the
next group doesn't wait. −1 heart; three wrong = end. Record per profile
(`haalRecord('voeren')`), no timer. **The record is also saved when you leave
mid-game** (`bewaarScore()` in `unmount` and on `visibilitychange` hidden, so also when
the app goes to the background); "Nieuw record!" compares with `recordBijStart`.
- **Winning at 15 stars (`DOEL`):** the 15th animal still hops, then `gewonnen()` stops
  everything and `toonFeest()` brings back every species you fed (`gevoerd`, muisje
  counts as muis) as a crowd right of your figure: rows (the biggest at the back, each
  row 0.45 size higher), popping in one by one with a note each, all hopping and
  facing the middle. A big Fluent trophy (`.voer-feest__beker`) rises above their heads
  with rotating rays behind the animals (`.voer-feest__stralen`, z-index below them, or
  the back row looks see-through), fanfare and big confetti. ~3 s later the end window,
  with the figure holding a cup (`figuurMetBeker`). `.voer-feest` has its own z-index and
  `.voer-scherm > .vang-venster` z-index 10, so the window sits on top. Dev hook
  `window.__voerDoel` sets a lower target.
- `DIEREN`: per animal `goed` (what it eats) and an explicit `fout` list (only those
  are used as wrong options). `kijkt` (left/right/front) mirrors to the walking
  direction. `schaal` 0.8–1.2 is stretched by `spreid()` (×1.75 around 1, min 0.4)
  so a mouse is small and an elephant big; a group that doesn't fit shrinks evenly
  (`maten`). `mond` sets where thrown food lands. `THEMA_DIEREN` favours animals
  that fit the background (75%). `water` animals (dolphin, shark, sea turtle,
  tropical fish) only come on zee/onderwater. `draai` rotates the body (the
  crocodile is drawn from above, turned 90°).
- The goat (`allesEter`) eats everything except live animals (`ALLES`): it always
  comes alone, its tray is 3 random foods, all right, and it says "Mjam!".
- The land turtle (schildpad) eats gras/blad; the seaweed eaters are the sea turtle,
  tropical fish (`visje`) and crab (crab throws wrong food back, `gooi`).
- Entrances (`komt`): loopt, hupt, springt (cat, tiger, fox, kangaroo), valt
  (monkeys drop, then `--wipt`), glijdt (penguin, seal), stampt (dinos shake the
  screen), rent (dog), zakt (sloth on a vine; spider on a thin thread via
  `[data-dier='spin']`), vliegt (bee, butterfly, parrot, owl; `--zweeft`), zwemt
  (water animals: like vliegt, lower and calmer), kruipt (snail, turtle: a third
  of a body per second; nobody waits for them, the tray comes once the rest has
  arrived), kronkelt (snake), graaft (mole rises out of the ground with
  clip-path, dirt clods `.voer-druppel--aarde`, sinks back to leave). Extras:
  `slaapt` (lion, sloth "Zzz…"), `spuit` (elephant fountain).
- Groups: 1 animal, from score 6 sometimes 2, groep 3 from 10 up to 3 (max 2 when
  width < 560). Animals in a group never share a good food and never stand next to
  their prey (`PROOI`/`lust`: cat/snake/owl–mouse, wolf–sheep/lamb, fox–chicken/hen,
  fish eaters–tropical fish). `SAMEN`:
  monkeys, bees, butterflies often come in 2–3 (only the first talks). From score
  4, 12% chance of a family (mouse + 4 babies `alleenFamilie`, monkey troupe,
  swarm).
- Hunters (`jager`: tiger, lion, T-rex, polar bear, wolf, fox, crocodile, shark): if a plant eater
  waits next to one for 4 s unfed, the hunter chases it off, no heart lost.
- Tray: the unique wanted foods topped up to 3 with things none of them eat. Food
  stays in the tray after a throw. Throws don't block; the target leaves the
  `wacht` state (`data-staat`) at once so it can't be hit twice. Drop target: each
  waiting animal's box plus a margin; overlaps go to the nearest centre. One chord
  (do-mi, + sol for three) when the tray appears.
- Pictures in `public/assets/voeren/` (Fluent dog, bone, meat, peanut, worm,
  sauropod, butterfly, chipmunk `eekhoorn`; own `zeewier.svg`, `bamboe.svg`, and
  `zeeschildpad.svg` = the Fluent turtle with its legs swapped for own flippers). Dragging shows a big white hand cursor
  (`.voer-sleept`) and a fading trail.
- Check: `node tests/voeren.mjs <map> [kleuter]` (stays under 15), `node tests/voeren-feest.mjs <map>`
  (plays to 15: crowd + end window, and leaving mid-game keeps the record); forced groups via dev hook
  `window.__voerGroepjes`: `node tests/voeren-dieren.mjs <map> [w] [h]`
  (`ALLEEN=n` runs the first n groups).
