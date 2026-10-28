# Backgrounds (`src/achtergrond/`)

## General

- Every theme is a DOM `Decor` (`{element, juich, feest?, vernietig?}`).
  `styles/achtergrond.css` holds only what is shared: the layer, pausing, the
  profile-menu picker, rainbow, shooting star (`.valster`), `zwem-over`,
  `straal-glans` and keyframes used by several themes or screens (`wiebel`, `adem`,
  `juich-sprong`, `golf`, `pluim`, ...; keyframe names are global and unique). Every
  theme has its own `styles/achtergrond-<id>.css` (imported in main.ts; not ruimte's
  three.js sky) and pictures prefixed `<id>-` in `public/assets/achtergrond/`.
- **Shared helpers** (`hulp.ts`): `maakTimers()` holds all timers of a decor
  (`later(fn, ms)` loose, `zet(naam, fn, ms)` named and replacing — a scheduler that
  replans itself — `wis(naam)`, `stop()`; after `stop` nothing new starts), so
  `vernietig` is `timers.stop()` plus any rAF/visibility cleanup. `kringloop(timers,
  STAPPEN, opStap, eersteStaatAl?)` runs a fixed `[stand, ms][]` cycle (day/night in
  kasteel, boerderij, savanne; weather in zee, winter). `bewegingStil()` is the
  reduced-motion check. SVG text helpers in `tekenhulp.ts`: `pt`, `gladPad`
  (Catmull-Rom), `vasteToeval(zaad)` (fixed "random" so a drawing never changes;
  kermis-tekening keeps its own `zaad` generator, its drawing was made with it).
- **Adding a theme:** id in `ThemaId`, entries in `THEMAS` and `MAKERS`. Shop and
  profile menu pick it up automatically (200 coins). Fluent animals face left:
  mirror with `.gespiegeld`. With `bewegingStil()` don't start JS schedulers. Run
  every timer through `maakTimers()`; cancel rAF in `vernietig`. Also add a Vangspel entry in
  `THEMA_DINGEN`, an Oversteken entry in `OVERSTEEK_THEMAS` (required, with lane
  grounds in `oversteken.css`) and optionally `THEMA_DIEREN` (Dieren voeren) and a table colour
  (`.thema-<id> .pong-tafel`).
- Hidden backgrounds pause: an invisible canvas (ruimte) is stopped and animations
  pause when the app is in the background.
- View one: `node tests/achtergronden.mjs <map> <id>` (rest/juich/feest on phone,
  pc and landscape). Day/night cycles: Playwright `page.clock` (pause, `runFor`)
  but wait real seconds, CSS transitions run in real time.
- Phones: the menu cards cover most of the scene; that's accepted (tablets show it).
- Several themes use `zwem-over` crossings with `--van-x: -110%` /
  `calc(100vw + 10%)` (percent of the element, so big animals start off screen).

## Per theme

- **zee:** the boat rides the higher of two waves (`drijf` rAF loop). Rainbow
  (`maakRegenboog` in hulp.ts) 2.2 s after the storm. The whale
  (`kortAan(walvis,'duikt-op')`) appears 3.5 s after the boat is off screen.
- **ruimte** (`ruimte.ts`): moon surface bottom right; one scheduler for shooting
  stars (`.valster`, random position) and the slow diagonal `.raket` (22%), never
  two at once, ≥ 5 s rest; `juich` only fires when the sky is free.
  In `three/ruimte.ts`: each star twinkles on its own phase (vertex colours, updated
  per frame), a faint diagonal Milky Way band (`-19…-21` depth), a warm glow sprite
  around the ringed planet plus a moonlet orbiting in the ring plane (`ringvlak`),
  and a satellite (`maakSatelliet`, depth -7) that flies a slow half circle
  (190° → -10°, 85 s) centred below the bottom-right edge, with a soft red pulse every
  2.2 s, then waits 25–60 s. It is independent of the DOM scheduler. Hidden under
  reduced motion.
- **kasteel:** own castle `kasteel-eigen.svg` from `bronbestanden/teken-kasteel.py`
  (pastel pink towers, coloured cone roofs with flags; also the shop picture). Day
  25 s / night 20 s (`DAGCYCLUS`, `data-tijd`), `.valster` shooting stars at night.
  `styles/achtergrond-kasteel.css` has the older parts first, then the newer ones
  (the newer rules override some older ones, keep that order): a full-width rainbow (`kasteel-boog`, 7 arcs with `pathLength=1`) that flows in via
  `stroke-dashoffset` 1 → 0 and out (→ -1), sometimes mirrored
  (`kasteel-boog--andersom`); three white doves (`kasteel-duif`, `pikt`, flutter up
  on `juich`); a flower patch (`kasteel-perk`) with three butterflies (hidden at
  night). The day filter on `.kasteel-heuvel` is toned down so the castle stays pink.
