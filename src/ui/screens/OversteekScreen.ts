import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { flitsIn, flitstNog } from '../components/spelFiguur.ts';
import { avatarFilter, avatarPad, haalActiefProfiel } from '../../engine/profielStore.ts';
import { haalGroep } from '../../engine/progressStore.ts';
import { haalRecord, zetRecord } from '../../engine/records.ts';
import { TONEN, speelDrum, speelNoot } from '../../engine/muziek.ts';
import { confetti } from '../../three/particles.ts';
import { huidigThema } from '../../achtergrond/achtergrond.ts';
import { GNOE } from '../../achtergrond/savanne.ts';
import { TREIN_LOC, treinWagons } from '../../achtergrond/trein.ts';
import { OVERSTEEK_THEMAS, type Soort, type Tekening } from './oversteek-themas.ts';
import { STEGOSAURUS, TRICERATOPS } from './oversteek-tekeningen.ts';

// Oversteken (een soort Frogger): je eigen figuurtje staat onderaan en moet naar de
// overkant, baan voor baan, tussen wat er langs raast door. Wat dat is hangt af van de
// achtergrond: auto's op de bouwplaats, een kudde gnoes op de savanne, koeien en
// tractoren op de boerderij, meteorenzwermen in de ruimte, enzovoort. Vanaf level 3
// komt er (bij de meeste achtergronden) water bij: daar kun je alleen staan op wat
// drijft (boomstammen, nijlpaarden, eendjes, ijsschotsen, stenen in de lava). Vanaf
// level 4 komt er af en toe een razendsnelle uitschieter (raket, ambulance, op hol
// geslagen kudde), met een knipperlicht vooraf. Elk level heeft meer banen, alles gaat
// sneller en de gaten worden kleiner. Drie hartjes; een klap of in het water vallen kost
// er één en je begint weer bij de laatste veilige strook. Punten: 1 per nieuwe baan, 10
// voor de overkant, 5 voor een ster. Geen munten (die verdien je met leren), wel een
// record per profiel.
//
// Alles wordt in vakjes gerekend (`c` px per vakje): posities, snelheden, gaten. Zo
// past het spel zich bij draaien of een ander venster vanzelf aan.

const STER = 'assets/images/woorden/ster.svg';
const HART = 'assets/icons/bewaar.svg';
const VLAG = 'assets/oversteken/finish.svg';
const LEVENS = 3;
const HOP = 0.13; // s per sprongetje
const DOOD_DUUR = 1; // s tussen een klap en weer verder
const TUSSEN_DUUR = 2; // s feest aan de overkant
const KOLOMMEN_MIN = 7; // het veld is altijd minstens zo breed (in vakjes)
const KOLOMMEN_MAX = 15;
const HOOG_MAX = 1.15; // vakjes: hoger mag een plaatje niet, anders loopt het over de buurbanen

type BaanSoort = 'start' | 'veilig' | 'finish' | 'weg' | 'water';
type Richting = 'op' | 'neer' | 'links' | 'rechts';

interface Ding {
  el: HTMLElement;
  x: number; // linkerkant, vakjes
  lengte: number; // vakjes
  // Waar er echt iets te zien is, gemeten vanaf x (vakjes): hier botst of draagt het.
  links: number;
  rechts: number;
}

// Botsen gaat zoals in de echte Frogger (na de bekende reparatie): één punt, het midden
// van het figuurtje, tegen de echte breedte van wat er rijdt. Die breedte meten we aan de
// pixels van elk plaatje, want elk Fluent-plaatje heeft zijn eigen doorzichtige rand.
// Sleutel: pad + draaiing; waarde: eerste en laatste zichtbare kolom (0..1 van de breedte).
const RANDEN = new Map<string, [number, number]>();

// Eigen tekeningen die lopen (poten, staart, kop bewegen in CSS); verhouding = breedte/hoogte.
const TEKENINGEN: Record<Tekening, { svg: string; verhouding: number }> = {
  gnoe: { svg: GNOE, verhouding: 200 / 150 },
  stegosaurus: { svg: STEGOSAURUS, verhouding: 1 },
  triceratops: { svg: TRICERATOPS, verhouding: 220 / 150 },
};
const isTekening = (t: Soort['teken']): t is Tekening => !!t && t in TEKENINGEN;
// Een tekening als los plaatje (alleen om te meten): met xmlns en een echte maat, anders
// tekent de browser hem in een standaardvak van 300×150.
const TEKENING_SRC = new Map<Tekening, string>();
function tekeningSrc(t: Tekening): string {
  let src = TEKENING_SRC.get(t);
  if (!src) {
    const [, , b, h] = /viewBox="([^"]+)"/.exec(TEKENINGEN[t].svg)![1].split(/\s+/).map(Number);
    const svg = TEKENINGEN[t].svg.trim().replace('<svg ', `<svg xmlns="http://www.w3.org/2000/svg" width="${b}" height="${h}" `);
    src = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    TEKENING_SRC.set(t, src);
  }
  return src;
}

function meetRand(src: string, draai = 0, verhouding = 1): void {
  const sleutel = `${src}|${draai}`;
  if (RANDEN.has(sleutel)) return;
  RANDEN.set(sleutel, [0.06, 0.94]); // tot de meting klaar is
  const img = new Image();
  img.onload = () => {
    const M = 64;
    const H = Math.round(M / verhouding);
    const doek = document.createElement('canvas');
    doek.width = M;
    doek.height = H;
    const ctx = doek.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    ctx.translate(M / 2, H / 2);
    ctx.rotate((draai * Math.PI) / 180);
    ctx.drawImage(img, -M / 2, -H / 2, M, H);
    const alfa = ctx.getImageData(0, 0, M, H).data;
    const zichtbaar = (x: number): boolean => {
      for (let y = 0; y < H; y++) if (alfa[(y * M + x) * 4 + 3] > 60) return true;
      return false;
    };
    let l = 0;
    while (l < M && !zichtbaar(l)) l++;
    let r = M - 1;
    while (r > l && !zichtbaar(r)) r--;
    if (r > l) RANDEN.set(sleutel, [l / M, (r + 1) / M]);
  };
  img.src = src;
}
function rand(s: Soort, src: string): [number, number] {
  return RANDEN.get(`${src}|${s.draai ?? 0}`) ?? [0.06, 0.94];
}

