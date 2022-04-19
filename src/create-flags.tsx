/// <reference types="react/next" />

import React from "react";
import { Flags, FlagScalar, GetValueFromKeyPath, KeyPaths, ShallowKeys } from "./types";
import { IAbstractBackend } from "./backends";

const MISSING_CONTEXT = Symbol();
const NOOP = () => null;

const isFlagScalar = (value: any): value is FlagScalar => {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
};

export const createFlags = <F extends Flags>() => {
  type B = IAbstractBackend<Flags>;

  type ProviderProps = React.PropsWithChildren<{
    backend: B;
  }>;

  type ShallowFlagProps<K extends ShallowKeys<F>> = {
    keyPath: K;
    defaultValue: F[K];
    render(value: F[K]): React.ReactNode;
    fallback?(): React.ReactNode;
  };

  type KeyPathFlagProps<KP extends KeyPaths<F>> = {
    keyPath: KP;
    defaultValue: GetValueFromKeyPath<F, KP>;
    render(value: GetValueFromKeyPath<F, KP>): React.ReactNode;
    fallback?(): React.ReactNode;
  };

  const calleeStr = (keyPath: string[], defaultValue: any, format: "hook" | "component") => () => {
    const keyPathStr = JSON.stringify(keyPath);
    const defaultValueStr = JSON.stringify(defaultValue);

    return format == "hook"
      ? `useFlag(${keyPathStr}, ${defaultValueStr})`
      : `<Flag keyPath=${keyPathStr} defaultValue=${defaultValueStr} ... />`;
  };

  const Context = React.createContext<B | typeof MISSING_CONTEXT>(MISSING_CONTEXT);
  Context.displayName = "Flag";

  const FlagBackendProvider: React.FC<ProviderProps> = ({ backend, children }) => {
    return <Context.Provider value={backend}>{children}</Context.Provider>;
  };

  const internalUseFlag = (keyPath: string | string[], defaultValue: any, displayCallee: () => string) => {
    const keyPath_ = (Array.isArray(keyPath) ? keyPath : [keyPath]) as KeyPaths<F>;

    if (defaultValue === undefined) {
      throw new Error(`Calling \`${displayCallee()}\` requires that you provide a default value that matches the type of the flag.`);
    }

    const expectedType = typeof defaultValue;

    const backend = React.useContext(Context);

    if (backend === MISSING_CONTEXT) {
      throw new Error(`Calling \`${displayCallee()}\` requires that the application is wrapped in a \`<FlagsProvider />\``);
    }

    const store = backend.toExternalStore(keyPath_, defaultValue);
    let result = React.useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

    if ((result === undefined || result === null) && process.env.NODE_ENV === "development") {
      console.warn(`\`${displayCallee()}\` does not return anything from backend "${backend.name}".`);
    }

    result ??= defaultValue;

    if (!isFlagScalar(result)) {
      throw new Error(
        `Calling \`${displayCallee()}\` requires that the result is a boolean, number or string. Instead returned ${JSON.stringify(
          result
        )}.`
      );
    }

    if (typeof result !== expectedType) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          `Expected result of \`${displayCallee()}\` to be a ${expectedType} (based on the default value of ${JSON.stringify(
            defaultValue
          )}). Instead returned ${JSON.stringify(result)}. Falling back to default value.`
        );
      }

      return defaultValue;
    }

    return result;
  };

  function Flag<K extends ShallowKeys<F>>(props: ShallowFlagProps<K>): JSX.Element;
  function Flag<KP extends KeyPaths<F>>(props: KeyPathFlagProps<KP>): JSX.Element;
  function Flag({ keyPath, defaultValue, render, fallback }: any): JSX.Element {
    fallback ??= NOOP;

    const flag = internalUseFlag(keyPath, defaultValue, calleeStr(keyPath, defaultValue, "component"));

    return flag === false ? fallback() : render(flag);
  }

  function useFlag<K extends ShallowKeys<F>>(keyPath: K, defaultValue: F[K]): F[K];
  function useFlag<KP extends KeyPaths<F>>(keyPath: KP, defaultValue: GetValueFromKeyPath<F, KP>): GetValueFromKeyPath<F, KP>;
  function useFlag(keyPath: any, defaultValue: any) {
    return internalUseFlag(keyPath, defaultValue, calleeStr(keyPath, defaultValue, "hook"));
  }

  return {
    FlagBackendProvider,
    Flag,
    useFlag,
  };
};
