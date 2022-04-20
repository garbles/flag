import type { AsyncMutableRefObject } from "async-ref";
import type { KeyPath, KeyPathString, GetValueFromKeyPath, ExternalStore, GetValueFromKeyPathString } from "./types";
import type { Backend } from "./backends";

type KeyPath_<T> = KeyPath<T>;
type KeyPathString_<T> = KeyPathString<T>;
type GetValueFromKeyPath_<T, KP extends KeyPath<T>> = GetValueFromKeyPath<T, KP>;
type GetValueFromKeyPathString_<T, KP extends KeyPathString<T>> = GetValueFromKeyPathString<T, KP>;
type ExternalStore_<T> = ExternalStore<T>;
type Backend_<T> = Backend<T>;
type AsyncMutableRefObject_<T> = AsyncMutableRefObject<T>;

export module Types {
  export type KeyPath<T> = KeyPath_<T>;
  export type KeyPathString<T> = KeyPathString_<T>;
  export type GetValueFromKeyPath<T, KP extends KeyPath<T>> = GetValueFromKeyPath_<T, KP>;
  export type GetValueFromKeyPathString<T, KP extends KeyPathString<T>> = GetValueFromKeyPathString_<T, KP>;
  export type ExternalStore<T> = ExternalStore_<T>;
  export type Backend<T> = Backend_<T>;
  export type AsyncMutableRefObject<T> = AsyncMutableRefObject_<T>;
}

export { createFlags } from "./create-flags";
export { AlwaysBackend, AbstractBackend, ComputedBackend, NullBackend, StaticBackend } from "./backends";
