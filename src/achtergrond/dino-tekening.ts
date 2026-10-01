// Eigen tekeningen voor de dino-wei, als tekst zodat ze inline in de pagina staan en losse
// delen (kop, staart, poten, oog) met CSS kunnen bewegen (zie styles/achtergrond.css).
// TREX is dezelfde tekening als public/assets/achtergrond/trex-eigen.svg (het winkelplaatje):
// pas die twee samen aan.

/** T-rex die naar rechts kijkt. Klassen: tr-kop, tr-oog, tr-lach, tr-brul, tr-arm, tr-staart. */
export const TREX = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 200">
  <defs>
    <linearGradient id="tr-lijf" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#86cdf7"/>
      <stop offset="1" stop-color="#4593dc"/>
    </linearGradient>
    <linearGradient id="tr-poot" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#5aa4e6"/>
      <stop offset="1" stop-color="#3a7fc6"/>
    </linearGradient>
    <linearGradient id="tr-buik" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff6d2"/>
      <stop offset="1" stop-color="#ffe08a"/>
    </linearGradient>
    <linearGradient id="tr-stekel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffc35a"/>
      <stop offset="1" stop-color="#f58a34"/>
    </linearGradient>
    <radialGradient id="tr-glans" cx="0.4" cy="0.3" r="0.6">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.5"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <!-- staart (apart, zodat hij kan zwaaien) -->
  <g class="tr-staart">
    <path d="M96 104 C70 106 40 116 12 138 C6 143 9 148 15 147 C44 142 72 140 98 140 Z" fill="url(#tr-lijf)" stroke="#1d4c80" stroke-width="3" stroke-linejoin="round"/>
    <g fill="url(#tr-stekel)" stroke="#b8621c" stroke-width="2" stroke-linejoin="round">
      <path d="M34 124 C34 116 38 112 42 110 C44 114 46 118 46 120 Z"/>
      <path d="M56 114 C56 105 61 100 66 99 C68 104 69 109 68 112 Z"/>
    </g>
  </g>
  <!-- achterste poot (verder weg, iets donkerder) -->
  <g class="tr-poot-achter">
    <path d="M84 128 C78 144 80 160 84 172 L82 182 C80 189 86 190 90 190 L112 190 C118 190 118 183 112 181 L104 179 C106 164 110 148 106 132 Z" fill="url(#tr-poot)" stroke="#1d4c80" stroke-width="3" stroke-linejoin="round"/>
  </g>
  <!-- rugstekels -->
  <g fill="url(#tr-stekel)" stroke="#b8621c" stroke-width="2" stroke-linejoin="round">
    <path d="M80 102 C80 92 86 86 92 84 C94 90 96 96 94 100 Z"/>
    <path d="M98 90 C98 79 105 72 112 70 C114 77 115 84 112 88 Z"/>
    <path d="M118 80 C119 69 126 62 133 60 C135 67 135 74 132 78 Z"/>
  </g>
  <!-- lijf met nek -->
  <path d="M80 122 C80 98 100 82 124 78 C134 70 140 60 150 56 L166 80 C170 90 170 104 166 116 C160 138 144 152 120 154 C96 156 80 144 80 122 Z" fill="url(#tr-lijf)" stroke="#1d4c80" stroke-width="3" stroke-linejoin="round"/>
  <path d="M90 112 C94 96 110 86 128 84 C136 84 142 88 144 94 C126 92 106 98 90 112 Z" fill="url(#tr-glans)"/>
  <!-- buik -->
  <path d="M132 96 C146 92 160 98 162 112 C162 130 150 146 130 148 C118 148 112 140 116 128 C120 114 122 100 132 96 Z" fill="url(#tr-buik)"/>
  <!-- vlekjes -->
  <circle cx="100" cy="106" r="4" fill="#b6e2fb"/>
  <circle cx="112" cy="96" r="3" fill="#b6e2fb"/>
  <circle cx="94" cy="128" r="3.2" fill="#b6e2fb"/>
  <!-- voorste poot -->
  <g class="tr-poot-voor">
    <path d="M100 124 C98 104 114 96 130 98 C148 100 154 118 148 136 C145 148 144 160 144 170 L152 176 C158 179 158 190 150 190 L118 190 C111 190 111 182 117 179 L121 175 C118 160 102 146 100 124 Z" fill="url(#tr-lijf)" stroke="#1d4c80" stroke-width="3" stroke-linejoin="round"/>
    <path d="M128 190 L128 185 M138 190 L138 185 M148 190 L149 185" stroke="#1d4c80" stroke-width="2.2" stroke-linecap="round"/>
  </g>
  <!-- armpje -->
  <g class="tr-arm">
    <path d="M156 100 C166 100 174 106 176 114 C177 119 172 120 170 117 C167 112 162 109 154 109 Z" fill="url(#tr-poot)" stroke="#1d4c80" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M172 119 L172 123 M176 117 L178 120" stroke="#1d4c80" stroke-width="2" stroke-linecap="round"/>
  </g>
  <!-- kop (draait om de nek) -->
  <g class="tr-kop">
    <path d="M140 62 C136 38 154 18 182 18 C204 18 216 30 216 46 C216 58 212 66 204 70 C206 82 196 92 180 92 C162 93 148 88 143 78 C140 72 140 67 140 62 Z" fill="url(#tr-lijf)" stroke="#1d4c80" stroke-width="3" stroke-linejoin="round"/>
    <path d="M150 50 C152 34 166 25 182 25 C192 25 200 28 204 34 C190 30 166 34 150 50 Z" fill="url(#tr-glans)"/>
    <!-- glimlach met tandjes -->
    <g class="tr-lach">
      <path d="M156 72 C172 81 192 80 208 68" fill="none" stroke="#1d4c80" stroke-width="3" stroke-linecap="round"/>
      <path d="M167 76.5 L170 82 L173 78 Z M181 79 L184 84.5 L187 79 Z M195 76 L198 81 L200 74.5 Z" fill="#fff" stroke="#1d4c80" stroke-width="1.6" stroke-linejoin="round"/>
    </g>
    <!-- open bek (alleen bij een brul) -->
    <g class="tr-brul" opacity="0">
      <path d="M156 70 C172 74 194 72 210 64 C212 78 200 92 182 92 C168 92 158 84 156 70 Z" fill="#c2344c" stroke="#1d4c80" stroke-width="3" stroke-linejoin="round"/>
      <path d="M168 84 C174 80 186 80 194 84 C188 90 174 90 168 84 Z" fill="#ff8aa0"/>
      <path d="M168 72 L171 78 L174 73 Z M184 72.5 L187 78 L190 72 Z M199 68 L201 73.5 L204 66.5 Z" fill="#fff" stroke="#1d4c80" stroke-width="1.4" stroke-linejoin="round"/>
    </g>
    <!-- oog (knippert) -->
    <g class="tr-oog">
      <ellipse cx="176" cy="42" rx="10" ry="11" fill="#fff" stroke="#1d4c80" stroke-width="2.5"/>
      <circle cx="178.5" cy="43.5" r="5.6" fill="#1b1b2f"/>
      <circle cx="180.5" cy="41" r="2" fill="#fff"/>
    </g>
    <!-- neusgat en wangetje -->
    <ellipse cx="207" cy="40" rx="2.4" ry="1.8" fill="#1d4c80"/>
    <ellipse cx="194" cy="60" rx="7" ry="4" fill="#ff9aa2" opacity="0.75"/>
  </g>
