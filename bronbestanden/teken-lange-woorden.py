"""Eigen plaatjes voor de hoofdstukken met lange woorden (geen Fluent-emoji voor deze).

  python bronbestanden/teken-lange-woorden.py

- kam: een kam met tanden
- borstel: een haarborstel
- stegosaurus: groene dino met platen op de rug en stekels aan de staart
- spijker, plakband (rolletje in houder), pan (koekenpan), tang
- triangel, tamboerijn, drumstel, gong, tuba, orgel
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WOORDEN = ROOT / 'public/assets/images/woorden'


def svg(inhoud: str, notitie: str, vb: str = '0 0 120 120') -> str:
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}">\n  <!-- {notitie}, zelf getekend voor leren-lezen. -->\n{inhoud}\n</svg>\n'


def schrijf(naam: str, tekst: str) -> None:
    pad = WOORDEN / f'{naam}.svg'
    pad.write_text(tekst, encoding='utf-8')
    print('schreef', pad.relative_to(ROOT))


def kam() -> str:
    tanden = '\n'.join(
        f'    <rect x="{x}" y="58" width="5" height="{30 if i % 4 else 34}" rx="2.5"/>'
        for i, x in enumerate(range(16, 104, 8))
    )
    return f'''  <g transform="rotate(-12 60 60)">
  <g fill="#ec407a" stroke="#ad1457" stroke-width="2">
{tanden}
  </g>
  <rect x="10" y="38" width="100" height="24" rx="8" fill="#f06292" stroke="#ad1457" stroke-width="3"/>
  <rect x="18" y="43" width="60" height="5" rx="2.5" fill="#f8bbd0"/>
  </g>'''


def borstel() -> str:
    # Van opzij: steel links, kop rechts met haren die omhoog steken (bolletjes aan de punt).
    xs = range(52, 112, 7)
    haren = '\n'.join(f'    <line x1="{x}" y1="58" x2="{x}" y2="34"/>' for x in xs)
    bolletjes = '\n'.join(f'    <circle cx="{x}" cy="33" r="3.2"/>' for x in xs)
    return f'''  <g transform="rotate(-10 60 60)">
  <g stroke="#37474f" stroke-width="3" stroke-linecap="round">
{haren}
  </g>
  <g fill="#455a64">
{bolletjes}
  </g>
  <path d="M6 70 C6 62 14 60 24 61 L46 60 C50 56 56 56 60 56 L112 56 C116 56 118 60 118 64 L118 70 C118 76 114 78 110 78 L58 78 C52 78 48 76 44 74 L24 75 C14 76 6 76 6 70 Z"
        fill="#8d6e63" stroke="#4e342e" stroke-width="3" stroke-linejoin="round"/>
  <rect x="62" y="61" width="50" height="5" rx="2.5" fill="#bcaaa4"/>
  <rect x="14" y="65" width="26" height="4" rx="2" fill="#bcaaa4"/>
  </g>'''


def stegosaurus() -> str:
    # Platen van voor (klein) naar achter: x, y van de voet, hoogte.
    platen = [(34, 52, 12), (44, 46, 17), (55, 43, 21), (66, 43, 21), (77, 46, 17), (87, 52, 12)]
    plaat_svg = '\n'.join(
        f'    <path d="M{x - 6} {y + 4} L{x} {y - h} L{x + 6} {y + 4} Z"/>' for x, y, h in platen
    )
    return f'''  <g fill="#ff8a65" stroke="#d84315" stroke-width="2.5" stroke-linejoin="round">
{plaat_svg}
  </g>
  <g fill="#e64a19" stroke="#bf360c" stroke-width="2" stroke-linejoin="round">
    <path d="M104 64 L114 52 L108 66 Z"/>
    <path d="M108 70 L119 62 L111 73 Z"/>
  </g>
  <path d="M8 66 C8 58 16 54 24 58 C34 44 80 40 96 56 C102 60 108 64 112 70 C104 74 98 74 92 74 C80 84 40 86 26 74 C18 74 8 74 8 66 Z"
        fill="#7cb342" stroke="#33691e" stroke-width="3" stroke-linejoin="round"/>
  <path d="M30 72 C44 80 76 80 88 72" fill="none" stroke="#c5e1a5" stroke-width="5" stroke-linecap="round"/>
  <g fill="#689f38" stroke="#33691e" stroke-width="3" stroke-linejoin="round">
    <rect x="30" y="74" width="11" height="24" rx="4"/>
    <rect x="46" y="76" width="11" height="22" rx="4"/>
    <rect x="68" y="76" width="11" height="22" rx="4"/>
    <rect x="82" y="72" width="11" height="26" rx="4"/>
  </g>
  <circle cx="15" cy="63" r="2.6" fill="#1b1b1b"/>
  <path d="M9 69 Q13 71 17 69" fill="none" stroke="#33691e" stroke-width="2" stroke-linecap="round"/>'''


def spijker() -> str:
    return '''  <g transform="rotate(35 60 60)">
  <rect x="38" y="12" width="44" height="10" rx="4" fill="#b0bec5" stroke="#455a64" stroke-width="3"/>
  <path d="M54 22 L66 22 L65 92 L60 110 L55 92 Z" fill="#cfd8dc" stroke="#455a64" stroke-width="3" stroke-linejoin="round"/>
  <rect x="57" y="26" width="3" height="62" rx="1.5" fill="#eceff1"/>
  </g>'''


def plakband() -> str:
    # Een rolletje plakband in een houdertje, met een stukje band dat eruit hangt.
    return '''  <path d="M14 96 L106 96 L100 108 L20 108 Z" fill="#e53935" stroke="#b71c1c" stroke-width="3" stroke-linejoin="round"/>
  <path d="M30 96 C30 70 40 64 60 64 C80 64 90 70 90 96 Z" fill="#ef5350" stroke="#b71c1c" stroke-width="3"/>
  <circle cx="58" cy="56" r="34" fill="#e0f7fa" fill-opacity="0.85" stroke="#4dd0e1" stroke-width="3"/>
  <circle cx="58" cy="56" r="26" fill="none" stroke="#b2ebf2" stroke-width="4"/>
  <circle cx="58" cy="56" r="17" fill="#fff8e1" stroke="#8d6e63" stroke-width="3"/>
  <path d="M90 62 L110 72 L106 84 L88 74 Z" fill="#e0f7fa" fill-opacity="0.9" stroke="#4dd0e1" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M104 70 L112 66 L110 74 L114 78 L106 84" fill="#cfd8dc" stroke="#607d8b" stroke-width="2" stroke-linejoin="round"/>'''


def pan() -> str:
    # Koekenpan van bovenaf schuin, steel naar rechts.
    return '''  <rect x="70" y="56" width="46" height="12" rx="6" fill="#5d4037" stroke="#3e2723" stroke-width="3" transform="rotate(-8 70 62)"/>
  <ellipse cx="44" cy="66" rx="40" ry="30" fill="#37474f" stroke="#263238" stroke-width="3"/>
  <ellipse cx="44" cy="62" rx="32" ry="22" fill="#546e7a"/>
  <path d="M24 56 C30 48 44 46 54 48" fill="none" stroke="#90a4ae" stroke-width="4" stroke-linecap="round"/>'''


def tang() -> str:
    # Combinatietang: korte, dichte, brede bek met ribbels (geen schaar!), dikke
    # gebogen rode handvatten die uit elkaar staan.
    return '''  <g stroke-linejoin="round" stroke-width="3">
  <path d="M54 58 C48 76 38 94 30 112 C26 116 18 112 20 106 C28 88 40 70 50 52 Z" fill="#e53935" stroke="#b71c1c"/>
  <path d="M66 58 C72 76 82 94 90 112 C94 116 102 112 100 106 C92 88 80 70 70 52 Z" fill="#e53935" stroke="#b71c1c"/>
  <path d="M46 56 C44 40 48 22 56 10 L64 10 C72 22 76 40 74 56 Z" fill="#90a4ae" stroke="#455a64"/>
  </g>
  <path d="M60 12 L60 40" stroke="#455a64" stroke-width="2.5"/>
  <g stroke="#607d8b" stroke-width="2" stroke-linecap="round">
    <path d="M53 24 L67 24"/><path d="M52 30 L68 30"/><path d="M51 36 L69 36"/>
  </g>
  <circle cx="60" cy="50" r="7" fill="#cfd8dc" stroke="#455a64" stroke-width="3"/>'''


def triangel() -> str:
    # Driehoek met een opening linksonder, aan een touwtje, met een stokje ernaast.
    return '''  <path d="M60 8 L60 22" stroke="#e53935" stroke-width="3" stroke-linecap="round"/>
  <path d="M42 104 L16 104 L60 24 L104 104 L52 104" fill="none" stroke="#90a4ae" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"/>
  <path d="M42 104 L16 104 L60 24 L104 104 L52 104" fill="none" stroke="#eceff1" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
  <path d="M84 36 L112 18" stroke="#78909c" stroke-width="5" stroke-linecap="round"/>
  <g stroke="#ffb300" stroke-width="2.5" stroke-linecap="round" fill="none">
    <path d="M14 44 C8 50 8 60 14 66"/><path d="M9 38 C3 48 3 62 9 72"/>
  </g>'''


def tamboerijn() -> str:
    # Houten ring met vel en belletjes (koperen schijfjes) rondom.
    import math
    schijfjes = '\n'.join(
        f'    <ellipse cx="{60 + 47 * math.cos(math.radians(a)):.1f}" cy="{60 + 47 * math.sin(math.radians(a)):.1f}" rx="8" ry="5" transform="rotate({a + 90} {60 + 47 * math.cos(math.radians(a)):.1f} {60 + 47 * math.sin(math.radians(a)):.1f})"/>'
        for a in range(0, 360, 60)
    )
    return f'''  <circle cx="60" cy="60" r="50" fill="#d7a86e" stroke="#8d6e63" stroke-width="3"/>
  <circle cx="60" cy="60" r="40" fill="#fff3e0" stroke="#bcaaa4" stroke-width="2.5"/>
  <circle cx="60" cy="60" r="18" fill="none" stroke="#ef9a9a" stroke-width="4"/>
  <g fill="#ffca28" stroke="#f57f17" stroke-width="2">
{schijfjes}
  </g>'''


def drumstel() -> str:
    return '''  <g stroke-linecap="round">
    <path d="M18 44 L18 104 M8 104 L28 104" stroke="#78909c" stroke-width="3"/>
    <path d="M102 40 L102 104 M92 104 L112 104" stroke="#78909c" stroke-width="3"/>
  </g>
  <ellipse cx="18" cy="42" rx="17" ry="4" fill="#ffca28" stroke="#f57f17" stroke-width="2"/>
  <ellipse cx="102" cy="38" rx="17" ry="4" fill="#ffca28" stroke="#f57f17" stroke-width="2"/>
  <rect x="30" y="34" width="24" height="18" rx="3" fill="#1e88e5" stroke="#0d47a1" stroke-width="2.5"/>
  <rect x="66" y="34" width="24" height="18" rx="3" fill="#1e88e5" stroke="#0d47a1" stroke-width="2.5"/>
  <circle cx="60" cy="80" r="30" fill="#1e88e5" stroke="#0d47a1" stroke-width="3"/>
  <circle cx="60" cy="80" r="22" fill="#e3f2fd" stroke="#90caf9" stroke-width="2.5"/>
  <circle cx="60" cy="80" r="6" fill="#90caf9"/>
  <rect x="80" y="92" width="26" height="14" rx="3" fill="#1e88e5" stroke="#0d47a1" stroke-width="2.5"/>
  <path d="M84 92 L84 106 M102 92 L102 106" stroke="#bbdefb" stroke-width="2"/>'''


def gong() -> str:
    return '''  <path d="M14 112 L22 14 M106 112 L98 14 M16 18 L104 18" stroke="#8d6e63" stroke-width="7" stroke-linecap="round"/>
  <path d="M46 18 L48 30 M74 18 L72 30" stroke="#5d4037" stroke-width="2.5"/>
  <circle cx="60" cy="64" r="36" fill="#ffb300" stroke="#e65100" stroke-width="3"/>
  <circle cx="60" cy="64" r="26" fill="none" stroke="#ffe082" stroke-width="3"/>
  <circle cx="60" cy="64" r="11" fill="#ffca28" stroke="#ef6c00" stroke-width="2.5"/>
  <path d="M44 48 C48 44 54 42 58 42" fill="none" stroke="#fff8e1" stroke-width="3" stroke-linecap="round"/>'''


def tuba() -> str:
    # Grote koperen tuba: brede beker omhoog, ronde gekrulde buis onderaan,
    # drie ventielen opzij en een mondstuk.
    return '''  <ellipse cx="60" cy="86" rx="30" ry="22" fill="none" stroke="#e65100" stroke-width="18"/>
  <ellipse cx="60" cy="86" rx="30" ry="22" fill="none" stroke="#ffb300" stroke-width="12"/>
  <path d="M42 70 C44 62 50 56 56 54" fill="none" stroke="#ffe082" stroke-width="3" stroke-linecap="round"/>
  <path d="M60 64 L60 50 C60 40 48 26 34 16 L106 16 C92 26 80 40 80 50 L80 64 Z"
        fill="#ffc107" stroke="#e65100" stroke-width="3" stroke-linejoin="round"/>
  <ellipse cx="70" cy="16" rx="36" ry="8" fill="#ffe082" stroke="#e65100" stroke-width="3"/>
  <ellipse cx="70" cy="16" rx="28" ry="5" fill="#ffb300"/>
  <path d="M66 50 C66 42 60 34 52 28" fill="none" stroke="#fff8e1" stroke-width="3" stroke-linecap="round"/>
  <g fill="#cfd8dc" stroke="#607d8b" stroke-width="2.5">
    <rect x="22" y="44" width="7" height="24" rx="2"/><rect x="31" y="44" width="7" height="24" rx="2"/><rect x="40" y="44" width="7" height="24" rx="2"/>
    <ellipse cx="25.5" cy="42" rx="5" ry="3"/><ellipse cx="34.5" cy="42" rx="5" ry="3"/><ellipse cx="43.5" cy="42" rx="5" ry="3"/>
  </g>
  <path d="M22 56 L8 46" stroke="#e65100" stroke-width="5" stroke-linecap="round"/>
  <path d="M22 56 L8 46" stroke="#ffca28" stroke-width="2" stroke-linecap="round"/>'''


def orgel() -> str:
    # Orgel: rij zilveren pijpen (midden het hoogst) op een houten kast met toetsen.
    pijpen = []
    hoogtes = [30, 40, 50, 60, 50, 40, 30]
    for i, h in enumerate(hoogtes):
        x = 22 + i * 11
        pijpen.append(f'    <rect x="{x}" y="{70 - h}" width="9" height="{h}" rx="2"/>')
        pijpen.append(f'    <path d="M{x + 2} {66} L{x + 7} {66} L{x + 4.5} {61} Z" fill="#37474f" stroke="none"/>')
    pijp_svg = '\n'.join(pijpen)
    toetsen = '\n'.join(f'    <rect x="{24 + i * 9}" y="82" width="8" height="12" rx="1"/>' for i in range(8))
    zwart = '\n'.join(f'    <rect x="{30 + i * 9}" y="82" width="4" height="7"/>' for i in (0, 1, 3, 4, 5))
    return f'''  <g fill="#cfd8dc" stroke="#607d8b" stroke-width="2">
{pijp_svg}
  </g>
  <rect x="14" y="68" width="92" height="44" rx="4" fill="#8d6e63" stroke="#4e342e" stroke-width="3"/>
  <rect x="20" y="78" width="80" height="20" rx="2" fill="#5d4037"/>
  <g fill="#fafafa" stroke="#9e9e9e" stroke-width="1">
{toetsen}
  </g>
  <g fill="#212121">
{zwart}
  </g>'''


def main() -> None:
    schrijf('tuba', svg(tuba(), 'Een tuba'))
    schrijf('orgel', svg(orgel(), 'Een orgel'))
    schrijf('triangel', svg(triangel(), 'Een triangel'))
    schrijf('tamboerijn', svg(tamboerijn(), 'Een tamboerijn'))
    schrijf('drumstel', svg(drumstel(), 'Een drumstel'))
    schrijf('gong', svg(gong(), 'Een gong'))
    schrijf('spijker', svg(spijker(), 'Een spijker'))
    schrijf('plakband', svg(plakband(), 'Een rol plakband in een houder'))
    schrijf('pan', svg(pan(), 'Een koekenpan'))
    schrijf('tang', svg(tang(), 'Een tang'))
    schrijf('kam', svg(kam(), 'Een kam'))
    schrijf('borstel', svg(borstel(), 'Een haarborstel'))
    schrijf('stegosaurus', svg(stegosaurus(), 'Een stegosaurus'))


if __name__ == '__main__':
    main()
