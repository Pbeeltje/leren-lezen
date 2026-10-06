# Layout and CSS gotchas

## `hidden` attribute vs. `display`

A class with `display: flex` silently overrides the `hidden` attribute (equal
specificity, loads after the UA default). Hit several times (profile menu panel,
`.avatar-grid`/`.kleur-rij` rendered on top of each other). **Whenever a component
toggles `el.hidden`, add `.the-class[hidden] { display: none; }` in the same edit.**

## Vertical centering vs. the fixed corner buttons

`.scherm` (`styles/global.css`) centers vertically, and `.terug-knop`/
`TopRechtsBalk` are fixed in the top corners (siblings, not children). Content
taller than the viewport overflowed above the top (unreachable), and short content
could land behind the buttons (bug: "an image was missing" in woord-bouwen `maan`).
Fix, all three needed: `.scherm` has `overflow-y: auto`, `justify-content: safe
center` after a plain `center` fallback, and `padding-top: max(24px, 112px)`. If you
touch `.scherm`, re-test at a narrow *and* short viewport (~390×780).

## Landscape phones and tablets

- Landscape phones: one block at the end of `screens.css`,
  `@media (orientation: landscape) and (max-height: 500px)`. Question cards with 2+
  children become a two-column grid (first child = question, left,
  `grid-row: 1 / span 6`; the rest right). Gotcha: `> :first-child` is more specific
  than `> *`, so the typing layout (`.oefen-kaart:has(> .scherm-toetsenbord)`) must
  reset `grid-row` on `:first-child` too. Woord bouwen, typing and the test result
  get extra-compact padding to fit 667×375. Corner controls are smaller.
- Tablets/laptops sideways: a milder block right after it,
  `(orientation: landscape) and (min-height: 501px) and (max-height: 820px)`
  (1024×768, 1180×820, 1366×768): single-column cards stay, gaps/pictures shrink,
  `.scherm-titel` is hidden on screens with a `.voortgangsbalk`.
- Vangspel and Tafeltennis ask to rotate (`.vang-draai`), see [spelletjes.md](spelletjes.md).
- Screenshot walk: `node tests/liggend.mjs <folder> [844x390 667x375 1024x768]`
  (`ALLEEN=lezen,tellen,...`). Sweep over 24 sizes: `tests/formaten.mjs`. Findings:
  `C:\claude\leren-lezen-liggend.md`.

## three.js

Never hardcode world-space spacing/size against an assumed container size; derive
it from the live camera aspect/fov and test at ~420px wide (letter blocks fell
outside the frustum on narrow windows).
