import type { Kern, Woord, ZinsVoorbeeld } from '../../types.ts';

// Nieuwe leesvolgorde: CVC → lange klinkers → clusters → tweeklanken → thema → meervoud.
// Twaalf woorden per hoofdstuk. Voortgang van de oude kern-ids vervalt.

const WEER = new Set(['zon', 'regen', 'wind', 'wolk', 'onweer', 'bliksem', 'hagel', 'regenboog', 'sneeuw']);

function pad(woord: string): string {
  return WEER.has(woord) ? `assets/images/woorden/weer/${woord}.svg` : `assets/images/woorden/${woord}.svg`;
}

function w(woord: string, vereistTekst = false): Woord {
  return { woord, afbeeldingPad: pad(woord), ...(vereistTekst ? { vereistTekst } : {}) };
}

function zin(tekst: string, doel: Woord, a: Woord, b: Woord): ZinsVoorbeeld {
  return { zin: tekst, doel, afleiders: [a, b] };
}

function hoofdstuk(
  nr: number,
  titel: string,
  letters: string[],
  woorden: Woord[],
  zinnen: ZinsVoorbeeld[],
): Kern {
  const structuur = woorden.slice(0, 3).map((woord, i) => ({
    woord: woord.woord,
    afbeeldingPad: woord.afbeeldingPad,
    nieuweLetters: i === 0 ? letters : [],
  }));
  return {
    id: `lezen-${String(nr).padStart(2, '0')}`,
    volgnummer: nr,
    titel,
    structuurwoorden: structuur,
    nieuweLetters: letters,
    woordenbank: woorden,
    zinnen,
  };
}

