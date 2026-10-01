"""Tekent het prinsessenkasteel voor de kasteel-achtergrond (eigen tekening).

Pastelroze muren met ronde torens, kantelen, spitse daken in roze, paars, blauw en geel
met vlaggetjes, een lichtblauwe boogdeur en roze/gele raampjes.

  python bronbestanden/teken-kasteel.py   -> public/assets/achtergrond/kasteel-eigen.svg
"""
from pathlib import Path

LIJN = '#c77aa6'
MUUR = '#f8cfe2'
MUUR_LICHT = '#fde6f0'
MUUR_DONKER = '#eeb3d0'
DAK = {'roze': ('#f47fb4', '#d95f98'), 'paars': ('#a88be6', '#8466cf'),
       'blauw': ('#86aef2', '#5f8be0'), 'geel': ('#ffd865', '#f0b93a')}
VLAG = {'roze': '#ff6fae', 'paars': '#9b7fe0', 'blauw': '#6fa8f0', 'geel': '#ffc93a'}

delen: list[str] = []


def raam(cx: float, y: float, w: float, h: float, kleur: str = '#ffe9a8') -> str:
    """Boograampje met een randje."""
    r = w / 2
    return (f'<path d="M{cx - r:.1f} {y + h:.1f} V{y + r:.1f} A{r:.1f} {r:.1f} 0 0 1 {cx + r:.1f} {y + r:.1f} '
            f'V{y + h:.1f} Z" fill="{kleur}" stroke="{LIJN}" stroke-width="1.6"/>')


def kantelen(x: float, w: float, y: float, n: int, h: float = 9) -> str:
    """Rij kantelen bovenop een muur of toren (blokjes met gaten ertussen)."""
    stap = w / (2 * n - 1)
    d = ''.join(f'<rect x="{x + i * 2 * stap:.1f}" y="{y - h:.1f}" width="{stap:.1f}" height="{h + 1:.1f}" '
                f'fill="{MUUR}" stroke="{LIJN}" stroke-width="2"/>' for i in range(n))
    return d


def toren(x: float, w: float, top: float, onder: float, dak: str | None, dakh: float,
          vlag: str | None = None, ramen: int = 1, rand: bool = True, raamkleur: str = '#ffe9a8') -> None:
    """Ronde toren: lijf met schaduw aan de zijkant, een rand, en een spits dak (of kantelen)."""
    cx = x + w / 2
    delen.append(f'<rect x="{x}" y="{top}" width="{w}" height="{onder - top}" fill="{MUUR}" stroke="{LIJN}" stroke-width="2.5"/>')
    delen.append(f'<rect x="{x + w * 0.72:.1f}" y="{top + 2}" width="{w * 0.26:.1f}" height="{onder - top - 3}" fill="{MUUR_DONKER}" opacity="0.7"/>')
    delen.append(f'<rect x="{x + w * 0.1:.1f}" y="{top + 2}" width="{w * 0.12:.1f}" height="{onder - top - 3}" fill="{MUUR_LICHT}" opacity="0.8"/>')
    if rand:
        delen.append(f'<rect x="{x - 4}" y="{top - 6}" width="{w + 8}" height="9" rx="2" fill="{MUUR}" stroke="{LIJN}" stroke-width="2.2"/>')
    for i in range(ramen):
        rw = min(12, w * 0.32)
        delen.append(raam(cx, top + 18 + i * 34, rw, rw * 1.6, raamkleur))
    if dak:
        kl, sch = DAK[dak]
        basis = top - (6 if rand else 0)
        breed = w / 2 + (8 if rand else 4)
        punt = basis - dakh
        # Licht gebogen kegeldak met een donkere helft.
        delen.append(f'<path d="M{cx - breed:.1f} {basis:.1f} Q{cx - breed * 0.35:.1f} {basis - dakh * 0.45:.1f} {cx:.1f} {punt:.1f} '
                     f'Q{cx + breed * 0.35:.1f} {basis - dakh * 0.45:.1f} {cx + breed:.1f} {basis:.1f} Z" fill="{kl}" stroke="{LIJN}" stroke-width="2.3" stroke-linejoin="round"/>')
        delen.append(f'<path d="M{cx:.1f} {punt:.1f} Q{cx + breed * 0.35:.1f} {basis - dakh * 0.45:.1f} {cx + breed:.1f} {basis:.1f} '
                     f'L{cx + breed * 0.25:.1f} {basis:.1f} Q{cx + breed * 0.1:.1f} {basis - dakh * 0.5:.1f} {cx:.1f} {punt:.1f} Z" fill="{sch}" opacity="0.6"/>')
        delen.append(f'<ellipse cx="{cx:.1f}" cy="{basis:.1f}" rx="{breed:.1f}" ry="3.5" fill="{sch}" stroke="{LIJN}" stroke-width="2"/>')
        if vlag:
            delen.append(f'<path d="M{cx:.1f} {punt:.1f} V{punt - 20:.1f}" stroke="{LIJN}" stroke-width="2"/>')
            delen.append(f'<path class="kasteel__vlag" d="M{cx:.1f} {punt - 20:.1f} C{cx + 8:.1f} {punt - 23:.1f} {cx + 12:.1f} {punt - 16:.1f} {cx + 20:.1f} {punt - 18:.1f} '
                         f'L{cx + 16:.1f} {punt - 13:.1f} C{cx + 10:.1f} {punt - 12:.1f} {cx + 6:.1f} {punt - 15:.1f} {cx:.1f} {punt - 12:.1f} Z" fill="{VLAG[vlag]}" stroke="{LIJN}" stroke-width="1.3"/>')
        else:
            delen.append(f'<circle cx="{cx:.1f}" cy="{punt - 3:.1f}" r="3.5" fill="#ffe36e" stroke="{LIJN}" stroke-width="1.3"/>')
    else:
        delen.append(kantelen(x - 4, w + 8, top - 6, 3 if w < 40 else 4))