- **onderwater** (`onderwater.ts`, drawings `onderwater-tekening.ts`, CSS
  `achtergrond-onderwater.css`). Back to front: shimmering surface `.ow-oppervlak`,
  two hazy reef ridges (`RIF_VER`, `RIF_MIDDEN`) with silhouettes `.ow-sil`,
  far-animal layer `.ow-verte`, six light rays (`ow-straal`), plankton `.ow-stip`,
  bubbles, two jellyfish (`KWAL`), swimmers, kelp (`kelp()`), sand with caustics
  (`.ow-kaustiek`), seabed: two `.ow-rifje` groups (`ROTS` + corals), anemone with
  clownfish (peeks every 15 s, jumps on `juich`), sea star, anchor, shell, crab,
  octopus (`OCTOPUS`, `.ow-arm`, waves on `juich` via `.zwaait`), treasure chest
  (`SCHATKIST`, `.kiert` every 16–34 s and on `feest`). One scheduler, one crossing
  at a time with 4 s rest: Fluent fish 45%, school of 18 (`SCHOOLVIS`) 30%, sea
  turtle (`SCHILDPAD`) 25%, no school/turtle twice in a row. Every 100–160 s a
  blurred manta or whale far away. Mirroring via `.zwemmer__spiegel`. Phones ≤ 560 px
  hide some decor and move the chest left. Reduced motion: `.decor-onderwater--stil`.
  The Fluent `vis`, `vis-tropisch`, `kogelvis`, `schildpad`, `octopus`, `schelp`,
  `kwal` files stay (Vangspel uses them).
- **boerderij:** flat Dutch polder (`.boerderij-polder`, `--land: 38vh`). Fields,
  ditches, road and bridge are one SVG from `maakPolder()` (viewBox 1000×300, edges
  run to one vanishing point `xOp`); everything on top is positioned in % of the
  polder height. Stellingmolen (`.molen__wieken` turn anticlockwise), barn, wheat
  (`AAR`, sways with `skewX`), ditches glint (`.polder-glans`), brick road bridge
  where the long ditch passes. Tractor every 8–22 s, random direction, `.gespiegeld`
  when driving right, 20% deliberately backwards (`achteruit`). `juich`: cow jumps
  with "boe!"; `feest`: all animals jump.
  Day/night `DAGCYCLUS` (dag 50, schemer 25, nacht 35, ochtend 25 s) via `data-tijd`
  and ~20–34 s CSS transitions: sky layers, sinking sun (`.boerderij-zonbaan`),
  stars, moon, filter `.boerderij-f` on land parts; lit windows in an unfiltered
  `.boerderij-lichten` layer. Sleeping: every animal is `.boer-dier--slaper`
  (`maakDier`/`maakSlaper`); by day sheep/pig nap every 25–60 s, cow/rooster 45–95 s,
  for 10–18 s (`.slaapt`, `--kantel`, `.boer-zzz`); closed eyes `.boer-oog` from
  `dichtOog(x, y, faceColour, rx, ry)` in the Fluent 32×32 viewBox (eye centres:
  sheep 5.43,8.83, pig 7.55,16.5, cow 7.11,9.27, rooster 6.54,7.53, chick 9.47,10.5).
  At night all sleep; chicks hop to the rooster (`.loopt` + `.bij-kip`, from
  `--haan-x`/`--haan-b`) and walk back in the morning (own `loopTimer`). Waking:
  `.rekt`. Reduced motion: always day.
- **herfst:** a real forest: tall trunks in three layers with branches growing from
  the trunk, a canopy of big leaves, light spots, undergrowth, leaf carpet.
- **winter:** ice pool (`.winter-ijs`) front right; robins and a blue tit (own SVG
  `VOGEL`, `--flap`), usually one at a time, sometimes two, half the time low over
  the hills. `WEERCYCLUS` (clear 20 s, light snow 15 s, clear 20 s, storm 15 s) sets
  `weer-licht` / `weer-storm`; in a storm birds dart into the nearest pine.
  Check: `node tests/winterweer.mjs <map>` (~65 s).
- **kermis** (`kermis-tekening.ts`): `VERTE` with circus tent, drop tower
  (`.kv-valbak`, 18 s loop) and rollercoaster (`BAAN` → Catmull-Rom `#kv-baan`; train
  is SMIL `animateMotion`, `rijTrein()` calls `beginElement()` and sets `.rijdt` for
  `TREIN_MS` 8.8 s — without `.rijdt` it is hidden, it would sit at the origin).
  Moon, pink-lit clouds, searchlights (`mix-blend-mode: screen`), rare hot-air
  balloon. Kop van Jut at the right edge (`.kermis-kop`, hidden ≤ 560 px):
  `slaKop('probeert')` every 18–40 s, on `juich` `slaKop('slaat')` with "DING!"
  (`KOP_MS` 2.4 s).
