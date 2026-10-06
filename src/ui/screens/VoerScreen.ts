import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { avatarFilter, avatarPad, haalActiefProfiel, haalActiefProfielId } from '../../engine/profielStore.ts';
import { haalGroep } from '../../engine/progressStore.ts';
import { TONEN, speelDrum, speelNoot } from '../../engine/muziek.ts';
import { confetti } from '../../three/particles.ts';
import { huidigThema, type ThemaId } from '../../achtergrond/achtergrond.ts';

// Dieren voeren: dieren lopen het scherm in (van rechts, vooraan, dus het past op elke
// achtergrond). Elk roept om eten in een tekstballon ("Boe!", "Mèèèh!"). Sleep eten uit de
// bak op een dier; je eigen figuurtje gooit het dan. Goed: het dier springt blij en loopt
// door. Fout: het schudt terwijl het omdraait en wegstapt, en dat kost een hartje. Het
// volgende dier wacht daar niet op. Drie keer fout is klaar. Geen tijdsdruk. Record per
// profiel; geen munten.
//
// Eerst komt er één dier tegelijk, later twee (kleuters) of drie (groep 3). In de bak ligt
// dan voor elk dier één goed ding plus één ding dat geen van hen eet. Dieren in één groepje
// eten nooit hetzelfde, dus elk ding hoort bij precies één dier.

const w = (n: string): string => `assets/images/woorden/${n}.svg`;
const a = (n: string): string => `assets/achtergrond/${n}.svg`;
const v = (n: string): string => `assets/voeren/${n}.svg`;

const ETEN = {
  gras: w('gras'),
  sla: w('sla'),
  wortel: w('wortel'),
  appel: w('appel'),
  banaan: w('banaan'),
  mais: w('mais'),
  brood: w('brood'),
  blad: w('blad'),
  kaas: w('kaas'),
  melk: w('melk'),
  honing: w('honing'),
  vis: w('vis'),
  vlieg: w('vlieg'),
  pinda: v('pinda'),
  bot: v('bot'),
  vlees: v('vlees'),
  worm: v('worm'),
  kluif: v('kluif'),
  muis: w('muis'),
  bloem: w('bloem'),
  zeewier: v('zeewier'),
  schaap: w('schaap'),
  kip: w('kip'),
  noot: w('noot'),
  bamboe: v('bamboe'),
} as const;
type Eten = keyof typeof ETEN;

// Hoe een dier binnenkomt en weggaat: lopen, huppen (kikker, konijn), springen (poes, tijger:
// grote boogsprongen), uit de lucht vallen (aap; weg = weer omhoog klimmen), op de buik
// glijden (pinguïn), stampen (dino's: het scherm trilt een beetje), rennen (hond: eerst
// een keer heen en weer over het halve scherm) of aan een liaan zakken (luiaard, die blijft
// hangen; de spin aan een draadje), vliegen (bij, vlinder, uil: in golfjes, blijft zweven),
// zwemmen (dolfijn, haai: net zo, maar lager), heel langzaam kruipen (slak, schildpad),
// kronkelen (slang) of uit de grond omhoog komen (mol).
type Komt = 'loopt' | 'hupt' | 'springt' | 'valt' | 'glijdt' | 'stampt' | 'rent' | 'zakt' | 'vliegt' | 'zwemt' | 'kruipt' | 'kronkelt' | 'graaft';
// Wat fout eten doet, bovenop het naschudden. Zonder reactie valt het op de grond.
type Reactie = 'gooi' | 'spuug' | 'spuit' | 'plat' | 'stuiter' | 'in';

interface Dier {
  id: string;
  plaatje: string;
  geluid: string;
  goed: Eten[];
  // Alleen dingen die dit dier echt niet eet, zodat er nooit twee goede keuzes liggen.
  fout: Eten[];
  kijkt: 'links' | 'rechts' | 'voor';
  // Maat ten opzichte van de gewone maat: tussen 0,8 (muis) en 1,2 (olifant).
  schaal: number;
  komt: Komt;
  tempo: number; // keer de gewone loopsnelheid
  slaapt?: boolean; // valt in slaap als je het laat wachten
  spuit?: boolean; // spuit water bij aankomst (olifant)
  mond?: [number, number]; // waar het eten heen vliegt, als deel van het plaatje (links, boven)
  // Vleeseter: staat hij samen met een planteneter en krijgt die niet snel eten, dan jaagt
  // hij hem weg.
  jager?: boolean;
  alleenFamilie?: boolean; // komt alleen mee met een ander dier (de muisjes)
  reactie?: Reactie;
  draai?: number; // graden; de krokodil is van boven getekend en ligt zo op zijn zij
  water?: boolean; // komt alleen bij de zee en onder water (dolfijn, haai)
  // De geit eet alles: komt altijd alleen, en alles in de bak is goed.
  allesEter?: boolean;
}

const PLANT_NEE: Eten[] = ['vis', 'kaas', 'bot', 'vlees', 'kluif', 'vlieg', 'worm', 'honing'];
const VLEES_NEE: Eten[] = ['gras', 'sla', 'wortel', 'banaan', 'mais', 'appel', 'honing', 'zeewier', 'noot', 'bamboe'];
// Geen levende dieren voor de geit.
const ALLES: Eten[] = (Object.keys(ETEN) as Eten[]).filter((e) => !['muis', 'schaap', 'kip'].includes(e));

