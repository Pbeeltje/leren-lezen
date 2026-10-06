# Reading: word bank, exercise types, kleuter letters, begrijpend lezen, leesboekjes

## Word bank and chapters

Reading chapters live in `content/lezen/kernen/lezen-hoofdstukken.ts`: 24
chapters × 12 words (ids `lezen-01` … `lezen-24`). Difficulty order: CVC → long
vowels → clusters (incl. review chapter 10 *Laars en krant*) → diphthongs →
sch/eeuw → themed review → plurals → leftovers. **The id is fixed (progress is
keyed on it); the displayed number (`volgnummer`) is the position in the array.**
So insert a new chapter where it belongs difficulty-wise, give it the next unused
id (`lezen-24` sits at position 10), and never renumber ids. Each word
sits in exactly one chapter; the toets is the whole bank (12). The list and
picture/audio notes are in `C:\Claude\leren-lezen-hoofdstukken-plan.md`. New
pictures: `bronbestanden/teken-lezen-nieuw.py` (plurals are 2–3 copies). The
old `vll-kern-*` / `kern-0*` ids are gone.

`KLANKEN` in oefeningGenerator lists longer groups first ('aai' before 'aa',
'sch' before 'ch'). Words longer than 8 letters skip woord-bouwen, longer than
10 skip hakken-en-plakken.

**Adding a word**: picture into `public/assets/images/woorden/` (Fluent Emoji or
own drawing only, see [plaatjes.md](plaatjes.md)), add `{ woord, afbeeldingPad }`
to the chapter's `woordenbank`, optionally a `zinnen` entry. **Verify the
picture is unambiguous** to a child (real bug: "mars" + a chocolate-bar icon read
as "chocolade" — fixed by swapping the *word*). Reusing an existing picture for
another word is fine when it genuinely fits (`cp` it to `woorden/<woord>.svg`).
Every reading word with a recording joins the Geheugenspel pool (unless `vereistTekst`); for Luister & wijs also add it to a chapter list, see [kleuter-onderwerpen.md](kleuter-onderwerpen.md).

