// Minimale scherm-stack navigator: geen URL-routing nodig voor dit aantal schermen.
import { stopAudio } from './audioManager.ts';
import { zetKindslot } from './native.ts';

export interface Screen {
  mount(root: HTMLElement): void;
  unmount(): void;
  /** Oefening of spel: in de app gaan dan de systeembalken weg en is de onderrand
   *  beschermd tegen per ongeluk weggaan (zie zetKindslot). Menu's laten ze staan. */
  kindslot?: boolean;
}

export type ScreenFactory = (manager: ScreenManager) => Screen;

export class ScreenManager {
  private stack: Screen[] = [];
  private root: HTMLElement;

  constructor(root: HTMLElement) {
    this.root = root;
  }

  push(fabriek: ScreenFactory): void {
    stopAudio(); // geen instructie/woord van het vorige scherm dat doorpraat
    this.huidig()?.unmount();
    const scherm = fabriek(this);
    this.stack.push(scherm);
    scherm.mount(this.root);
    zetKindslot(!!scherm.kindslot);
  }

  pop(): void {
    if (this.stack.length <= 1) return;
    stopAudio();
    this.huidig()?.unmount();
    this.stack.pop();
    this.huidig()?.mount(this.root);
    zetKindslot(!!this.huidig()?.kindslot);
  }

  /**
   * Voor een terug-knop op een scherm dat op meer dan één manier bereikt kan worden —
   * soms via `push` (er zit iets onder op de stack om naar terug te gaan), soms via
   * `replace` (de stack is net gewist, er zit niets onder). `pop()` alleen is dan niet
   * genoeg: die doet stilzwijgend niets zodra de stack door een eerdere `replace` nog
   * maar 1 scherm diep is — precies de bug waarbij een terug-knop het leek te "doen"
   * niets. `terugOfAnders` pop't als dat kan, en valt anders terug op `fabriek`.
   */
  terugOfAnders(fabriek: ScreenFactory): void {
    if (this.stack.length > 1) {
      this.pop();
    } else {
      this.replace(fabriek);
    }
  }

  replace(fabriek: ScreenFactory): void {
    stopAudio();
    this.huidig()?.unmount();
    this.stack = [];
    const scherm = fabriek(this);
    this.stack.push(scherm);
    scherm.mount(this.root);
    zetKindslot(!!scherm.kindslot);
  }

  private huidig(): Screen | undefined {
    return this.stack[this.stack.length - 1];
  }
}
