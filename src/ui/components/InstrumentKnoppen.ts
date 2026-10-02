import { INSTRUMENTEN, type Instrument } from '../../engine/muziek.ts';
import { heeft, kiesInstrument } from '../../engine/winkel.ts';

// Knoppen om het melodie-instrument te kiezen (Vrij spelen en Speel na), plus de munt die
// naar de instrumenten in de winkel gaat. Wat je nog niet hebt staat er grijs met een
// slotje; tikken opent meteen het koopvenster. Een gekozen instrument wordt onthouden.
export function maakInstrumentKnoppen(
  opKies: (instrument: Instrument) => void,
  naarWinkel: (koop?: Instrument) => void,
): { knoppen: HTMLButtonElement[]; winkel: HTMLButtonElement; ververs: (gekozen: Instrument | null) => void } {
  const knoppen = INSTRUMENTEN.map(({ id, naam, icoon }) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'muziek-wissel__knop';
    b.dataset.instrument = id;
    b.innerHTML = `<img src="${icoon}" alt=""><span>${naam}</span><img class="muziek-wissel__slot" src="assets/icons/slot.svg" alt="">`;
    b.addEventListener('click', () => {
      if (!heeft('instrument', id)) {
        naarWinkel(id);
        return;
      }
      kiesInstrument(id);
      opKies(id);
    });
    return b;
  });

  const winkel = document.createElement('button');
  winkel.type = 'button';
  winkel.className = 'muziek-winkel-knop';
  winkel.setAttribute('aria-label', 'Instrumenten in de winkel');
  winkel.innerHTML = '<img src="assets/icons/munt.svg" alt="">';
  winkel.addEventListener('click', () => naarWinkel());

  function ververs(gekozen: Instrument | null): void {
    knoppen.forEach((b, i) => {
      const { id, naam } = INSTRUMENTEN[i];
      const open = heeft('instrument', id);
      b.classList.toggle('muziek-wissel__knop--slot', !open);
      b.classList.toggle('muziek-wissel__knop--aan', id === gekozen);
      b.setAttribute('aria-label', open ? naam : `${naam} kopen`);
    });
  }

  return { knoppen, winkel, ververs };
}
