# Crops the original Veilig Leren Lezen (maan-versie) kern 1-6 artwork from
# a7400e78ea3f6edc86523b4ab50f1c7a.jpg. Card x-ranges and band tops were measured with
# a non-white pixel run scan; label_top is where each row's white word strip begins, so
# crops stop above the printed word (it would give the answer away).
from pathlib import Path
from PIL import Image

SRC = Path(__file__).parent / "a7400e78ea3f6edc86523b4ab50f1c7a.jpg"
OUT = Path(__file__).parent / "_staged" / "vll"
OUT.mkdir(parents=True, exist_ok=True)

ROWS = [
    # (band_top, label_top, [(word, x0, x1), ...])
    (16, 88, [("maan", 70, 146), ("roos", 153, 231), ("vis", 234, 315), ("ik", 320, 399),
              ("sok", 404, 481), ("aan", 484, 567), ("pen", 569, 647), ("en", 649, 726)]),
    (136, 203, [("teen", 70, 149), ("een", 151, 230), ("neus", 233, 311), ("buik", 317, 394), ("oog", 398, 477)]),
    (236, 307, [("doos", 73, 147), ("poes", 154, 229), ("koek", 231, 309), ("ijs", 316, 382), ("zeep", 392, 470)]),
    (338, 408, [("huis", 75, 155), ("weg", 158, 242), ("bos", 245, 329), ("tak", 331, 415), ("hut", 417, 495)]),
    (443, 510, [("reus", 76, 156), ("jas", 159, 239), ("riem", 242, 321), ("bijl", 323, 402),
                ("hout", 405, 481), ("vuur", 483, 563)]),
    (543, 613, [("geit", 73, 156), ("uil", 159, 239), ("pauw", 243, 320), ("duif", 324, 405), ("ei", 407, 481)]),
]
INSET = 5  # stay inside the coloured card frame


def trim_white_edges(crop: Image.Image) -> Image.Image:
    # Some cards' word strips start a few px higher than their row's label_top (koek showed
    # the tops of its letters). Only trim the bottom, and at most 6 rows: many pictures have
    # white clouds/sky, and trimming every white edge ate into ijs, duif and neus.
    import numpy as np
    a = np.asarray(crop).astype(int).sum(axis=2) > 660
    bottom = a.shape[0]
    while bottom > a.shape[0] - 6 and a[bottom - 1].mean() > 0.6:
        bottom -= 1
    # Final 2px shave on every side removes leftover card-frame/JPEG-fringe lines.
    return crop.crop((2, 2, a.shape[1] - 2, bottom - 2))


img = Image.open(SRC).convert("RGB")
for top, label_top, cards in ROWS:
    for word, x0, x1 in cards:
        box = (x0 + INSET, top + INSET + 1, x1 - INSET + 1, label_top - 7)
        trim_white_edges(img.crop(box)).save(OUT / f"{word}.png")
print("done")
