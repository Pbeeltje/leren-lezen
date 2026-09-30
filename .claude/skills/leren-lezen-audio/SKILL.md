---
name: leren-lezen-audio
description: Make recording lists and turn the owner's voice recordings into verified sound clips for the leren-lezen app (words, instructions, feedback). Use when the user adds a recording (.m4a) to C:\claude\leren-lezen\bronbestanden\, asks what still needs recording, or when new words/instructions need audio.
---

# Audio: recording lists → verified clips

All sounds are the owner's own voice. They read a numbered list in one go, and we cut
it into one mp3 per line. The first time this went wrong (one merged segment shifted 46
clips by one position, "Bijna!" played on correct answers), so **every step is verified**.

## 1. Make a recording list
- One entry per clip: `{n, slug, text, path}`. The path is `public/assets/audio/woorden/<woord>.mp3`
  for words, or `public/assets/audio/instructies/<slug>.mp3` for instructions and feedback.
- Write it as `bronbestanden/opnamelijst-N-deel-M.json` plus a readable `.txt`.
- Split lists into parts of about 3 minutes (the owner's request). Estimate 2.8 s per
  single word and 4.5 s per sentence, and balance the parts evenly. Number each part from
  1 and add headers ("--- woorden (niet voorlezen) ---").
- Tell the owner: read in a quiet room with a pause between lines, save each part as its
  own file (e.g. `opname3-deel1.m4a`), and play back the start once before sending it.
- Don't record sentence audio for zin-invullen: reading the sentence out would give the
  answer away.

## 2. Process a recording
Run `python bronbestanden/verwerk-opname.py <opname.m4a> <opnamelijst.json>` (dry run).
It needs `pip install faster-whisper` (if PyAV complains about `metadata_errors`, run
`pip install "av==13.1.0"`) and portable ffmpeg (`npm i ffmpeg-static` in the scratchpad;
the path is at the top of the script).
- Split on pauses (`silencedetect -30dB, 0.5 s`), then transcribe each piece (Whisper
  `small`, `nl`, with the list as a vocabulary hint).
- Align the pieces to the list in order: match, extra take (skipped), line missing, two
  lines in one piece (split at the longest short pause inside it), one line spread over
  two pieces (joined).
- Read the report. `??` usually means Whisper mishearing a one-syllable word ("bijl" →
  "dial") while it's still in the right place. Watch for `!!`: a missing line or an
  unsplittable merge.
- **If almost nothing matches, it's the wrong file.** Count how many list words appear at
  all; don't process it. Say so kindly, and don't repeat what's in it: a wrong file once
  contained a private conversation. Delete the temporary pieces afterwards.
- Then run with `--schrijf`. That writes the mp3s and `bronbestanden/audio-manifest-N-deel-M.json`
  with **only the lines that were actually recorded**. `luisterenGenerator.ts` globs
  `audio-manifest*.json` to decide which words have sound, so a listed but unrecorded word
  would stay silent in Luisteren.

## 3. Verify, then commit
- Re-transcribe every written clip from its final path and list the ones that don't
  match (a short Python loop over the manifests; the pattern is in this skill's history).
  Report the doubtful ones to the owner as "listen to these, re-record if unclear".
- **Make git re-read the file contents before committing:** clips of equal length have
  the same size, and git once missed a corrected `kat.mp3` this way, so the live site kept
  saying "kip". Run `git rm -r -q --cached public/assets && git add public/assets`, then
  check `git status`.
- Raw recordings (`bronbestanden/*.m4a`) are git-ignored and must stay out of the public repo.

## 4. Wire new clips into the app
- Words: nothing to do. `woordAudioPad(woord)` finds them by name, and Luisteren picks
  them up through the manifest.
- New feedback phrases (`feedback-goed-N`): add the text in the same position in
  `GOEDE_BERICHTEN` (`ui/components/FeedbackOverlay.ts`). Index i plays `feedback-goed-{i+1}`,
  so text and sound must line up.
- Instructions: the file name equals the exercise type or slug used by `instructieAudioPad()`.

## What still needs recording
Take every word in the reading chapters plus every instruction/feedback slug, minus the
slugs in all `audio-manifest*.json` files. What's left still needs recording. Add the
doubtful clips from step 3 if the owner wants to redo them.
