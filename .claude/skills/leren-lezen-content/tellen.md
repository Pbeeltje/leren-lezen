# Math (tellen): chapters, exercise types, kleuter counting

`RekenKern.bereik: [min, max]` is the number range; `objecten` is the pool of
countable icons. Screens get the chapter list from `rekenKernen()` in
`engine/leeftijdGrens.ts`; **never use `REKEN_KERNEN` directly there.**

## Exercise types

- `hoeveelheid-naar-cijfer` — see N pictures, pick the numeral.
- `hoeveelheid-typen` — same picture, type the numeral.
- `cijfer-naar-hoeveelheid` — see a numeral, pick the group with that many.
- `dobbelsteen-naar-cijfer` — 1–6 dice pips (`ui/components/Dobbelsteen.ts`, pure CSS).
- `vingers-naar-cijfer` (`games/vingersNaarCijfer.ts`) — a hand showing N fingers
  (own drawings `images/vingers/vinger-N.svg` from `teken-woorden.py`), pick the numeral.
- `dubbele-dobbelsteen-naar-cijfer` — two ordinary dice added, sum ≤ 10. An earlier
  "one pip means ten" version was rejected: don't bring back conventions that
  need explaining.
- `reeks-aanvullen` — typed: fill the gap in `11-[ ]-13`.
- `optellen` — pictured "erbij" addition, sum < 10, multiple choice.
- `bussom` (`games/bussom.ts`, `reken-kern-05`): the bus shows the starting
  passengers, the stop who gets on/off; `start` is always a distractor.
- Sums: `som-keuze` / `som-koppelen` / `som-typen`; money: `geld-typen` etc.
  Som and geld types are not in `ALLE_TYPEN`.

`hoeveelheid-typen`/`reeks-aanvullen` count double in the type weighting.

`RekenKern.oefeningTypen?` restricts the types a kern uses — **set it whenever
the range makes some types meaningless** (picture counting past ~10, one die past
6). Without it `toepasbareTypen()` falls back to every structurally possible type,
which once let kern-01 pick up optellen. `oefeningVolgorde` pins oefening 1/2/3
(the toets mixes those types evenly).

## Chapters (groep 3)

- 01 (1–6), 02 (1–10): counting types including dice and fingers. 03 (11–20): `reeks-aanvullen`,
  `dubbele-dobbelsteen-naar-cijfer`. 04: `optellen` only. 05: bussommen.
- `reken-kern-06` Plus tot 10 (`somTeken: '+'`, terms ≥ 1, sum 2–10), `07` Min tot 10
  (minuend 1–10, result ≥ 0), `08` Plus tot 20 (sums 11–20), `09` Min tot 20
  (minuend 11–20). The generator never mixes in the other sign. Minus on screen is
  U+2212 via `schrijfSom`.
- `reken-kern-10` Munten tot 10 (`geld: 'munten'`, ≤ 10 euro; oefening 1 ≤ 3 coins
  and ≤ 2 euro, oefening 3 `geld-typen` with euro/cent fields starting `0` / `00`),
  `11` Munten en briefjes (bills 5/10/20, pile ≤ 50 euro). Amounts via
  `schrijfBedrag` (`1,50`, whole euros as `2`).
- `reken-kern-12` Plus, min en geld (`herhaling: 'plus-min-geld'`): 8 multiple
  choice, 5 matching (sums only), 8 typing, toets of 12.

## Kleuter counting

`content/tellen/kernen/kleuter-tellen.ts`: 4 chapters "Tellen tot 4/6/8/10" with
only hoeveelheid-naar-cijfer and cijfer-naar-hoeveelheid.
Check: `node tests/kleuter-tellen.mjs <map>`.
