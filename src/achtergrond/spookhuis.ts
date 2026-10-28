import type { Decor } from './achtergrond.ts';
import { bewegingStil, el, kortAan, maakTimers, plaatje, svgUitTekst } from './hulp.ts';
import { kies } from '../engine/toeval.ts';
import { BOOM, HEUVEL, HUIS, MAAN, VERTE, VLEERMUIS, VOORGROND, hek } from './spookhuis-tekening.ts';

// Spookhuis: een vriendelijk griezelig huis rechts op een heuvel, onder een grote volle
// maan waar dunne wolkjes langzaam voor langs drijven. Links een kromme kale boom met mos
// die in de wind kraakt (soms een windvlaag met dwarrelende blaadjes), met een schommel
// en een uil. In het huis flakkert het licht, schommelt een stoel, kijkt een schilderij
// heen en weer, zweeft een spookje langs het raam en knipperen ogen in de donkere
// dakkapel. Af en toe gaat de voordeur op een kier en gluurt er een spookje om het hoekje.
// In de lucht: steeds één ding tegelijk, een spook dat overzweeft, een zwermpje
// vleermuizen of een spookje uit de schoorsteen. Een spinnetje zakt soms aan een draad.
// Goed antwoord: de ramen lichten op, een spook zegt "Boe!" boven het dak en de
// pompoenen springen. Feest: spookjes vliegen uit alle ramen de lucht in.

const SPOOK = 'assets/images/woorden/spook.svg';
const POMPOEN = 'assets/icons/avatar-pompoen.svg';
const UIL = 'assets/images/woorden/uil.svg';
const SPIN = 'assets/images/woorden/spin.svg';
// Wie er om de voordeur gluurt (gespiegeld, zodat ze naar de kier kijken).
const GLUURDERS = [SPOOK, SPOOK, 'assets/images/woorden/kat.svg', UIL, POMPOEN, 'assets/images/woorden/vleermuis.svg', 'assets/achtergrond/spookhuis-schedel.svg'];

// Waar de ramen zitten, als deel van de tekening (viewBox 0 -62 400 512): daar komen de
// spookjes van het feest uit.
const RAMEN: [number, number][] = [[130, 140], [270, 140], [119, 238], [200, 240], [281, 238], [116, 357], [284, 357], [200, 390]];
const HUIS_VB = { x: 0, y: -62, b: 400, h: 512 };

