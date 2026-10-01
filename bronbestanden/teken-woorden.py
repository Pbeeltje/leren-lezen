"""Eigen woordplaatjes voor leren-lezen (vervangen de plaatjes uit VLL, juf-milou en
werkbladen, die niet vrij te gebruiken zijn).

  python bronbestanden/teken-woorden.py <map-met-fluent-svgs>

Schrijft naar public/assets/images/woorden/ en public/assets/images/vingers/:
- zelf getekende plaatjes (pot, kous, muts, buik, riem, kar, gier, riet, hulst, mol,
  trui, reus, pijl, gras, kooi) en de vingerhanden 1-10;
- samengestelde plaatjes uit Fluent Emoji-onderdelen (MIT): en, fruit, bos, flos, teen;
- de losse Fluent Emoji (aap, beer, ...) worden gewoon gekopieerd.
"""
import math
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WOORDEN = ROOT / 'public/assets/images/woorden'
VINGERS = ROOT / 'public/assets/images/vingers'
FLUENT = Path(sys.argv[1]) if len(sys.argv) > 1 else None


def svg(inhoud: str, notitie: str, vb: str = '0 0 120 120') -> str:
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}">\n  <!-- {notitie}, zelf getekend voor leren-lezen. -->\n{inhoud}\n</svg>\n'


def schrijf(pad: Path, tekst: str) -> None:
    pad.write_text(tekst, encoding='utf-8')
    print('schreef', pad.relative_to(ROOT))


# ---------- Fluent-onderdelen inbedden (ids voorvoegen, anders botsen de verlopen) ----------
def inbed(naam: str, x: float, y: float, maat: float, voorvoegsel: str, extra: str = '', bron: Path | None = None) -> str:
    tekst = ((bron or FLUENT) / f'{naam}.svg').read_text(encoding='utf-8')
    vb = re.search(r'viewBox="([^"]+)"', tekst).group(1)
    binnen = tekst[tekst.index('>', tekst.index('<svg')) + 1 : tekst.rindex('</svg>')]
    binnen = re.sub(r'id="([^"]+)"', lambda m: f'id="{voorvoegsel}{m.group(1)}"', binnen)
    binnen = re.sub(r'url\(#([^)]+)\)', lambda m: f'url(#{voorvoegsel}{m.group(1)})', binnen)
    binnen = re.sub(r'href="#([^"]+)"', lambda m: f'href="#{voorvoegsel}{m.group(1)}"', binnen)
    # Een <g> met schaal i.p.v. een geneste <svg>: in een geneste svg tekent Chrome de
    # filters van sommige emoji (de bijenvleugels) zwart.
    vx, vy, vb_b, _ = (float(v) for v in vb.split())
    schaal = maat / vb_b
    # fill="none" zoals op de Fluent-<svg> zelf, anders worden vormen zonder fill zwart.
    return f'<g fill="none" transform="translate({x} {y}) scale({schaal:.4f}) translate({-vx} {-vy})" {extra}>{binnen}</g>'


# ---------- Eigen tekeningen (viewBox 120x120, zelfde stijl als tak.svg / weg.svg) ----------
POT = '''  <rect x="22" y="28" width="76" height="20" rx="5" fill="#e8894f" stroke="#9c4a1f" stroke-width="3"/>
  <path d="M29 48 H91 L83 108 C82 112 79 114 75 114 H45 C41 114 38 112 37 108 Z" fill="#d9773f" stroke="#9c4a1f" stroke-width="3" stroke-linejoin="round"/>
  <ellipse cx="60" cy="31" rx="33" ry="4" fill="#7a3d1c"/>
  <path d="M41 56 L46 104" stroke="#f2a774" stroke-width="6" stroke-linecap="round" opacity="0.8"/>
  <path d="M29 48 H91" stroke="#9c4a1f" stroke-width="3"/>'''

