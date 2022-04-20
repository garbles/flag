import { AsyncMutableRefObject, createAsyncRef } from "async-ref";
import { GetValueFromKeyPath, KeyPath, Subscriber, Unsubscribe, ExternalStore, Notifier } from "../types";
import { Backend } from "./types";

export abstract class AbstractBackend<F> implements Backend<F> {
  public abstract getSnapshot<KP extends KeyPath<F>, T extends GetValueFromKeyPath<F, KP>>(keyPath: KP, defaultValue: T): T;

  public getServerSnapshot<KP extends KeyPath<F>, T extends GetValueFromKeyPath<F, KP>>(keyPath: KP, defaultValue: T): T {
    return this.getSnapshot(keyPath, defaultValue);
  }

  public notify: Notifier = () => this.#listeners.forEach((sub) => sub());

  public get name() {
    return this.constructor.name;
  }

  public toExternalStore<KP extends KeyPath<F>, T extends GetValueFromKeyPath<F, KP>>(keyPath: KP, defaultValue: T): ExternalStore<T> {
    const subscribe = this.#subscribe;
    const getSnapshot = () => this.getSnapshot(keyPath, defaultValue);
    const getServerSnapshot = () => this.getServerSnapshot(keyPath, defaultValue);

    return {
      subscribe,
      getSnapshot,
      getServerSnapshot,
    };
  }

  #listeners = new Set<Subscriber>();

  #subscribe = (sub: Subscriber): Unsubscribe => {
    this.#listeners.add(sub);
    return () => this.#listeners.delete(sub);
  };

  protected createAsyncRef<T>(): AsyncMutableRefObject<T> {
    return createAsyncRef(this.notify);
  }
}
