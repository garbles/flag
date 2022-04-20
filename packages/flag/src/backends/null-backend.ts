import { AbstractBackend } from "./abstract-backend";
import { GetValueFromKeyPath, KeyPath } from "../types";

export class NullBackend<F> extends AbstractBackend<F> {
  getSnapshot<KP extends KeyPath<F>, T extends GetValueFromKeyPath<F, KP>>(keyPath: KP, defaultValue: T): T {
    return defaultValue;
  }
}
