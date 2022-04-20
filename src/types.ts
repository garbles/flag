export type Join<KP extends any[]> = KP extends [infer A]
  ? A extends string
    ? A
    : never
  : KP extends [infer A, ...infer B]
  ? A extends string
    ? `${A}.${Join<B>}`
    : never
  : never;

export type Split<KP extends string> = KP extends `${infer A}.${infer B}` ? [A, ...Split<B>] : [KP];

export type FlagScalar = string | number | boolean;

export type Flags = { [key: string]: FlagScalar | Flags };

export type KeyPath<T> = {
  [Key in keyof T & string]: T[Key] extends object ? [Key, ...KeyPath<T[Key]>] : [Key];
}[keyof T & string];

export type KeyPathString<T> = Join<KeyPath<T>>;

export type Subscriber = () => void;
export type Unsubscribe = () => void;
export type Notifier = () => void;

export type ExternalStore<T> = {
  getSnapshot(): T;
  getServerSnapshot(): T;
  subscribe(sub: Subscriber): Unsubscribe;
};

export type GetValueFromKeyPath<T, KP extends KeyPath<T>> = KP extends [infer K, ...infer Rest]
  ? /**
     * `GetValueFromKeyPath<T[K], Rest>` produces errors because we haven't proven that `K` is a key of `T`
     * or that `Rest` is a `KeyPaths<T[K]>`. As we just derived the key path from `T`, I'm pretty sure
     * we can safely assume that these constraints are met.
     */
    // @ts-ignore
    GetValueFromKeyPath<T[K], Rest>
  : T extends FlagScalar
  ? T
  : never;

export type GetValueFromKeyPathString<T, KP extends Join<KeyPath<T>>> = Split<KP> extends KeyPath<T>
  ? GetValueFromKeyPath<T, Split<KP>>
  : never;
