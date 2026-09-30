# Verbeterlog: review van 30 september 2026

A full review of the code and content, originally written quickly with Sonnet. Three
reviewers each worked on their own part of the app and made improvements directly. The
math/kleuter/shared-screens review was stopped just before its end, on request; its
changes were kept after they passed the typecheck and the full regression.

## Requested feature
- **Match 3 pictures to 3 words:** a matched pair now gets a thick green line from the
  picture to the word. It redraws when the window changes size and works at phone width.

## Bugs that affected the children
- **Tapping "terug" right after answering.** The session kept running in the background:
  the next instruction played on the next screen, and on the last test question the app
  jumped to the result screen. Fixed in reading, math, Luisteren, Geheugenspel and the
  Ontdekken games.
- **Sound kept playing after leaving a screen.** It now stops on every screen change.
- **Double-click on a tile.** It could also tap the first answer, or skip two chapters
  with the arrows. The first 300 ms after a screen opens now ignore clicks.
- **An answer from the previous question could still arrive late** (after "Overslaan")
  and score or skip the next question. Now ignored.
- **Retaking a test that scored 0 stars** counted as "already passed", so it paid too
  few coins.
- **Blending letters and building words:** the letters could appear already in the
  right order. Fixed.
- **The sound exercise** gave "sneeuw" the sound eu. Fixed.
- **Wrong answers that were also right:**
  - The sound exercise no longer uses a same-sounding wrong answer (ei/ij, au/ou).
  - Picture questions no longer offer words like "nat" or "ik" as a wrong answer
    under a picture.
  - Fill-in sentences now use hand-picked wrong answers, so "Oma geeft opa een mooie
    vaas" can no longer count as wrong.
- **3D letter blocks:**
  - A wrong answer made the blocks drift a little further each time.
  - Resizing the window didn't lay the blocks out again.
  - With the 3D exercise as the first question, the canvas was too small and off-centre.
  - Each exercise left a WebGL context behind; after many exercises that could break
    the background.
  - The blocks are now bigger and round, and the whole block is tappable (thin letters
    like i and l used to be hard to hit).
- **Typing exercises:** the cursor wasn't in the input box yet on the first question.
- **Geheugenspel:** two words with the same picture could appear on the board,
  leaving four identical cards that didn't all match.
- **Luisteren:** the same word no longer comes up twice in a row.
- **Math wrong answers:**
  - Two dice and bus sums: the correct answer was often in the same place, or was
    always the smallest number (with people getting off the bus). The wrong answers are
    now more varied.
- **Math counting pictures:** now at most 5 per row, so 8 reads as 5 + 3.
- **Shuffling was slightly biased.** It now uses a fair shuffle.
- **Animation speed:** the mascot's reaction was half as long on fast (120 Hz) screens.
- **Profiles and coins:** they were lost immediately when the browser blocks storage
  (e.g. private mode). They're now kept for the session.
- **Small screens:** less space between elements when the screen is short.

## Content (Dutch and Veilig Leren Lezen)
- **VLL chapters 1-6 now use only letters and sounds taught so far:**
  - Words with a short "a" (arm, ram, kat, gans) moved to chapter 4, where "tak"
    introduces that sound.
  - Multi-syllable and "hard" words were removed from the VLL chapters: oma, mais,
    regen, zebra, olifant, giraf, auto, krokodil, flat, egel, ezel, kameel. They stay
    in the themed chapters.
  - "nieuweLetters" per chapter is corrected.
- **Sentences:**
  - Sentences where a wrong answer also fitted were rewritten (roos/vaas, ijs/koek,
    onweer/bliksem, tak/huis and others).
  - The vuur sentence gave the answer away.
  - "zaai" was ungrammatical ("De tuinman zaai" should be "zaait").
  - Chapters 3, 4, 5, 6, 9 and 10 got extra sentences.
- **Removed because the picture was confusing:** mist (looked like a cloud), droog
  (the picture was a sun, next to "zon"), zaai, and flat as an English word.
- **huis, sok, vuur** now use the original VLL pictures in the themed chapters
  (the old crops showed part of a neighbouring picture).
- **"Optellen tot 10":** the range now matches the title.

## New since the review (made separately)
- **36 new words with icons** (Fluent Emoji, MIT licence), in the VLL chapters where
  their letters are taught: kaars, kroon, kers, peer, boot, been, berg, taart, ui, boek,
  hoed, soep, zee, bed, koe, brood, hand, tand, bus, hart, mond, tent, lamp, bril,
  bloem, blad, slak, klok, stoel, mier, vlieg, melk, jurk, vlag, fiets, trein.
- **New pictures for hagel** (a cloud with hail balls, no longer like "onweer") and
  **bel** (without holly, next to "hulst").
- **Word-cloud instruction corrected:** it said "Tik alle woorden aan…" while only
  one word is right.
- **`bronbestanden/opnamelijst-2.txt`:** 86 lines to record.
  - 58 words.
  - 18 instructions.
  - 10 new cheers.
  - The new cheers are added to the app once they're recorded.

## Known and not fixed (on purpose)
- **Slightly off picture crops** (a sliver of a neighbour, a wavy edge): low priority,
  per the owner.
- **Lookalikes:** kip and haan are both chickens to a toddler, and lam is really a
  sheep.
- **sneeuw and giraf** aren't phonetically regular, but they stay: the owner wanted
  sneeuw kept, and giraf stays in the zoo chapter.
- **Repeated words:** the themed chapters (7-15) repeat many VLL words. Restructuring
  them would cost saved stars.
- **Short chapters:** kern-08 and kern-09 are short, so Oefening 2/3 there have only
  1-2 questions.