const DIEREN: Dier[] = [
  { id: 'koe', plaatje: w('koe'), geluid: 'Boe!', goed: ['gras'], fout: PLANT_NEE, kijkt: 'links', schaal: 1.15, komt: 'loopt', tempo: 0.85 },
  { id: 'schaap', plaatje: w('schaap'), geluid: 'Mèèèh!', goed: ['gras', 'sla'], fout: PLANT_NEE, kijkt: 'links', schaal: 1, komt: 'loopt', tempo: 1 },
  { id: 'paard', plaatje: w('paard'), geluid: 'Hihihi!', goed: ['appel', 'wortel'], fout: [...PLANT_NEE, 'melk'], kijkt: 'rechts', schaal: 1.15, komt: 'loopt', tempo: 1.4 },
  { id: 'ezel', plaatje: w('ezel'), geluid: 'Iaa iaa!', goed: ['wortel'], fout: [...PLANT_NEE, 'melk'], kijkt: 'rechts', schaal: 1.05, komt: 'loopt', tempo: 0.9 },
  { id: 'varken', plaatje: a('varken'), geluid: 'Knor knor!', goed: ['appel', 'mais'], fout: ['bot', 'vlieg', 'honing'], kijkt: 'links', schaal: 1, komt: 'loopt', tempo: 1 },
  { id: 'konijn', plaatje: w('konijn'), geluid: 'Snuf snuf!', goed: ['wortel', 'sla'], fout: [...PLANT_NEE, 'melk'], kijkt: 'links', schaal: 0.85, komt: 'hupt', tempo: 1 },
  { id: 'muis', plaatje: w('muis'), geluid: 'Piep piep!', goed: ['kaas'], fout: ['vis', 'bot', 'vlees', 'gras'], kijkt: 'links', schaal: 0.8, komt: 'loopt', tempo: 1.9 },
  // Een poes lust ook wel een muisje.
  { id: 'poes', plaatje: w('poes'), geluid: 'Miauw!', goed: ['vis', 'melk', 'muis'], fout: VLEES_NEE, kijkt: 'links', schaal: 0.88, komt: 'springt', tempo: 1 },
  { id: 'hond', plaatje: v('hond'), geluid: 'Woef woef!', goed: ['bot', 'vlees'], fout: ['gras', 'sla', 'banaan', 'vlieg', 'honing', 'mais'], kijkt: 'links', schaal: 0.95, komt: 'rent', tempo: 1.6 },
  { id: 'aap', plaatje: w('aap'), geluid: 'Oe oe aa aa!', goed: ['banaan'], fout: ['vis', 'kaas', 'bot', 'vlees', 'gras', 'worm', 'melk'], kijkt: 'voor', schaal: 0.92, komt: 'valt', tempo: 1, reactie: 'gooi' },
  { id: 'olifant', plaatje: w('olifant'), geluid: 'Toeteroe!', goed: ['blad'], fout: [...PLANT_NEE, 'melk'], kijkt: 'links', schaal: 1.2, komt: 'loopt', tempo: 0.7, spuit: true, mond: [0.07, 0.68], reactie: 'spuit' },
  { id: 'luiaard', plaatje: 'assets/icons/avatar-luiaard.svg', geluid: 'Gaaap!', goed: ['blad'], fout: [...PLANT_NEE, 'melk'], kijkt: 'voor', schaal: 0.95, komt: 'zakt', tempo: 1, slaapt: true, mond: [0.28, 0.45] },
  { id: 'brachiosaurus', plaatje: v('brachiosaurus'), geluid: 'Hoeoeoem!', goed: ['blad'], fout: [...PLANT_NEE, 'melk'], kijkt: 'links', schaal: 1.2, komt: 'stampt', tempo: 0.55, mond: [0.2, 0.12], reactie: 'plat' },
  { id: 'stegosaurus', plaatje: 'assets/icons/avatar-stegosaurus.svg', geluid: 'Grommel!', goed: ['gras'], fout: [...PLANT_NEE, 'melk'], kijkt: 'links', schaal: 1.1, komt: 'stampt', tempo: 0.75, mond: [0.08, 0.6], reactie: 'plat' },
  { id: 'giraf', plaatje: w('giraf'), geluid: 'Hmmm!', goed: ['blad'], fout: [...PLANT_NEE, 'melk'], kijkt: 'links', schaal: 1.2, komt: 'loopt', tempo: 0.9 },
  { id: 'zebra', plaatje: w('zebra'), geluid: 'Hihihi!', goed: ['gras'], fout: [...PLANT_NEE, 'melk'], kijkt: 'links', schaal: 1.1, komt: 'loopt', tempo: 1.4 },
  { id: 'tijger', plaatje: w('tijger'), geluid: 'Grrr!', goed: ['vlees'], fout: VLEES_NEE, kijkt: 'links', schaal: 1.1, komt: 'springt', tempo: 1 },
  { id: 'leeuw', plaatje: w('leeuw'), geluid: 'Grrroaar!', goed: ['vlees'], fout: VLEES_NEE, kijkt: 'voor', schaal: 1.05, komt: 'loopt', tempo: 1.2, slaapt: true },
  { id: 'trex', plaatje: 'assets/icons/avatar-trex.svg', geluid: 'ROAAAR!', goed: ['kluif'], fout: VLEES_NEE, kijkt: 'links', schaal: 1.2, komt: 'stampt', tempo: 0.6, reactie: 'plat' },
  { id: 'beer', plaatje: w('beer'), geluid: 'Brom brom!', goed: ['vis', 'honing'], fout: ['gras', 'kaas', 'melk', 'brood', 'bot'], kijkt: 'voor', schaal: 1.12, komt: 'loopt', tempo: 0.8 },
  { id: 'ijsbeer', plaatje: w('ijsbeer'), geluid: 'Brom!', goed: ['vis'], fout: [...VLEES_NEE, 'kaas'], kijkt: 'voor', schaal: 1.15, komt: 'loopt', tempo: 0.8 },
  { id: 'zeehond', plaatje: w('zeehond'), geluid: 'Ork ork!', goed: ['vis'], fout: [...VLEES_NEE, 'kaas'], kijkt: 'links', schaal: 1, komt: 'glijdt', tempo: 1 },
  { id: 'pinguin', plaatje: a('winter-pinguin'), geluid: 'Kwek kwek!', goed: ['vis'], fout: [...VLEES_NEE, 'kaas'], kijkt: 'voor', schaal: 0.9, komt: 'glijdt', tempo: 1 },
  { id: 'egel', plaatje: w('egel'), geluid: 'Snuf snuf!', goed: ['worm'], fout: ['gras', 'sla', 'honing', 'bot', 'melk'], kijkt: 'links', schaal: 0.82, komt: 'loopt', tempo: 1.3, reactie: 'stuiter' },
  { id: 'eend', plaatje: w('eend'), geluid: 'Kwak kwak!', goed: ['brood'], fout: ['bot', 'vlees', 'kaas', 'honing', 'banaan', 'melk'], kijkt: 'links', schaal: 0.88, komt: 'loopt', tempo: 1 },
  { id: 'gans', plaatje: w('gans'), geluid: 'Gak gak!', goed: ['brood'], fout: ['bot', 'vlees', 'kaas', 'honing', 'banaan', 'melk', 'vis'], kijkt: 'links', schaal: 0.95, komt: 'loopt', tempo: 1.1 },
  { id: 'haan', plaatje: a('haan'), geluid: 'Kukeleku!', goed: ['mais', 'worm'], fout: ['bot', 'vlees', 'kaas', 'honing', 'melk'], kijkt: 'links', schaal: 0.9, komt: 'loopt', tempo: 1.2 },
  { id: 'kuiken', plaatje: a('kuiken'), geluid: 'Tjiep tjiep!', goed: ['mais', 'worm'], fout: ['bot', 'vlees', 'kaas', 'honing', 'melk'], kijkt: 'voor', schaal: 0.8, komt: 'hupt', tempo: 1 },
  { id: 'kikker', plaatje: w('kikker'), geluid: 'Kwaak!', goed: ['vlieg'], fout: [...VLEES_NEE, 'kaas', 'brood', 'melk'], kijkt: 'voor', schaal: 0.8, komt: 'hupt', tempo: 1, reactie: 'spuug' },
  { id: 'bij', plaatje: w('bij'), geluid: 'Zzzoem!', goed: ['bloem'], fout: ['vis', 'kaas', 'bot', 'vlees', 'kluif', 'worm', 'melk', 'brood'], kijkt: 'links', schaal: 0.8, komt: 'vliegt', tempo: 1 },
  { id: 'slak', plaatje: w('slak'), geluid: 'Slurp…', goed: ['blad'], fout: [...PLANT_NEE, 'melk', 'brood'], kijkt: 'links', schaal: 0.8, komt: 'kruipt', tempo: 1, mond: [0.12, 0.8], reactie: 'in' },
  { id: 'schildpad', plaatje: w('schildpad'), geluid: 'Hmmmm…', goed: ['gras', 'blad'], fout: ['kaas', 'bot', 'vlees', 'kluif', 'honing', 'melk', 'pinda', 'vis'], kijkt: 'links', schaal: 0.9, komt: 'kruipt', tempo: 1.3, mond: [0.1, 0.6], reactie: 'in' },
  { id: 'vlinder', plaatje: v('vlinder'), geluid: 'Fladder!', goed: ['bloem'], fout: ['vis', 'kaas', 'bot', 'vlees', 'kluif', 'worm', 'melk', 'brood'], kijkt: 'voor', schaal: 0.8, komt: 'vliegt', tempo: 0.8 },
  { id: 'slang', plaatje: w('slang'), geluid: 'Sssss!', goed: ['muis'], fout: VLEES_NEE, kijkt: 'rechts', schaal: 0.95, komt: 'kronkelt', tempo: 1, mond: [0.18, 0.15], reactie: 'spuug' },
  { id: 'wolf', plaatje: w('wolf'), geluid: 'Auuuuw!', goed: ['schaap'], fout: VLEES_NEE, kijkt: 'voor', schaal: 1.05, komt: 'loopt', tempo: 1.3 },
  { id: 'vos', plaatje: w('vos'), geluid: 'Kef kef!', goed: ['kip'], fout: VLEES_NEE, kijkt: 'voor', schaal: 0.9, komt: 'springt', tempo: 1 },
  { id: 'muisje', plaatje: w('muis'), geluid: 'Piep!', goed: ['kaas'], fout: ['vis', 'bot', 'vlees', 'gras'], kijkt: 'links', schaal: 0.5, komt: 'loopt', tempo: 1.9, alleenFamilie: true },
  { id: 'papegaai', plaatje: w('papegaai'), geluid: 'Lorre!', goed: ['pinda'], fout: ['vis', 'kaas', 'bot', 'vlees', 'kluif', 'worm', 'melk', 'gras'], kijkt: 'links', schaal: 0.85, komt: 'vliegt', tempo: 1 },
  { id: 'kip', plaatje: w('kip'), geluid: 'Tok tok!', goed: ['mais', 'worm'], fout: ['bot', 'vlees', 'kaas', 'honing', 'melk'], kijkt: 'links', schaal: 0.88, komt: 'hupt', tempo: 0.9, mond: [0.2, 0.25] },
  { id: 'geit', plaatje: w('geit'), geluid: 'Mèh!', goed: ALLES, fout: [], kijkt: 'links', schaal: 1, komt: 'loopt', tempo: 1.1, allesEter: true, mond: [0.12, 0.3] },
  { id: 'lam', plaatje: w('lam'), geluid: 'Bèh!', goed: ['melk'], fout: PLANT_NEE, kijkt: 'links', schaal: 0.85, komt: 'hupt', tempo: 1.1 },
  { id: 'kangoeroe', plaatje: w('kangoeroe'), geluid: 'Boing!', goed: ['gras'], fout: [...PLANT_NEE, 'melk'], kijkt: 'links', schaal: 1.05, komt: 'springt', tempo: 1 },
  { id: 'nijlpaard', plaatje: w('nijlpaard'), geluid: 'Bwoah!', goed: ['gras'], fout: [...PLANT_NEE, 'melk'], kijkt: 'links', schaal: 1.2, komt: 'loopt', tempo: 0.7, mond: [0.12, 0.5] },
  { id: 'uil', plaatje: w('uil'), geluid: 'Oehoe!', goed: ['muis'], fout: VLEES_NEE, kijkt: 'voor', schaal: 0.85, komt: 'vliegt', tempo: 0.9 },
  { id: 'spin', plaatje: w('spin'), geluid: 'Tik tik!', goed: ['vlieg'], fout: [...VLEES_NEE, 'kaas', 'brood', 'melk'], kijkt: 'voor', schaal: 0.8, komt: 'zakt', tempo: 1 },
  { id: 'krokodil', plaatje: w('krokodil'), geluid: 'Hap hap!', goed: ['vis', 'vlees'], fout: VLEES_NEE, kijkt: 'links', draai: 90, schaal: 1.1, komt: 'loopt', tempo: 0.8, mond: [0.1, 0.5] },
  { id: 'dolfijn', plaatje: w('dolfijn'), geluid: 'Iek iek!', goed: ['vis'], fout: [...VLEES_NEE, 'kaas'], kijkt: 'links', schaal: 1, komt: 'zwemt', tempo: 1.3, water: true, mond: [0.15, 0.3] },
  { id: 'haai', plaatje: w('haai'), geluid: 'Hap!', goed: ['vis'], fout: [...VLEES_NEE, 'kaas'], kijkt: 'links', schaal: 1.15, komt: 'zwemt', tempo: 1, water: true, mond: [0.1, 0.4] },
  { id: 'mol', plaatje: w('mol'), geluid: 'Snuf!', goed: ['worm'], fout: ['gras', 'sla', 'honing', 'bot', 'melk'], kijkt: 'voor', schaal: 0.85, komt: 'graaft', tempo: 1 },
  { id: 'eekhoorn', plaatje: v('eekhoorn'), geluid: 'Knabbel!', goed: ['noot'], fout: ['vis', 'kaas', 'bot', 'vlees', 'kluif', 'melk'], kijkt: 'links', schaal: 0.82, komt: 'hupt', tempo: 1.3, mond: [0.2, 0.35] },
  { id: 'panda', plaatje: w('panda'), geluid: 'Mmmm!', goed: ['bamboe'], fout: [...PLANT_NEE, 'melk'], kijkt: 'voor', schaal: 0.9, komt: 'loopt', tempo: 0.8, mond: [0.5, 0.65] },
  // Zeewier-eters. De zeeschildpad is de Fluent-schildpad met zwemvliezen (eigen bewerking).
  { id: 'zeeschildpad', plaatje: v('zeeschildpad'), geluid: 'Blub blub!', goed: ['zeewier'], fout: ['kaas', 'bot', 'vlees', 'kluif', 'honing', 'melk', 'pinda', 'gras'], kijkt: 'links', schaal: 1, komt: 'zwemt', tempo: 0.8, water: true, mond: [0.1, 0.6] },
  { id: 'visje', plaatje: a('vis-tropisch'), geluid: 'Blub!', goed: ['zeewier'], fout: ['kaas', 'bot', 'vlees', 'kluif', 'honing', 'melk', 'gras', 'brood'], kijkt: 'links', schaal: 0.8, komt: 'zwemt', tempo: 1.4, water: true, mond: [0.05, 0.5] },
  { id: 'krab', plaatje: w('krab'), geluid: 'Knip knip!', goed: ['zeewier'], fout: ['kaas', 'honing', 'melk', 'gras', 'brood', 'bot'], kijkt: 'voor', schaal: 0.82, komt: 'loopt', tempo: 1.5, reactie: 'gooi' },
];
for (const id of ['tijger', 'leeuw', 'trex', 'ijsbeer', 'wolf', 'vos', 'krokodil', 'haai']) DIEREN.find((d) => d.id === id)!.jager = true;
// Eten dat ook als dier langs kan komen: die staan nooit samen met wie ze opeet.
const PROOI: Partial<Record<Eten, string[]>> = { muis: ['muis', 'muisje'], schaap: ['schaap', 'lam'], kip: ['haan', 'kuiken', 'kip'], vis: ['visje'] };
const lust = (p: Dier, q: Dier): boolean => p.goed.some((e) => PROOI[e]?.includes(q.id));
const PLANTEN: Eten[] = ['gras', 'sla', 'wortel', 'appel', 'banaan', 'mais', 'brood', 'blad', 'pinda', 'bloem', 'zeewier', 'noot', 'bamboe'];
const WATER: ThemaId[] = ['zee', 'onderwater'];
const kruipt = (g: { dier: Dier }): boolean => g.dier.komt === 'kruipt';
const eetPlanten = (d: Dier): boolean => d.goed.every((e) => PLANTEN.includes(e));
// Apen en bijen komen vaak met z'n tweeën of drieën; soms komt de muis met vier muisjes.
const SAMEN: Record<string, { twee: number; drie: number }> = {
  aap: { twee: 0.6, drie: 0.35 },
  bij: { twee: 0.45, drie: 0.5 },
  vlinder: { twee: 0.5, drie: 0.5 },
};
// Grootteverschil: de schaal (0,8 tot 1,2) wordt uitvergroot, zodat een muis echt klein is
// en een olifant echt groot.
const spreid = (schaal: number): number => Math.max(0.4, 1 + (schaal - 1) * 1.75);
const FAMILIE_VANAF = 4; // score
const FAMILIE_KANS = 0.12;

