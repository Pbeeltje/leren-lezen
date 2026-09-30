# Tekent de schattige (kawaii) weerplaatjes in public/assets/images/woorden/weer/.
# Eigen tekeningen, geïnspireerd op de stijl van een voorbeeldset (niet overgenomen).
from pathlib import Path

DOEL = Path(__file__).resolve().parent.parent / "public" / "assets" / "images" / "woorden" / "weer"
DOEL.mkdir(parents=True, exist_ok=True)
LIJN = "#4d5b7c"


def wolk(x=60, y=52, s=1.0, kleur="#f4f6ff", schaduw="#dfe4f7", rand=LIJN):
    d = ("M-34 14 C-46 14 -50 -2 -38 -8 C-40 -24 -20 -30 -12 -18 C-8 -34 18 -36 22 -16 "
         "C34 -22 48 -10 40 2 C50 6 48 16 36 16 Z")
    return (f'<g transform="translate({x} {y}) scale({s})">'
            f'<path d="{d}" fill="{kleur}" stroke="{rand}" stroke-width="{3.2 / s:.1f}" stroke-linejoin="round"/>'
            f'<path d="M-30 12 C-10 16 14 16 34 12" fill="none" stroke="{schaduw}" stroke-width="{4 / s:.1f}" stroke-linecap="round"/>'
            '</g>')


def gezicht(x, y, s=1.3, mond="lach", ogen="open"):
    o, w, h = 9 * s, 16 * s, 5 * s  # oogafstand, wangafstand, mondhoogte
    delen = []
    if ogen == "dicht":
        delen += [f'<path d="M{x-o-4*s} {y-2} q{4*s} {-4*s} {8*s} 0 M{x+o-4*s} {y-2} q{4*s} {-4*s} {8*s} 0" fill="none" stroke="#2b2f45" stroke-width="{2.4*s:.1f}" stroke-linecap="round"/>']
    else:
        delen += [f'<circle cx="{x-o}" cy="{y-2}" r="{3.2*s:.1f}" fill="#2b2f45"/>', f'<circle cx="{x+o}" cy="{y-2}" r="{3.2*s:.1f}" fill="#2b2f45"/>',
                  f'<circle cx="{x-o+1.2*s}" cy="{y-3.2*s}" r="{1.1*s:.1f}" fill="#fff"/>', f'<circle cx="{x+o+1.2*s}" cy="{y-3.2*s}" r="{1.1*s:.1f}" fill="#fff"/>']
    delen += [f'<ellipse cx="{x-w}" cy="{y+4*s}" rx="{4.8*s:.1f}" ry="{2.8*s:.1f}" fill="#ff9fb4" opacity="0.85"/>',
              f'<ellipse cx="{x+w}" cy="{y+4*s}" rx="{4.8*s:.1f}" ry="{2.8*s:.1f}" fill="#ff9fb4" opacity="0.85"/>']
    if mond == "lach":
        delen.append(f'<path d="M{x-4*s} {y+h} q{4*s} {4*s} {8*s} 0" fill="none" stroke="#2b2f45" stroke-width="{2.3*s:.1f}" stroke-linecap="round"/>')
    elif mond in ("o", "blaas"):
        delen.append(f'<ellipse cx="{x}" cy="{y+h+1.5*s}" rx="{2.8*s:.1f}" ry="{3.4*s:.1f}" fill="#2b2f45"/>')
    elif mond == "pruil":
        delen.append(f'<path d="M{x-4*s} {y+h+3*s} q{4*s} {-4*s} {8*s} 0" fill="none" stroke="#2b2f45" stroke-width="{2.3*s:.1f}" stroke-linecap="round"/>')
    return "".join(delen)


def druppel(x, y, kleur="#6fb6ff"):
    return f'<path d="M{x} {y} C{x-5} {y+8} {x-5} {y+13} {x} {y+13} C{x+5} {y+13} {x+5} {y+8} {x} {y} Z" fill="{kleur}" stroke="#3a78c2" stroke-width="2"/>'


def schicht(x, y, s=1.0):
    return (f'<g transform="translate({x} {y}) scale({s})"><path d="M4 -22 L-12 4 L0 4 L-6 24 L14 -4 L2 -4 L10 -22 Z" '
            f'fill="#ffd84a" stroke="#d99a0b" stroke-width="{2.6 / s:.1f}" stroke-linejoin="round"/></g>')


