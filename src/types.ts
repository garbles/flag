export type Value = string | number | boolean | IFlags | ((flags: IResolvedFlags) => Value);

export interface IFlags {
  [key: string]: Value;
}

export type ResolvedValue = string | number | boolean | IResolvedFlags;

export interface IResolvedFlags {
  [key: string]: ResolvedValue;
}
