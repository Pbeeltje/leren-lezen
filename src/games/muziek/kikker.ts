// Eén kikker voor het koor. houding verschuift alleen de ogen; grootte, draai en
// kleur komen uit CSS. Geen voorpoten. Oogleden kunnen knipperen (.kk-knipper).

export function kikkerSvg(n: number, houding: 0 | 1 | 2 | 3): string {
  const id = `kk${n}`;
  const oogY = houding === 3 ? 24 : houding === 1 ? 29 : 27;
  const pupilY = oogY + 1.2;
  return `
<svg viewBox="0 0 80 80" aria-hidden="true">
  <defs>
    <linearGradient id="${id}-lijf" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#7dce6a"/><stop offset="1" stop-color="#2f9a3c"/>
    </linearGradient>
    <linearGradient id="${id}-buik" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f4ffd2"/><stop offset="1" stop-color="#d4ee8a"/>
    </linearGradient>
    <linearGradient id="${id}-poot" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#5cba52"/><stop offset="1" stop-color="#247a32"/>
    </linearGradient>
  </defs>
  <path d="M24 50 C12 52 6 58 8 64 C12 70 24 68 26 62 C28 56 28 51 24 50Z" fill="url(#${id}-poot)" stroke="#145c28" stroke-width="2.2" stroke-linejoin="round"/>
  <path d="M56 50 C68 52 74 58 72 64 C68 70 56 68 54 62 C52 56 52 51 56 50Z" fill="url(#${id}-poot)" stroke="#145c28" stroke-width="2.2" stroke-linejoin="round"/>
  <ellipse cx="40" cy="48" rx="23" ry="17" fill="url(#${id}-lijf)" stroke="#145c28" stroke-width="2.4"/>
  <ellipse cx="40" cy="52" rx="13" ry="9.5" fill="url(#${id}-buik)" stroke="#2d7a34" stroke-width="1.5"/>
  <circle cx="26" cy="${oogY}" r="10" fill="url(#${id}-lijf)" stroke="#145c28" stroke-width="2.2"/>
  <circle cx="54" cy="${oogY}" r="10" fill="url(#${id}-lijf)" stroke="#145c28" stroke-width="2.2"/>
  <circle cx="26" cy="${oogY + 1}" r="5.2" fill="#fff" stroke="#145c28" stroke-width="1.5"/>
  <circle cx="54" cy="${oogY + 1}" r="5.2" fill="#fff" stroke="#145c28" stroke-width="1.5"/>
  <circle cx="27.4" cy="${pupilY}" r="2.5" fill="#1a1a1a"/>
  <circle cx="55.4" cy="${pupilY}" r="2.5" fill="#1a1a1a"/>
  <circle cx="28.6" cy="${pupilY - 1.4}" r="1" fill="#fff"/>
  <circle cx="56.6" cy="${pupilY - 1.4}" r="1" fill="#fff"/>
  <ellipse class="kk-knipper" cx="26" cy="${oogY + 1}" rx="5.6" ry="5.6" fill="#3aaa44"/>
  <ellipse class="kk-knipper" cx="54" cy="${oogY + 1}" rx="5.6" ry="5.6" fill="#3aaa44"/>
  <path d="M34 47 Q40 53 46 47" stroke="#145c28" stroke-width="2" stroke-linecap="round"/>
</svg>`;
}
