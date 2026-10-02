"""Nieuwe woordplaatjes voor de heringedeelde leeshoofdstukken.

  python bronbestanden/teken-lezen-nieuw.py

- tulp: huidige bloem (tulip)
- bloem: eigen madeliefje
- kopieën uit icons/avatars
- eigen tekeningen voor de rest
- meervouden: 2–3 keer het enkelvoud
"""
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WOORDEN = ROOT / 'public/assets/images/woorden'
ICONS = ROOT / 'public/assets/icons'


def svg(inhoud: str, notitie: str, vb: str = '0 0 120 120') -> str:
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}">\n  <!-- {notitie}, zelf getekend voor leren-lezen. -->\n{inhoud}\n</svg>\n'


def schrijf(naam: str, tekst: str) -> None:
    pad = WOORDEN / f'{naam}.svg'
    pad.write_text(tekst, encoding='utf-8')
    print('schreef', pad.relative_to(ROOT))


def kopieer(bron: Path, naam: str) -> None:
    shutil.copy(bron, WOORDEN / f'{naam}.svg')
    print('kopie', bron.name, '->', naam)


DAISY = '''  <path d="M54 118 C56 86 58 70 60 52" fill="none" stroke="#43a047" stroke-width="5" stroke-linecap="round"/>
  <path d="M60 78 C44 70 38 86 48 92" fill="#66bb6a" stroke="#2e7d32" stroke-width="2" stroke-linejoin="round"/>
  <g fill="#fafafa" stroke="#e0e0e0" stroke-width="2">
    <ellipse cx="60" cy="28" rx="11" ry="20"/>
    <ellipse cx="60" cy="52" rx="11" ry="20"/>
    <ellipse cx="48" cy="40" rx="20" ry="11"/>
    <ellipse cx="72" cy="40" rx="20" ry="11"/>
    <ellipse cx="50" cy="28" rx="12" ry="18" transform="rotate(-40 50 28)"/>
    <ellipse cx="70" cy="28" rx="12" ry="18" transform="rotate(40 70 28)"/>
    <ellipse cx="50" cy="52" rx="12" ry="18" transform="rotate(40 50 52)"/>
    <ellipse cx="70" cy="52" rx="12" ry="18" transform="rotate(-40 70 52)"/>
  </g>
  <circle cx="60" cy="40" r="14" fill="#fdd835" stroke="#f9a825" stroke-width="2.5"/>
  <g fill="#f9a825"><circle cx="55" cy="36" r="2"/><circle cx="64" cy="37" r="2"/><circle cx="58" cy="44" r="2"/><circle cx="66" cy="43" r="1.6"/></g>'''

MES = '''  <path d="M18 78 L92 22 C98 18 106 22 108 30 C96 48 70 70 48 86 Z" fill="#eceff1" stroke="#546e7a" stroke-width="3" stroke-linejoin="round"/>
  <path d="M22 76 L88 26 C90 32 70 52 48 72 Z" fill="#cfd8dc"/>
  <path d="M14 72 L40 96 C46 102 40 108 32 106 L8 88 C4 84 8 76 14 72 Z" fill="#6d4c41" stroke="#3e2723" stroke-width="3"/>
  <path d="M20 80 L34 94" stroke="#a1887f" stroke-width="2"/>'''

KOK = '''  <circle cx="60" cy="72" r="22" fill="#f6c39a" stroke="#c98b5e" stroke-width="3"/>
  <circle cx="52" cy="68" r="3" fill="#3e2723"/><circle cx="68" cy="68" r="3" fill="#3e2723"/>
  <path d="M52 80 Q60 86 68 80" fill="none" stroke="#c98b5e" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M28 108 C32 92 88 92 92 108 Z" fill="#eceff1" stroke="#90a4ae" stroke-width="3"/>
  <path d="M34 48 C34 22 86 22 86 48 C86 58 78 56 74 50 C70 58 50 58 46 50 C42 56 34 58 34 48 Z" fill="#fafafa" stroke="#cfd8dc" stroke-width="3"/>
  <rect x="32" y="46" width="56" height="12" rx="4" fill="#eceff1" stroke="#cfd8dc" stroke-width="2"/>'''