export function maakSpookhuisDecor(): Decor {
  const root = el('div', 'decor decor-spookhuis');
  const stil = bewegingStil();
  const timers = maakTimers();

  const sterren = el('div', 'sh-sterren', root);
  for (let i = 0; i < 34; i++) {
    const s = el('div', 'sh-ster', sterren);
    s.style.left = `${Math.random() * 100}%`;
    s.style.top = `${Math.random() * 100}%`;
    s.style.animationDelay = `${(-Math.random() * 5).toFixed(2)}s`;
    if (i % 4 === 0) s.classList.add('sh-ster--groot');
  }
  const maan = el('div', 'sh-maan', root);
  svgUitTekst(MAAN, 'sh-maan__svg', maan);
  // Dunne sliertwolkjes, elk uit een paar lange strepen; ze staan al in de lucht als het
  // decor verschijnt (negatieve vertraging).
  for (let i = 0; i < 5; i++) {
    const w = el('div', `sh-wolk sh-wolk--${i + 1}`, root);
    for (let j = 0; j < 3; j++) el('div', 'sh-wolk__sliert', w);
  }
  const lucht = el('div', 'sh-lucht', root);

  svgUitTekst(VERTE, 'sh-verte', root);
  el('div', 'sh-mist sh-mist--achter', root);
  svgUitTekst(HEUVEL, 'sh-heuvel', root);

  // Het huis. Wat achter het huis vandaan komt (het boe-spook, het schoorsteenspookje)
  // staat ervóór in de DOM.
  const huis = el('div', 'sh-huis', root);
  const boe = el('div', 'sh-boe', huis);
  plaatje(SPOOK, 'sh-boe__spook', boe);
  el('div', 'sh-ballon sh-boe__tekst', boe).textContent = 'Boe!';
  const schoorsteen = el('div', 'sh-schoorsteenspook', huis);
  plaatje(SPOOK, 'sh-schoorsteenspook__img', schoorsteen);
  const huisSvg = svgUitTekst(HUIS, 'sh-huis__svg', huis);
  huisSvg.querySelectorAll<SVGElement>('.sh-raamlicht').forEach((r, i) => {
    r.style.animationDelay = `${(-i * 1.7).toFixed(1)}s`;
    r.style.animationDuration = `${(5 + (i % 3) * 1.6).toFixed(1)}s`;
  });
  const gluurder = huisSvg.querySelector('.sh-gluurder__beeld')!;
  gluurder.setAttribute('href', SPOOK);
  svgUitTekst(hek(12, 3), 'sh-hek', huis);
  // Warm licht uit de deur op de grond, en rookslierten uit de schoorsteen.
  el('div', 'sh-deurlicht', huis);
  for (let i = 0; i < 3; i++) el('div', `sh-rook sh-rook--${i + 1}`, huis);
  // Een randje heuvel vóór de voet van het huis, zodat het er echt op staat.
  el('div', 'sh-huisvoet', huis);
  const pompoenen = [1, 2, 3].map((n) => {
    const p = el('div', `sh-pompoen sh-pompoen--${n}`, huis);
    plaatje(POMPOEN, 'sh-pompoen__img', p);
    return p;
  });

  // De boom, met de uil op een tak (zwaait mee).
  const boomVak = el('div', 'sh-boomvak', root);
  const boom = svgUitTekst(BOOM, 'sh-boom__svg', boomVak);
  boom.querySelector('.sh-tak--uil')?.insertAdjacentHTML(
    'beforeend',
    `<image href="${UIL}" x="194" y="92" width="48" height="48" class="sh-uil"/>`,
  );
  const uil = boom.querySelector('.sh-uil')!;
  const oehoe = el('div', 'sh-ballon sh-oehoe', boomVak);
  oehoe.textContent = 'Oehoe!';
  const pompoenBoom = el('div', 'sh-pompoen sh-pompoen--boom', boomVak);
  plaatje(POMPOEN, 'sh-pompoen__img', pompoenBoom);
  pompoenen.push(pompoenBoom);

  svgUitTekst(VOORGROND, 'sh-voorgrond', root);
  svgUitTekst(hek(9, 17), 'sh-hek sh-hek--voor', root);
  el('div', 'sh-mist sh-mist--voor', root);

  // Dwaallichtjes: zachte groengele lichtjes die laag boven de grond zweven.
  for (let i = 0; i < 9; i++) {
    const l = el('div', 'sh-dwaallicht', root);
    l.style.left = `${3 + Math.random() * 94}%`;
    l.style.bottom = `${4 + Math.random() * 22}vh`;
    l.style.animationDelay = `${(-Math.random() * 9).toFixed(2)}s`;
    l.style.animationDuration = `${(7 + Math.random() * 5).toFixed(2)}s`;
  }

  const spin = el('div', 'sh-spin', root);
  el('div', 'sh-spin__draad', spin);
  plaatje(SPIN, 'sh-spin__img', spin);

  // ---- In de lucht: steeds één ding tegelijk ----
  const spookOver = () => {
    const naarRechts = Math.random() < 0.5;
    const duur = 20000 + Math.random() * 8000;
    const s = el('div', 'sh-spook', lucht);
    s.style.top = `${8 + Math.random() * 28}%`;
    s.style.setProperty('--van', naarRechts ? '-12vw' : '104vw');
    s.style.setProperty('--naar', naarRechts ? '104vw' : '-12vw');
    s.style.animationDuration = `${duur}ms`;
    const zweef = el('div', 'sh-spook__zweef', s);
    const img = plaatje(SPOOK, 'sh-spook__img', zweef);
    if (naarRechts) img.classList.add('gespiegeld');
    timers.later(() => s.remove(), duur);
    return duur;
  };
  const vleermuizen = (aantal = 3 + Math.floor(Math.random() * 3)) => {
    const naarRechts = Math.random() < 0.5;
    const duur = 9000 + Math.random() * 3000;
    const hoogte = 6 + Math.random() * 26;
    for (let i = 0; i < aantal; i++) {
      const v = el('div', 'sh-vleermuis', lucht);
      v.style.top = `${hoogte + (Math.random() - 0.5) * 12}%`;
      v.style.setProperty('--van', naarRechts ? '-8vw' : '104vw');
      v.style.setProperty('--naar', naarRechts ? '104vw' : '-8vw');
      v.style.animationDuration = `${duur}ms`;
      v.style.animationDelay = `${i * 380 + Math.random() * 300}ms`;
      const golf = el('div', 'sh-vleermuis__golf', v);
      golf.style.animationDelay = `${(-Math.random() * 2).toFixed(2)}s`;
      svgUitTekst(VLEERMUIS, 'sh-vleermuis__svg', golf);
      timers.later(() => v.remove(), duur + i * 700);
    }
    return duur + aantal * 500;
  };
  const uitSchoorsteen = () => {
    kortAan(schoorsteen, 'stijgt', 7200);
    return 7200;
  };
  const lucht_ = () => {
    const r = Math.random();
    const duur = r < 0.5 ? spookOver() : r < 0.8 ? vleermuizen() : uitSchoorsteen();
    timers.zet('lucht', lucht_, duur + 5000 + Math.random() * 9000);
  };

  // ---- Het huis en de boom ----
  const gluur = () => {
    gluurder.setAttribute('href', kies(GLUURDERS));
    huis.classList.add('gluurt');
    timers.later(() => huis.classList.remove('gluurt'), 5200);
    timers.zet('deur', gluur, 16000 + Math.random() * 16000);
  };
  const roep = () => {
    kortAan(oehoe, 'zegt', 2200);
    kortAan(uil, 'roept', 2200);
  };
  const uilPlanner = () => {
    roep();
    timers.zet('uil', uilPlanner, 30000 + Math.random() * 25000);
  };
  const windvlaag = () => {
    kortAan(boomVak, 'windvlaag', 4200);
    root.classList.add('waait');
    timers.later(() => root.classList.remove('waait'), 4200);
    for (let i = 0; i < 5; i++) {
      const b = el('div', 'sh-blad', root);
      b.style.top = `${30 + Math.random() * 40}%`;
      b.style.animationDelay = `${i * 260}ms`;
      b.style.setProperty('--draai', `${Math.round(360 + Math.random() * 540)}deg`);
      timers.later(() => b.remove(), 5200 + i * 260);
    }
    timers.zet('wind', windvlaag, 24000 + Math.random() * 20000);
  };
  const spinPlanner = () => {
    spin.style.left = `${18 + Math.random() * 18}%`;
    kortAan(spin, 'zakt', 11000);
    timers.zet('spin', spinPlanner, 28000 + Math.random() * 26000);
  };

  // Af en toe een vallend sterretje hoog in de lucht.
  const valster = () => {
    const v = el('div', 'valster', sterren);
    v.style.left = `${8 + Math.random() * 60}%`;
    v.style.top = `${4 + Math.random() * 40}%`;
    timers.later(() => v.remove(), 1400);
    timers.zet('valster', valster, 9000 + Math.random() * 14000);
  };

  if (!stil) {
    timers.zet('valster', valster, 7000);
    timers.zet('lucht', lucht_, 2500);
    timers.zet('deur', gluur, 6000);
    timers.zet('uil', uilPlanner, 12000);
    timers.zet('wind', windvlaag, 15000);
    timers.zet('spin', spinPlanner, 9000);
  }

  const juich = () => {
    kortAan(huis, 'juicht', 1600);
    kortAan(boe, 'boe', 1700);
    pompoenen.forEach((p, i) => timers.later(() => kortAan(p, 'springt', 700), i * 120));
    if (Math.random() < 0.3) roep();
  };

  const feest = () => {
    juich();
    const vak = huisSvg.getBoundingClientRect();
    const decorVak = root.getBoundingClientRect();
    if (vak.width) {
      RAMEN.forEach(([x, y], i) => {
        const s = el('div', 'sh-feestspook', root);
        s.style.left = `${vak.left - decorVak.left + ((x - HUIS_VB.x) / HUIS_VB.b) * vak.width}px`;
        s.style.top = `${vak.top - decorVak.top + ((y - HUIS_VB.y) / HUIS_VB.h) * vak.height}px`;
        s.style.setProperty('--dx', `${Math.round(-34 - Math.random() * 30)}vw`);
        s.style.setProperty('--dy', `${Math.round(-30 - Math.random() * 40)}vh`);
        s.style.animationDelay = `${i * 220}ms`;
        plaatje(SPOOK, 'sh-feestspook__img', el('div', 'sh-feestspook__zweef', s));
        timers.later(() => s.remove(), 6000 + i * 220);
      });
    }
    if (!stil) timers.later(() => vleermuizen(6), 600);
  };

  return { element: root, juich, feest, vernietig: timers.stop };
}