const vis = w('vis'), sok = w('sok'), pen = w('pen'), kip = w('kip'), vos = w('vos'), pet = w('pet');
const pot = w('pot'), ik = w('ik', true), en = w('en', true), kom = w('kom'), mes = w('mes'), kok = w('kok');
const kat = w('kat'), tak = w('tak'), ram = w('ram'), bal = w('bal'), das = w('das'), tas = w('tas');
const hut = w('hut'), bus = w('bus'), bad = w('bad'), kar = w('kar'), bel = w('bel'), blok = w('blok');
const weg = w('weg'), wol = w('wol'), web = w('web'), jas = w('jas'), was = w('was');
const bed = w('bed'), bos = w('bos'), mol = w('mol'), lam = w('lam'), dag = w('dag', true), dak = w('dak'), hak = w('hak');
const maan = w('maan'), aap = w('aap'), kaas = w('kaas'), raam = w('raam'), vaas = w('vaas'), roos = w('roos');
const noot = w('noot'), oog = w('oog'), oor = w('oor'), doos = w('doos'), boom = w('boom'), haan = w('haan');
const teen = w('teen'), een = w('een', true), been = w('been'), beer = w('beer'), peer = w('peer'), heet = w('heet', true);
const zee = w('zee'), zeep = w('zeep'), vuur = w('vuur'), weeg = w('weeg'), fee = w('fee'), veer = w('veer');
const poes = w('poes'), koek = w('koek'), boek = w('boek'), hoed = w('hoed'), soep = w('soep'), koe = w('koe');
const voet = w('voet'), riem = w('riem'), mier = w('mier'), wiel = w('wiel'), gier = w('gier'), riet = w('riet');
const hand = w('hand'), tand = w('tand'), mond = w('mond'), hond = w('hond'), tent = w('tent'), lamp = w('lamp');
const melk = w('melk'), jurk = w('jurk'), kast = w('kast'), tulp = w('tulp'), hart = w('hart'), verf = w('verf');
const bril = w('bril'), klok = w('klok'), slak = w('slak'), vlag = w('vlag'), blad = w('blad'), krab = w('krab');
const spin = w('spin'), ster = w('ster'), fles = w('fles'), strik = w('strik'), plant = w('plant'), kwast = w('kwast');
const kroon = w('kroon'), brood = w('brood'), kaars = w('kaars'), taart = w('taart'), paard = w('paard'), bloem = w('bloem');
const stoel = w('stoel'), broek = w('broek'), eend = w('eend'), fiets = w('fiets'), droog = w('droog', true), slee = w('slee');
const kikker = w('kikker'), ladder = w('ladder'), emmer = w('emmer'), appel = w('appel'), trommel = w('trommel'), puzzel = w('puzzel');
const knuffel = w('knuffel'), wortel = w('wortel'), varken = w('varken'), potlood = w('potlood'), kalkoen = w('kalkoen'), dobbelsteen = w('dobbelsteen');
const vogel = w('vogel'), hamer = w('hamer'), banaan = w('banaan'), tomaat = w('tomaat'), lepel = w('lepel'), ezel = w('ezel');
const oma = w('oma'), molen = w('molen'), piano = w('piano'), radio = w('radio'), egel = w('egel'), kegel = w('kegel');
const ring = w('ring'), slang = w('slang'), tong = w('tong'), zing = w('zing'), bank = w('bank'), vinger = w('vinger');
const ketting = w('ketting'), engel = w('engel'), koning = w('koning'), honing = w('honing'), tekening = w('tekening'), koningin = w('koningin');
const buik = w('buik'), muis = w('muis'), huis = w('huis'), ui = w('ui'), neus = w('neus'), deur = w('deur');
const reus = w('reus'), hout = w('hout'), kous = w('kous'), zout = w('zout'), duim = w('duim'), pauw = w('pauw');
const geit = w('geit'), ei = w('ei'), bij = w('bij'), ijs = w('ijs'), bijl = w('bijl'), pijl = w('pijl');
const trein = w('trein'), konijn = w('konijn'), tijger = w('tijger'), krijtje = w('krijtje'), aardbei = w('aardbei'), kijk = w('kijk', true);
const schoen = w('schoen'), schaap = w('schaap'), schip = w('schip'), schaar = w('schaar'), schelp = w('schelp'), school = w('school');
const schildpad = w('schildpad'), nacht = w('nacht'), douche = w('douche'), schaats = w('schaats'), schuim = w('schuim'), schommel = w('schommel');
const haai = w('haai'), kooi = w('kooi'), boei = w('boei'), leeuw = w('leeuw'), sneeuw = w('sneeuw'), touw = w('touw');
const vrouw = w('vrouw'), sneeuwpop = w('sneeuwpop'), papegaai = w('papegaai'), kraai = w('kraai'), meeuw = w('meeuw'), zwaai = w('zwaai', true);
const zon = w('zon'), wind = w('wind'), wolk = w('wolk'), regen = w('regen'), koud = w('koud', true), nat = w('nat', true);
const regenboog = w('regenboog'), paraplu = w('paraplu'), onweer = w('onweer'), bliksem = w('bliksem'), hagel = w('hagel', true), storm = w('storm');
const olifant = w('olifant'), zebra = w('zebra'), giraf = w('giraf'), panda = w('panda'), kameel = w('kameel'), krokodil = w('krokodil');
const flamingo = w('flamingo'), kangoeroe = w('kangoeroe'), nijlpaard = w('nijlpaard'), neushoorn = w('neushoorn'), zeehond = w('zeehond'), dolfijn = w('dolfijn');
const ambulance = w('ambulance'), helikopter = w('helikopter'), auto = w('auto'), brandweerauto = w('brandweerauto'), vliegtuig = w('vliegtuig'), taxi = w('taxi');
const motor = w('motor'), tractor = w('tractor'), raket = w('raket'), tram = w('tram'), boot = w('boot'), vrachtwagen = w('vrachtwagen');
const vlieger = w('vlieger'), gitaar = w('gitaar'), robot = w('robot'), pakje = w('pakje'), voetbal = w('voetbal'), ballon = w('ballon');
const kerstboom = w('kerstboom'), kerstman = w('kerstman'), rendier = w('rendier'), step = w('step'), hulst = w('hulst'), muts = w('muts');
const kopje = w('kopje'), spiegel = w('spiegel'), telefoon = w('telefoon'), tandenborstel = w('tandenborstel'), eiland = w('eiland'), sleutel = w('sleutel');
const sinaasappel = w('sinaasappel'), lieveheersbeestje = w('lieveheersbeestje'), vuilnisbak = w('vuilnisbak'), paddenstoel = w('paddenstoel'), vrolijk = w('vrolijk', true), ijsbeer = w('ijsbeer');
const bomen = w('bomen'), jassen = w('jassen'), schoenen = w('schoenen'), blokken = w('blokken'), sokken = w('sokken'), boeken = w('boeken');
const katten = w('katten'), kippen = w('kippen'), ballen = w('ballen'), huizen = w('huizen'), apen = w('apen'), benen = w('benen');
const uil = w('uil'), duif = w('duif'), trui = w('trui'), fruit = w('fruit'), tuin = w('tuin'), wolf = w('wolf');
const kers = w('kers'), gras = w('gras'), kerk = w('kerk'), kraan = w('kraan'), vlieg = w('vlieg'), zwaan = w('zwaan');
const arm = w('arm'), gans = w('gans'), krant = w('krant'), spons = w('spons'), laars = w('laars'), spook = w('spook');
const sla = w('sla'), ski = w('ski'), baard = w('baard'), berg = w('berg'), mais = w('mais'), aan = w('aan', true);