</svg>`;

/**
 * Stegosaurus om rond te lopen, naar het avatarplaatje avatar-stegosaurus.svg (kijkt naar
 * links). Poten in twee paren voor een kruislingse pas (st-poot--a / --b), verder st-romp,
 * st-staart en st-kop.
 */
export const STEGO = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 10 122 98">
  <defs>
    <linearGradient id="dst-lijf" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#7fd6a4"/>
      <stop offset="1" stop-color="#2f9f73"/>
    </linearGradient>
    <linearGradient id="dst-poot" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3fae80"/>
      <stop offset="1" stop-color="#23805c"/>
    </linearGradient>
    <linearGradient id="dst-plaat" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffc14d"/>
      <stop offset="1" stop-color="#f27a2e"/>
    </linearGradient>
    <radialGradient id="dst-glans" cx="0.4" cy="0.3" r="0.6">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.45"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <!-- poten aan de verre kant -->
  <rect class="st-poot st-poot--b" x="40" y="78" width="15" height="26" rx="7" fill="url(#dst-poot)" stroke="#1d6b4c" stroke-width="2.5"/>
  <rect class="st-poot st-poot--a" x="78" y="76" width="16" height="28" rx="7" fill="url(#dst-poot)" stroke="#1d6b4c" stroke-width="2.5"/>
  <g class="st-romp">
    <g fill="url(#dst-plaat)" stroke="#c4561c" stroke-width="2" stroke-linejoin="round">
      <path d="M34 52 L38 34 L48 48 Z"/>
      <path d="M44 46 L52 22 L62 42 Z"/>
      <path d="M58 41 L68 14 L78 40 Z"/>
      <path d="M74 41 L86 20 L92 45 Z"/>
      <path d="M88 47 L101 32 L102 54 Z"/>
    </g>
    <g class="st-staart">
      <path d="M96 66 C106 66 112 62 117 54 C116 66 108 76 96 80 Z" fill="url(#dst-lijf)" stroke="#1d6b4c" stroke-width="2.5" stroke-linejoin="round"/>
      <g fill="#fff3d6" stroke="#b08850" stroke-width="1.5" stroke-linejoin="round">
        <path d="M110 60 L118 46 L114 62 Z"/>
        <path d="M113 57 L119 52 L116 60 Z"/>
      </g>
    </g>
    <path d="M24 70 C24 50 46 40 66 40 C88 40 102 52 102 66 C102 80 88 86 64 86 C42 86 24 84 24 70 Z" fill="url(#dst-lijf)" stroke="#1d6b4c" stroke-width="2.5"/>
    <path d="M30 66 C34 52 50 45 66 45 C80 45 92 50 96 58 C82 54 52 54 30 66 Z" fill="url(#dst-glans)"/>
    <path d="M34 76 C46 82 72 84 92 76 C86 84 72 86 62 86 C48 86 38 82 34 76 Z" fill="#c8f0d4" opacity="0.8"/>
    <circle cx="60" cy="56" r="3.5" fill="#bdf0d1"/>
    <circle cx="74" cy="60" r="2.8" fill="#bdf0d1"/>
    <circle cx="48" cy="62" r="2.5" fill="#bdf0d1"/>
  </g>
  <!-- poten aan de dichte kant -->
  <rect class="st-poot st-poot--b" x="66" y="80" width="15" height="26" rx="7" fill="url(#dst-poot)" stroke="#1d6b4c" stroke-width="2.5"/>
  <rect class="st-poot st-poot--a" x="28" y="78" width="14" height="27" rx="7" fill="url(#dst-poot)" stroke="#1d6b4c" stroke-width="2.5"/>
  <g class="st-kop">
    <path d="M32 66 C26 62 20 62 14 64 C6 66 3 72 6 77 C9 82 17 82 24 79 C30 77 34 73 34 70 Z" fill="url(#dst-lijf)" stroke="#1d6b4c" stroke-width="2.5" stroke-linejoin="round"/>
    <circle cx="13" cy="70" r="3.4" fill="#ffffff"/>
    <circle cx="12.4" cy="70.3" r="2" fill="#1b1b2f"/>
    <circle cx="11.8" cy="69.5" r="0.7" fill="#ffffff"/>
    <path d="M7 77 C10 79 14 79 17 78" stroke="#1d6b4c" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <circle cx="20" cy="75" r="2.2" fill="#ff9aa2" opacity="0.7"/>
  </g>
</svg>`;

