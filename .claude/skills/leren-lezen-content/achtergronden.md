# Backgrounds (`src/achtergrond/`)

## General

- Every theme is a DOM `Decor` (`{element, juich, feest?, vernietig?}`). Shared CSS
  and keyframes (`zwem-over`, `straal-glans`) in `styles/achtergrond.css`; most
  themes have their own `styles/achtergrond-<id>.css` (imported in main.ts) and
  pictures prefixed `<id>-` in `public/assets/achtergrond/`.
- **Adding a theme:** id in `ThemaId`, entries in `THEMAS` and `MAKERS`. Shop and
  profile menu pick it up automatically (200 coins). Fluent animals face left:
  mirror with `.gespiegeld`. With `prefers-reduced-motion` don't start JS
  schedulers. Clear every timer/rAF in `vernietig`. Also add a Vangspel entry in
  `THEMA_DINGEN` and optionally `THEMA_DIEREN` (Dieren voeren) and a table colour
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
  25 s / night 20 s (`data-tijd`), `.valster` shooting stars at night. New parts in
  `styles/achtergrond-kasteel.css` (older CSS still in `achtergrond.css`): a
  full-width rainbow (`kasteel-boog`, 7 arcs with `pathLength=1`) that flows in via
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
