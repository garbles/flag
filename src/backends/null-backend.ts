import { AbstractBackend } from "./abstract-backend";

export class NullBackend<T> extends AbstractBackend<T> {
  name = "null";

  get() {
    return null;
  }
}
