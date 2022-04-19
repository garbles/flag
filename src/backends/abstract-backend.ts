import { AsyncMutableRefObject, createAsyncRef } from "async-ref";
import { GetValueFromKeyPath, KeyPaths, Subscriber, Unsubscribe, ExternalStore, Notifier } from "../types";

export interface IAbstractBackend<F> {
  name: string;
  get<KP extends KeyPaths<F>, T extends GetValueFromKeyPath<F, KP>>(keyPath: KP, defaultValue: T): T;
  toExternalStore<KP extends KeyPaths<F>, T extends GetValueFromKeyPath<F, KP>>(keyPath: KP, defaultValue: T): ExternalStore<T>;
}

export abstract class AbstractBackend<F> implements IAbstractBackend<F> {
  public abstract get<KP extends KeyPaths<F>, T extends GetValueFromKeyPath<F, KP>>(keyPath: KP, defaultValue: T): T;

  #listeners = new Set<Subscriber>();

  #subscribe = (sub: Subscriber): Unsubscribe => {
    this.#listeners.add(sub);
    return () => this.#listeners.delete(sub);
  };

  #notify: Notifier = () => this.#listeners.forEach((sub) => sub());

  public get name() {
    return this.constructor.name;
  }

  public toExternalStore<KP extends KeyPaths<F>, T extends GetValueFromKeyPath<F, KP>>(keyPath: KP, defaultValue: T): ExternalStore<T> {
    const subscribe = this.#subscribe;
    const getSnapshot = () => this.get(keyPath, defaultValue);

    return {
      subscribe,
      getSnapshot,
    };
  }

  protected createAsyncRef<T>(): AsyncMutableRefObject<T> {
    return createAsyncRef(this.#notify);
  }
}
