import type { KeyPaths, GetValueFromKeyPath, ExternalStore } from "./types";

type KeyPaths_<T> = KeyPaths<T>;
type GetValueFromKeyPath_<T, KP extends KeyPaths<T>> = GetValueFromKeyPath<T, KP>;
type ExternalStore_<T> = ExternalStore<T>;

export module Types {
  export type KeyPaths<T> = KeyPaths_<T>;
  export type GetValueFromKeyPath<T, KP extends KeyPaths<T>> = GetValueFromKeyPath_<T, KP>;
  export type ExternalStore<T> = ExternalStore_<T>;
}

export { createFlags } from "./create-flags";
export * from "./backends";
