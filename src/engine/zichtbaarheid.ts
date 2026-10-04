// Eén plek voor "staat de pagina op de voorgrond". Achtergrond, WebGL en audio
// pauzeren hierop; zolang de app zichtbaar is blijft alles gewoon doorlopen.

type Luisteraar = (zichtbaar: boolean) => void;

const luisteraars = new Set<Luisteraar>();

export function paginaZichtbaar(): boolean {
  return document.visibilityState !== 'hidden';
}

/** Roept `fn` aan bij elke wissel. Retourneert een afmeldfunctie. */
export function bijZichtbaarheid(fn: Luisteraar): () => void {
  luisteraars.add(fn);
  return () => luisteraars.delete(fn);
}

document.addEventListener('visibilitychange', () => {
  const aan = paginaZichtbaar();
  for (const fn of luisteraars) fn(aan);
});
