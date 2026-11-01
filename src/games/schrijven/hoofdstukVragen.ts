import type { RondeVraag } from '../../ui/screens/RondeScreen.ts';
import type { Woord } from '../../content/types.ts';
import type { SchrijfHoofdstuk } from '../../content/schrijven/hoofdstukken.ts';
import type { OefeningNummer } from '../../engine/oefeningGenerator.ts';
import { instructieAudioPad, woordAudioPad } from '../../engine/audioManager.ts';
import { isOpgenomen } from '../../engine/opnames.ts';
import { toonGoedFeedback } from '../../ui/components/FeedbackOverlay.ts';
import { schud } from '../../engine/toeval.ts';
import { woordOvertrekVraag } from './schrijfVragen.ts';
import { maakNakijkKaart, maakSchrijfKaart } from './dictee.ts';

// De drie oefeningen van een schrijfhoofdstuk, op weg naar het dictee (de toets):
// 1 overtrekken, 2 overschrijven (woord staat erbij), 3 luisteren en schrijven (woord
// pas na Klaar te zien). Bij 2 en 3 kijkt het kind zelf na; "Nog een keer" is opnieuw
// schrijven, zoals bij oefenen altijd mag.

export const SCHRIJF_OEFENINGEN: Record<OefeningNummer, { titel: string; icoon: string }> = {
  1: { titel: 'Overtrekken', icoon: 'woordjes' },
  2: { titel: 'Overschrijven', icoon: 'potlood' },
  3: { titel: 'Luister en schrijf', icoon: 'luisteren' },
};

// Alleen een instructie die echt is ingesproken, anders een 404 bij elke vraag.
function instructie(slug: string): string | undefined {
  const pad = instructieAudioPad(slug);
  return isOpgenomen(pad) ? pad : undefined;
}

function schrijfEnNakijk(w: Woord, metVoorbeeld: boolean): RondeVraag['render'] {
  return (container, afgerond) => {
    let huidig: HTMLElement | null = null;
    const toon = (el: HTMLElement) => {
      huidig?.remove();
      huidig = el;
      container.appendChild(el);
    };
    const schrijven = () =>
      toon(
        maakSchrijfKaart(w, metVoorbeeld, (schrift) =>
          toon(
            maakNakijkKaart(
              w,
              schrift,
              (goed) => {
                if (!goed) return schrijven();
                toonGoedFeedback();
                afgerond();
              },
              'Nog een keer',
            ),
          ),
        ).element,
      );
    schrijven();
    return () => huidig?.remove();
  };
}

function maakVraag(w: Woord, nummer: OefeningNummer): RondeVraag {
  if (nummer === 1) return woordOvertrekVraag(w.woord, w.afbeeldingPad);
  if (nummer === 2) {
    // Het woord staat als tekst op het scherm: niet vanzelf voorlezen.
    return { instructie: 'Schrijf het woord over', audioPad: instructie('schrijf-over'), render: schrijfEnNakijk(w, true) };
  }
  return {
    instructie: 'Schrijf het woord dat je hoort',
    audioPad: woordAudioPad(w.woord),
    render: schrijfEnNakijk(w, false),
  };
}

// Een vragenreeks over de woorden van het hoofdstuk: eerst elk woord één keer (geschud),
// dan opnieuw geschud. Oefening 3 alleen woorden met een opname.
export function hoofdstukVragen(hoofdstuk: SchrijfHoofdstuk, nummer: OefeningNummer): () => RondeVraag {
  const woorden = nummer === 3 ? hoofdstuk.dicteeWoorden : hoofdstuk.woorden;
  let rij: Woord[] = [];
  let vorige: Woord | undefined;
  return () => {
    if (!rij.length) {
      rij = schud(woorden);
      if (rij.length > 1 && rij[0] === vorige) rij.push(rij.shift()!);
    }
    vorige = rij.shift()!;
    return maakVraag(vorige, nummer);
  };
}