KOUS = '''  <path d="M40 22 H74 V76 C74 86 80 90 90 92 C104 95 110 101 108 109 C106 116 98 117 88 117 H58 C46 117 40 110 40 99 Z" fill="#42a5f5" stroke="#1565c0" stroke-width="3" stroke-linejoin="round"/>
  <path d="M74 80 C74 88 80 92 88 93 L84 117 H70 C70 104 70 92 74 80 Z" fill="#1e88e5" opacity="0"/>
  <path d="M96 94 C106 97 110 102 108 109 C106 116 98 117 92 117 C96 110 98 102 96 94 Z" fill="#1565c0"/>
  <path d="M40 99 C40 110 46 117 58 117 H64 C56 112 54 104 56 96 C50 98 44 99 40 99 Z" fill="#1565c0"/>
  <rect x="37" y="6" width="40" height="20" rx="4" fill="#1e88e5" stroke="#1565c0" stroke-width="3"/>
  <path d="M45 10 V22 M53 10 V22 M61 10 V22 M69 10 V22" stroke="#90caf9" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M48 34 V86" stroke="#90caf9" stroke-width="5" stroke-linecap="round" opacity="0.7"/>'''

MUTS = '''  <path d="M20 86 C22 54 40 28 66 22 C86 18 100 28 104 44 C96 40 88 42 86 48 C92 60 96 72 98 86 Z" fill="#e53935" stroke="#b71c1c" stroke-width="3" stroke-linejoin="round"/>
  <path d="M36 80 C40 58 52 40 68 32" fill="none" stroke="#ef9a9a" stroke-width="5" stroke-linecap="round" opacity="0.7"/>
  <rect x="12" y="80" width="96" height="24" rx="12" fill="#fafafa" stroke="#cfd8dc" stroke-width="3"/>
  <path d="M24 92 h4 M40 90 h4 M56 93 h4 M72 90 h4 M88 92 h4" stroke="#e0e0e0" stroke-width="3" stroke-linecap="round"/>
  <circle cx="104" cy="50" r="11" fill="#fafafa" stroke="#cfd8dc" stroke-width="3"/>'''

BUIK = '''  <path d="M14 104 C38 118 82 118 106 104 L108 120 H12 Z" fill="#5d7fa8"/>
  <path d="M22 40 C40 32 80 32 98 40 C114 60 112 92 94 106 C78 117 42 117 26 106 C8 92 6 60 22 40 Z" fill="#f6c39a" stroke="#c98b5e" stroke-width="3"/>
  <path d="M30 56 C26 68 28 82 34 92" fill="none" stroke="#fde0c8" stroke-width="7" stroke-linecap="round"/>
  <path d="M56 80 C58 86 64 86 66 80" fill="none" stroke="#a86b42" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M18 6 H102 L104 40 C82 32 38 32 16 40 Z" fill="#42a5f5" stroke="#1565c0" stroke-width="3" stroke-linejoin="round"/>
  <path d="M16 36 C38 28 82 28 104 36 L104 44 C82 36 38 36 16 44 Z" fill="#1e88e5" stroke="#1565c0" stroke-width="2"/>'''

RIEM = '''  <path d="M4 50 C40 44 80 44 116 50 V76 C80 70 40 70 4 76 Z" fill="#6d4c41" stroke="#3e2723" stroke-width="3" stroke-linejoin="round"/>
  <path d="M6 56 C40 50 80 50 114 56 M6 70 C40 64 80 64 114 70" fill="none" stroke="#a1887f" stroke-width="1.6" stroke-dasharray="4 4"/>
  <circle cx="86" cy="61" r="2.8" fill="#3e2723"/><circle cx="97" cy="61.6" r="2.8" fill="#3e2723"/><circle cx="108" cy="62.4" r="2.8" fill="#3e2723"/>
  <rect x="22" y="38" width="36" height="48" rx="7" fill="none" stroke="#f9a825" stroke-width="7"/>
  <rect x="22" y="38" width="36" height="48" rx="7" fill="none" stroke="#fff176" stroke-width="2" opacity="0.8"/>
  <path d="M40 62 H62" stroke="#f9a825" stroke-width="5" stroke-linecap="round"/>'''

