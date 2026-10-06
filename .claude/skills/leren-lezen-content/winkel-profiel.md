# Shop, profile menu, avatars

## Shop (`ui/screens/WinkelScreen.ts`, `engine/winkel.ts`)

Tabs: figures, backgrounds, instruments (on phones ≤600px icons only). 5 figures
are free, the rest 30 coins; backgrounds 200; instruments 200. Owned items come
first (fixed order), then the rest. Backgrounds use compact cards: 6 columns (3 on
phones), up to 4 rows, so everything fits on one page; sideways paging. Tapping the
coin counter opens the shop (see "Shop during an activity" in
[navigatie-voortgang.md](navigatie-voortgang.md)). Check: `tests/winkel-rij.mjs`.

## Profile menu (`ui/components/ProfielMenu.ts`)

Header (figure + name; tap the name to switch profile), 5 tiles: Mijn figuur
(animal + colour combined, panel widens to `min(760px, viewport)` with the same
grid as the figure shop; animal and colour equally big so a phone doesn't scroll),
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
