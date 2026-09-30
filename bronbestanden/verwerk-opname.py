"""Knipt een opname (een hele opnamelijst in één keer ingesproken) in losse clips.

Gebruik: python verwerk-opname.py <opname.m4a> <opnamelijst.json> [--schrijf]

1. Stiltes zoeken (ffmpeg silencedetect) -> spraakstukjes.
2. Elk stukje transcriberen (faster-whisper, Nederlands).
3. De stukjes op volgorde aan de lijst koppelen met een uitlijning die extra takes
   (overslaan) en twee regels in één stukje (samenvoegen) herkent. Dit voorkomt het
   verschuivingsprobleem van de eerste opname, waar één samengevoegd stukje alle clips
   erna een plek opschoof.
4. Pas met --schrijf worden de mp3's naar hun plek in public/ geschreven.
"""
import json
import re
import subprocess
import sys
import tempfile
from difflib import SequenceMatcher
from pathlib import Path

FFMPEG = r"C:/Users/machi/AppData/Local/Temp/claude/c--Users-machi--claude-skills-sf-mcp-skills-temp/ab9469b5-59ec-440c-a83b-60eff32b10fc/scratchpad/ffm/node_modules/ffmpeg-static/ffmpeg.exe"
ROOT = Path(__file__).resolve().parent.parent


def stiltes(bestand, drempel="-30dB", minimaal=0.5):
    uit = subprocess.run([FFMPEG, "-hide_banner", "-i", bestand, "-af", f"silencedetect=noise={drempel}:d={minimaal}", "-f", "null", "-"],
                         capture_output=True, text=True, encoding="utf-8", errors="replace").stderr
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", uit)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", uit)]
    duur = re.search(r"Duration: (\d+):(\d+):([\d.]+)", uit)
    totaal = int(duur[1]) * 3600 + int(duur[2]) * 60 + float(duur[3])
    return starts, ends, totaal


def spraakstukjes(bestand):
    starts, ends, totaal = stiltes(bestand)
    stukjes = []
    vorige_eind = 0.0
    for s, e in zip(starts, ends + [totaal]):
        if s - vorige_eind > 0.15:
            stukjes.append((vorige_eind, s))
        vorige_eind = e
    if totaal - vorige_eind > 0.15 and len(ends) == len(starts):
        stukjes.append((vorige_eind, totaal))
    return stukjes


def snij(bestand, van, tot, doel, fade=True):
    van = max(0.0, van - 0.08)
    tot = tot + 0.08
    args = [FFMPEG, "-y", "-hide_banner", "-loglevel", "error", "-i", bestand, "-ss", f"{van:.3f}", "-to", f"{tot:.3f}", "-ac", "1"]
    if fade:
        args += ["-af", "afade=t=in:d=0.03,areverse,afade=t=in:d=0.03,areverse"]
    args.append(str(doel))
    subprocess.run(args, check=True)


def norm(t):
    t = t.lower()
    t = re.sub(r"[^a-zà-ÿ ]", "", t)
    return re.sub(r"\s+", " ", t).strip()


def lijkt(a, b):
    a, b = norm(a), norm(b)
    if not a or not b:
        return 0.0
    return SequenceMatcher(None, a, b).ratio()


def lijn_uit(transcripten, lijst):
    """DP-uitlijning: stukje<->regel, extra stukje overslaan, of 2 regels in 1 stukje."""
    n, m = len(transcripten), len(lijst)
    INF = 1e9
    kosten = [[INF] * (m + 1) for _ in range(n + 1)]
    terug = [[None] * (m + 1) for _ in range(n + 1)]
    kosten[0][0] = 0
    for i in range(n + 1):
        for j in range(m + 1):
            k = kosten[i][j]
            if k >= INF:
                continue
            if i < n and j < m:  # koppel
                c = k + (1 - lijkt(transcripten[i], lijst[j]["text"]))
                if c < kosten[i + 1][j + 1]:
                    kosten[i + 1][j + 1], terug[i + 1][j + 1] = c, ("koppel", i, j)
            if i < n:  # extra take / ruis
                c = k + 0.75
                if c < kosten[i + 1][j]:
                    kosten[i + 1][j], terug[i + 1][j] = c, ("extra", i, j)
            if j < m:  # regel ontbreekt
                c = k + 1.0
                if c < kosten[i][j + 1]:
                    kosten[i][j + 1], terug[i][j + 1] = c, ("mist", i, j)
            if i < n and j + 1 < m:  # twee regels in één stukje
                samen = lijst[j]["text"] + " " + lijst[j + 1]["text"]
                c = k + 0.3 + (1 - lijkt(transcripten[i], samen))
                if c < kosten[i + 1][j + 2]:
                    kosten[i + 1][j + 2], terug[i + 1][j + 2] = c, ("samen", i, j)
    stappen = []
    i, j = n, m
    while (i, j) != (0, 0):
        stap = terug[i][j]
        stappen.append(stap)
        soort, pi, pj = stap
        i, j = pi, pj
    return list(reversed(stappen))


def main():
    opname, lijstpad = sys.argv[1], sys.argv[2]
    schrijf = "--schrijf" in sys.argv
    lijst = json.load(open(lijstpad, encoding="utf-8"))
    stukjes = spraakstukjes(opname)
    print(f"{len(stukjes)} spraakstukjes, {len(lijst)} regels in de lijst")

    from faster_whisper import WhisperModel
    model = WhisperModel("small", device="cpu", compute_type="int8")
    woordenschat = ", ".join(r["text"] for r in lijst)
    tmp = Path(tempfile.mkdtemp())
    transcripten = []
    for k, (van, tot) in enumerate(stukjes):
        wav = tmp / f"s{k}.wav"
        snij(opname, van, tot, wav, fade=False)
        segs, _ = model.transcribe(str(wav), language="nl", beam_size=5, initial_prompt=woordenschat)
        transcripten.append(" ".join(s.text.strip() for s in segs).strip())

    stappen = lijn_uit(transcripten, lijst)
    twijfel = 0
    koppels = []
    for soort, i, j in stappen:
        if soort == "koppel":
            score = lijkt(transcripten[i], lijst[j]["text"])
            teken = "  " if score >= 0.6 else "??"
            if score < 0.6:
                twijfel += 1
            print(f"{teken} {lijst[j]['n']:>3} {lijst[j]['text']!r:<40} <- stukje {i:>3} {stukjes[i][0]:7.2f}s  hoorde {transcripten[i]!r}")
            koppels.append((j, stukjes[i]))
        elif soort == "extra":
            print(f"-- extra stukje {i} ({stukjes[i][0]:.2f}s): {transcripten[i]!r} (overgeslagen)")
        elif soort == "mist":
            twijfel += 1
            print(f"!! regel {lijst[j]['n']} {lijst[j]['text']!r} niet gevonden")
        elif soort == "samen":
            twijfel += 1
            print(f"!! regels {lijst[j]['n']}+{lijst[j+1]['n']} samen in stukje {i}: {transcripten[i]!r}")
    print(f"\n{len(koppels)} gekoppeld, {twijfel} twijfelgevallen")

    if schrijf:
        for j, (van, tot) in koppels:
            doel = ROOT / lijst[j]["path"]
            doel.parent.mkdir(parents=True, exist_ok=True)
            snij(opname, van, tot, doel)
        print(f"{len(koppels)} clips geschreven")


main()