BLOK = '''  <path d="M20 44 L60 22 L100 44 L60 66 Z" fill="#ffcc80" stroke="#e65100" stroke-width="3" stroke-linejoin="round"/>
  <path d="M20 44 L20 86 L60 108 L60 66 Z" fill="#ffb74d" stroke="#e65100" stroke-width="3" stroke-linejoin="round"/>
  <path d="M100 44 L100 86 L60 108 L60 66 Z" fill="#ffa726" stroke="#e65100" stroke-width="3" stroke-linejoin="round"/>'''

DAG = '''  <circle cx="60" cy="48" r="22" fill="#ffcc33" stroke="#f9a825" stroke-width="3"/>
  <g stroke="#ffb020" stroke-width="4" stroke-linecap="round">
    <path d="M60 8 V16 M60 80 V88 M20 48 H28 M92 48 H100 M32 20 L38 26 M82 70 L88 76 M88 20 L82 26 M38 70 L32 76"/>
  </g>
  <rect x="22" y="84" width="76" height="28" rx="6" fill="#fff" stroke="#90a4ae" stroke-width="3"/>
  <path d="M22 96 H98" stroke="#ef5350" stroke-width="4"/>
  <g fill="#546e7a"><circle cx="40" cy="104" r="3"/><circle cx="60" cy="104" r="3"/><circle cx="80" cy="104" r="3"/></g>'''

DAK = '''  <path d="M10 62 L60 14 L110 62 Z" fill="#e53935" stroke="#b71c1c" stroke-width="3" stroke-linejoin="round"/>
  <path d="M24 62 V108 H96 V62" fill="#ffe0b2" stroke="#ef6c00" stroke-width="3"/>
  <rect x="48" y="78" width="24" height="30" rx="2" fill="#6d4c41" stroke="#3e2723" stroke-width="2.5"/>
  <rect x="30" y="72" width="16" height="14" fill="#81d4fa" stroke="#0277bd" stroke-width="2"/>'''

HAK = '''  <path d="M18 52 H78 C96 52 104 64 100 78 H28 Z" fill="#ec407a" stroke="#ad1457" stroke-width="3" stroke-linejoin="round"/>
  <path d="M22 78 V98 H36 V78" fill="#ad1457" stroke="#880e4f" stroke-width="3"/>
  <path d="M78 78 L96 108 H108 L86 76 Z" fill="#ad1457" stroke="#880e4f" stroke-width="3"/>
  <ellipse cx="50" cy="50" rx="18" ry="8" fill="#f8bbd0"/>'''

VEER = '''  <path d="M20 100 C28 40 70 10 104 16 C88 28 74 50 70 100 Z" fill="#90caf9" stroke="#1565c0" stroke-width="3" stroke-linejoin="round"/>
  <path d="M70 100 C66 60 80 28 104 16" fill="none" stroke="#1565c0" stroke-width="3"/>
  <g stroke="#e3f2fd" stroke-width="2" stroke-linecap="round">
    <path d="M64 36 L48 28 M62 50 L42 44 M60 64 L40 62 M58 78 L44 80"/>
  </g>'''

KAST = '''  <rect x="18" y="14" width="84" height="96" rx="6" fill="#d7a86e" stroke="#6d4c41" stroke-width="3"/>
  <path d="M60 14 V110" stroke="#6d4c41" stroke-width="3"/>
  <rect x="26" y="24" width="26" height="36" rx="3" fill="#ffe0b2" stroke="#8d6e63" stroke-width="2"/>
  <rect x="68" y="24" width="26" height="36" rx="3" fill="#ffe0b2" stroke="#8d6e63" stroke-width="2"/>
  <circle cx="48" cy="70" r="4" fill="#f9a825"/><circle cx="72" cy="70" r="4" fill="#f9a825"/>
  <path d="M18 110 H102" stroke="#5d4037" stroke-width="6" stroke-linecap="round"/>'''

