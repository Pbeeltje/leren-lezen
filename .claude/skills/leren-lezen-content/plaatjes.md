# Pictures: sources and licences

**Only Fluent Emoji (MIT) or our own drawings.** No VLL, juf-milou or worksheet
images (the app will be sold). Own drawings come from scripts in `bronbestanden/`:
`teken-woorden.py`, `teken-weer.py`, `teken-lezen-nieuw.py`, `teken-kasteel.py`,
and inline SVG in the background/game code. Exception still in the repo:
`woorden/was.svg` (game-icons clothesline, CC BY 3.0, listed in `ATTRIBUTIONS.md`
— keep that file up to date if anything non-MIT is ever added).

## Fluent Emoji

```bash
curl -s -o public/assets/icons/<name>.svg \
  "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/<Emoji%20Name>/Color/<snake_case>_color.svg"
```

Fetch `.../assets/<Emoji Name>/metadata.json` first for the exact name (spaces as
`%20`). **Gotcha**: emoji with skin tones (people, body parts) live under
`<name>/Default/Color/<snake>_color_default.svg`. If a `Color/` fetch 404s, list the
folder via `api.github.com/repos/microsoft/fluentui-emoji/contents/...` rather than
guessing.

Fluent animals face left; mirror with `.gespiegeld`. For an SVG used through
`url(#id)` gradients, don't put the defs in a display:none SVG (Chrome draws
nothing) — use flat colours.

## Own drawings, notes

- `voet.svg`: skin-coloured footprint (Fluent "Footprints", one foot, recoloured);
  `teen.svg` embeds it (`inbed(..., bron=WOORDEN)` in teken-woorden.py) with a red
  circle round the big toe.
- `heet.svg`: red thermometer with heat waves (no longer a copy of `vuur.svg`).
- `bloem` is a daisy; plurals are 2–3 copies of the singular.
- `veer.svg`: Fluent "Feather" (copy in `icons/veer.svg`), with its darker band layer
  removed because it showed as a hard square at large size.
- Verify a picture reads as the intended word to a child; when it doesn't, change the
  word rather than fight the picture.
- Check crops/drawings at real size, not only in a small contact sheet (a sliver of a
  neighbouring picture was once only visible in the app). Slight crop imperfections
  are low priority.