KAR = '''  <path d="M86 52 L112 18" stroke="#5d4037" stroke-width="5" stroke-linecap="round"/>
  <path d="M104 14 L118 24" stroke="#5d4037" stroke-width="6" stroke-linecap="round"/>
  <path d="M8 40 H98 L92 80 H14 Z" fill="#e53935" stroke="#b71c1c" stroke-width="3" stroke-linejoin="round"/>
  <path d="M10 53 H96 M12 66 H94" stroke="#b71c1c" stroke-width="2.5"/>
  <path d="M14 44 H92" stroke="#ef9a9a" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
  <g stroke="#263238" stroke-width="3">
    <circle cx="30" cy="88" r="15" fill="#455a64"/><circle cx="78" cy="88" r="15" fill="#455a64"/>
  </g>
  <circle cx="30" cy="88" r="5" fill="#cfd8dc"/><circle cx="78" cy="88" r="5" fill="#cfd8dc"/>'''

GIER = '''  <path d="M6 112 C40 108 80 108 114 112" fill="none" stroke="#795548" stroke-width="7" stroke-linecap="round"/>
  <path d="M42 102 L32 118 H64 L60 102 Z" fill="#4e342e" stroke="#3e2723" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M30 104 C22 84 28 62 48 54 C70 46 92 60 96 82 C98 96 92 104 86 108 Z" fill="#6d4c41" stroke="#3e2723" stroke-width="3" stroke-linejoin="round"/>
  <path d="M60 64 C74 66 84 76 86 94 M56 74 C68 76 76 84 78 98 M50 84 C60 86 66 92 68 102" fill="none" stroke="#4e342e" stroke-width="3" stroke-linecap="round"/>
  <path d="M38 110 h6 M44 110 l-2 4 M70 110 h6 M76 110 l-2 4" stroke="#fbc02d" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M34 58 C38 48 50 46 56 48 C62 46 74 48 78 58 C70 64 44 64 34 58 Z" fill="#f5f5f5" stroke="#bdbdbd" stroke-width="2.5"/>
  <path d="M54 52 C52 40 56 30 64 26" fill="none" stroke="#c2185b" stroke-width="12" stroke-linecap="round"/>
  <path d="M54 52 C52 40 56 30 64 26" fill="none" stroke="#f48fb1" stroke-width="7" stroke-linecap="round"/>
  <circle cx="68" cy="22" r="12" fill="#f48fb1" stroke="#c2185b" stroke-width="2.5"/>
  <path d="M78 16 C90 16 95 26 88 34 C86 29 82 27 77 27 Z" fill="#fbc02d" stroke="#a57c00" stroke-width="2" stroke-linejoin="round"/>
  <circle cx="71" cy="18" r="3" fill="#212121"/><circle cx="72" cy="17" r="1" fill="#fff"/>'''

RIET = '''  <path d="M0 104 C20 98 40 110 60 104 C80 98 100 110 120 104 V120 H0 Z" fill="#64b5f6"/>
  <path d="M4 110 C20 106 30 114 46 110 M66 112 C80 108 92 114 108 110" fill="none" stroke="#bbdefb" stroke-width="2.5" stroke-linecap="round"/>
  <g fill="none" stroke-linecap="round">
    <path d="M30 106 C24 80 18 60 6 44" stroke="#43a047" stroke-width="5"/>
    <path d="M92 106 C96 80 104 62 116 50" stroke="#43a047" stroke-width="5"/>
    <path d="M70 106 C74 86 82 76 96 66" stroke="#66bb6a" stroke-width="4"/>
    <path d="M44 106 C42 84 34 70 22 62" stroke="#66bb6a" stroke-width="4"/>
    <path d="M42 106 C42 80 40 50 38 18" stroke="#558b2f" stroke-width="3.5"/>
    <path d="M60 106 C60 80 62 44 64 10" stroke="#558b2f" stroke-width="3.5"/>
    <path d="M78 106 C80 80 82 56 86 26" stroke="#558b2f" stroke-width="3.5"/>
  </g>
  <g fill="#795548" stroke="#4e342e" stroke-width="2">
    <rect x="34" y="28" width="10" height="30" rx="5"/>
    <rect x="58" y="20" width="11" height="32" rx="5.5"/>
    <rect x="79" y="36" width="10" height="28" rx="5"/>
  </g>
  <g fill="none" stroke="#a1887f" stroke-width="2" stroke-linecap="round">
    <path d="M38 32 V52"/><path d="M62 24 V46"/><path d="M83 40 V58"/>
  </g>'''

