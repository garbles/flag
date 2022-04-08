import { PendingValue } from "../pending-value";
import { GetValueFromKeyPath, KeyPaths, Subscriber, Unsubscribe, ExternalStore } from "../types";

export const toExternalStore = Symbol();

export abstract class AbstractBackend<F> {
  #listeners = new Set<Subscriber>();

  #subscribe = (sub: Subscriber): Unsubscribe => {
    this.#listeners.add(sub);
    return () => this.#listeners.delete(sub);
  };

  public abstract name: string;

  protected abstract getSnapshot<KP extends KeyPaths<F>, T extends GetValueFromKeyPath<F, KP>>(keyPath: KP, defaultValue: T): T;

  public [toExternalStore]<KP extends KeyPaths<F>, T extends GetValueFromKeyPath<F, KP>>(keyPath: KP, defaultValue: T): ExternalStore<T> {
    const subscribe = this.#subscribe;
    const getSnapshot = () => this.getSnapshot(keyPath, defaultValue);

    return {
      subscribe,
      getSnapshot,
    };
  }

  protected forceRender(): void {
    this.#listeners.forEach((sub) => sub());
  }

  protected createPendingValue<T>(): PendingValue<T> {
    return new PendingValue<T>(() => this.forceRender());
  }
}
