import { AsyncMutableRefObject, createAsyncRef } from "async-ref";
import { GetValueFromKeyPath, KeyPaths, Subscriber, Unsubscribe, ExternalStore, Notifier } from "../types";

export interface IAbstractBackend<F> {
  name: string;
  getSnapshot<KP extends KeyPaths<F>, T extends GetValueFromKeyPath<F, KP>>(keyPath: KP, defaultValue: T): T;
  getServerSnapshot<KP extends KeyPaths<F>, T extends GetValueFromKeyPath<F, KP>>(keyPath: KP, defaultValue: T): T;
  toExternalStore<KP extends KeyPaths<F>, T extends GetValueFromKeyPath<F, KP>>(keyPath: KP, defaultValue: T): ExternalStore<T>;
}

export abstract class AbstractBackend<F> implements IAbstractBackend<F> {
  public abstract getSnapshot<KP extends KeyPaths<F>, T extends GetValueFromKeyPath<F, KP>>(keyPath: KP, defaultValue: T): T;

  public getServerSnapshot<KP extends KeyPaths<F>, T extends GetValueFromKeyPath<F, KP>>(keyPath: KP, defaultValue: T): T {
    return this.getSnapshot(keyPath, defaultValue);
  }

  public notify: Notifier = () => this.#listeners.forEach((sub) => sub());

  public get name() {
    return this.constructor.name;
  }

  public toExternalStore<KP extends KeyPaths<F>, T extends GetValueFromKeyPath<F, KP>>(keyPath: KP, defaultValue: T): ExternalStore<T> {
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
