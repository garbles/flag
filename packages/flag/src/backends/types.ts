import { ExternalStore, GetValueFromKeyPath, KeyPath } from "../types";

export interface Backend<F> {
  name: string;
  getSnapshot<KP extends KeyPath<F>, T extends GetValueFromKeyPath<F, KP>>(keyPath: KP, defaultValue: T): T;
  getServerSnapshot<KP extends KeyPath<F>, T extends GetValueFromKeyPath<F, KP>>(keyPath: KP, defaultValue: T): T;
  toExternalStore<KP extends KeyPath<F>, T extends GetValueFromKeyPath<F, KP>>(keyPath: KP, defaultValue: T): ExternalStore<T>;
}
