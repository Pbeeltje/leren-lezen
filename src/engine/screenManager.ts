// Minimale scherm-stack navigator: geen URL-routing nodig voor dit aantal schermen.

export interface Screen {
  mount(root: HTMLElement): void;
  unmount(): void;
}

export type ScreenFactory = (manager: ScreenManager) => Screen;

export class ScreenManager {
  private stack: Screen[] = [];
  private root: HTMLElement;

  constructor(root: HTMLElement) {
    this.root = root;
  }

  push(fabriek: ScreenFactory): void {
    this.huidig()?.unmount();
    const scherm = fabriek(this);
    this.stack.push(scherm);
    scherm.mount(this.root);
  }

  pop(): void {
    if (this.stack.length <= 1) return;
    this.huidig()?.unmount();
    this.stack.pop();
    this.huidig()?.mount(this.root);
  }

  replace(fabriek: ScreenFactory): void {
    this.huidig()?.unmount();
    this.stack = [];
    const scherm = fabriek(this);
    this.stack.push(scherm);
    scherm.mount(this.root);
  }

  private huidig(): Screen | undefined {
    return this.stack[this.stack.length - 1];
  }
}