MOL = '''  <path d="M6 114 C12 88 34 78 60 78 C86 78 108 88 114 114 Z" fill="#8d6e63" stroke="#5d4037" stroke-width="3" stroke-linejoin="round"/>
  <g fill="#6d4c41"><circle cx="24" cy="104" r="4"/><circle cx="96" cy="100" r="3.5"/><circle cx="82" cy="108" r="3"/><circle cx="38" cy="110" r="2.5"/></g>
  <path d="M32 92 C28 60 42 38 60 38 C78 38 92 60 88 92 Z" fill="#616161" stroke="#37474f" stroke-width="3"/>
  <path d="M44 56 C46 48 52 44 58 44" fill="none" stroke="#9e9e9e" stroke-width="4" stroke-linecap="round"/>
  <ellipse cx="60" cy="68" rx="11" ry="8" fill="#f48fb1" stroke="#c2185b" stroke-width="2"/>
  <circle cx="56" cy="67" r="1.8" fill="#880e4f"/><circle cx="64" cy="67" r="1.8" fill="#880e4f"/>
  <circle cx="50" cy="56" r="2.6" fill="#212121"/><circle cx="70" cy="56" r="2.6" fill="#212121"/>
  <path d="M46 70 L30 66 M46 74 L30 76 M74 70 L90 66 M74 74 L90 76" stroke="#424242" stroke-width="1.6" stroke-linecap="round"/>
  <g fill="#f8bbd0" stroke="#c2185b" stroke-width="2">
    <ellipse cx="38" cy="90" rx="13" ry="8"/><ellipse cx="82" cy="90" rx="13" ry="8"/>
  </g>
  <path d="M28 86 l-4 -3 M30 92 l-5 0 M48 86 l4 -3 M92 86 l4 -3 M90 92 l5 0 M72 86 l-4 -3" stroke="#c2185b" stroke-width="2" stroke-linecap="round"/>'''

TRUI = '''  <path d="M40 18 H80 L108 38 L116 88 L98 92 L92 58 V110 H28 V58 L22 92 L4 88 L12 38 Z" fill="#f48fb1" stroke="#c2185b" stroke-width="3" stroke-linejoin="round"/>
  <rect x="42" y="8" width="36" height="16" rx="5" fill="#ec407a" stroke="#c2185b" stroke-width="3"/>
  <path d="M48 11 V21 M54 11 V21 M60 11 V21 M66 11 V21 M72 11 V21" stroke="#f8bbd0" stroke-width="2"/>
  <rect x="28" y="98" width="64" height="12" fill="#ec407a" stroke="#c2185b" stroke-width="3"/>
  <path d="M36 100 V108 M44 100 V108 M52 100 V108 M60 100 V108 M68 100 V108 M76 100 V108 M84 100 V108" stroke="#f8bbd0" stroke-width="2"/>
  <path d="M4 88 L22 92 L23 84 L5 80 Z M116 88 L98 92 L97 84 L115 80 Z" fill="#ec407a" stroke="#c2185b" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M30 60 l8 8 8 -8 8 8 8 -8 8 8 8 -8 8 8 8 -8" fill="none" stroke="#fff" stroke-width="3.5" stroke-linejoin="round"/>
  <path d="M30 76 l8 8 8 -8 8 8 8 -8 8 8 8 -8 8 8 8 -8" fill="none" stroke="#fce4ec" stroke-width="3" stroke-linejoin="round"/>'''

