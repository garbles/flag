type FlagScalar = string | number | boolean;

export type Flags = Record<string, FlagScalar | Flags>;

export type KeyPaths<T> = {
  [Key in keyof T & string]: T[Key] extends object ? [Key, ...KeyPaths<T[Key]>] : [Key];
}[keyof T & string];

export type ShallowKeys<T> = {
  [Key in keyof T & string]: T[Key] extends object ? never : Key;
}[keyof T & string];

export type Subscriber = () => void;
export type Unsubscribe = () => void;
export type Notifier = () => void;

export type ExternalStore<T> = {
  getSnapshot(): T;
  subscribe(sub: Subscriber): Unsubscribe;
};

export type GetValueFromKeyPath<T, KP extends KeyPaths<T>> = KP extends [infer K, ...infer Rest]
  ? GetValueFromKeyPath<T[K], Rest>
  : T extends FlagScalar
  ? T
  : never;
