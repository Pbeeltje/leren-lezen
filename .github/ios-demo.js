// Alleen voor de iOS-prototype-workflow (wordt daar in dist/index.html gezet, nooit in de
// echte app): maakt een testprofiel aan en klikt een paar schermen door, zodat de
// schermafbeeldingen uit de simulator meer laten zien dan alleen het startscherm.
(function () {
  if (!localStorage.getItem('leren-lezen:profielen')) {
    localStorage.setItem('leren-lezen:profielen', JSON.stringify([{ id: 'demo', naam: 'Demo', icoonId: 'vos', kleur: 0, aangemaakt: 1 }]));
    localStorage.setItem('leren-lezen:voortgang:demo', JSON.stringify({ versie: 1, laatstGekozenLeeftijd: 6, kernen: {}, munten: 120 }));
  }
  const tik = (sel, tekst) => {
    const el = [...document.querySelectorAll(sel)].find((e) => !tekst || e.textContent.includes(tekst));
    if (el) el.click();
  };
  const stappen = [
    [0, () => tik('.icoon-tegel', 'Demo')],
    [0, () => tik('.icoon-tegel', 'Leren lezen')],
    [0, () => tik('.kern-rij--klikbaar')],
    [0, () => tik('.hoofdstuk-tegel', 'Oefening 1')],
    [0, () => { tik('.terug-knop'); setTimeout(() => tik('.terug-knop'), 1500); setTimeout(() => tik('.terug-knop'), 3000); }],
    [0, () => tik('.icoon-tegel', 'Muziek')],
    [0, () => tik('.icoon-tegel', 'Vrij spelen')],
  ];
  // Pas beginnen als de app echt getekend is (de CI-simulator is bij een koude start traag),
  // en dan elke stap 10 s later, zodat de schermafbeeldingen (elke 10 s) elk scherm vangen.
  const begin = () => {
    if (!document.querySelector('.icoon-tegel')) return setTimeout(begin, 500);
    document.title = 'demo-klaar';
    stappen.forEach(([, f], i) => setTimeout(f, 8000 + i * 10000));
  };
  begin();
})();
