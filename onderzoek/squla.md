# Squla as inspiration: research notes (2026-09-30)

Sources are the public squla.nl pages (one per groep and one per subject), the App
Store listing and an id.nl review. The games themselves need a login, so no
screens or exact interactions were visible. I found no free werkbladen or demo
quizzes. **Seen** = the page text says it. **Inferred** = my reading of how it
probably works.

## Groep 1-2 (and peuters): topics Squla names
- Comparing: groot/klein, dik/dun, hoog/laag, zwaar/licht, voor/achter (peuters, groep 1). Inferred: tap one of 2 pictures.
- More / less / evenveel (groep 2).
- Counting to 10, optionally to 20. Writing the digits 1-6.
- Shapes (circle, triangle, square, rectangle), including finding shapes inside a picture.
- Colours, including shades such as lichtblauw.
- Time: morning/afternoon/evening, gisteren/vandaag/morgen, days of the week, seasons, yearly celebrations.
- Money and a play shop ("winkeltje").
- Vocabulary themes, 8-14 words per quiz: body parts, food, animals (pet/farm/zoo), vehicles, jobs, riddles ("a pet that says miauw").
- Rhyming (maan–staan), nonsense rhymes.
- First sound / letter in a word; hakken en plakken by ear (m-o-l = mol); two-letter sounds (ui, ei, oe, au).
- Syllable counting ("Uit hoeveel delen bestaat 'panda'?").
- Formats: songs, memory, puzzles, quizzes, video. Everything is narrated, so no reading is needed.

## Groep 3
- Reading starts from ik – maan – roos – vis, the same first core words as Veilig Leren Lezen. Then 3-4 letter words, blending words and short sentences.
- Writing: trace letters i and o, then those words, then the child's own name.
- Math: numbers to 20; the +, − and = signs; story sums; **splitsen** (split 6 apples into 4 and 2, a splitsschema, domino halves, pairs that make 10); **bussommen** (people get on and off a bus, give the new total); whole-hour clock; money; ruler; weighing.

## Motivation mechanics
- A mini-game (a running game) after every assignment.
- Coins, a shop with "cadeautjes", avatar customisation.
- XP that unlocks new assignments.
- Adaptive level; a parent account to follow progress.
- No daily challenge was visible.

## Candidate new exercise types (not in the app yet)
Ranked for ages 3.5-6. NR = no reading needed.
1. Big/small, heavy/light, long/short: hear "Tik de grote beer", tap a picture. NR
2. Rhyme: hear "maan", tap the picture that rhymes with it out of 3; or rhyme yes/no. NR
3. Syllable clapping: hear a word, tap a drum once per syllable, or pick 1/2/3. NR
4. More / less / evenveel: two groups of objects, tap the one with more, or "=". NR
5. Colour and shape finding: "Tik alle rode dingen" / "Tik de driehoek". NR
6. First sound by ear: hear /m/, tap the picture that starts with it. NR
7. Bus game or splitsen: animated people get on/off a bus, pick the new number; or split apples into two groups. Needs numerals only.
8. Sorting / odd one out: drag pictures to boerderij/dierentuin/thuis, or tap the one that doesn't belong. NR

Honourable mentions:
- Order 3 pictures of a daily routine or a short story.
- Blending by ear: hear "m-o-l", tap the mol picture.
- Whole-hour clock, for age 6.

## Notes for building
- Types 2, 3 and 6 need extra recorded audio: rhyme pairs, syllable counts, first sounds. They can go on a recording list like `bronbestanden/opnamelijst-N.txt`.
- The syllable count and rhyme partner can be stored per word as base material (e.g. `lettergrepen: 2`), in line with how the app already stores words.
- Squla's focus on ik/maan/roos/vis for groep 3 confirms the VLL restructure.

Sources: squla.nl/peuters, /groep-1, /groep-2, /groep-3, /rekenen/{peuters,groep-1,groep-2,groep-3,splitsen,bussommen,klokkijken}, /taal/{peuters,groep-1,groep-2}, /taal/woordenschat/{peuters,groep-1}, /begrijpend-lezen/{groep-1,groep-2,groep-3}, /wereldorientatie/peuters; App Store id1014500359; id.nl review of Squla.
