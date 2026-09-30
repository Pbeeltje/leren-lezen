# Snijdt de 12 zwart-wit plaatjes uit plaatje_zin_woord_zwart_wit_g3_1.jpg (juf-milou.nl,
# "Woord bij plaatje - onderstreep het juiste woord"). Rasterlijnen gemeten met een
# pixelscan: rijen (boven, onder) en de plaatjeskolommen links (58-294) en rechts (649-885).
from pathlib import Path
from PIL import Image

HIER = Path(__file__).parent
BRON = HIER / "plaatje_zin_woord_zwart_wit_g3_1.jpg"
DOEL = HIER.parent / "public" / "assets" / "images" / "woorden" / "milou"
DOEL.mkdir(parents=True, exist_ok=True)

RIJEN = [(235, 413), (460, 637), (684, 861), (909, 1086), (1133, 1310), (1357, 1535)]
KOLOMMEN = [(58, 294), (649, 885)]
WOORDEN = [["pijl", "gras"], ["voet", "kooi"], ["taart", "riet"], ["tuin", "zing"], ["gier", "kar"], ["weeg", "flos"]]
INSET = 7  # binnen de rasterlijn blijven

img = Image.open(BRON).convert("RGB")
for (y0, y1), rij in zip(RIJEN, WOORDEN):
    for (x0, x1), woord in zip(KOLOMMEN, rij):
        img.crop((x0 + INSET, y0 + INSET, x1 - INSET, y1 - INSET)).save(DOEL / f"{woord}.png")
print("klaar")