/**
 * Pteranodon die zweeft (kijkt naar rechts), van onderen gezien met gespreide vleugels.
 * Klassen: pt-vleugel--l / --r (draaien om de schouder voor een trage slag), pt-oog.
 */
export const PTERO = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 84">
  <defs>
    <linearGradient id="dpt-vleugel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f7b977"/>
      <stop offset="1" stop-color="#e98a4f"/>
    </linearGradient>
    <linearGradient id="dpt-lijf" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f6a965"/>
      <stop offset="1" stop-color="#d9733a"/>
    </linearGradient>
  </defs>
  <g stroke="#8a4520" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">
    <g class="pt-vleugel pt-vleugel--l">
      <path d="M100 44 C80 34 48 24 8 28 C16 33 22 38 26 44 C36 44 44 47 50 54 C62 52 76 54 92 60 Z" fill="url(#dpt-vleugel)"/>
      <path d="M98 45 C78 36 50 28 12 30" fill="none" stroke="#b5622d" stroke-width="2"/>
    </g>
    <g class="pt-vleugel pt-vleugel--r">
      <path d="M100 44 C120 34 152 24 192 28 C184 33 178 38 174 44 C164 44 156 47 150 54 C138 52 124 54 108 60 Z" fill="url(#dpt-vleugel)"/>
      <path d="M102 45 C122 36 150 28 188 30" fill="none" stroke="#b5622d" stroke-width="2"/>
    </g>
    <!-- pootjes en lijf -->
    <path d="M94 62 L86 72 M101 63 L96 74" fill="none" stroke-width="2.2"/>
    <ellipse cx="100" cy="54" rx="11" ry="10" fill="url(#dpt-lijf)"/>
    <!-- kop met kam naar achteren en lange snavel -->
    <path d="M110 30 C100 22 88 16 74 14 C86 24 96 32 106 38 Z" fill="#f06a4a"/>
    <path d="M100 46 C100 34 108 26 118 28 L160 36 C152 41 132 43 116 44 C110 46 104 48 100 46 Z" fill="url(#dpt-lijf)"/>
    <path d="M122 39 L156 37" fill="none" stroke-width="1.6"/>
  </g>
  <circle class="pt-oog" cx="114" cy="34" r="3.2" fill="#ffffff"/>
  <circle cx="114.6" cy="34.2" r="1.9" fill="#1b1b2f"/>
  <circle cx="115.2" cy="33.4" r="0.7" fill="#ffffff"/>
  <circle cx="110" cy="40" r="2.2" fill="#ff9aa2" opacity="0.6"/>