REUS = '''  <path d="M0 112 H120 V120 H0 Z" fill="#7cb342"/>
  <path d="M84 40 C78 40 76 32 82 30 C82 22 94 22 96 28 C102 24 110 28 108 34 C114 36 112 42 106 42 Z" fill="#fff" stroke="#cfd8dc" stroke-width="2"/>
  <g stroke="#5d4037" stroke-width="2.5" stroke-linejoin="round">
    <path d="M42 84 H56 V108 H42 Z M62 84 H76 V108 H62 Z" fill="#795548"/>
    <path d="M38 106 H57 V114 H36 Z M61 106 H80 V114 H59 Z" fill="#4e342e"/>
  </g>
  <path d="M38 42 C38 38 42 36 46 36 H72 C76 36 80 38 80 42 L82 88 H36 Z" fill="#43a047" stroke="#2e7d32" stroke-width="3" stroke-linejoin="round"/>
  <path d="M36 74 H82" stroke="#5d4037" stroke-width="6"/><rect x="54" y="70" width="10" height="8" fill="#fbc02d"/>
  <path d="M38 44 C28 52 24 64 26 78 M80 44 C90 52 94 64 92 78" fill="none" stroke="#2e7d32" stroke-width="12" stroke-linecap="round"/>
  <path d="M38 44 C28 52 24 64 26 78 M80 44 C90 52 94 64 92 78" fill="none" stroke="#43a047" stroke-width="8" stroke-linecap="round"/>
  <circle cx="26" cy="82" r="6" fill="#f6c39a" stroke="#c98b5e" stroke-width="2"/><circle cx="92" cy="82" r="6" fill="#f6c39a" stroke="#c98b5e" stroke-width="2"/>
  <circle cx="59" cy="22" r="15" fill="#f6c39a" stroke="#c98b5e" stroke-width="2.5"/>
  <path d="M44 22 C44 36 50 44 59 44 C68 44 74 36 74 22 C70 30 48 30 44 22 Z" fill="#8d5a2b" stroke="#5d3a1a" stroke-width="2"/>
  <path d="M44 18 C44 8 52 4 59 4 C66 4 74 8 74 18 C68 12 50 12 44 18 Z" fill="#8d5a2b" stroke="#5d3a1a" stroke-width="2"/>
  <circle cx="53" cy="20" r="2.2" fill="#212121"/><circle cx="65" cy="20" r="2.2" fill="#212121"/>
  <path d="M54 31 C57 34 61 34 64 31" fill="none" stroke="#5d3a1a" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M98 112 V100 L106 92 L114 100 V112 Z" fill="#ffcc80" stroke="#8d6e63" stroke-width="2" stroke-linejoin="round"/>
  <path d="M96 101 L106 90 L116 101" fill="none" stroke="#e53935" stroke-width="3" stroke-linejoin="round"/>
  <rect x="104" y="104" width="4" height="8" fill="#8d6e63"/>
  <circle cx="14" cy="102" r="7" fill="#66bb6a"/><rect x="12.5" y="106" width="3" height="6" fill="#795548"/>'''

PIJL = '''  <path d="M20 100 L96 24" stroke="#6d4c41" stroke-width="7" stroke-linecap="round"/>
  <path d="M20 100 L96 24" stroke="#a1887f" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M114 6 L84 18 L102 36 Z" fill="#90a4ae" stroke="#455a64" stroke-width="3" stroke-linejoin="round"/>
  <g stroke="#b71c1c" stroke-width="2" stroke-linejoin="round">
    <path d="M30 90 L14 84 L4 94 L22 98 Z" fill="#e53935"/>
    <path d="M30 90 L36 106 L26 116 L22 98 Z" fill="#ef5350"/>
    <path d="M40 80 L24 74 L16 82 L32 88 Z" fill="#e53935"/>
    <path d="M40 80 L46 96 L38 104 L32 88 Z" fill="#ef5350"/>
  </g>'''

NOOT = '''  <path d="M60 30 C88 30 104 56 100 82 C96 104 80 116 60 116 C40 116 24 104 20 82 C16 56 32 30 60 30 Z" fill="#a0522d" stroke="#6d3416" stroke-width="3"/>
  <path d="M36 62 C32 74 34 90 42 100" fill="none" stroke="#c67a4a" stroke-width="6" stroke-linecap="round"/>
  <path d="M60 50 C56 66 56 92 60 110 M74 50 C80 66 82 90 76 108" fill="none" stroke="#7b3f1d" stroke-width="2" opacity="0.6"/>
  <path d="M22 44 C30 22 46 10 60 10 C74 10 90 22 98 44 C92 50 84 46 80 40 C76 48 66 50 60 42 C54 50 44 48 40 40 C36 46 28 50 22 44 Z" fill="#c8a165" stroke="#8a6a35" stroke-width="3" stroke-linejoin="round"/>
  <path d="M60 10 V2" stroke="#6d4c41" stroke-width="5" stroke-linecap="round"/>
  <path d="M40 24 C48 18 54 16 60 16" fill="none" stroke="#e6c88f" stroke-width="4" stroke-linecap="round"/>'''

