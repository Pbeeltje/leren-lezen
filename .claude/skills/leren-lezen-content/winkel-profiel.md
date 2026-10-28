# Shop, profile menu, avatars

## Shop (`ui/screens/WinkelScreen.ts`, `engine/winkel.ts`)

Tabs: figures, backgrounds, instruments. 5 figures are free, the rest 30 coins;
backgrounds 200; instruments 200 (one `GRATIS`/`PRIJS` table in `engine/winkel.ts`).
Owned items come first (fixed order), then the rest. Per item type, `SOORTEN` in
`WinkelScreen.ts` holds tab name/icon, `gekozen()` and `kies()`; `RASTER` holds the
minimum card width and max columns.

Layout (28 Oct): back button top left, coins (`.winkel__beurs`, fixed) top right, the
`h1` only for screen readers. Tabs sit in that top bar (fixed, centred) at ≥860px wide or
on a landscape phone (≤559px high, ≥560px wide); otherwise below it. Labels only at
≥860px. **Cards per page are measured, not guessed**: `teken()` runs in `mount()`, takes
columns from the box width / `RASTER.minBreedte`, lays all cards on one page to measure
the tallest, then fits as many rows as the height below the tabs allows (minus the dots if
it needs more than one page). Card picture size is `--plaatje: clamp(36px, 8vh, 72px)`,
backgrounds 0.8× with the name on one line, so all backgrounds fit on one page from a
390px phone up (a 360×640 phone needs 2). `.scherm.winkel` keeps its 112px top padding
on short screens (screens.css removes it there) and is top-aligned. Grid columns are
`minmax(0, 1fr)` so a long name can't push a column wider.

Buy dialog (`.winkel-venster`): picture, name, price; an instrument plays an arpeggio
on open plus a speaker button (`.winkel-venster__luister`); short of coins → savings bar
(`.winkel-venster__balk`) + "Nog X sparen!" and only "Oké". Tapping the coin counter
opens the shop (see "Shop during an activity" in
[navigatie-voortgang.md](navigatie-voortgang.md)). Checks: `tests/winkel.mjs`,
`tests/winkel-rij.mjs`, `tests/formaten.mjs`. Test against the dev server one browser
context at a time (close each), or page loads time out.

Every link into the shop opens the matching tab via `WinkelScreen(m, { soort })`:
"Meer in de winkel" under Mijn figuur → figuur, under Achtergrond → achtergrond;
the instrument buttons and `.muziek-winkel-knop` → instrument (with `koop`). Only the
coin counter has no context and opens the default figuur tab.

## Profile menu (`ui/components/ProfielMenu.ts`)

Header (figure + name; tap the name to switch profile), 5 tiles: Mijn figuur
(animal + colour combined, panel widens to `min(760px, viewport)` with its own
fixed grid, 3 or 5 columns, not the shop's measured one; animal and colour equally big so a phone doesn't scroll),
Achtergrond, Geluid (toggle, keeps the menu open), Schrift (toggle Los / Aan
elkaar, shows "aap" in the chosen script instead of an icon; see lezen.md),
Wisselen (full-width lower row). Its submenu shows the groups directly
(`.profiel-keuze`, current one `.geselecteerd`); tapping one saves it and
replaces the screen with that group's topics. The owner wants this submenu kept
as a guard against switching by accident, but no extra "Ander profiel / Groep"
step (6 Oct); another profile goes via the name.
Submenus have a back arrow; picking keeps the menu open and marks the selection.
The menu is `position: fixed` against the screen edge. Test drivers use
`.profiel-tegel` / `.profiel-keuze` / `.profiel-menu__terug`. Name max 16 chars.

## Profile select and deleting (`ui/screens/ProfileSelectScreen.ts`)

A new profile starts with the first free figure already selected (`GRATIS_FIGUREN[0]`),
so "Aan de slag!" only waits for a name. Deleting (13 Oct) takes 3 steps, each with a way
back so a child can't get stuck: `.profiel-weghaal-knop` small, bottom right (top right drew too much attention on phones) (label turns into
"Annuleren") → delete mode (title "Welk profiel weghalen?", red dashed tiles, no "Nieuw
profiel" tile, a `.terug-knop` that leaves the mode) → tapping a profile opens a
`.winkel-venster` dialog (reused, so the Android back button closes it; tapping beside it
or "Nee" closes it too). "Weghalen" only works once the full name is typed (case-insensitive,
since app inputs show lowercase). `verwijderProfiel(id)` in `profielStore.ts` removes the
profile plus every `leren-lezen:` key that has the id as a `:`-separated part. Check:
`tests/profiel-weghalen.mjs`.

## Avatars

`AVATAR_ICONEN` (Fluent Emoji plus own drawings: `avatar-stegosaurus.svg` after
'dino', `avatar-triceratops.svg` after it — same animal as
`achtergrond/triceratops.svg`) × `AVATAR_KLEUREN` hue-rotate tints via
`avatarFilter(kleur)` (`hue-rotate(Ndeg) saturate(1.9) contrast(1.12)`). A
rotation shifts each icon's own base hue, so the same tint looks different per
animal — not a bug; check the computed `filter` before assuming it's broken.

**Animal picker and colour picker must stay separate** — in both
`NewProfileScreen.ts` and `ProfielMenu.ts`: the animal grid never applies
`avatarFilter()` (true colours, or the shapes get hard to tell apart — "it often
only shows different color unicorns"); the colour swatches show only the
**currently selected animal**, tinted per colour, and must follow an animal change
(`werkKleurVoorbeeldenBij()` in `NewProfileScreen.ts`). Re-verify both rules in a
real browser after touching either file.
