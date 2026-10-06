# Audio playback in the app

(Recording lists and cutting recordings: the `leren-lezen-audio` skill.)

## Playback

`engine/audioManager.ts` `speelAf(pad)` plays a clip if it exists and no-ops
otherwise; `instructieAudioPad(type)` / `woordAudioPad(woord)` build
`assets/audio/instructies/<slug>.mp3` / `assets/audio/woorden/<woord>.mp3`.
`engine/opnames.ts` `isOpgenomen(pad)` reads the manifests so unrecorded audio
never 404s. `OefeningScreen`/`RekenOefeningScreen` play the instruction in
`toonHuidige()`. `FeedbackOverlay.ts` `toonOverlay()` picks its message index once
and plays `feedback-{goed|fout}-{index+1}.mp3` for that same index — text and audio
must stay in sync.

**Reading text never plays automatically** (booklet pages, stories, future reading
text) — only via a speaker button. Instructions and tapped single words may play.

**Every place audio plays has a big replay button** (`ui/components/AudioKnop.ts`
`maakAudioKnop()`, `.audio-knop`, 72px). The oefening screens hold the current
path in `huidigeAudioPad`.

Word clips are used by Luisteren, Geheugenspel and tapped words — not by the
reading exercises. `zin-invullen` sentence audio doesn't exist: reading the word
aloud would spoil the blank; it needs its own design first.

`speelAf()` stops whatever is playing before starting a new clip (clips fired
close together used to overlap).

**Feedback clips are never cut off: advance with `naHuidigeAudio`, not a fixed
timer.** Anything that starts audio after a goed/fout answer (next instruction,
next word, a memory card, `pop`/`replace` at the end, which call `stopAudio()`)
must wait. `naHuidigeAudio(fn, stilteMs, maxMs, minMs)` calls `fn` after the
current clip ends (or pauses/errors) plus `stilteMs`, at most `maxMs`, at least
`minMs` (so muted play keeps the old pause), and returns a cancel function: call
it in `vernietig`/`unmount` and when advancing another way. Used by
`OefeningScreen`/`RekenOefeningScreen` (300 ms gap, 900 ms minimum),
`RondeScreen`, `luisterKiezen`, `geheugenSpel`.
Check: `node tests/feedback-audio.mjs <map>`.

**Mute**: `isGedempt()`/`zetGedempt()`, one global localStorage key (a device
setting, not per profile); gates `speelAf()` and pauses anything playing. Toggle
is a tile in the profile menu that does not close the menu. The synthesised music
(`engine/muziek.ts`) also respects it.

## Recordings (summary)

All clips are the owner's own voice, read from a numbered list and split by
silence detection; **a matching segment count does not prove the labels are
right — always verify by transcription** (a merged segment once shifted 46 clips
by one). After replacing clips run
`git rm -r -q --cached public/assets && git add public/assets` (equal-size files
can slip past git's quick check). Details: the `leren-lezen-audio` skill.
