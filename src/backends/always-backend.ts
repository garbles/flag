import { AbstractBackend } from "./abstract-backend";
import { GetValueFromKeyPath, KeyPath } from "../types";

type AlwaysMapping = {
  boolean: boolean;
  string: string;
  number: number;
};

export class AlwaysBackend<F> extends AbstractBackend<F> {
  #alwaysMapping: Partial<AlwaysMapping>;

  constructor(alwaysMapping: Partial<AlwaysMapping> = {}) {
    super();
    this.#alwaysMapping = alwaysMapping;
  }

  getSnapshot<KP extends KeyPath<F>, T extends GetValueFromKeyPath<F, KP>>(keyPath: KP, defaultValue: T): T {
    const type = typeof defaultValue;

    if (type !== "boolean" && type !== "string" && type !== "number") {
      throw new Error(`AlwaysBackend: dafault value must be a boolean, string or number, but got ${type}`);
    }

    return (this.#alwaysMapping[type] as T) ?? defaultValue;
  }
}
