---
name: leren-lezen-bronbestanden
description: Turn a source image the user drops in C:\claude\leren-lezen\bronbestanden\ (worksheet, flashcard sheet, picture chart) into app content - read it, crop each picture, pair it with its word/number, add it to the right kern, and queue its audio. Use whenever the user supplies a new source image for words, math, or sentences, or says "cut these up" / "use these for questions".
---

# Source images → app content

The user supplies real Dutch worksheets and charts and expects them to be **the
content**, not inspiration. Never swap a supplied picture for a generic icon
without saying why (hard rule, from an explicit complaint).

## How content is stored (why this is cheap)

Store only base material, never finished questions:

- Reading: one `Woord` = `{ woord, afbeeldingPad, vereistTekst? }` in a kern's
  `woordenbank` (`src/content/lezen/kernen/kern-NN-*.ts`), optionally plus a
  `ZinsVoorbeeld` in `zinnen`. Audio is found by convention at
  `/assets/audio/woorden/<woord>.mp3`. Nothing else is stored.
- Every exercise pattern (`src/engine/oefeningGenerator.ts`) generates its
  questions from the word bank at runtime. A new word shows up automatically in
  every pattern it qualifies for, and in both Luisteren games
  (`engine/luisterenGenerator.ts`).
- Math: a pattern in `engine/rekenenGenerator.ts` plus assets (e.g.
  `/assets/images/vingers/vinger-N.png`). Numbers are generated, not stored.
- **A new *kind* of material needs a new pattern, not new stored
  questions.** Example: the finger chart became the `vingers-naar-cijfer` pattern.

## Workflow

### 1. Read the image and write down every item
`Read` the file. List each picture with its printed word or number. If there
is no text, name the picture yourself and flag which names are guesses. Note the
source (site or publisher) for the kern file's comment.

### 2. Decide what each item becomes
- Picture + clear noun → `Woord`.
- Picture that doesn't pin down one word (adjective, verb, shared motif) →
  first try a different word. If the user wants that word kept, set
  `vereistTekst: true` and add a disambiguating `zinnen` sentence.
- An icon that shows something else (a tornado for "storm") → drop the word or
  find a picture that fits. Don't force it.
- Sentence sheets → `zinnen` entries (`___` marks the blank), with distractors
  from the same kern's word bank.
- Counting or number charts → a math pattern. Mirror the closest existing game
  file (`games/dobbelsteenNaarCijfer.ts` is the template for "picture → pick a
  number").
- Skip duplicates: grep `afbeeldingPad`/`woord: '<x>'` across `src/content` first.

### 3. Pick the kern (reading)
Words must be klankzuiver and use only letters and sounds taught up to that
kern (see `lezen.md` in the `leren-lezen-content` skill). If a themed
set needs letters taught later, keep the set together as a new sequel kern
placed after its last dependency (like `kern-08-weer-2` and `kern-09-kerst`).
Don't scatter the words or break the letter order. Add new sounds to `KLANKEN`
in `oefeningGenerator.ts` if needed (`'oe'` was added for `koek`).

### 4. Calibrate crop coordinates (don't guess)
Past mistakes: extrapolating row spacing from two rows drifted and clipped
fingertips; reading coordinates off a scaled render; missing thin bleeds from
neighbouring cells.
- Render the source at 3× with candidate rectangles drawn on it, and `Read` that.
  Draw everything in **original** pixel coordinates.
- Better: measure. Scan pixel columns and rows for content runs (non-white or
  skin-coloured pixels) and for grid lines (a column that is more than 60% dark).
  Take per-row and per-column offsets from the measurements rather than a
  single spacing value. `crop-vingers.ps1` shows the measured-array style.
- Keep crops inside the cell's grid lines and below any printed label.
  A label left in the crop gives the answer away in picture-only patterns.

### 5. Crop
Write `bronbestanden/crop-<bron>.ps1` (System.Drawing, no npm). Copy
`Save-Crop` from `crop-vingers.ps1` or `crop.ps1`, and output to
`bronbestanden/_staged/`. Keep the script: re-running it must reproduce the
assets, so put per-item fixes (like the narrower `roos` crop) **in the
script**.

### 6. Verify the crops (three checks, all required)
1. `contact.ps1` contact sheet → `Read` it: right picture for every label?
2. Zoomed sheet (2-3×, nearest-neighbour) → `Read` it: nothing clipped (tips,
   ears, tails), no neighbouring picture showing?
3. Edge scan: no grid line within 3px of any edge.

Low-resolution sheets hide thin bleeds. `roos` shipped with a slice of `sok`,
and the finger crops shipped with grid lines and cut-off fingertips.

### 7. Place the assets and the content
- Copy to `public/assets/images/woorden/<woord>.<ext>` (or a folder for the
  pattern, such as `images/vingers/`).
- Add the `Woord` entries or a new kern file. Register a new kern in
  `kernen.index.ts`.
- If a pattern is new, wire it in four places: the type union in `types.ts`,
  the generator (`ALLE_TYPEN`, the applicability filter, `maakOefening`), the
  screen's `INSTRUCTIES` map and `renderOefening` switch, and the
  `oefeningTypen` of kernen that use an explicit list.
- A pattern restricted to some kernen must be listed in every kern that has an
  explicit `oefeningTypen` array, or it never appears.

### 8. Queue the audio
Every new word needs `/assets/audio/woorden/<woord>.mp3`; every new pattern
needs `/assets/audio/instructies/<type>.mp3`. Missing clips fail silently. Add them to
a new numbered read-aloud list, split into parts of about 3 minutes each (user
request). Estimate 2.8 s per single word and 4.5 s per sentence, and balance the parts
evenly: `bronbestanden/opnamelijst-N-deel-M.txt` + `.json`, same `{n, slug, text, path}`
format as `audio-manifest.json`, numbered from 1 in each part. The user records each
part as its own file. **Only after a part is split and verified, rename its json to
`audio-manifest-N-M.json`.** `engine/luisterenGenerator.ts` globs
`audio-manifest*.json` to decide which words have audio. The Luisteren games
only use those words, so a manifest listing unrecorded words would make them play
silence. Tell the user which words are still
silent. Splitting and **transcription verification** are covered under
the `leren-lezen-audio` skill.

### 9. Test
`npx tsc --noEmit`, then drive the app (see `leren-lezen-run`): see the new
pictures render in the app itself, answer one right and one wrong, and run the
full regression sweep. Then `npm run build`.

### 10. Report to the user
Say which items became content, which were skipped and why, the kern they
went into, and anything that departs from the original method.
