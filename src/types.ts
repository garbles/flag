export type Value = string | number | boolean | Flags | ((flags: ResolvedFlags) => Value);

export interface Flags {
  [key: string]: Value;
}

export type ResolvedValue = string | number | boolean | ResolvedFlags;

export interface ResolvedFlags {
  [key: string]: ResolvedValue;
}

export type FlagChildProps<P, F = { [key: string]: any }> = P & {
  flags: F;
};

export type Renderer = (props: FlagChildProps<any>) => React.ReactNode;