VERF = '''  <rect x="30" y="38" width="60" height="64" rx="8" fill="#eceff1" stroke="#546e7a" stroke-width="3"/>
  <path d="M30 54 H90" stroke="#546e7a" stroke-width="3"/>
  <ellipse cx="60" cy="38" rx="30" ry="10" fill="#42a5f5" stroke="#1565c0" stroke-width="3"/>
  <path d="M38 70 H82" stroke="#90caf9" stroke-width="8" stroke-linecap="round"/>
  <circle cx="50" cy="28" r="8" fill="#ef5350"/><circle cx="70" cy="24" r="7" fill="#66bb6a"/>'''

KWAST = '''  <path d="M52 8 H68 L64 58 H56 Z" fill="#8d6e63" stroke="#5d4037" stroke-width="3"/>
  <rect x="48" y="52" width="24" height="14" rx="3" fill="#f9a825" stroke="#f57f17" stroke-width="2.5"/>
  <path d="M40 66 C40 100 50 112 60 112 C70 112 80 100 80 66 Z" fill="#42a5f5" stroke="#1565c0" stroke-width="3"/>
  <path d="M46 78 C50 96 70 96 74 78" fill="none" stroke="#90caf9" stroke-width="3"/>'''

MOLEN = '''  <path d="M0 108 H120 V120 H0 Z" fill="#7cb342"/>
  <path d="M44 108 V62 L60 28 L76 62 V108 Z" fill="#8d6e63" stroke="#5d4037" stroke-width="3" stroke-linejoin="round"/>
  <rect x="38" y="58" width="44" height="14" fill="#6d4c41" stroke="#4e342e" stroke-width="2"/>
  <rect x="54" y="84" width="12" height="24" fill="#ffe0b2" stroke="#5d4037" stroke-width="2"/>
  <g transform="translate(60 36) rotate(-20)">
    <rect x="-6" y="-46" width="12" height="40" rx="3" fill="#eceff1" stroke="#90a4ae" stroke-width="2"/>
    <rect x="-6" y="6" width="12" height="40" rx="3" fill="#eceff1" stroke="#90a4ae" stroke-width="2"/>
    <rect x="-46" y="-6" width="40" height="12" rx="3" fill="#eceff1" stroke="#90a4ae" stroke-width="2"/>
    <rect x="6" y="-6" width="40" height="12" rx="3" fill="#eceff1" stroke="#90a4ae" stroke-width="2"/>
  </g>
  <circle cx="60" cy="36" r="6" fill="#f9a825" stroke="#f57f17" stroke-width="2"/>'''

KEGEL = '''  <path d="M44 24 H76 L84 88 H36 Z" fill="#ef5350" stroke="#c62828" stroke-width="3" stroke-linejoin="round"/>
  <rect x="40" y="48" width="40" height="16" fill="#fafafa" stroke="#c62828" stroke-width="2"/>
  <ellipse cx="60" cy="22" rx="16" ry="10" fill="#ef5350" stroke="#c62828" stroke-width="3"/>
  <ellipse cx="60" cy="94" rx="28" ry="12" fill="#ef5350" stroke="#c62828" stroke-width="3"/>'''

KETTING = '''  <g fill="none" stroke="#f9a825" stroke-width="5">
    <ellipse cx="28" cy="36" rx="12" ry="16"/>
    <ellipse cx="46" cy="28" rx="12" ry="16"/>
    <ellipse cx="64" cy="24" rx="12" ry="16"/>
    <ellipse cx="82" cy="32" rx="12" ry="16"/>
    <ellipse cx="96" cy="48" rx="12" ry="16"/>
    <ellipse cx="92" cy="68" rx="12" ry="16"/>
    <ellipse cx="74" cy="80" rx="12" ry="16"/>
    <ellipse cx="54" cy="84" rx="12" ry="16"/>
    <ellipse cx="36" cy="74" rx="12" ry="16"/>
    <ellipse cx="24" cy="56" rx="12" ry="16"/>
  </g>
  <circle cx="60" cy="56" r="10" fill="#42a5f5" stroke="#1565c0" stroke-width="3"/>'''

