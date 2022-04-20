import type { AsyncMutableRefObject } from "async-ref";
import type { KeyPaths, GetValueFromKeyPath, ExternalStore } from "./types";
import type { IBackend } from "./backends";

type KeyPaths_<T> = KeyPaths<T>;
type GetValueFromKeyPath_<T, KP extends KeyPaths<T>> = GetValueFromKeyPath<T, KP>;
type ExternalStore_<T> = ExternalStore<T>;
type Backend_<T> = IBackend<T>;
type AsyncMutableRefObject_<T> = AsyncMutableRefObject<T>;

export module Types {
  export type KeyPaths<T> = KeyPaths_<T>;
  export type GetValueFromKeyPath<T, KP extends KeyPaths<T>> = GetValueFromKeyPath_<T, KP>;
  export type ExternalStore<T> = ExternalStore_<T>;
  export type Backend<T> = Backend_<T>;
  export type AsyncMutableRefObject<T> = AsyncMutableRefObject_<T>;
}

export { createFlags } from "./create-flags";
export { AbstractBackend, ComputedBackend, NullBackend, StaticBackend } from "./backends";

throw "GABE: AlwaysBackend and something when node env is test";
