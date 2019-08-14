import React, { useContext, useMemo } from "react";
import invariant from "invariant";
import { deepComputed, Computable } from "deep-computed";
import { KeyPath, KeyPathValue } from "useful-types";
import { isObject, noDefaultsSymbol } from "./utils";

export type ProviderProps<T> = {
  flags: Computable<T>;
};

type RenderConsumer<T> = {
  name: KeyPath<T>;
  render(flags: T): React.ReactNode;
  fallbackRender?(flags: T): React.ReactNode;
};

type ChildConsumer<T> = {
  name: KeyPath<T>;
  children: any;
  fallbackRender?(flags: T): React.ReactNode;
};

type ComponentConsumer<T> = {
  name: KeyPath<T>;
  component: React.ComponentType<{ flags: T }>;
  fallbackComponent?: React.ComponentType<{ flags: T }>;
};

export type ConsumerProps<T> =
  | RenderConsumer<T>
  | ChildConsumer<T>
  | ComponentConsumer<T>;

export type CreateFlags<T> = {
  FlagsProvider: React.ComponentType<ProviderProps<T>>;
  Flag: React.ComponentType<ConsumerProps<T>>;
  useFlag<KP extends KeyPath<T>>(
    keyPath: KP,
    defaultValue?: KeyPathValue<T, KP>
  ): KeyPathValue<T, KP>;
  useFlags(): T;
};

export const NO_CONTEXT_OR_DEFAULTS_ERROR =
  "Calling `useFlags()`, `useFlag()`, or `<Flag />` requires either that the application " +
  "is wrapped in a `<FlagsProvider />` or default flags are passed to `createFlags`.";

export function createFlags<T>(defaultFlags?: T): CreateFlags<T> {
  const contextDefaultValue =
    defaultFlags !== undefined ? defaultFlags : noDefaultsSymbol;

  const Context = React.createContext(contextDefaultValue);

  Context.displayName = "Flag";

  const FlagsProvider: React.SFC<ProviderProps<T>> = ({ flags, children }) => {
    const value = useMemo(() => deepComputed(flags), [flags]);
    return <Context.Provider value={value}>{children}</Context.Provider>;
  };

  const useFlags = (): T => {
    const flags = useContext(Context);

    invariant(flags !== noDefaultsSymbol, NO_CONTEXT_OR_DEFAULTS_ERROR);

    return flags as T;
  };

  const useFlag = <KP extends KeyPath<T>>(
    keyPath: KP,
    defaultValue?: KeyPathValue<T, KP>
  ): KeyPathValue<T, KP> => {
    const flags = useContext(Context);
    /**
     * TypeScript will complain about returning if the value
     * is `KeyPathValue<T, KP>`, so just type it as `any`.
     */
    const value: any = defaultValue;

    if (flags === noDefaultsSymbol && value !== undefined) {
      return value;
    }

    invariant(flags !== noDefaultsSymbol, NO_CONTEXT_OR_DEFAULTS_ERROR);

    let result: any = flags;

    for (let next of keyPath as string[]) {
      /**
       * This trap is unreachable in TypeScript.
       */
      if (isObject(result) && !(next in result)) {
        return undefined as any;
      }

      result = result[next];
    }

    return result;
  };

  function Flag(props: ConsumerProps<T>) {
    const flags = useFlags();
    const flag = useFlag(props.name);
    const isEnabled = Boolean(flag);

    if (isEnabled && "children" in props) {
      return props.children;
    }

    if (isEnabled && "render" in props) {
      return props.render(flags);
    }

    if (isEnabled && "component" in props) {
      const Component = props.component;
      return <Component flags={flags} />;
    }

    if (!isEnabled && "fallbackRender" in props && props.fallbackRender) {
      return props.fallbackRender(flags);
    }

    if (!isEnabled && "fallbackComponent" in props && props.fallbackComponent) {
      const Component = props.fallbackComponent;
      return <Component flags={flags} />;
    }

    return null;
  }

  return {
    FlagsProvider,
    Flag,
    useFlag,
    useFlags
  };
}

export default createFlags;