KIJK = '''  <path d="M10 60 C28 28 92 28 110 60 C92 92 28 92 10 60 Z" fill="#fff" stroke="#37474f" stroke-width="3"/>
  <circle cx="60" cy="60" r="18" fill="#29b6f6" stroke="#0277bd" stroke-width="3"/>
  <circle cx="60" cy="60" r="8" fill="#212121"/>
  <circle cx="54" cy="54" r="3" fill="#fff"/>'''

SCHAATS = '''  <path d="M20 48 H78 C92 48 96 62 86 70 H28 Z" fill="#42a5f5" stroke="#1565c0" stroke-width="3"/>
  <path d="M28 70 V84 H82 V70" fill="#90caf9" stroke="#1565c0" stroke-width="2"/>
  <path d="M18 88 H100 C104 88 106 94 100 96 H16 Z" fill="#78909c" stroke="#37474f" stroke-width="3"/>
  <path d="M96 88 L108 72" stroke="#37474f" stroke-width="4" stroke-linecap="round"/>'''

SCHUIM = '''  <path d="M8 96 C20 70 50 78 60 88 C72 68 104 72 112 96 V112 H8 Z" fill="#b3e5fc"/>
  <g fill="#fff" stroke="#90caf9" stroke-width="2">
    <circle cx="28" cy="72" r="16"/><circle cx="50" cy="58" r="20"/><circle cx="76" cy="64" r="18"/><circle cx="96" cy="78" r="14"/>
    <circle cx="40" cy="86" r="12"/><circle cx="68" cy="84" r="10"/>
  </g>'''

SCHOMMEL = '''  <path d="M16 8 H104" stroke="#6d4c41" stroke-width="8" stroke-linecap="round"/>
  <path d="M32 8 V78 M88 8 V78" stroke="#90a4ae" stroke-width="4"/>
  <rect x="26" y="76" width="68" height="14" rx="4" fill="#d7a86e" stroke="#6d4c41" stroke-width="3"/>
  <circle cx="60" cy="56" r="14" fill="#f6c39a" stroke="#c98b5e" stroke-width="2.5"/>
  <path d="M48 70 C50 88 70 88 72 70" fill="#42a5f5" stroke="#1565c0" stroke-width="2.5"/>'''

KRAAI = '''  <path d="M16 80 C20 50 50 36 78 48 C96 56 100 78 86 90 C70 102 36 100 20 88 Z" fill="#37474f" stroke="#212121" stroke-width="3"/>
  <path d="M78 52 C104 40 112 62 92 70" fill="#455a64" stroke="#212121" stroke-width="3"/>
  <path d="M86 62 L108 56 L88 70 Z" fill="#f9a825" stroke="#f57f17" stroke-width="2"/>
  <circle cx="70" cy="58" r="4" fill="#fff"/><circle cx="71" cy="57" r="2" fill="#212121"/>
  <path d="M40 92 L28 110 M56 94 L56 112" stroke="#212121" stroke-width="3" stroke-linecap="round"/>'''

MEEUW = '''  <path d="M8 64 C28 40 52 48 60 58 C68 48 92 40 112 64" fill="none" stroke="#eceff1" stroke-width="10" stroke-linecap="round"/>
  <path d="M8 64 C28 44 52 52 60 60 C68 52 92 44 112 64" fill="none" stroke="#90a4ae" stroke-width="3"/>
  <ellipse cx="60" cy="66" rx="16" ry="12" fill="#fafafa" stroke="#90a4ae" stroke-width="2"/>
  <path d="M74 64 L88 60 L76 70 Z" fill="#fb8c00"/>
  <circle cx="68" cy="62" r="2" fill="#212121"/>'''

ZWAAI = '''  <circle cx="48" cy="28" r="14" fill="#f6c39a" stroke="#c98b5e" stroke-width="3"/>
  <path d="M36 44 C40 70 56 74 60 92 L40 112 H28 L36 90 C28 70 24 50 36 44 Z" fill="#42a5f5" stroke="#1565c0" stroke-width="3"/>
  <path d="M56 50 C80 30 100 36 104 20" fill="none" stroke="#f6c39a" stroke-width="10" stroke-linecap="round"/>
  <path d="M56 50 C80 30 100 36 104 20" fill="none" stroke="#c98b5e" stroke-width="3" stroke-linecap="round"/>
  <circle cx="104" cy="18" r="8" fill="#f6c39a" stroke="#c98b5e" stroke-width="2.5"/>'''


