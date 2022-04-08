type PendingValueState<T> =
  | { status: "loading"; value: undefined; error: undefined }
  | { status: "resolved"; value: T; error: undefined }
  | { status: "error"; value: undefined; error: Error };

export class PendingValue<T> {
  #promise: Promise<T>;

  #state: PendingValueState<T> = {
    status: "loading",
    value: undefined,
    error: undefined,
  };

  #resolve: (value: T) => void = (value) => {
    this.#state = { status: "resolved", value, error: undefined };
  };

  #reject: (error: Error) => void = (error) => {
    this.#state = { status: "error", value: undefined, error };
  };

  constructor() {
    const selfResolve = this.#resolve;
    const selfReject = this.#reject;

    this.#promise = new Promise((resolve, reject) => {
      if (this.#state.status !== "loading") {
        return;
      }

      this.#resolve = (value) => {
        selfResolve(value);
        resolve(value);
      };

      this.#reject = (error) => {
        selfReject(error);
        reject(error);
      };
    });
  }

  get(): T {
    switch (this.#state.status) {
      case "loading":
        throw this.#promise;
      case "resolved":
        return this.#state.value;
      case "error":
        throw this.#state.error;
    }
  }

  resolve(value: T) {
    this.#resolve(value);
  }

  reject(error: Error) {
    this.#reject(error);
  }
}
