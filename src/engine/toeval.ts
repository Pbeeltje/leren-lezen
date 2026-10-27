// Toeval voor de hele app. Altijd deze gebruiken: sort(() => Math.random() - 0.5) is
// scheef verdeeld (het goede antwoord kwam dan vaker op dezelfde plek).

/** Fisher-Yates: een geschudde kopie, elke volgorde even vaak. */
export function schud<T>(items: readonly T[]): T[] {
  const kopie = [...items];
  for (let i = kopie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [kopie[i], kopie[j]] = [kopie[j], kopie[i]];
  }
  return kopie;
}

/** Eén willekeurig item. */
export function kies<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}