// Het eerste getal is de id (lezen-NN, daar hangt de voortgang aan) en verandert nooit.
// Het nummer op het scherm (volgnummer) volgt de volgorde van deze lijst, zodat een
// nieuw hoofdstuk op de juiste moeilijkheidsplek kan zonder dat sterren verschuiven.
export const LEZEN_HOOFDSTUKKEN: Kern[] = [
  hoofdstuk(1, 'Kip en vis', ['m', 's', 'v', 'r', 'k', 'p', 'n', 't', 'i', 'o', 'e'],
    [vis, sok, pen, kip, vos, pet, pot, ik, en, kom, mes, kok], [
      zin('In de vijver zwemt een ___.', vis, sok, kip),
      zin('Aan mijn voet zit een ___.', sok, pen, pot),
      zin('Ik schrijf mijn naam met een ___.', pen, mes, pot),
      zin('De ___ legt een ei.', kip, vos, kok),
      zin('Papa ___ mama gaan samen naar de winkel.', en, ik, pet),
      zin('Ik kijk in de spiegel. Daar ben ___!', ik, en, vos),
      zin('De soep zit in de ___.', pot, kom, pen),
      zin('Snijd het brood met een ___.', mes, pen, pot),
    ]),
  hoofdstuk(2, 'Kat en bal', ['a', 'u', 'b', 'd', 'h', 'l'],
    [kat, tak, ram, bal, das, tas, hut, bus, bad, kar, bel, blok], [
      zin('De ___ speelt met een bolletje wol.', kat, ram, das),
      zin('De vogel zit in de boom op een ___.', tak, hut, bal),
      zin('Ik schop tegen de ___.', bal, bel, blok),
      zin('Van takken en een deken bouw ik een ___.', hut, tas, bus),
      zin('We gaan naar school in de ___.', bus, kar, hut),
      zin('Ik doe water in het ___.', bad, bal, tas),
    ]),
  hoofdstuk(3, 'Jas en bed', ['w', 'j', 'z', 'g'],
    [weg, wol, web, jas, was, bed, bos, mol, lam, dag, dak, hak], [
      zin('De auto rijdt over de ___.', weg, bos, dak),
      zin('Doe je ___ aan, het regent.', jas, wol, hak),
      zin('In het ___ staan heel veel bomen.', bos, weg, bed),
      zin('Ik slaap in mijn ___.', bed, jas, dak),
      zin('De spin maakt een ___.', web, wol, was),
      zin('De ___ komt uit zijn hoop.', mol, lam, jas),
    ]),
  hoofdstuk(4, 'Maan en roos', ['aa', 'oo'],
    [maan, aap, kaas, raam, vaas, roos, noot, oog, oor, doos, boom, haan], [
      zin("'s Avonds schijnt de ___ aan de hemel.", maan, roos, boom),
      zin('In de tuin bloeit een rode ___.', roos, maan, vaas),
      zin('Jip kijkt naar buiten door het ___.', raam, oor, doos),
      zin('De bloemen staan in de ___.', vaas, raam, doos),
      zin('Het cadeau zit in een grote ___.', doos, vaas, kaas),
      zin('De ___ kraait in de ochtend.', haan, aap, boom),
    ]),
  hoofdstuk(5, 'Beer en zee', ['ee', 'uu', 'f'],
    [teen, een, been, beer, peer, heet, zee, zeep, vuur, weeg, fee, veer], [
      zin('Ik heb ___ neus en twee ogen.', een, teen, beer),
      zin('Aan mijn voet zit een grote ___.', teen, been, veer),
      zin('Pas op, de soep is nog ___!', heet, zee, vuur),
      zin('Ik was mijn handen met ___.', zeep, zee, peer),
      zin('Pas op! Het ___ is heel heet.', vuur, zee, beer),
      zin('De ___ woont in een kasteel in het bos.', fee, beer, veer),
    ]),
  hoofdstuk(6, 'Poes en koek', ['oe', 'ie'],
    [poes, koek, boek, hoed, soep, koe, voet, riem, mier, wiel, gier, riet], [
      zin('De ___ speelt met een bolletje wol.', poes, koe, mier),
      zin('Bij de thee eet ik een ___.', koek, soep, boek),
      zin('Ik lees in een ___.', boek, koek, hoed),
      zin('De ___ geeft melk en eet gras.', koe, poes, gier),
      zin('Mijn broek zakt af. Ik doe een ___ om.', riem, hoed, wiel),
      zin('Aan het water groeit ___.', riet, wiel, boek),
    ]),
  hoofdstuk(7, 'Hand en lamp', ['nd', 'nt', 'mp', 'lk', 'rk', 'lp', 'rt', 'rf'],
    [hand, tand, mond, hond, tent, lamp, melk, jurk, kast, tulp, hart, verf], [
      zin('Ik zwaai met mijn ___.', hand, tand, lamp),
      zin('De ___ blaft naar de postbode.', hond, hand, hart),
      zin('Doe de ___ maar aan, het is donker.', lamp, tent, kast),
      zin('Ik drink een glas ___.', melk, verf, tand),
      zin('In de tuin staat een rode ___.', tulp, lamp, jurk),
      zin('De kleren hangen in de ___.', kast, tent, lamp),
    ]),
  hoofdstuk(8, 'Klok en slak', ['bl', 'br', 'fl', 'kl', 'kr', 'pl', 'sl', 'sp', 'st'],
    [bril, klok, slak, vlag, blad, krab, spin, ster, fles, strik, plant, kwast], [
      zin('Ik kijk op de ___ hoe laat het is.', klok, ster, fles),
      zin('De ___ heeft een huisje op haar rug.', slak, spin, krab),
      zin('Met een ___ zie ik beter.', bril, strik, blad),
      zin('De ___ maakt een web.', spin, slak, krab),
      zin("'s Avonds twinkelt een ___ aan de hemel.", ster, klok, vlag),
      zin('Ik schilder de muur met een ___.', kwast, fles, blad),
    ]),
  hoofdstuk(9, 'Kroon en fiets', ['cluster-lang'],
    [kroon, brood, kaars, taart, paard, bloem, stoel, broek, eend, fiets, droog, slee], [
      zin('De koning zet een ___ op.', kroon, kaars, stoel),
      zin('Bij het ontbijt eet ik een sneetje ___.', brood, taart, bloem),
      zin('Op mijn verjaardag is er een ___.', taart, brood, kroon),
      zin('Ik ga naar school op de ___.', fiets, slee, stoel),
      zin('De was is ___. Hij kan de kast in.', droog, bloem, broek),
      zin('In de sloot zwemt een ___.', eend, paard, bloem),
    ]),
  hoofdstuk(24, 'Laars en krant', [],
    [laars, krant, gans, arm, spons, spook, sla, ski, baard, berg, mais, aan], [
      zin('Het regent. Ik trek mijn ___ aan.', laars, krant, spook),
      zin('Opa leest het nieuws in de ___.', krant, berg, sla),
      zin('Op de boerderij snatert een grote ___.', gans, spons, baard),
      zin('Ik til de tas op met mijn ___.', arm, ski, mais),
      zin('Ik was de auto met een ___.', spons, gans, berg),
      zin('Met een laken over je hoofd ben je een ___.', spook, laars, krant),
      zin('Bij het eten krijg ik ___ met tomaat.', sla, arm, ski),
      zin('Ik glij de besneeuwde berg af op een ___.', ski, spons, baard),
      zin('Opa heeft een lange grijze ___.', baard, mais, laars),
      zin('We klimmen helemaal naar de top van de ___.', berg, gans, spook),
      zin('De kip pikt de gele korrels ___.', mais, arm, krant),
      zin('Het is donker. Doe het licht maar ___.', aan, ski, sla),
    ]),
  hoofdstuk(10, 'Kikker en ladder', ['kk', 'dd', 'mm', 'pp', 'll'],
    [kikker, ladder, emmer, appel, trommel, puzzel, knuffel, wortel, varken, potlood, kalkoen, dobbelsteen], [
      zin('De ___ springt in de sloot: kwak!', kikker, varken, kalkoen),
      zin('Ik klim naar boven via de ___.', ladder, emmer, puzzel),
      zin('Ik vul de ___ met water.', emmer, appel, wortel),
      zin('Het konijn eet een ___.', wortel, appel, emmer),
      zin('Ik teken met een ___.', potlood, trommel, puzzel),
      zin('In bed slaap ik met mijn zachte ___.', knuffel, puzzel, wortel),
    ]),
  hoofdstuk(11, 'Vogel en molen', ['open'],
    [vogel, hamer, banaan, tomaat, lepel, ezel, oma, molen, piano, radio, egel, kegel], [
      zin('De ___ vliegt over het veld.', vogel, ezel, egel),
      zin('Op de polder staat een ___.', molen, piano, radio),
      zin('___ woont in een huis met een tuin.', oma, ezel, vogel),
      zin('Ik eet een gele ___.', banaan, tomaat, lepel),
      zin('De ___ heeft stekels op zijn rug.', egel, ezel, kegel),
      zin('Met een ___ sla ik de spijker in.', hamer, lepel, kegel),
    ]),
  hoofdstuk(12, 'Bank en ketting', ['ng', 'nk'],
    [ring, slang, tong, zing, bank, vinger, ketting, engel, koning, honing, tekening, koningin], [
      zin('Ik ___ een liedje voor oma.', zing, ring, bank),
      zin('De ___ zit op haar troon.', koningin, koning, engel),
      zin('Ik zit op de ___ voor de tv.', bank, ring, slang),
      zin('Om mijn nek hangt een ___.', ketting, ring, vinger),
      zin('De bijen maken ___.', honing, slang, bank),
      zin('Ik maak een ___ van de kat.', tekening, ketting, tong),
    ]),
  hoofdstuk(13, 'Muis in huis', ['ui', 'eu', 'ou', 'au'],
    [buik, muis, huis, ui, neus, deur, reus, hout, kous, zout, duim, pauw], [
      zin('De ___ piept en eet een stukje kaas.', muis, huis, reus),
      zin('Na school ga ik naar ___.', huis, muis, deur),
      zin('De ___ is heel groot en sterk.', reus, muis, pauw),
      zin('Met mijn ___ kan ik ruiken.', neus, deur, duim),
      zin('Doe de ___ maar dicht.', deur, huis, kous),
      zin('De ___ zet zijn staart open, vol mooie kleuren.', pauw, muis, reus),
    ]),
  hoofdstuk(14, 'Geit en trein', ['ei', 'ij'],
    [geit, ei, bij, ijs, bijl, pijl, trein, konijn, tijger, krijtje, aardbei, kijk], [
      zin('De ___ geeft melk en eet gras.', geit, bij, konijn),
      zin('De kip legt een ___.', ei, ijs, bij),
      zin('Het is warm. Ik lik aan een ___.', ijs, ei, bijl),
      zin('We reizen met de ___.', trein, pijl, geit),
      zin('Het ___ eet een wortel.', konijn, tijger, geit),
      zin('Ik schrijf op het bord met een ___.', krijtje, pijl, bijl),
    ]),
  hoofdstuk(15, 'Schoen en schaap', ['sch', 'ch'],
    [schoen, schaap, schip, schaar, schelp, school, schildpad, nacht, douche, schaats, schuim, schommel], [
      zin('Aan mijn voet zit een ___.', schoen, schaap, schelp),
      zin('Het ___ loopt in de wei en zegt méé.', schaap, schip, school),
      zin('Ik knip papier met een ___.', schaar, schoen, schelp),
      zin('Overdag speel ik, ___ slaap ik.', nacht, school, douche),
      zin('Op het ijs ga ik ___.', schaats, schommel, schip),
      zin('In de tuin mag ik op de ___.', schommel, school, schoen),
    ]),
  hoofdstuk(16, 'Leeuw en haai', ['aai', 'ooi', 'oei', 'eeuw', 'ieuw', 'uw'],
    [haai, kooi, boei, leeuw, sneeuw, touw, vrouw, sneeuwpop, papegaai, kraai, meeuw, zwaai], [
      zin('De ___ zwemt in de zee en heeft scherpe tanden.', haai, leeuw, meeuw),
      zin('De vogel zit in een ___.', kooi, boei, touw),
      zin('De ___ brult hard in de savanne.', leeuw, haai, kraai),
      zin('Alles is wit, want er ligt ___.', sneeuw, touw, kooi),
      zin('Van sneeuw maak ik een ___.', sneeuwpop, vrouw, papegaai),
      zin('De ___ zegt: dag, dag!', papegaai, kraai, meeuw),
    ]),
  hoofdstuk(17, 'Het weer', [],
    [zon, wind, wolk, regen, koud, nat, regenboog, paraplu, onweer, bliksem, hagel, storm], [
      zin('De ___ schijnt en het is lekker warm.', zon, wolk, regen),
      zin('De ___ blaast mijn pet van mijn hoofd.', wind, zon, wolk),
      zin('Het regent. Neem je ___ mee!', paraplu, regenboog, zon),
      zin('Na de regen staat er een ___ in de lucht, met alle kleuren.', regenboog, paraplu, wolk),
      zin('In de winter is het buiten ___.', koud, zon, wolk),
      zin('Ik speel buiten in de regen. Nu ben ik helemaal ___.', nat, koud, zon),
      zin('Het flitst en het rommelt. Het is ___.', onweer, hagel, storm),
      zin('Er vallen kleine balletjes ijs uit de lucht. Dat is ___.', hagel, regen, storm),
    ]),
  hoofdstuk(18, 'In de dierentuin', [],
    [olifant, zebra, giraf, panda, kameel, krokodil, flamingo, kangoeroe, nijlpaard, neushoorn, zeehond, dolfijn], [
      zin('De ___ heeft een slurf.', olifant, zebra, giraf),
      zin('De ___ heeft een lange nek.', giraf, olifant, panda),
      zin('De ___ heeft strepen.', zebra, panda, kameel),
      zin('De ___ leeft in het water en op het land.', krokodil, dolfijn, zeehond),
      zin('De ___ is roze en staat op één poot.', flamingo, panda, giraf),
      zin('De ___ zwemt in de zee en is slim.', dolfijn, zeehond, nijlpaard),
    ]),
  hoofdstuk(19, 'Op weg', [],
    [ambulance, helikopter, auto, brandweerauto, vliegtuig, taxi, motor, tractor, raket, tram, boot, vrachtwagen], [
      zin('Als je ziek bent komt de ___.', ambulance, taxi, tram),
      zin('De ___ vliegt in de lucht.', helikopter, tractor, boot),
      zin('We gaan op vakantie in de ___.', auto, raket, tram),
      zin('De ___ gaat naar de maan.', raket, tram, boot),
      zin('Op het water vaart een ___.', boot, auto, tractor),
      zin('De boer rijdt op de ___.', tractor, taxi, motor),
    ]),
  hoofdstuk(20, 'Speelgoed en feest', [],
    [vlieger, gitaar, robot, pakje, voetbal, ballon, kerstboom, kerstman, rendier, step, hulst, muts], [
      zin('Het waait. Ik laat mijn ___ hoog in de lucht vliegen.', vlieger, ballon, step),
      zin('Op mijn feestje hangt een rode ___.', ballon, pakje, muts),
      zin('Met kerst staat er een ___ in de kamer.', kerstboom, kerstman, hulst),
      zin('Ik schop tegen de ___.', voetbal, step, robot),
      zin('Ik speel een liedje op de ___.', gitaar, robot, step),
      zin('In december komt de ___ met cadeautjes.', kerstman, rendier, robot),
    ]),
  hoofdstuk(21, 'Lange woorden', [],
    [kopje, spiegel, telefoon, tandenborstel, eiland, sleutel, sinaasappel, lieveheersbeestje, vuilnisbak, paddenstoel, vrolijk, ijsbeer], [
      zin('Ik drink thee uit een ___.', kopje, sleutel, spiegel),
      zin('Ik kijk in de ___. Daar ben ik!', spiegel, telefoon, kopje),
      zin('Oma woont op een ___ in zee.', eiland, vuilnisbak, paddenstoel),
      zin('Het ___ is rood met zwarte stippen.', lieveheersbeestje, ijsbeer, paddenstoel),
      zin('Ik ben jarig. Ik voel me ___.', vrolijk, eiland, kopje),
      zin('De ___ woont op het ijs.', ijsbeer, paddenstoel, lieveheersbeestje),
    ]),
  hoofdstuk(22, 'Een of meer', ['en'],
    [bomen, jassen, schoenen, blokken, sokken, boeken, katten, kippen, ballen, huizen, apen, benen], [
      zin('In het bos staan veel ___.', bomen, huizen, apen),
      zin('Doe je ___ aan, het regent.', jassen, sokken, schoenen),
      zin('Aan mijn voeten zitten twee ___.', schoenen, sokken, benen),
      zin('Ik bouw een toren van ___.', blokken, boeken, ballen),
      zin('De ___ liggen te slapen in de mand.', katten, kippen, apen),
      zin('In de straat staan drie ___.', huizen, bomen, boeken),
    ]),
  hoofdstuk(23, 'Nog meer woorden', [],
    [uil, duif, trui, fruit, tuin, wolf, kers, gras, kerk, kraan, vlieg, zwaan], [
      zin("'s Nachts roept de ___ oehoe.", uil, duif, wolf),
      zin('Op het plein pikt een ___ broodkruimels.', duif, uil, zwaan),
      zin('Doe je ___ aan, het is koud.', trui, tuin, kers),
      zin('In de schaal ligt lekker ___.', fruit, gras, kers),
      zin('Achter het huis ligt een ___.', tuin, kerk, trui),
      zin('De ___ huilt in het bos.', wolf, uil, zwaan),
    ]),
].map((kern, i) => ({ ...kern, volgnummer: i + 1 }));
