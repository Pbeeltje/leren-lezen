---
name: leren-lezen-bronbestanden
description: Turn a source image the user drops in C:\claude\leren-lezen\bronbestanden\ (worksheet, flashcard sheet, picture chart) into app content - read it, list its words/numbers/sentences, add them to the right chapter with a Fluent Emoji or self-drawn picture (never the source's own pictures), and queue their audio. Use whenever the user supplies a new source image for words, math, or sentences, or says "cut these up" / "use these for questions".
---

# Source images → app content

A worksheet or chart the owner supplies tells us **which words, numbers or
sentences to add**, and sometimes suggests a new kind of exercise. **Its pictures
never go into the app**: the app will be sold, so every picture is Fluent Emoji
(MIT) or our own drawing. No cropping from VLL, juf-milou or other worksheets, and
never show the name "Veilig Leren Lezen" to users. Tell the owner this when they
say "cut these up".

## How content is stored

Store only base material, never finished questions:

- Reading: one `Woord` = `{ woord, afbeeldingPad, vereistTekst? }` in a chapter's
  `woordenbank` in `src/content/lezen/kernen/lezen-hoofdstukken.ts` (kleuter
  letters: `kleuter-letters.ts`), optionally plus a `ZinsVoorbeeld` in `zinnen`.
  Audio is found by convention at `assets/audio/woorden/<woord>.mp3`.
- Every exercise pattern (`src/engine/oefeningGenerator.ts`) builds its questions
  from the word bank at runtime. A new word shows up automatically in every pattern
  it qualifies for, and in Luisteren and Geheugenspel.
- Math: a pattern in `engine/rekenenGenerator.ts` plus assets (e.g. the own-drawn
  `images/vingers/vinger-N.svg`). Numbers are generated, not stored.
- **A new *kind* of material needs a new pattern, not stored questions.** Example:
  the finger chart became the `vingers-naar-cijfer` pattern.

## Workflow

### 1. Read the image and list every item
`Read` the file. List each picture with its printed word or number. If there is
no text, name the picture yourself and flag which names are guesses.

### 2. Decide what each item becomes
- Clear noun → `Woord`.
- Word a picture can't pin down (adjective, verb) → first try a different word.
  If the owner wants it kept, set `vereistTekst: true` and add a disambiguating
  `zinnen` sentence.
- Sentence sheets → `zinnen` entries (`___` marks the blank), distractors from the
  same chapter's bank.
- Counting or number charts → a math pattern. Mirror the closest game file
  (`games/dobbelsteenNaarCijfer.ts` for "picture → pick a number").
- Skip duplicates: grep `woord: '<x>'` across `src/content` first.

### 3. Pick the chapter (reading)
Chapters run CVC → long vowels → clusters → diphthongs → sch/eeuw → review →
plurals (see `lezen.md` in the `leren-lezen-content` skill and
`C:\Claude\leren-lezen-hoofdstukken-plan.md`). Put a word in the chapter whose
sounds it uses; each word sits in exactly one chapter, 12 per chapter. Add new
sound groups to `KLANKEN` in `oefeningGenerator.ts` if needed (longer groups first).

### 4. Get a picture for each item
In this order:
1. **An existing picture** in `public/assets/images/woorden/` that genuinely fits.
2. **Fluent Emoji**: fetch the SVG (see `plaatjes.md` in `leren-lezen-content`;
   metadata.json first; skin-tone emoji live under `Default/Color/`).
3. **Our own drawing** when Fluent has nothing that reads clearly as the word: add a
   function to `bronbestanden/teken-woorden.py` (simple shapes, or composed from
   Fluent parts via `inbed()`), or `teken-weer.py` / `teken-lezen-nieuw.py` for
   their themes, and rerun the script. Keep the drawing in the script so it can be
   regenerated.

The source picture may guide *what* to draw, but don't trace or copy it.
**Check every picture reads as the word to a young child**; if it doesn't, pick a
different word rather than fight the picture. Look at new pictures at real size in
the app, not only in a contact sheet (`bronbestanden/contact.ps1` renders a batch
in one image for a first look).

The old `crop*.ps1` / `crop-*.py` scripts in `bronbestanden/` are from before this
rule and must not be used for app pictures.

### 5. Place the content
- Add the `Woord` entries (`afbeeldingPad` → `assets/images/woorden/<woord>.svg`).
- If a pattern is new, wire it in four places: the type union in `types.ts`, the
  generator (`ALLE_TYPEN`, the applicability filter, `maakOefening`), the screen's
  `INSTRUCTIES` map and `renderOefening` switch, and every kern with an explicit
  `oefeningTypen` list that should use it (otherwise it never appears).

### 6. Queue the audio
Every new word needs `assets/audio/woorden/<woord>.mp3`; every new pattern needs
`assets/audio/instructies/<type>.mp3`. Missing clips fail silently. Add them to a
new numbered recording list with the `leren-lezen-audio` skill (parts of ~3
minutes; a manifest is only renamed to `audio-manifest-N-M.json` after the part is
split and verified, because Luisteren only uses words listed there). Tell the owner
which words are still silent.

### 7. Test
`npx tsc --noEmit`, then a targeted Playwright check with a screenshot (see
`leren-lezen-run`): the new pictures render, one right and one wrong answer work.
Full sweep only if shared generator code changed. Then `npm run build`.

### 8. Report to the owner
Which items became content, which were skipped and why, the chapter they went
into, and which pictures are Fluent and which are own drawings.