GRAS = '''  <path d="M6 112 C30 104 90 104 114 112 V120 H6 Z" fill="#8d6e63"/>
  <g stroke-linejoin="round" stroke-width="2" stroke="#2e7d32">
    <path d="M14 112 C14 92 10 76 2 62 C18 74 24 92 24 112 Z" fill="#66bb6a"/>
    <path d="M24 112 C26 86 30 64 40 44 C38 68 36 90 36 112 Z" fill="#43a047"/>
    <path d="M34 112 C32 82 24 56 12 36 C32 54 44 82 46 112 Z" fill="#81c784"/>
    <path d="M44 112 C46 80 52 46 62 14 C62 48 58 82 58 112 Z" fill="#4caf50"/>
    <path d="M56 112 C56 84 62 58 76 34 C72 62 70 88 70 112 Z" fill="#66bb6a"/>
    <path d="M66 112 C68 82 78 54 98 30 C88 60 82 88 80 112 Z" fill="#43a047"/>
    <path d="M78 112 C80 90 90 70 108 56 C98 76 92 94 92 112 Z" fill="#81c784"/>
    <path d="M90 112 C92 96 102 82 118 74 C108 88 104 100 104 112 Z" fill="#4caf50"/>
  </g>'''


def kooi() -> str:
    cx, cy, rx, ry = 60, 56, 36, 32
    staven = []
    for x in range(30, 92, 10):
        y = cy - ry * math.sqrt(max(0.0, 1 - ((x - cx) / rx) ** 2))
        staven.append(f'M{x} {y:.1f} V100')
    return f'''  <circle cx="60" cy="16" r="7" fill="none" stroke="#f9a825" stroke-width="4"/>
  <path d="M24 {cy} C24 {cy - 42} 96 {cy - 42} 96 {cy}" fill="none" stroke="#f9a825" stroke-width="4"/>
  <path d="M60 23 V24" stroke="#f9a825" stroke-width="4"/>
  <g transform="translate(60 76)">
    <path d="M-20 4 C-20 -10 -8 -16 2 -14 C12 -12 16 -4 14 4 C10 12 -14 14 -20 4 Z" fill="#fdd835" stroke="#f9a825" stroke-width="2"/>
    <circle cx="8" cy="-8" r="2.2" fill="#212121"/>
    <path d="M14 -6 L22 -3 L14 0 Z" fill="#fb8c00"/>
    <path d="M-12 0 C-8 -6 0 -6 4 0" fill="none" stroke="#f9a825" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M-4 12 V18 M4 12 V18" stroke="#fb8c00" stroke-width="2.5" stroke-linecap="round"/>
  </g>
  <path d="M34 94 H86" stroke="#8d6e63" stroke-width="4" stroke-linecap="round"/>
  <path d="{" ".join(staven)}" stroke="#f9a825" stroke-width="3"/>
  <path d="M24 {cy} V100 M96 {cy} V100" stroke="#f9a825" stroke-width="4"/>
  <rect x="16" y="98" width="88" height="14" rx="4" fill="#8d6e63" stroke="#5d4037" stroke-width="3"/>
  <path d="M24 60 H96" stroke="#f9a825" stroke-width="3"/>'''


def hulstblad(bx, by, tx, ty, w, stekels=4) -> str:
    dx, dy = tx - bx, ty - by
    lengte = math.hypot(dx, dy)
    ux, uy = dx / lengte, dy / lengte
    nx, ny = -uy, ux
    hw = lambda t: w * math.sin(math.pi * min(t, 0.999)) ** 0.7
    punt = lambda t, o: (bx + ux * lengte * t + nx * o, by + uy * lengte * t + ny * o)
    ts = [k / stekels for k in range(1, stekels + 1)]
    d = f'M{bx:.1f} {by:.1f}'
    for kant in (1, -1):
        reeks = ts if kant == 1 else list(reversed([0.0] + ts[:-1]))
        vorige = 0.0 if kant == 1 else 1.0
        for t in reeks:
            tm = (vorige + t) / 2
            c = punt(tm, kant * hw(tm) * 0.55)
            p = punt(t, kant * hw(t) * 1.05) if 0 < t < 1 else punt(t, 0)
            d += f' Q{c[0]:.1f} {c[1]:.1f} {p[0]:.1f} {p[1]:.1f}'
            vorige = t
    return (f'  <path d="{d} Z" fill="#2e7d32" stroke="#1b5e20" stroke-width="2.5" stroke-linejoin="round"/>\n'
            f'  <path d="M{bx:.1f} {by:.1f} L{tx:.1f} {ty:.1f}" stroke="#81c784" stroke-width="2.5" stroke-linecap="round"/>')


