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
    [6000, () => tik('.icoon-tegel', 'Demo')],
    [12000, () => tik('.icoon-tegel', 'Leren lezen')],
    [16000, () => tik('.kern-rij--klikbaar')],
    [20000, () => tik('.hoofdstuk-tegel', 'Oefening 1')],
    [30000, () => tik('.terug-knop')],
    [33000, () => tik('.terug-knop')],
    [36000, () => tik('.terug-knop')],
    [40000, () => tik('.icoon-tegel', 'Muziek')],
    [44000, () => tik('.icoon-tegel', 'Vrij spelen')],
  ];
  for (const [t, f] of stappen) setTimeout(f, t);
})();