def vlok(x, y, r=7):
    armen = "".join(f'<path d="M{x} {y} l{r * c:.1f} {r * s:.1f}" />' for c, s in [(1, 0), (-1, 0), (0.5, 0.87), (-0.5, -0.87), (0.5, -0.87), (-0.5, 0.87)])
    return f'<g stroke="#8cc4ff" stroke-width="2.6" stroke-linecap="round">{armen}</g><circle cx="{x}" cy="{y}" r="2" fill="#fff" stroke="#8cc4ff" stroke-width="1.5"/>'


def ijsbol(x, y):
    return f'<circle cx="{x}" cy="{y}" r="4.6" fill="#e3f3ff" stroke="#4c8fd6" stroke-width="2"/><circle cx="{x-1.5}" cy="{y-1.5}" r="1.3" fill="#fff"/>'


def svg(inhoud):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">{inhoud}</svg>'


zonstralen = "".join(
    f'<path d="M60 60 m{30 * c:.1f} {30 * s:.1f} l{9 * c:.1f} {9 * s:.1f}" stroke="#ffb627" stroke-width="5" stroke-linecap="round"/>'
    for c, s in [(1, 0), (0.71, 0.71), (0, 1), (-0.71, 0.71), (-1, 0), (-0.71, -0.71), (0, -1), (0.71, -0.71)])

TEKENINGEN = {
    "zon": zonstralen + '<circle cx="60" cy="60" r="25" fill="#ffd84a" stroke="#e59d0c" stroke-width="3.2"/>' + gezicht(60, 60, 1.25),
    "wolk": wolk(60, 58, 1.15) + gezicht(60, 60),
    "regen": wolk(60, 46, 1.05, "#e6ecfb", "#cfd8f2") + gezicht(60, 48, mond="pruil")
             + druppel(40, 74) + druppel(60, 82) + druppel(80, 74) + druppel(50, 98) + druppel(72, 98),
    "onweer": wolk(60, 44, 1.05, "#aeb7cf", "#949fbb", "#3b4663") + gezicht(60, 46, mond="o")
              + schicht(60, 86, 1.1) + druppel(36, 74, "#8fb8e8") + druppel(86, 76, "#8fb8e8"),
    "bliksem": schicht(60, 60, 2.2) + gezicht(58, 54, 0.9, mond="o"),
    "sneeuw": wolk(60, 44, 1.05) + gezicht(60, 46, ogen="dicht") + vlok(38, 80) + vlok(60, 94, 8) + vlok(82, 80),
    "hagel": wolk(60, 44, 1.05, "#dde4f5", "#c7d1ec") + gezicht(60, 46, mond="o")
             + ijsbol(36, 76) + ijsbol(54, 84) + ijsbol(72, 78) + ijsbol(88, 88) + ijsbol(46, 100) + ijsbol(66, 102),
    "wind": wolk(48, 52, 0.95) + gezicht(46, 54, 1.15, mond="blaas")
            + '<g fill="none" stroke="#7fb2e0" stroke-width="4" stroke-linecap="round">'
              '<path d="M80 46 h18 c8 0 8 -12 0 -10"/><path d="M78 60 h28 c9 0 9 13 0 11"/><path d="M76 74 h16"/></g>',
    "regenboog": '<g fill="none" stroke-linecap="round" stroke-width="8">'
                 + "".join(f'<path d="M{10 + i * 8} 88 A{50 - i * 8} {50 - i * 8} 0 0 1 {110 - i * 8} 88" stroke="{k}"/>'
                           for i, k in enumerate(["#ff6b6b", "#ffa94d", "#ffd84a", "#69db7c", "#74c0fc", "#b197fc"]))
                 + '</g>' + wolk(20, 90, 0.62) + wolk(100, 90, 0.62) + gezicht(20, 91, 0.75) + gezicht(100, 91, 0.75),
}

for naam, inhoud in TEKENINGEN.items():
    (DOEL / f"{naam}.svg").write_text(svg(inhoud), encoding="utf-8")
print("klaar:", ", ".join(TEKENINGEN))
