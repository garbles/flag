import { StaticBackend } from "./static-backend";

type RecursiveComputable<T, Root> = {
  [K in keyof T]: T[K] extends object ? RecursiveComputable<T[K], Root> : T[K] | ((arg: Root) => T[K]);
};

type Computable<T> = RecursiveComputable<T, T>;

const makeComputable = <T, Root>(data: Computable<T>, getRoot: () => Root): T => {
  if (typeof data !== "object") {
    return data;
  }

  return new Proxy(data, {
    get: (target: Computable<T>, key_: string) => {
      const key = key_ as keyof Computable<T>;
      const next = target[key];

      if (typeof next === "function") {
        const root = getRoot();
        return makeComputable(next(root), getRoot);
      }

      return makeComputable(next, getRoot);
    },
  }) as T;
};

export class ComputedBackend<F> extends StaticBackend<F> {
  constructor(data: Computable<F>) {
    const computable: F = makeComputable(data, () => computable);
    super(computable);
  }
}
