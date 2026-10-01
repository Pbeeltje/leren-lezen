import type { Screen, ScreenManager } from '../../engine/screenManager.ts';
import type { Boekje } from '../../content/boekjes/boekjes.ts';
import { paginaAudioPad, woordenVan } from '../../content/boekjes/boekjes.ts';
import { maakTerugKnop } from '../components/TerugKnop.ts';
import { maakTopRechtsBalk } from '../components/TopRechtsBalk.ts';
import { maakAudioKnop } from '../components/AudioKnop.ts';
import { toonKlaarKaart } from '../components/KlaarKaart.ts';
import { speelAf, stopAudio, woordAudioPad } from '../../engine/audioManager.ts';
import { isOpgenomen } from '../../engine/opnames.ts';
import { voegMuntenToe } from '../../engine/progressStore.ts';
import { MUNTEN_OEFENING_GOED } from '../../engine/rewards.ts';

// Eén leesboekje, pagina voor pagina. Het kind leest zelf: er wordt nooit vanzelf
// voorgelezen (de eigenaar: "het kind moet het toch zelf lezen"). Tik op een woord en je
// hoort het; de luidsprekerknop leest de hele bladzijde voor, maar alleen als het kind
// erop drukt. Uitgelezen = klaar-kaart.
export function BoekjeScreen(manager: ScreenManager, boekje: Boekje): Screen {
  const el = document.createElement('div');
  el.className = 'scherm boekje-scherm';

  const titel = document.createElement('h1');
  titel.className = 'scherm-titel';
  titel.textContent = boekje.titel;
  el.appendChild(titel);

  const container = document.createElement('div');
  container.className = 'boekje-container';
  el.appendChild(container);

  let pagina = 0;

  function toonPagina(richting: 1 | -1 | 0): void {
    stopAudio();
    container.replaceChildren();
    const p = boekje.paginas[pagina];

    const kaart = document.createElement('div');
    kaart.className = 'oefen-kaart boekje-pagina';
    if (richting) kaart.classList.add(richting > 0 ? 'boekje-pagina--vooruit' : 'boekje-pagina--terug');

    const audio = paginaAudioPad(boekje, pagina);
    if (isOpgenomen(audio)) {
      const lees = maakAudioKnop(() => speelAf(audio));
      lees.classList.add('boekje-voorlees');
      kaart.appendChild(lees);
    }

    const plaatjes = document.createElement('div');
    plaatjes.className = `boekje-plaatjes boekje-plaatjes--${p.plaatjes.length}`;
    for (const src of p.plaatjes) {
      const img = document.createElement('img');
      img.src = src;
      img.alt = '';
      img.draggable = false;
      plaatjes.appendChild(img);
    }
    kaart.appendChild(plaatjes);

    const zin = document.createElement('p');
    zin.className = 'boekje-zin';
    // Elk woord apart tikbaar; leestekens blijven aan het woord vast staan.
    for (const deel of p.tekst.split(/\s+/)) {
      const [woord] = woordenVan(deel);
      const knop = document.createElement('button');
      knop.type = 'button';
      knop.className = 'boekje-woord';
      knop.textContent = deel;
      knop.addEventListener('click', () => {
        for (const w of zin.querySelectorAll('.boekje-woord--aan')) w.classList.remove('boekje-woord--aan');
        knop.classList.add('boekje-woord--aan');
        const pad = woordAudioPad(woord);
        if (isOpgenomen(pad)) speelAf(pad);
      });
      zin.appendChild(knop);
    }
    kaart.appendChild(zin);

    const nav = document.createElement('div');
    nav.className = 'boekje-nav';
    const vorige = document.createElement('button');
    vorige.className = 'boekje-blader';
    vorige.textContent = '‹';
    vorige.setAttribute('aria-label', 'Vorige bladzijde');
    vorige.disabled = pagina === 0;
    vorige.addEventListener('click', () => {
      pagina--;
      toonPagina(-1);
    });
    const teller = document.createElement('span');
    teller.className = 'boekje-teller';
    teller.textContent = `${pagina + 1} / ${boekje.paginas.length}`;
    const volgende = document.createElement('button');
    volgende.className = 'boekje-blader boekje-blader--volgende';
    volgende.textContent = '›';
    volgende.setAttribute('aria-label', 'Volgende bladzijde');
    volgende.addEventListener('click', () => {
      if (pagina < boekje.paginas.length - 1) {
        pagina++;
        toonPagina(1);
        return;
      }
      stopAudio();
      titel.style.display = 'none';
      voegMuntenToe(MUNTEN_OEFENING_GOED * 3);
      toonKlaarKaart(container, () => manager.pop());
    });
    nav.append(vorige, teller, volgende);

    container.append(kaart, nav);
  }

  toonPagina(0);

  const terug = maakTerugKnop(() => manager.pop());
  let topRechts: ReturnType<typeof maakTopRechtsBalk> | null = null;

  return {
    mount(root) {
      root.appendChild(el);
      root.appendChild(terug);
      topRechts = maakTopRechtsBalk(manager);
      root.appendChild(topRechts.element);
    },
    unmount() {
      stopAudio();
      el.remove();
      terug.remove();
      topRechts?.element.remove();
      topRechts?.vernietig();
      topRechts = null;
    },
  };
}
