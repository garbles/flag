import React from "react";
import { Backend, Flags, KeyPaths, GetValueFromKeyPath, ShallowKeys } from "./types";

const MISSING_CONTEXT = Symbol();
const NOOP = () => null;

const isScalar = (value: any): value is string | number | boolean => {
  const type = typeof value;
  return type === "string" || type === "number" || type === "boolean";
};

export const createFlags = <F extends Flags>() => {
  type B = Backend<Flags>;

  type ProviderProps = {
    backend: B;
  };

  type ShallowFlagProps<K extends ShallowKeys<F>> = {
    keyPath: K;
    render(value: F[K]): React.ReactNode;
    fallback?(): React.ReactNode;
  };

  type KeyPathFlagProps<KP extends KeyPaths<F>> = {
    keyPath: KP;
    render(value: GetValueFromKeyPath<F, KP>): React.ReactNode;
    fallback?(): React.ReactNode;
  };

  const Context = React.createContext<B | typeof MISSING_CONTEXT>(MISSING_CONTEXT);
  Context.displayName = "Flag";

  const FlagsProvider: React.FC<ProviderProps> = ({ backend, children }) => {
    return <Context.Provider value={backend}>{children}</Context.Provider>;
  };

  function Flag<K extends ShallowKeys<F>>(props: ShallowFlagProps<K>): JSX.Element;
  function Flag<KP extends KeyPaths<F>>(props: KeyPathFlagProps<KP>): JSX.Element;
  function Flag({ keyPath, render, fallback }: any): JSX.Element {
    fallback ??= NOOP;

    const flag = useFlag(keyPath);
    return flag ? render(flag) : fallback();
  }

  function useFlag<K extends ShallowKeys<F>>(keyPath: K, defaultValue?: F[K]): F[K];
  function useFlag<KP extends KeyPaths<F>>(keyPath: KP, defaultValue?: GetValueFromKeyPath<F, KP>): GetValueFromKeyPath<F, KP>;
  function useFlag(keyPath: string | string[], defaultValue: any) {
    const keyPath_ = (Array.isArray(keyPath) ? keyPath : [keyPath]) as KeyPaths<F>;

    const backend = React.useContext(Context);

    if (backend === MISSING_CONTEXT) {
      throw new Error("Calling `useFlag()`, or `<Flag />` requires that the application is wrapped in a `<FlagsProvider />`");
    }

    if (backend.has(keyPath_)) {
      const result = backend.get(keyPath_) as GetValueFromKeyPath<F, any>;

      if (!isScalar(result)) {
        throw new Error(`Flag "${keyPath_.join(".")}" is not a boolean, number or string`);
      }

      return result;
    } else {
      if (defaultValue === undefined) {
        throw new Error(
          `Flag "${keyPath_.join(".")}" is missing from backend "${backend.name}" and does not have an assigned default value`
        );
      }

      if (process.env.NODE_ENV !== "production") {
        console.warn(`Flag "${keyPath_.join(".")}" is missing from backend "${backend.name}"`);
      }

      return defaultValue;
    }
  }

  return {
    FlagsProvider,
    Flag,
    useFlag,
  };
};
