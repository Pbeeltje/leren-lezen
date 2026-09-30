// Kleine pub/sub bus zodat schermen, games en de three.js-laag los van elkaar blijven.

export interface EventMap {
  'antwoord-goed': { muntenVerdiend: number };
  'antwoord-fout': undefined;
  'munten-veranderd': { totaal: number; verschil: number };
  'kern-voltooid': { kernId: string; sterren: 0 | 1 | 2 | 3 };
  // Een hele oefensessie, toets of kleuterhoofdstuk is klaar (de achtergrond viert feest).
  'sessie-klaar': undefined;
}

type Handler<K extends keyof EventMap> = (payload: EventMap[K]) => void;

class EventBus {
  private handlers = new Map<keyof EventMap, Set<Handler<any>>>();

  on<K extends keyof EventMap>(event: K, handler: Handler<K>): () => void {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)!.add(handler);
    return () => this.off(event, handler);
  }

  off<K extends keyof EventMap>(event: K, handler: Handler<K>): void {
    this.handlers.get(event)?.delete(handler);
  }

  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
    this.handlers.get(event)?.forEach((handler) => handler(payload));
  }
}

export const events = new EventBus();