def hulst() -> str:
    bladeren = [hulstblad(60, 66, 10, 24, 17), hulstblad(60, 66, 112, 30, 17), hulstblad(60, 66, 58, 116, 16)]
    bessen = '''  <g stroke="#8e0000" stroke-width="2">
    <circle cx="52" cy="58" r="10" fill="#e53935"/><circle cx="70" cy="56" r="10" fill="#e53935"/><circle cx="61" cy="72" r="10" fill="#d32f2f"/>
  </g>
  <circle cx="49" cy="55" r="3" fill="#ffcdd2"/><circle cx="67" cy="53" r="3" fill="#ffcdd2"/><circle cx="58" cy="69" r="3" fill="#ffcdd2"/>'''
    return '\n'.join(bladeren) + '\n' + bessen


# ---------- Vingerhanden ----------
HUID, RAND, NAGEL = '#f6c39a', '#c98b5e', '#fde6d2'


def hand(aantal: int, x0: float = 0, spiegel: bool = False) -> str:
    """Een rechterhand (duim links) met `aantal` vingers omhoog: wijs, middel, ring, pink, duim."""
    vingers = [(36, 13, 42), (50, 13, 46), (64, 13, 43), (78, 12, 36)]  # x, breedte, lengte
    delen = []
    for i, (x, b, l) in enumerate(vingers):
        if i < min(aantal, 4):
            top = 66 - l
            delen.append(f'<rect x="{x}" y="{top}" width="{b}" height="{l + 10}" rx="{b / 2}" fill="{HUID}" stroke="{RAND}" stroke-width="2.5"/>')
            delen.append(f'<ellipse cx="{x + b / 2}" cy="{top + 6}" rx="{b / 2 - 2.5}" ry="4" fill="{NAGEL}"/>')
            delen.append(f'<path d="M{x + 3} {top + l * 0.55} h{b - 6}" stroke="{RAND}" stroke-width="1.5" stroke-linecap="round" opacity="0.7"/>')
        else:
            delen.append(f'<rect x="{x}" y="56" width="{b}" height="18" rx="{b / 2}" fill="{HUID}" stroke="{RAND}" stroke-width="2.5"/>')
    palm = f'<path d="M33 64 H92 C93 84 92 98 86 108 C80 116 46 116 40 108 C34 100 32 84 33 64 Z" fill="{HUID}" stroke="{RAND}" stroke-width="2.5" stroke-linejoin="round"/>'
    # Gebogen vingers: knokkels over de palm, zodat je ziet dat ze naar beneden zijn.
    knokkels = ''.join(
        f'<path d="M{x + 1} 70 q{b / 2 - 1} 6 {b - 2} 0" fill="none" stroke="{RAND}" stroke-width="2" stroke-linecap="round"/>'
        for i, (x, b, l) in enumerate(vingers) if i >= min(aantal, 4))
    if aantal >= 5:
        duim = (f'<g transform="rotate(-38 34 92)"><rect x="12" y="80" width="30" height="15" rx="7.5" fill="{HUID}" stroke="{RAND}" stroke-width="2.5"/>'
                f'<ellipse cx="18" cy="87.5" rx="4" ry="4.5" fill="{NAGEL}"/></g>')
    else:
        duim = f'<path d="M38 80 C46 76 60 78 70 82" fill="none" stroke="{RAND}" stroke-width="12" stroke-linecap="round"/><path d="M38 80 C46 76 60 78 70 82" fill="none" stroke="{HUID}" stroke-width="7.5" stroke-linecap="round"/>'
    mouw = '<path d="M38 110 H88 V120 H38 Z" fill="#42a5f5" stroke="#1565c0" stroke-width="2.5"/>'
    # Volgorde: eerst gebogen vingers achter de palm, dan palm, dan de rest erover.
    achter = ''.join(d for d in delen if 'height="18"' in d)
    voor = ''.join(d for d in delen if 'height="18"' not in d)
    inhoud = achter + voor + palm + knokkels + duim + mouw
    t = f'translate({x0 + 120} 0) scale(-1 1)' if spiegel else f'translate({x0} 0)'
    return f'  <g transform="{t}">{inhoud}</g>'


