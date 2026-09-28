// Kindvriendelijke voortgangsbalk i.p.v. "5 / 10"-tekst: een poesje dat steeds dichter
// bij een kommetje komt naarmate je door de oefening/toets heen loopt.
export function maakVoortgangsbalk(totaal: number): { element: HTMLElement; zetVoortgang: (huidig: number) => void } {
  const element = document.createElement('div');
  element.className = 'voortgangsbalk';

  const spoor = document.createElement('div');
  spoor.className = 'voortgangsbalk__spoor';

  const vulling = document.createElement('div');
  vulling.className = 'voortgangsbalk__vulling';
  spoor.appendChild(vulling);

  const loper = document.createElement('img');
  loper.className = 'voortgangsbalk__loper';
  loper.src = '/assets/icons/avatar-kat.svg';
  loper.alt = '';
  spoor.appendChild(loper);

  const kom = document.createElement('img');
  kom.className = 'voortgangsbalk__kom';
  kom.src = '/assets/icons/kom.svg';
  kom.alt = '';

  element.appendChild(spoor);
  element.appendChild(kom);

  function zetVoortgang(huidig: number): void {
    const fractie = totaal > 0 ? Math.min(1, Math.max(0, huidig / totaal)) : 0;
    vulling.style.width = `${fractie * 100}%`;
    // laat de kat net vóór de rand van het spoor blijven, i.p.v. half over de kom heen
    loper.style.left = `calc(${fractie * 100}% - ${fractie * 32}px)`;
  }

  zetVoortgang(0);

  return { element, zetVoortgang };
}