def meervoud(enkel: str, naam: str, posities: list[tuple[float, float, float]]) -> None:
    bron = WOORDEN / f'{enkel}.svg'
    tekst = bron.read_text(encoding='utf-8')
    vb = '0 0 32 32'
    if 'viewBox="' in tekst:
        vb = tekst.split('viewBox="', 1)[1].split('"', 1)[0]
    binnen = tekst[tekst.index('>', tekst.index('<svg')) + 1 : tekst.rindex('</svg>')]
    vx, vy, vb_b, _ = (float(v) for v in vb.split())
    delen = []
    for i, (x, y, maat) in enumerate(posities):
        schaal = maat / vb_b
        p = f'm{i}'
        stuk = binnen
        stuk = stuk.replace('id="', f'id="{p}')
        stuk = stuk.replace('url(#', f'url(#{p}')
        stuk = stuk.replace('href="#', f'href="#{p}')
        delen.append(f'<g fill="none" transform="translate({x} {y}) scale({schaal:.4f}) translate({-vx} {-vy})">{stuk}</g>')
    schrijf(naam, svg('\n'.join(delen), f'Meer {enkel}: {len(posities)} stuks'))


def main() -> None:
    kopieer(WOORDEN / 'bloem.svg', 'tulp')
    schrijf('bloem', svg(DAISY, 'Een madeliefje'))
    kopieer(ICONS / 'kom.svg', 'kom')
    kopieer(ICONS / 'potlood.svg', 'potlood')
    kopieer(ICONS / 'avatar-fee.svg', 'fee')
    kopieer(ICONS / 'avatar-egel.svg', 'egel')
    kopieer(ICONS / 'avatar-papegaai.svg', 'papegaai')
    eigen = {
        'mes': (MES, 'Een mes'), 'kok': (KOK, 'Een kok met koksmuts'), 'blok': (BLOK, 'Eén blok'),
        'dag': (DAG, 'Zon en een dag op de kalender'), 'dak': (DAK, 'Een huis met een dak'),
        'hak': (HAK, 'Een schoen met hak'), 'veer': (VEER, 'Een veer'), 'kast': (KAST, 'Een kast'),
        'verf': (VERF, 'Een pot verf'), 'kwast': (KWAST, 'Een kwast'), 'molen': (MOLEN, 'Een molen'),
        'kegel': (KEGEL, 'Een kegel'), 'ketting': (KETTING, 'Een ketting'), 'kijk': (KIJK, 'Een oog dat kijkt'),
        'schaats': (SCHAATS, 'Een schaats'), 'schuim': (SCHUIM, 'Schuim met belletjes'),
        'schommel': (SCHOMMEL, 'Een schommel'), 'kraai': (KRAAI, 'Een kraai'), 'meeuw': (MEEUW, 'Een meeuw'),
        'zwaai': (ZWAAI, 'Iemand die zwaait'),
    }
    for naam, (inhoud, notitie) in eigen.items():
        schrijf(naam, svg(inhoud, notitie))

    twee = [(8, 20, 52), (60, 28, 52)]
    drie = [(4, 28, 44), (40, 12, 44), (72, 32, 44)]
    for enkel, naam, pos in [
        ('boom', 'bomen', twee), ('jas', 'jassen', twee), ('schoen', 'schoenen', twee),
        ('blok', 'blokken', drie), ('sok', 'sokken', twee), ('boek', 'boeken', twee),
        ('kat', 'katten', twee), ('kip', 'kippen', twee), ('bal', 'ballen', drie),
        ('huis', 'huizen', twee), ('aap', 'apen', twee), ('been', 'benen', twee),
        ('peer', 'peren', twee), ('boot', 'boten', twee), ('vis', 'vissen', twee),
        ('wolf', 'wolven', twee), ('roos', 'rozen', twee), ('muis', 'muizen', twee),
    ]:
        meervoud(enkel, naam, pos)


if __name__ == '__main__':
    main()
