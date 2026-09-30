// Grote, opvallende knop om instructie-audio opnieuw af te spelen -- een kind dat de
// instructie niet meteen meekreeg (of nog niet kan lezen) moet 'm zonder moeite terug
// kunnen halen, niet alleen de ene keer bij het verschijnen van de oefening.
export function maakAudioKnop(opAfspelen: () => void): HTMLButtonElement {
  const knop = document.createElement('button');
  knop.className = 'audio-knop';
  knop.setAttribute('aria-label', 'Herhaal het geluid');
  const icoon = document.createElement('img');
  icoon.src = 'assets/icons/geluid.svg';
  icoon.alt = '';
  knop.appendChild(icoon);
  knop.addEventListener('click', opAfspelen);
  return knop;
}