- **bouw:** `skyline('ver' | 'dichtbij')` city rows behind the site; Fluent
  helicopter (`woorden/helikopter.svg`) crosses in 34 s every ~55–75 s; cats and
  dogs on the sand line, sleeping, strolling or playing.
- **trein:** wagons personen, post, stenen, tank, container (Fluent cargo picture via
  `<image href>`). `vulReizigers`: post behind the loc, 2–3 passenger cars,
  sometimes a container; `vulGoederen`: 5–8 freight wagons. `rijd(vul, klaar, stop)`
  moves the train with rAF; `stop = 'station'` brakes at the (wider, partly
  off-screen) station and toots; `'sein'` waits at the red signal.
  `.trein-trein--staat` pauses wheels. Alps (`ALPEN`, `bergketen()` from
  `VERRE_KAM`/`NABIJE_KAM`, `.trein-alpen` `xMidYMax slice`). Rarely an own-drawn
  sea eagle glides over (flapping like the pteranodon). Check: `node tests/treinen.mjs <map>`.
- **dino:** own T-rex kept twice — `TREX` in `dino-tekening.ts` (inline, so `.tr-kop`,
  `.tr-oog`, `.tr-arm`, `.tr-lach`/`.tr-brul` animate) and `trex-eigen.svg` (shop);
  **change both together**. It blinks and says "RAWR!" on `juich`. `STEGO` walks back
  and forth over the front hill in a rAF loop; passing under the T-rex triggers
  `verrast` (2.8 s, at most every 8 s). Scenery in `dino-landschap.ts` (`VERTE`,
  `HEUVELS` — paths found by class `.dn-heuvel--achter/--midden/--voor`, not order —
  `varenPol(seed)`, `paardenstaarten(seed)`, `STEEN`); tree ferns, brachiosaurus
  (`.br-nek` grazes), volcano smoke, nest with wobbling eggs (baby on `feest`),
  pteranodon (`.dino-ptero`). Triceratops `achtergrond/triceratops.svg`.
- **savanne** (`savanne.ts`, own drawings): acacia right with three lions (tail flick,
  blink, `gaapt`), waterhole left. `bezoek`: elephants 45%, 3–5 gnoes 30%, 2–4
  gazelles 25%, one group at a time (`bezoekBezig`), drinking with `.dier__nek`/
  `.dier__kop`. Crocodile every ~20–45 s. `DAGCYCLUS`: avond 20 s, nacht 15 s (lions
  sleep with zzz, eyes closed), dag 25 s; `.savanne-f` filters ground parts;
  `savanne--begin` starts mid-sunset. Check: `node tests/savanne.mjs <map>` (~65 s).
- **spookhuis** (`spookhuis.ts`, drawings `spookhuis-tekening.ts`, CSS
  `achtergrond-spookhuis.css`, prefix `sh-`): own house `HUIS` (viewBox 0 -62 400 512:
  mansard roof, three dormers, the middle one dark with blinking eyes, a black cat on the
  roof ridge, flickering `.sh-raamlicht`, a window ghost, rocking chair, portrait with
  moving eyes, chandelier) on the flat right part of `HEUVEL`; `.sh-huisvoet` keeps its
  base in the ground. Front door: `.gluurt` (5.2 s, every 16–32 s) opens the right leaf
  and a mirrored Fluent picture from `GLUURDERS` peeks out (`.sh-gluurder__beeld`, href
  changes each time). Tree `BOOM` on the left: branches `.sh-tak--*` and moss sway on
  their own, a swing and the Fluent owl (`<image>` in `.sh-tak--uil`, "Oehoe!"), and
  `windvlaag` every 24–44 s with blowing leaves. Sky: big moon, five thin cloud wisps
  (`.sh-wolk`, 170–240 s), one event at a time (`lucht`): a ghost crossing 50%, bats
  (`VLEERMUIS`, flapping wings) 30%, a ghost rising from the chimney 20%; shooting stars, a
  spider on a thread, will-o'-wisps, two fog layers, grass blades and mushrooms (`gras()`
  with non-scaling strokes), fences `hek(n, zaad)`, Fluent jack-o'-lanterns.
  `juich`: windows light up, a "Boe!" ghost rises behind the roof, the pumpkins jump.
  `feest`: ghosts fly out of every window (`RAMEN`). Games: Vangspel candy/red pumpkin,
  Oversteken `zwarte-stenen` (the black kasteel road) with lava, dinos, skulls, skeletons
  and herds of ghosts.