interface Baan {
  soort: BaanSoort;
  el: HTMLDivElement;
  richting: 1 | -1;
  v: number; // vakjes per seconde
  bron: Soort | null;
  dingen: Ding[];
  gat: [number, number]; // vakjes tussen twee dingen
  rek: [number, number]; // lengte van een boomstam of ijsschots
  volgendGat: number;
  sporadisch: boolean;
  wacht: number; // s tot de volgende uitschieter (telt alleen als de baan leeg is)
  tussen: [number, number];
  lamp: HTMLElement | null;
  belGespeeld: boolean;
}

const willekeurig = (a: number, b: number): number => a + Math.random() * (b - a);
const heelGetal = ([a, b]: [number, number]): number => a + Math.floor(Math.random() * (b - a + 1));

// Boomstam van bovenaf, zo lang als gevraagd (viewBox: 100 per vakje).
function boomstam(lengte: number): string {
  const L = Math.round(lengte * 100);
  let schors = '';
  for (let x = 40; x < L - 60; x += 46 + Math.random() * 30) {
    const y = 34 + Math.random() * 30;
    schors += `<path d="M${x.toFixed(0)} ${y.toFixed(0)} h${(18 + Math.random() * 22).toFixed(0)}" stroke="#5e3a1a" stroke-width="5" stroke-linecap="round"/>`;
  }
  const knoest = 60 + Math.random() * (L - 140);
  return `<svg viewBox="0 0 ${L} 100" aria-hidden="true">
    <rect x="6" y="20" width="${L - 12}" height="62" rx="26" fill="#7a4a22"/>
    <rect x="14" y="24" width="${L - 34}" height="16" rx="8" fill="#a26a35"/>
    ${schors}
    <ellipse cx="${knoest.toFixed(0)}" cy="66" rx="9" ry="6" fill="#5e3a1a"/>
    <ellipse cx="${L - 22}" cy="51" rx="15" ry="30" fill="#e6c08a"/>
    <ellipse cx="${L - 22}" cy="51" rx="9" ry="19" fill="none" stroke="#b98a52" stroke-width="3"/>
    <ellipse cx="${L - 22}" cy="51" rx="3" ry="7" fill="#b98a52"/>
  </svg>`;
}

// Vlot van bovenaf: korte stammetjes naast elkaar, met twee touwen vastgebonden.
function vlot(lengte: number): string {
  const L = Math.round(lengte * 100);
  const n = Math.max(3, Math.round((L - 8) / 24));
  const b = (L - 8) / n;
  let stammen = '';
  for (let k = 0; k < n; k++) {
    const x = 4 + k * b;
    const kleur = k % 2 ? '#b07a42' : '#c48a4c';
    stammen += `<rect x="${(x + 1).toFixed(1)}" y="12" width="${(b - 2).toFixed(1)}" height="76" rx="${(b / 2 - 1).toFixed(1)}" fill="${kleur}" stroke="#6e4522" stroke-width="3"/>`;
    stammen += `<ellipse cx="${(x + b / 2).toFixed(1)}" cy="18" rx="${(b / 2 - 4).toFixed(1)}" ry="5" fill="#e6c08a"/>`;
  }
  return `<svg viewBox="0 0 ${L} 100" aria-hidden="true">
    ${stammen}
    <rect x="2" y="30" width="${L - 4}" height="7" rx="3" fill="#e8d6a8" stroke="#8a6a3a" stroke-width="2"/>
    <rect x="2" y="64" width="${L - 4}" height="7" rx="3" fill="#e8d6a8" stroke="#8a6a3a" stroke-width="2"/>
  </svg>`;
}
const RAFT_TEKENING = { boomstam, schots, vlot };

// IJsschots van bovenaf: een grillige witte plaat met een blauwe rand.
function schots(lengte: number): string {
  const L = Math.round(lengte * 100);
  const punten: string[] = [];
  const stappen = Math.max(4, Math.round(L / 40));
  for (let k = 0; k <= stappen; k++) punten.push(`${((k / stappen) * (L - 20) + 10).toFixed(0)},${(14 + Math.random() * 12).toFixed(0)}`);
  punten.push(`${L - 4},50`);
  for (let k = stappen; k >= 0; k--) punten.push(`${((k / stappen) * (L - 20) + 10).toFixed(0)},${(74 + Math.random() * 12).toFixed(0)}`);
  punten.push('4,50');
  return `<svg viewBox="0 0 ${L} 100" aria-hidden="true">
    <polygon points="${punten.join(' ')}" fill="#e8f6ff" stroke="#8cc8e8" stroke-width="5" stroke-linejoin="round"/>
    <rect x="${(L * 0.18).toFixed(0)}" y="32" width="${(L * 0.4).toFixed(0)}" height="10" rx="5" fill="#fff"/>
    <rect x="${(L * 0.5).toFixed(0)}" y="56" width="${(L * 0.3).toFixed(0)}" height="8" rx="4" fill="#cbe9fb"/>
  </svg>`;
}