**Adjectives (`koud`, `droog`, `heet`, `nat`, ...) need `vereistTekst: true`.**
A picture can't disambiguate a quality word. With the flag,
`beschikbareTypen()` drops `hakken-en-plakken`/`woord-bouwen`/`zelf-typen`
(no text on screen) and keeps the types where the word appears as text. Always
give such a word a `zinnen` entry — the sentence disambiguates it ("Buiten ligt
sneeuw, het is heel ___." → `koud`). The word `en` (picture: two bees) only
gets `zin-invullen` and `letter-herkennen`, and `zinInvullen` hides its picture.

## Exercise types

10 types: `plaatje-woord-keuze`, `woord-plaatje-keuze`, `hakken-en-plakken`,
`woord-bouwen` (3D), `zin-invullen`, `zelf-typen`, `woordwolk`,
`letter-herkennen`, `klank-herkennen`, `drie-koppelen`.

**Weighted by group, not by chapter.** `kiesType()`: for groep 3
(`GEWICHT_ZES`) building words, zin-invullen and drie-koppelen come up more;
kleuters get a uniform pick. A difficulty ramp by chapter position was
explicitly rejected — don't reintroduce it.

**Session shape:**
- Oefenen: one question per pool word (3–5), then repeat plaatje/woord-keuze
  questions for words already asked (at least 1, up to 6), then for groep 3 one
  zelf-typen for a repeated word. Always 7 questions (groep 3) / 6 (kleuter).
- Toets: every bank word once, then for groep 3 two zelf-typen for words from
  that toets.

`zelf-typen` is **never** a regular question — only at the end, for a word that
already came up in that series (owner's rule). See `voegTypenToe()`.
zin-invullen is always multiple choice.

**Each Oefening 1/2/3 covers a fixed third of the bank**:
`woordenVoorOefening(kern, nummer)` partitions round-robin (`i % 3`);
`genereerSessie(kern, 'oefenen', oefeningNummer)` draws only from that slice.
Decoys (`kiesAfleiders`) still come from the whole bank, on purpose. Math was
not partitioned this way (its pool is a number range).

- `drie-koppelen` — three pictures and three words in two shuffled columns; tap a
  picture then a word to pair. Wrong pair flashes red (or fails in toets mode).
  Words = `doel` + two others from the bank; `vereistTekst` words never take part.
  `woordenVanOefening()` reports `paren[0]`.
- `woordwolk` — a picture with **exactly one** correct word among ~7 cloud tiles.
  The owner found a repeated target confusing; don't reintroduce repeats.
- `letter-herkennen`/`klank-herkennen` — a big letter or klank ("oo"); pick the
  text word containing it. `klank-herkennen` needs a word with a `KLANKEN` entry
  and another bank word without it as distractor.
- `woord-bouwen` (`three/letterBlocks.ts`): wooden blocks (`houtVlak` texture,
  black frame, lowercase Andika, PerspectiveCamera(28)). Double letters: every
  letter has its own block and the tapped block disappears (kaas: tap one a, then
  the other). Spacing is derived from the live `camera.aspect`/`fov` — never
  hardcode world-space sizes; test at ~420px wide too.

## Kleuter reading

`content/lezen/kernen/kleuter-letters.ts`: 6 chapters (m s v / r k p / n t b /
h d z / l w g f / all letters) with `Kern.letters` set. For such a kern
`genereerSessie` only makes letter-herkennen: the target word starts with the
letter, the 2 others don't contain it (words from the normal banks, ≤5 letters).
Screens get the list from `leesKernen()` in `engine/leeftijdGrens.ts`; **never use
`KERNEN` directly in reading screens.** Check: `node tests/kleuter-lezen.mjs <map>`.

## Reading font

Andika (OFL, `src/assets/fonts/andika-latin-{400,700}.woff2`) via
`--leeslettertype` for everything the child reads or types (letters, word
buttons, sentences, booklets, keys, 3D blocks). Baloo 2 stays for the UI. In
heavy Baloo 2 the n and r looked alike.

**Schrift: los or aan elkaar** (per profile, `engine/schrift.ts`, key
`leren-lezen:schrift:<profielId>`, toggled by the Schrift tile in the profile
menu). The choice sits on `<html data-schrift>`; with `aan-elkaar`, global.css
points `--leeslettertype` at Playwrite NL (OFL, Dutch school script,
`src/assets/fonts/playwrite-nl.woff2`, family `'Playwrite NL Schoolschrift'`).
Its `@font-face` has a letters-only `unicode-range`, so digits, `+ =` and `€`
fall back to Andika and math stays print — don't add digits to it. Letter-spacing
is reset in cursive (it breaks the joins). The 3D blocks read the variable too
(`leesLettertype()` in letterBlocks.ts). Instructions and buttons stay Baloo 2.
Apply it next to `pasAchtergrondVanProfielToe()` (`pasSchriftVanProfielToe()`).

## On-screen keyboard (typing questions)

A phone only opens its keyboard when an input is focused directly by a tap; our
typing questions appear after feedback, so it often stayed closed.
`ui/components/SchermToetsenbord.ts` `koppelSchermToetsenbord(invoer, 'letters' | 'cijfers', na?)`:
in the app (`isApp`) and on touch devices (`maxTouchPoints` / `any-pointer: coarse`)
the input becomes `readOnly` + `inputMode='none'` with big alphabetical keys or a
number pad plus backspace; vowels red (`.scherm-toets--klinker`), consonants
blue. A physical keyboard still types via a keydown handler. **Every typing input
must call it** (zelf-typen, zin-invullen typed, hoeveelheid-typen,
reeks-aanvullen, geld-typen). A CSS block shrinks picture and input when the
keyboard is shown.

## Begrijpend lezen (groep 3 only)

Topic id `begrijpend`. A short story, then one multiple-choice question whose
answer is literally in the text. Stories in `content/lezen/begrijpend.ts`, four
questions each. Opening a story shows the next question for that profile
(`volgendeBegrijpendVraag`, key `begrijpendVraag`); the index is picked in the
screen factory so a shop visit keeps the same question. Correct pays
`MUNTEN_BEGRIJPEND` (50) once; wrong can be retried; skip pays nothing. The
story is not read aloud (tapping a word plays its clip if recorded). Instruction
clip `begrijpend-lezen` is not recorded yet.

## Leesboekjes (hidden for now)

The topic has `groepen: []` (the owner isn't happy with the booklets). Code and
audio stay; give it groups again to bring it back. `content/boekjes/boekjes.ts`:
one booklet per early chapter, 6–7 pages of `{ plaatjes, tekst }`, lowercase.
**A page may only use sounds known up to its chapter** — check with
`npx tsx bronbestanden/check-boekjes.mts` after any change (reads vowel pairs as
one sound; also checks pictures exist). `BoekenkastScreen` is the shelf,
`BoekjeScreen` one page at a time, words tappable. A page clip
(`assets/audio/boekjes/boekje-K-P.mp3`) **only plays via the speaker button,
never automatically**. `engine/opnames.ts` `isOpgenomen(pad)` avoids 404s for
unrecorded audio. `aantalHoofdstukken` is only used here.
