import { PendingValue } from "../pending-value";
import { GetValueFromKeyPath, KeyPaths } from "../types";

export abstract class AbstractBackend<F> {
  public abstract name: string;
  public abstract get<KP extends KeyPaths<F>>(keyPath: KP): GetValueFromKeyPath<F, KP> | null;

  protected createPendingValue<T>(): PendingValue<T> {
    return new PendingValue<T>();
  }
}