export function OversteekScreen(manager: ScreenManager): Screen {
  const kleuter = haalGroep() === 'kleuter';
  const themaId = huidigThema();
  const thema = OVERSTEEK_THEMAS[themaId];
  // Meten kost een paar milliseconden per plaatje; klaar voordat je op start drukt.
  for (const sr of [...thema.vijanden, ...thema.zeldzaam, ...(thema.rivier?.drijvers ?? [])]) {
    if (isTekening(sr.teken)) meetRand(tekeningSrc(sr.teken), 0, TEKENINGEN[sr.teken].verhouding);
    if (sr.src) meetRand(sr.src, sr.draai);
    if (sr.wagon) meetRand(sr.wagon, sr.draai);
  }

  const el = document.createElement('div');
  el.className = `ov-scherm ov-scherm--${themaId}`;

  const veld = document.createElement('div');
  veld.className = 'ov-veld';
  el.appendChild(veld);

  const balk = document.createElement('div');
  balk.className = 'vang-balk';
  const levelEl = document.createElement('div');
  levelEl.className = 'vang-score ov-level';
  levelEl.innerHTML = `<img src="${VLAG}" alt=""><span>1</span>`;
  const scoreEl = document.createElement('div');
  scoreEl.className = 'vang-score';
  scoreEl.innerHTML = `<img src="${STER}" alt=""><span>0</span>`;
  const hartjes = document.createElement('div');
  hartjes.className = 'vang-hartjes';
  balk.append(levelEl, scoreEl, hartjes);
  el.appendChild(balk);

  // Liggende telefoon: te weinig hoogte voor alle banen. Zelfde melding en media query
  // als het vangspel (.vang-draai in screens.css).
  const draaiNodig = window.matchMedia('(orientation: landscape) and (max-height: 500px) and (pointer: coarse)');
  const draai = document.createElement('div');
  draai.className = 'vang-draai';
  draai.innerHTML = '<div class="vang-draai__telefoon"></div><p>Draai je telefoon</p>';
  el.appendChild(draai);

  const profiel = haalActiefProfiel();
  const tint = avatarFilter(profiel?.kleur);
  const speler = document.createElement('div');
  speler.className = 'ov-speler';
  const spelerImg = document.createElement('img');
  spelerImg.className = 'ov-speler__img';
  spelerImg.src = avatarPad(profiel?.icoonId ?? 'kat');
  spelerImg.alt = '';
  // Inline filter wint van de CSS drop-shadow, dus die blijft hieraan geplakt.
  spelerImg.style.filter = [tint, 'drop-shadow(0 5px 3px rgba(0, 0, 0, 0.35))'].filter(Boolean).join(' ');
  // Vier pijltjes om het figuurtje tot de eerste sprong: hier tikken = die kant op.
  const pijlen = document.createElement('div');
  pijlen.className = 'ov-pijlen';
  pijlen.innerHTML = '<i class="ov-pijl ov-pijl--op"></i><i class="ov-pijl ov-pijl--links"></i><i class="ov-pijl ov-pijl--rechts"></i>';
  speler.append(pijlen, spelerImg);

  const banner = document.createElement('div');
  banner.className = 'ov-banner';
  banner.hidden = true;
  el.appendChild(banner);

  let banen: Baan[] = [];
  let N = 0; // aantal rijen
  let c = 60; // px per vakje
  let Wc = KOLOMMEN_MIN; // veldbreedte in vakjes
  let level = 1;
  let score = 0;
  let levens = LEVENS;
  let rij = 0;
  let px = 0; // midden van de speler, vakjes
  let hoogste = 0; // hoogste rij dit level (punten alleen voor nieuwe rijen)
  let vanX = 0;
  let vanRij = 0;
  let hopT = HOP;
  let buffer: Richting | null = null;
  let kijkRechts = false;
  let tijd = 0;
  let onkwetsbaar = 0;
  let doodTot = 0;
  let dood: 'au' | 'plons' | null = null;
  let tussenTot = 0;
  let fase: 'wacht' | 'spel' | 'tussen' | 'uit' = 'wacht';
  let ster: { el: HTMLElement; rij: number; x: number } | null = null;
  let frame = 0;
  let actief = false; // de lus draait zolang het scherm er is
  let vorigeT = 0;
  let overlay: HTMLElement | null = null;
  let overlayActie: (() => void) | null = null; // spatie/Enter op een venster
  let eersteSprong = true;

  // ---------- maten ----------

  function maxBanen(): number {
    const beschikbaar = window.innerHeight - 96;
    return Math.max(3, Math.floor(beschikbaar / 44) - 3);
  }

  function maatVeld(): void {
    if (!N) return;
    // Onder de balk (die op smalle schermen over twee regels loopt).
    const boven = Math.max(70, balk.getBoundingClientRect().bottom + 10);
    const beschikbaarH = window.innerHeight - boven - 10;
    const beschikbaarB = window.innerWidth;
    c = Math.max(24, Math.floor(Math.min(96, beschikbaarH / N, beschikbaarB / KOLOMMEN_MIN)));
    Wc = Math.min(KOLOMMEN_MAX, beschikbaarB / c);
    veld.style.setProperty('--c', `${c}px`);
    veld.style.width = `${Wc * c}px`;
    veld.style.height = `${N * c}px`;
    veld.style.top = `${boven + Math.max(0, (beschikbaarH - N * c) / 2)}px`;
    px = Math.min(Wc - 0.5, Math.max(0.5, px));
    vanX = Math.min(Wc - 0.5, Math.max(0.5, vanX));
  }

  // ---------- dingen in de banen ----------

  function maakDing(s: Soort, richting: 1 | -1, rek: number, drijft: boolean): Ding {
    const d = document.createElement('div');
    d.className = 'ov-ding';
    if (s.teken === 'boomstam' || s.teken === 'schots' || s.teken === 'vlot') {
      d.innerHTML = RAFT_TEKENING[s.teken](rek);
      d.classList.add('ov-ding--drijver');
      d.style.width = `calc(var(--c) * ${rek})`;
      // Boomstam en schots zijn tot vlak bij de rand getekend.
      const r = s.teken === 'schots' ? 0.04 : 0.03;
      return { el: d, x: 0, lengte: rek, links: r, rechts: rek - r };
    }
    if (s.teken === 'trein') return maakTrein(d, s, richting);
    const kijkt = s.kijkt ?? 'l';
    const spiegel = kijkt !== 'geen' && (kijkt === 'l') === (richting === 1);
    // Een vlot van eendjes, nijlpaarden of stenen is net zo lang als een boomstam op dat
    // level (`rek`), anders zijn de vlotjes op sommige achtergronden veel korter.
    const vlot = drijft && s.aantal ? Math.max(2, Math.round((rek - s.maat) / (s.maat * 0.82)) + 1) : 0;
    const n = vlot || (s.wagon ? 1 + heelGetal(s.wagons ?? [2, 3]) : s.aantal ? heelGetal(s.aantal) : 1);
    // Wat je ziet is wat je raakt. Een plaatje is nooit hoger dan HOOG_MAX (anders loopt het
    // over de buurbanen), dus een vierkant Fluent-plaatje is ook niet breder dan dat; alleen
    // lange voertuigen (`lang`) worden in de lengte uitgerekt tot hun hele maat.
    const hoogte = Math.min(s.maat, HOOG_MAX);
    const tekening = isTekening(s.teken) ? s.teken : null;
    const zicht = s.lang ? s.maat : Math.min(s.maat, hoogte * (tekening ? TEKENINGEN[tekening].verhouding : 1));
    // Kuddes lopen een beetje over elkaar heen, wagons sluiten aan.
    const stap = s.wagon ? s.maat * 0.92 : s.aantal ? s.maat * 0.82 : s.maat;
    const lengte = (n - 1) * stap + s.maat;
    let links = Infinity;
    let rechts = -Infinity;
    const kleur = s.kleuren ? `hue-rotate(${Math.floor(Math.random() * 360)}deg)` : '';
    for (let k = 0; k < n; k++) {
      // De kop rijdt voorop: links als het naar links gaat, rechts als het naar rechts gaat.
      const isKop = richting === -1 ? k === 0 : k === n - 1;
      const stuk = document.createElement('span');
      stuk.className = 'ov-stuk';
      stuk.style.left = `calc(var(--c) * ${k * stap})`;
      stuk.style.width = `calc(var(--c) * ${s.maat})`;
      stuk.style.height = `calc(var(--c) * ${hoogte})`;
      const schuif = s.aantal && n > 1 ? Math.random() * 0.14 - 0.07 : 0;
      stuk.style.top = `calc(var(--c) * ${((1 - hoogte) / 2 + schuif).toFixed(3)})`;
      if (s.dobber) {
        stuk.classList.add('ov-stuk--dobber');
        stuk.style.animationDelay = `${(-Math.random()).toFixed(2)}s`;
      }
      const src = tekening ? tekeningSrc(tekening) : s.wagon && !isKop ? s.wagon : s.src!;
      // Zichtbaar deel van dit plaatje: het staat gecentreerd in zijn vak (of gerekt).
      const [fl, fr] = rand(s, src);
      const [zl, zr] = spiegel ? [1 - fr, 1 - fl] : [fl, fr];
      const begin = k * stap + (s.lang ? 0 : (s.maat - zicht) / 2);
      links = Math.min(links, begin + zl * zicht);
      rechts = Math.max(rechts, begin + zr * zicht);
      let binnen: Element;
      if (tekening) {
        const houder = document.createElement('div');
        houder.innerHTML = TEKENINGEN[tekening].svg.trim();
        binnen = houder.firstElementChild as Element;
        binnen.setAttribute('class', `ov-tekening ov-tekening--${tekening}`);
      } else {
        const img = document.createElement('img');
        img.src = src;
        img.alt = '';
        if (kleur) img.style.filter = kleur;
        if (s.lang) img.classList.add('ov-stuk__beeld--lang');
        binnen = img;
      }
      binnen.classList.add('ov-stuk__beeld');
      const draaiing = [spiegel ? 'scaleX(-1)' : '', s.draai ? `rotate(${s.draai}deg)` : ''].filter(Boolean).join(' ');
      if (draaiing) (binnen as HTMLElement).style.transform = draaiing;
      if (s.spin) {
        binnen.classList.add('ov-stuk--spin');
        (binnen as HTMLElement).style.animationDirection = richting === 1 ? 'normal' : 'reverse';
        (binnen as HTMLElement).style.animationDuration = `${willekeurig(1.6, 3).toFixed(1)}s`;
      }
      stuk.appendChild(binnen);
      d.appendChild(stuk);
    }
    d.style.width = `calc(var(--c) * ${lengte})`;
    return { el: d, x: 0, lengte, links, rechts };
  }

  // De trein uit de achtergrond: loc (rijdt naar rechts) met wagons erachter, één vakje hoog.
  // Naar links rijden = de hele trein gespiegeld, zodat de loc altijd voorop gaat (de rook
  // waait dan ook mee de goede kant op). Wielen draaien en de loc rookt, net als op de
  // achtergrond. De tekeningen lopen tot de rand van hun vak: botsen over de hele lengte.
  function maakTrein(d: HTMLElement, s: Soort, richting: 1 | -1): Ding {
    const OVERLAP = 0.035; // buffers schuiven een beetje in elkaar
    const rij = document.createElement('div');
    rij.className = `ov-trein${richting === -1 ? ' ov-trein--links' : ''}`;
    const stukken = [...treinWagons(!!s.goederen, heelGetal(s.wagons ?? [1, 2])), { svg: TREIN_LOC, soort: 'loc' }];
    let lengte = 0;
    for (const st of stukken) {
      const breedte = (st.soort === 'loc' ? 160 : 120) / 104;
      const vak = document.createElement('div');
      vak.className = `ov-trein__stuk ov-trein__stuk--${st.soort}`;
      vak.style.width = `calc(var(--c) * ${breedte.toFixed(3)})`;
      vak.innerHTML = st.svg.trim();
      if (st.soort === 'loc') {
        const rook = document.createElement('div');
        rook.className = 'trein-rook';
        rook.innerHTML = '<div class="trein-pluim"></div><div class="trein-pluim"></div><div class="trein-pluim"></div>';
        vak.appendChild(rook);
      }
      rij.appendChild(vak);
      lengte += breedte;
    }
    lengte -= OVERLAP * (stukken.length - 1);
    d.appendChild(rij);
    d.style.width = `calc(var(--c) * ${lengte})`;
    return { el: d, x: 0, lengte, links: 0.03, rechts: lengte - 0.03 };
  }

  function nieuwDing(b: Baan): Ding {
    const ding = maakDing(b.bron!, b.richting, willekeurig(b.rek[0], b.rek[1]), b.soort === 'water');
    // Alleen in de dev-server: tests tekenen hiermee de botsrand over het plaatje.
    if (import.meta.env.DEV) Object.assign(ding.el.dataset, { links: String(ding.links), rechts: String(ding.rechts) });
    b.el.appendChild(ding.el);
    b.dingen.push(ding);
    b.volgendGat = willekeurig(b.gat[0], b.gat[1]);
    return ding;
  }

  // Vult een gewone baan aan de kant waar alles binnenkomt. De nieuwste staat achteraan
  // in de lijst. Het gat telt tussen wat je ziet (niet tussen de vakken), zodat een gat
  // van 3 ook echt 3 vakjes ruimte is. Bij een lege baan komt de eerste bij de uitgang,
  // zodat het beeld vanaf het begin vol is.
  function vul(b: Baan): void {
    for (let k = 0; k < 40; k++) {
      const laatste = b.dingen[b.dingen.length - 1];
      if (b.richting === 1) {
        // Zichtbare rechterkant van de nieuwe: net buiten beeld links.
        const grens = laatste ? laatste.x + laatste.links - b.volgendGat : Wc - willekeurig(0, 2);
        if (laatste && grens < 0) return;
        const d = nieuwDing(b);
        d.x = grens - d.rechts;
      } else {
        const grens = laatste ? laatste.x + laatste.rechts + b.volgendGat : willekeurig(0, 2);
        if (laatste && grens > Wc) return;
        const d = nieuwDing(b);
        d.x = grens - d.links;
      }
    }
  }

  function tekenDing(d: Ding): void {
    d.el.style.transform = `translate3d(${(d.x * c).toFixed(1)}px, 0, 0)`;
  }

  // ---------- level opbouwen ----------

  function bouwLevel(): void {
    for (const b of banen) b.el.remove();
    ster = null;
    banen = [];
    // Rustig opbouwen: elk aantal banen komt twee levels achter elkaar.
    const reeks = kleuter ? [3, 3, 3, 4, 4, 5, 5, 6] : [3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8];
    const n = Math.min(reeks[Math.min(level - 1, reeks.length - 1)], maxBanen());
    // Water vanaf level 4 (kleuters 5).
    const waterVanaf = kleuter ? 5 : 4;
    const water = !!thema.rivier && level >= waterVanaf && n >= 4;
    const plan: BaanSoort[] = ['start'];
    if (n >= 5 || water) {
      const onder = Math.ceil(n / 2);
      for (let k = 0; k < onder; k++) plan.push('weg');
      plan.push('veilig');
      for (let k = 0; k < n - onder; k++) plan.push(water ? 'water' : 'weg');
    } else {
      for (let k = 0; k < n; k++) plan.push('weg');
    }
    plan.push('finish');
    N = plan.length;
    maatVeld();

    const f = (kleuter ? 0.72 : 1) * Math.min(2, 1 + 0.08 * (level - 1));
    // Zichtbare ruimte tussen twee dingen: begint ruim en krimpt langzaam.
    const gatMin = kleuter ? Math.max(2.4, 4.4 - 0.15 * (level - 1)) : Math.max(1.6, 3.8 - 0.18 * (level - 1));
    const gatExtra = kleuter ? 2.8 : 2.6;
    const Lw = Math.max(0, level - waterVanaf); // levels sinds het water begon
    // Elke baan een ander soort, zolang de lijst strekt.
    const vijanden = [...thema.vijanden].sort(() => Math.random() - 0.5);
    const drijvers = thema.rivier ? [...thema.rivier.drijvers].sort(() => Math.random() - 0.5) : [];
    const wegRijen = plan.flatMap((s, r) => (s === 'weg' ? [r] : []));
    // Uitschieters: vanaf level 6 (kleuters 7) één baan, vanaf level 9 twee.
    const uitschieters = new Set<number>();
    if (thema.zeldzaam.length && level >= (kleuter ? 7 : 6)) {
      const aantal = level >= 9 && wegRijen.length >= 6 ? 2 : 1;
      const kandidaten = [...wegRijen].sort(() => Math.random() - 0.5);
      for (const r of kandidaten.slice(0, aantal)) uitschieters.add(r);
    }
    let richting: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
    let wegTeller = 0;
    let waterTeller = 0;

    plan.forEach((soort, r) => {
      const bel = document.createElement('div');
      bel.className = `ov-baan ov-baan--${soort}`;
      bel.style.top = `calc(var(--c) * ${N - 1 - r})`;
      const grond = soort === 'weg' ? thema.weg : soort === 'water' ? thema.rivier!.water : thema.veilig;
      bel.classList.add(`ov-grond--${grond}`);
      if (soort === 'weg' && plan[r + 1] === 'weg') bel.classList.add('ov-baan--streep');
      // Een berm naast de weg: daar mag het gras over de rand groeien (alleen savanne).
      if (soort !== 'weg' && soort !== 'water') {
        if (plan[r + 1] === 'weg') bel.classList.add('ov-baan--weg-boven');
        if (plan[r - 1] === 'weg') bel.classList.add('ov-baan--weg-onder');
      }
      veld.appendChild(bel);
      const b: Baan = {
        soort,
        el: bel,
        richting,
        v: 0,
        bron: null,
        dingen: [],
        gat: [gatMin, gatMin + gatExtra],
        rek: [1, 1],
        volgendGat: 0,
        sporadisch: false,
        wacht: 0,
        tussen: [3, 6],
        lamp: null,
        belGespeeld: false,
      };
      if (soort === 'weg') {
        const zeldzaam = uitschieters.has(r);
        const s = zeldzaam
          ? thema.zeldzaam[Math.floor(Math.random() * thema.zeldzaam.length)]
          : vijanden[wegTeller++ % vijanden.length];
        b.bron = s;
        b.sporadisch = zeldzaam || !!s.sporadisch;
        b.v = Math.min(7.5, willekeurig(1, 1.7) * (s.snel ?? 1) * f);
        if (b.sporadisch) {
          b.tussen = [Math.max(1.6, (kleuter ? 6 : 5.5) - 0.3 * level), Math.max(3, (kleuter ? 10 : 9.5) - 0.4 * level)];
          b.wacht = willekeurig(1.6, 3.5);
          const lamp = document.createElement('div');
          lamp.className = `ov-lamp ov-lamp--${b.richting === 1 ? 'links' : 'rechts'}`;
          lamp.innerHTML = '<i></i><i></i>';
          bel.appendChild(lamp);
          b.lamp = lamp;
        }
      } else if (soort === 'water') {
        const s = drijvers[waterTeller++ % drijvers.length];
        b.bron = s;
        b.v = Math.min(3, willekeurig(0.7, 1.25) * f * (s.snel ?? 1));
        const lang = Math.max(1.6, 2.8 - 0.2 * Lw) + (kleuter ? 0.6 : 0);
        b.rek = [lang, lang + 1];
        b.gat = [Math.min(1.3, 0.8 + 0.08 * Lw), Math.min(2.8, 1.8 + 0.15 * Lw)];
      }
      if (b.bron && !b.sporadisch) vul(b);
      if (soort === 'weg' || soort === 'water') richting = richting === 1 ? -1 : 1;
      if (soort === 'finish') {
        for (const [k, src] of thema.overkant.entries()) {
          const img = document.createElement('img');
          img.className = 'ov-versiering';
          img.src = src;
          img.alt = '';
          img.style.left = `${((k + 0.5) / thema.overkant.length) * 100}%`;
          bel.appendChild(img);
        }
      }
      banen.push(b);
    });

    // Eén ster per level, op een baan met verkeer of op de middenberm.
    const sterRijen = plan.flatMap((s, r) => (s === 'weg' || s === 'veilig' ? [r] : []));
    const sr = sterRijen[Math.floor(Math.random() * sterRijen.length)];
    const sx = Math.floor(willekeurig(1, Math.max(2, Wc - 1))) + 0.5;
    const sEl = document.createElement('img');
    sEl.className = 'ov-ster';
    sEl.src = STER;
    sEl.alt = '';
    sEl.style.left = `calc(var(--c) * ${sx})`;
    banen[sr].el.appendChild(sEl);
    ster = { el: sEl, rij: sr, x: sx };

    rij = 0;
    hoogste = 0;
    px = vanX = Math.floor(Wc / 2) + 0.5;
    vanRij = 0;
    hopT = HOP;
    buffer = null;
    levelEl.querySelector('span')!.textContent = String(level);
    for (const b of banen) for (const d of b.dingen) tekenDing(d);
    tekenSpeler();
  }

  // ---------- speler ----------

  function tekenSpeler(): void {
    const t = Math.min(1, hopT / HOP);
    const x = vanX + (px - vanX) * t;
    const r = vanRij + (rij - vanRij) * t;
    const sprong = Math.sin(Math.PI * t) * 0.28; // even groter in de lucht
    speler.style.width = speler.style.height = `${c}px`;
    // Plaats via `translate` (los van transform): dan popt de startflits (`scale`) op zijn plek.
    speler.style.translate = `${((x - 0.5) * c).toFixed(1)}px ${((N - 1 - r) * c).toFixed(1)}px`;
    speler.style.transform = `scale(${(1 + sprong).toFixed(3)})`;
    spelerImg.classList.toggle('ov-speler__img--rechts', kijkRechts);
    speler.classList.toggle('ov-speler--knipper', tijd < onkwetsbaar);
  }

  function hop(richting: Richting): void {
    // Tijdens de flits (start, na een klap, nieuw level) kun je nog niet springen.
    if (fase !== 'spel' || dood || draaiNodig.matches || flitstNog(speler)) return;
    if (hopT < HOP) {
      buffer = richting;
      return;
    }
    const nr = rij + (richting === 'op' ? 1 : richting === 'neer' ? -1 : 0);
    if (nr < 0 || nr >= N) return;
    let nx = px + (richting === 'links' ? -1 : richting === 'rechts' ? 1 : 0);
    nx = Math.min(Wc - 0.5, Math.max(0.5, nx));
    if (nx === px && nr === rij) return;
    vanX = px;
    vanRij = rij;
    px = nx;
    rij = nr;
    hopT = 0;
    if (richting === 'links') kijkRechts = false;
    if (richting === 'rechts') kijkRechts = true;
    if (eersteSprong) {
      eersteSprong = false;
      pijlen.hidden = true;
    }
    if (richting === 'op') {
      // Hoe dichter bij de overkant, hoe hoger de toon.
      speelNoot(TONEN[Math.round((rij / (N - 1)) * 7)]);
      if (rij > hoogste) {
        hoogste = rij;
        if (rij < N - 1) zetScore(score + 1);
      }
    } else {
      speelNoot(TONEN[0] / 2);
    }
  }

  function sterf(soort: 'au' | 'plons'): void {
    if (dood || fase !== 'spel') return;
    dood = soort;
    doodTot = tijd + DOOD_DUUR;
    levens--;
    tekenHartjes();
    buffer = null;
    if (soort === 'au') {
      speelDrum('bas');
      speelDrum('bekken', 0.05);
    } else {
      speelDrum('snare');
      speelDrum('bekken', 0.04);
      const plons = document.createElement('div');
      plons.className = 'ov-plons';
      plons.style.left = `${px * c}px`;
      plons.style.top = `${(N - 1 - rij + 0.5) * c}px`;
      veld.appendChild(plons);
      window.setTimeout(() => plons.remove(), 900);
    }
    speler.classList.add(`ov-speler--${soort}`);
  }

  function naDood(): void {
    speler.classList.remove('ov-speler--au', 'ov-speler--plons');
    dood = null;
    if (levens <= 0) {
      klaar();
      return;
    }
    // Terug naar de laatste veilige strook onder je.
    let r = rij;
    while (r > 0 && banen[r].soort !== 'veilig' && banen[r].soort !== 'start') r--;
    rij = vanRij = r;
    px = vanX = Math.min(Wc - 0.5, Math.max(0.5, Math.floor(px) + 0.5));
    hopT = HOP;
    onkwetsbaar = tijd + 1.3;
    tekenSpeler();
    flitsIn(speler, veld);
  }

  function gehaald(): void {
    fase = 'tussen';
    tussenTot = tijd + TUSSEN_DUUR;
    zetScore(score + 10);
    toonPlop(px, rij, '+10');
    [0, 2, 4, 7].forEach((k, j) => speelNoot(TONEN[k], j * 0.11));
    confetti.vuurwerk('klein');
    speler.classList.add('ov-speler--juich');
    banner.innerHTML = `<img src="${VLAG}" alt=""><span>${level + 1}</span>`;
    banner.hidden = false;
    banner.classList.remove('ov-banner--in');
    void banner.offsetWidth;
    banner.classList.add('ov-banner--in');
  }

  // ---------- spel-lus ----------

  // Het verkeer rijdt ook achter het begin- en eindvenster door; de speler alleen tijdens het spel.
  function stap(t: number): void {
    if (!actief) return;
    frame = requestAnimationFrame(stap);
    const dt = Math.min(0.05, (t - (vorigeT || t)) / 1000);
    vorigeT = t;
    if (draaiNodig.matches) return;
    tijd += dt;

    for (const [r, b] of banen.entries()) {
      if (!b.bron) continue;
      const dx = b.v * b.richting * dt;
      for (const d of b.dingen) d.x += dx;
      b.dingen = b.dingen.filter((d) => {
        const weg = b.richting === 1 ? d.x > Wc + 0.5 : d.x + d.lengte < -0.5;
        if (weg) d.el.remove();
        return !weg;
      });
      if (b.sporadisch) {
        if (b.dingen.length) continue;
        b.wacht -= dt;
        const aan = b.wacht < 1.5;
        b.lamp?.classList.toggle('ov-lamp--aan', aan);
        b.el.classList.toggle('ov-baan--let-op', aan);
        if (aan && !b.belGespeeld && Math.abs(r - rij) <= 2 && fase === 'spel') {
          b.belGespeeld = true;
          speelNoot(TONEN[5], 0);
          speelNoot(TONEN[5], 0.32);
        }
        if (b.wacht <= 0) {
          const d = nieuwDing(b);
          d.x = b.richting === 1 ? -d.lengte : Wc;
          b.wacht = willekeurig(b.tussen[0], b.tussen[1]);
          b.belGespeeld = false;
          b.lamp?.classList.remove('ov-lamp--aan');
          b.el.classList.remove('ov-baan--let-op');
        }
      } else {
        vul(b);
      }
    }
    for (const b of banen) for (const d of b.dingen) tekenDing(d);
    if (fase === 'wacht' || fase === 'uit') return;

    if (fase === 'tussen') {
      if (tijd >= tussenTot) {
        banner.hidden = true;
        speler.classList.remove('ov-speler--juich');
        level++;
        fase = 'spel';
        bouwLevel();
        flitsIn(speler, veld);
      }
      tekenSpeler();
      return;
    }

    if (dood) {
      if (tijd >= doodTot) naDood();
      tekenSpeler();
      return;
    }

    hopT += dt;
    if (hopT >= HOP && buffer) {
      const volgende = buffer;
      buffer = null;
      hop(volgende);
    }
    const baan = banen[rij];
    const geland = hopT >= HOP;
    // Op het water drijf je mee, ook midden in een sprong (zoals in Frogger): springen langs
    // de eendjes of naar de volgende rij houdt je gewoon bij je vlot. Aan de rand van het
    // veld word je tegengehouden; je valt pas in het water als je vlot onder je vandaan
    // drijft. Op een telefoon (7 vakjes breed) was meteen verdrinken aan de rand te streng.
    const drijfBaan = banen[geland ? rij : vanRij];
    if (drijfBaan.soort === 'water') {
      const dx = drijfBaan.v * drijfBaan.richting * dt;
      const tegen = (x: number): number => Math.min(Wc - 0.5, Math.max(0.5, x + dx));
      px = tegen(px);
      vanX = geland ? px : tegen(vanX);
    }
    if (baan.soort === 'water' && geland) {
      // Wat drijft er onder je? Ook hier telt het midden van het figuurtje, met een
      // randje speling (0,1 vakje).
      if (!baan.dingen.some((d) => px > d.x + d.links - 0.1 && px < d.x + d.rechts + 0.1)) sterf('plons');
    }
    // Aanrijden: in de baan waar je te zien bent. Tijdens een sprong is dat de eerste helft
    // nog de oude baan, daarna de nieuwe; ook opzij telt de plek waar je nu in beeld bent.
    const halfweg = hopT >= HOP / 2;
    const zichtBaan = banen[halfweg ? rij : vanRij];
    const zx = vanX + (px - vanX) * Math.min(1, hopT / HOP);
    if (!dood && zichtBaan.soort === 'weg' && tijd >= onkwetsbaar) {
      if (zichtBaan.dingen.some((d) => zx > d.x + d.links && zx < d.x + d.rechts)) sterf('au');
    }
    if (!dood && ster && ster.rij === rij && Math.abs(ster.x - px) < 0.6) {
      ster.el.remove();
      toonPlop(ster.x, rij, '+5');
      ster = null;
      zetScore(score + 5);
      speelNoot(TONEN[4]);
      speelNoot(TONEN[7], 0.08);
    }
    if (!dood && rij === N - 1 && geland) gehaald();
    tekenSpeler();
  }

  // ---------- balk, vensters ----------

  function tekenHartjes(): void {
    hartjes.replaceChildren(
      ...Array.from({ length: LEVENS }, (_, k) => {
        const h = document.createElement('img');
        h.src = HART;
        h.alt = '';
        if (k >= levens) h.className = 'vang-hart--weg';
        return h;
      }),
    );
  }

  function zetScore(n: number): void {
    score = n;
    scoreEl.querySelector('span')!.textContent = String(score);
  }

  function toonPlop(x: number, r: number, tekst: string): void {
    const plop = document.createElement('div');
    plop.className = 'vang-plop';
    plop.textContent = tekst;
    plop.style.left = `${x * c}px`;
    plop.style.top = `${(N - 1 - r + 0.3) * c}px`;
    veld.appendChild(plop);
    window.setTimeout(() => plop.remove(), 700);
  }

  function start(): void {
    overlay?.remove();
    overlay = null;
    overlayActie = null;
    // Alleen in de dev-server: een test kan meteen op een hoger level beginnen.
    level = (import.meta.env.DEV ? (window as { __oversteekLevel?: number }).__oversteekLevel : undefined) ?? 1;
    zetScore(0);
    levens = LEVENS;
    tekenHartjes();
    tijd = 0;
    onkwetsbaar = 0;
    dood = null;
    speler.classList.remove('ov-speler--au', 'ov-speler--plons', 'ov-speler--juich');
    banner.hidden = true;
    eersteSprong = true;
    pijlen.hidden = false;
    fase = 'spel';
    bouwLevel();
    // De flits is op de wikkel (div), want het plaatje zelf knippert al als je onkwetsbaar bent.
    flitsIn(speler, veld);
  }

  function knop(klasse: string, html: string, label: string, actie: () => void): HTMLButtonElement {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = klasse;
    b.innerHTML = html;
    b.setAttribute('aria-label', label);
    b.addEventListener('click', actie);
    return b;
  }

  // Twee stukjes water voor het startvenster: het figuurtje op een vlot (goed) en het
  // figuurtje dat zinkt met een plons (fout).
  function waterPlaatjes(rivier: NonNullable<typeof thema.rivier>): { goed: string; fout: string } {
    const vlotSoort = rivier.drijvers.find((d) => d.teken !== 'boomstam') ?? rivier.drijvers[0];
    const vlotHtml = vlotSoort.teken === 'boomstam' || vlotSoort.teken === 'schots' || vlotSoort.teken === 'vlot'
      ? RAFT_TEKENING[vlotSoort.teken](2)
      : `<img src="${vlotSoort.src}" alt=""><img src="${vlotSoort.src}" alt="">`;
    const plas = `<span class="ov-uitleg-water ov-grond--${rivier.water}"></span>`;
    const fig = (extra: string): string => `<img class="ov-uitleg-figuur${extra}" src="${spelerImg.src}" alt=""${tint ? ` style="filter: ${tint}"` : ''}>`;
    return {
      goed: `<span class="ov-uitleg-plek">${plas}<span class="ov-uitleg-vlot">${vlotHtml}</span>${fig('')}</span>`,
      fout: `<span class="ov-uitleg-plek">${plas}${fig(' ov-uitleg-figuur--zinkt')}<i class="ov-uitleg-plons"></i></span>`,
    };
  }

  // Begin- en eindscherm: plaatjes in plaats van uitleg (overkant ✓, verkeer ✕).
  function toonVenster(eind: boolean): void {
    overlay?.remove();
    const v = document.createElement('div');
    v.className = 'vang-venster';
    const doos = document.createElement('div');
    doos.className = 'vang-venster__doos';
    const figuur = `<img class="vang-venster__figuur" src="${spelerImg.src}" alt="">`;
    if (eind) {
      const record = haalRecord('oversteken');
      const nieuw = score > record;
      if (nieuw) zetRecord('oversteken', score);
      doos.innerHTML = `${figuur}
        <div class="ov-eind">
          <div class="vang-venster__score"><img src="${STER}" alt=""><span>${score}</span></div>
          <div class="vang-venster__score ov-eind__level"><img src="${VLAG}" alt=""><span>${level}</span></div>
        </div>
        <p class="vang-venster__record">${nieuw ? 'Nieuw record!' : `Record: ${record}`}</p>`;
      if (nieuw && score > 0) confetti.vuurwerk('klein');
    } else {
      // Een gevaar als plaatje: Fluent-plaatje, of de trein / een eigen tekening inline.
      const plaatje = (s: Soort): string => {
        if (s.teken === 'trein') return `<span class="ov-voorbeeld ov-voorbeeld--trein">${TREIN_LOC}</span>`;
        if (isTekening(s.teken)) return `<span class="ov-voorbeeld">${TEKENINGEN[s.teken].svg}</span>`;
        const spiegel = (s.kijkt ?? 'l') === 'r' ? ' style="transform: scaleX(-1)"' : '';
        return `<img src="${s.src}" alt=""${spiegel}>`;
      };
      // Achtergronden met water (vanaf level 4) laten ook dat meteen zien: op een vlot staan
      // is goed, in het water vallen fout. Zonder dit dachten kinderen dat een vlot van
      // dieren gevaar was, net als op de weg.
      const water = thema.rivier ? waterPlaatjes(thema.rivier) : null;
      const gevaar = thema.vijanden.slice(0, water ? 1 : 2);
      doos.innerHTML = `${figuur}
        <div class="vang-uitleg ov-uitleg">
          <span class="vang-uitleg__vak vang-uitleg__vak--goed"><img src="${VLAG}" alt="">${water?.goed ?? ''}<b>✓</b></span>
          <span class="vang-uitleg__vak vang-uitleg__vak--fout">${gevaar.map(plaatje).join('')}${water?.fout ?? ''}<b>✕</b></span>
        </div>`;
      if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
        const hint = document.createElement('p');
        hint.className = 'vang-venster__toetsen';
        hint.innerHTML = '<kbd>←</kbd><kbd>↑</kbd><kbd>→</kbd><kbd>↓</kbd>';
        hint.setAttribute('aria-label', 'pijltjestoetsen');
        doos.appendChild(hint);
      }
    }
    const fig = doos.querySelector<HTMLImageElement>('.vang-venster__figuur');
    if (fig && tint) fig.style.filter = tint;
    doos.appendChild(knop('vang-venster__start', '<img src="assets/icons/vangspel-start.svg" alt="">', eind ? 'nog een keer' : 'start', start));
    v.appendChild(doos);
    el.appendChild(v);
    overlay = v;
    overlayActie = start;
  }

  function klaar(): void {
    if (fase === 'uit') return;
    fase = 'uit';
    window.setTimeout(() => {
      if (fase === 'uit') toonVenster(true);
    }, 500);
  }

  // ---------- besturing ----------

  // Tikken: die kant op, gezien vanaf het figuurtje (boven = vooruit). Vegen kan ook.
  let neer: { x: number; y: number; id: number } | null = null;
  const tikNeer = (e: PointerEvent): void => {
    if (overlay || (e.target as HTMLElement).closest('button')) return;
    e.preventDefault();
    neer = { x: e.clientX, y: e.clientY, id: e.pointerId };
  };
  const tikOp = (e: PointerEvent): void => {
    if (!neer || neer.id !== e.pointerId) return;
    const sx = e.clientX - neer.x;
    const sy = e.clientY - neer.y;
    neer = null;
    let dx: number;
    let dy: number;
    if (Math.hypot(sx, sy) > Math.max(24, c * 0.4)) {
      dx = sx;
      dy = sy;
    } else {
      const r = speler.getBoundingClientRect();
      dx = e.clientX - (r.left + r.width / 2);
      dy = e.clientY - (r.top + r.height / 2);
      if (Math.hypot(dx, dy) < c * 0.55) dy = -1; // op het figuurtje zelf: vooruit
    }
    hop(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'rechts' : 'links') : dy < 0 ? 'op' : 'neer');
  };
  el.addEventListener('pointerdown', tikNeer);
  el.addEventListener('pointerup', tikOp);
  el.addEventListener('pointercancel', () => (neer = null));

  const TOETSEN: Record<string, Richting> = {
    ArrowUp: 'op', w: 'op', W: 'op',
    ArrowDown: 'neer', s: 'neer', S: 'neer',
    ArrowLeft: 'links', a: 'links', A: 'links',
    ArrowRight: 'rechts', d: 'rechts', D: 'rechts',
  };
  const toetsNeer = (e: KeyboardEvent): void => {
    if ((e.key === ' ' || e.key === 'Enter') && overlayActie && !e.repeat) {
      e.preventDefault();
      overlayActie();
      return;
    }
    const r = TOETSEN[e.key];
    if (!r) return;
    e.preventDefault();
    if (!e.repeat) hop(r);
  };

  const terug = maakTerugKnop(() => manager.pop());
  const opGrootte = new ResizeObserver(() => {
    maatVeld();
    for (const b of banen) for (const d of b.dingen) tekenDing(d);
    tekenSpeler();
  });

  return {
    mount(root) {
      root.appendChild(el);
      root.appendChild(terug);
      tekenHartjes();
      bouwLevel();
      veld.appendChild(speler);
      tekenSpeler();
      opGrootte.observe(el);
      window.addEventListener('keydown', toetsNeer);
      toonVenster(false);
      actief = true;
      vorigeT = 0;
      frame = requestAnimationFrame(stap);
    },
    unmount() {
      fase = 'uit';
      actief = false;
      cancelAnimationFrame(frame);
      opGrootte.disconnect();
      window.removeEventListener('keydown', toetsNeer);
      el.remove();
      terug.remove();
    },
  };
}
