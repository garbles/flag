type Notify = () => void;

enum Status {
  Loading,
  Success,
  Error,
}

type RefState<T> =
  | { status: Status.Loading; value: null; error: null }
  | { status: Status.Success; value: T; error: null }
  | { status: Status.Error; value: null; error: Error };

export type IAsyncMutableRefObject<T> = {
  current: T;
  resolve(value: T): void;
  reject(error: Error): void;
};

class AsyncMutableRefObject<T> implements IAsyncMutableRefObject<T>, PromiseLike<T> {
  #promise: Promise<T>;
  #notify: Notify;
  #frozen = false;
  #state: RefState<T> = {
    status: Status.Loading,
    value: null,
    error: null,
  };

  #resolve = (value: T): void => {
    this.#state = { status: Status.Success, value, error: null };
    this.#notify();
  };

  #reject = (error: Error): void => {
    this.#state = { status: Status.Error, value: null, error };
    this.#notify();
  };

  constructor(notify: Notify = () => {}) {
    this.#notify = notify;

    this.#promise = new Promise((resolve, reject) => {
      /**
       * The AsyncMutableRefObject resolved itself before the callback was invoked.
       * So here we make sure to still resolve the promise.
       */
      if (this.#state.status === Status.Success) {
        resolve(this.#state.value);
        return;
      } else if (this.#state.status === Status.Error) {
        reject(this.#state.error);
        return;
      }

      const derefResolve = this.#resolve;
      const derefReject = this.#reject;

      /**
       * If it has not been resolved yet, then wrap the previous #resolve and #reject
       * to make sure that the promise still resolves itself when called.
       */
      this.#resolve = (value) => {
        derefResolve(value);
        resolve(value);
      };

      this.#reject = (error) => {
        derefReject(error);
        reject(error);
      };
    });
  }

  public get current(): T {
    switch (this.#state.status) {
      case Status.Loading:
        throw this.#promise;
      case Status.Success:
        return this.#state.value;
      case Status.Error:
        throw this.#state.error;
    }
  }

  public set current(value: T) {
    this.#resolve(value);
  }

  public then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ): Promise<TResult1 | TResult2> {
    return this.#promise
      .then(
        () => this.current,
        () => this.current
      )
      .then(onfulfilled, onrejected);
  }

  public resolve(value: T): AsyncMutableRefObject<T> {
    this.#resolve(value);

    return this;
  }

  public reject(error: Error): AsyncMutableRefObject<T> {
    this.#reject(error);

    return this;
  }

  public freeze(): AsyncMutableRefObject<T> {
    this.#frozen = true;
    this.#resolve = () => {};
    this.#reject = () => {};

    return this;
  }

  public isFrozen(): boolean {
    return this.#frozen;
  }
}

export const createAsyncRef = <T>(notify: Notify = () => {}): AsyncMutableRefObject<T> => {
  return new AsyncMutableRefObject(notify);
};