// Bij een achtergrond horen vooral de dieren die daar wonen (75%); de rest komt soms langs.
const THEMA_DIEREN: Record<ThemaId, string[]> = {
  boerderij: ['koe', 'schaap', 'paard', 'ezel', 'varken', 'haan', 'kuiken', 'eend', 'gans', 'konijn', 'hond', 'poes', 'muis', 'bij', 'vlinder', 'vos', 'kip', 'geit', 'lam'],
  savanne: ['olifant', 'zebra', 'giraf', 'aap', 'tijger', 'leeuw', 'luiaard', 'slang', 'papegaai', 'kangoeroe', 'nijlpaard', 'krokodil', 'panda'],
  dino: ['trex', 'brachiosaurus', 'stegosaurus', 'kikker', 'bij', 'schildpad', 'slak', 'slang', 'krokodil'],
  zee: ['zeehond', 'pinguin', 'eend', 'gans', 'hond', 'krab', 'dolfijn', 'haai', 'zeeschildpad', 'visje'],
  onderwater: ['zeehond', 'pinguin', 'ijsbeer', 'kikker', 'krab', 'dolfijn', 'haai', 'zeeschildpad', 'visje'],
  winter: ['pinguin', 'zeehond', 'ijsbeer', 'konijn', 'hond', 'wolf', 'vos', 'uil'],
  herfst: ['egel', 'konijn', 'muis', 'eend', 'beer', 'bij', 'slak', 'vos', 'wolf', 'vlinder', 'uil', 'spin', 'mol', 'eekhoorn', 'panda', 'schildpad'],
  ruimte: ['aap', 'hond', 'muis', 'poes', 'kangoeroe', 'papegaai'],
  kasteel: ['paard', 'ezel', 'hond', 'poes', 'muis', 'haan', 'gans', 'wolf', 'vlinder', 'uil', 'spin', 'geit'],
  kermis: ['olifant', 'aap', 'leeuw', 'tijger', 'paard', 'zeehond', 'papegaai', 'nijlpaard'],
  bouw: ['hond', 'poes', 'muis', 'egel', 'haan', 'ezel', 'slak', 'mol', 'spin', 'kip'],
  trein: ['koe', 'schaap', 'paard', 'varken', 'eend', 'hond', 'poes', 'kip', 'geit', 'lam'],
};

const STER = w('ster');
const HART = 'assets/icons/bewaar.svg';
const LEVENS = 3;
const KEUZES = 3; // zoveel dingen liggen er minstens in de bak bij een nieuw groepje
const TWEE_VANAF = 6; // score
const DRIE_VANAF = 14; // score, alleen groep 3

const recordSleutel = (): string => `leren-lezen:voeren:${haalActiefProfielId() ?? 'gast'}`;
function haalRecord(): number {
  try {
    return Number(localStorage.getItem(recordSleutel())) || 0;
  } catch {
    return 0;
  }
}
function zetRecord(n: number): void {
  try {
    localStorage.setItem(recordSleutel(), String(n));
  } catch {
    // geen opslag: dan maar geen record
  }
}

const willekeurig = <T,>(lijst: readonly T[]): T => lijst[Math.floor(Math.random() * lijst.length)];
function schud<T>(lijst: T[]): T[] {
  for (let i = lijst.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [lijst[i], lijst[j]] = [lijst[j], lijst[i]];
  }
  return lijst;
}
const slaap = (ms: number): Promise<void> => new Promise((r) => window.setTimeout(r, ms));

// Iets dat geen van deze dieren eet (en dat ook bij niemand als goed telt).
function afleiders(dieren: Dier[]): Eten[] {
  if (!dieren.length) return [];
  return dieren[0].fout.filter((e) => dieren.every((d) => d.fout.includes(e) && !d.goed.includes(e)));
}

interface Gast {
  dier: Dier;
  wil: Eten;
  el: HTMLDivElement;
  x: number; // midden, px
  doelX: number; // waar het gaat staan
  zweef: number; // px boven de grond (de luiaard hangt, de bij zweeft)
  maat: number;
  slot: number;
  stil: boolean; // geen tekstballon (tweede aap, de muisjes)
  staat: 'komt' | 'wacht' | 'eet' | 'weg';
}

