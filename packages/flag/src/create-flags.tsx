/// <reference types="react/next" />

import React from "react";
import { Flags, FlagScalar, GetValueFromKeyPath, GetValueFromKeyPathString, KeyPath, KeyPathString } from "./types";
import { Backend } from "./backends";

const MISSING_CONTEXT = Symbol();
const NOOP = () => null;

const isFlagScalar = (value: any): value is FlagScalar => {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
};

export const createFlags = <F extends Flags>() => {
  type B = Backend<F>;

  type ProviderProps = React.PropsWithChildren<{
    backend: B;
  }>;

  type KeyPathStringFlagProps<K extends KeyPathString<F>> = {
    keyPath: K;
    defaultValue: GetValueFromKeyPathString<F, K>;
    render(value: GetValueFromKeyPathString<F, K>): React.ReactNode;
    fallback?(): React.ReactNode;
  };

  type KeyPathFlagProps<KP extends KeyPath<F>> = {
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
  FlagBackendProvider.displayName = "FlagBackendProvider";

  const internalUseFlag = (keyPath: string | string[], defaultValue: any, displayCallee: () => string) => {
    const keyPath_ = (Array.isArray(keyPath) ? keyPath : keyPath.split(".")) as KeyPath<F>;

    if (defaultValue === undefined) {
      throw new Error(`Calling \`${displayCallee()}\` requires that you provide a default value that matches the type of the flag.`);
    }

    const expectedType = typeof defaultValue;

    const backend = React.useContext(Context);

    if (backend === MISSING_CONTEXT) {
      if (process.env.NODE_ENV !== "development") {
        return defaultValue;
      }

      throw new Error(`Calling \`${displayCallee()}\` requires that the application is wrapped in a \`<FlagBackendProvider />\``);
    }

    const ext = backend.toExternalStore(keyPath_, defaultValue);
    let result = React.useSyncExternalStore(ext.subscribe, ext.getSnapshot, ext.getServerSnapshot);

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

  function Flag<K extends KeyPathString<F>>(props: KeyPathStringFlagProps<K>): JSX.Element;
  function Flag<KP extends KeyPath<F>>(props: KeyPathFlagProps<KP>): JSX.Element;
  function Flag({ keyPath, defaultValue, render, fallback }: any): JSX.Element {
    fallback ??= NOOP;

    const flag = internalUseFlag(keyPath, defaultValue, calleeStr(keyPath, defaultValue, "component"));

    return flag === false ? fallback() : render(flag);
  }
  Flag.displayName = "Flag";

  function useFlag<K extends KeyPathString<F>>(keyPath: K, defaultValue: GetValueFromKeyPathString<F, K>): GetValueFromKeyPathString<F, K>;
  function useFlag<KP extends KeyPath<F>>(keyPath: KP, defaultValue: GetValueFromKeyPath<F, KP>): GetValueFromKeyPath<F, KP>;
  function useFlag(keyPath: any, defaultValue: any) {
    React.useDebugValue(keyPath);
    return internalUseFlag(keyPath, defaultValue, calleeStr(keyPath, defaultValue, "hook"));
  }

  return {
    FlagBackendProvider,
    Flag,
    useFlag,
  };
};
