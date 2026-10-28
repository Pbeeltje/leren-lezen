import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { flitsIn, flitstNog } from '../components/spelFiguur.ts';
import { avatarFilter, avatarPad, haalActiefProfiel } from '../../engine/profielStore.ts';
import { haalGroep } from '../../engine/progressStore.ts';
import { maakDraaiMelding, maakHartjes, maakTeller, maakVenster, recordRegel, startKnop, toetsenHint, toonPlop as plopIn } from '../components/spelScherm.ts';
import { TONEN, speelDrum, speelNoot } from '../../engine/muziek.ts';
import { confetti } from '../../three/particles.ts';
import { bevriesDecor, huidigThema } from '../../achtergrond/achtergrond.ts';
import { GNOE } from '../../achtergrond/savanne.ts';
import { TREIN_LOC, treinWagons } from '../../achtergrond/trein.ts';
import { OVERSTEEK_THEMAS, type Rivier, type Soort, type Tekening, type Uitdaging, type Vlot } from './oversteek-themas.ts';
import { VLOT_TEKENINGEN } from './oversteek-vlotten.ts';
import { PACHY, RAPTOR, STEGOSAURUS, TRICERATOPS } from './oversteek-tekeningen.ts';
import { schud } from '../../engine/toeval.ts';

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
// record per profiel. Vanaf level 10 komt er een uitdaging van de achtergrond bij (stroom
// op de rails, een lawine, overstekende kwallen, ...), vanaf 15 nog een.
//
// Alles wordt in vakjes gerekend (`c` px per vakje): posities, snelheden, gaten. Zo
// past het spel zich bij draaien of een ander venster vanzelf aan.

const STER = 'assets/images/woorden/ster.svg';
const HART = 'assets/icons/bewaar.svg';
const VLAG = 'assets/oversteken/finish.svg';
const LEVENS = 3;

// Per ongeluk weg uit een lopend spel: level, hartjes en score blijven (per profiel) staan
// zolang de app open is; terugkomen en op start drukken gaat verder bij het begin van dat
// level. Ook op een andere achtergrond: alleen de volgorde van de uitdagingen hoort bij de
// achtergrond, die wordt dan opnieuw gehusseld.
interface LopendSpel {
  themaId: string;
  level: number;
  levens: number;
  score: number;
  uitdagingVolgorde: Uitdaging[];
}
const lopendeSpellen = new Map<string, LopendSpel>();
const HOP = 0.13; // s per sprongetje
const DOOD_DUUR = 1; // s tussen een klap en weer verder
const TUSSEN_DUUR = 2; // s feest aan de overkant
const KOLOMMEN_MIN = 7; // het veld is altijd minstens zo breed (in vakjes)
const KOLOMMEN_MAX = 15;
const HOOG_MAX = 1.15; // vakjes: hoger mag een plaatje niet, anders loopt het over de buurbanen
const UITDAGING_VANAF = [10, 15]; // op deze levels komt er een uitdaging van de achtergrond bij
const LAVA_VANAF = 10; // lavaland (dino) op level 10, 13, 16, ... (een thema kan dat anders zetten)
const LAVA_ELKE = 3;
const JAGER = 0.6; // vakjes: zo dichtbij raakt het spookje je
const HARTJE_VANAF = 10; // vanaf hier om het level een hartje om op te rapen
const VAL = 1.4; // s dat iets uit de lucht valt (inslag), met een schaduw die groeit
const NPC_HOP = 0.24; // s per sprongetje van een overstekertje
const PASSAGIER = 0.8; // vakjes: zo groot is een dier op een wagon
const DIER_RUIMTE = PASSAGIER + 1; // zo lang moet een vlot zijn voor een dier erop (ook twee lavastenen)
const DIER_SPRINGT = 15; // vanaf dit level springen de dieren soms naar de volgende wagon
const DIER_KLAAR = 0.6; // s wiebelen voor de sprong
const DIER_VLUCHT = 0.45; // s in de lucht

type BaanSoort = 'start' | 'veilig' | 'finish' | 'weg' | 'water';
type Richting = 'op' | 'neer' | 'links' | 'rechts';

interface Ding {
  el: HTMLElement;
  x: number; // linkerkant, vakjes
  lengte: number; // vakjes
  // Waar er echt iets te zien is, gemeten vanaf x (vakjes): hier botst of draagt het.
  links: number;
  rechts: number;
  // Zinken: dit vlot zakt af en toe even onder water, en draagt dan niet.
  duik?: { fase: 'boven' | 'wiebel' | 'onder'; t: number };
  onder?: boolean;
  // Dieren die op dit vlot staan (vanaf x, vakjes): daar botst het.
  gevaar?: [number, number][];
  // Het dier zelf, p: plek vanaf x; v: loopt heen en weer (vakjes/s, + is naar rechts).
  dier?: { el: HTMLElement; src: string; p: number; v: number };
}

// Een dier dat naar de volgende wagon springt (vanaf level 15): eerst wiebelt het even,
// dan vliegt het in een boogje over het gat.
interface DierSprong { el: HTMLElement; van: Ding; naar: Ding; p0: number; p1: number; t: number; src: string; v: number }

// Botsen gaat zoals in de echte Frogger (na de bekende reparatie): één punt, het midden
// van het figuurtje, tegen de echte breedte van wat er rijdt. Die breedte meten we aan de
// pixels van elk plaatje, want elk Fluent-plaatje heeft zijn eigen doorzichtige rand.
// Sleutel: pad + draaiing; waarde: eerste en laatste zichtbare kolom (0..1 van de breedte).
const RANDEN = new Map<string, [number, number]>();

// Eigen tekeningen die lopen (poten, staart, kop bewegen in CSS); verhouding = breedte/hoogte.
const TEKENINGEN: Record<Tekening, { svg: string; verhouding: number }> = {
  gnoe: { svg: GNOE, verhouding: 200 / 150 },
  stegosaurus: { svg: STEGOSAURUS, verhouding: 1 },
  raptor: { svg: RAPTOR, verhouding: 1 },
  pachy: { svg: PACHY, verhouding: 1 },
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
  // Uitdagingen (vanaf level 10):
  deelVan: number | null; // bovenste stuk van een kolos die in baan `deelVan` rijdt
  mede: Baan[]; // kolos: de banen erboven (die knipperen mee)
  // Hele baan gevaarlijk. Met een `maat` (vanaf level 15) gaan twee banen om de beurt.
  aan: { fase: 'uit' | 'let-op' | 'aan'; t: number; el: HTMLElement; maat: Baan | null } | null;
  keer: { fase: 'rijden' | 'remmen' | 'stil' | 'optrekken'; t: number; v: number; el: HTMLElement } | null;
  duikKans: number; // zinken/leegte: zoveel van de vlotten zakt af en toe weg (0 = geen)
  val: NonNullable<Rivier['val']>; // rivier: plons, stofwolk of sterretjes als je ernaast springt
  passagiers: string[]; // rivier: dieren die op een deel van de vlotten staan
  dierLoopt: boolean; // lavaland: ze lopen heen en weer en springen vanaf het begin
  sprongen: DierSprong[];
  springWacht: number;
}

interface Inslag { el: HTMLElement; x: number; r: number; t: number; geland: boolean }
// Een spookje: x in vakjes, y in rijen (0 = start); t telt af in de huidige fase. `zwerft`:
// zweeft naar steeds een ander `doel` in plaats van op je af.
interface Spookje { el: HTMLElement; x: number; y: number; fase: 'weg' | 'komt' | 'jaagt' | 'gaat'; t: number; zwerft: boolean; doel: [number, number] | null }
interface Overstekertje { el: HTMLElement; r: number; vanR: number; x: number; hopT: number; wacht: number; weg: number }

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
const RAFT_TEKENING: Record<Vlot, (lengte: number) => string> = { boomstam, schots, vlot, ...VLOT_TEKENINGEN };
const isVlot = (t: Soort['teken']): t is Vlot => !!t && t in RAFT_TEKENING;

