export type Value = string | number | boolean | Flags | ((flags: Value) => Value);

export interface Flags {
  [key: string]: Value;
};

export type ResolvedValue = string | number | boolean | ResolvedFlags;

export interface ResolvedFlags {
  [key: string]: ResolvedValue;
}