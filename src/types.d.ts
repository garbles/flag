type Scalar = string | number | boolean;

export type Flags = Record<string, Scalar | Flags>;

export type KeyPaths<T> = {
  [Key in keyof T & string]: T[Key] extends object ? [Key, ...KeyPaths<T[Key]>] : [Key];
}[keyof T & string];

export type ShallowKeys<T> = {
  [Key in keyof T & string]: T[Key] extends object ? never : Key;
}[keyof T & string];

export type GetValueFromKeyPath<T, KP extends KeyPaths<T>> = KP extends [infer K, ...infer Rest] ? GetValueFromKeyPath<T[K], Rest> : T;

export type Backend<F> = {
  name: string;
  has<KP extends KeyPaths<F>>(keyPath: KP): boolean;
  get<KP extends KeyPaths<F>>(keyPath: KP): KeyPathValue<F, KP>;
};