// Stroom op de rails: gloeiende rails met bliksemschichten ertussen, in drie beeldjes die
// elkaar snel afwisselen (CSS). Bij elke stroomstoot nieuwe schichten.
function stroomSvg(): string {
  const schicht = (x: number): string => {
    let d = `M${x.toFixed(0)} 30`;
    for (let y = 40; y < 70; y += 8 + Math.random() * 6) d += ` L${(x + (Math.random() - 0.5) * 50).toFixed(0)} ${y.toFixed(0)}`;
    return `${d} L${(x + (Math.random() - 0.5) * 20).toFixed(0)} 70`;
  };
  const vonk = (y: number): string => {
    const x = Math.random() * 1000;
    return `M${x.toFixed(0)} ${y} Q${(x + 20).toFixed(0)} ${y + (y < 50 ? -14 : 14)} ${(x + 40).toFixed(0)} ${y}`;
  };
  let beeldjes = '';
  for (let k = 0; k < 3; k++) {
    let d = '';
    for (let x = Math.random() * 120; x < 1000; x += 90 + Math.random() * 110) d += schicht(x) + ' ';
    for (let j = 0; j < 6; j++) d += vonk(j % 2 ? 30 : 70) + ' ';
    beeldjes += `<g class="ov-vonk"><path d="${d}" stroke="#5ab8ff" stroke-width="7" opacity="0.6"/><path d="${d}" stroke="#fff" stroke-width="2.5"/></g>`;
  }
  return `<svg viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true">
    <g fill="none" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke">
      <path d="M0 30.5 H1000 M0 69.5 H1000" stroke="#3aa8ff" stroke-width="12" opacity="0.55"/>
      <path d="M0 30.5 H1000 M0 69.5 H1000" stroke="#e6f6ff" stroke-width="4"/>
      ${beeldjes}
    </g>
  </svg>`;
}

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
  const kolossen = thema.uitdagingen.flatMap((u) => (u.wat === 'kolos' ? [u.ding] : []));
  const leegtes = thema.uitdagingen.flatMap((u) => (u.wat === 'leegte' ? u.rivier.drijvers : []));
  for (const sr of [...thema.vijanden, ...thema.zeldzaam, ...(thema.rivier?.drijvers ?? []), ...kolossen, ...leegtes]) {
    if (isTekening(sr.teken)) meetRand(tekeningSrc(sr.teken), 0, TEKENINGEN[sr.teken].verhouding);
    if (sr.src) meetRand(sr.src, sr.draai);
    if (sr.wagon) meetRand(sr.wagon, sr.draai);
  }
  for (const u of thema.uitdagingen) if (u.wat === 'lavaland') for (const p of u.passagiers ?? []) meetRand(isTekening(p as Tekening) ? tekeningSrc(p as Tekening) : p);
  for (const src of thema.rivier?.passagiers ?? []) meetRand(src);

  const el = document.createElement('div');
  el.className = `ov-scherm ov-scherm--${themaId}`;

  const veld = document.createElement('div');
  veld.className = 'ov-veld';
  el.appendChild(veld);

  const balk = document.createElement('div');
  balk.className = 'vang-balk';
  const levelTeller = maakTeller(VLAG, 'vang-score ov-level');
  levelTeller.zet(1);
  const scoreTeller = maakTeller(STER);
  const hartjes = maakHartjes(LEVENS);
  balk.append(levelTeller.el, scoreTeller.el, hartjes.el);
  el.appendChild(balk);

  // Liggende telefoon: te weinig hoogte voor alle banen. Zelfde melding en media query
  // als het vangspel.
  const draai = maakDraaiMelding();
  const draaiNodig = draai.nodig;
  el.appendChild(draai.el);

  const profiel = haalActiefProfiel();
  const profielSleutel = profiel?.id ?? 'gast';
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
  let hartje: { el: HTMLElement; rij: number; x: number } | null = null;
  let frame = 0;
  let actief = false; // de lus draait zolang het scherm er is
  let vorigeT = 0;
  let overlay: HTMLElement | null = null;
  let overlayActie: (() => void) | null = null; // spatie/Enter op een venster
  let eersteSprong = true;
  // Uitdagingen: bij elk spel in een andere volgorde; vanaf level 10 doet de eerste mee,
  // vanaf 15 ook de tweede.
  let uitdagingVolgorde: Uitdaging[] = [];
  let uitdagingen: Uitdaging[] = [];
  let inslagen: Inslag[] = [];
  let inslagWacht = 0;
  let npcs: Overstekertje[] = [];
  let npcWacht = 0;
  let lawine: { el: HTMLElement; h: number; wacht: number } | null = null; // h: zoveel rijen bedekt
  let storm: { el: HTMLElement; richting: 1 | -1; t: number; aan: boolean } | null = null;
  let donker: HTMLElement | null = null;
  let spookjes: Spookje[] = []; // jager, of zwervers in een lavaland (werkSpookjes)

  function uitdaging<W extends Uitdaging['wat']>(wat: W): Extract<Uitdaging, { wat: W }> | undefined {
    return uitdagingen.find((u) => u.wat === wat) as Extract<Uitdaging, { wat: W }> | undefined;
  }
  // Lavaland (dino, spookhuis) is geen uitdaging uit de husselvolgorde maar een vast ritme:
  // level 10, 13, 16, ... alles lava met stenen. Zo is het nooit lava achter elkaar en blijft
  // hij terugkomen. Het spookhuis begint later en minder vaak (12, 16, 20, ...).
  const lavalandUitdaging = thema.uitdagingen.find((u) => u.wat === 'lavaland') as Extract<Uitdaging, { wat: 'lavaland' }> | undefined;
  const lavaVanaf = lavalandUitdaging?.vanaf ?? LAVA_VANAF;
  const isLavaland = (l: number): boolean =>
    !!thema.rivier && !!lavalandUitdaging && l >= lavaVanaf && (l - lavaVanaf) % (lavalandUitdaging.elke ?? LAVA_ELKE) === 0;
  const icoonSrc = (icoon: string): string => (isTekening(icoon as Soort['teken']) ? tekeningSrc(icoon as Tekening) : icoon);
  const binnenVeld = (x: number): number => Math.min(Wc - 0.5, Math.max(0.5, x));
  // Waar het figuurtje te zien is: tijdens een sprong eerst nog de oude rij, daarna de nieuwe.
  const zichtRij = (): number => (hopT >= HOP / 2 ? rij : vanRij);
  const zichtX = (): number => vanX + (px - vanX) * Math.min(1, hopT / HOP);
  // Wat er in een baan rijdt; het bovenste stuk van een kolos kijkt naar de baan eronder.
  const dingenVan = (b: Baan): Ding[] => (b.deelVan !== null ? banen[b.deelVan].dingen : b.dingen);
  const draagt = (b: Baan, x: number, speling: number): boolean =>
    b.dingen.some((d) => !d.onder && x > d.x + d.links - speling && x < d.x + d.rechts + speling);

  // ---------- maten ----------

  function maxBanen(): number {
    const beschikbaar = window.innerHeight - 96;
    return Math.max(3, Math.floor(beschikbaar / 44) - 3);
  }

  function maatVeld(): void {
    if (!N) return;
    // Onder de balk (die op smalle schermen over twee regels loopt).
    // Binnen de veilige randen (camera/inkeping, zie --veilig-* in global.css).
    const probe = document.createElement('div');
    probe.style.cssText = 'position:fixed;visibility:hidden;inset:var(--veilig-boven) var(--veilig-rechts) var(--veilig-onder) var(--veilig-links)';
    document.body.appendChild(probe);
    const veilig = probe.getBoundingClientRect();
    probe.remove();
    const boven = Math.max(veilig.top + 70, balk.getBoundingClientRect().bottom + 10);
    const beschikbaarH = veilig.bottom - boven - 10;
    const beschikbaarB = veilig.width;
    veld.style.left = `${veilig.left + veilig.width / 2}px`;
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
    if (isVlot(s.teken)) {
      d.innerHTML = RAFT_TEKENING[s.teken](rek);
      d.classList.add('ov-ding--drijver');
      d.style.width = `calc(var(--c) * ${rek})`;
      // De tekeningen lopen tot vlak bij de rand.
      const r = s.teken === 'boomstam' || s.teken === 'vlot' ? 0.03 : 0.04;
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
    // Een kolos is `banen` hoog en staat in het midden van zijn banen (de onderste is deze).
    const hoogte = s.banen ? s.banen - 0.1 : Math.min(s.maat, HOOG_MAX);
    const midden = s.banen ? (2 - s.banen) / 2 : 0.5;
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
      stuk.style.top = `calc(var(--c) * ${(midden - hoogte / 2 + schuif).toFixed(3)})`;
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
        // Lang voertuig: een SVG houdt in een <img> zijn eigen verhouding (object-fit: fill
        // rekt hem niet), dus vierkant tekenen en met scaleX uitrekken tot de hele maat.
        if (s.lang) {
          img.classList.add('ov-stuk__beeld--lang');
          img.style.width = `calc(var(--c) * ${hoogte})`;
        }
        binnen = img;
      }
      binnen.classList.add('ov-stuk__beeld');
      const rek = s.lang && !tekening ? s.maat / hoogte : 1;
      const schaal = (spiegel ? -1 : 1) * rek;
      const draaiing = [schaal !== 1 ? `scaleX(${schaal.toFixed(3)})` : '', s.draai ? `rotate(${s.draai}deg)` : ''].filter(Boolean).join(' ');
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

  // De grote trek: per baan een rij dieren, een beetje verspringend; samen één kolos.
  function maakKudde(s: Soort, richting: 1 | -1): Ding {
    const d = document.createElement('div');
    d.className = 'ov-ding';
    let links = Infinity;
    let rechts = -Infinity;
    let lengte = 0;
    for (let j = 0; j < s.banen!; j++) {
      const rij = maakDing({ ...s, banen: undefined }, richting, 1, false);
      const schuif = willekeurig(0, 1.2);
      rij.el.className = 'ov-kolos__rij';
      rij.el.style.left = `calc(var(--c) * ${schuif.toFixed(2)})`;
      rij.el.style.top = `calc(var(--c) * ${-j})`;
      d.appendChild(rij.el);
      links = Math.min(links, schuif + rij.links);
      rechts = Math.max(rechts, schuif + rij.rechts);
      lengte = Math.max(lengte, schuif + rij.lengte);
    }
    d.style.width = `calc(var(--c) * ${lengte})`;
    return { el: d, x: 0, lengte, links, rechts };
  }

  // Een dier dat op een vlot staat, ergens op de lengte, maar zo dat er aan één kant
  // minstens een vakje vrij blijft om op te landen.
  function plekOp(ding: Ding): number {
    const vrij = (p: number): number => Math.max(p - ding.links, ding.rechts - p - PASSAGIER);
    const p = willekeurig(ding.links, ding.rechts - PASSAGIER);
    return vrij(p) >= 1 ? p : Math.random() < 0.5 ? ding.links : ding.rechts - PASSAGIER;
  }
  function zetDier(ding: Ding, img: HTMLElement, src: string, p: number, v = 0): void {
    img.style.left = `calc(var(--c) * ${p.toFixed(3)})`;
    img.style.transform = '';
    ding.el.appendChild(img);
    const [l, r] = rand({ maat: PASSAGIER }, src);
    ding.gevaar = [[p + l * PASSAGIER, p + r * PASSAGIER]];
    ding.dier = { el: img, src, p, v };
  }
  function zetPassagier(ding: Ding, lijst: string[], loopt: boolean): void {
    const naam = lijst[Math.floor(Math.random() * lijst.length)];
    const src = icoonSrc(naam);
    let img: HTMLElement;
    if (isTekening(naam as Tekening)) {
      // Eigen tekening inline, dan lopen de pootjes en zwiept de staart.
      img = document.createElement('div');
      img.innerHTML = TEKENINGEN[naam as Tekening].svg.trim();
      img.firstElementChild!.setAttribute('class', `ov-tekening ov-tekening--${naam}`);
    } else {
      img = document.createElement('img');
      (img as HTMLImageElement).src = src;
      (img as HTMLImageElement).alt = '';
    }
    img.className = 'ov-passagier';
    zetDier(ding, img, src, plekOp(ding), loopt ? (Math.random() < 0.5 ? -1 : 1) * willekeurig(0.3, kleuter ? 0.4 : 0.55) : 0);
    // Lopers kijken de kant op waar ze heen gaan (de plaatjes kijken naar links).
    img.classList.toggle('ov-passagier--om', loopt ? ding.dier!.v > 0 : Math.random() < 0.5);
  }

  // Lavaland: de dieren lopen heen en weer over hun steen, tot aan de rand.
  function werkLopers(b: Baan, dt: number): void {
    for (const d of b.dingen) {
      const dier = d.dier;
      if (!dier?.v || b.sprongen.some((sp) => sp.van === d)) continue;
      const min = d.links;
      const max = d.rechts - PASSAGIER;
      dier.p += dier.v * dt;
      if (dier.p < min || dier.p > max) {
        dier.p = Math.min(max, Math.max(min, dier.p));
        dier.v = -dier.v;
        dier.el.classList.toggle('ov-passagier--om', dier.v > 0);
      }
      dier.el.style.left = `calc(var(--c) * ${dier.p.toFixed(3)})`;
      const [l, r] = rand({ maat: PASSAGIER }, dier.src);
      d.gevaar = [[dier.p + l * PASSAGIER, dier.p + r * PASSAGIER]];
    }
  }

  // Vanaf level 15: af en toe springt een dier naar de wagon ervoor of erachter, als daar
  // nog niemand staat. Zo kan je lege plekje ineens bezet raken.
  function werkDierSprongen(b: Baan, dt: number): void {
    for (const sp of b.sprongen) {
      sp.t += dt;
      const weg = !b.dingen.includes(sp.van) || !b.dingen.includes(sp.naar) || sp.naar.dier;
      if (weg) {
        sp.t = Infinity;
        // Nog niet gesprongen: dan blijft het gewoon staan.
        if (sp.van.dier?.el === sp.el) sp.el.classList.remove('ov-passagier--klaar');
        else sp.el.remove();
        continue;
      }
      if (sp.t < DIER_KLAAR) continue;
      if (sp.van.dier) {
        // Opstijgen: van de wagon af, de baan in, en het gevaar gaat mee.
        sp.el.classList.remove('ov-passagier--klaar');
        sp.el.style.left = '0';
        b.el.appendChild(sp.el);
        sp.van.dier = undefined;
        sp.van.gevaar = undefined;
      }
      const f = Math.min(1, (sp.t - DIER_KLAAR) / DIER_VLUCHT);
      if (f >= 1) {
        zetDier(sp.naar, sp.el, sp.src, sp.p1, sp.v);
        sp.t = Infinity;
        continue;
      }
      const x = sp.van.x + sp.p0 + (sp.naar.x + sp.p1 - sp.van.x - sp.p0) * f;
      sp.el.style.transform = `translate3d(${(x * c).toFixed(1)}px, ${(-Math.sin(f * Math.PI) * 0.6 * c).toFixed(1)}px, 0)`;
      // Halverwege komt het boven de andere wagon: daar botst het dan al.
      if (f > 0.5) {
        const [l, r] = rand({ maat: PASSAGIER }, sp.src);
        sp.naar.gevaar = [[sp.p1 + l * PASSAGIER, sp.p1 + r * PASSAGIER]];
      }
    }
    b.sprongen = b.sprongen.filter((sp) => sp.t !== Infinity);
    b.springWacht -= dt;
    if (b.springWacht > 0) return;
    b.springWacht = willekeurig(2, 4.5);
    const kan = b.dingen.flatMap((d, i) =>
      d.dier && !b.sprongen.some((sp) => sp.van === d)
        ? [b.dingen[i - 1], b.dingen[i + 1]]
            .filter((n): n is Ding => !!n && !n.dier && !n.gevaar && !b.sprongen.some((sp) => sp.naar === n) && n.lengte >= DIER_RUIMTE && n.x > -1 && n.x + n.lengte < Wc + 1)
            .map((naar) => ({ van: d, naar }))
        : [],
    );
    if (!kan.length) return;
    const { van, naar } = kan[Math.floor(Math.random() * kan.length)];
    const dier = van.dier!;
    // Het landt aan de kant van de wagon waar het vandaan komt.
    const vanLinks = van.x < naar.x;
    const speel = willekeurig(0, Math.min(0.4, naar.rechts - naar.links - DIER_RUIMTE));
    const p1 = vanLinks ? naar.links + speel : naar.rechts - PASSAGIER - speel;
    dier.el.classList.add('ov-passagier--klaar');
    b.sprongen.push({ el: dier.el, van, naar, p0: dier.p, p1, t: 0, src: dier.src, v: dier.v });
  }

  function nieuwDing(b: Baan): Ding {
    const s = b.bron!;
    const ding = s.banen && s.aantal ? maakKudde(s, b.richting) : maakDing(s, b.richting, willekeurig(b.rek[0], b.rek[1]), b.soort === 'water');
    if (Math.random() < b.duikKans) ding.duik = { fase: 'boven', t: willekeurig(1, 3.5) };
    if (b.passagiers.length && ding.lengte >= DIER_RUIMTE && Math.random() < 0.5) zetPassagier(ding, b.passagiers, b.dierLoopt);
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

  function maakLamp(bel: HTMLElement, kant: 'links' | 'rechts', extra = ''): HTMLElement {
    const lamp = document.createElement('div');
    lamp.className = `ov-lamp ov-lamp--${kant}${extra ? ` ${extra}` : ''}`;
    lamp.innerHTML = '<i></i><i></i>';
    bel.appendChild(lamp);
    return lamp;
  }

  // Knipperlicht en knipperende baan aan of uit (bij een kolos ook de banen erboven), met
  // een belletje als je in de buurt bent.
  // Vanaf level 12 (kleuters 13) gaat het lampje 1 s van tevoren knipperen in plaats van 1,5 s.
  const laatWaarschuwen = (): boolean => level >= (kleuter ? 13 : 12);

  function waarschuw(b: Baan, r: number, aan: boolean): void {
    for (const x of [b, ...b.mede]) {
      x.lamp?.classList.toggle('ov-lamp--aan', aan);
      x.el.classList.toggle('ov-baan--let-op', aan);
    }
    if (!aan) b.belGespeeld = false;
    else if (!b.belGespeeld && rij >= r - 2 && rij <= r + b.mede.length + 2 && fase === 'spel') {
      b.belGespeeld = true;
      speelNoot(TONEN[5], 0);
      speelNoot(TONEN[5], 0.32);
    }
  }

  // ---------- uitdagingen ----------

  // Hele baan aan: een tijd uit, 1,5 s waarschuwen, dan even helemaal gevaarlijk.
  function werkBaanAan(b: Baan, r: number, dt: number): void {
    const a = b.aan!;
    a.t -= dt;
    if (a.t > 0) return;
    if (a.fase === 'uit') {
      a.fase = 'let-op';
      a.t = 1.5;
      waarschuw(b, r, true);
    } else if (a.fase === 'let-op') {
      a.fase = 'aan';
      a.t = kleuter ? 1.4 : 1.8;
      waarschuw(b, r, false);
      if (a.el.classList.contains('ov-aan--stroom')) a.el.innerHTML = stroomSvg();
      a.el.classList.add('ov-aan--aan');
      if (fase === 'spel' && Math.abs(r - rij) <= 2) speelDrum('snare');
    } else {
      a.fase = 'uit';
      a.t = kleuter ? willekeurig(3.5, 5.5) : willekeurig(2.4, 4.4);
      a.el.classList.remove('ov-aan--aan');
      // Twee banen: nu is de ander aan de beurt, en deze wacht tot die klaar is.
      const m = a.maat?.aan;
      if (m && m.fase === 'uit') {
        m.t = willekeurig(0.3, 1.2);
        a.t = m.t + 1.5 + (kleuter ? 1.4 : 1.8) + willekeurig(0.6, 2);
      }
    }
  }

  // Keren: afremmen, even stil (met de pijltjes), dan de andere kant op.
  function werkKeer(b: Baan, dt: number): void {
    const k = b.keer!;
    const REM = 0.5;
    k.t -= dt;
    if (k.fase === 'remmen') b.v = k.v * Math.max(0, k.t / REM);
    else if (k.fase === 'optrekken') b.v = k.v * Math.min(1, 1 - k.t / REM);
    k.el.classList.toggle('ov-keer--aan', k.fase !== 'rijden' || k.t < 1.2);
    if (k.t > 0) return;
    if (k.fase === 'rijden') {
      k.fase = 'remmen';
      k.t = REM;
    } else if (k.fase === 'remmen') {
      k.fase = 'stil';
      k.t = 0.5;
      b.v = 0;
      b.richting = b.richting === 1 ? -1 : 1;
      // De nieuwste staat achteraan in de lijst (aan de kant waar alles binnenkomt).
      b.dingen.reverse();
      for (const d of b.dingen) {
        d.el.classList.toggle('ov-ding--om');
        [d.links, d.rechts] = [d.lengte - d.rechts, d.lengte - d.links];
      }
    } else if (k.fase === 'stil') {
      k.fase = 'optrekken';
      k.t = REM;
    } else {
      k.fase = 'rijden';
      k.t = willekeurig(3, 6);
      b.v = k.v;
    }
  }

  // Zinken: wiebelen (waarschuwing), even onder water, weer boven.
  function werkDuikers(b: Baan, dt: number): void {
    for (const d of b.dingen) {
      const z = d.duik;
      if (!z) continue;
      z.t -= dt;
      if (z.t > 0) continue;
      if (z.fase === 'boven') {
        z.fase = 'wiebel';
        z.t = 1.1;
      } else if (z.fase === 'wiebel') {
        z.fase = 'onder';
        z.t = kleuter ? 1.2 : 1.6;
      } else {
        z.fase = 'boven';
        z.t = willekeurig(2.5, 4.5);
      }
      d.onder = z.fase === 'onder';
      d.el.classList.toggle('ov-ding--wiebel', z.fase === 'wiebel');
      d.el.classList.toggle('ov-ding--onder', d.onder);
    }
  }

  // Inslag: een schaduw groeit op een vakje, dan valt het neer. De helft valt vlak bij je.
  function werkInslagen(dt: number): void {
    const u = uitdaging('inslag');
    if (u && fase === 'spel') {
      inslagWacht -= dt;
      if (inslagWacht <= 0) {
        inslagWacht = kleuter ? willekeurig(1.8, 3) : willekeurig(1.1, 2.1);
        const dichtbij = Math.random() < 0.5;
        const r = Math.min(N - 2, Math.max(1, dichtbij ? rij + heelGetal([0, 2]) : heelGetal([1, N - 2])));
        const kolom = dichtbij ? Math.floor(px) + heelGetal([-1, 1]) : Math.floor(Math.random() * Wc);
        const x = Math.min(Math.floor(Wc) - 0.5, Math.max(0.5, kolom + 0.5));
        const el = document.createElement('div');
        el.className = `ov-inslag${u.gloed ? ' ov-inslag--gloed' : ''}`;
        el.style.left = `calc(var(--c) * ${x})`;
        el.style.top = `calc(var(--c) * ${N - 1 - r + 0.5})`;
        el.innerHTML = `<i class="ov-inslag__schaduw"></i><img class="ov-inslag__ding" src="${u.src}" alt="">`;
        veld.appendChild(el);
        inslagen.push({ el, x, r, t: 0, geland: false });
      }
    }
    for (const s of inslagen) {
      s.t += dt;
      if (s.geland || s.t < VAL) continue;
      s.geland = true;
      s.el.classList.add('ov-inslag--plof');
      if (fase !== 'spel') continue;
      if (Math.abs(s.r - rij) <= 2) speelDrum('bas');
      if (!dood && tijd >= onkwetsbaar && zichtRij() === s.r && Math.abs(zichtX() - s.x) < 0.6) sterf('au');
    }
    inslagen = inslagen.filter((s) => {
      if (s.t < VAL + 0.6) return true;
      s.el.remove();
      return false;
    });
  }

  // Overstekers: diertjes die van de overkant naar beneden hoppen. Meestal kijken ze goed
  // uit, soms niet, en dan worden ze ook aangereden. Raken ze jou, dan kost dat een hartje.
  function veiligVoorNpc(b: Baan, x: number): boolean {
    if (b.aan && b.aan.fase !== 'uit') return false;
    if (lawine && lawine.h > banen.indexOf(b) - 0.5) return false;
    if (b.soort === 'water') return b.dingen.some((d) => !d.duik && x > d.x + d.links + 0.2 && x < d.x + d.rechts - 0.2);
    if (b.soort !== 'weg') return true;
    if (b.el.classList.contains('ov-baan--let-op')) return false;
    const bron = b.deelVan !== null ? banen[b.deelVan] : b;
    // Nu en over 0,8 s nog vrij (met wat ruimte)?
    return !dingenVan(b).some((d) => {
      const later = d.x + bron.v * bron.richting * 0.8;
      return Math.min(d.x, later) + d.links - 0.7 < x && Math.max(d.x, later) + d.rechts + 0.7 > x;
    });
  }

  function werkOverstekers(dt: number): void {
    const u = uitdaging('overstekers');
    if (u && fase === 'spel') {
      npcWacht -= dt;
      if (npcWacht <= 0 && npcs.filter((n) => !n.weg).length < (kleuter ? 2 : 3)) {
        npcWacht = willekeurig(2.2, 4);
        const el = document.createElement('div');
        el.className = 'ov-npc';
        el.innerHTML = `<img src="${u.src}" alt=""${u.kleur ? ` style="filter: ${u.kleur}"` : ''}>`;
        veld.appendChild(el);
        const x = Math.floor(Math.random() * Math.floor(Wc)) + 0.5;
        npcs.push({ el, r: N - 1, vanR: N - 1, x, hopT: NPC_HOP, wacht: willekeurig(0.3, 1), weg: 0 });
      }
    }
    for (const n of npcs) {
      if (n.weg) {
        n.weg += dt;
        continue;
      }
      n.hopT += dt;
      const geland = n.hopT >= NPC_HOP;
      const drijf = banen[geland ? n.r : n.vanR];
      if (drijf.soort === 'water') n.x = binnenVeld(n.x + drijf.v * drijf.richting * dt);
      if (geland) {
        n.wacht -= dt;
        if (n.wacht <= 0) {
          if (n.r === 0) {
            // Veilig aan de onderkant: verdwijnt.
            n.weg = dt;
            n.el.classList.add('ov-npc--klaar');
            continue;
          }
          // Verder als de volgende baan vrij is, of als het hier gevaarlijk wordt (op de weg
          // blijven wachten is het slechtste), en heel soms zonder te kijken.
          const hier = banen[n.r];
          const opWeg = hier.soort === 'weg';
          if (veiligVoorNpc(banen[n.r - 1], n.x) || (opWeg && !veiligVoorNpc(hier, n.x)) || Math.random() < 0.06) {
            n.vanR = n.r;
            n.r--;
            n.hopT = 0;
            n.wacht = banen[n.r].soort === 'weg' ? willekeurig(0.1, 0.4) : willekeurig(0.3, 0.9);
          } else {
            n.wacht = 0.2;
          }
        }
      }
      const zr = n.hopT >= NPC_HOP / 2 ? n.r : n.vanR;
      const zb = banen[zr];
      const geraakt =
        (zb.soort === 'weg' && dingenVan(zb).some((d) => n.x > d.x + d.links && n.x < d.x + d.rechts)) ||
        zb.aan?.fase === 'aan' ||
        (geland && zb.soort === 'water' && !draagt(zb, n.x, 0.1));
      if (geraakt) {
        n.weg = dt;
        n.el.classList.add(zb.soort === 'water' ? 'ov-npc--plons' : 'ov-npc--au');
        if (fase === 'spel' && Math.abs(zr - rij) <= 3) speelDrum('snare');
        continue;
      }
      if (!dood && fase === 'spel' && tijd >= onkwetsbaar && zichtRij() === zr && Math.abs(zichtX() - n.x) < 0.62) sterf('au');
    }
    npcs = npcs.filter((n) => {
      if (n.weg < 0.9) return true;
      n.el.remove();
      return false;
    });
    tekenNpcs();
  }

  function tekenNpcs(): void {
    for (const n of npcs) {
      const t = Math.min(1, n.hopT / NPC_HOP);
      const r = n.vanR + (n.r - n.vanR) * t;
      n.el.style.translate = `${((n.x - 0.5) * c).toFixed(1)}px ${((N - 1 - r) * c).toFixed(1)}px`;
      n.el.style.scale = String(1 + Math.sin(Math.PI * t) * 0.2);
    }
  }

  // Lawine: na een poosje schuift de sneeuw van onderen omhoog, rij voor rij. Haalt hij je
  // in, dan kost dat een hartje; terug naar beneden kan niet meer waar al sneeuw ligt.
  function werkLawine(dt: number): void {
    if (!lawine || fase !== 'spel' || dood) return;
    if (lawine.wacht > 0) {
      lawine.wacht -= dt;
      if (lawine.wacht <= 0) [0, 0.25, 0.5].forEach((t) => speelDrum('bas', t));
    } else {
      lawine.h = Math.min(N - 1.5, lawine.h + dt * (kleuter ? 0.15 : 0.21));
    }
    lawine.el.style.setProperty('--h', lawine.h.toFixed(3));
    lawine.el.hidden = lawine.h <= 0;
    if (lawine.h > zichtRij() + 0.45) sterf('au');
  }

  // Storm: vlagen van een paar seconden die je opzij blazen (niet op start en finish).
  function werkStorm(dt: number): void {
    if (!storm) return;
    storm.t -= dt;
    if (storm.t <= 0) {
      storm.aan = !storm.aan;
      storm.t = storm.aan ? willekeurig(2.5, 4) : willekeurig(2, 3.5);
      if (storm.aan) storm.richting = Math.random() < 0.5 ? 1 : -1;
      storm.el.classList.toggle('ov-storm--aan', storm.aan);
      storm.el.classList.toggle('ov-storm--links', storm.richting === -1);
    }
    if (!storm.aan || fase !== 'spel' || dood) return;
    const r = zichtRij();
    if (r === 0 || r === N - 1) return;
    const dx = storm.richting * (kleuter ? 0.35 : 0.5) * dt;
    px = binnenVeld(px + dx);
    vanX = binnenVeld(vanX + dx);
  }

  // Spookjes (spookhuis). De jager verschijnt meestal midden in het veld en zweeft dwars door alles
  // langzaam op je af. Op het gras (start, middenberm, overkant) komt hij niet; sta je daar,
  // dan wacht hij. Na 7-10 s lost hij op en komt hij even later ergens anders terug. Een
  // sprong is veel sneller dan een spookje, dus wegkomen kan altijd. In een lavaland zwerven
  // er in plaats daarvan spookjes rond over de lava (geen dieren op de stenen).
  function werkSpookjes(dt: number): void {
    if (fase !== 'spel') return;
    if (!spookjes.length) {
      const zwerver = isLavaland(level) ? lavalandUitdaging?.spoken : undefined;
      const jagerSrc = uitdaging('jager')?.src;
      const maak = (src: string, zwerft: boolean, wacht: number): void => {
        const el = document.createElement('div');
        el.className = 'ov-jager';
        el.innerHTML = `<img src="${src}" alt="">`;
        el.hidden = true;
        veld.appendChild(el);
        spookjes.push({ el, x: 0, y: 0, fase: 'weg', t: wacht, zwerft, doel: null });
      };
      if (zwerver) for (let k = 0; k < (kleuter ? 1 : 2); k++) maak(zwerver, true, 1.5 + k * 2.5);
      else if (jagerSrc) maak(jagerSrc, false, 2.5);
      if (!spookjes.length) return;
    }
    for (const j of spookjes) werkSpookje(j, dt);
  }

  function werkSpookje(j: Spookje, dt: number): void {
    const gevaarlijk = (r: number): boolean => banen[r]?.soort === 'weg' || banen[r]?.soort === 'water';
    const verdwijn = (): void => {
      j.fase = 'gaat';
      j.t = 0.6;
      j.el.classList.remove('ov-jager--komt');
      j.el.classList.add('ov-jager--gaat');
    };
    // Het stuk gevaarlijke rijen waar het spookje is: het gras houdt het tegen.
    const strook = (): [number, number] => {
      let laag = Math.round(j.y);
      let hoog = laag;
      while (gevaarlijk(laag - 1)) laag--;
      while (gevaarlijk(hoog + 1)) hoog++;
      return [laag, hoog];
    };
    const zweefNaar = (x: number, y: number, v: number): number => {
      const dx = x - j.x;
      const dy = y - j.y;
      const afstand = Math.hypot(dx, dy);
      const zet = Math.min(afstand, v * dt);
      if (afstand > 0.01) {
        j.x += (dx / afstand) * zet;
        j.y += (dy / afstand) * zet;
      }
      const [laag, hoog] = strook();
      j.y = Math.min(hoog, Math.max(laag, j.y));
      if (Math.abs(dx) > 0.05) j.el.classList.toggle('ov-jager--om', dx > 0);
      return afstand;
    };
    j.t -= dt;
    if (j.fase === 'weg') {
      if (j.t > 0) return;
      // Op een gevaarlijke rij die niet vlak bij je is. De jager meestal midden in het veld,
      // soms (20%) een rij of twee achter je en heel af en toe (5%) aan de rand waar je niet
      // bent. Zwervers altijd aan de rand.
      const rijen = banen.flatMap((_, r) => (gevaarlijk(r) ? [r] : []));
      const ver = rijen.filter((r) => Math.abs(r - rij) >= 2);
      const lijst = ver.length ? ver : rijen;
      const achter = [rij - 2, rij - 1].filter((r) => r > 0 && gevaarlijk(r));
      const kans = Math.random();
      if (!j.zwerft && kans < 0.2 && achter.length) {
        j.y = achter[0];
        j.x = binnenVeld(px + willekeurig(-0.5, 0.5));
      } else {
        j.y = lijst[Math.floor(Math.random() * lijst.length)];
        const rand = j.zwerft || (kans >= 0.2 && kans < 0.25);
        j.x = rand ? (px < Wc / 2 ? Wc - 0.5 : 0.5) : binnenVeld(Wc / 2 + willekeurig(-1, 1));
      }
      j.doel = null;
      j.fase = 'komt';
      j.t = 0.8;
      j.el.hidden = false;
      j.el.classList.remove('ov-jager--gaat');
      void j.el.offsetWidth;
      j.el.classList.add('ov-jager--komt');
      speelNoot(TONEN[4] / 2);
      speelNoot(TONEN[2] / 2, 0.18);
    } else if (j.fase === 'komt') {
      // Tijdens het verschijnen raakt het je nog niet.
      if (j.t <= 0) {
        j.fase = 'jaagt';
        j.t = j.zwerft ? willekeurig(9, 13) : kleuter ? willekeurig(6, 8) : willekeurig(7, 10);
      }
    } else if (j.fase === 'jaagt') {
      if (j.t <= 0) verdwijn();
      else if (!dood) {
        const sx = zichtX();
        const sy = vanRij + (rij - vanRij) * Math.min(1, hopT / HOP);
        if (j.zwerft) {
          // Zwerven: naar een willekeurig plekje in de eigen strook, en dan weer een ander.
          if (!j.doel) {
            const [laag, hoog] = strook();
            j.doel = [willekeurig(0.5, Wc - 0.5), willekeurig(laag, hoog)];
          }
          if (zweefNaar(j.doel[0], j.doel[1], kleuter ? 0.4 : 0.55) < 0.05) j.doel = null;
        } else if (gevaarlijk(zichtRij())) {
          zweefNaar(sx, sy, kleuter ? 0.5 : Math.min(1, 0.7 + 0.02 * (level - 10)));
        }
        if (tijd >= onkwetsbaar && Math.hypot(sx - j.x, sy - j.y) < JAGER) {
          sterf('au');
          toonPlop(j.x, Math.round(j.y), 'Boe!');
          verdwijn();
        }
      }
    } else if (j.t <= 0) {
      j.fase = 'weg';
      j.t = j.zwerft ? willekeurig(1.5, 3) : willekeurig(2.5, 4.5);
      j.el.hidden = true;
    }
    j.el.style.translate = `${((j.x - 0.5) * c).toFixed(1)}px ${((N - 1 - j.y) * c).toFixed(1)}px`;
  }
  // ---------- level opbouwen ----------

  function bouwLevel(): void {
    for (const b of banen) b.el.remove();
    for (const x of [...inslagen, ...npcs]) x.el.remove();
    lawine?.el.remove();
    storm?.el.remove();
    donker?.remove();
    for (const j of spookjes) j.el.remove();
    spookjes = [];
    inslagen = [];
    npcs = [];
    lawine = storm = donker = null;
    inslagWacht = 2;
    npcWacht = 1;
    ster = null;
    hartje = null;
    banen = [];
    uitdagingen = uitdagingVolgorde.slice(0, UITDAGING_VANAF.filter((l) => level >= l).length);
    // Rustig opbouwen: elk aantal banen komt twee levels achter elkaar.
    const reeks = kleuter ? [3, 3, 3, 4, 4, 5, 5, 6] : [3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8];
    const n = Math.min(reeks[Math.min(level - 1, reeks.length - 1)], maxBanen());
    // Water vanaf level 4 (kleuters 5). Lavaland: alle banen lava met stenen.
    const waterVanaf = kleuter ? 5 : 4;
    const lavaland = isLavaland(level);
    const water = !!thema.rivier && ((level >= waterVanaf && n >= 4) || lavaland);
    const plan: BaanSoort[] = ['start'];
    if (n >= 5 || water) {
      // Vanaf level 7 (kleuters 8) is de onderste helft de helft van de keren 4 of 5 banen
      // breed, anders loop je de paar wegen onder het water zo voorbij. De bovenste helft
      // levert dan in (tot minstens 2), zodat het veld niet hoger wordt en de vakjes op een
      // telefoon niet kleiner.
      let onder = Math.ceil(n / 2);
      if (!lavaland && level >= (kleuter ? 8 : 7) && Math.random() < 0.5) {
        onder = Math.max(onder, Math.min(heelGetal([4, 5]), n - 2));
      }
      for (let k = 0; k < onder; k++) plan.push(lavaland ? 'water' : 'weg');
      // Vanaf level 20 geen veilige strook meer in het midden.
      if (level < 20) plan.push('veilig');
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
    const vijanden = schud(thema.vijanden);
    // Leegte (uitdaging): de bovenste helft van de rivierbanen is een andere rivier.
    const leegte = uitdaging('leegte');
    const rivierRijen = plan.flatMap((s, r) => (s === 'water' ? [r] : []));
    const leegteVanaf = leegte && rivierRijen.length ? rivierRijen[Math.floor(rivierRijen.length / 2)] : Infinity;
    const rivierVan = (r: number): Rivier => (r >= leegteVanaf ? leegte!.rivier : thema.rivier!);
    // Per rivier de drijvers in een gehusselde volgorde, zodat buren verschillen.
    const drijverRij = new Map<Rivier, { lijst: Soort[]; n: number }>();
    const volgendeDrijver = (rv: Rivier): Soort => {
      let d = drijverRij.get(rv);
      if (!d) drijverRij.set(rv, (d = { lijst: schud(rv.drijvers), n: 0 }));
      return d.lijst[d.n++ % d.lijst.length];
    };
    const wegRijen = plan.flatMap((s, r) => (s === 'weg' ? [r] : []));
    const vrij = new Set(wegRijen); // wegen zonder bijzondere taak
    // Kolos: aaneengesloten weg van `banen` hoog (of minder als dat niet past). Hij rijdt in
    // de onderste baan; de banen erboven rijden dezelfde kant op en hebben verder niets.
    const kolos = uitdaging('kolos');
    let kolosRij = -1;
    let kolosHoog = 0;
    for (let k = kolos?.ding.banen ?? 0; k >= 2 && kolosRij < 0; k--) {
      const kan = wegRijen.filter((r) => Array.from({ length: k }, (_, j) => plan[r + j] === 'weg').every(Boolean));
      if (!kan.length) continue;
      kolosRij = kan[Math.floor(Math.random() * kan.length)];
      kolosHoog = k;
    }
    for (let j = 0; j < kolosHoog; j++) vrij.delete(kolosRij + j);
    const isKolosBoven = (r: number): boolean => r > kolosRij && r < kolosRij + kolosHoog;
    // Uitschieters: vanaf level 6 (kleuters 7) één baan, vanaf level 9 twee. Vanaf level 8
    // (kleuters 9) liefst tussen twee drukke wegen in, niet naast een veilige strook: anders
    // wacht je aan de rand op het lampje en ben je er in één sprong overheen.
    const ingeklemd = level >= (kleuter ? 9 : 8);
    const tussenWegen = (r: number): boolean => plan[r - 1] === 'weg' && plan[r + 1] === 'weg';
    const uitschieters = new Set<number>();
    if (thema.zeldzaam.length && level >= (kleuter ? 7 : 6)) {
      const aantal = level >= 9 && wegRijen.length >= 6 ? 2 : 1;
      const kandidaten = schud([...vrij]).sort((a, b) => (ingeklemd ? Number(tussenWegen(b)) - Number(tussenWegen(a)) : 0));
      for (const r of kandidaten) {
        if (uitschieters.size >= aantal) break;
        // Twee uitschieters niet naast elkaar (dan klemmen ze elkaar in, niet het drukke verkeer).
        if (ingeklemd && (uitschieters.has(r - 1) || uitschieters.has(r + 1))) continue;
        uitschieters.add(r);
      }
    }
    for (const r of uitschieters) vrij.delete(r);
    const baanAan = uitdaging('baan-aan');
    // Vanaf level 15 twee banen, die om de beurt aan gaan.
    const aanRijen = baanAan ? schud([...vrij]).slice(0, level >= 15 ? 2 : 1) : [];
    const waterRijen = plan.flatMap((s, r) => (s === 'water' ? [r] : []));
    const duikRijen = new Set(uitdaging('zinken') ? schud(waterRijen).slice(0, Math.max(1, Math.round(waterRijen.length / 3))) : []);
    let richting: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
    let wegTeller = 0;

    plan.forEach((soort, r) => {
      const bel = document.createElement('div');
      bel.className = `ov-baan ov-baan--${soort}`;
      bel.style.top = `calc(var(--c) * ${N - 1 - r})`;
      const grond = soort === 'weg' ? thema.weg : soort === 'water' ? rivierVan(r).water : thema.veilig;
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
        deelVan: null,
        mede: [],
        aan: null,
        keer: null,
        // Op de leegte verdwijnt alles af en toe; bij Zinken 60% van de vlotten.
        duikKans: r >= leegteVanaf ? 1 : duikRijen.has(r) ? 0.6 : 0,
        val: soort === 'water' ? (rivierVan(r).val ?? 'plons') : 'plons',
        passagiers:
          soort !== 'water' ? [] : lavaland ? (lavalandUitdaging?.passagiers ?? []) : level >= (kleuter ? 7 : 6) ? (rivierVan(r).passagiers ?? []) : [],
        dierLoopt: soort === 'water' && lavaland,
        sprongen: [],
        springWacht: willekeurig(1, 3),
      };
      if (r === kolosRij && kolos) {
        // Komt af en toe, met lamp en knipperende banen vooraf (alle banen die hij vult).
        b.bron = kolos.ding;
        b.sporadisch = true;
        b.v = Math.min(7.5, willekeurig(1.1, 1.4) * (kolos.ding.snel ?? 1) * f);
        b.tussen = kleuter ? [6, 10] : [4.5, 8];
        b.wacht = willekeurig(2.5, 4);
        b.lamp = maakLamp(bel, b.richting === 1 ? 'links' : 'rechts');
      } else if (isKolosBoven(r)) {
        b.deelVan = kolosRij;
        b.lamp = maakLamp(bel, b.richting === 1 ? 'links' : 'rechts');
        banen[kolosRij].mede.push(b);
      } else if (aanRijen.includes(r) && baanAan) {
        // Geen verkeer: de hele baan gaat af en toe aan (stroom, vuur, laser).
        const laag = document.createElement('div');
        laag.className = `ov-aan ov-aan--${baanAan.stijl}`;
        bel.appendChild(laag);
        if (baanAan.bron) {
          const img = document.createElement('img');
          img.className = 'ov-aan__bron';
          img.src = baanAan.bron;
          img.alt = '';
          bel.appendChild(img);
        }
        bel.classList.add(`ov-baan--${baanAan.stijl}`);
        b.lamp = maakLamp(bel, 'rechts', `ov-lamp--${baanAan.stijl}`);
        b.aan = { fase: 'uit', t: willekeurig(1.5, 3), el: laag, maat: null };
        // De tweede wacht tot de eerste klaar is (werkBaanAan geeft daarna de beurt door).
        const eerste = banen.find((x) => x.aan);
        if (eerste) {
          b.aan.maat = eerste;
          eerste.aan!.maat = b;
          b.aan.t = eerste.aan!.t + 3.6;
        }
      } else if (soort === 'weg') {
        const zeldzaam = uitschieters.has(r);
        // Een gewone baan aan de rand krijgt vanaf level 8 geen vijand die af en toe komt
        // (treinen op de trein-achtergrond): die horen tussen het drukke verkeer.
        const gewoon = vijanden.filter((v) => !v.sporadisch);
        const naastUitschieter = uitschieters.has(r - 1) || uitschieters.has(r + 1) || !!banen[r - 1]?.sporadisch;
        // In de eerste twee levels nog helemaal geen (rustig opbouwen).
        const alleenGewoon = level <= 2 || (ingeklemd && (!tussenWegen(r) || naastUitschieter));
        const lijst = alleenGewoon && gewoon.length ? gewoon : vijanden;
        const s = zeldzaam
          ? thema.zeldzaam[Math.floor(Math.random() * thema.zeldzaam.length)]
          : lijst[wegTeller++ % lijst.length];
        b.bron = s;
        b.sporadisch = zeldzaam || !!s.sporadisch;
        b.v = Math.min(7.5, willekeurig(1, 1.7) * (s.snel ?? 1) * f);
        if (b.sporadisch) {
          b.tussen = [Math.max(1.6, (kleuter ? 6 : 5.5) - 0.3 * level), Math.max(3, (kleuter ? 10 : 9.5) - 0.4 * level)];
          // Vanaf level 12 (kleuters 13) komen ze vaker.
          if (laatWaarschuwen()) b.tussen = [Math.max(1.2, b.tussen[0] * 0.75), Math.max(2.2, b.tussen[1] * 0.75)];
          b.wacht = willekeurig(1.6, 3.5);
          b.lamp = maakLamp(bel, b.richting === 1 ? 'links' : 'rechts');
        }
      } else if (soort === 'water') {
        const s = volgendeDrijver(rivierVan(r));
        b.bron = s;
        b.v = Math.min(3, willekeurig(0.7, 1.25) * f * (s.snel ?? 1));
        const lang = Math.max(1.6, 2.8 - 0.2 * Lw) + (kleuter ? 0.6 : 0);
        b.rek = [lang, lang + 1];
        b.gat = [Math.min(1.3, 0.8 + 0.08 * Lw), Math.min(2.8, 1.8 + 0.15 * Lw)];
      }
      if (b.bron && !b.sporadisch) vul(b);
      if ((soort === 'weg' || soort === 'water') && !isKolosBoven(r + 1)) richting = richting === 1 ? -1 : 1;
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

    // Vanaf level 4 (kleuters 5) is de helft van de uitschieters al onderweg als het level
    // begint, anders steek je die banen over voordat ze ook maar één keer zijn gekomen.
    if (level >= waterVanaf) {
      for (const b of banen) {
        if (!b.sporadisch || !b.bron || Math.random() < 0.5) continue;
        const d = nieuwDing(b);
        const kop = willekeurig(0.35, 0.8) * Wc; // zo ver is de voorkant al
        d.x = b.richting === 1 ? kop - d.lengte : Wc - kop;
        tekenDing(d);
      }
    }

    // Keren: een of twee gewone wegen stoppen af en toe en rijden dan de andere kant op.
    if (uitdaging('keren')) {
      const kan = schud(banen.filter((b) => b.soort === 'weg' && b.bron && !b.sporadisch));
      for (const b of kan.slice(0, Math.min(2, Math.ceil(kan.length / 3)))) {
        const el = document.createElement('div');
        el.className = 'ov-keer';
        el.innerHTML = '<img src="assets/oversteken/keren.svg" alt=""><img src="assets/oversteken/keren.svg" alt="">';
        b.el.appendChild(el);
        b.keer = { fase: 'rijden', t: willekeurig(2.5, 5), v: b.v, el };
      }
    }
    if (uitdaging('lawine')) {
      const el = document.createElement('div');
      el.className = 'ov-lawine';
      veld.appendChild(el);
      el.hidden = true;
      lawine = { el, h: 0, wacht: kleuter ? 7 : 5 };
    }
    if (uitdaging('storm')) {
      const el = document.createElement('div');
      el.className = 'ov-storm';
      veld.appendChild(el);
      storm = { el, richting: 1, t: willekeurig(1.5, 3), aan: false };
    }
    const dk = uitdaging('donker');
    if (dk) {
      // Over alle banen behalve start en finish: je ziet waar je heen moet.
      donker = document.createElement('div');
      donker.className = `ov-donker${dk.mist ? ' ov-donker--mist' : ''}`;
      donker.style.height = `calc(var(--c) * ${N - 2})`;
      veld.appendChild(donker);
    }

    // Eén ster per level, op een baan met verkeer of op de middenberm. Een lavaland vanaf
    // level 20 heeft geen van beide (alles lava): dan boven de lava. Zonder rij liep
    // bouwLevel hier vast vóór `rij = 0`, en stond je meteen aan de overkant.
    const sterRijen = plan.flatMap((s, r) => (s === 'weg' || s === 'veilig' ? [r] : []));
    if (!sterRijen.length) sterRijen.push(...plan.flatMap((s, r) => (s === 'water' ? [r] : [])));
    const sr = sterRijen[Math.floor(Math.random() * sterRijen.length)];
    const sx = Math.floor(willekeurig(1, Math.max(2, Wc - 1))) + 0.5;
    const sEl = document.createElement('img');
    sEl.className = 'ov-ster';
    sEl.src = STER;
    sEl.alt = '';
    sEl.style.left = `calc(var(--c) * ${sx})`;
    banen[sr].el.appendChild(sEl);
    ster = { el: sEl, rij: sr, x: sx };

    // Vanaf level 10 om het level een hartje (10, 12, 14, ...): een leven terug. Liefst op
    // een andere rij dan de ster, anders een eind ervandaan.
    if (level >= HARTJE_VANAF && (level - HARTJE_VANAF) % 2 === 0) {
      const anders = sterRijen.filter((r) => r !== sr);
      const hr = anders.length ? anders[Math.floor(Math.random() * anders.length)] : sr;
      let hx = Math.floor(willekeurig(1, Math.max(2, Wc - 1))) + 0.5;
      if (hr === sr && Math.abs(hx - sx) < 2) hx = sx < Wc / 2 ? Math.floor(Wc) - 1.5 : 1.5;
      const hEl = document.createElement('img');
      hEl.className = 'ov-ster ov-hartje';
      hEl.src = HART;
      hEl.alt = '';
      hEl.style.left = `calc(var(--c) * ${hx})`;
      banen[hr].el.appendChild(hEl);
      hartje = { el: hEl, rij: hr, x: hx };
    }

    rij = 0;
    hoogste = 0;
    px = vanX = Math.floor(Wc / 2) + 0.5;
    vanRij = 0;
    hopT = HOP;
    buffer = null;
    levelTeller.zet(level);
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
    // Donker of mist: de lichtkring gaat met je mee (de laag begint één rij onder de finish).
    donker?.style.setProperty('--lx', `${(x * c).toFixed(1)}px`);
    donker?.style.setProperty('--ly', `${((N - 2 - r + 0.5) * c).toFixed(1)}px`);
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
    if (lawine && lawine.h > nr + 0.2) return; // daar ligt al sneeuw
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
    // Alleen in de dev-server: een test kan de speler onsterfelijk maken (om rustig te kijken).
    if (import.meta.env.DEV && (window as { __oversteekOnsterfelijk?: boolean }).__oversteekOnsterfelijk) return;
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
      plons.className = `ov-plons ov-plons--${banen[rij].val}`;
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
    px = vanX = binnenVeld(Math.floor(px) + 0.5);
    // De lawine trekt zich terug tot onder die strook en wacht even.
    if (lawine) {
      lawine.h = Math.min(lawine.h, r);
      lawine.wacht = 2.5;
    }
    hopT = HOP;
    onkwetsbaar = tijd + 1.3;
    tekenSpeler();
    flitsIn(speler, veld);
  }

  function gehaald(): void {
    fase = 'tussen';
    // Komt er volgend level een uitdaging bij? Dan staat die in de banner (en duurt het iets langer).
    const nieuw = (uitdagingVolgorde[UITDAGING_VANAF.indexOf(level + 1)] as Uitdaging | undefined) ?? (isLavaland(level + 1) ? lavalandUitdaging : undefined);
    tussenTot = tijd + TUSSEN_DUUR + (nieuw ? 1 : 0);
    zetScore(score + 10);
    toonPlop(px, rij, '+10');
    [0, 2, 4, 7].forEach((k, j) => speelNoot(TONEN[k], j * 0.11));
    confetti.vuurwerk('klein');
    speler.classList.add('ov-speler--juich');
    banner.innerHTML = `<img src="${VLAG}" alt=""><span>${level + 1}</span>${nieuw ? `<img class="ov-banner__nieuw" src="${icoonSrc(nieuw.icoon)}" alt="">` : ''}`;
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
      if (b.aan) werkBaanAan(b, r, dt);
      if (!b.bron) continue;
      if (b.keer) werkKeer(b, dt);
      if (b.duikKans) werkDuikers(b, dt);
      if (b.dierLoopt) werkLopers(b, dt);
      if (b.passagiers.length && (level >= DIER_SPRINGT || b.dierLoopt)) werkDierSprongen(b, dt);
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
        waarschuw(b, r, b.wacht < (laatWaarschuwen() ? 1 : 1.5));
        if (b.wacht <= 0) {
          const d = nieuwDing(b);
          d.x = b.richting === 1 ? -d.lengte : Wc;
          b.wacht = willekeurig(b.tussen[0], b.tussen[1]);
          waarschuw(b, r, false);
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

    werkInslagen(dt);
    werkOverstekers(dt);
    werkStorm(dt);
    werkLawine(dt);
    werkSpookjes(dt);

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
      if (!draagt(baan, px, 0.1)) sterf('plons');
    }
    // Aanrijden: in de baan waar je te zien bent. Tijdens een sprong is dat de eerste helft
    // nog de oude baan, daarna de nieuwe; ook opzij telt de plek waar je nu in beeld bent.
    const zichtBaan = banen[zichtRij()];
    const zx = zichtX();
    if (!dood && zichtBaan.soort === 'weg' && tijd >= onkwetsbaar) {
      if (dingenVan(zichtBaan).some((d) => zx > d.x + d.links && zx < d.x + d.rechts)) sterf('au');
      else if (zichtBaan.aan?.fase === 'aan') sterf('au');
    }
    // Een dier op een wagon: daar sta je niet op.
    if (!dood && zichtBaan.soort === 'water' && tijd >= onkwetsbaar) {
      if (zichtBaan.dingen.some((d) => d.gevaar?.some(([l, r]) => zx > d.x + l && zx < d.x + r))) sterf('au');
    }
    if (!dood && ster && ster.rij === rij && Math.abs(ster.x - px) < 0.6) {
      ster.el.remove();
      toonPlop(ster.x, rij, '+5');
      ster = null;
      zetScore(score + 5);
      speelNoot(TONEN[4]);
      speelNoot(TONEN[7], 0.08);
    }
    // Hartje: een leven terug (met alle hartjes nog heel: 5 punten, net als een ster).
    if (!dood && hartje && hartje.rij === rij && Math.abs(hartje.x - px) < 0.6) {
      hartje.el.remove();
      if (levens < LEVENS) {
        levens++;
        tekenHartjes();
        toonPlop(hartje.x, rij, '+1 ♥');
      } else {
        zetScore(score + 5);
        toonPlop(hartje.x, rij, '+5');
      }
      hartje = null;
      [2, 4, 7].forEach((k, j) => speelNoot(TONEN[k], j * 0.07));
    }
    if (!dood && rij === N - 1 && geland) gehaald();
    tekenSpeler();
  }

  // ---------- balk, vensters ----------

  function tekenHartjes(): void {
    hartjes.teken(levens);
  }

  function zetScore(n: number): void {
    score = n;
    scoreTeller.zet(score);
  }

  // In vakjes: x en rij.
  function toonPlop(x: number, r: number, tekst: string): void {
    plopIn(veld, x * c, (N - 1 - r + 0.3) * c, tekst);
  }

  function start(): void {
    overlay?.remove();
    overlay = null;
    overlayActie = null;
    const verder = lopendeSpellen.get(profielSleutel);
    lopendeSpellen.delete(profielSleutel);
    // Alleen in de dev-server: een test kan meteen op een hoger level beginnen.
    level = verder?.level ?? (import.meta.env.DEV ? (window as { __oversteekLevel?: number }).__oversteekLevel : undefined) ?? 1;
    // Welke uitdaging eerst komt is elk spel anders (een test kan de volgorde kiezen).
    const kies = import.meta.env.DEV ? (window as { __oversteekUitdagingen?: string[] }).__oversteekUitdagingen : undefined;
    uitdagingVolgorde =
      verder?.themaId === themaId
        ? verder.uitdagingVolgorde
        : kies
          ? kies.flatMap((w) => thema.uitdagingen.filter((u) => u.wat === w && u.wat !== 'lavaland'))
          : schud(thema.uitdagingen.filter((u) => u.wat !== 'lavaland')).sort((a, b) => Number(!!b.eerst) - Number(!!a.eerst));
    zetScore(verder?.score ?? 0);
    levens = verder?.levens ?? LEVENS;
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

  // Twee stukjes water voor het startvenster: het figuurtje op een vlot (goed) en het
  // figuurtje dat zinkt met een plons (fout).
  function waterPlaatjes(rivier: NonNullable<typeof thema.rivier>): { goed: string; fout: string } {
    const vlotSoort = rivier.drijvers.find((d) => d.teken !== 'boomstam') ?? rivier.drijvers[0];
    const vlotHtml = isVlot(vlotSoort.teken)
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
    const { venster, doos } = maakVenster();
    const figuur = `<img class="vang-venster__figuur" src="${spelerImg.src}" alt="">`;
    if (eind) {
      const { html: recordHtml, nieuw } = recordRegel('oversteken', score);
      doos.innerHTML = `${figuur}
        <div class="ov-eind">
          <div class="vang-venster__score"><img src="${STER}" alt=""><span>${score}</span></div>
          <div class="vang-venster__score ov-eind__level"><img src="${VLAG}" alt=""><span>${level}</span></div>
        </div>
        ${recordHtml}`;
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
      const hint = toetsenHint(['←', '↑', '→', '↓'], 'pijltjestoetsen');
      if (hint) doos.appendChild(hint);
    }
    const fig = doos.querySelector<HTMLImageElement>('.vang-venster__figuur');
    if (fig && tint) fig.style.filter = tint;
    doos.appendChild(startKnop(eind ? 'nog een keer' : 'start', start));
    el.appendChild(venster);
    overlay = venster;
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

  // Tikken: die kant op, gezien vanaf het figuurtje (boven = vooruit). Alleen waar je
  // neertikt telt; vegen stuurt niet (dat gaf verwarring).
  let neer: { x: number; y: number; id: number } | null = null;
  const tikNeer = (e: PointerEvent): void => {
    if (overlay || (e.target as HTMLElement).closest('button')) return;
    e.preventDefault();
    neer = { x: e.clientX, y: e.clientY, id: e.pointerId };
  };
  const tikOp = (e: PointerEvent): void => {
    if (!neer || neer.id !== e.pointerId) return;
    const { x, y } = neer;
    neer = null;
    const r = speler.getBoundingClientRect();
    const dx = x - (r.left + r.width / 2);
    let dy = y - (r.top + r.height / 2);
    if (Math.hypot(dx, dy) < c * 0.55) dy = -1; // op het figuurtje zelf: vooruit
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
    tekenNpcs();
    tekenSpeler();
  });

  return {
    kindslot: true,
    mount(root) {
      root.appendChild(el);
      root.appendChild(terug);
      // Een bewaard spel staat al in de balk (en het veld) achter het startvenster.
      const verder = lopendeSpellen.get(profielSleutel);
      if (verder) {
        level = verder.level;
        levens = verder.levens;
        zetScore(verder.score);
      }
      tekenHartjes();
      bouwLevel();
      veld.appendChild(speler);
      tekenSpeler();
      opGrootte.observe(el);
      bevriesDecor(true);
      window.addEventListener('keydown', toetsNeer);
      toonVenster(false);
      actief = true;
      vorigeT = 0;
      frame = requestAnimationFrame(stap);
    },
    unmount() {
      // Midden in een spel weg (niet net af): bewaren. Aan de overkant telt het volgende level.
      if ((fase === 'spel' || fase === 'tussen') && levens > 0) {
        lopendeSpellen.set(profielSleutel, {
          themaId,
          level: fase === 'tussen' ? level + 1 : level,
          levens,
          score,
          uitdagingVolgorde,
        });
      }
      fase = 'uit';
      actief = false;
      cancelAnimationFrame(frame);
      opGrootte.disconnect();
      bevriesDecor(false);
      window.removeEventListener('keydown', toetsNeer);
      el.remove();
      terug.remove();
    },
  };
}
