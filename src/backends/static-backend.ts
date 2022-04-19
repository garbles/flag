import { AbstractBackend } from "./abstract-backend";
import { GetValueFromKeyPath, KeyPaths } from "../types";

export class StaticBackend<F> extends AbstractBackend<F> {
  constructor(private data: Partial<F>) {
    super();
  }

  get<KP extends KeyPaths<F>, T extends GetValueFromKeyPath<F, KP>>(keyPath: KP, defaultValue: T): T {
    if (keyPath.length === 0) {
      return defaultValue;
    }

    let result: any = this.data;

    for (const key of keyPath as string[]) {
      result = result[key];

      if (result === undefined) {
        return defaultValue;
      }
    }

    return result;
  }
}