</svg>`;

/**
 * Brachiosaurus in de verte (kijkt naar rechts), in wazige kleuren. De nek (br-nek) draait
 * langzaam om zijn voet: rondkijken en af en toe naar beneden om te eten.
 */
export const BRACHIO = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 150">
  <g fill="#8fb7b4" stroke="#6f9a98" stroke-width="2" stroke-linejoin="round">
    <path d="M72 106 C52 108 32 118 4 134 C30 130 54 126 76 124 Z"/>
    <path d="M76 116 L74 150 L88 150 L88 118 Z M114 112 L112 150 L126 150 L126 112 Z" fill="#7fa9a6"/>
    <path d="M64 116 C62 96 84 86 104 88 C124 90 134 100 132 118 C130 130 112 134 98 134 C80 134 66 128 64 116 Z"/>
    <g class="br-nek">
      <path d="M110 98 C112 70 120 42 134 22 C137 17 144 15 148 19 C141 34 133 62 130 102 Z"/>
      <path d="M133 22 C133 13 142 8 152 10 C160 12 163 18 157 22 C151 26 141 27 133 22 Z"/>
      <circle cx="148" cy="15" r="1.6" fill="#4f6f70" stroke="none"/>
    </g>
  </g>
  <path d="M74 104 C84 94 104 92 120 98" stroke="#b6d6d2" stroke-width="3" fill="none" stroke-linecap="round"/>
</svg>`;

/**
 * Nest met drie gespikkelde eieren. Elk ei (ei) wiebelt los; bij het middelste kan de
 * bovenkant (ei__dop) omhoog en kijkt er een babydino (ei__baby) uit.
 */
export const NEST = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 80">
  <ellipse cx="65" cy="62" rx="56" ry="13" fill="#7a5233"/>
  <g class="ei ei--1">
    <ellipse cx="38" cy="48" rx="15" ry="19" fill="#fff4dc" stroke="#b08850" stroke-width="2.2"/>
    <g fill="#e2b77a"><circle cx="33" cy="42" r="2.4"/><circle cx="43" cy="50" r="2"/><circle cx="36" cy="56" r="1.6"/></g>
  </g>
  <g class="ei ei--3">
    <ellipse cx="92" cy="48" rx="15" ry="19" fill="#dff3e8" stroke="#6fa58a" stroke-width="2.2"/>
    <g fill="#9fd1b4"><circle cx="88" cy="42" r="2.4"/><circle cx="97" cy="51" r="2"/><circle cx="90" cy="56" r="1.6"/></g>
  </g>
  <g class="ei ei--2">
    <g class="ei__baby">
      <path d="M54 34 C54 20 62 14 70 15 C78 16 82 24 80 34 Z" fill="#7fd6a4" stroke="#1d6b4c" stroke-width="2"/>
      <circle cx="64" cy="24" r="2.8" fill="#fff"/><circle cx="64.4" cy="24.4" r="1.6" fill="#1b1b2f"/>
      <circle cx="73" cy="24" r="2.8" fill="#fff"/><circle cx="73.4" cy="24.4" r="1.6" fill="#1b1b2f"/>
      <path d="M64 30 C67 32 71 32 74 30" stroke="#1d6b4c" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    </g>
    <path d="M50 40 C50 60 56 66 65 66 C74 66 80 60 80 40 L74 44 L69 38 L63 44 L57 38 Z" fill="#fff8e8" stroke="#b08850" stroke-width="2.2" stroke-linejoin="round"/>
    <g fill="#f2a98a"><circle cx="58" cy="52" r="2.2"/><circle cx="70" cy="56" r="2.4"/><circle cx="74" cy="47" r="1.6"/></g>
    <g class="ei__dop">
      <path d="M50 40 C50 26 57 16 65 16 C73 16 80 26 80 40 L74 44 L69 38 L63 44 L57 38 Z" fill="#fff8e8" stroke="#b08850" stroke-width="2.2" stroke-linejoin="round"/>
      <g fill="#f2a98a"><circle cx="60" cy="28" r="2.4"/><circle cx="71" cy="32" r="1.8"/></g>
    </g>
  </g>
  <!-- takjes van het nest voor de eieren -->
  <path d="M10 60 C30 74 100 74 120 60 C116 72 98 78 65 78 C32 78 14 72 10 60 Z" fill="#9a6a3f" stroke="#5c3d25" stroke-width="2"/>
  <path d="M18 64 L40 70 M34 72 L60 68 M56 74 L84 70 M80 72 L104 66 M98 70 L116 62 M22 70 L46 74" stroke="#5c3d25" stroke-width="2" stroke-linecap="round"/>
  <path d="M14 62 L30 66 M90 66 L112 64" stroke="#c49466" stroke-width="2" stroke-linecap="round"/>
</svg>`;
