type PendingValueState<T> =
  | { status: "loading"; value: undefined; error: undefined }
  | { status: "resolved"; value: T; error: undefined }
  | { status: "error"; value: undefined; error: Error };

export class PendingValue<T> {
  #promise: Promise<T>;
  #onResolve: () => void;

  #state: PendingValueState<T> = {
    status: "loading",
    value: undefined,
    error: undefined,
  };

  #resolve: (value: T) => void = (value) => {
    if (this.#state.status === "loading") {
      this.#state = { status: "resolved", value, error: undefined };
      this.#onResolve();
    }
  };

  #reject: (error: Error) => void = (error) => {
    if (this.#state.status === "loading") {
      this.#state = { status: "error", value: undefined, error };
    }
  };

  constructor(onResolve: () => void) {
    this.#onResolve = onResolve;

    const derefResolve = this.#resolve;
    const derefReject = this.#reject;

    this.#promise = new Promise((resolve, reject) => {
      /**
       * The PendingValue resolved itself before the callback was invoked.
       * So here we make sure to still resolve the promise.
       */
      if (this.#state.status === "resolved") {
        resolve(this.#state.value);
      } else if (this.#state.status === "error") {
        reject(this.#state.error);
      }

      /**
       * If it has not been resolved yet, then wrap the previous #resolve and #reject
       * to make sure that the promise still resolves itself when called.
       */
      this.#resolve = (value) => {
        derefResolve.call(this, value);
        resolve(value);
      };

      this.#reject = (error) => {
        derefReject.call(this, error);
        reject(error);
      };
    });
  }

  public get(): T {
    switch (this.#state.status) {
      case "loading":
        throw this.#promise;
      case "resolved":
        return this.#state.value;
      case "error":
        throw this.#state.error;
    }
  }

  public resolve(value: T): void {
    this.#resolve(value);
  }

  public reject(error: Error): void {
    this.#reject(error);
  }
}
