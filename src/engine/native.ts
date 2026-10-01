import { Capacitor } from '@capacitor/core';

// Alles wat alleen in de Android-/iPhone-app (Capacitor) nodig is. In de browser doet dit
// niets, zodat de webversie precies zo blijft werken.

export const isApp = Capacitor.isNativePlatform();

const OPSLAG_SLEUTEL = 'leren-lezen-opslag';
const VOORVOEGSEL = 'leren-lezen:';

// Voortgang staat in localStorage. iOS (en soms Android) mag die van een app-webview
// opruimen als het toestel vol raakt; Preferences (UserDefaults / SharedPreferences) niet.
// Daarom: bij het starten de kopie uit Preferences terugzetten als localStorage leeg is, en
// elke wijziging (even later, gebundeld) naar Preferences spiegelen.
export async function herstelEnSpiegelOpslag(): Promise<void> {
  if (!isApp) return;
  const { Preferences } = await import('@capacitor/preferences');
  try {
    const { value } = await Preferences.get({ key: OPSLAG_SLEUTEL });
    const leeg = !Object.keys(localStorage).some((k) => k.startsWith(VOORVOEGSEL));
    if (value && leeg) {
      const kopie = JSON.parse(value) as Record<string, string>;
      for (const [k, v] of Object.entries(kopie)) localStorage.setItem(k, v);
    }
  } catch {
    // geen kopie of kapot: gewoon verder met wat er is
  }

  let timer: number | undefined;
  const bewaar = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      const kopie: Record<string, string> = {};
      for (const k of Object.keys(localStorage)) if (k.startsWith(VOORVOEGSEL)) kopie[k] = localStorage.getItem(k) ?? '';
      void Preferences.set({ key: OPSLAG_SLEUTEL, value: JSON.stringify(kopie) });
    }, 400);
  };
  const origSet = Storage.prototype.setItem;
  const origRemove = Storage.prototype.removeItem;
  Storage.prototype.setItem = function (k: string, v: string) {
    origSet.call(this, k, v);
    if (this === localStorage && k.startsWith(VOORVOEGSEL)) bewaar();
  };
  Storage.prototype.removeItem = function (k: string) {
    origRemove.call(this, k);
    if (this === localStorage && k.startsWith(VOORVOEGSEL)) bewaar();
  };
  // Bij wegschakelen meteen bewaren (de app kan daarna gesloten worden).
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      window.clearTimeout(timer);
      timer = undefined;
      const kopie: Record<string, string> = {};
      for (const k of Object.keys(localStorage)) if (k.startsWith(VOORVOEGSEL)) kopie[k] = localStorage.getItem(k) ?? '';
      void Preferences.set({ key: OPSLAG_SLEUTEL, value: JSON.stringify(kopie) });
    }
  });
}

// Android-terugknop (of terugveeg): eerst een open venster/menu sluiten, anders doen wat de
// terugknop linksboven op dit scherm doet. Is er geen terugknop (profielscherm), dan gaat
// de app naar de achtergrond in plaats van af te sluiten.
export async function koppelAppKnoppen(): Promise<void> {
  if (!isApp) return;
  const { App } = await import('@capacitor/app');
  void App.addListener('backButton', () => {
    const venster = document.querySelector<HTMLElement>('.winkel-venster');
    if (venster) {
      venster.click();
      return;
    }
    const paneel = document.querySelector<HTMLElement>('.profiel-menu__paneel:not([hidden])');
    if (paneel) {
      document.querySelector<HTMLElement>('.profiel-knop')?.click();
      return;
    }
    const terug = document.querySelector<HTMLElement>('.terug-knop');
    if (terug) terug.click();
    else void App.minimizeApp();
  });

}
