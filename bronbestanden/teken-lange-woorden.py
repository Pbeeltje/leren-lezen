"""Eigen plaatjes voor de hoofdstukken met lange woorden (geen Fluent-emoji voor deze).

  python bronbestanden/teken-lange-woorden.py

- kam: een kam met tanden
- borstel: een haarborstel
- stegosaurus: groene dino met platen op de rug en stekels aan de staart
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


def main() -> None:
    schrijf('kam', svg(kam(), 'Een kam'))
    schrijf('borstel', svg(borstel(), 'Een haarborstel'))
    schrijf('stegosaurus', svg(stegosaurus(), 'Een stegosaurus'))


if __name__ == '__main__':
    main()
