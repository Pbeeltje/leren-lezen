# Spelletjes: Vangspel, Tafeltennis, Dieren voeren (+ Geheugenspel, Tekenen)

Topic `spellen` (both groups, `SpellenKiesScreen`, Fluent joystick) opens
Vangspel, Tafeltennis, Dieren voeren, Geheugenspel and Tekenen. Geheugenspel and
Tekenen: see [kleuter-onderwerpen.md](kleuter-onderwerpen.md). None of the games
pay coins (coins come from learning); records are per profile.

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
- Record: `leren-lezen:vangspel:<profielId>`. Start/end screens are pictures only.
- Check: `node tests/vangspel.mjs <map>`, `node tests/vangspel-thema.mjs <map>`.

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
(`leren-lezen:voeren:<id>`), no timer.
- `DIEREN`: per animal `goed` (what it eats) and an explicit `fout` list (only those
  are used as wrong options). `kijkt` (left/right/front) mirrors to the walking
  direction. `schaal` 0.8–1.2 is stretched by `spreid()` (×1.75 around 1, min 0.4)
  so a mouse is small and an elephant big; a group that doesn't fit shrinks evenly
  (`maten`). `mond` sets where thrown food lands. `THEMA_DIEREN` favours animals
  that fit the background (75%).
- Entrances (`komt`): loopt, hupt, springt (cat, tiger, fox), valt (monkeys drop,
  then `--wipt`), glijdt (penguin, seal), stampt (dinos shake the screen), rent
  (dog), zakt (sloth on a vine), vliegt (bee, butterfly; `--zweeft`), kruipt (snail,
  turtle: a third of a body per second; nobody waits for them, the tray comes once
  the rest has arrived), kronkelt (snake). Extras: `slaapt` (lion, sloth "Zzz…"),
  `spuit` (elephant fountain).
- Groups: 1 animal, from score 6 sometimes 2, groep 3 from 14 up to 3 (max 2 when
  width < 560). Animals in a group never share a good food and never stand next to
  their prey (`PROOI`/`lust`: cat/snake–mouse, wolf–sheep, fox–chicken). `SAMEN`:
  monkeys, bees, butterflies often come in 2–3 (only the first talks). From score
  4, 12% chance of a family (mouse + 4 babies `alleenFamilie`, monkey troupe,
  swarm).
- Hunters (`jager`: tiger, lion, T-rex, polar bear, wolf, fox): if a plant eater
  waits next to one for 4 s unfed, the hunter chases it off, no heart lost.
- Tray: the unique wanted foods topped up to 3 with things none of them eat. Food
  stays in the tray after a throw. Throws don't block; the target leaves the
  `wacht` state (`data-staat`) at once so it can't be hit twice. Drop target: each
  waiting animal's box plus a margin; overlaps go to the nearest centre. One chord
  (do-mi, + sol for three) when the tray appears.
- Pictures in `public/assets/voeren/` (Fluent dog, bone, meat, peanut, worm,
  sauropod, butterfly; own `zeewier.svg`). Dragging shows a big white hand cursor
  (`.voer-sleept`) and a fading trail.
- Check: `node tests/voeren.mjs <map> [kleuter]`; forced groups via dev hook
  `window.__voerGroepjes`: `node tests/voeren-dieren.mjs <map> [w] [h]`
  (`ALLEEN=n` runs the first n groups).
