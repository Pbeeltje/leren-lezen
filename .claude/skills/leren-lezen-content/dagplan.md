# Vandaag (daily plan)

The first tile on `TopicSelectScreen` ("Vandaag", star icon, badge `n / 3` or ✓)
opens `VandaagScreen`: three big cards the app picked for this child today. Logic
in `engine/dagplan.ts`; storage `leren-lezen:dagplan:<profielId>` (validated on read).

## What goes in the plan

Never music or games.
- **Groep 3:** lezen (word chapters, `leesKernen()`), tellen (`rekenKernen()`),
  schrijven (Letters or Woordjes). Begrijpend lezen and Tijd lezen are not included.
- **Kleuter:** letters (`leesKernen()`, kleuter set), tellen (kleuter set) and a
  third card that rotates by day between Luisteren, Ontdekken and Schrijven
  (Lijnen/Letters). An unfinished one of those three wins over the rotation.

Per subject, in this order:
1. **Unfinished:** `onaf[vak]`, the last session started (`startTaak`) and not
   played to the end (`rondTaakAf`). The card shows a "verder" badge.
2. **Chapters (lezen/tellen):** the first kern in order without a toets of 2+ stars.
   In it: the first Oefening not in `oefeningenAf`, else the toets. Toets done
   but under 2 stars: randomly the toets or a random Oefening (so it alternates).
   Everything passed: a toets without 3 stars, else a random Oefening.
3. **Round games (Schrijven/Ontdekken):** the least-played id (`rondes` count), ties random.
4. **Luisteren:** the first playable chapter without stars, else a random one.

**Shuffle button** (Fluent "Shuffle tracks button", `icons/schudden.svg`) on every
card that isn't done: `wisselTaak(index)` swaps that card for the next entry in
`kandidatenVoor()`, so repeated taps cycle round. Card 0/1 (lezen/tellen): the
unfinished one, the open Oefeningen and the toets of the current chapter, the next
open Oefening of the next unpassed chapter, and a repeat from the previous chapter.
Groep 3 card 2: Letters ↔ Woordjes. Kleuter card 2: Luisteren (first two new
chapters), Ontdekken and Schrijven games interleaved, least played first.

The plan is fixed per date and group; a new day (or group switch) makes a new
one. Finishing a matching task anywhere in the app (not only via Vandaag) ticks
the card. All three done: `MUNTEN_DAGPLAN` (20, `kleuterFactor`) once, paid in
`VandaagScreen.mount` with big fireworks and an "Alles af voor vandaag!" row.

## Hooks in the activity screens

- `OefeningScreen` / `RekenOefeningScreen`: `startTaak` in the factory,
  `rondTaakAf` in `afronden()`. Tijd lezen kernen are skipped. A new last
  parameter `naToets` sets where "verder" after the toets result goes (Vandaag
  passes itself; default is the chapter).
- `RondeScreen`: optional 5th parameter `rondeId` (from `games/rondeActiviteiten.ts`).
  **Pass it for every Schrijven/Ontdekken game**, otherwise it is not tracked.
- `LuisterenScreen`: start in the factory, finish next to `markeerKernVoltooid`.

A new subject for the plan: add a `Taak` variant and a `Vak`, a hook pair in its
screen, a picker in `dagplan.ts` and a card in `kaartVan()` (`VandaagScreen.ts`).

Check: `node tests/vandaag.mjs <map>` (next step, tick, unfinished + "verder",
bonus once, kleuter cards, phone portrait/landscape).
