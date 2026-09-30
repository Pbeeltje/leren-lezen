export function schud<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

export function kies<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function geheelTussen(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}