def vingers(n: int) -> str:
    if n <= 5:
        return svg(hand(n), f'Een hand die {n} laat zien')
    return svg(hand(5, 0, spiegel=True) + '\n' + hand(n - 5, 116), f'Twee handen die {n} laten zien', '0 0 236 120')


def main() -> None:
    eigen = {
        'pot': (POT, 'Een lege bloempot'), 'kous': (KOUS, 'Een lange kous'), 'muts': (MUTS, 'Een kerstmuts'),
        'buik': (BUIK, 'Een dikke buik'), 'riem': (RIEM, 'Een riem met gesp'), 'kar': (KAR, 'Een bolderkar'),
        'gier': (GIER, 'Een gier op een tak'), 'riet': (RIET, 'Riet aan het water'), 'mol': (MOL, 'Een mol uit zijn hoop'),
        'trui': (TRUI, 'Een trui'), 'reus': (REUS, 'Een reus naast een klein huisje'), 'pijl': (PIJL, 'Een pijl'),
        'gras': (GRAS, 'Een pol gras'), 'noot': (NOOT, 'Een hazelnoot'), 'kooi': (kooi(), 'Een vogelkooi met een vogeltje'), 'hulst': (hulst(), 'Hulst met besjes'),
    }
    for woord, (inhoud, notitie) in eigen.items():
        schrijf(WOORDEN / f'{woord}.svg', svg(inhoud, notitie))
    for n in range(1, 11):
        schrijf(VINGERS / f'vinger-{n}.svg', vingers(n))
    shutil.copy(WOORDEN / 'weer/zon.svg', WOORDEN / 'zon.svg')

    if not FLUENT:
        return
    for f in FLUENT.glob('*.svg'):
        if not f.name.startswith('_') and f.stem not in eigen:
            shutil.copy(f, WOORDEN / f.name)
    samen = {
        'en': ('Twee bijen: bij en bij', inbed('bij', -4, 14, 68, 'a') + inbed('bij', 56, 38, 68, 'b')),
        'fruit': ('Een stapeltje fruit', inbed('_ananas', 62, 2, 56, 'a') + inbed('_druif', 18, 12, 50, 'b')
                  + inbed('_banaan', 50, 50, 60, 'c') + inbed('_appel', 6, 58, 56, 'd')),
        'bos': ('Een bos met bomen', '  <path d="M0 104 C30 98 90 98 120 104 V120 H0 Z" fill="#7cb342"/>'
                + inbed('_den', -4, 30, 66, 'a') + inbed('boom', 54, 26, 70, 'b') + inbed('_den', 26, 8, 80, 'c')),
        'flos': ('Twee tanden met flosdraad ertussen', inbed('_tand', 4, 28, 58, 'a') + inbed('_tand', 58, 28, 58, 'b')
                 + '  <path d="M14 10 C40 16 56 24 60 50 C62 70 60 90 64 112" fill="none" stroke="#4fc3f7" stroke-width="3" stroke-linecap="round"/>'
                 + '  <path d="M106 10 C80 16 64 24 60 50" fill="none" stroke="#4fc3f7" stroke-width="3" stroke-linecap="round"/>'),
        # De voet van onderen (onze eigen voet.svg, zie git-log), met een rondje om de grote teen.
        'teen': ('Een voet met een rondje om de grote teen', inbed('voet', 36, 6, 60, 'a', bron=WOORDEN)
                 + '  <circle cx="88" cy="15" r="12" fill="none" stroke="#e53935" stroke-width="5"/>'),
    }
    for woord, (notitie, inhoud) in samen.items():
        schrijf(WOORDEN / f'{woord}.svg', svg(inhoud, f'{notitie} (Fluent Emoji-onderdelen, MIT)'))


if __name__ == '__main__':
    main()