export function VoerScreen(manager: ScreenManager): Screen {
  const kleuter = haalGroep() === 'kleuter';
  const thema = huidigThema();
  const themaPoel = THEMA_DIEREN[thema];
  const el = document.createElement('div');
  el.className = 'voer-scherm';

  const veld = document.createElement('div');
  veld.className = 'voer-veld';
  el.appendChild(veld);

  const balk = document.createElement('div');
  balk.className = 'vang-balk voer-balk';
  const scoreEl = document.createElement('div');
  scoreEl.className = 'vang-score';
  scoreEl.innerHTML = `<img src="${STER}" alt=""><span>0</span>`;
  const hartjes = document.createElement('div');
  hartjes.className = 'vang-hartjes';
  balk.append(scoreEl, hartjes);
  veld.appendChild(balk);

  const profiel = haalActiefProfiel();
  const tint = avatarFilter(profiel?.kleur);
  const speler = document.createElement('img');
  speler.className = 'voer-speler';
  speler.src = avatarPad(profiel?.icoonId ?? 'kat');
  speler.alt = '';
  speler.style.filter = [tint, 'drop-shadow(0 6px 4px rgba(0, 0, 0, 0.3))'].filter(Boolean).join(' ');
  veld.appendChild(speler);

  const bak = document.createElement('div');
  bak.className = 'voer-bak voer-bak--weg';
  veld.appendChild(bak);

  let score = 0;
  let levens = LEVENS;
  let spel = 0; // telt op bij elke start en bij weggaan; lopende stappen stoppen dan
  let gasten: Gast[] = [];
  let kruipers: Gast[] = []; // slakken en schildpadden die nog wegkruipen, los van het groepje
  let vorigeDieren: string[] = [];
  let noot = 0;
  let overlay: HTMLElement | null = null;
  let sleep: { knop: HTMLButtonElement; eten: Eten; img: HTMLImageElement; dx: number; dy: number; id: number } | null = null;

  const breedte = (): number => veld.clientWidth;
  const hoogte = (): number => veld.clientHeight;
  const grond = (): number => hoogte() - 16;
  const dierMaat = (): number => Math.min(280, Math.max(120, Math.min(breedte() * 0.42, hoogte() * 0.3)));
  const spelerMaat = (): number => Math.min(150, Math.max(80, Math.min(breedte() * 0.24, hoogte() * 0.2)));
  const etenMaat = (): number => Math.min(110, Math.max(64, Math.min(breedte() * 0.19, hoogte() * 0.14)));
  const randRechts = (): number => Math.max(12, breedte() * 0.06);
  const spelerRechts = (): number => speler.offsetLeft + spelerMaat();

  function zetMaten(): void {
    veld.style.setProperty('--voer-speler', `${spelerMaat()}px`);
    veld.style.setProperty('--voer-eten', `${etenMaat()}px`);
  }

  // Een groepje staat van rechts naar links naast elkaar, elk dier op zijn eigen schaal. Past
  // het niet naast het figuurtje, dan wordt iedereen evenredig kleiner.
  const tussenruimte = (): number => Math.max(6, dierMaat() * 0.08);
  function maten(dieren: Dier[]): number[] {
    const ruw = dieren.map((d) => dierMaat() * spreid(d.schaal));
    const totaal = ruw.reduce((s, m) => s + m, 0) + tussenruimte() * (dieren.length - 1);
    const ruimte = breedte() - spelerRechts() - 16 - randRechts();
    const f = Math.min(1, ruimte / totaal);
    return ruw.map((m) => Math.min(m * f, hoogte() * 0.42));
  }

  function zetPlekken(groep: Gast[]): void {
    let r = breedte() - randRechts();
    for (const g of [...groep].sort((p, q) => q.slot - p.slot)) {
      g.doelX = r - g.maat / 2;
      r -= g.maat + tussenruimte();
    }
  }

  function tekenHartjes(): void {
    hartjes.replaceChildren(
      ...Array.from({ length: LEVENS }, (_, i) => {
        const h = document.createElement('img');
        h.src = HART;
        h.alt = '';
        if (i >= levens) h.className = 'vang-hart--weg';
        return h;
      }),
    );
  }

  function zetScore(n: number): void {
    score = n;
    scoreEl.querySelector('span')!.textContent = String(score);
  }

  const gastTransform = (g: Gast, x: number, dy = 0): string => `translate(${x - g.maat / 2}px, ${grond() - g.maat - g.zweef + dy}px)`;

  // Plaatjes kijken van nature links, rechts of naar voren; draai ze naar de looprichting.
  function kijk(g: Gast, richting: 'links' | 'rechts'): void {
    const lijf = g.el.querySelector<HTMLElement>('.voer-dier__lijf')!;
    const spiegel = g.dier.kijkt !== 'voor' && g.dier.kijkt !== richting;
    lijf.style.transform = [spiegel ? 'scaleX(-1)' : '', g.dier.draai ? `rotate(${g.dier.draai}deg)` : ''].join(' ').trim();
  }

  const plaatjeVan = (g: Gast): HTMLElement => g.el.querySelector<HTMLElement>('.voer-dier__plaatje')!;

  // Speelt een beweging af en zet het dier daarna vast op zijn nieuwe plek.
  async function speel(g: Gast, frames: Keyframe[], duur: number, easing: string, naar: number): Promise<boolean> {
    const mijn = spel;
    const anim = g.el.animate(frames, { duration: Math.max(1, duur), easing });
    try {
      await anim.finished;
    } catch {
      return false;
    }
    if (mijn !== spel) return false;
    g.x = naar;
    g.el.style.transform = gastTransform(g, naar);
    return true;
  }

  async function loop(g: Gast, naar: number, pxPerSec: number, schud?: string): Promise<boolean> {
    const plaatje = plaatjeVan(g);
    const klasse = schud ?? 'voer-dier__plaatje--loopt';
    if (!schud) plaatje.style.animationDuration = `${0.32 / Math.max(0.6, g.dier.tempo)}s`;
    plaatje.classList.add(klasse);
    const ok = await speel(g, [{ transform: gastTransform(g, g.x) }, { transform: gastTransform(g, naar) }], (Math.abs(naar - g.x) / pxPerSec) * 1000, 'linear', naar);
    plaatje.classList.remove(klasse);
    plaatje.style.animationDuration = '';
    return ok;
  }

  // Huppen of springen: bogen van `lengte` px breed en `hoog` px hoog.
  function hup(g: Gast, naar: number, hoog: number, lengte: number, msPerHup: number): Promise<boolean> {
    const van = g.x;
    const n = Math.max(1, Math.round(Math.abs(naar - van) / lengte));
    const stappen = n * 8;
    const frames: Keyframe[] = [];
    for (let i = 0; i <= stappen; i++) {
      const t = i / stappen;
      const boog = Math.sin(Math.PI * ((i % 8) / 8));
      frames.push({ transform: gastTransform(g, van + (naar - van) * t, -hoog * boog) });
    }
    return speel(g, frames, n * msPerHup, 'linear', naar);
  }

  // `uit` alleen bij fout eten: iets langzamer weg, en schudden i.p.v. de gewone loop.
  // Kruipers houden hun snelheid (snel 1); hun schudden is intrekken.
  async function beweeg(g: Gast, naar: number, richting: 'in' | 'uit', uit?: { snel: number; schud: 'bah' | 'in' }): Promise<boolean> {
    const m = g.maat;
    const snel = uit?.snel ?? 1;
    const schud = uit ? `voer-dier__plaatje--${uit.schud}` : undefined;
    const v = Math.max(260, breedte() * 0.45) * (richting === 'uit' ? 1.3 : 1) * g.dier.tempo * snel;
    const boven = -(grond() - g.zweef + 30); // net boven het scherm
    const metSchud = async (werk: () => Promise<boolean>): Promise<boolean> => {
      if (!schud) return werk();
      const plaatje = plaatjeVan(g);
      plaatje.classList.add(schud);
      try {
        return await werk();
      } finally {
        plaatje.classList.remove(schud);
      }
    };
    switch (g.dier.komt) {
      case 'hupt':
        return metSchud(() => hup(g, naar, m * 0.3, m * 0.7, 300 / snel));
      case 'springt':
        return metSchud(() => hup(g, naar, m * 0.6, m * 1.5, 480 / snel));
      case 'valt':
      case 'zakt': {
        const zakt = g.dier.komt === 'zakt';
        g.el.classList.toggle('voer-dier--liaan', zakt);
        if (richting === 'uit') {
          // Weer omhoog klimmen.
          return metSchud(() => speel(g, [{ transform: gastTransform(g, g.x) }, { transform: gastTransform(g, g.x, boven - m) }], (zakt ? 1400 : 650) / snel, 'ease-in', g.x));
        }
        g.x = naar;
        if (zakt) return speel(g, [{ transform: gastTransform(g, naar, boven) }, { transform: gastTransform(g, naar) }], 2000, 'cubic-bezier(0.3, 0.6, 0.4, 1)', naar);
        const ok = await speel(
          g,
          [
            { transform: gastTransform(g, naar, boven), easing: 'cubic-bezier(0.5, 0, 1, 0.5)' },
            { transform: gastTransform(g, naar), offset: 0.7, easing: 'ease-out' },
            { transform: gastTransform(g, naar, -m * 0.2), offset: 0.85, easing: 'ease-in' },
            { transform: gastTransform(g, naar) },
          ],
          900,
          'linear',
          naar,
        );
        if (ok) speelDrum('tom');
        return ok;
      }
      case 'glijdt': {
        // Op de buik: een pinguïn (van voren getekend) ligt op zijn kant, kop vooruit.
        // Fout eten schudt in plaats daarvan; die transform past niet op het liggen.
        const plaatje = plaatjeVan(g);
        const duur = (Math.abs(naar - g.x) / (v * 1.7)) * 1000;
        const easing = richting === 'in' ? 'cubic-bezier(0.2, 0.75, 0.35, 1)' : 'cubic-bezier(0.6, 0, 0.9, 0.5)';
        const frames = [{ transform: gastTransform(g, g.x) }, { transform: gastTransform(g, naar) }];
        if (schud) return metSchud(() => speel(g, frames, duur, easing, naar));
        const hoek = g.dier.kijkt === 'voor' ? (naar < g.x ? -75 : 75) : 0;
        plaatje.style.setProperty('--glij-hoek', `${hoek}deg`);
        plaatje.classList.add('voer-dier__plaatje--glijdt');
        const ok = await speel(g, frames, duur, easing, naar);
        plaatje.classList.remove('voer-dier__plaatje--glijdt');
        return ok;
      }
      case 'stampt': {
        // Fout eten dreunt kort via de reactie, niet de hele wegstap.
        if (!schud) veld.classList.add('voer-veld--dreun');
        const ok = await loop(g, naar, v, schud);
        if (!schud && !gasten.some((x) => x !== g && x.dier.komt === 'stampt' && x.staat === 'komt')) veld.classList.remove('voer-veld--dreun');
        return ok;
      }
      case 'rent':
        if (richting === 'in') {
          // Blij heen en weer: tot halverwege, terug naar de rand, dan naar zijn plek.
          const links = Math.max(spelerRechts() + m / 2 + 10, Math.min(naar, breedte() * 0.45));
          const rechts = breedte() - m / 2 - 6;
          if (!(await loop(g, links, v * 1.3))) return false;
          kijk(g, 'rechts');
          if (!(await loop(g, rechts, v * 1.3))) return false;
          kijk(g, 'links');
        }
        return loop(g, naar, v, schud);
      case 'vliegt':
      case 'zwemt': {
        // Golfjes op en neer; weg gaat ook schuin omhoog. Zwemmen golft rustiger.
        const van = g.x;
        const golf = m * (g.dier.komt === 'zwemt' ? 0.15 : 0.3);
        const n = Math.max(2, Math.round(Math.abs(naar - van) / (m * 1.6)));
        const omhoog = richting === 'uit' ? -(grond() * (g.dier.komt === 'zwemt' ? 0.15 : 0.5)) : 0;
        const frames: Keyframe[] = [];
        for (let i = 0; i <= 40; i++) {
          const t = i / 40;
          frames.push({ transform: gastTransform(g, van + (naar - van) * t, Math.sin(t * n * Math.PI * 2) * golf + omhoog * t) });
        }
        return metSchud(() => speel(g, frames, (Math.abs(naar - van) / (v * 1.1)) * 1000, 'ease-out', naar));
      }
      case 'kruipt':
      case 'kronkelt': {
        // Kruipen gaat heel langzaam (een derde lijf per seconde), ook weer weg: daar wacht
        // niemand op. Een slang kronkelt in een rustig tempo. `snel` uit `uit` zit al in `v`,
        // maar een kruiper negeert dat.
        const traag = kruipt(g);
        const klasse = schud ?? `voer-dier__plaatje--${g.dier.komt}`;
        const plaatje = plaatjeVan(g);
        plaatje.classList.add(klasse);
        if (!schud) plaatje.style.animationDuration = `${(traag ? 1.2 : 0.6) / g.dier.tempo}s`;
        const gang = traag ? m * 0.33 * g.dier.tempo : v * 0.6;
        const ok = await speel(g, [{ transform: gastTransform(g, g.x) }, { transform: gastTransform(g, naar) }], (Math.abs(naar - g.x) / gang) * 1000, 'linear', naar);
        plaatje.classList.remove(klasse);
        plaatje.style.animationDuration = '';
        return ok;
      }
      case 'graaft': {
        // Mol: komt op zijn plek uit de grond omhoog (de molshoop zit in het plaatje) en zakt
        // er weer in. Wat onder de grond zit wordt weggeknipt; de ballon erboven niet.
        const knip = (onder: number): string => `inset(-200% -100% ${Math.max(0, onder)}px -100%)`;
        if (richting === 'uit') {
          const ok = await metSchud(() =>
            speel(
              g,
              [
                { transform: gastTransform(g, g.x), clipPath: knip(0) },
                { transform: gastTransform(g, g.x, m), clipPath: knip(m) },
              ],
              600,
              'ease-in',
              g.x,
            ),
          );
          if (ok) {
            g.el.style.visibility = 'hidden';
            g.x = naar;
          }
          return ok;
        }
        g.x = naar;
        gooiAarde(g);
        return speel(
          g,
          [
            { transform: gastTransform(g, naar, m), clipPath: knip(m) },
            { transform: gastTransform(g, naar, -m * 0.08), clipPath: knip(0), offset: 0.75 },
            { transform: gastTransform(g, naar), clipPath: knip(0) },
          ],
          800,
          'ease-out',
          naar,
        );
      }
      default:
        return loop(g, naar, v, schud);
    }
  }

  // Vleeseter en planteneter samen: wordt de planteneter niet binnen 4 seconden gevoerd (en
  // de jager ook niet), dan jaagt de jager hem het scherm uit. Allebei weg, geen hartje kwijt.
  function laatJagen(): void {
    const mijn = spel;
    window.setTimeout(() => {
      if (mijn !== spel) return;
      for (const jager of gasten.filter((g) => g.dier.jager && g.staat === 'wacht')) {
        const prooien = gasten.filter((g) => g.staat === 'wacht' && !g.dier.jager && eetPlanten(g.dier));
        if (!prooien.length) return;
        const prooi = prooien.reduce((p, q) => (Math.abs(q.x - jager.x) < Math.abs(p.x - jager.x) ? q : p));
        void jaag(jager, prooi);
      }
    }, 4000);
  }

  async function jaag(jager: Gast, prooi: Gast): Promise<void> {
    zetStaat(jager, 'weg');
    zetStaat(prooi, 'weg');
    wordWakker(jager);
    vulBak();
    const zeg = (g: Gast, tekst: string): void => {
      const ballon = g.el.querySelector('.voer-ballon');
      if (!ballon) return;
      ballon.textContent = tekst;
      ballon.classList.add('voer-ballon--zie');
    };
    zeg(jager, 'GRRR!');
    zeg(prooi, 'Help!');
    prooi.el.querySelector('.voer-ballon')?.classList.add('voer-ballon--bah');
    speelDrum('bas');
    speelDrum('bekken', 0.08);
    // Weg van de jager af; de jager rent er vlak achteraan.
    const naarRechts = prooi.x >= jager.x;
    const doel = (g: Gast): number => (naarRechts ? breedte() + g.maat / 2 + 10 : -g.maat / 2 - 10);
    kijk(prooi, naarRechts ? 'rechts' : 'links');
    kijk(jager, naarRechts ? 'rechts' : 'links');
    const snel = Math.max(420, breedte() * 0.9);
    const vlucht = (async (): Promise<void> => {
      if (await loop(prooi, doel(prooi), snel * 1.15)) await vertrokken(prooi);
    })();
    await slaap(220);
    if (await loop(jager, doel(jager), snel)) await vertrokken(jager);
    await vlucht;
  }

  function zetStaat(g: Gast, staat: Gast['staat']): void {
    g.staat = staat;
    g.el.dataset.staat = staat;
  }

  // Olifant: een fontein uit de slurf.
  function spuitWater(g: Gast): void {
    const mond = mondPunt(g);
    speelDrum('snare');
    for (let i = 0; i < 26; i++) {
      const d = document.createElement('div');
      d.className = 'voer-druppel';
      d.style.left = `${mond.x}px`;
      d.style.top = `${mond.y}px`;
      veld.appendChild(d);
      const hoek = (-95 - Math.random() * 45) * (Math.PI / 180); // fontein: omhoog, iets naar links
      const kracht = g.maat * (1.3 + Math.random() * 0.9);
      const frames: Keyframe[] = [];
      for (let s = 0; s <= 10; s++) {
        const t = s / 10;
        const x = Math.cos(hoek) * kracht * t;
        const y = Math.sin(hoek) * kracht * t + g.maat * 1.9 * t * t;
        frames.push({ transform: `translate(${x}px, ${y}px)`, opacity: t < 0.7 ? 1 : (1 - t) / 0.3 });
      }
      d.animate(frames, { duration: 800 + Math.random() * 300, delay: i * 25, easing: 'linear', fill: 'both' }).onfinish = (): void => d.remove();
    }
  }

  // Mol: kluitjes aarde vliegen opzij als hij boven komt.
  function gooiAarde(g: Gast): void {
    const x0 = g.x;
    const y0 = grond() - g.maat * 0.1;
    for (let i = 0; i < 12; i++) {
      const d = document.createElement('div');
      d.className = 'voer-druppel voer-druppel--aarde';
      d.style.left = `${x0 + (Math.random() - 0.5) * g.maat * 0.4}px`;
      d.style.top = `${y0}px`;
      veld.appendChild(d);
      const kant = i % 2 ? 1 : -1;
      const wijd = g.maat * (0.3 + Math.random() * 0.4) * kant;
      const hoog = g.maat * (0.3 + Math.random() * 0.35);
      const frames: Keyframe[] = [];
      for (let s = 0; s <= 8; s++) {
        const t = s / 8;
        frames.push({ transform: `translate(${wijd * t}px, ${-4 * hoog * t * (1 - t)}px)`, opacity: t < 0.75 ? 1 : (1 - t) / 0.25 });
      }
      d.animate(frames, { duration: 550 + Math.random() * 200, delay: 120 + i * 20, easing: 'linear', fill: 'both' }).onfinish = (): void => d.remove();
    }
  }

  // Leeuw en luiaard doezelen weg als je ze laat wachten; eten maakt ze weer wakker.
  function laatInslapen(g: Gast): void {
    const mijn = spel;
    window.setTimeout(() => {
      if (mijn !== spel || g.staat !== 'wacht') return;
      g.el.classList.add('voer-dier--slaapt');
      const ballon = g.el.querySelector('.voer-ballon');
      if (ballon) ballon.textContent = 'Zzz…';
    }, 3500 + Math.random() * 2000);
  }

  function wordWakker(g: Gast): void {
    if (!g.el.classList.contains('voer-dier--slaapt')) return;
    g.el.classList.remove('voer-dier--slaapt');
    const ballon = g.el.querySelector('.voer-ballon');
    if (ballon) ballon.textContent = g.dier.geluid;
  }

  function hoeveel(): number {
    if (score < TWEE_VANAF) return 1;
    // Drie naast elkaar alleen als er genoeg breedte is (niet op een rechtopstaande telefoon).
    if (kleuter || score < DRIE_VANAF || breedte() < 560) return Math.random() < 0.7 ? 2 : 1;
    return Math.random() < 0.6 ? 3 : 2;
  }

  // Een groepje dieren dat elk iets anders eet, met nog een ding over dat niemand eet.
  function kiesGroepje(n: number): Dier[] {
    // Alleen in de dev-server: een test kan de volgende groepjes vastzetten.
    const vast = import.meta.env.DEV ? (window as { __voerGroepjes?: string[][] }).__voerGroepjes?.shift() : undefined;
    if (vast) return vast.map((id) => DIEREN.find((d) => d.id === id)!).filter(Boolean);
    const dier = (id: string): Dier => DIEREN.find((d) => d.id === id)!;
    // Iets lastiger, af en toe: een muis met vier muisjes, een hele apenbende of een zwerm bijen.
    if (score >= FAMILIE_VANAF && Math.random() < FAMILIE_KANS) {
      const r = Math.random();
      if (r < 0.4) return [dier('muis'), ...Array<Dier>(4).fill(dier('muisje'))];
      if (r < 0.7) return Array<Dier>(Math.random() < SAMEN.aap.drie ? 3 : 2).fill(dier('aap'));
      return Array<Dier>(breedte() < 560 ? 3 : 4).fill(dier(Math.random() < 0.5 ? 'bij' : 'vlinder'));
    }
    const vrij = DIEREN.filter((d) => !d.alleenFamilie && (!d.water || WATER.includes(thema)));
    const poel = Math.random() < 0.75 ? vrij.filter((d) => themaPoel.includes(d.id)) : vrij;
    const gekozen: Dier[] = [];
    for (let poging = 0; poging < 60 && gekozen.length < n; poging++) {
      const bron = poging < 30 && poel.length ? poel : vrij;
      const kandidaat = willekeurig(bron);
      if (gekozen.includes(kandidaat)) continue;
      if (n === 1 && vorigeDieren.includes(kandidaat.id) && poging < 20) continue;
      if (gekozen.some((d) => d.goed.some((e) => kandidaat.goed.includes(e)))) continue;
      // De geit eet alles en heeft dus geen afleiders; hij komt alleen (niemand anders eet
      // iets dat hij niet lust, dus er past ook niemand bij).
      if (!(kandidaat.allesEter && !gekozen.length) && !afleiders([...gekozen, kandidaat]).length) continue;
      // Niemand staat naast zijn eigen eten (poes en muis, wolf en schaap, vos en haan).
      if (gekozen.some((d) => lust(d, kandidaat) || lust(kandidaat, d))) continue;
      gekozen.push(kandidaat);
      const samen = SAMEN[kandidaat.id];
      if (samen && gekozen.length < 3 && Math.random() < samen.twee) {
        gekozen.push(kandidaat);
        if (gekozen.length < 3 && Math.random() < samen.drie) gekozen.push(kandidaat);
      }
    }
    return gekozen.length ? gekozen : [willekeurig(vrij)];
  }

  async function volgendGroepje(): Promise<void> {
    const mijn = spel;
    const dieren = kiesGroepje(hoeveel());
    vorigeDieren = dieren.map((d) => d.id);
    const groottes = maten(dieren);
    let ballonnen = 0;
    gasten = dieren.map((dier, slot) => {
      const maat = groottes[slot];
      // Van elke soort praat er maar één (geen drie keer "Oe oe aa aa!" door elkaar).
      const stil = dieren.indexOf(dier) !== slot;
      const g: Gast = {
        dier,
        wil: willekeurig(dier.goed),
        el: document.createElement('div'),
        x: breedte() + maat / 2 + 10,
        doelX: 0,
        // Een zwerm bijen vliegt niet allemaal even hoog.
        zweef:
          dier.komt === 'zakt'
            ? Math.min(maat * 0.7, hoogte() * 0.18)
            : dier.komt === 'vliegt'
              ? Math.min(maat * 1.1, hoogte() * 0.22) * (slot % 2 ? 0.55 : 1)
              : dier.komt === 'zwemt'
                ? Math.min(maat * 0.35, hoogte() * 0.1)
                : 0,
        maat,
        slot,
        stil,
        staat: 'komt',
      };
      g.el.className = 'voer-dier';
      g.el.dataset.dier = dier.id;
      g.el.dataset.wil = g.wil;
      g.el.dataset.staat = 'komt';
      g.el.style.setProperty('--voer-dier', `${maat}px`);
      const hoog = !stil && ballonnen++ % 2 === 1 ? ' voer-ballon--hoog' : '';
      g.el.innerHTML = `
        <div class="voer-dier__lijf"><img class="voer-dier__plaatje" src="${dier.plaatje}" alt=""></div>
        ${stil ? '' : `<div class="voer-ballon${hoog}">${dier.geluid}</div>`}`;
      g.el.style.transform = gastTransform(g, g.x);
      veld.insertBefore(g.el, bak);
      kijk(g, 'links');
      return g;
    });
    zetPlekken(gasten);
    // De linkse eerst: die moet het verst lopen. Muisjes trippelen vlak achter elkaar.
    const na = gasten.length > 3 ? 170 : 380;
    // Op een slak of schildpad wacht niemand: de bak komt zodra de rest er is, de kruiper
    // sluit later aan.
    const lopen = gasten.map(async (g) => {
      await slaap(g.slot * na);
      if (mijn !== spel) return;
      if (!(await beweeg(g, g.doelX, 'in'))) return;
      if (g.staat !== 'komt') return;
      zetStaat(g, 'wacht');
      toonBallon(g);
      if (g.dier.spuit) spuitWater(g);
      if (g.dier.slaapt) laatInslapen(g);
      if (g.dier.id === 'aap') {
        // Apen wippen ongeduldig op en neer (elk in zijn eigen ritme).
        plaatjeVan(g).style.animationDelay = `${-Math.random()}s`;
        g.el.classList.add('voer-dier--wipt');
      }
      if (g.dier.komt === 'vliegt' || g.dier.komt === 'zwemt') {
        plaatjeVan(g).style.animationDelay = `${-Math.random()}s`;
        g.el.classList.add('voer-dier--zweeft');
      }
    });
    const vlot = lopen.filter((_, i) => !kruipt(gasten[i]));
    await Promise.all(vlot.length ? vlot : lopen);
    if (mijn !== spel) return;
    // Eén akkoordje voor het hele groepje, als het eten klaarligt: twee toetsen met er één
    // tussen (do-mi) tegelijk, bij drie of meer dieren ook de sol erbij.
    speelNoot(TONEN[0]);
    speelNoot(TONEN[2]);
    if (gasten.length >= 3) speelNoot(TONEN[4]);
    vulBak(true);
    if (gasten.some((g) => g.dier.jager) && gasten.some((g) => !g.dier.jager && eetPlanten(g.dier))) laatJagen();
  }

  function toonBallon(g: Gast): void {
    const ballon = g.el.querySelector('.voer-ballon');
    if (!ballon) return;
    ballon.classList.remove('voer-ballon--zie');
    void (ballon as HTMLElement).offsetWidth;
    ballon.classList.add('voer-ballon--zie');
  }

  // De bak hoort bij het hele groepje en verandert niet: eten blijft liggen na het slepen,
  // dus één kaas is genoeg voor vijf muizen. Elk ding dat een dier wil, plus dingen die geen
  // van hen eet tot er minstens drie liggen. Weg zodra er niemand meer wacht.
  function vulBak(nieuw = false): void {
    const nog = gasten.filter((g) => g.staat === 'wacht' || g.staat === 'komt');
    if (!nog.length) {
      bak.classList.add('voer-bak--weg');
      return;
    }
    if (!nieuw) return;
    const gewild = [...new Set(gasten.map((g) => g.wil))];
    // Bij de geit is alles goed: dan liggen er gewoon drie willekeurige dingen.
    const geit = gasten.find((g) => g.dier.allesEter);
    const anders = geit
      ? schud(geit.dier.goed.filter((e) => !gewild.includes(e))).slice(0, KEUZES - gewild.length)
      : schud(afleiders(gasten.map((g) => g.dier))).slice(0, Math.max(1, KEUZES - gewild.length));
    bak.replaceChildren(...schud([...gewild, ...anders]).map(maakEtenKnop));
    bak.classList.remove('voer-bak--weg');
  }

  function maakEtenKnop(eten: Eten): HTMLButtonElement {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'voer-eten';
    b.dataset.eten = eten;
    b.setAttribute('aria-label', eten);
    b.innerHTML = `<img src="${ETEN[eten]}" alt="" draggable="false">`;
    b.addEventListener('pointerdown', (e) => pak(e, b, eten));
    return b;
  }

  // ---- slepen ----
  function veldPunt(cx: number, cy: number): { x: number; y: number } {
    const r = veld.getBoundingClientRect();
    return { x: cx - r.left, y: cy - r.top };
  }

  function pak(e: PointerEvent, knop: HTMLButtonElement, eten: Eten): void {
    if (sleep || overlay || !gasten.some((g) => g.staat === 'wacht')) return;
    e.preventDefault();
    const r = knop.getBoundingClientRect();
    const m = r.width;
    const img = document.createElement('img');
    img.className = 'voer-vlieg voer-vlieg--sleep';
    img.src = ETEN[eten];
    img.alt = '';
    img.style.width = img.style.height = `${m}px`;
    // In px: een padding in % rekent met de breedte van het veld, niet van het plaatje.
    img.style.padding = `${m * 0.1}px`;
    const p = veldPunt(e.clientX, e.clientY);
    const dx = e.clientX - (r.left + m / 2);
    const dy = e.clientY - (r.top + m / 2);
    img.style.transform = `translate(${p.x - dx - m / 2}px, ${p.y - dy - m / 2}px) scale(1.12)`;
    veld.appendChild(img);
    knop.classList.add('voer-eten--weg');
    speelNoot(TONEN[0] * 2, 0);
    vorigeX = p.x;
    kanteling = 0;
    sleep = { knop, eten, img, dx, dy, id: e.pointerId };
    el.classList.add('voer-sleept');
    window.addEventListener('pointermove', beweegSleep);
    window.addEventListener('pointerup', laatLos);
    window.addEventListener('pointercancel', laatLos);
  }

  // Spoortje: vervagende, krimpende kopietjes van het eten waar het net was.
  let laatsteSpoor = { x: 0, y: 0, t: 0 };
  function spoor(img: HTMLImageElement, x: number, y: number, m: number): void {
    const nu = performance.now();
    if (nu - laatsteSpoor.t < 30 || Math.hypot(x - laatsteSpoor.x, y - laatsteSpoor.y) < m * 0.18) return;
    laatsteSpoor = { x, y, t: nu };
    const s = document.createElement('img');
    s.className = 'voer-spoor';
    s.src = img.src;
    s.alt = '';
    const sm = m * 0.7;
    s.style.width = s.style.height = `${sm}px`;
    s.style.left = `${x - sm / 2}px`;
    s.style.top = `${y - sm / 2}px`;
    veld.insertBefore(s, img);
    s.addEventListener('animationend', () => s.remove());
  }

  // Volgt een geanimeerd plaatje (de worp) en laat er een spoortje achter.
  function volgMetSpoor(img: HTMLImageElement, anim: Animation): void {
    const stap = (): void => {
      if (!img.isConnected || anim.playState !== 'running') return;
      const r = img.getBoundingClientRect();
      const p = veldPunt(r.left + r.width / 2, r.top + r.height / 2);
      spoor(img, p.x, p.y, img.offsetWidth);
      requestAnimationFrame(stap);
    };
    requestAnimationFrame(stap);
  }

  let vorigeX = 0;
  let kanteling = 0;
  function beweegSleep(e: PointerEvent): void {
    if (!sleep || e.pointerId !== sleep.id) return;
    const m = sleep.img.offsetWidth;
    const p = veldPunt(e.clientX, e.clientY);
    // Een beetje meekantelen met de beweging, alsof het eten aan je vinger hangt.
    kanteling += (Math.max(-25, Math.min(25, (p.x - vorigeX) * 1.5)) - kanteling) * 0.35;
    vorigeX = p.x;
    const cx = p.x - sleep.dx;
    const cy = p.y - sleep.dy;
    sleep.img.style.transform = `translate(${cx - m / 2}px, ${cy - m / 2}px) scale(1.12) rotate(${kanteling}deg)`;
    spoor(sleep.img, cx, cy, m);
  }

  function stopSleepLuisteraars(): void {
    el.classList.remove('voer-sleept');
    window.removeEventListener('pointermove', beweegSleep);
    window.removeEventListener('pointerup', laatLos);
    window.removeEventListener('pointercancel', laatLos);
  }

  // Ruim raak: elk dier plus een rand eromheen telt. Liggen randen over elkaar, dan wint het
  // dier waarvan het midden het dichtst bij de vinger is, dus elk dier blijft te raken.
  function gastOp(cx: number, cy: number): Gast | null {
    let beste: Gast | null = null;
    let besteAfstand = Infinity;
    for (const g of gasten) {
      if (g.staat !== 'wacht') continue;
      const r = g.el.querySelector('.voer-dier__lijf')!.getBoundingClientRect();
      const rand = Math.min(r.width * 0.3, 48);
      if (cx < r.left - rand || cx > r.right + rand || cy < r.top - rand * 1.5 || cy > r.bottom + rand) continue;
      const afstand = Math.hypot(cx - (r.left + r.width / 2), cy - (r.top + r.height / 2));
      if (afstand < besteAfstand) {
        beste = g;
        besteAfstand = afstand;
      }
    }
    return beste;
  }

  function laatLos(e: PointerEvent): void {
    if (!sleep || e.pointerId !== sleep.id) return;
    stopSleepLuisteraars();
    const s = sleep;
    sleep = null;
    const doelGast = e.type === 'pointerup' ? gastOp(e.clientX, e.clientY) : null;
    if (doelGast) {
      // Het eten blijft in de bak (er komt meteen een nieuwe op dezelfde plek).
      s.knop.classList.remove('voer-eten--weg', 'voer-eten--nieuw');
      void s.knop.offsetWidth;
      s.knop.classList.add('voer-eten--nieuw');
      void gooi(s.eten, s.img, doelGast);
      return;
    }
    // Terug naar zijn plekje in de bak.
    const r = s.knop.getBoundingClientRect();
    const doel = veldPunt(r.left, r.top);
    const anim = s.img.animate([{ transform: s.img.style.transform }, { transform: `translate(${doel.x}px, ${doel.y}px)` }], {
      duration: 220,
      easing: 'ease-out',
    });
    anim.onfinish = (): void => {
      s.img.remove();
      s.knop.classList.remove('voer-eten--weg');
    };
  }

  // ---- gooien ----
  function handPunt(): { x: number; y: number } {
    const m = spelerMaat();
    return { x: speler.offsetLeft + m * 0.78, y: grond() - m * 0.65 };
  }

  function mondPunt(g: Gast): { x: number; y: number } {
    const links = g.x - g.maat / 2;
    const boven = grond() - g.maat - g.zweef;
    const [fx, fy] = g.dier.mond ?? (g.dier.kijkt === 'voor' ? [0.5, 0.45] : [0.2, 0.35]);
    return { x: links + g.maat * fx, y: boven + g.maat * fy };
  }

  async function gooi(eten: Eten, img: HTMLImageElement, g: Gast): Promise<void> {
    const mijn = spel;
    zetStaat(g, 'eet');
    wordWakker(g);
    g.el.classList.remove('voer-dier--wipt', 'voer-dier--zweeft');
    const m = etenMaat() * (eten === 'kluif' ? 1.1 : 0.7);
    const hand = handPunt();
    // Eerst naar de hand van het figuurtje...
    const naarHand = img.animate(
      [{ transform: img.style.transform }, { transform: `translate(${hand.x - img.offsetWidth / 2}px, ${hand.y - img.offsetHeight / 2}px) scale(${m / img.offsetWidth})` }],
      { duration: 200, easing: 'ease-in', fill: 'forwards' },
    );
    volgMetSpoor(img, naarHand);
    await naarHand.finished.catch(() => undefined);
    if (mijn !== spel) return;
    img.style.width = img.style.height = `${m}px`;
    img.style.padding = '';
    img.classList.remove('voer-vlieg--sleep');
    naarHand.cancel();
    img.style.transform = `translate(${hand.x - m / 2}px, ${hand.y - m / 2}px)`;
    // ...dan zwaait het en gooit het in een boog naar de mond van het dier.
    speler.classList.remove('voer-speler--gooi');
    void speler.offsetWidth;
    speler.classList.add('voer-speler--gooi');
    await slaap(170);
    if (mijn !== spel) return;
    speelDrum('tom');
    const mond = mondPunt(g);
    const hoog = Math.min(hoogte() * 0.25, 160);
    const stappen = 14;
    const frames: Keyframe[] = [];
    for (let i = 0; i <= stappen; i++) {
      const t = i / stappen;
      const x = hand.x + (mond.x - hand.x) * t;
      const y = hand.y + (mond.y - hand.y) * t - 4 * hoog * t * (1 - t);
      frames.push({ transform: `translate(${x - m / 2}px, ${y - m / 2}px) rotate(${t * 420}deg)` });
    }
    const boog = img.animate(frames, { duration: 560, easing: 'linear', fill: 'forwards' });
    volgMetSpoor(img, boog);
    await boog.finished.catch(() => undefined);
    if (mijn !== spel) return;
    if (g.dier.goed.includes(eten)) await smul(g, img);
    else await bah(g, img);
  }

  async function smul(g: Gast, img: HTMLImageElement): Promise<void> {
    const mijn = spel;
    img.remove();
    const mond = mondPunt(g);
    zetScore(score + 1);
    speelNoot(TONEN[noot % TONEN.length]);
    speelNoot(TONEN[(noot + 2) % TONEN.length], 0.1);
    noot++;
    toonPlop(mond.x, mond.y - 20, '+1');
    toonHartje(mond.x, mond.y);
    if (score % 5 === 0) confetti.vuurwerk('klein');
    const ballon = g.el.querySelector('.voer-ballon');
    if (g.dier.allesEter && ballon) {
      // De geit vindt alles lekker, ook een bot of een vis.
      ballon.textContent = 'Mjam!';
      toonBallon(g);
    } else ballon?.classList.remove('voer-ballon--zie');
    const plaatje = g.el.querySelector('.voer-dier__plaatje')!;
    plaatje.classList.add('voer-dier__plaatje--blij');
    await slaap(1000);
    if (mijn !== spel) return;
    plaatje.classList.remove('voer-dier__plaatje--blij');
    zetStaat(g, 'weg');
    vulBak();
    laatKruipen(g);
    // Blij verder naar links, vóór het figuurtje langs.
    if (!(await beweeg(g, -g.maat / 2 - 10, 'uit'))) return;
    await vertrokken(g);
  }

  function schudSpeler(): void {
    speler.classList.remove('voer-speler--gooi', 'voer-speler--bah');
    void speler.offsetWidth;
    speler.classList.add('voer-speler--bah');
    speler.addEventListener('animationend', () => speler.classList.remove('voer-speler--bah'), { once: true });
  }

  function boog(van: { x: number; y: number }, naar: { x: number; y: number }, m: number, hoog: number, draai: number): Keyframe[] {
    const frames: Keyframe[] = [];
    const stappen = 14;
    for (let i = 0; i <= stappen; i++) {
      const t = i / stappen;
      const x = van.x + (naar.x - van.x) * t;
      const y = van.y + (naar.y - van.y) * t - 4 * hoog * t * (1 - t);
      frames.push({ transform: `translate(${x - m / 2}px, ${y - m / 2}px) rotate(${t * draai}deg)`, opacity: 1 });
    }
    return frames;
  }

  function speelWeg(img: HTMLImageElement, frames: Keyframe[], duur: number, easing = 'linear'): void {
    const anim = img.animate(frames, { duration: duur, easing, fill: 'forwards' });
    const ruim = (): void => {
      if (img.isConnected) img.remove();
    };
    anim.onfinish = ruim;
    anim.oncancel = ruim;
  }

  // Fout eten: meteen weggooien, niet afwachten. Het dier loopt intussen al weg.
  function reactieVoer(g: Gast, img: HTMLImageElement): void {
    const mijn = spel;
    const mond = mondPunt(g);
    const m = img.offsetWidth;
    const x0 = mond.x - m / 2;
    const y0 = mond.y - m / 2;
    switch (g.dier.reactie) {
      case 'gooi': {
        const anim = img.animate(boog(mond, handPunt(), m, Math.min(hoogte() * 0.25, 160), -420), { duration: 560, easing: 'linear', fill: 'forwards' });
        volgMetSpoor(img, anim);
        anim.onfinish = (): void => {
          if (!img.isConnected) return;
          if (mijn === spel) schudSpeler();
          img.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, fill: 'forwards' }).onfinish = (): void => img.remove();
        };
        anim.oncancel = (): void => {
          if (img.isConnected) img.remove();
        };
        return;
      }
      case 'spuug': {
        const hand = handPunt();
        const frames = boog(mond, { x: -m, y: Math.min(mond.y - 10, hand.y - spelerMaat()) }, m, Math.min(hoogte() * 0.06, 36), 180);
        frames[frames.length - 1].opacity = 0;
        speelWeg(img, frames, 320);
        return;
      }
      case 'spuit': {
        // Straal uit de slurf naar links. De fontein valt op het lijf terug en lijkt op bloeden.
        speelDrum('snare');
        const kracht = g.maat * 2.6;
        const frames: Keyframe[] = [];
        for (let s = 0; s <= 10; s++) {
          const t = s / 10;
          const x = -kracht * t;
          const y = -g.maat * 0.12 * t + g.maat * 0.2 * t * t;
          frames.push({
            transform: `translate(${x0 + x}px, ${y0 + y}px) rotate(${-16 - t * 50}deg)`,
            opacity: t < 0.82 ? 1 : (1 - t) / 0.18,
          });
        }
        speelWeg(img, frames, 520);
        for (let i = 0; i < 16; i++) {
          const d = document.createElement('div');
          d.className = 'voer-druppel';
          d.style.left = `${mond.x}px`;
          d.style.top = `${mond.y}px`;
          veld.appendChild(d);
          const hoek = Math.PI + (Math.random() - 0.5) * 0.22;
          const k = kracht * (0.55 + Math.random() * 0.5);
          const drup: Keyframe[] = [];
          for (let s = 0; s <= 8; s++) {
            const t = s / 8;
            const x = Math.cos(hoek) * k * t;
            const y = Math.sin(hoek) * k * 0.22 * t + g.maat * 0.22 * t * t;
            drup.push({ transform: `translate(${x}px, ${y}px) scale(${1 - t * 0.3})`, opacity: t < 0.72 ? 1 : (1 - t) / 0.28 });
          }
          d.animate(drup, { duration: 460 + Math.random() * 140, delay: i * 16, easing: 'linear', fill: 'both' }).onfinish = (): void => d.remove();
        }
        return;
      }
      case 'plat': {
        const voetX = g.x - m / 2;
        const grondY = grond() - m * 0.12;
        window.setTimeout(() => {
          if (mijn !== spel) return;
          veld.classList.add('voer-veld--stamp');
          window.setTimeout(() => {
            if (mijn === spel) veld.classList.remove('voer-veld--stamp');
          }, 400);
        }, 70);
        speelWeg(
          img,
          [
            { transform: `translate(${x0}px, ${y0}px) scale(1, 1)`, opacity: 1 },
            { transform: `translate(${voetX}px, ${grondY}px) scale(1.05, 0.92)`, opacity: 1, offset: 0.22 },
            { transform: `translate(${voetX}px, ${grondY}px) scale(1.85, 0.32)`, opacity: 1, offset: 0.36 },
            { transform: `translate(${voetX}px, ${grondY}px) scale(1.7, 0.36)`, opacity: 1, offset: 0.72 },
            { transform: `translate(${voetX}px, ${grondY}px) scale(1.55, 0.3)`, opacity: 0 },
          ],
          460,
          'ease-out',
        );
        return;
      }
      case 'stuiter':
      case 'in': {
        const grondY = grond() - m;
        speelWeg(
          img,
          [
            { transform: `translate(${x0}px, ${y0}px) rotate(0deg)`, opacity: 1 },
            { transform: `translate(${x0 + 36}px, ${Math.min(y0, grondY - 46)}px) rotate(50deg)`, offset: 0.22 },
            { transform: `translate(${x0 + 70}px, ${grondY}px) rotate(90deg)`, offset: 0.42 },
            { transform: `translate(${x0 + 108}px, ${grondY - 26}px) rotate(150deg)`, offset: 0.68 },
            { transform: `translate(${x0 + 140}px, ${grondY}px) rotate(210deg)`, opacity: 1, offset: 0.86 },
            { transform: `translate(${x0 + 148}px, ${grondY}px) rotate(230deg)`, opacity: 0 },
          ],
          700,
        );
        return;
      }
      default: {
        const grondY = grond() - m;
        speelWeg(
          img,
          [
            { transform: `translate(${x0}px, ${y0}px)`, opacity: 1 },
            { transform: `translate(${x0 - 30}px, ${grondY}px) rotate(-80deg)`, opacity: 1, offset: 0.6 },
            { transform: `translate(${x0 - 30}px, ${grondY}px) rotate(-80deg)`, opacity: 0 },
          ],
          900,
          'ease-in',
        );
      }
    }
  }

  async function bah(g: Gast, img: HTMLImageElement): Promise<void> {
    const mijn = spel;
    reactieVoer(g, img);
    levens = Math.max(0, levens - 1);
    tekenHartjes();
    speelDrum('bas');
    speelNoot(TONEN[1] / 2, 0.12);
    const ballon = g.el.querySelector('.voer-ballon');
    if (ballon) {
      ballon.textContent = 'Bah!';
      ballon.classList.add('voer-ballon--bah');
    }
    if (levens <= 0) {
      // Klaar: de andere dieren wachten niet meer.
      for (const ander of gasten) if (ander.staat === 'wacht' || ander.staat === 'komt') zetStaat(ander, 'weg');
      bak.classList.add('voer-bak--weg');
    }
    ballon?.classList.remove('voer-ballon--zie');
    zetStaat(g, 'weg');
    if (levens > 0) vulBak();
    // Los van het groepje vóór het wegstappen, anders wacht het volgende dier op het schudden.
    laatKruipen(g, true);
    // Kort blijven staan zodat de reactie leesbaar is. Het volgende dier is al los.
    await slaap(150);
    if (mijn !== spel) return;
    kijk(g, 'rechts');
    if (!(await beweeg(g, breedte() + g.maat / 2 + 10, 'uit', { snel: kruipt(g) ? 1 : 0.75, schud: g.dier.reactie === 'in' ? 'in' : 'bah' }))) return;
    if (mijn !== spel) return;
    await vertrokken(g);
  }

  // Weg bij het groepje: een slak of schildpad die wegkruipt, of iemand die fout eten kreeg
  // en nog naschudt. Het volgende groepje komt al en loopt er (ervoor) langs.
  function laatKruipen(g: Gast, altijd = false): void {
    if ((!altijd && !kruipt(g)) || levens <= 0) return;
    gasten = gasten.filter((x) => x !== g);
    kruipers.push(g);
    if (!gasten.length) void volgende();
  }

  async function vertrokken(g: Gast): Promise<void> {
    g.el.remove();
    if (kruipers.includes(g)) {
      kruipers = kruipers.filter((x) => x !== g);
      return;
    }
    gasten = gasten.filter((x) => x !== g);
    if (levens <= 0) {
      if (!gasten.some((x) => x.staat === 'eet')) klaar();
      return;
    }
    if (!gasten.length) await volgende();
  }

  async function volgende(): Promise<void> {
    const mijn = spel;
    await slaap(250);
    if (mijn === spel) void volgendGroepje();
  }

  function toonPlop(x: number, y: number, tekst: string): void {
    const plop = document.createElement('div');
    plop.className = 'vang-plop';
    plop.textContent = tekst;
    plop.style.left = `${x}px`;
    plop.style.top = `${y}px`;
    veld.appendChild(plop);
    window.setTimeout(() => plop.remove(), 700);
  }

  function toonHartje(x: number, y: number): void {
    const h = document.createElement('img');
    h.className = 'voer-hartje';
    h.src = HART;
    h.alt = '';
    h.style.left = `${x}px`;
    h.style.top = `${y}px`;
    veld.appendChild(h);
    window.setTimeout(() => h.remove(), 1000);
  }

  // ---- toetsenbord: met één dier gooit 1, 2, 3 dat eten; spatie of Enter start ----
  const toetsNeer = (e: KeyboardEvent): void => {
    if ((e.key === ' ' || e.key === 'Enter') && overlay && !e.repeat) {
      e.preventDefault();
      start();
      return;
    }
    const wachtend = gasten.filter((g) => g.staat === 'wacht');
    const n = Number(e.key);
    if (wachtend.length !== 1 || sleep || !Number.isInteger(n) || n < 1) return;
    const knop = bak.querySelectorAll<HTMLButtonElement>('.voer-eten')[n - 1];
    if (!knop?.dataset.eten) return;
    const r = knop.getBoundingClientRect();
    const p = veldPunt(r.left, r.top);
    const img = document.createElement('img');
    img.className = 'voer-vlieg';
    img.src = ETEN[knop.dataset.eten as Eten];
    img.alt = '';
    img.style.width = img.style.height = `${r.width}px`;
    img.style.transform = `translate(${p.x}px, ${p.y}px)`;
    veld.appendChild(img);
    void gooi(knop.dataset.eten as Eten, img, wachtend[0]);
  };

  function ruimOp(): void {
    stopSleepLuisteraars();
    sleep?.img.remove();
    sleep = null;
    for (const anim of veld.getAnimations({ subtree: true })) anim.cancel();
    for (const g of [...gasten, ...kruipers]) g.el.remove();
    gasten = [];
    kruipers = [];
    for (const x of veld.querySelectorAll('.voer-vlieg, .voer-spoor, .voer-hartje, .voer-druppel, .vang-plop')) x.remove();
    veld.classList.remove('voer-veld--dreun');
    speler.classList.remove('voer-speler--bah', 'voer-speler--gooi');
    bak.classList.add('voer-bak--weg');
    bak.replaceChildren();
  }

  function start(): void {
    overlay?.remove();
    overlay = null;
    spel++;
    ruimOp();
    zetScore(0);
    levens = LEVENS;
    tekenHartjes();
    noot = 0;
    vorigeDieren = [];
    zetMaten();
    void volgendGroepje();
  }

  function klaar(): void {
    spel++;
    window.setTimeout(() => {
      ruimOp();
      toonVenster(true);
    }, 400);
  }

  function toonVenster(eind: boolean): void {
    overlay?.remove();
    const vw = document.createElement('div');
    vw.className = 'vang-venster';
    const doos = document.createElement('div');
    doos.className = 'vang-venster__doos';
    if (eind) {
      const record = haalRecord();
      const nieuw = score > record;
      if (nieuw) zetRecord(score);
      doos.innerHTML = `
        <img class="vang-venster__figuur" src="${speler.src}" alt="">
        <div class="vang-venster__score"><img src="${STER}" alt=""><span>${score}</span></div>
        <p class="vang-venster__record">${nieuw ? 'Nieuw record!' : `Record: ${record}`}</p>`;
      if (nieuw && score > 0) confetti.vuurwerk('klein');
    } else {
      doos.innerHTML = `
        <img class="vang-venster__figuur" src="${speler.src}" alt="">
        <div class="vang-uitleg">
          <span class="vang-uitleg__vak vang-uitleg__vak--goed"><img src="${w('konijn')}" alt=""><img src="${ETEN.wortel}" alt=""><b>✓</b></span>
          <span class="vang-uitleg__vak vang-uitleg__vak--fout"><img src="${w('konijn')}" alt=""><img src="${ETEN.vis}" alt=""><b>✕</b></span>
        </div>`;
    }
    const figuur = doos.querySelector<HTMLImageElement>('.vang-venster__figuur');
    if (figuur) figuur.style.filter = tint;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'vang-venster__start';
    b.innerHTML = '<img src="assets/icons/vangspel-start.svg" alt="">';
    b.setAttribute('aria-label', eind ? 'nog een keer' : 'start');
    b.addEventListener('click', start);
    doos.appendChild(b);
    vw.appendChild(doos);
    el.appendChild(vw);
    overlay = vw;
  }

  const terug = maakTerugKnop(() => manager.pop());
  const opGrootte = new ResizeObserver(() => {
    zetMaten();
    // Stilstaande dieren blijven op hun plek staan (rechts, op de grond).
    zetPlekken(gasten);
    for (const g of gasten) {
      if (g.staat !== 'wacht') continue;
      g.x = g.doelX;
      g.el.style.transform = gastTransform(g, g.x);
    }
  });

  return {
    mount(root) {
      root.appendChild(el);
      root.appendChild(terug);
      tekenHartjes();
      zetMaten();
      opGrootte.observe(veld);
      window.addEventListener('keydown', toetsNeer);
      toonVenster(false);
    },
    unmount() {
      spel++;
      ruimOp();
      opGrootte.disconnect();
      window.removeEventListener('keydown', toetsNeer);
      el.remove();
      terug.remove();
    },
  };
}
