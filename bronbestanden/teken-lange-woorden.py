"""Eigen plaatjes voor de hoofdstukken met lange woorden (geen Fluent-emoji voor deze).

  python bronbestanden/teken-lange-woorden.py

- kam: een kam met tanden
- borstel: een haarborstel
- stegosaurus: groene dino met platen op de rug en stekels aan de staart
- spijker, plakband (rolletje in houder), pan (koekenpan), tang
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


def main() -> None:
    schrijf('spijker', svg(spijker(), 'Een spijker'))
    schrijf('plakband', svg(plakband(), 'Een rol plakband in een houder'))
    schrijf('pan', svg(pan(), 'Een koekenpan'))
    schrijf('tang', svg(tang(), 'Een tang'))
    schrijf('kam', svg(kam(), 'Een kam'))
    schrijf('borstel', svg(borstel(), 'Een haarborstel'))
    schrijf('stegosaurus', svg(stegosaurus(), 'Een stegosaurus'))


if __name__ == '__main__':
    main()
