import { ExternalStore, GetValueFromKeyPath, KeyPaths } from "../types";

export interface Backend<F> {
  name: string;
  getSnapshot<KP extends KeyPaths<F>, T extends GetValueFromKeyPath<F, KP>>(keyPath: KP, defaultValue: T): T;
  getServerSnapshot<KP extends KeyPaths<F>, T extends GetValueFromKeyPath<F, KP>>(keyPath: KP, defaultValue: T): T;
  toExternalStore<KP extends KeyPaths<F>, T extends GetValueFromKeyPath<F, KP>>(keyPath: KP, defaultValue: T): ExternalStore<T>;
}