# ---- Achterste rij: hoge slanke torens ----
toren(190, 34, 78, 260, 'blauw', 70, 'roze', ramen=3)
toren(150, 28, 118, 260, 'roze', 58, 'roze', ramen=2)
toren(240, 28, 110, 260, 'roze', 60, 'blauw', ramen=2)
toren(112, 22, 160, 270, 'paars', 44, None, ramen=1)
toren(292, 24, 150, 270, 'geel', 46, None, ramen=1)

# ---- Middenstuk met een puntgevel en een roosvenster ----
delen.append(f'<rect x="150" y="196" width="122" height="96" fill="{MUUR}" stroke="{LIJN}" stroke-width="2.5"/>')
delen.append(f'<path d="M144 198 L211 146 L278 198 Z" fill="{MUUR_LICHT}" stroke="{LIJN}" stroke-width="2.5" stroke-linejoin="round"/>')
delen.append(f'<path d="M140 200 L211 142 L282 200" fill="none" stroke="{DAK["roze"][0]}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>')
delen.append(f'<circle cx="211" cy="182" r="11" fill="#ffd1e6" stroke="{LIJN}" stroke-width="2"/>')
delen.append(f'<path d="M211 171 V193 M200 182 H222 M203 174 L219 190 M219 174 L203 190" stroke="{LIJN}" stroke-width="1.3"/>')
delen.append('<circle cx="211" cy="182" r="3.5" fill="#ff7fb8"/>')
delen.append(raam(176, 214, 12, 20, '#ff9cc6'))
delen.append(raam(246, 214, 12, 20, '#ff9cc6'))

# ---- Voorste muur met kantelen, ronde torens en de poort ----
delen.append(f'<rect x="60" y="270" width="300" height="84" fill="{MUUR}" stroke="{LIJN}" stroke-width="2.5"/>')
delen.append(f'<rect x="60" y="270" width="300" height="10" fill="{MUUR_DONKER}" opacity="0.6"/>')
delen.append(kantelen(60, 300, 270, 15))
for cx in (110, 150, 270, 310):
    delen.append(raam(cx, 292, 9, 15))
toren(34, 40, 228, 356, 'paars', 62, 'paars', ramen=2, raamkleur='#ff9cc6')
toren(346, 40, 222, 356, 'roze', 74, 'roze', ramen=2, raamkleur='#ff9cc6')
toren(90, 30, 250, 356, None, 0, ramen=1)
toren(300, 30, 250, 356, None, 0, ramen=1)

# Poort: lichtblauwe boogdeur in een roze boog, met een hartje erboven.
delen.append(f'<path d="M178 356 V316 A33 33 0 0 1 244 316 V356 Z" fill="{MUUR_LICHT}" stroke="{LIJN}" stroke-width="2.5"/>')
delen.append(f'<path d="M186 356 V318 A25 25 0 0 1 236 318 V356 Z" fill="#a9d6f7" stroke="#6aa7d6" stroke-width="2"/>')
delen.append('<path d="M196 356 V322 M211 356 V296 M226 356 V322" stroke="#7fb8e3" stroke-width="2"/>')
delen.append('<circle cx="205" cy="336" r="2.2" fill="#ffe36e"/><circle cx="217" cy="336" r="2.2" fill="#ffe36e"/>')
delen.append('<path d="M211 286 C205 279 196 285 203 292 L211 298 L219 292 C226 285 217 279 211 286 Z" fill="#ff7fb8" stroke="#d95f98" stroke-width="1.4"/>')

# Klimrozen langs de muur.
for x0 in (70, 340):
    delen.append(f'<path d="M{x0} 356 C{x0 + 6} 336 {x0 - 4} 318 {x0 + 4} 298" stroke="#7cc06a" stroke-width="2.5" fill="none" stroke-linecap="round"/>')
    for y, dx in ((346, 2), (326, -2), (306, 3)):
        delen.append(f'<circle cx="{x0 + dx}" cy="{y}" r="4.5" fill="#ff8cc0" stroke="#d95f98" stroke-width="1.2"/>')

svg = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -28 420 386">\n  '
       + '\n  '.join(delen) + '\n</svg>\n')
uit = Path(__file__).resolve().parent.parent / 'public' / 'assets' / 'achtergrond' / 'kasteel-eigen.svg'
uit.write_text(svg, encoding='utf8')
print('geschreven:', uit, len(svg), 'tekens')
