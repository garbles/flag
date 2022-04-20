import { AbstractBackend } from "./abstract-backend";
import { GetValueFromKeyPath, KeyPaths } from "../types";

export class NullBackend<F> extends AbstractBackend<F> {
  getSnapshot<KP extends KeyPaths<F>, T extends GetValueFromKeyPath<F, KP>>(keyPath: KP, defaultValue: T): T {
    return defaultValue;
  }
}
